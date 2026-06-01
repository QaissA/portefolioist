import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Thin-film soap-bubble shader ─────────────────────────────────────────
//  A lightweight ShaderMaterial (no envMap / PMREM / transmission). It models
//  thin-film interference the correct way: an iridescent spectral colour
//  driven by view angle + film thickness, a fresnel-bright rim, a transparent
//  centre, and a small specular glint.
const vertexShader = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uThickness; // base film thickness in nm
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  const vec3 KEY_DIR = vec3(0.55, 0.55, 0.62);   // warm key light direction
  const vec3 FILL_DIR = vec3(-0.70, -0.25, 0.45); // purple fill, opposite side

  // physically-based thin-film interference: optical path difference per
  // RGB wavelength → muted, realistic iridescence (not a neon rainbow)
  vec3 thinFilm(float thicknessNm, float cosTheta) {
    float n = 1.33;                              // soap film IOR
    float sinT2 = (1.0 - cosTheta * cosTheta) / (n * n);
    float cosT = sqrt(max(0.0, 1.0 - sinT2));
    float opd = 2.0 * n * thicknessNm * cosT;    // optical path difference (nm)
    vec3 lambda = vec3(680.0, 550.0, 440.0);     // R, G, B wavelengths
    vec3 phase = 6.28318 * opd / lambda;
    return 0.5 + 0.5 * cos(phase);
  }

  // cheap analytic studio environment for realistic reflections (no PMREM)
  vec3 envColor(vec3 R) {
    float up = R.y * 0.5 + 0.5;
    vec3 col = mix(vec3(0.015, 0.015, 0.03), vec3(0.10, 0.10, 0.14), up); // studio gradient
    float key = pow(max(dot(R, normalize(KEY_DIR)), 0.0), 5.0);
    col += vec3(1.0, 0.85, 0.6) * key * 1.3;     // warm key reflection
    float fill = pow(max(dot(R, normalize(FILL_DIR)), 0.0), 3.0);
    col += vec3(0.55, 0.35, 0.95) * fill * 0.5;  // purple fill reflection
    return col;
  }

  void main() {
    vec3 N = normalize(vWorldNormal);
    if (!gl_FrontFacing) N = -N;                 // far wall of the bubble
    vec3 V = normalize(cameraPosition - vWorldPos);
    float ndv = clamp(dot(N, V), 0.0, 1.0);

    // Schlick fresnel with a low F0 → transparent center, reflective rim
    float fres = 0.02 + 0.98 * pow(1.0 - ndv, 3.0);

    // film thickness varies over the surface: thinner toward the top
    // (gravity drains the film) plus a slow flowing shimmer
    float th = uThickness;
    th += vWorldPos.y * 14.0;
    th += sin(vWorldPos.x * 3.0 + uTime * 0.3) *
          sin(vWorldPos.y * 3.0 - uTime * 0.22) * 30.0;
    vec3 film = thinFilm(th, ndv);
    film = mix(vec3(dot(film, vec3(0.333))), film, 0.65); // desaturate a touch

    // environment reflection (gated by fresnel = physically correct)
    vec3 R = reflect(-V, N);
    vec3 env = envColor(R);

    // tight specular glint from the key light
    vec3 H = normalize(normalize(KEY_DIR) + V);
    float spec = pow(max(dot(N, H), 0.0), 220.0);

    vec3 color = env * fres + film * (0.18 + 0.6 * fres) + spec * 2.5;
    float alpha = clamp(fres + spec * 0.5 + 0.03, 0.03, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`

function makeMaterial(thickness) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uThickness: { value: thickness },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
}

// ─── A field of soap bubbles with a hand-rolled physics sim ────────────────
//  Floating drift, air-drag, soft sphere-sphere collisions, wall bounce,
//  cursor repulsion, and pop-on-click — all synchronous in the render loop
//  (no physics engine, so nothing suspends and the canvas never tears down).
function Bubbles({ count = 11, onPop }) {
  const { viewport, camera, raycaster } = useThree()
  const onPopRef = useRef(onPop)
  useEffect(() => {
    onPopRef.current = onPop
  }, [onPop])

  const meshRefs = useRef([])
  const pointerNDC = useRef(new THREE.Vector2(2, 2)) // offscreen until first move
  const pointerWorld = useRef(new THREE.Vector3())

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 32, 32), [])

  // simulation state lives in a ref so it survives re-renders
  const sim = useRef(
    Array.from({ length: count }, () => ({
      radius: 0.35 + Math.random() * 0.6,
      x: 0,
      y: 0,
      z: (Math.random() - 0.5) * 3,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      vz: (Math.random() - 0.5) * 0.4,
      phase: Math.random() * Math.PI * 2,
      life: 1, // 1 = whole; ramps 1→0 on pop, then respawns
      material: makeMaterial(280 + Math.random() * 260), // film thickness in nm
      placed: false,
    })),
  )

  // place bubbles inside the viewport once it's known
  const placeInside = (b) => {
    b.x = (Math.random() - 0.5) * (viewport.width - 2)
    b.y = (Math.random() - 0.5) * (viewport.height - 2)
    b.z = (Math.random() - 0.5) * 3
    b.vx = (Math.random() - 0.5) * 1.2
    b.vy = (Math.random() - 0.5) * 1.2
    b.life = 1
    b.placed = true
  }

  useEffect(() => {
    const geo = geometry
    const bubbles = sim.current
    return () => {
      geo.dispose()
      bubbles.forEach((b) => b.material.dispose())
    }
  }, [geometry])

  // ── Pointer + click at the window level so the hero UI stays clickable
  useEffect(() => {
    const onMove = (e) => {
      pointerNDC.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      )
    }
    const onDown = (e) => {
      if (e.target.closest && e.target.closest('a, button')) return // ignore real UI
      raycaster.setFromCamera(pointerNDC.current, camera)
      const hits = raycaster.intersectObjects(meshRefs.current.filter(Boolean), false)
      if (hits.length) {
        const i = hits[0].object.userData.index
        if (sim.current[i].life >= 1) {
          sim.current[i].life = 0.999 // trigger the pop
          onPopRef.current?.(i) // notify the bubble game (no-op when not playing)
        }
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [camera, raycaster])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30) // clamp so a big first frame can't explode the sim
    const t = state.clock.elapsedTime
    const bubbles = sim.current
    const halfW = viewport.width / 2
    const halfH = viewport.height / 2
    const zBound = 2.5

    pointerWorld.current.set(
      pointerNDC.current.x * halfW,
      pointerNDC.current.y * halfH,
      0,
    )
    const repelR = 2.6

    for (let i = 0; i < count; i++) {
      const b = bubbles[i]
      if (!b.placed) placeInside(b)
      b.material.uniforms.uTime.value = t

      // pop animation → respawn
      if (b.life < 1) {
        b.life -= dt * 3.5
        if (b.life <= 0) placeInside(b)
      }

      // gentle turbulence (organic air currents) + light drag
      b.vx += Math.sin(t * 0.6 + b.phase) * 0.25 * dt
      b.vy += Math.cos(t * 0.5 + b.phase) * 0.25 * dt
      const drag = 1 - 0.25 * dt
      b.vx *= drag
      b.vy *= drag
      b.vz *= drag

      // cursor repulsion
      const dx = b.x - pointerWorld.current.x
      const dy = b.y - pointerWorld.current.y
      const d2 = dx * dx + dy * dy
      if (d2 < repelR * repelR) {
        const d = Math.sqrt(d2) + 0.0001
        const f = (1 - d / repelR) * 9 * dt
        b.vx += (dx / d) * f
        b.vy += (dy / d) * f
      }

      // integrate
      b.x += b.vx * dt
      b.y += b.vy * dt
      b.z += b.vz * dt

      // bounce off the viewport walls
      const r = b.radius
      if (b.x > halfW - r) { b.x = halfW - r; b.vx = -Math.abs(b.vx) * 0.9 }
      if (b.x < -halfW + r) { b.x = -halfW + r; b.vx = Math.abs(b.vx) * 0.9 }
      if (b.y > halfH - r) { b.y = halfH - r; b.vy = -Math.abs(b.vy) * 0.9 }
      if (b.y < -halfH + r) { b.y = -halfH + r; b.vy = Math.abs(b.vy) * 0.9 }
      if (b.z > zBound) { b.z = zBound; b.vz = -Math.abs(b.vz) * 0.9 }
      if (b.z < -zBound) { b.z = -zBound; b.vz = Math.abs(b.vz) * 0.9 }
    }

    // soft sphere-sphere collisions (equal-mass elastic, O(n²) — tiny n)
    for (let i = 0; i < count; i++) {
      const a = bubbles[i]
      for (let j = i + 1; j < count; j++) {
        const b = bubbles[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dz = b.z - a.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.0001
        const min = a.radius + b.radius
        if (dist < min) {
          const nx = dx / dist
          const ny = dy / dist
          const nz = dz / dist
          // separate
          const push = (min - dist) * 0.5
          a.x -= nx * push; a.y -= ny * push; a.z -= nz * push
          b.x += nx * push; b.y += ny * push; b.z += nz * push
          // exchange velocity along the collision normal
          const av = a.vx * nx + a.vy * ny + a.vz * nz
          const bv = b.vx * nx + b.vy * ny + b.vz * nz
          const diff = (bv - av) * 0.9
          a.vx += nx * diff; a.vy += ny * diff; a.vz += nz * diff
          b.vx -= nx * diff; b.vy -= ny * diff; b.vz -= nz * diff
        }
      }
    }

    // push the sim into the meshes
    for (let i = 0; i < count; i++) {
      const b = bubbles[i]
      const mesh = meshRefs.current[i]
      if (!mesh) continue
      mesh.position.set(b.x, b.y, b.z)
      mesh.scale.setScalar(Math.max(b.life, 0.0001) * b.radius)
    }
  })

  return (
    <>
      {sim.current.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el
            if (el) el.userData.index = i
          }}
          geometry={geometry}
          material={b.material}
        />
      ))}
    </>
  )
}

// ─── Canvas wrapper — transparent, no envMap (lightweight, crash-safe) ─────
export default function HeroScene({ onPop }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {/* soft purple ambiance on the side opposite the warm key light */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 70% at 18% 65%, rgba(139,92,246,0.16) 0%, transparent 70%)',
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          // allow the browser to auto-restore a lost context instead of going blank
          gl.domElement.addEventListener(
            'webglcontextlost',
            (e) => e.preventDefault(),
            false,
          )
        }}
      >
        <Bubbles count={11} onPop={onPop} />
      </Canvas>

      {/* faint grid overlay (kept for depth) */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(#F5F5F5 1px, transparent 1px), linear-gradient(90deg, #F5F5F5 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  )
}
