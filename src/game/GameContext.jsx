import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { CONTENT } from '@/utils/constants'

// The four section games that make up "Dev Quest"
export const GAME_IDS = ['hero', 'skills', 'ai', 'timeline']

export const GAME_META = CONTENT.playMode.games

const STORAGE_KEY = 'devquest:v1'

const emptyState = {
  xp: 0,
  completed: { hero: false, skills: false, ai: false, timeline: false },
  scores: {},
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState
    const parsed = JSON.parse(raw)
    return {
      xp: parsed.xp ?? 0,
      completed: { ...emptyState.completed, ...(parsed.completed || {}) },
      scores: parsed.scores || {},
    }
  } catch {
    return emptyState
  }
}

// 250 XP per level; cheap, readable curve
export const xpToLevel = (xp) => Math.floor(xp / 250) + 1
export const levelProgress = (xp) => (xp % 250) / 250

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [playMode, setPlayMode] = useState(false)
  const [state, setState] = useState(loadState)

  // persist progress (not playMode — that always starts off)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable — ignore */
    }
  }, [state])

  const togglePlayMode = useCallback(() => setPlayMode((p) => !p), [])

  const addXp = useCallback((n) => {
    setState((s) => ({ ...s, xp: s.xp + Math.max(0, n) }))
  }, [])

  // mark a game complete; first completion banks its XP. Re-playing keeps best score.
  const completeGame = useCallback((id, { score = 0, xp = 0 } = {}) => {
    setState((s) => {
      const firstTime = !s.completed[id]
      const bestScore = Math.max(s.scores[id] ?? 0, score)
      return {
        xp: firstTime ? s.xp + xp : s.xp,
        completed: { ...s.completed, [id]: true },
        scores: { ...s.scores, [id]: bestScore },
      }
    })
  }, [])

  const resetProgress = useCallback(() => setState(emptyState), [])

  const value = useMemo(() => {
    const completedCount = GAME_IDS.filter((id) => state.completed[id]).length
    return {
      playMode,
      togglePlayMode,
      xp: state.xp,
      level: xpToLevel(state.xp),
      progress: levelProgress(state.xp),
      completed: state.completed,
      completedCount,
      scores: state.scores,
      allDone: completedCount === GAME_IDS.length,
      addXp,
      completeGame,
      resetProgress,
    }
  }, [playMode, state, togglePlayMode, addXp, completeGame, resetProgress])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}
