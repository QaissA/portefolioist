import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeyboard } from './useKeyboard'
import { STATIONS, ARRIVE_RADIUS, WORLD_BOUND } from './stations'

// Wheel placements. Front wheels steer; all four spin with speed.
const WHEELS = [
  { x: 0.95, z: 1.15, steer: true },
  { x: -0.95, z: 1.15, steer: true },
  { x: 0.95, z: -1.2, steer: false },
  { x: -0.95, z: -1.2, steer: false },
]

const WHEEL_R = 0.42
const _target = new THREE.Vector3()

/**
 * A minimal low-poly car with arcade physics.
 *  - W/S (or ↑/↓): accelerate / brake+reverse
 *  - A/D (or ←/→): steer (only while rolling; inverts in reverse, like a real car)
 * The camera chases from behind. Proximity to a station is reported via
 * onActiveChange(id|null); the live pose is written into posRef for the minimap.
 */
export default function Car({ bodyColor, onActiveChange, posRef }) {
  const group = useRef()
  const steerRefs = useRef([])
  const spinRefs = useRef([])
  const keys = useKeyboard()
  const { camera } = useThree()

  // mutable sim state (survives re-renders, drives no React updates).
  // vx/vz is the world-space velocity so the car can slide independently of
  // where it's pointing.
  const sim = useRef({ x: 0, z: 16, heading: Math.PI, vx: 0, vz: 0 })
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
    s.x = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, s.x))
    s.z = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, s.z))

    // apply to the car group: position, yaw, and roll into the turn/slide
    const g = group.current
    g.position.set(s.x, 0, s.z)
    g.rotation.y = s.heading
    g.rotation.z = -steer * grip * (drifting ? 0.16 : 0.06)
    g.position.y = 0.02 * Math.sin(now * 6) // faint idle bob

    // wheels: spin with forward speed, front pair angles with steering
    const spin = (vForward * dt) / WHEEL_R
    for (let i = 0; i < WHEELS.length; i++) {
      const sp = spinRefs.current[i]
      if (sp) sp.rotation.x += spin
      const st = steerRefs.current[i]
      if (st && WHEELS[i].steer) st.rotation.y = steer * (drifting ? 0.55 : 0.42)
    }

    // chase camera — smoothly trail behind and above, looking at the car
    _target.set(s.x - fx * 11, 6, s.z - fz * 11)
    if (!camReady.current) {
      camera.position.copy(_target)
      camReady.current = true
    } else {
      camera.position.lerp(_target, Math.min(1, dt * 3.5))
    }
    camera.lookAt(s.x, 1.4, s.z)

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
      {/* main body */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[1.9, 0.5, 3.6]} />
        <meshStandardMaterial color={bodyColor} metalness={0.45} roughness={0.35} />
      </mesh>
      {/* lower chassis */}
      <mesh castShadow position={[0, 0.34, 0]}>
        <boxGeometry args={[1.72, 0.32, 3.42]} />
        <meshStandardMaterial color="#0c0c0c" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* cabin */}
      <mesh castShadow position={[0, 1.02, -0.18]}>
        <boxGeometry args={[1.48, 0.52, 1.7]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.18} />
      </mesh>
      {/* windshield strip */}
      <mesh position={[0, 1.02, 0.72]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[1.4, 0.5, 0.06]} />
        <meshStandardMaterial color="#1a2733" metalness={0.4} roughness={0.1} />
      </mesh>
      {/* headlights */}
      {[0.62, -0.62].map((x) => (
        <mesh key={x} position={[x, 0.6, 1.82]}>
          <boxGeometry args={[0.34, 0.16, 0.06]} />
          <meshStandardMaterial color="#fff8e1" emissive="#fff2c0" emissiveIntensity={2.2} />
        </mesh>
      ))}
      {/* taillights */}
      {[0.62, -0.62].map((x) => (
        <mesh key={x} position={[x, 0.6, -1.82]}>
          <boxGeometry args={[0.3, 0.14, 0.05]} />
          <meshStandardMaterial color="#ff3344" emissive="#ff2233" emissiveIntensity={1.6} />
        </mesh>
      ))}
      {/* wheels */}
      {WHEELS.map((w, i) => (
        <group key={i} position={[w.x, 0.42, w.z]} ref={(el) => (steerRefs.current[i] = el)}>
          <group ref={(el) => (spinRefs.current[i] = el)}>
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.34, 22]} />
              <meshStandardMaterial color="#111111" roughness={0.85} />
            </mesh>
            {/* accent hub cap */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.36, 12]} />
              <meshStandardMaterial color={bodyColor} metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}
