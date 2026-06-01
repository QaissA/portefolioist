import { useRef, useState, useEffect, useMemo } from 'react'
import { gsap } from '@/utils/gsapConfig'
import { SKILLS } from '@/utils/constants'
import { useGame } from '@/game/GameContext'

const CATEGORIES = [
  { key: 'frontend', label: 'Frontend', color: '#F59E0B' },
  { key: 'backend', label: 'Backend', color: '#10B981' },
  { key: 'mobile', label: 'Mobile', color: '#0EA5E9' },
  { key: 'ai', label: 'AI & Agents', color: '#8B5CF6' },
  { key: 'devops', label: 'DevOps & QA', color: '#F43F5E' },
]

const ALL_SKILLS = CATEGORIES.flatMap(({ key }) =>
  SKILLS[key].map((skill) => ({ name: skill.name, category: key })),
)

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const emptyBuckets = () =>
  Object.fromEntries(CATEGORIES.map((c) => [c.key, []]))

export default function SkillsGame() {
  const { completeGame } = useGame()

  const [pool, setPool] = useState(() => shuffle(ALL_SKILLS))
  const [placed, setPlaced] = useState(emptyBuckets)
  const [drag, setDrag] = useState(null) // { skill, x, y }
  const [hoverBucket, setHoverBucket] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)

  const dragRef = useRef(null)
  const bucketRefs = useRef({})
  const doneRef = useRef(false)

  const finished = pool.length === 0

  // elapsed timer while playing
  useEffect(() => {
    if (!started || finished) return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [started, finished])

  // award once when the board is cleared
  useEffect(() => {
    if (finished && started && !doneRef.current) {
      doneRef.current = true
      const timeBonus = Math.max(0, 90 - seconds)
      const score = Math.max(0, ALL_SKILLS.length * 20 - mistakes * 8 + timeBonus)
      completeGame('skills', { score, xp: 100 + score })
    }
  }, [finished, started, seconds, mistakes, completeGame])

  const bucketAt = (x, y) => {
    for (const { key } of CATEGORIES) {
      const el = bucketRefs.current[key]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return key
    }
    return null
  }

  const drop = (skill, bucketKey) => {
    if (!bucketKey) return // dropped on empty space — no penalty
    if (bucketKey === skill.category) {
      setPlaced((p) => ({ ...p, [bucketKey]: [...p[bucketKey], skill] }))
      setPool((pl) => pl.filter((s) => s.name !== skill.name))
    } else {
      setMistakes((m) => m + 1)
      const el = bucketRefs.current[bucketKey]
      if (el) gsap.fromTo(el, { x: -8 }, { x: 0, duration: 0.45, ease: 'elastic.out(1, 0.3)' })
    }
  }

  const startDrag = (e, skill) => {
    e.preventDefault()
    if (!started) setStarted(true)
    dragRef.current = { skill, x: e.clientX, y: e.clientY }
    setDrag(dragRef.current)

    const move = (ev) => {
      dragRef.current = { skill, x: ev.clientX, y: ev.clientY }
      setDrag(dragRef.current)
      setHoverBucket(bucketAt(ev.clientX, ev.clientY))
    }
    const up = (ev) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      drop(skill, bucketAt(ev.clientX, ev.clientY))
      dragRef.current = null
      setDrag(null)
      setHoverBucket(null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const restart = () => {
    doneRef.current = false
    setPool(shuffle(ALL_SKILLS))
    setPlaced(emptyBuckets())
    setMistakes(0)
    setSeconds(0)
    setStarted(false)
  }

  const placedCount = useMemo(
    () => Object.values(placed).reduce((n, arr) => n + arr.length, 0),
    [placed],
  )

  return (
    <div className="select-none">
      {/* status bar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 font-mono text-xs">
        <span className="text-amber">{'> stack_sorter'}</span>
        <span className="text-text-secondary">
          Placed <span className="text-text-primary">{placedCount}</span>/{ALL_SKILLS.length}
        </span>
        <span className="text-text-secondary">
          Misses <span className="text-text-primary">{mistakes}</span>
        </span>
        <span className="text-text-secondary">
          Time <span className="text-text-primary">{seconds}s</span>
        </span>
        {finished && (
          <button
            onClick={restart}
            className="ml-auto text-text-muted hover:text-amber transition-colors underline-offset-2 hover:underline"
          >
            ↻ play again
          </button>
        )}
      </div>

      {!finished ? (
        <p className="text-text-secondary text-sm font-display mb-6 max-w-2xl">
          Drag each skill into the category it belongs to. Wrong drops bounce back and cost you.
        </p>
      ) : (
        <p className="text-amber text-sm font-display mb-6">
          Stack sorted in {seconds}s with {mistakes} miss{mistakes === 1 ? '' : 'es'}. Nice. ✓
        </p>
      )}

      {/* skill pool */}
      <div className="flex flex-wrap gap-2.5 mb-10 min-h-[3rem]">
        {pool.map((skill) => {
          const isDragging = drag?.skill.name === skill.name
          return (
            <button
              key={skill.name}
              onPointerDown={(e) => startDrag(e, skill)}
              className="font-mono text-xs px-3.5 py-2 rounded-full border border-border bg-surface text-text-primary cursor-grab active:cursor-grabbing hover:border-amber/50 transition-colors touch-none"
              style={{ opacity: isDragging ? 0.25 : 1 }}
            >
              {skill.name}
            </button>
          )
        })}
        {pool.length === 0 && (
          <span className="font-mono text-xs text-text-muted">— pool empty —</span>
        )}
      </div>

      {/* category buckets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {CATEGORIES.map(({ key, label, color }) => {
          const items = placed[key]
          const isHover = hoverBucket === key
          return (
            <div
              key={key}
              ref={(el) => (bucketRefs.current[key] = el)}
              className="rounded-xl border-2 border-dashed p-3 min-h-[150px] transition-colors duration-150"
              style={{
                borderColor: isHover ? color : '#2A2A2A',
                background: isHover ? `${color}14` : 'transparent',
              }}
            >
              <p
                className="font-mono text-[11px] mb-3 tracking-wide"
                style={{ color }}
              >
                {label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((s) => (
                  <span
                    key={s.name}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-full border"
                    style={{ borderColor: color, color, background: `${color}1A` }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* floating chip under the cursor while dragging */}
      {drag && (
        <div
          className="fixed z-[9500] pointer-events-none font-mono text-xs px-3.5 py-2 rounded-full border border-amber bg-surface text-text-primary shadow-xl"
          style={{ left: drag.x, top: drag.y, transform: 'translate(-50%, -50%)' }}
        >
          {drag.skill.name}
        </div>
      )}
    </div>
  )
}
