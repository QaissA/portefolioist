import { useRef, useState, useLayoutEffect } from 'react'
import { gsap, Flip } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'
import { SKILLS } from '@/utils/constants'
import SkillCard from './SkillCard'

const CATEGORIES = [
  { key: 'frontend', label: 'Frontend', color: '#F59E0B' },
  { key: 'backend', label: 'Backend', color: '#10B981' },
  { key: 'mobile', label: 'Mobile', color: '#0EA5E9' },
  { key: 'ai', label: 'AI & Agents', color: '#8B5CF6' },
  { key: 'devops', label: 'DevOps & QA', color: '#F43F5E' },
]

// Pre-computed scatter positions (left%, top%) per skill — manually laid out
// to fill a ~560px tall container without overlap
const POSITIONS = [
  // frontend (7)
  { l: '2%',  t: '2%' },
  { l: '18%', t: '8%' },
  { l: '36%', t: '2%' },
  { l: '54%', t: '7%' },
  { l: '70%', t: '1%' },
  { l: '82%', t: '9%' },
  { l: '10%', t: '18%' },
  // backend (6)
  { l: '28%', t: '20%' },
  { l: '46%', t: '17%' },
  { l: '62%', t: '22%' },
  { l: '76%', t: '16%' },
  { l: '4%',  t: '32%' },
  { l: '20%', t: '34%' },
  // mobile (2)
  { l: '40%', t: '33%' },
  { l: '56%', t: '36%' },
  // ai (5)
  { l: '70%', t: '31%' },
  { l: '84%', t: '27%' },
  { l: '6%',  t: '48%' },
  { l: '22%', t: '50%' },
  { l: '38%', t: '47%' },
  // devops (5)
  { l: '55%', t: '50%' },
  { l: '70%', t: '46%' },
  { l: '84%', t: '52%' },
  { l: '12%', t: '64%' },
  { l: '30%', t: '66%' },
]

// Flatten all skills with their category
const ALL_SKILLS = CATEGORIES.flatMap(({ key, color }) =>
  SKILLS[key].map((skill) => ({ ...skill, category: key, color }))
)

export default function SkillsScatter() {
  const [activeCategory, setActiveCategory] = useState('all')
  const containerRef = useRef(null)
  const savedState = useRef(null)

  // Start floating animations on mount
  useGSAP(() => {
    const items = containerRef.current?.querySelectorAll('.scatter-item')
    if (!items) return

    items.forEach((el, i) => {
      const amp = 8 + (i % 3) * 5
      const dur = 3 + (i % 5) * 0.8
      gsap.to(el, {
        y: -amp,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        duration: dur,
        delay: i * 0.12,
      })
    })
  }, [])

  // Flip transition when filter changes
  useLayoutEffect(() => {
    if (!savedState.current) return
    Flip.from(savedState.current, {
      duration: 0.65,
      ease: 'power3.inOut',
      stagger: 0.03,
      absolute: true,
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.8, duration: 0.25 }),
      onEnter: (els) => gsap.from(els, { opacity: 0, scale: 0.8, duration: 0.35 }),
    })
    savedState.current = null
  }, [activeCategory])

  const handleFilter = (cat) => {
    savedState.current = Flip.getState('.scatter-item')
    setActiveCategory(cat)
  }

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-3 mb-10">
        <button
          onClick={() => handleFilter('all')}
          className={`font-mono text-xs px-4 py-2 rounded-full border transition-all duration-200 ${
            activeCategory === 'all'
              ? 'bg-amber text-background border-amber'
              : 'border-border text-text-muted hover:border-amber/50 hover:text-text-primary'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => handleFilter(key)}
            className={`font-mono text-xs px-4 py-2 rounded-full border transition-all duration-200`}
            style={
              activeCategory === key
                ? { background: color, color: '#0A0A0A', borderColor: color }
                : { borderColor: '#2A2A2A', color: '#A1A1AA' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Scatter field */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: 'clamp(400px, 60vh, 580px)' }}
      >
        {ALL_SKILLS.map((skill, i) => {
          const pos = POSITIONS[i] || { l: `${(i * 7) % 90}%`, t: `${(i * 13) % 80}%` }
          const hidden = activeCategory !== 'all' && skill.category !== activeCategory
          return (
            <div
              key={skill.name}
              className="scatter-item absolute"
              style={{
                left: pos.l,
                top: pos.t,
                opacity: hidden ? 0 : 1,
                pointerEvents: hidden ? 'none' : 'auto',
                visibility: hidden ? 'hidden' : 'visible',
                transition: 'opacity 0.25s',
              }}
            >
              <SkillCard name={skill.name} icon={skill.icon} glowColor={skill.color} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
