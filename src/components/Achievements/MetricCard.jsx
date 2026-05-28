import { useRef, useLayoutEffect, useMemo, useState } from 'react'
import { gsap, ScrollTrigger } from '@/utils/gsapConfig'
import { FaBolt, FaBug, FaBook, FaBrain, FaUsers, FaStar } from 'react-icons/fa'

const ICONS = [FaBolt, FaBug, FaBook, FaBrain, FaUsers, FaStar]
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

function DigitReel({ digit, delay = 0, triggered }) {
  const reelRef = useRef(null)

  useLayoutEffect(() => {
    if (!triggered) return
    const reel = reelRef.current
    if (!reel) return
    const lineH = reel.children[0]?.offsetHeight || 0
    if (!lineH) return

    const target = parseInt(digit, 10)
    const tl = gsap.timeline({ delay })
    tl.to(reel, { y: -(target + 3) * lineH, duration: 1.1, ease: 'power3.in' })
      .to(reel, { y: -target * lineH, duration: 0.45, ease: 'back.out(2.5)' })

    return () => tl.kill()
  }, [triggered, digit, delay])

  return (
    <div className="digit-window" style={{ height: '1em' }}>
      <div ref={reelRef} className="digit-reel" style={{ lineHeight: '1em' }}>
        {DIGITS.map((d) => (
          <span key={d} style={{ height: '1em', display: 'block', textAlign: 'center' }}>{d}</span>
        ))}
        {/* Extra rows for overshoot headroom */}
        {DIGITS.slice(0, 4).map((d) => (
          <span key={`x-${d}`} style={{ height: '1em', display: 'block', textAlign: 'center' }}>{d}</span>
        ))}
      </div>
    </div>
  )
}

function AnimatedNumber({ value, triggered }) {
  const str = useMemo(() => {
    return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1)
  }, [value])

  return (
    <>
      {str.split('').map((ch, i) =>
        /[0-9]/.test(ch) ? (
          <DigitReel key={i} digit={ch} delay={i * 0.06} triggered={triggered} />
        ) : (
          <span key={i} className="inline-block">{ch}</span>
        )
      )}
    </>
  )
}

export default function MetricCard({ value, suffix, prefix = '', label, sublabel, index }) {
  const cardRef = useRef(null)
  const [triggered, setTriggered] = useState(false)
  const Icon = ICONS[index % ICONS.length]

  useLayoutEffect(() => {
    const el = cardRef.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => setTriggered(true),
    })
    return () => st.kill()
  }, [])

  return (
    <div
      ref={cardRef}
      className="metric-card bg-surface border border-border rounded-2xl p-8 flex flex-col items-center text-center hover:border-amber/30 transition-colors duration-300 group"
    >
      <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-6 group-hover:bg-amber/20 transition-colors duration-300">
        <Icon className="text-amber text-xl" aria-hidden="true" />
      </div>
      <div
        className="font-display font-bold text-text-primary mb-1 flex items-baseline gap-0.5"
        style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
      >
        {prefix && <span className="text-amber text-2xl">{prefix}</span>}
        <AnimatedNumber value={value} triggered={triggered} />
        {suffix && <span className="text-amber">{suffix}</span>}
      </div>
      <p className="font-mono text-text-secondary text-sm mb-1">{label}</p>
      <p className="font-mono text-text-muted text-xs">{sublabel}</p>
    </div>
  )
}
