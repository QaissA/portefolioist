import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { VILLAGE_CONTENT } from './villageContent'

// Local-space house spots — kept off the central corridor (|x| >= 6) so the
// road from entry to exit stays clear.
const HOUSES = [
  { x: -8.5, z: -5 },
  { x: -9.5, z: 2 },
  { x: -7, z: 8 },
  { x: 8.5, z: -6 },
  { x: 9.5, z: 1 },
  { x: 7, z: 7.5 },
]

function House({ x, z, color }) {
  const facing = x < 0 ? Math.PI / 2 : -Math.PI / 2 // door faces the road
  return (
    <group position={[x, 0, z]} rotation={[0, facing, 0]}>
      <mesh castShadow position={[0, 1, 0]}>
        <boxGeometry args={[2.4, 2, 2.4]} />
        <meshStandardMaterial color="#e8e2d5" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 2.55, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.0, 1.4, 4]} />
        <meshStandardMaterial color={color} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 0.85, 1.21]}>
        <boxGeometry args={[0.7, 1.2, 0.06]} />
        <meshStandardMaterial color="#5b4327" />
      </mesh>
    </group>
  )
}

function Gate({ z, color, label, faceAngle, active }) {
  return (
    <group position={[0, 0, z]}>
      {[-3.6, 3.6].map((x) => (
        <mesh key={x} castShadow position={[x, 2.2, 0]}>
          <boxGeometry args={[0.6, 4.4, 0.6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={active ? 0.8 : 0.4}
            roughness={0.5}
          />
        </mesh>
      ))}
      <mesh castShadow position={[0, 4.7, 0]}>
        <boxGeometry args={[8, 0.8, 0.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.6 : 0.3} />
      </mesh>
      <Text
        position={[0, 4.7, faceAngle === 0 ? 0.45 : -0.45]}
        rotation={[0, faceAngle, 0]}
        fontSize={label.length > 6 ? 1 : 1.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
        maxWidth={7.2}
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
        <mesh key={px} castShadow position={[px, 1.6, 0]}>
          <boxGeometry args={[0.4, 3.2, 0.4]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
        </mesh>
      ))}
      {/* colored frame */}
      <mesh castShadow position={[0, 5, -0.12]}>
        <boxGeometry args={[8.7, 5.2, 0.25]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* dark board face */}
      <mesh position={[0, 5, 0.02]}>
        <boxGeometry args={[8.1, 4.6, 0.3]} />
        <meshStandardMaterial color="#141414" roughness={0.6} />
      </mesh>
      <Text
        position={[0, 6.55, 0.22]}
        fontSize={0.62}
        color={color}
        anchorX="center"
        anchorY="middle"
        maxWidth={7.4}
        textAlign="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {title}
      </Text>
      <Text
        position={[0, 4.55, 0.22]}
        fontSize={0.52}
        color="#f2f2f2"
        anchorX="center"
        anchorY="middle"
        maxWidth={7.4}
        textAlign="center"
        lineHeight={1.5}
        outlineWidth={0.015}
        outlineColor="#000000"
      >
        {lines.join('\n')}
      </Text>
    </group>
  )
}

/**
 * A "little village" for one portfolio section. Built in local space (drive
 * axis = local Z) then yaw-rotated so the entry faces the world origin, i.e.
 * the car drives in through the entry arch and out the exit. Section info sits
 * on the left/right roadside billboards as 3D text; the section number floats
 * over the plaza as a landmark.
 */
export default function Village({ station, active }) {
  const ring = useRef()
  const content = VILLAGE_CONTENT[station.id]
  const color = station.color
  const [px, , pz] = station.position

  // yaw so local +Z points away from the origin (exit side); entry is at -Z.
  const angle = Math.atan2(px, pz)

  useFrame((frame) => {
    if (ring.current) ring.current.rotation.z = frame.clock.elapsedTime * 0.25
  })

  return (
    <group position={station.position} rotation={[0, angle, 0]}>
      {/* plaza disc + rotating perimeter ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[12, 60]} />
        <meshStandardMaterial color="#6b6250" roughness={1} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[11.4, 12, 64]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 1 : 0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* road strip from entry to exit */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[6, 28]} />
        <meshStandardMaterial color="#2f2b26" roughness={1} />
      </mesh>

      <Gate z={-12} color={color} label={content.banner} faceAngle={Math.PI} active={active} />
      <Gate z={12} color={color} label="EXIT ▸" faceAngle={0} active={active} />

      {HOUSES.map((h, i) => (
        <House key={i} x={h.x} z={h.z} color={color} />
      ))}

      <Billboard side={-1} color={color} title={content.left.title} lines={content.left.lines} />
      <Billboard side={1} color={color} title={content.right.title} lines={content.right.lines} />

      {/* floating landmark number over the plaza */}
      <Float speed={2} floatIntensity={1.2} rotationIntensity={0.5}>
        <Text
          position={[0, 8, 0]}
          fontSize={3.2}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.06}
          outlineColor="#000000"
          outlineOpacity={0.4}
        >
          {content.monument}
        </Text>
      </Float>

      <pointLight position={[0, 4, 0]} color={color} intensity={active ? 14 : 6} distance={22} />
    </group>
  )
}
