import { STATIONS, WORLD_BOUND } from './stations'

// Deterministic scatter so the scenery is identical on every load (no runtime
// Math.random popping around between renders).
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FOLIAGE = ['#2f6d34', '#3a7d3f', '#46914a', '#356b39', '#5aa153']

// Reject positions too close to the spawn point or a station beacon.
function clearOf(x, z, spawnR, stationR) {
  if (x * x + z * z < spawnR * spawnR) return false
  for (const s of STATIONS) {
    const dx = s.position[0] - x
    const dz = s.position[2] - z
    if (dx * dx + dz * dz < stationR * stationR) return false
  }
  return true
}

function buildScatter() {
  const rng = mulberry32(20240711)
  const reach = WORLD_BOUND - 6

  const trees = []
  let guard = 0
  while (trees.length < 64 && guard < 4000) {
    guard++
    const x = (rng() * 2 - 1) * reach
    const z = (rng() * 2 - 1) * reach
    if (!clearOf(x, z, 16, 17)) continue
    trees.push({
      x,
      z,
      scale: 0.7 + rng() * 1.3,
      rot: rng() * Math.PI * 2,
      pine: rng() > 0.45,
      color: FOLIAGE[Math.floor(rng() * FOLIAGE.length)],
    })
  }

  const rocks = []
  guard = 0
  while (rocks.length < 16 && guard < 2000) {
    guard++
    const x = (rng() * 2 - 1) * reach
    const z = (rng() * 2 - 1) * reach
    if (!clearOf(x, z, 18, 17)) continue
    rocks.push({ x, z, scale: 0.5 + rng() * 1.5, rot: rng() * Math.PI * 2 })
  }

  // rolling hills on the far horizon (outside the drivable bound)
  const hills = []
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rng() * 0.4
    const r = WORLD_BOUND + 30 + rng() * 60
    hills.push({
      x: Math.cos(a) * r,
      z: Math.sin(a) * r,
      scale: 40 + rng() * 55,
      color: FOLIAGE[Math.floor(rng() * 3)],
    })
  }

  return { trees, rocks, hills }
}

const SCATTER = buildScatter()

function Tree({ x, z, scale, rot, pine, color }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]} scale={scale}>
      {/* trunk */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.16, 0.24, 1.2, 7]} />
        <meshStandardMaterial color="#5b4327" roughness={1} />
      </mesh>
      {pine ? (
        <>
          <mesh position={[0, 1.7, 0]}>
            <coneGeometry args={[0.95, 1.7, 8]} />
            <meshStandardMaterial color={color} roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0, 2.7, 0]}>
            <coneGeometry args={[0.68, 1.3, 8]} />
            <meshStandardMaterial color={color} roughness={0.9} flatShading />
          </mesh>
        </>
      ) : (
        <mesh position={[0, 2.0, 0]}>
          <icosahedronGeometry args={[1.15, 0]} />
          <meshStandardMaterial color={color} roughness={0.9} flatShading />
        </mesh>
      )}
    </group>
  )
}

/** Green outdoor scenery: trees, rocks, and distant hills. */
export default function Landscape() {
  return (
    <group>
      {SCATTER.trees.map((t, i) => (
        <Tree key={`t${i}`} {...t} />
      ))}

      {SCATTER.rocks.map((r, i) => (
        <mesh
          key={`r${i}`}
          position={[r.x, 0.2 * r.scale, r.z]}
          rotation={[r.rot, r.rot * 0.7, 0]}
          scale={r.scale}
        >
          <icosahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial color="#7f8288" roughness={1} flatShading />
        </mesh>
      ))}

      {SCATTER.hills.map((h, i) => (
        <mesh key={`h${i}`} position={[h.x, -h.scale * 0.34, h.z]}>
          <sphereGeometry args={[h.scale, 18, 12]} />
          <meshStandardMaterial color={h.color} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  )
}
