import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Float } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// ─── Orbiting light that moves around the orb ─────────────────────────────
function OrbLight() {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    ref.current.position.set(
      3.5 + Math.sin(t * 0.6) * 3.5,
      Math.cos(t * 0.4) * 2.5,
      2   + Math.cos(t * 0.5) * 2
    )
  })
  return <pointLight ref={ref} color="#F59E0B" intensity={6} distance={14} />
}

// ─── Central 3D orb — distorted metallic sphere + wireframe cage ──────────
function CoreOrb({ mouse }) {
  const groupRef = useRef()
  const rotY = useRef(0)
  const rotX = useRef(0)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // Auto slow spin + mouse nudge
    rotY.current += 0.003 + mouse.current.x * 0.001
    rotX.current += (Math.sin(t * 0.3) * 0.001 + mouse.current.y * 0.001 - rotX.current) * 0.05
    groupRef.current.rotation.y = rotY.current
    groupRef.current.rotation.x = rotX.current
  })

  return (
    // Float gives a gentle organic bob
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.4}>
      <group ref={groupRef} position={[3.2, 0, -1]}>

        {/* Outer low-poly wireframe cage */}
        <mesh>
          <icosahedronGeometry args={[2.0, 1]} />
          <meshBasicMaterial color="#F59E0B" wireframe transparent opacity={0.12} />
        </mesh>

        {/* Metallic distorted sphere — the main "wow" object */}
        <mesh>
          <sphereGeometry args={[1.55, 128, 128]} />
          <MeshDistortMaterial
            color="#1a0a00"
            emissive="#F59E0B"
            emissiveIntensity={0.35}
            distort={0.45}
            speed={1.8}
            metalness={1.0}
            roughness={0.08}
            envMapIntensity={0.6}
          />
        </mesh>

        {/* Hot bright core — feeds the bloom */}
        <mesh>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color="#FFF3C0" />
        </mesh>

        {/* Thin equatorial ring */}
        <mesh rotation={[Math.PI * 0.48, 0.3, 0]}>
          <torusGeometry args={[2.4, 0.006, 8, 200]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.6} />
        </mesh>

        {/* Second ring — tilted for depth */}
        <mesh rotation={[Math.PI * 0.3, 0.8, 0.4]}>
          <torusGeometry args={[2.9, 0.004, 8, 200]} />
          <meshBasicMaterial color="#8B5CF6" transparent opacity={0.35} />
        </mesh>

      </group>
    </Float>
  )
}

// ─── Sparse particle field — ambient depth only ───────────────────────────
function Particles() {
  const ref = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(3200 * 3)
    for (let i = 0; i < 3200; i++) {
      const r     = 4 + Math.random() * 9
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta) + 3.2
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi) - 1
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * 0.016
    ref.current.rotation.x = clock.elapsedTime * 0.008
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={3200}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#F59E0B"
        size={0.022}
        sizeAttenuation
        transparent
        opacity={0.35}
      />
    </points>
  )
}

// ─── Canvas wrapper ────────────────────────────────────────────────────────
export default function HeroScene() {
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x =  (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#0A0A0A', 16, 34]} />

        {/* Lights */}
        <ambientLight intensity={0.08} />
        <pointLight position={[-4, 4, 6]} color="#8B5CF6" intensity={1.5} distance={18} />
        <OrbLight />

        {/* Scene */}
        <CoreOrb mouse={mouse} />
        <Particles />

        {/* Post-processing */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.18}
            luminanceSmoothing={0.9}
            intensity={1.4}
            mipmapBlur
            radius={0.7}
          />
          <Vignette eskil={false} offset={0.15} darkness={0.65} />
        </EffectComposer>
      </Canvas>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(#F5F5F5 1px, transparent 1px), linear-gradient(90deg, #F5F5F5 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  )
}
