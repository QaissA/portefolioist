import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { STATIONS, ARRIVE_RADIUS } from '../stations'
import { fmtClock } from './util'

const BEST_KEY = 'drive:besttime'

function loadBest() {
  try {
    const v = Number(localStorage.getItem(BEST_KEY))
    return v > 0 ? v : null
  } catch {
    return null
  }
}

/**
 * Time trial: drive through all five villages in order as fast as possible.
 * The timer starts on the first throttle input; a bobbing arrow marks the next
 * checkpoint. Best time persists in localStorage.
 */
export default function TimeTrial({ posRef, gameRef }) {
  const arrow = useRef()
  const state = useRef({ idx: 0, elapsed: 0, started: false, done: false, best: loadBest() })

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const s = state.current
    const p = posRef.current
    if (!p) return

    // start the clock once the player actually moves
    if (!s.started && Math.abs(p.speed || 0) > 1) s.started = true
    if (s.started && !s.done) s.elapsed += dt

    // reached the current checkpoint?
    if (s.started && !s.done) {
      const target = STATIONS[s.idx]
      const dx = target.position[0] - p.x
      const dz = target.position[2] - p.z
      if (dx * dx + dz * dz < ARRIVE_RADIUS * ARRIVE_RADIUS) {
        s.idx += 1
        if (s.idx >= STATIONS.length) {
          s.done = true
          if (s.best == null || s.elapsed < s.best) {
            s.best = s.elapsed
            try {
              localStorage.setItem(BEST_KEY, String(Math.round(s.elapsed)))
            } catch {
              /* ignore */
            }
          }
        }
      }
    }

    // move the target arrow above the active checkpoint (bobbing)
    if (arrow.current) {
      if (s.done) {
        arrow.current.visible = false
      } else {
        arrow.current.visible = true
        const t = STATIONS[s.idx].position
        arrow.current.position.set(t[0], 9 + Math.sin(frame.clock.elapsedTime * 3) * 0.5, t[2])
        arrow.current.rotation.y = frame.clock.elapsedTime * 1.5
      }
    }

    // publish HUD text
    const bestLabel = s.best != null ? `Best ${fmtClock(s.best)}` : 'No best yet'
    gameRef.current.primary = fmtClock(s.elapsed)
    gameRef.current.secondary = s.done
      ? `Finished! · ${bestLabel}`
      : `Checkpoint ${s.idx}/${STATIONS.length} · ${bestLabel}`
    gameRef.current.done = s.done
  })

  return (
    <mesh ref={arrow} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[1.1, 2.4, 4]} />
      <meshStandardMaterial color="#ffd23f" emissive="#ffb703" emissiveIntensity={1.4} />
    </mesh>
  )
}
