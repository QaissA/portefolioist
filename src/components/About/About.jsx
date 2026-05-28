import { useRef } from 'react'
import SplitType from 'split-type'
import { gsap, ScrollTrigger } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'
import { PERSONAL } from '@/utils/constants'
import Marquee from './Marquee'

const STATS = [
  { value: '3+', label: 'Years of Production Engineering' },
  { value: 'Fullstack', label: 'Angular · Node.js · Flutter' },
  { value: 'AI-First', label: 'Augmented Engineering Workflows' },
]

export default function About() {
  const sectionRef = useRef(null)
  const bioRef = useRef(null)

  useGSAP(() => {
    const split = new SplitType(bioRef.current, { types: 'words' })

    gsap.from(split.words, {
      y: 25,
      opacity: 0,
      stagger: 0.04,
      ease: 'power3.out',
      duration: 0.6,
      scrollTrigger: {
        trigger: bioRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    })

    gsap.from('.about-stat', {
      y: 30,
      opacity: 0,
      stagger: 0.12,
      ease: 'power3.out',
      duration: 0.7,
      scrollTrigger: {
        trigger: '.about-stats',
        start: 'top 85%',
      },
    })

    gsap.from('.about-label', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    })
  }, [])

  return (
    <section id="about" ref={sectionRef} className="max-w-7xl mx-auto px-8 py-24">
      <p className="section-label about-label mb-6">// 01 About</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <h2
            className="font-display font-bold text-text-primary mb-8"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Engineering with intent.<br />
            <span className="text-amber">Shipping with precision.</span>
          </h2>
          <p ref={bioRef} className="text-text-secondary font-display leading-relaxed text-lg">
            {PERSONAL.bio}
          </p>
        </div>

        <div className="about-stats flex flex-col gap-6 lg:pt-16">
          {STATS.map(({ value, label }) => (
            <div
              key={value}
              className="about-stat border-l-2 border-amber/40 pl-6 py-2 hover:border-amber transition-colors duration-300"
            >
              <div
                className="font-display font-bold text-text-primary"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', letterSpacing: '-0.02em' }}
              >
                {value}
              </div>
              <div className="font-mono text-text-muted text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <Marquee />
    </section>
  )
}
