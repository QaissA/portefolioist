import { useRef } from 'react'
import SplitType from 'split-type'
import { gsap, ScrollTrigger } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'
import { useMagnet } from '@/hooks/useMagnet'
import { PERSONAL } from '@/utils/constants'
import ParticleCanvas from './ParticleCanvas'
import HeroParallaxText from './HeroParallaxText'

export default function Hero() {
  const sectionRef = useRef(null)
  const innerWrapRef = useRef(null)
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

    // Wrap each char for clip-path masking
    nameSplit.chars.forEach((char) => {
      const wrap = document.createElement('span')
      wrap.className = 'char-wrap'
      char.parentNode.insertBefore(wrap, char)
      wrap.appendChild(char)
    })

    const tl = gsap.timeline({ delay: 0.1 })

    tl.from(nameSplit.chars, {
      clipPath: 'inset(0 0 100% 0)',
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

    // Scroll parallax layers
    const trigger = { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: true }
    gsap.to(nameRef.current, { y: -80, ease: 'none', scrollTrigger: trigger })
    gsap.to([titleRef.current, taglineRef.current], { y: -140, ease: 'none', scrollTrigger: trigger })
    gsap.to(ctaRef.current, { y: -200, ease: 'none', scrollTrigger: trigger })

    // 3D mouse tilt
    const section = sectionRef.current
    const inner = innerWrapRef.current

    const onMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      gsap.to(inner, {
        rotateX: -ny * 4,
        rotateY: nx * 4,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    const onMouseLeave = () => {
      gsap.to(inner, { rotateX: 0, rotateY: 0, duration: 1, ease: 'power3.out' })
    }

    section.addEventListener('mousemove', onMouseMove)
    section.addEventListener('mouseleave', onMouseLeave)

    return () => {
      section.removeEventListener('mousemove', onMouseMove)
      section.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ perspective: '800px' }}
    >
      <ParticleCanvas />
      <HeroParallaxText sectionRef={sectionRef} />

      <div
        ref={innerWrapRef}
        className="relative w-full max-w-7xl mx-auto px-8 pt-24 pb-16"
        style={{ zIndex: 10, transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        <div className="max-w-5xl">
          <p className="section-label mb-6 tracking-[0.2em]">
            // Available for freelance — Rabat, Morocco
          </p>

          <h1
            ref={nameRef}
            className="font-display font-bold text-text-primary leading-none mb-4"
            style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)', letterSpacing: '-0.03em' }}
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
              data-cursor="MAIL"
              className="inline-flex items-center gap-2 bg-amber text-background font-display font-semibold px-8 py-4 rounded-full text-sm tracking-wide hover:bg-amber/90 transition-colors duration-200"
            >
              Let's work together
              <span className="text-lg">→</span>
            </a>
            <button
              {...magnetSecondary}
              data-cursor="VIEW"
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
