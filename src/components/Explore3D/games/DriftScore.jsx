import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const BEST_KEY = 'drive:driftbest'
const BANK_GRACE = 1 // seconds out of a drift before the run banks

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

/**
 * Drift challenge: hold SPACE to drift. Points accrue with drift speed and a
 * multiplier that climbs the longer you stay sideways; break the drift for ~1s
 * and the run banks into your total. Best total persists.
 */
export default function DriftScore({ posRef, gameRef }) {
  const state = useRef({
    total: 0,
    run: 0,
    hold: 0, // seconds continuously drifting
    grace: 0, // seconds since drift ended
    best: loadBest(),
  })

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const s = state.current
    const p = posRef.current
    const drifting = !!(p && p.drifting)
    const speed = p ? Math.abs(p.speed || 0) : 0
    const mult = Math.min(5, 1 + s.hold)

    if (drifting && speed > 3) {
      s.hold += dt
      s.grace = 0
      s.run += speed * dt * mult * 4
    } else if (s.run > 0) {
      // out of the drift — bank the run after a short grace window
      s.grace += dt
      if (s.grace >= BANK_GRACE) {
        s.total += Math.round(s.run)
        if (s.total > s.best) {
          s.best = s.total
          try {
            localStorage.setItem(BEST_KEY, String(s.total))
          } catch {
            /* ignore */
          }
        }
        s.run = 0
        s.hold = 0
        s.grace = 0
      }
    } else {
      s.hold = 0
    }

    const live = s.total + Math.round(s.run)
    gameRef.current.primary = `${live.toLocaleString()} pts`
    gameRef.current.secondary =
      s.run > 0 ? `DRIFT ×${mult.toFixed(1)} · Best ${s.best.toLocaleString()}` : `Best ${s.best.toLocaleString()}`
    gameRef.current.done = false
  })

  return null
}
