import TimeTrial from './TimeTrial'
import Collectibles from './Collectibles'
import DriftScore from './DriftScore'
import Pedestrians from './Pedestrians'

// Mounts the active game's in-scene objects/logic. Keyed by runId so a
// "restart" fully resets the game by remounting it. Reads the shared car pose
// (posRef) and writes HUD values into gameRef.
export default function GameLayer({ mode, runId, posRef, gameRef }) {
  const props = { posRef, gameRef, key: runId }
  if (mode === 'timetrial') return <TimeTrial {...props} />
  if (mode === 'collect') return <Collectibles {...props} />
  if (mode === 'drift') return <DriftScore {...props} />
  if (mode === 'chase') return <Pedestrians {...props} />
  return null
}
