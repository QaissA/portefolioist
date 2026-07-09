// Arcade modes selectable from the Drive Mode HUD. `explore` is the default
// free-roam (no game overlay); the rest each mount a component in GameLayer.
export const GAME_MODES = [
  { id: 'explore', label: 'Explore', icon: '🧭', hint: 'Free roam — visit the villages' },
  { id: 'timetrial', label: 'Time Trial', icon: '⏱️', hint: 'Hit all 5 villages, fastest time' },
  { id: 'collect', label: 'Collect', icon: '💎', hint: 'Grab every floating token' },
  { id: 'drift', label: 'Drift', icon: '🏎️', hint: 'Hold SPACE to drift — chain combos' },
  { id: 'chase', label: 'Bowling', icon: '🎳', hint: 'Bump the wanderers for points' },
]

export const GAME_META = Object.fromEntries(GAME_MODES.map((m) => [m.id, m]))
