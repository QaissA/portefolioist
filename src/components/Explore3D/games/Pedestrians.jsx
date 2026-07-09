import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { STATIONS, WORLD_BOUND } from '../stations'
import { scatter } from './util'

const COUNT = 22
const HIT_R = 2.2
const ROUND_SECONDS = 60
const RESPAWN_DELAY = 1.6
const DEATH_TIME = 1.0
const POINTS = 100
const BLOOD_POOL = 90
const SPLAT_POOL = 20
const BEST_KEY = 'drive:bowlingbest'

const SHIRT = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ec4899', '#14b8a6', '#f97316', '#a855f7']
const PANTS = ['#2b3245', '#3f3f46', '#4b3b2a', '#1e293b']
const SKIN = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac']

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

// Random ground spot clear of the spawn point and the villages.
function pickSpot() {
  const reach = WORLD_BOUND - 8
  for (let tries = 0; tries < 30; tries++) {
    const x = (Math.random() * 2 - 1) * reach
    const z = (Math.random() * 2 - 1) * reach
    if (x * x + z * z < 18 * 18) continue
    let bad = false
    for (const s of STATIONS) {
      const dx = s.position[0] - x
      const dz = s.position[2] - z
      if (dx * dx + dz * dz < 18 * 18) {
        bad = true
        break
      }
    }
    if (!bad) return { x, z }
  }
  return { x: 0, z: 40 }
}

// Soft dark-red droplet texture for blood particles / splats.
function makeBloodTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(190,25,25,1)')
  g.addColorStop(0.45, 'rgba(150,0,0,0.85)')
  g.addColorStop(1, 'rgba(110,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/**
 * "Deadly driver" arcade round: low-poly humanoids walk the map. Drive into one
 * and it's knocked down in a splatter of blood for points, then a fresh one
 * spawns. Stylised low-poly gore (red particles + a fading ground splat), not
 * photoreal. 60s per round; best score persists.
 */
export default function Pedestrians({ posRef, gameRef }) {
  const groupRefs = useRef([])
  const legLRefs = useRef([])
  const legRRefs = useRef([])
  const armLRefs = useRef([])
  const armRRefs = useRef([])
  const bloodRefs = useRef([])
  const bloodMatRefs = useRef([])
  const splatRefs = useRef([])
  const splatMatRefs = useRef([])
  const [texture] = useState(makeBloodTexture)

  const figures = useRef(
    scatter(55221, COUNT).map((p) => ({
      x: p.x,
      z: p.z,
      vx: (p.r - 0.5) * 5,
      vz: (Math.cos(p.r * 6.28) || 0.5) * 4,
      active: true,
      dying: false,
      deathT: 0,
      respawnAt: 0,
      turnAt: 0,
    })),
  )
  const bloods = useRef(
    Array.from({ length: BLOOD_POOL }, () => ({ active: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, age: 0, life: 1 })),
  )
  const splats = useRef(
    Array.from({ length: SPLAT_POOL }, () => ({ active: false, x: 0, z: 0, age: 0, life: 4, scale: 1, rot: 0 })),
  )
  const round = useRef({ points: 0, timeLeft: ROUND_SECONDS, best: loadBest(), over: false })

  useEffect(() => () => texture.dispose(), [texture])

  const splatter = (x, z) => {
    // blood droplets
    const bl = bloods.current
    for (let n = 0; n < 16; n++) {
      const idx = bl.findIndex((b) => !b.active)
      if (idx === -1) break
      const b = bl[idx]
      b.active = true
      b.x = x
      b.y = 1.2
      b.z = z
      const a = Math.random() * Math.PI * 2
      const sp = 2 + Math.random() * 7
      b.vx = Math.cos(a) * sp
      b.vz = Math.sin(a) * sp
      b.vy = 2.5 + Math.random() * 4.5
      b.age = 0
      b.life = 0.5 + Math.random() * 0.5
    }
    // ground splat
    const sp = splats.current
    const si = sp.findIndex((s) => !s.active)
    if (si !== -1) {
      const s = sp[si]
      s.active = true
      s.x = x
      s.z = z
      s.age = 0
      s.life = 4
      s.scale = 1.6 + Math.random() * 1.2
      s.rot = Math.random() * Math.PI
    }
  }

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const now = frame.clock.elapsedTime
    const p = posRef.current
    const r = round.current
    const bound = WORLD_BOUND - 4

    if (!r.over) {
      r.timeLeft -= dt
      if (r.timeLeft <= 0) {
        r.timeLeft = 0
        r.over = true
        if (r.points > r.best) {
          r.best = r.points
          try {
            localStorage.setItem(BEST_KEY, String(r.points))
          } catch {
            /* ignore */
          }
        }
      }
    }

    const list = figures.current
    for (let i = 0; i < list.length; i++) {
      const f = list[i]
      const g = groupRefs.current[i]
      if (!g) continue

      // knocked-down animation → hide → schedule respawn
      if (f.dying) {
        f.deathT += dt
        const fall = Math.min(1, f.deathT / DEATH_TIME)
        g.rotation.x = -1.5 * fall
        g.position.y = -0.15 * fall
        if (f.deathT >= DEATH_TIME) {
          f.dying = false
          f.active = false
          f.respawnAt = now + RESPAWN_DELAY
        }
        continue
      }

      if (!f.active) {
        g.visible = false
        if (!r.over && now >= f.respawnAt) {
          const spot = pickSpot()
          f.x = spot.x
          f.z = spot.z
          f.vx = (Math.random() - 0.5) * 5
          f.vz = (Math.random() - 0.5) * 5
          f.active = true
          g.rotation.x = 0
          g.position.y = 0
        }
        continue
      }

      // wander: occasional heading change + bounds bounce
      if (now >= f.turnAt) {
        f.turnAt = now + 1.5 + Math.random() * 2
        const ang = Math.random() * Math.PI * 2
        const spd = 2.5 + Math.random() * 3
        f.vx = Math.sin(ang) * spd
        f.vz = Math.cos(ang) * spd
      }
      f.x += f.vx * dt
      f.z += f.vz * dt
      if (f.x > bound || f.x < -bound) f.vx *= -1
      if (f.z > bound || f.z < -bound) f.vz *= -1
      f.x = Math.max(-bound, Math.min(bound, f.x))
      f.z = Math.max(-bound, Math.min(bound, f.z))

      // hit test against the car
      if (!r.over && p) {
        const dx = f.x - p.x
        const dz = f.z - p.z
        if (dx * dx + dz * dz < HIT_R * HIT_R) {
          f.dying = true
          f.deathT = 0
          r.points += POINTS
          splatter(f.x, f.z)
          gameRef.current.flash = `+${POINTS}`
          continue
        }
      }

      g.visible = true
      g.position.set(f.x, 0, f.z)
      g.rotation.x = 0
      g.rotation.y = Math.atan2(f.vx, f.vz)

      // walk cycle — swing arms/legs opposite each other
      const speed = Math.hypot(f.vx, f.vz)
      const phase = now * 8 + i
      const swing = Math.sin(phase) * Math.min(1, speed / 3)
      if (legLRefs.current[i]) legLRefs.current[i].rotation.x = swing * 0.6
      if (legRRefs.current[i]) legRRefs.current[i].rotation.x = -swing * 0.6
      if (armLRefs.current[i]) armLRefs.current[i].rotation.x = -swing * 0.5
      if (armRRefs.current[i]) armRRefs.current[i].rotation.x = swing * 0.5
    }

    // blood droplets
    const bl = bloods.current
    for (let i = 0; i < BLOOD_POOL; i++) {
      const b = bl[i]
      const sprite = bloodRefs.current[i]
      const mat = bloodMatRefs.current[i]
      if (!sprite || !mat) continue
      if (!b.active) {
        sprite.visible = false
        continue
      }
      b.age += dt
      const tt = b.age / b.life
      if (tt >= 1) {
        b.active = false
        sprite.visible = false
        continue
      }
      b.vy -= 12 * dt // gravity
      b.x += b.vx * dt
      b.y += b.vy * dt
      b.z += b.vz * dt
      if (b.y < 0.05) b.y = 0.05
      sprite.visible = true
      sprite.position.set(b.x, b.y, b.z)
      const sc = 0.35 + tt * 0.3
      sprite.scale.set(sc, sc, sc)
      mat.opacity = 1 - tt * tt
    }

    // ground splats (linger, then fade)
    const sl = splats.current
    for (let i = 0; i < SPLAT_POOL; i++) {
      const s = sl[i]
      const mesh = splatRefs.current[i]
      const mat = splatMatRefs.current[i]
      if (!mesh || !mat) continue
      if (!s.active) {
        mesh.visible = false
        continue
      }
      s.age += dt
      const tt = s.age / s.life
      if (tt >= 1) {
        s.active = false
        mesh.visible = false
        continue
      }
      mesh.visible = true
      mesh.position.set(s.x, 0.06, s.z)
      mesh.rotation.z = s.rot
      const grow = s.scale * (0.6 + Math.min(1, tt * 4) * 0.4)
      mesh.scale.set(grow, grow, grow)
      mat.opacity = 0.85 * (1 - Math.max(0, tt - 0.5) * 2) // hold, then fade in the 2nd half
    }

    gameRef.current.primary = r.over ? `${r.points} pts — time!` : `${r.points} pts`
    gameRef.current.secondary = r.over
      ? `Best ${r.best} · restart to play again`
      : `⏱ ${Math.ceil(r.timeLeft)}s · Best ${r.best}`
    gameRef.current.done = r.over
  })

  return (
    <group>
      {Array.from({ length: COUNT }).map((_, i) => {
        const shirt = SHIRT[i % SHIRT.length]
        const pants = PANTS[i % PANTS.length]
        const skin = SKIN[i % SKIN.length]
        return (
          <group key={i} ref={(el) => (groupRefs.current[i] = el)}>
            {/* torso */}
            <mesh position={[0, 1.15, 0]}>
              <boxGeometry args={[0.55, 0.8, 0.32]} />
              <meshStandardMaterial color={shirt} flatShading />
            </mesh>
            {/* head */}
            <mesh position={[0, 1.78, 0]}>
              <sphereGeometry args={[0.26, 10, 8]} />
              <meshStandardMaterial color={skin} flatShading />
            </mesh>
            {/* arms (pivot at shoulder) */}
            <group position={[-0.4, 1.5, 0]} ref={(el) => (armLRefs.current[i] = el)}>
              <mesh position={[0, -0.32, 0]}>
                <boxGeometry args={[0.15, 0.7, 0.15]} />
                <meshStandardMaterial color={shirt} flatShading />
              </mesh>
            </group>
            <group position={[0.4, 1.5, 0]} ref={(el) => (armRRefs.current[i] = el)}>
              <mesh position={[0, -0.32, 0]}>
                <boxGeometry args={[0.15, 0.7, 0.15]} />
                <meshStandardMaterial color={shirt} flatShading />
              </mesh>
            </group>
            {/* legs (pivot at hip) */}
            <group position={[-0.16, 0.75, 0]} ref={(el) => (legLRefs.current[i] = el)}>
              <mesh position={[0, -0.38, 0]}>
                <boxGeometry args={[0.18, 0.78, 0.19]} />
                <meshStandardMaterial color={pants} flatShading />
              </mesh>
            </group>
            <group position={[0.16, 0.75, 0]} ref={(el) => (legRRefs.current[i] = el)}>
              <mesh position={[0, -0.38, 0]}>
                <boxGeometry args={[0.18, 0.78, 0.19]} />
                <meshStandardMaterial color={pants} flatShading />
              </mesh>
            </group>
          </group>
        )
      })}

      {/* blood droplets */}
      {Array.from({ length: BLOOD_POOL }).map((_, i) => (
        <sprite key={`b${i}`} ref={(el) => (bloodRefs.current[i] = el)} visible={false}>
          <spriteMaterial
            ref={(el) => (bloodMatRefs.current[i] = el)}
            map={texture}
            transparent
            depthWrite={false}
            opacity={0}
          />
        </sprite>
      ))}

      {/* ground splats */}
      {Array.from({ length: SPLAT_POOL }).map((_, i) => (
        <mesh
          key={`s${i}`}
          ref={(el) => (splatRefs.current[i] = el)}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial
            ref={(el) => (splatMatRefs.current[i] = el)}
            map={texture}
            transparent
            depthWrite={false}
            opacity={0}
            color="#8a0000"
          />
        </mesh>
      ))}
    </group>
  )
}
