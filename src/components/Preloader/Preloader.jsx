import { useEffect, useRef } from 'react'
import { gsap } from '@/utils/gsapConfig'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·—01'
const NAME = 'QAISS ABDELHAMID'

export default function Preloader({ onComplete }) {
  const overlayRef = useRef(null)
  const barRef = useRef(null)
  const nameRef = useRef(null)

  useEffect(() => {
    const overlay = overlayRef.current
    const bar = barRef.current
    const nameEl = nameRef.current
    if (!overlay || !bar || !nameEl) return

    const chars = NAME.split('')
    const totalScramble = 1000
    const revealTimes = chars.map((_, i) => (i / chars.length) * totalScramble)
    let startTime = null

    // Phase 1: progress bar + name scramble (0 → 1.2s)
    const tl = gsap.timeline({
      onComplete: () => {
        // Phase 3: clip-path wipe upward (1.6 → 2.3s)
        gsap.to(overlay, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.85,
          ease: 'power4.inOut',
          delay: 0.4,
          onComplete: () => {
            overlay.style.display = 'none'
            onComplete()
          },
        })
      },
    })

    tl.to(bar, { width: '300px', duration: 1.2, ease: 'power2.inOut' })

    // Scramble ticker runs for 1s alongside the bar
    let ticker = null
    ticker = (time) => {
      if (!startTime) startTime = time * 1000
      const elapsed = time * 1000 - startTime

      const result = chars.map((ch, i) => {
        if (ch === ' ') return ' '
        if (elapsed >= revealTimes[i]) return ch
        return CHARSET[Math.floor(Math.random() * CHARSET.length)]
      })
      nameEl.textContent = result.join('')

      if (elapsed >= totalScramble) {
        nameEl.textContent = NAME
        gsap.ticker.remove(ticker)
      }
    }
    gsap.ticker.add(ticker)

    return () => {
      if (ticker) gsap.ticker.remove(ticker)
      tl.kill()
    }
  }, [onComplete])

  return (
    <div
      ref={overlayRef}
      className="preloader-overlay"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      {/* Progress bar track */}
      <div
        className="relative"
        style={{ width: '300px', height: '2px', background: '#1A1A1A', borderRadius: '2px' }}
      >
        <div
          ref={barRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '0px',
            background: '#F59E0B',
            borderRadius: '2px',
          }}
        />
      </div>

      {/* Scrambled name */}
      <p
        ref={nameRef}
        className="font-display font-bold text-text-primary"
        style={{
          fontSize: 'clamp(1.2rem, 3vw, 2rem)',
          letterSpacing: '0.15em',
          color: '#F59E0B',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        {NAME}
      </p>
    </div>
  )
}
