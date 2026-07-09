import { useEffect, useRef } from 'react'
import { STATIONS, WORLD_BOUND } from './stations'

const SIZE = 128 // px

// world (x or z) → minimap px. Center of the map is world origin.
const toPx = (v) => (v / WORLD_BOUND) * (SIZE / 2) + SIZE / 2

/**
 * Top-down minimap. The car marker is updated straight from posRef via rAF so
 * it never triggers a React render; station dots are static.
 */
export default function Minimap({ posRef, active }) {
  const carRef = useRef()

  useEffect(() => {
    let raf
    const loop = () => {
      const p = posRef.current
      const el = carRef.current
      if (p && el) {
        el.style.transform = `translate(${toPx(p.x) - 6}px, ${toPx(p.z) - 6}px) rotate(${p.heading}rad)`
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [posRef])

  return (
    <div
      className="fixed right-4 top-20 z-[10020] rounded-xl border border-border bg-surface/85 p-2 backdrop-blur"
      style={{ width: SIZE + 16 }}
    >
      <div className="relative overflow-hidden rounded-lg bg-surface-2/70" style={{ width: SIZE, height: SIZE }}>
        {/* grid crosshair */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-border/60" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-border/60" />

        {/* station dots */}
        {STATIONS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full transition-transform duration-200"
            style={{
              width: 9,
              height: 9,
              left: toPx(s.position[0]) - 4.5,
              top: toPx(s.position[2]) - 4.5,
              background: s.color,
              boxShadow: `0 0 6px ${s.color}`,
              transform: active === s.id ? 'scale(1.5)' : 'scale(1)',
            }}
          />
        ))}

        {/* car marker (triangle) */}
        <div
          ref={carRef}
          className="absolute left-0 top-0"
          style={{ width: 0, height: 0 }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '11px solid rgb(var(--color-text-primary))',
              transform: 'translate(1px, 1px)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
