import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'

const HEIGHT = 1.3 // pet height in world units (zoom 45 → ~58px)
const GRAVITY = 25
const JUMP_V = Math.sqrt(2 * GRAVITY * 1.6) // ~1.6 units high
const TURN = Math.PI / 2 - 0.35 // side-on, angled a little toward the viewer

// start: fraction of the half-width; each pet has its own pace so they cross paths
const PETS = [
  { name: 'dog', start: -0.6, dir: 1, speed: 1.6 },
  { name: 'cat', start: 0.2, dir: -1, speed: 1.2 },
  { name: 'bunny', start: 0.7, dir: 1, speed: 2.1 },
  { name: 'penguin', start: -0.1, dir: -1, speed: 0.9 },
]

function Pet({ name, start, dir, speed, still }) {
  const { scene, animations } = useGLTF(`/models/GLB%20format/animal-${name}.glb`)
  const { viewport } = useThree()
  const group = useRef()
  const sim = useRef({ x: (start * viewport.width) / 2, dir, y: 0, vy: 0 })

  // normalise to HEIGHT and stand it on y=0
  const { model, scale, lift } = useMemo(() => {
    const m = cloneSkinned(scene)
    const box = new THREE.Box3().setFromObject(m)
    const k = HEIGHT / (box.max.y - box.min.y)
    return { model: m, scale: k, lift: -box.min.y * k }
  }, [scene])
  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model])
  useEffect(() => {
    const clip = THREE.AnimationClip.findByName(animations, still ? 'idle' : 'walk')
    if (clip) mixer.clipAction(clip).play()
    return () => mixer.stopAllAction()
  }, [mixer, animations, still])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const s = sim.current
    mixer.update(dt)

    // pace back and forth, turning around at the strip's edges
    const limit = viewport.width / 2 - HEIGHT
    if (!still) s.x += s.dir * speed * dt
    if (Math.abs(s.x) > limit) {
      s.x = Math.sign(s.x) * limit
      s.dir = -Math.sign(s.x)
    }

    // jump arc
    if (s.y > 0 || s.vy > 0) {
      s.vy -= GRAVITY * dt
      s.y = Math.max(0, s.y + s.vy * dt)
      if (s.y === 0) s.vy = 0
    }

    const g = group.current
    g.position.set(s.x, -viewport.height / 2 + 0.15 + s.y, 0)
    g.rotation.y += (s.dir * TURN - g.rotation.y) * Math.min(1, dt * 8)
  })

  const jump = (e) => {
    e.stopPropagation()
    if (sim.current.y === 0) sim.current.vy = JUMP_V
  }

  return (
    <group ref={group}>
      <primitive object={model} scale={scale} position-y={lift} />
      {/* invisible, roomier click target than the thin skinned mesh */}
      <mesh visible={false} position-y={HEIGHT / 2} onClick={jump}>
        <boxGeometry args={[HEIGHT * 1.2, HEIGHT * 1.1, HEIGHT * 1.2]} />
      </mesh>
    </group>
  )
}

/** A few little animals pacing along the bottom of the viewport; click one to make it jump. */
export default function HeroPet() {
  // unmount while Drive Mode owns the GPU (see HeroScene), so only one WebGL context lives
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    const on = () => setPaused(true)
    const off = () => setPaused(false)
    window.addEventListener('drivemode:on', on)
    window.addEventListener('drivemode:off', off)
    return () => {
      window.removeEventListener('drivemode:on', on)
      window.removeEventListener('drivemode:off', off)
    }
  }, [])
  const still = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  if (paused) return null
  return (
    // fixed to the viewport; pointer-events off so the page below stays clickable, while
    // eventSource on body still lets R3F raycast clicks onto the pets
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[8000] h-40" aria-hidden="true">
      <Canvas
        eventSource={document.body}
        // eventPrefix="client" assumes a full-viewport canvas; this strip sits at the bottom, so offset by its rect
        onCreated={({ setEvents }) =>
          setEvents({
            compute: (e, s) => {
              s.pointer.set(((e.clientX - s.size.left) / s.size.width) * 2 - 1, -((e.clientY - s.size.top) / s.size.height) * 2 + 1)
              s.raycaster.setFromCamera(s.pointer, s.camera)
            },
          })
        }
        orthographic
        camera={{ position: [0, 0, 10], zoom: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 5, 6]} intensity={1.6} />
        <Suspense fallback={null}>
          {PETS.map((p) => (
            <Pet key={p.name} {...p} still={still} />
          ))}
        </Suspense>
      </Canvas>
    </div>
  )
}
