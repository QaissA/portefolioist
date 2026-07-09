// The five drivable stations in the open world. Each maps to a slice of the
// portfolio (rendered by ContentPanel). `position` is [x, y, z] on the ground
// plane; `color` is a vivid accent that reads well across every theme.
export const STATIONS = [
  { id: 'profile', number: '01', title: 'Profile', color: '#F59E0B', position: [0, 0, -34] },
  { id: 'skills', number: '02', title: 'Skills', color: '#0EA5E9', position: [-40, 0, -2] },
  { id: 'experience', number: '03', title: 'Impact', color: '#10B981', position: [40, 0, -2] },
  { id: 'work', number: '04', title: 'Experience', color: '#8B5CF6', position: [-26, 0, 40] },
  { id: 'projects', number: '05', title: 'Projects', color: '#F43F5E', position: [26, 0, 40] },
]

// How close (world units) the car must be to "arrive" at a village — roughly
// as it passes through the entry arch.
export const ARRIVE_RADIUS = 13

// Bounds of the drivable world (car clamps here).
export const WORLD_BOUND = 150
