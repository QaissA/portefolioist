import { useRef } from 'react'
import SplitType from 'split-type'
import { gsap } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'
import { useMagnet } from '@/hooks/useMagnet'
import { PERSONAL } from '@/utils/constants'
import HeroBackground from './HeroBackground'

export default function Hero() {
  const sectionRef = useRef(null)
  const nameRef = useRef(null)
  const titleRef = useRef(null)
  const taglineRef = useRef(null)
  const ctaRef = useRef(null)
  const scrollHintRef = useRef(null)
  const magnetCta = useMagnet(0.35)
  const magnetSecondary = useMagnet(0.3)

  useGSAP(() => {
    const nameSplit = new SplitType(nameRef.current, { types: 'chars' })
    const titleSplit = new SplitType(titleRef.current, { types: 'words' })

    const tl = gsap.timeline({ delay: 0.2 })

    tl.set(nameSplit.chars, { y: 100, opacity: 0, rotateX: -40 })
      .to(nameSplit.chars, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.9,
        stagger: 0.035,
        ease: 'power4.out',
      })
      .set(titleSplit.words, { y: 30, opacity: 0 })
      .to(titleSplit.words, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.out',
      }, '-=0.5')
      .from(taglineRef.current, {
        y: 25,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.3')
      .from(ctaRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      }, '-=0.4')
      .from(scrollHintRef.current, {
        opacity: 0,
        duration: 0.8,
      }, '-=0.2')
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <HeroBackground />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 pt-24 pb-16">
        <div className="max-w-5xl">
          <p className="section-label mb-6 tracking-[0.2em]">
            // Available for freelance — Rabat, Morocco
          </p>

          <h1
            ref={nameRef}
            className="font-display font-bold text-text-primary leading-none mb-4"
            style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)', letterSpacing: '-0.03em', perspective: '600px' }}
          >
            {PERSONAL.name}
          </h1>

          <h2
            ref={titleRef}
            className="font-display font-medium text-text-secondary mb-8"
            style={{ fontSize: 'clamp(1.2rem, 2.5vw, 2rem)' }}
          >
            {PERSONAL.subtitle}
          </h2>

          <p
            ref={taglineRef}
            className="text-text-secondary font-display leading-relaxed max-w-2xl mb-12"
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)' }}
          >
            {PERSONAL.tagline}
          </p>

          <div ref={ctaRef} className="flex flex-wrap gap-4 items-center">
            <a
              {...magnetCta}
              href={`mailto:${PERSONAL.email}`}
              className="inline-flex items-center gap-2 bg-amber text-background font-display font-semibold px-8 py-4 rounded-full text-sm tracking-wide hover:bg-amber/90 transition-colors duration-200"
            >
              Let's work together
              <span className="text-lg">→</span>
            </a>
            <button
              {...magnetSecondary}
              onClick={() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 border border-border text-text-secondary font-mono text-sm px-8 py-4 rounded-full hover:border-amber/50 hover:text-text-primary transition-colors duration-200"
            >
              View my work
            </button>
          </div>
        </div>

        <div
          ref={scrollHintRef}
          className="absolute bottom-10 left-8 flex items-center gap-3 text-text-muted font-mono text-xs"
        >
          <div className="flex flex-col gap-1">
            <span
              className="block w-px h-8 bg-gradient-to-b from-transparent to-amber/60 animate-pulse"
              style={{ marginLeft: '1px' }}
            />
          </div>
          scroll
        </div>
      </div>
    </section>
  )
}
