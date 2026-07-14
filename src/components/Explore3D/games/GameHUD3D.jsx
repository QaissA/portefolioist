import { useEffect, useRef } from 'react'
import { GAME_MODES } from './gameModes'
import { CONTENT } from '@/utils/constants'

/**
 * Drive Mode game HUD: a mode picker (top-center) plus a live score/timer
 * readout. The readout is driven straight from gameRef via rAF so per-frame
 * score updates never re-render React.
 */
export default function GameHUD3D({ mode, setMode, runId, setRunId, gameRef }) {
  const primaryRef = useRef()
  const secondaryRef = useRef()
  const flashRef = useRef()

  useEffect(() => {
    if (mode === 'explore') return
    let raf
    let lastFlash = ''
    let flashClear = 0
    const loop = () => {
      const g = gameRef.current || {}
      if (primaryRef.current) primaryRef.current.textContent = g.primary || '—'
      if (secondaryRef.current) secondaryRef.current.textContent = g.secondary || ''
      // transient flash message (e.g. "+1")
      if (g.flash && g.flash !== lastFlash) {
        lastFlash = g.flash
        if (flashRef.current) {
          flashRef.current.textContent = g.flash
          flashRef.current.style.opacity = '1'
        }
        flashClear = performance.now() + 600
        g.flash = ''
      }
      if (flashClear && performance.now() > flashClear && flashRef.current) {
        flashRef.current.style.opacity = '0'
        flashClear = 0
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [mode, runId, gameRef])

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[10020] flex -translate-x-1/2 flex-col items-center gap-2">
      {/* mode picker */}
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-surface/85 p-1 backdrop-blur">
        {GAME_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id)
              setRunId((n) => n + 1)
            }}
            title={m.hint}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs transition-colors ${
              mode === m.id
                ? 'bg-amber text-background'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="text-sm leading-none">{m.icon}</span>
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        ))}
        <span className="ml-1 hidden items-center gap-1 pr-2 font-mono text-[10px] text-text-muted sm:flex">
          <kbd className="rounded border border-border px-1 py-0.5">TAB</kbd>
          {CONTENT.driveMode.switchHint}
        </span>
      </div>

      {/* score / timer readout */}
      {mode !== 'explore' && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-amber/30 bg-surface/90 px-5 py-2 backdrop-blur">
          <div className="text-center">
            <div ref={primaryRef} className="font-display text-xl font-bold text-text-primary tabular-nums">
              —
            </div>
            <div ref={secondaryRef} className="font-mono text-[11px] text-text-muted" />
          </div>
          <button
            onClick={() => setRunId((n) => n + 1)}
            title="Restart"
            className="rounded-full border border-border px-2.5 py-1 font-mono text-xs text-text-secondary transition-colors hover:border-amber/60 hover:text-text-primary"
          >
            ↺
          </button>
        </div>
      )}

      {/* transient flash (e.g. +1) */}
      <div
        ref={flashRef}
        style={{ opacity: 0, transition: 'opacity 0.2s' }}
        className="pointer-events-none font-display text-2xl font-bold text-amber"
      />
    </div>
  )
}
