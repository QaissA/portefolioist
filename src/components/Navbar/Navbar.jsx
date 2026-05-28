import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/utils/gsapConfig'
import { PERSONAL } from '@/utils/constants'

const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'achievements', label: 'Impact' },
  { id: 'timeline', label: 'Experience' },
  { id: 'ai-section', label: 'AI Engineering' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar() {
  const navRef = useRef(null)
  const [active, setActive] = useState('hero')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })

    const observers = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { threshold: 0.4 },
      )
      obs.observe(el)
      return obs
    }).filter(Boolean)

    return () => {
      window.removeEventListener('scroll', onScroll)
      observers.forEach((o) => o.disconnect())
    }
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({ top: el.offsetTop, behavior: 'smooth' })
  }

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 transition-all duration-500 ${
        scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border/50' : 'bg-transparent'
      }`}
    >
      <button
        onClick={() => scrollTo('hero')}
        className="font-mono text-amber font-medium text-lg tracking-widest"
        aria-label="Back to top"
      >
        QA
      </button>

      <div className="hidden md:flex items-center gap-1">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`group relative px-3 py-2 font-mono text-xs transition-colors duration-200 ${
              active === id ? 'text-amber' : 'text-text-muted hover:text-text-secondary'
            }`}
            aria-label={`Navigate to ${label}`}
          >
            <span
              className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-200 ${
                active === id ? 'bg-amber scale-100' : 'bg-text-muted scale-0 group-hover:scale-100'
              }`}
            />
            <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap bg-surface border border-border rounded px-1.5 py-0.5 transition-opacity duration-150 pointer-events-none">
              {label}
            </span>
          </button>
        ))}
      </div>

      <a
        href={`mailto:${PERSONAL.email}`}
        className="hidden md:block font-mono text-xs border border-amber/40 text-amber px-4 py-2 rounded-full hover:bg-amber/10 transition-colors duration-200"
      >
        Hire me
      </a>
    </nav>
  )
}
