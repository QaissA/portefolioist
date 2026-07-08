import { useEffect, useState } from 'react'
import { useTheme } from '@/theme/ThemeContext'
import {
  BLOCKS,
  FONT_OPTIONS,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  THEMES,
  hexToRgbChannels,
  preloadAllFonts,
  resolveAccents,
  rgbChannelsToHex,
} from '@/theme/themeConfig'

function Row({ label, children }) {
  return (
    <div className="mb-6">
      <p className="section-label mb-3">{label}</p>
      {children}
    </div>
  )
}

export default function ThemePanel() {
  const {
    theme,
    applyPalette,
    setCustomAccent,
    setCustomAccent2,
    setFont,
    setFontScale,
    toggleBlock,
    reset,
  } = useTheme()
  const [open, setOpen] = useState(false)
  const { accent, accent2 } = resolveAccents(theme)

  // Load all preview fonts + close on Escape while open
  useEffect(() => {
    if (!open) return
    preloadAllFonts()
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {/* Floating gear toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open theme settings"
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[9000] flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/90 text-amber backdrop-blur transition-colors duration-200 hover:border-amber/60"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-500 ${open ? 'rotate-90' : ''}`}
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[9050] bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Theme configuration"
        data-lenis-prevent
        className={`fixed right-0 top-0 z-[9100] h-full w-[340px] max-w-[85vw] overflow-y-auto border-l border-border bg-surface/95 backdrop-blur-md transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-mono text-sm tracking-wider text-amber">{'> theme'}</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close theme settings"
            className="font-mono text-xs text-text-muted transition-colors hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-6">
          {/* Palette */}
          <Row label="// palette">
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => {
                const active = theme.palette === t.name
                const c = t.colors
                return (
                  <button
                    key={t.name}
                    onClick={() => applyPalette(t.name)}
                    className={`group flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors duration-150 ${
                      active ? 'border-amber' : 'border-border hover:border-amber/40'
                    }`}
                    style={{ backgroundColor: `rgb(${c.surface})` }}
                    aria-label={`Palette ${t.name}`}
                    aria-pressed={active}
                  >
                    <div className="flex items-center gap-1">
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: `rgb(${c.accent})` }} />
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: `rgb(${c.accent2})` }} />
                      <span
                        className="ml-auto h-4 w-4 rounded-sm border"
                        style={{ backgroundColor: `rgb(${c.bg})`, borderColor: `rgb(${c.border})` }}
                      />
                    </div>
                    <span
                      className="font-mono text-[11px] tracking-wide"
                      style={{ color: `rgb(${c.textPrimary})` }}
                    >
                      {t.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </Row>

          {/* Custom accents */}
          <Row label="// custom colors">
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 hover:border-amber/40">
                <span className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: `rgb(${accent})` }} />
                <span className="font-mono text-xs text-text-secondary">Primary</span>
                <input
                  type="color"
                  value={rgbChannelsToHex(accent)}
                  onChange={(e) => {
                    const ch = hexToRgbChannels(e.target.value)
                    if (ch) setCustomAccent(ch)
                  }}
                  className="ml-auto h-5 w-5 cursor-pointer bg-transparent"
                  aria-label="Custom primary color"
                />
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 hover:border-amber/40">
                <span className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: `rgb(${accent2})` }} />
                <span className="font-mono text-xs text-text-secondary">Second</span>
                <input
                  type="color"
                  value={rgbChannelsToHex(accent2)}
                  onChange={(e) => {
                    const ch = hexToRgbChannels(e.target.value)
                    if (ch) setCustomAccent2(ch)
                  }}
                  className="ml-auto h-5 w-5 cursor-pointer bg-transparent"
                  aria-label="Custom secondary color"
                />
              </label>
            </div>
          </Row>

          {/* Font family */}
          <Row label="// font">
            <div className="flex flex-col gap-1.5">
              {FONT_OPTIONS.map((f) => {
                const active = theme.font === f.label
                return (
                  <button
                    key={f.label}
                    onClick={() => setFont(f.label)}
                    className={`flex items-baseline justify-between rounded-md border px-3 py-2 text-left transition-colors duration-150 ${
                      active
                        ? 'border-amber/60 bg-amber/10 text-text-primary'
                        : 'border-border text-text-secondary hover:border-amber/30 hover:text-text-primary'
                    }`}
                  >
                    <span className="text-lg" style={{ fontFamily: f.family }}>
                      {f.label}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">Aa</span>
                  </button>
                )
              })}
            </div>
          </Row>

          {/* Font size */}
          <Row label={`// text size — ${Math.round(theme.fontScale * 100)}%`}>
            <input
              type="range"
              min={FONT_SCALE_MIN}
              max={FONT_SCALE_MAX}
              step={0.05}
              value={theme.fontScale}
              onChange={(e) => setFontScale(Number(e.target.value))}
              className="w-full accent-amber"
              aria-label="Text size"
            />
          </Row>

          {/* Blocks */}
          <Row label="// sections">
            <div className="flex flex-col gap-1">
              {BLOCKS.map((b) => {
                const visible = !theme.hiddenBlocks.includes(b.id)
                return (
                  <label
                    key={b.id}
                    className={`flex items-center gap-3 rounded-md px-2 py-1.5 font-mono text-sm ${
                      b.hideable ? 'cursor-pointer hover:bg-surface-2' : 'opacity-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={visible}
                      disabled={!b.hideable}
                      onChange={() => toggleBlock(b.id)}
                      className="h-4 w-4 accent-amber"
                    />
                    <span className={visible ? 'text-text-primary' : 'text-text-muted'}>
                      {b.label}
                    </span>
                    {!b.hideable && (
                      <span className="ml-auto text-[10px] text-text-muted">locked</span>
                    )}
                  </label>
                )
              })}
            </div>
          </Row>

          <button
            onClick={reset}
            className="mt-2 w-full rounded-md border border-border py-2.5 font-mono text-xs text-text-secondary transition-colors duration-150 hover:border-amber/40 hover:text-amber"
          >
            Reset to defaults
          </button>
        </div>
      </aside>
    </>
  )
}
