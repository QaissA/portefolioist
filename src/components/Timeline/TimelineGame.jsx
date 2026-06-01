import { useRef, useState, useLayoutEffect } from 'react'
import { Flip } from '@/utils/gsapConfig'
import { EXPERIENCE } from '@/utils/constants'
import { useGame } from '@/game/GameContext'

const CORRECT = EXPERIENCE.map((e) => e.id) // canonical: newest → oldest

const shuffled = () => {
  const a = [...EXPERIENCE]
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
  } while (a.every((e, i) => e.id === CORRECT[i])) // never start already-solved
  return a
}

const isSolved = (order) => order.every((e, i) => e.id === CORRECT[i])

export default function TimelineGame() {
  const { completeGame } = useGame()
  const [order, setOrder] = useState(shuffled)
  const [dragId, setDragId] = useState(null)
  const [moves, setMoves] = useState(0)

  const orderRef = useRef(order)
  const dragIdRef = useRef(null)
  const cardRefs = useRef({})
  const flipState = useRef(null)
  const doneRef = useRef(false)

  const solved = isSolved(order)

  // keep the ref in sync for the drag handlers + animate the reflow after each reorder
  useLayoutEffect(() => {
    orderRef.current = order
    if (!flipState.current) return
    Flip.from(flipState.current, { duration: 0.4, ease: 'power3.inOut', absolute: true })
    flipState.current = null
  }, [order])

  // award once when solved
  useLayoutEffect(() => {
    if (solved && !doneRef.current) {
      doneRef.current = true
      const score = Math.max(50, 220 - moves * 12)
      completeGame('timeline', { score, xp: 100 + score })
    }
  }, [solved, moves, completeGame])

  const startDrag = (e, id) => {
    e.preventDefault()
    dragIdRef.current = id
    setDragId(id)

    const move = (ev) => {
      const cur = orderRef.current
      const dId = dragIdRef.current
      const curIndex = cur.findIndex((o) => o.id === dId)
      if (curIndex === -1) return

      let target = cur.length - 1
      for (let i = 0; i < cur.length; i++) {
        const el = cardRefs.current[cur[i].id]
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (ev.clientY < r.top + r.height / 2) {
          target = i
          break
        }
      }
      if (target !== curIndex) {
        flipState.current = Flip.getState(
          Object.values(cardRefs.current).filter(Boolean),
        )
        setMoves((m) => m + 1)
        setOrder((prev) => {
          const arr = [...prev]
          const [item] = arr.splice(curIndex, 1)
          arr.splice(target, 0, item)
          return arr
        })
      }
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      dragIdRef.current = null
      setDragId(null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const restart = () => {
    doneRef.current = false
    setMoves(0)
    setOrder(shuffled())
  }

  return (
    <div className="max-w-2xl select-none">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 font-mono text-xs">
        <span className="text-amber">{'> career_sort'}</span>
        <span className="text-text-secondary">
          Moves <span className="text-text-primary">{moves}</span>
        </span>
        <button
          onClick={restart}
          className="ml-auto text-text-muted hover:text-amber transition-colors"
        >
          ↻ shuffle
        </button>
      </div>

      <p className="text-text-secondary text-sm font-display mb-6">
        {solved
          ? '✓ Correct! Most recent role at the top, oldest at the bottom.'
          : 'Drag the roles into chronological order — most recent at the top, oldest at the bottom.'}
      </p>

      <div className="flex flex-col gap-3">
        {order.map((exp, i) => {
          const held = dragId === exp.id
          return (
            <div
              key={exp.id}
              ref={(el) => (cardRefs.current[exp.id] = el)}
              onPointerDown={(e) => startDrag(e, exp.id)}
              className="flex items-center gap-4 rounded-xl border bg-surface px-5 py-4 cursor-grab active:cursor-grabbing touch-none transition-shadow"
              style={{
                borderColor: held ? '#F59E0B' : solved ? '#F59E0B66' : '#2A2A2A',
                transform: held ? 'scale(1.02)' : 'none',
                boxShadow: held ? '0 12px 30px rgba(0,0,0,0.5)' : 'none',
                zIndex: held ? 10 : 1,
              }}
            >
              <span className="font-mono text-text-muted text-xs w-6">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-amber/70 text-lg leading-none">⠿</span>
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-text-primary text-base leading-tight">
                  {exp.role}
                </h3>
                <p className="font-mono text-amber text-xs">{exp.company}</p>
              </div>
              <span
                className="ml-auto font-mono text-xs"
                style={{ color: solved ? '#10B981' : '#52525B' }}
              >
                {exp.period.split(' — ')[0]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
