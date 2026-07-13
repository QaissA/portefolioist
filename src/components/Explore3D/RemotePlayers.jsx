import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

const POOL = 12 // max simultaneously-rendered remote cars

const WHEELS = [
  [0.85, 1.05],
  [-0.85, 1.05],
  [0.85, -1.05],
  [-0.85, -1.05],
]

// shortest-path angular interpolation (handles the ±π wrap)
function lerpAngle(a, b, t) {
  let d = b - a
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}

/**
 * Renders other players' cars from the live peer map (peersRef). Uses a fixed
 * pool of car slots reassigned each frame — no re-render on pose updates — and
 * smoothly interpolates each peer toward its last-received pose so the 15 Hz
 * network updates look continuous.
 */
export default function RemotePlayers({ peersRef }) {
  const groupRefs = useRef([])
  const bodyRefs = useRef([])
  const tagRefs = useRef([])
  const lastColor = useRef([])
  const lastName = useRef([])

  useFrame((_, delta) => {
    if (!peersRef || !peersRef.current) return
    const dt = Math.min(delta, 1 / 30)
    const t = Math.min(1, dt * 10)
    const peers = Array.from(peersRef.current.values())

    for (let i = 0; i < POOL; i++) {
      const g = groupRefs.current[i]
      if (!g) continue
      const p = peers[i]
      if (!p || !p.target) {
        g.visible = false
        const tag0 = tagRefs.current[i]
        if (tag0) tag0.style.display = 'none'
        continue
      }
      if (!p.cur) p.cur = { x: p.target.x, z: p.target.z, heading: p.target.heading }
      p.cur.x += (p.target.x - p.cur.x) * t
      p.cur.z += (p.target.z - p.cur.z) * t
      p.cur.heading = lerpAngle(p.cur.heading, p.target.heading ?? p.cur.heading, t)

      g.visible = true
      g.position.set(p.cur.x, 0, p.cur.z)
      g.rotation.y = p.cur.heading

      const mat = bodyRefs.current[i]
      if (mat && lastColor.current[i] !== p.color) {
        mat.color.set(p.color)
        lastColor.current[i] = p.color
      }
      const tag = tagRefs.current[i]
      if (tag) {
        tag.style.display = 'block'
        if (lastName.current[i] !== p.name) {
          tag.textContent = p.name || 'player'
          lastName.current[i] = p.name
        }
      }
    }
  })

  return (
    <group>
      {Array.from({ length: POOL }).map((_, i) => (
        <group key={i} ref={(el) => (groupRefs.current[i] = el)} visible={false}>
          {/* body */}
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[1.7, 0.45, 3.2]} />
            <meshStandardMaterial ref={(el) => (bodyRefs.current[i] = el)} color="#888888" metalness={0.4} roughness={0.4} />
          </mesh>
          {/* cabin */}
          <mesh position={[0, 0.92, -0.15]}>
            <boxGeometry args={[1.35, 0.45, 1.5]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* wheels */}
          {WHEELS.map(([x, z], w) => (
            <mesh key={w} position={[x, 0.4, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.4, 0.4, 0.3, 14]} />
              <meshStandardMaterial color="#111111" roughness={0.8} />
            </mesh>
          ))}
          {/* name tag */}
          <Html position={[0, 2.4, 0]} center distanceFactor={16} pointerEvents="none" zIndexRange={[80, 0]}>
            <div
              ref={(el) => (tagRefs.current[i] = el)}
              className="whitespace-nowrap rounded-full border border-border bg-surface/80 px-2 py-0.5 font-mono text-[10px] text-text-primary backdrop-blur"
            >
              player
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}
