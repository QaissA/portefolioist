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

// Fence radius of each village (houses, streets, gates sit inside it).
export const VILLAGE_RADIUS = 22

// Bounds of the drivable world (car clamps here).
export const WORLD_BOUND = 150

// Meshes the car rides on (Landscape's flattened ground + hills), filled when the model loads.
export const terrain = []

// Solid scenery footprints the car bumps off: { x, z, r } circles, registered by EnvModel's `solid` prop.
export const colliders = []

export const CARS_DIR = '/models/cars/GLB%20format/'
// drivable models from the Kenney car kit (debris/wheels/cones left out)
export const CARS = [
  'sedan-sports', 'sedan', 'hatchback-sports', 'race', 'race-future', 'suv', 'suv-luxury', 'taxi', 'police',
  'ambulance', 'firetruck', 'van', 'delivery', 'delivery-flat', 'truck', 'truck-flat', 'garbage-truck',
  'tractor', 'tractor-police', 'tractor-shovel', 'kart-oobi', 'kart-oodi', 'kart-ooli', 'kart-oopi', 'kart-oozi',
]
export const DEFAULT_CAR = CARS[0]
