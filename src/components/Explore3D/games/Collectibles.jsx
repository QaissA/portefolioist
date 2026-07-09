import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { scatter } from './util'

const TOTAL = 15
const PICKUP_R = 3 // how close the car must pass
const COLORS = ['#22d3ee', '#a855f7', '#f43f5e', '#10b981', '#f59e0b']

/**
 * Collectible hunt: bobbing gems scattered across the map. Drive near one to
 * grab it; collect them all to finish. Positions are deterministic per run.
 */
export default function Collectibles({ posRef, gameRef }) {
  const meshRefs = useRef([])
  // one-time scatter → stable token layout
  const tokens = useRef(
    scatter(913377, TOTAL).map((p, i) => ({
      x: p.x,
      z: p.z,
      color: COLORS[i % COLORS.length],
      collected: false,
      pop: 0, // 0 = whole, ramps to 1 while shrinking away
    })),
  )
  const count = useRef(0)

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const p = posRef.current
    const list = tokens.current
    const t = frame.clock.elapsedTime

    for (let i = 0; i < list.length; i++) {
      const tok = list[i]
      const mesh = meshRefs.current[i]
      if (!mesh) continue

      if (tok.collected && tok.pop >= 1) {
        mesh.visible = false
        continue
      }

      // pickup test
      if (!tok.collected && p) {
        const dx = tok.x - p.x
        const dz = tok.z - p.z
        if (dx * dx + dz * dz < PICKUP_R * PICKUP_R) {
          tok.collected = true
          count.current += 1
          gameRef.current.flash = '+1'
        }
      }

      mesh.visible = true
      mesh.position.set(tok.x, 1.6 + Math.sin(t * 2 + i) * 0.35, tok.z)
      mesh.rotation.y = t * 1.6 + i
      if (tok.collected) {
        tok.pop = Math.min(1, tok.pop + dt * 4)
        const s = (1 - tok.pop) * 0.9
        mesh.scale.setScalar(s)
        mesh.position.y += tok.pop * 2 // float up as it vanishes
      } else {
        mesh.scale.setScalar(0.9)
      }
    }

    const done = count.current >= TOTAL
    gameRef.current.primary = done ? 'Complete! 🎉' : `${count.current} / ${TOTAL}`
    gameRef.current.secondary = done ? 'All tokens collected' : 'Grab every gem'
    gameRef.current.done = done
  })

  return (
    <group>
      {Array.from({ length: TOTAL }).map((_, i) => {
        const color = COLORS[i % COLORS.length]
        return (
          <mesh key={i} ref={(el) => (meshRefs.current[i] = el)}>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} flatShading />
          </mesh>
        )
      })}
    </group>
  )
}
