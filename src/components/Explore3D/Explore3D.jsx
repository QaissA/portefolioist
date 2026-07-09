import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid, Sky } from '@react-three/drei'
import Car from './Car'
import Smoke from './Smoke'
import Village from './Village'
import Landscape from './Landscape'
import ContentPanel from './ContentPanel'
import Minimap from './Minimap'
import GameLayer from './games/GameLayer'
import GameHUD3D from './games/GameHUD3D'
import { STATIONS } from './stations'

// Read a "R G B" CSS custom property → "#rrggbb" so the 3D scene tracks the
// active theme (amber / neon / bubblegum …).
function cssHex(name, fallback) {
  if (typeof window === 'undefined') return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const parts = raw.split(/\s+/).map(Number)
  if (parts.length < 3 || parts.some(Number.isNaN)) return fallback
  return '#' + parts.slice(0, 3).map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('')
}

function readThemeColors() {
  return {
    bg: cssHex('--color-bg', '#0a0a0a'),
    surface: cssHex('--color-surface', '#111111'),
    ground: cssHex('--color-surface-2', '#1a1a1a'),
    border: cssHex('--color-border', '#2a2a2a'),
    accent: cssHex('--color-accent', '#f59e0b'),
    textMuted: cssHex('--color-text-muted', '#52525b'),
  }
}

function Scene({ colors, onActiveChange, posRef, active, mode, runId, gameRef }) {
  return (
    <>
      <color attach="background" args={['#bcdcef']} />
      <fog attach="fog" args={['#c9e2ee', 70, 210]} />
      <Sky
        sunPosition={[80, 45, 60]}
        turbidity={5}
        rayleigh={1.4}
        mieCoefficient={0.006}
        mieDirectionalG={0.85}
      />

      {/* Shadows are intentionally OFF: compiling every material's shadow-depth
          variant on the first frame stalled the GPU long enough to trip
          Windows' driver timeout (TDR) → a lost context / blank screen. Flat
          low-poly forms read fine without them. */}
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#cfeaff', '#3f6b34', 0.85]} />
      <directionalLight position={[80, 60, 40]} intensity={1.6} color="#fff3d6" />

      {/* grass ground (receives shadows) + a faint grass grid for motion feedback */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[1200, 1200]} />
        <meshStandardMaterial color="#4b7a37" roughness={1} metalness={0} />
      </mesh>
      <Grid
        position={[0, 0.0, 0]}
        args={[600, 600]}
        cellSize={3}
        cellThickness={0.5}
        cellColor="#3d6630"
        sectionSize={15}
        sectionThickness={1}
        sectionColor="#5c9147"
        fadeDistance={120}
        fadeStrength={2}
        followCamera={false}
        infiniteGrid
      />

      <Landscape />

      {STATIONS.map((s) => (
        <Village key={s.id} station={s} active={active === s.id} />
      ))}

      <Car bodyColor={colors.accent} onActiveChange={onActiveChange} posRef={posRef} />
      <Smoke poseRef={posRef} />
      <GameLayer mode={mode} runId={runId} posRef={posRef} gameRef={gameRef} />
    </>
  )
}

export default function Explore3D({ onExit }) {
  const [active, setActive] = useState(null)
  const [glKey, setGlKey] = useState(0) // bump to rebuild the canvas on a fresh context
  const [mode, setMode] = useState('explore') // active arcade game
  const [runId, setRunId] = useState(0) // bump to restart the current game
  const recoveries = useRef(0)
  const posRef = useRef({ x: 0, z: 16, heading: Math.PI })
  const gameRef = useRef({ primary: '', secondary: '', flash: '', done: false })
  const colors = useMemo(() => readThemeColors(), [])

  // lock the page behind us while driving, and pause the background Hero
  // WebGL scene so two heavy 3D contexts don't fight over the GPU (which was
  // causing "Context Lost").
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.dispatchEvent(new Event('drivemode:on'))
    return () => {
      document.body.style.overflow = prev
      window.dispatchEvent(new Event('drivemode:off'))
    }
  }, [])

  // Esc leaves the scene
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit])

  return (
    <div className="fixed inset-0 z-[10000]" style={{ background: '#bcdcef' }}>
      <Canvas
        key={glKey}
        dpr={[1, 1.5]}
        camera={{ position: [0, 6, 28], fov: 55, near: 0.1, far: 400 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            'webglcontextlost',
            (e) => {
              // Don't let the browser give up on the context; then rebuild the
              // whole canvas on a fresh one — this automates the "exit & re-enter
              // fixes it" recovery. Capped so a truly broken GPU can't loop.
              e.preventDefault()
              if (recoveries.current < 3) {
                recoveries.current += 1
                setTimeout(() => setGlKey((k) => k + 1), 350)
              }
            },
            false,
          )
        }}
      >
        <Scene
          colors={colors}
          onActiveChange={setActive}
          posRef={posRef}
          active={active}
          mode={mode}
          runId={runId}
          gameRef={gameRef}
        />
      </Canvas>

      {/* ── HUD ─────────────────────────────────────────────── */}

      {/* title + exit */}
      <div className="pointer-events-none fixed left-4 top-4 z-[10020] flex items-center gap-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-surface/85 px-4 py-2 backdrop-blur">
          <span className="text-amber">◈</span>
          <span className="font-mono text-xs tracking-wide text-text-primary">DRIVE MODE</span>
        </div>
        <button
          onClick={onExit}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-surface/85 px-4 py-2 font-mono text-xs text-text-secondary backdrop-blur transition-colors hover:border-amber/60 hover:text-text-primary"
        >
          EXIT
          <kbd className="rounded border border-border px-1 py-0.5 text-[10px] text-text-muted">ESC</kbd>
        </button>
      </div>

      <Minimap posRef={posRef} active={active} />

      <GameHUD3D mode={mode} setMode={setMode} runId={runId} setRunId={setRunId} gameRef={gameRef} />

      {/* villages' content panels only in free-roam, so games stay uncluttered */}
      <ContentPanel active={mode === 'explore' ? active : null} />

      {/* controls hint — fades once the driver reaches the first station */}
      <div
        className={`pointer-events-none fixed bottom-4 left-1/2 z-[10020] -translate-x-1/2 transition-opacity duration-500 ${
          active ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-4 rounded-full border border-border bg-surface/85 px-5 py-2.5 backdrop-blur">
          <div className="flex items-center gap-1.5">
            {['W', 'A', 'S', 'D'].map((k) => (
              <kbd
                key={k}
                className="flex h-6 w-6 items-center justify-center rounded border border-border font-mono text-[11px] text-text-primary"
              >
                {k}
              </kbd>
            ))}
            <span className="mx-1 text-text-muted">+</span>
            <kbd className="flex h-6 items-center justify-center rounded border border-border px-2 font-mono text-[11px] text-text-primary">
              SPACE
            </kbd>
            <span className="font-mono text-[11px] text-amber">drift</span>
          </div>
          <span className="font-mono text-xs text-text-muted">drive to a beacon to explore</span>
        </div>
      </div>
    </div>
  )
}
