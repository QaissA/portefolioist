import { Suspense, lazy } from 'react'
import { useLenis } from '@/hooks/useLenis'
import Cursor from '@/components/Cursor/Cursor'
import Navbar from '@/components/Navbar/Navbar'
import Hero from '@/components/Hero/Hero'
import About from '@/components/About/About'
import Skills from '@/components/Skills/Skills'
import Achievements from '@/components/Achievements/Achievements'

const Timeline = lazy(() => import('@/components/Timeline/Timeline'))
const AISection = lazy(() => import('@/components/AISection/AISection'))
const Contact = lazy(() => import('@/components/Contact/Contact'))

export default function App() {
  useLenis()

  return (
    <div className="bg-background min-h-screen relative">
      <Cursor />
      <Navbar />
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
    </div>
  )
}
