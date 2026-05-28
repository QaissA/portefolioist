import { useRef, useLayoutEffect } from 'react'
import { gsap, ScrollTrigger } from '@/utils/gsapConfig'
import { FaBolt, FaBug, FaBook, FaBrain, FaUsers, FaStar } from 'react-icons/fa'

const ICONS = [FaBolt, FaBug, FaBook, FaBrain, FaUsers, FaStar]

export default function MetricCard({ value, suffix, prefix = '', label, sublabel, index }) {
  const cardRef = useRef(null)
  const countRef = useRef(null)

  useLayoutEffect(() => {
    const el = cardRef.current
    const counter = countRef.current
    if (!el || !counter) return

    const isDecimal = !Number.isInteger(value)
    const proxy = { count: 0 }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(proxy, {
          count: value,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            counter.textContent = isDecimal
              ? proxy.count.toFixed(1)
              : Math.floor(proxy.count).toLocaleString()
          },
        })
      },
    })

    return () => trigger.kill()
  }, [value])

  const Icon = ICONS[index % ICONS.length]

  return (
    <div
      ref={cardRef}
      className="metric-card bg-surface border border-border rounded-2xl p-8 flex flex-col items-center text-center hover:border-amber/30 transition-colors duration-300 group"
    >
      <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-6 group-hover:bg-amber/20 transition-colors duration-300">
        <Icon className="text-amber text-xl" aria-hidden="true" />
      </div>
      <div className="font-display font-bold text-text-primary mb-1" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
        <span className="text-amber text-2xl">{prefix}</span>
        <span ref={countRef}>0</span>
        <span className="text-amber">{suffix}</span>
      </div>
      <p className="font-mono text-text-secondary text-sm mb-1">{label}</p>
      <p className="font-mono text-text-muted text-xs">{sublabel}</p>
    </div>
  )
}
