import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { STATIONS, WORLD_BOUND, VILLAGE_RADIUS, colliders } from './stations'

const ENV_DIR = '/models/enviroment/GLB%20format/'
const HOUSES_DIR = '/models/houses/GLB%20format/'
// [dir, model, min scale, scale range] — scales picked so each lands at a believable size
const TREES = [
  [ENV_DIR, 'pine', 1.4, 1.8],
  [ENV_DIR, 'pine', 1.4, 1.8],
  [ENV_DIR, 'pine-crooked', 1.4, 1.6],
  [HOUSES_DIR, 'tree-large', 4.5, 3],
  [HOUSES_DIR, 'tree-small', 4.5, 3],
]
const ROCKS = [
  [ENV_DIR, 'rocks', 1.5, 2.5],
  [ENV_DIR, 'rocks-tall', 1.5, 2],
]
const PROPS = [
  [ENV_DIR, 'hay-bale', 2.2, 0.8],
  [ENV_DIR, 'hay-bale-bundled', 2.2, 0.8],
  [ENV_DIR, 'pumpkin', 2.2, 1],
  [ENV_DIR, 'pumpkin-tall', 2.2, 1],
  [ENV_DIR, 'trunk', 2.2, 1],
  [ENV_DIR, 'trunk-long', 2.2, 1],
  [ENV_DIR, 'pine-fall', 1.5, 1],
  [ENV_DIR, 'pine-fall-crooked', 1.5, 1],
  [ENV_DIR, 'debris-wood', 2.5, 1],
  [ENV_DIR, 'bench', 2.2, 0.5],
  [ENV_DIR, 'lightpost-single', 2.8, 0.4],
  [ENV_DIR, 'fire-basket', 3, 1],
  [ENV_DIR, 'urn-round', 3, 1],
  [ENV_DIR, 'pillar-obelisk', 3, 1],
  [ENV_DIR, 'stone-wall-damaged', 2.5, 1],
  [ENV_DIR, 'fence-damaged', 2.5, 1],
  [HOUSES_DIR, 'planter', 4, 2],
]

// One Kenney environment GLB (shared geometry/materials, cloned per placement).
export function EnvModel({ name, dir = ENV_DIR, ...props }) {
  return (
    <Suspense fallback={null}>
      <EnvMesh name={name} dir={dir} {...props} />
    </Suspense>
  )
}
// `solid` (0..1) makes the car collide with it: a circle of solid × the half-footprint
// (low for trees so the trunk blocks, not the whole canopy).
function EnvMesh({ name, dir, solid, ...props }) {
  const { scene } = useGLTF(dir + name + '.glb')
  const model = useMemo(() => scene.clone(), [scene])
  const ref = useRef()
  useLayoutEffect(() => {
    if (!solid) return
    // measure the unplaced original so a yawed village doesn't inflate the box
    ref.current.updateWorldMatrix(true, false)
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const k = ref.current.getWorldScale(new THREE.Vector3())
    const c = ref.current.localToWorld(box.getCenter(new THREE.Vector3()))
    const col = { x: c.x, z: c.z, r: (Math.max(size.x * k.x, size.z * k.z) / 2) * solid }
    colliders.push(col)
    return () => colliders.splice(colliders.indexOf(col), 1)
  }, [solid, scene])
  return <primitive ref={ref} object={model} {...props} />
}

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

const FOLIAGE = ['#2f6d34', '#3a7d3f', '#46914a', '#356b39', '#5aa153'] // horizon hills

// Reject positions too close to the spawn point or a station beacon.
// Road network: a junction at the origin with one spoke out to each village's
// entry gate (villages face the origin, so the spoke meets their main road).
const ROAD_W = 6
const HUB = 11 // covers where the closest spokes (66° apart) overlap
const ROADS = STATIONS.map((st) => {
  const [sx, , sz] = st.position
  const dist = Math.hypot(sx, sz)
  const ux = sx / dist
  const uz = sz / dist
  const len = dist - VILLAGE_RADIUS // origin → fence line
  const n = Math.ceil(len / 5.5)
  const step = len / n
  return {
    ux,
    uz,
    len,
    rot: Math.atan2(ux, uz),
    tiles: Array.from({ length: n }, (_, i) => (i + 0.5) * step),
    scale: [ROAD_W / 0.36, 1, step / 0.4], // driveway-long is 0.36 x 0.4
  }
})

// distance from (x, z) to the nearest road centreline
function roadDist(x, z) {
  let best = Infinity
  for (const r of ROADS) {
    const t = Math.max(0, Math.min(r.len, x * r.ux + z * r.uz))
    best = Math.min(best, Math.hypot(x - r.ux * t, z - r.uz * t))
  }
  return best
}

function clearOf(x, z, spawnR, stationR) {
  if (x * x + z * z < spawnR * spawnR) return false
  if (roadDist(x, z) < ROAD_W / 2 + 2.5) return false
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

  const pick = (list) => {
    const [dir, name, min, range] = list[Math.floor(rng() * list.length)]
    return { dir, name, scale: min + rng() * range, rot: rng() * Math.PI * 2 }
  }
  const place = (out, count, list, spawnR) => {
    for (let guard = 0; out.length < count && guard < count * 60; guard++) {
      const x = (rng() * 2 - 1) * reach
      const z = (rng() * 2 - 1) * reach
      if (clearOf(x, z, spawnR, VILLAGE_RADIUS + 3)) out.push({ x, z, ...pick(list) })
    }
    return out
  }

  const trees = place([], 110, TREES, 16)
  // a few dense pine groves so the world has forests, not just even sprinkle
  for (let g = 0; g < 8; g++) {
    const cx = (rng() * 2 - 1) * (reach - 10)
    const cz = (rng() * 2 - 1) * (reach - 10)
    if (!clearOf(cx, cz, 30, VILLAGE_RADIUS + 12)) continue
    for (let k = 0; k < 9; k++) {
      const a = rng() * Math.PI * 2
      const r = 2 + rng() * 9
      const x = cx + Math.cos(a) * r
      const z = cz + Math.sin(a) * r
      if (clearOf(x, z, 30, VILLAGE_RADIUS + 3)) trees.push({ x, z, ...pick(TREES.slice(0, 3)) })
    }
  }
  const rocks = place([], 40, ROCKS, 18)
  const props = place([], 60, PROPS, 18)

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

  return { trees, rocks, props, hills }
}

const SCATTER = buildScatter()

/** Outdoor scenery: Kenney trees, pine groves, rocks and props, plus distant hills. */
export default function Landscape() {
  return (
    <group>
      {/* village link roads; spokes overlap near the origin, hidden under the hub tile */}
      {ROADS.map((r, i) =>
        r.tiles.map((t) => (
          <EnvModel
            key={`road${i}-${t}`}
            dir={HOUSES_DIR}
            name="driveway-long"
            position={[r.ux * t, 0.03, r.uz * t]}
            rotation-y={r.rot}
            scale={r.scale}
          />
        )),
      )}
      <EnvModel dir={HOUSES_DIR} name="driveway-long" position={[0, 0.036, 0]} scale={[HUB / 0.36, 1, HUB / 0.4]} />

      {[...SCATTER.trees, ...SCATTER.rocks, ...SCATTER.props].map((o, i) => (
        <EnvModel
          key={i}
          dir={o.dir}
          name={o.name}
          position={[o.x, 0, o.z]}
          rotation-y={o.rot}
          scale={o.scale}
          solid={i < SCATTER.trees.length ? 0.3 : 0.7}
        />
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
