import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { VILLAGE_CONTENT } from './villageContent'
import { EnvModel } from './Landscape'
import { VILLAGE_RADIUS } from './stations'

// Local-space layout (drive axis = local Z, entry gate at -Z, exit at +Z):
// a main road through the gates, two cross streets at z = ±STREET_Z, and
// houses facing the streets. The billboards sit beside the main road between
// the cross streets.
const HOUSES_DIR = '/models/houses/GLB%20format/'
const BUILDINGS = 'abcdefghijklmnopqrstu'.split('').map((c) => `building-type-${c}`)
const HOUSE_SCALE = 3
const STREET_Z = 10
const GATE_Z = VILLAGE_RADIUS - 1

// low-poly kit palette for signs (village colour only as an accent)
const WOOD = '#6e4b2e'
const PAPER = '#efe4cc'
const INK = '#3b2a1c'

// Iron-fence ring around the village, with a gap where the main road runs out.
const FENCE_SCALE = 2.4
const FENCE = (() => {
  const n = Math.round((2 * Math.PI * VILLAGE_RADIUS) / FENCE_SCALE)
  const out = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const x = Math.sin(a) * VILLAGE_RADIUS
    if (Math.abs(x) < 4.5) continue // road gap
    out.push({ x, z: Math.cos(a) * VILLAGE_RADIUS, rot: a + Math.PI }) // model's offset side faces out
  }
  return out
})()

// Road tiles: driveway-long (0.36 x 0.4) stretched flat (y scale 1). Main road
// is 6 wide, fence to fence; cross streets are 4 wide, main road to |x| = 19.
const MAIN_TILES = Array.from({ length: 8 }, (_, i) => -VILLAGE_RADIUS + 2.75 + i * 5.5)
const MAIN_SCALE = [6 / 0.36, 1, 5.5 / 0.4]
const CROSS_TILES = [-17, -13, -9, -5, 5, 9, 13, 17].flatMap((x) => [-STREET_Z, STREET_Z].map((z) => ({ x, z })))
const CROSS_SCALE = [4 / 0.36, 1, 4 / 0.4]

// Houses: rot points the model's door (+Z) at the street it sits on.
const HOUSES = [
  // outer rows, behind each cross street
  ...[-13, -7.5, 7.5, 13].flatMap((x) => [
    { x, z: STREET_Z + 4.5, rot: Math.PI },
    { x, z: -STREET_Z - 4.5, rot: 0 },
  ]),
  // inner rows, between the cross streets (clear of the billboards' sight line)
  ...[-16.5, -7.5, 7.5, 16.5].flatMap((x) => [
    { x, z: STREET_Z - 4.5, rot: 0 },
    { x, z: -STREET_Z + 4.5, rot: Math.PI },
  ]),
]

const LIGHTS = [-16, -4, 4, 16].flatMap((z) => [-3.9, 3.9].map((x) => ({ x, z })))
const TREES = [
  ...[-10.25, 10.25].flatMap((x) => [-17.5, 17.5].map((z) => ({ x, z }))),
  ...[-19, 19].flatMap((x) => [-1.5, 1.5].map((z) => ({ x, z }))),
]

function House({ x, z, rot, name }) {
  return (
    <>
      <EnvModel dir={HOUSES_DIR} name={name} position={[x, 0, z]} rotation-y={rot} scale={HOUSE_SCALE} solid={0.8} />
      {/* stepping-stone path from the door out to the street */}
      <EnvModel
        dir={HOUSES_DIR}
        name="path-stones-long"
        position={[x + Math.sin(rot) * 2.3, 0.02, z + Math.cos(rot) * 2.3]}
        rotation-y={rot}
        scale={[10, 1, 5]}
      />
    </>
  )
}

function Gate({ z, color, label, faceAngle, active }) {
  const front = faceAngle === 0 ? 0.13 : -0.13
  return (
    <group position={[0, 0, z]}>
      {[-3.8, 3.8].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <EnvModel name="column-large" scale={4} solid={0.9} />
          <EnvModel name="lantern-glass" position={[0, 4.52, 0]} scale={3} />
        </group>
      ))}
      {/* wooden crossbeam + painted sign with a strip of the village colour */}
      <mesh position={[0, 4.0, 0]}>
        <boxGeometry args={[8.4, 0.45, 0.5]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 4.95, 0]}>
        <boxGeometry args={[6.4, 1.45, 0.2]} />
        <meshStandardMaterial color={PAPER} roughness={0.9} />
      </mesh>
      <mesh position={[0, 5.75, 0]}>
        <boxGeometry args={[6.6, 0.22, 0.26]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.5 : 0} />
      </mesh>
      <Text
        position={[0, 4.92, front]}
        rotation={[0, faceAngle, 0]}
        fontSize={label.length > 6 ? 0.8 : 1}
        color={INK}
        anchorX="center"
        anchorY="middle"
        maxWidth={6}
      >
        {label}
      </Text>
    </group>
  )
}

function Billboard({ side, color, title, lines }) {
  const ry = side < 0 ? Math.PI / 2 : -Math.PI / 2 // face the road
  return (
    <group position={[side * 13, 0, 0]} rotation={[0, ry, 0]}>
      {[-3, 3].map((px) => (
        <mesh key={px} position={[px, 1.6, -0.1]}>
          <boxGeometry args={[0.45, 3.2, 0.45]} />
          <meshStandardMaterial color={WOOD} roughness={0.9} flatShading />
        </mesh>
      ))}
      {/* wooden frame, paper board, coloured header band */}
      <mesh position={[0, 5, -0.12]}>
        <boxGeometry args={[8.7, 5.2, 0.25]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 5, 0.02]}>
        <boxGeometry args={[8.1, 4.6, 0.3]} />
        <meshStandardMaterial color={PAPER} roughness={0.9} />
      </mesh>
      <mesh position={[0, 6.62, 0.04]}>
        <boxGeometry args={[8.1, 0.95, 0.32]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <Text
        position={[0, 6.6, 0.22]}
        fontSize={0.55}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={7.6}
        textAlign="center"
      >
        {title}
      </Text>
      <Text
        position={[0, 4.4, 0.22]}
        fontSize={0.5}
        color={INK}
        anchorX="center"
        anchorY="middle"
        maxWidth={7.4}
        textAlign="center"
        lineHeight={1.5}
      >
        {lines.join('\n')}
      </Text>
    </group>
  )
}

/**
 * A "little village" for one portfolio section. Built in local space (drive
 * axis = local Z) then yaw-rotated so the entry faces the world origin, i.e.
 * the car drives in through the entry gate and out the exit. Section info sits
 * on the left/right roadside billboards as 3D text; the section number floats
 * over the centre as a landmark.
 */
export default function Village({ station, active }) {
  const content = VILLAGE_CONTENT[station.id]
  const color = station.color
  const [px, , pz] = station.position
  // stable per-village building mix (step 5 is coprime with 21, so no repeats within a village)
  const seed = [...station.id].reduce((n, ch) => n + ch.charCodeAt(0), 0)

  // yaw so local +Z points away from the origin (exit side); entry is at -Z.
  const angle = Math.atan2(px, pz)

  return (
    <group position={station.position} rotation={[0, angle, 0]}>
      {/* village ground + village-colour ring just outside the fence */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[VILLAGE_RADIUS, 64]} />
        <meshStandardMaterial color="#7f8f52" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[VILLAGE_RADIUS + 0.6, VILLAGE_RADIUS + 1.3, 72]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 1 : 0.55} side={THREE.DoubleSide} />
      </mesh>

      {MAIN_TILES.map((z) => (
        <EnvModel key={`m${z}`} dir={HOUSES_DIR} name="driveway-long" position={[0, 0.03, z]} scale={MAIN_SCALE} />
      ))}
      {CROSS_TILES.map((t) => (
        <EnvModel
          key={`c${t.x},${t.z}`}
          dir={HOUSES_DIR}
          name="driveway-long"
          position={[t.x, 0.03, t.z]}
          rotation-y={Math.PI / 2}
          scale={CROSS_SCALE}
        />
      ))}

      {FENCE.map((f, i) => (
        <EnvModel
          key={i}
          name="iron-fence-border"
          position={[f.x, 0, f.z]}
          rotation-y={f.rot}
          scale={FENCE_SCALE}
          solid={0.6}
        />
      ))}

      <Gate z={-GATE_Z} color={color} label={content.banner} faceAngle={Math.PI} active={active} />
      <Gate z={GATE_Z} color={color} label="EXIT ▸" faceAngle={0} active={active} />

      {HOUSES.map((h, i) => (
        <House key={i} {...h} name={BUILDINGS[(seed + i * 5) % BUILDINGS.length]} />
      ))}
      {LIGHTS.map((l, i) => (
        <EnvModel key={`l${i}`} name="lightpost-double" position={[l.x, 0, l.z]} scale={3} solid={0.25} />
      ))}
      {TREES.map((t, i) => (
        <EnvModel
          key={`t${i}`}
          dir={HOUSES_DIR}
          name={i % 2 ? 'tree-small' : 'tree-large'}
          position={[t.x, 0, t.z]}
          scale={5}
          solid={0.3}
        />
      ))}
      {[-4.6, 4.6].map((x) => (
        <EnvModel
          key={`b${x}`}
          name="bench"
          position={[x, 0, 0]}
          rotation-y={x < 0 ? Math.PI / 2 : -Math.PI / 2}
          scale={2.5}
          solid={0.6}
        />
      ))}

      <Billboard side={-1} color={color} title={content.left.title} lines={content.left.lines} />
      <Billboard side={1} color={color} title={content.right.title} lines={content.right.lines} />

      {/* floating landmark number over the centre */}
      <Float speed={2} floatIntensity={1.2} rotationIntensity={0.5}>
        <Text
          position={[0, 8, 0]}
          fontSize={3.2}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.06}
          outlineColor="#2a1d12"
        >
          {content.monument}
        </Text>
      </Float>

      <pointLight position={[0, 4, 0]} color={color} intensity={active ? 14 : 6} distance={22} />
    </group>
  )
}
