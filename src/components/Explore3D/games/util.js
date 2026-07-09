import { STATIONS, WORLD_BOUND } from '../stations'

// Same tiny deterministic PRNG used by Landscape — stable scatter per seed.
export function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Scatter `count` points across the drivable world, clear of the spawn point
// and every village. Returns [{ x, z, r }] where r is a 0..1 variety value.
export function scatter(seed, count, { spawnClear = 16, stationClear = 18 } = {}) {
  const rng = mulberry32(seed)
  const reach = WORLD_BOUND - 8
  const pts = []
  let guard = 0
  while (pts.length < count && guard < 5000) {
    guard++
    const x = (rng() * 2 - 1) * reach
    const z = (rng() * 2 - 1) * reach
    if (x * x + z * z < spawnClear * spawnClear) continue
    let nearVillage = false
    for (const s of STATIONS) {
      const dx = s.position[0] - x
      const dz = s.position[2] - z
      if (dx * dx + dz * dz < stationClear * stationClear) {
        nearVillage = true
        break
      }
    }
    if (nearVillage) continue
    pts.push({ x, z, r: rng() })
  }
  return pts
}

// milliseconds → "m:ss.d"
export function fmtClock(ms) {
  const t = Math.max(0, ms)
  const m = Math.floor(t / 60000)
  const s = Math.floor((t % 60000) / 1000)
  const d = Math.floor((t % 1000) / 100)
  return `${m}:${String(s).padStart(2, '0')}.${d}`
}
