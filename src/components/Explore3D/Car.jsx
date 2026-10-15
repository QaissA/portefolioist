import { Suspense, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useKeyboard } from './useKeyboard'
import { STATIONS, ARRIVE_RADIUS, WORLD_BOUND, terrain, colliders, CARS_DIR, DEFAULT_CAR } from './stations'

const CAR_LENGTH = 3.6 // same footprint as the old box car, so camera and games still fit
// shortcut: the car collides as a circle, not its box, so corners can clip a little; upgrade to an OBB test if that shows
const CAR_RADIUS = 1.2
const BOUNCE = 0.3 // share of the impact speed returned off an obstacle

const _target = new THREE.Vector3()
const _ray = new THREE.Raycaster()
const _origin = new THREE.Vector3()
const _down = new THREE.Vector3(0, -1, 0)

// Scales the GLB to CAR_LENGTH along Z, centres it and sits it on y=0.
function CarModel({ car }) {
  const { scene } = useGLTF(CARS_DIR + car + '.glb')
  const model = useMemo(() => {
    const m = scene.clone()
    m.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = true
      // model ships as full metal + alpha BLEND: with no env map that renders dark and see-through
      o.material.metalness = 0.15
      o.material.transparent = false
      o.material.depthWrite = true
    })
    const box = new THREE.Box3().setFromObject(m)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const k = CAR_LENGTH / size.z
    m.scale.setScalar(k)
    m.position.set(-center.x * k, -box.min.y * k, -center.z * k)
    return m
  }, [scene])
  // Kenney models already point +Z, the direction the sim drives
  return <primitive object={model} />
}
useGLTF.preload(CARS_DIR + DEFAULT_CAR + '.glb')

/**
 * The player's car (GLB model) with arcade physics.
 *  - W/S (or ↑/↓): accelerate / brake+reverse
 *  - A/D (or ←/→): steer (only while rolling; inverts in reverse, like a real car)
 * The camera chases from behind. Proximity to a station is reported via
 * onActiveChange(id|null); the live pose is written into posRef for the minimap.
 */
export default function Car({ onActiveChange, posRef, car = DEFAULT_CAR }) {
  const group = useRef()
  const keys = useKeyboard()
  const { camera } = useThree()

  // mutable sim state (survives re-renders, drives no React updates).
  // vx/vz is the world-space velocity so the car can slide independently of
  // where it's pointing.
  const sim = useRef({ x: 0, z: 16, heading: Math.PI, vx: 0, vz: 0, y: 0 })
  const activeRef = useRef(undefined)
  const camReady = useRef(false)

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const now = frame.clock.elapsedTime
    const s = sim.current
    const k = keys.current

    const ACCEL = 28
    const MAX_FWD = 32
    const MAX_REV = 12

    // decompose the world velocity into the car's forward / right axes
    const fx = Math.sin(s.heading)
    const fz = Math.cos(s.heading)
    const rgtX = Math.cos(s.heading)
    const rgtZ = -Math.sin(s.heading)
    let vForward = s.vx * fx + s.vz * fz
    let vLateral = s.vx * rgtX + s.vz * rgtZ

    // throttle / brake / coast along the forward axis
    const throttle = (k.f ? 1 : 0) - (k.b ? 1 : 0)
    if (throttle > 0) vForward += ACCEL * dt
    else if (throttle < 0) vForward -= ACCEL * 0.85 * dt
    else {
      vForward -= vForward * Math.min(1, 1.8 * dt)
      if (Math.abs(vForward) < 0.04) vForward = 0
    }
    vForward = Math.max(-MAX_REV, Math.min(MAX_FWD, vForward))

    // Handbrake drift: Space cuts lateral grip so momentum carries the car
    // sideways. Needs real speed to engage. Full grip otherwise snaps the
    // velocity back onto the heading almost instantly (no slide).
    const drifting = k.space && Math.abs(vForward) > 4
    const traction = drifting ? 1.6 : 9
    vLateral *= Math.max(0, 1 - traction * dt)
    vLateral = Math.max(-20, Math.min(20, vLateral))
    if (drifting) vForward *= 1 - 0.35 * dt // scrub a little speed while sliding

    // rebuild the world velocity in this frame's basis; as the heading rotates
    // away from it, the leftover momentum becomes the slide
    s.vx = fx * vForward + rgtX * vLateral
    s.vz = fz * vForward + rgtZ * vLateral

    // steering: A left, D right — sharper while drifting, scaled by speed and
    // travel direction so reverse steers naturally
    const steer = (k.l ? 1 : 0) - (k.r ? 1 : 0)
    const grip = Math.min(1, Math.abs(vForward) / 6)
    const dir = vForward >= 0 ? 1 : -1
    s.heading += steer * (drifting ? 2.9 : 1.8) * dt * grip * dir

    // integrate world velocity
    s.x += s.vx * dt
    s.z += s.vz * dt
    // collisions: push out of any solid footprint and reflect the speed going into it
    for (const c of colliders) {
      const dx = s.x - c.x
      const dz = s.z - c.z
      const min = c.r + CAR_RADIUS
      const d2 = dx * dx + dz * dz
      if (d2 >= min * min || d2 === 0) continue
      const d = Math.sqrt(d2)
      const nx = dx / d
      const nz = dz / d
      s.x = c.x + nx * min
      s.z = c.z + nz * min
      const vn = s.vx * nx + s.vz * nz
      if (vn < 0) {
        s.vx -= (1 + BOUNCE) * vn * nx
        s.vz -= (1 + BOUNCE) * vn * nz
      }
    }
    s.x = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, s.x))
    s.z = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, s.z))

    // apply to the car group: position, yaw, and roll into the turn/slide
    const g = group.current
    // ride the landscape: ground height under the car, eased so bumps don't jitter
    _ray.set(_origin.set(s.x, 300, s.z), _down)
    const hit = terrain.length ? _ray.intersectObjects(terrain, false)[0] : null
    s.y += ((hit ? Math.max(0, hit.point.y) : 0) - s.y) * Math.min(1, dt * 12)
    g.position.set(s.x, s.y, s.z)
    g.rotation.y = s.heading
    g.rotation.z = -steer * grip * (drifting ? 0.16 : 0.06)
    g.position.y = s.y + 0.02 * Math.sin(now * 6) // faint idle bob

    // chase camera — smoothly trail behind and above, looking at the car
    _target.set(s.x - fx * 11, s.y + 6, s.z - fz * 11)
    if (!camReady.current) {
      camera.position.copy(_target)
      camReady.current = true
    } else {
      camera.position.lerp(_target, Math.min(1, dt * 3.5))
    }
    camera.lookAt(s.x, s.y + 1.4, s.z)

    // share pose (+ drift flag + forward speed) with the minimap, smoke
    // emitter, and the arcade games
    if (posRef) posRef.current = { x: s.x, z: s.z, heading: s.heading, drifting, speed: vForward }

    // proximity — nearest station within ARRIVE_RADIUS, reported only on change
    let nearest = null
    let best = ARRIVE_RADIUS * ARRIVE_RADIUS
    for (const station of STATIONS) {
      const dx = station.position[0] - s.x
      const dz = station.position[2] - s.z
      const d2 = dx * dx + dz * dz
      if (d2 < best) {
        best = d2
        nearest = station.id
      }
    }
    if (nearest !== activeRef.current) {
      activeRef.current = nearest
      onActiveChange(nearest)
    }
  })

  return (
    <group ref={group} position={[0, 0, 16]}>
      <Suspense fallback={null}>
        <CarModel car={car} />
      </Suspense>
    </group>
  )
}
