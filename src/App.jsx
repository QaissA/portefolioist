import { Suspense, lazy, useState } from 'react'
import { useLenis } from '@/hooks/useLenis'
import { useVisitNotification } from '@/hooks/useVisitNotification'
import { GameProvider } from '@/game/GameContext'
import Cursor from '@/components/Cursor/Cursor'
import GameHUD from '@/components/Game/GameHUD'
import Navbar from '@/components/Navbar/Navbar'
import ScrollProgress from '@/components/UI/ScrollProgress'
import Hero from '@/components/Hero/Hero'
import About from '@/components/About/About'
import Skills from '@/components/Skills/Skills'
import Achievements from '@/components/Achievements/Achievements'
import Preloader from '@/components/Preloader/Preloader'

const Timeline = lazy(() => import('@/components/Timeline/Timeline'))
const AISection = lazy(() => import('@/components/AISection/AISection'))
const Contact = lazy(() => import('@/components/Contact/Contact'))

function Main() {
  useLenis()
  return (
    <main>
      <Hero />
      <About />
      <Skills />
      <Achievements />
      <Suspense fallback={null}>
        <Timeline />
        <AISection />
        <Contact />
      </Suspense>
    </main>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  useVisitNotification()

  return (
    <GameProvider>
      <div className="bg-background min-h-screen relative">
        <Preloader onComplete={() => setLoaded(true)} />
        <Cursor />
        <ScrollProgress />
        <Navbar />
        <div style={{ visibility: loaded ? 'visible' : 'hidden' }}>
          {loaded && <Main />}
        </div>
        {loaded && <GameHUD />}
      </div>
    </GameProvider>
  )
}
