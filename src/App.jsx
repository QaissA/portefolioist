import { Suspense, lazy, useState } from 'react'
import { useLenis } from '@/hooks/useLenis'
import { useVisitNotification } from '@/hooks/useVisitNotification'
import { GameProvider } from '@/game/GameContext'
import { ThemeProvider, useTheme } from '@/theme/ThemeContext'
import Cursor from '@/components/Cursor/Cursor'
import GameHUD from '@/components/Game/GameHUD'
import Navbar from '@/components/Navbar/Navbar'
import ThemePanel from '@/components/ThemePanel/ThemePanel'
import ScrollProgress from '@/components/UI/ScrollProgress'
import Hero from '@/components/Hero/Hero'
import About from '@/components/About/About'
import Skills from '@/components/Skills/Skills'
import Achievements from '@/components/Achievements/Achievements'
import Preloader from '@/components/Preloader/Preloader'
import ExploreLauncher from '@/components/Explore3D/ExploreLauncher'

const Timeline = lazy(() => import('@/components/Timeline/Timeline'))
const AISection = lazy(() => import('@/components/AISection/AISection'))
const Contact = lazy(() => import('@/components/Contact/Contact'))
const Explore3D = lazy(() => import('@/components/Explore3D/Explore3D'))

// Maps block ids (see themeConfig BLOCKS) to their components. Timeline /
// AISection / Contact are lazy and rendered inside a shared Suspense boundary.
const EAGER = { hero: Hero, about: About, skills: Skills, achievements: Achievements }
const LAZY = { timeline: Timeline, 'ai-section': AISection, contact: Contact }
const ORDER = ['hero', 'about', 'skills', 'achievements', 'timeline', 'ai-section', 'contact']

function Main() {
  useLenis()
  const { theme } = useTheme()
  const visible = ORDER.filter((id) => !theme.hiddenBlocks.includes(id))

  return (
    <main>
      {visible
        .filter((id) => EAGER[id])
        .map((id) => {
          const C = EAGER[id]
          return <C key={id} />
        })}
      <Suspense fallback={null}>
        {visible
          .filter((id) => LAZY[id])
          .map((id) => {
            const C = LAZY[id]
            return <C key={id} />
          })}
      </Suspense>
    </main>
  )
}

function AppShell() {
  const [loaded, setLoaded] = useState(false)
  const [drive, setDrive] = useState(false)
  useVisitNotification()

  return (
    <div className="bg-background min-h-screen relative">
      <Preloader onComplete={() => setLoaded(true)} />
      <Cursor />
      <ScrollProgress />
      <Navbar />
      <ThemePanel />
      <div style={{ visibility: loaded ? 'visible' : 'hidden' }}>
        {loaded && <Main />}
      </div>
      {loaded && <GameHUD />}
      {loaded && (
        <ExploreLauncher
          onOpen={() => {
            // Tear down the Hero WebGL context first (this flushes and unmounts
            // its canvas), then mount Drive Mode on the next frame so the two
            // contexts never coexist — that overlap was causing Context Lost.
            window.dispatchEvent(new Event('drivemode:on'))
            requestAnimationFrame(() => setDrive(true))
          }}
        />
      )}
      {drive && (
        <Suspense fallback={null}>
          <Explore3D onExit={() => setDrive(false)} />
        </Suspense>
      )}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <AppShell />
      </GameProvider>
    </ThemeProvider>
  )
}
