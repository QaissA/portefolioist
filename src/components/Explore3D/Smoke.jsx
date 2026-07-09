import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 48 // puff pool size
const EMIT_INTERVAL = 0.028 // seconds between emissions while drifting

// Soft radial-gradient texture for a believable smoke puff (generated once).
function makePuffTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,0.95)')
  g.addColorStop(0.45, 'rgba(228,228,228,0.55)')
  g.addColorStop(1, 'rgba(210,210,210,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/**
 * Tyre smoke emitted at the rear wheels while the car drifts. Reads the live
 * car pose (incl. `drifting`) from poseRef, so it never triggers a re-render.
 * A fixed pool of billboarded sprites is recycled — no per-frame allocation.
 * Sprites/materials are declared as JSX so R3F owns and disposes them; we only
 * poke them through refs inside useFrame.
 */
export default function Smoke({ poseRef }) {
  const spriteRefs = useRef([])
  const matRefs = useRef([])
  const emitAcc = useRef(0)
  const [texture] = useState(makePuffTexture)

  // puff simulation state (mutated only inside useFrame)
  const puffs = useRef(
    Array.from({ length: COUNT }, () => ({
      active: false,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      age: 0,
      life: 1,
      baseScale: 1,
    })),
  )

  useEffect(() => () => texture.dispose(), [texture])

  const spawn = (x, z, heading) => {
    const list = puffs.current
    const fx = Math.sin(heading)
    const fz = Math.cos(heading)
    const rgtX = Math.cos(heading)
    const rgtZ = -Math.sin(heading)
    // one puff behind each rear wheel
    for (const side of [-0.95, 0.95]) {
      const idx = list.findIndex((p) => !p.active)
      if (idx === -1) return
      const p = list[idx]
      p.active = true
      p.x = x + rgtX * side + fx * -1.25 + (Math.random() - 0.5) * 0.3
      p.y = 0.35
      p.z = z + rgtZ * side + fz * -1.25 + (Math.random() - 0.5) * 0.3
      p.vx = (Math.random() - 0.5) * 1.4 - fx * 1.2
      p.vy = 0.8 + Math.random() * 0.7
      p.vz = (Math.random() - 0.5) * 1.4 - fz * 1.2
      p.age = 0
      p.life = 0.7 + Math.random() * 0.5
      p.baseScale = 0.7 + Math.random() * 0.5
    }
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const pose = poseRef.current

    // emit at a steady rate while the handbrake drift is engaged
    if (pose && pose.drifting) {
      emitAcc.current += dt
      while (emitAcc.current >= EMIT_INTERVAL) {
        emitAcc.current -= EMIT_INTERVAL
        spawn(pose.x, pose.z, pose.heading)
      }
    } else {
      emitAcc.current = 0
    }

    // advance + recycle puffs
    const list = puffs.current
    for (let i = 0; i < COUNT; i++) {
      const p = list[i]
      const s = spriteRefs.current[i]
      const m = matRefs.current[i]
      if (!s || !m) continue
      if (!p.active) {
        s.visible = false
        continue
      }
      p.age += dt
      const t = p.age / p.life
      if (t >= 1) {
        p.active = false
        s.visible = false
        continue
      }
      // rise, drift outward, slow down
      p.vy *= 1 - 0.6 * dt
      p.vx *= 1 - 1.2 * dt
      p.vz *= 1 - 1.2 * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.z += p.vz * dt

      s.visible = true
      s.position.set(p.x, p.y, p.z)
      const sc = p.baseScale * (0.5 + t * 2.4) // billow outward as it ages
      s.scale.set(sc, sc, sc)
      m.opacity = (1 - t) * 0.55
    }
  })

  return (
    <group>
      {Array.from({ length: COUNT }).map((_, i) => (
        <sprite key={i} ref={(el) => (spriteRefs.current[i] = el)} visible={false}>
          <spriteMaterial
            ref={(el) => (matRefs.current[i] = el)}
            map={texture}
            transparent
            depthWrite={false}
            opacity={0}
            color="#e9ecec"
          />
        </sprite>
      ))}
    </group>
  )
}
