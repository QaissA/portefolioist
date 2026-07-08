// Single source of truth for the theme configuration panel.
// Colors are stored as space-separated RGB channel strings ("245 158 11")
// so they can feed `rgb(var(--x) / <alpha-value>)` in tailwind.config.js.

export const STORAGE_KEY = 'portfolio-theme'

// Full palettes. Each swaps the WHOLE surface — background, panels, borders,
// text — plus two theme-driving accent colors (accent = primary, accent2 =
// secondary). Covers dark, light, bubbly and vibrant looks.
export const THEMES = [
  {
    name: 'Midnight',
    mode: 'dark',
    colors: {
      bg: '10 10 10',
      surface: '17 17 17',
      surface2: '26 26 26',
      border: '42 42 42',
      accent: '245 158 11', // amber
      accent2: '236 72 153', // pink
      textPrimary: '245 245 245',
      textSecondary: '161 161 170',
      textMuted: '82 82 91',
    },
  },
  {
    name: 'Daylight',
    mode: 'light',
    colors: {
      bg: '250 250 249',
      surface: '255 255 255',
      surface2: '241 245 249',
      border: '214 211 209',
      accent: '234 88 12', // orange-600
      accent2: '37 99 235', // blue-600
      textPrimary: '24 24 27',
      textSecondary: '82 82 91',
      textMuted: '148 148 158',
    },
  },
  {
    name: 'Bubblegum',
    mode: 'light',
    colors: {
      bg: '253 242 248',
      surface: '255 255 255',
      surface2: '252 231 243',
      border: '251 207 232',
      accent: '236 72 153', // pink
      accent2: '14 165 233', // sky
      textPrimary: '76 20 55',
      textSecondary: '157 23 77',
      textMuted: '201 120 160',
    },
  },
  {
    name: 'Neon',
    mode: 'dark',
    colors: {
      bg: '8 8 20',
      surface: '15 15 35',
      surface2: '25 25 55',
      border: '48 48 92',
      accent: '34 211 238', // cyan
      accent2: '217 70 239', // fuchsia
      textPrimary: '236 240 255',
      textSecondary: '165 180 230',
      textMuted: '104 114 168',
    },
  },
  {
    name: 'Sunset',
    mode: 'dark',
    colors: {
      bg: '22 11 16',
      surface: '32 16 23',
      surface2: '48 24 35',
      border: '74 38 54',
      accent: '251 146 60', // orange
      accent2: '244 63 94', // rose
      textPrimary: '255 245 240',
      textSecondary: '223 183 178',
      textMuted: '158 116 116',
    },
  },
]

export const DEFAULT_THEME = {
  palette: 'Midnight',
  customAccent: null, // channel string overriding the palette's primary accent
  customAccent2: null, // channel string overriding the palette's secondary accent
  font: 'Space Grotesk',
  fontScale: 1,
  hiddenBlocks: [],
}

export function getPalette(name) {
  return THEMES.find((t) => t.name === name) || THEMES[0]
}

// Resolve the active accent colors given a stored theme (palette + overrides).
export function resolveAccents(theme) {
  const base = getPalette(theme.palette).colors
  return {
    accent: theme.customAccent || base.accent,
    accent2: theme.customAccent2 || base.accent2,
  }
}

// Distinctive display fonts (Google Fonts). `googleParam` is the css2
// `family=` fragment used to lazily inject a stylesheet. Space Grotesk ships
// in index.html already. These only affect headings/body; mono stays JetBrains.
export const FONT_OPTIONS = [
  { label: 'Space Grotesk', family: "'Space Grotesk', sans-serif", googleParam: null },
  { label: 'Syne', family: "'Syne', sans-serif", googleParam: 'Syne:wght@400;500;600;700;800' },
  { label: 'Unbounded', family: "'Unbounded', sans-serif", googleParam: 'Unbounded:wght@300;400;500;600;700' },
  { label: 'Bricolage', family: "'Bricolage Grotesque', sans-serif", googleParam: 'Bricolage+Grotesque:opsz,wght@12..96,300..800' },
  { label: 'Fraunces', family: "'Fraunces', serif", googleParam: 'Fraunces:ital,opsz,wght@0,9..144,400..700' },
  { label: 'Instrument', family: "'Instrument Serif', serif", googleParam: 'Instrument+Serif:ital@0;1' },
]

export const FONT_SCALE_MIN = 0.85
export const FONT_SCALE_MAX = 1.2

// Ordered landing-page blocks. `id` mirrors the section ids used by Navbar/App.
// `hideable: false` blocks (Hero) always render.
export const BLOCKS = [
  { id: 'hero', label: 'Hero', hideable: false },
  { id: 'about', label: 'About', hideable: true },
  { id: 'skills', label: 'Skills', hideable: true },
  { id: 'achievements', label: 'Impact', hideable: true },
  { id: 'timeline', label: 'Experience', hideable: true },
  { id: 'ai-section', label: 'AI Engineering', hideable: true },
  { id: 'contact', label: 'Contact', hideable: true },
]

// --- Font loading --------------------------------------------------------

export function ensureFontLoaded(fontLabel) {
  const opt = FONT_OPTIONS.find((f) => f.label === fontLabel)
  if (!opt || !opt.googleParam) return
  const id = `theme-font-${opt.googleParam.replace(/[^a-z0-9]/gi, '')}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${opt.googleParam}&display=swap`
  document.head.appendChild(link)
}

// Load every optional font — used so the panel can preview each in its own face.
export function preloadAllFonts() {
  FONT_OPTIONS.forEach((f) => ensureFontLoaded(f.label))
}

// --- Color helpers -------------------------------------------------------

const clamp = (n) => Math.max(0, Math.min(255, n))

export function hexToRgbChannels(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!m) return null
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  return `${r} ${g} ${b}`
}

export function rgbChannelsToHex(channels) {
  const [r, g, b] = channels.trim().split(/\s+/).map(Number)
  const to2 = (n) => clamp(n).toString(16).padStart(2, '0')
  return `#${to2(r)}${to2(g)}${to2(b)}`
}

// Scale each channel toward white (amount > 0) or black (amount < 0).
export function shade(channels, amount) {
  const [r, g, b] = channels.trim().split(/\s+/).map(Number)
  const mix = (c) => (amount >= 0 ? c + (255 - c) * amount : c * (1 + amount))
  return `${clamp(Math.round(mix(r)))} ${clamp(Math.round(mix(g)))} ${clamp(Math.round(mix(b)))}`
}
