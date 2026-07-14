import { CONTENT } from '@/utils/constants'

// Arcade modes selectable from the Drive Mode HUD. `explore` is the default
// free-roam (no game overlay); the rest each mount a component in GameLayer.
// Text/labels live in src/content/content.json (driveMode.gameModes).
export const GAME_MODES = CONTENT.driveMode.gameModes

export const GAME_META = Object.fromEntries(GAME_MODES.map((m) => [m.id, m]))
