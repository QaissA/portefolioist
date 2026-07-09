import { useEffect, useRef } from 'react'

// Maps physical keys → arcade-drive intents. Stored in a ref (no re-render):
// f = forward, b = brake/reverse, l = steer left, r = steer right,
// space = handbrake / drift.
const KEY_MAP = {
  KeyW: 'f',
  ArrowUp: 'f',
  KeyS: 'b',
  ArrowDown: 'b',
  KeyA: 'l',
  ArrowLeft: 'l',
  KeyD: 'r',
  ArrowRight: 'r',
  Space: 'space',
}

export function useKeyboard() {
  const keys = useRef({ f: false, b: false, l: false, r: false, space: false })

  useEffect(() => {
    const down = (e) => {
      const intent = KEY_MAP[e.code]
      if (!intent) return
      keys.current[intent] = true
      // stop the arrow keys / space from scrolling the (locked) page behind us
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault()
    }
    const up = (e) => {
      const intent = KEY_MAP[e.code]
      if (intent) keys.current[intent] = false
    }
    // clear everything if the window loses focus mid-press (avoids "stuck" throttle)
    const blur = () => {
      keys.current.f = keys.current.b = keys.current.l = keys.current.r = keys.current.space = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  return keys
}
