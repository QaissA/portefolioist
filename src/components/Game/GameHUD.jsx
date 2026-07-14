import { useEffect } from 'react'
import { useGame, GAME_IDS, GAME_META } from '@/game/GameContext'
import { CONTENT } from '@/utils/constants'

const PLAY = CONTENT.playMode

export default function GameHUD() {
  const {
    playMode,
    togglePlayMode,
    level,
    xp,
    progress,
    completed,
    completedCount,
    allDone,
  } = useGame()

  // keyboard shortcut: G toggles play mode (ignored while typing in a field)
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return
      if (e.key.toLowerCase() === 'g') {
        e.preventDefault()
        togglePlayMode()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlayMode])

  return (
    <div className="hidden md:block fixed bottom-5 left-5 z-[9000] font-mono select-none">
      {!playMode ? (
        // collapsed pill
        <button
          onClick={togglePlayMode}
          className="group flex items-center gap-2 bg-surface/90 backdrop-blur border border-border hover:border-amber/60 rounded-full pl-3 pr-4 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors duration-200"
        >
          <span className="text-amber">▶</span>
          <span className="tracking-wide">{PLAY.launcher}</span>
          <kbd className="text-[10px] text-text-muted border border-border rounded px-1 py-0.5 group-hover:border-amber/40">
            G
          </kbd>
          {completedCount > 0 && (
            <span className="text-[10px] text-amber">{completedCount}/4</span>
          )}
        </button>
      ) : (
        // expanded terminal panel
        <div className="w-64 bg-surface/95 backdrop-blur border border-amber/30 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface-2">
            <span className="text-[11px] text-amber tracking-wider">{PLAY.title}</span>
            <button
              onClick={togglePlayMode}
              className="text-[10px] text-text-muted hover:text-text-primary transition-colors"
              aria-label="Exit play mode"
            >
              {PLAY.exit}
            </button>
          </div>

          <div className="px-3 py-3">
            {/* level + xp */}
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-text-primary">LVL {level}</span>
              <span className="text-text-muted">{xp} XP</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden mb-3">
              <div
                className="h-full bg-amber rounded-full transition-[width] duration-500"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>

            {/* achievements checklist */}
            <ul className="flex flex-col gap-1.5">
              {GAME_IDS.map((id) => {
                const done = completed[id]
                return (
                  <li key={id} className="flex items-center gap-2 text-[11px]">
                    <span className={done ? 'text-amber' : 'text-text-muted'}>
                      {done ? '✓' : '○'}
                    </span>
                    <span className={done ? 'text-text-primary' : 'text-text-secondary'}>
                      {GAME_META[id].label}
                    </span>
                    <span className="ml-auto text-[9px] text-text-muted">
                      {GAME_META[id].section}
                    </span>
                  </li>
                )
              })}
            </ul>

            {allDone && (
              <div className="mt-3 text-center text-[11px] text-amber border border-amber/40 rounded-lg py-2 animate-pulse">
                {PLAY.allDoneBanner}
              </div>
            )}

            <p className="mt-3 text-[9px] leading-relaxed text-text-muted">
              {PLAY.hint}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
