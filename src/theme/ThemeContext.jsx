import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_THEME,
  FONT_OPTIONS,
  STORAGE_KEY,
  ensureFontLoaded,
  getPalette,
  resolveAccents,
  shade,
} from './themeConfig'

const ThemeContext = createContext(null)

function loadTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_THEME
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_THEME,
      ...parsed,
      hiddenBlocks: Array.isArray(parsed.hiddenBlocks) ? parsed.hiddenBlocks : [],
    }
  } catch {
    return DEFAULT_THEME
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(loadTheme)

  // Apply theme to :root + persist whenever it changes.
  useEffect(() => {
    const root = document.documentElement
    const base = getPalette(theme.palette).colors
    const { accent, accent2 } = resolveAccents(theme)

    // Full palette
    root.style.setProperty('--color-bg', base.bg)
    root.style.setProperty('--color-surface', base.surface)
    root.style.setProperty('--color-surface-2', base.surface2)
    root.style.setProperty('--color-border', base.border)
    root.style.setProperty('--color-text-primary', base.textPrimary)
    root.style.setProperty('--color-text-secondary', base.textSecondary)
    root.style.setProperty('--color-text-muted', base.textMuted)

    // Two theme-driving accents (+ derived hover steps for the primary)
    root.style.setProperty('--color-accent', accent)
    root.style.setProperty('--color-accent-400', shade(accent, 0.22))
    root.style.setProperty('--color-accent-600', shade(accent, -0.18))
    root.style.setProperty('--color-accent-2', accent2)

    // Expose light/dark intent for anything that needs it
    root.dataset.themeMode = getPalette(theme.palette).mode

    // Typography
    const fontOpt = FONT_OPTIONS.find((f) => f.label === theme.font) || FONT_OPTIONS[0]
    ensureFontLoaded(theme.font)
    root.style.setProperty('--font-display', fontOpt.family)
    root.style.setProperty('--font-scale', String(theme.fontScale))

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
    } catch {
      /* storage unavailable — theme still applies for the session */
    }
  }, [theme])

  const applyPalette = useCallback(
    (name) => setTheme((t) => ({ ...t, palette: name, customAccent: null, customAccent2: null })),
    [],
  )
  const setCustomAccent = useCallback(
    (customAccent) => setTheme((t) => ({ ...t, customAccent })),
    [],
  )
  const setCustomAccent2 = useCallback(
    (customAccent2) => setTheme((t) => ({ ...t, customAccent2 })),
    [],
  )
  const setFont = useCallback((font) => setTheme((t) => ({ ...t, font })), [])
  const setFontScale = useCallback((fontScale) => setTheme((t) => ({ ...t, fontScale })), [])
  const toggleBlock = useCallback(
    (id) =>
      setTheme((t) => ({
        ...t,
        hiddenBlocks: t.hiddenBlocks.includes(id)
          ? t.hiddenBlocks.filter((b) => b !== id)
          : [...t.hiddenBlocks, id],
      })),
    [],
  )
  const reset = useCallback(() => setTheme(DEFAULT_THEME), [])

  const value = useMemo(
    () => ({
      theme,
      applyPalette,
      setCustomAccent,
      setCustomAccent2,
      setFont,
      setFontScale,
      toggleBlock,
      reset,
    }),
    [theme, applyPalette, setCustomAccent, setCustomAccent2, setFont, setFontScale, toggleBlock, reset],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
