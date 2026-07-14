import { CONTENT } from '@/utils/constants'

// The five drivable stations in the open world. Each maps to a slice of the
// portfolio (rendered by ContentPanel). `position` is [x, y, z] on the ground
// plane; `color` is a vivid accent that reads well across every theme.
// Titles/numbers/colors/positions live in src/content/content.json
// (driveMode.stations).
export const STATIONS = CONTENT.driveMode.stations

// How close (world units) the car must be to "arrive" at a village — roughly
// as it passes through the entry arch.
export const ARRIVE_RADIUS = 13

// Bounds of the drivable world (car clamps here).
export const WORLD_BOUND = 150
