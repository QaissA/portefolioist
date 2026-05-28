import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/utils/gsapConfig'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·—01'

export function useScrambleText(finalText) {
  const elRef = useRef(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const chars = finalText.split('')
    const totalDuration = 900 // ms
    const revealTimes = chars.map((_, i) => (i / chars.length) * totalDuration)

    let startTime = null
    let ticker = null
    let triggered = false

    const scramble = (time) => {
      if (!startTime) startTime = time
      const elapsed = time - startTime

      const result = chars.map((ch, i) => {
        if (ch === ' ') return ' '
        if (elapsed >= revealTimes[i]) return ch
        return CHARSET[Math.floor(Math.random() * CHARSET.length)]
      })
      el.textContent = result.join('')

      if (elapsed >= totalDuration) {
        el.textContent = finalText
        gsap.ticker.remove(ticker)
      }
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        if (triggered) return
        triggered = true
        startTime = null
        ticker = (time) => scramble(time * 1000)
        gsap.ticker.add(ticker)
      },
    })

    return () => {
      st.kill()
      if (ticker) gsap.ticker.remove(ticker)
    }
  }, [finalText])

  return elRef
}
