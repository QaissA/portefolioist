import { useState, useRef, useEffect, useCallback } from 'react'
import { useGame } from '@/game/GameContext'
import { CONTENT } from '@/utils/constants'

const BG = CONTENT.playMode.bubbleGame
const GAME_TIME = 20 // seconds

// Hook owns the bubble-pop game state. Hero passes `onPop` into the R3F scene
// and spreads the rest into <BubbleGameHUD />.
export function useBubbleGame() {
  const { playMode, completeGame } = useGame()
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)

  // refs avoid stale closures inside the (stable) onPop passed across the Canvas
  const ctl = useRef({ running: false, combo: 0 })
  const comboTimer = useRef(null)

  const start = useCallback(() => {
    setScore(0)
    setCombo(0)
    setTimeLeft(GAME_TIME)
    setFinished(false)
    setRunning(true)
    ctl.current = { running: true, combo: 0 }
  }, [])

  // countdown
  useEffect(() => {
    if (!running) return
    if (timeLeft <= 0) {
      ctl.current.running = false
      setRunning(false)
      setFinished(true)
      setScore((finalScore) => {
        completeGame('hero', { score: finalScore, xp: 100 + finalScore })
        return finalScore
      })
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [running, timeLeft, completeGame])

  // stable: always called with the latest control state
  const onPop = useCallback(() => {
    if (!ctl.current.running) return
    ctl.current.combo += 1
    const c = ctl.current.combo
    setCombo(c)
    setScore((s) => s + 10 + c * 2) // combo multiplier
    clearTimeout(comboTimer.current)
    comboTimer.current = setTimeout(() => {
      ctl.current.combo = 0
      setCombo(0)
    }, 1200)
  }, [])

  // leaving play mode stops any run
  useEffect(() => {
    if (!playMode) {
      ctl.current.running = false
      setRunning(false)
    }
  }, [playMode])

  return { playMode, running, finished, score, combo, timeLeft, start, onPop }
}

export function BubbleGameHUD({ playMode, running, finished, score, combo, timeLeft, start }) {
  if (!playMode) return null

  return (
    <div className="absolute top-24 right-8 z-20 font-mono pointer-events-auto select-none">
      <div className="w-56 bg-surface/95 backdrop-blur border border-amber/30 rounded-xl p-4 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between text-[11px] mb-3">
          <span className="text-amber tracking-wider">{BG.title}</span>
          {running && <span className="text-text-primary">{timeLeft}s</span>}
        </div>

        {!running && (
          <>
            {finished ? (
              <div className="text-center mb-3">
                <p className="text-[11px] text-text-secondary">{BG.finalScoreLabel}</p>
                <p className="text-3xl text-amber font-bold">{score}</p>
              </div>
            ) : (
              <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
                {BG.instructions.replace('{time}', GAME_TIME)}
              </p>
            )}
            <button
              onClick={start}
              className="w-full bg-amber text-background text-xs font-semibold rounded-full py-2 hover:bg-amber/90 transition-colors"
            >
              {finished ? BG.playAgain : BG.start}
            </button>
          </>
        )}

        {running && (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-text-muted">{BG.scoreLabel}</p>
              <p className="text-2xl text-text-primary font-bold leading-none">{score}</p>
            </div>
            {combo > 1 && (
              <div className="text-right">
                <p className="text-[10px] text-text-muted">{BG.comboLabel}</p>
                <p className="text-xl text-amber font-bold leading-none">×{combo}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
