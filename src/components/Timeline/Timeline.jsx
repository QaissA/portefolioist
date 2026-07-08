import { useRef, useLayoutEffect } from 'react'
import { gsap, ScrollTrigger } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'
import { EXPERIENCE } from '@/utils/constants'
import SectionNumber from '@/components/UI/SectionNumber'
import { useScrambleText } from '@/hooks/useScrambleText'
import { useGame } from '@/game/GameContext'
import TimelineGame from './TimelineGame'

function TimelineCardH({ company, role, period, location, highlights, current, index }) {
  return (
    <div
      className="timeline-card-h flex-shrink-0 bg-surface border border-border rounded-2xl p-8 hover:border-amber/30 transition-colors duration-300 group"
      style={{ width: '380px', height: 'auto', minHeight: '420px' }}
    >
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-2.5 h-2.5 rounded-full border-2 border-amber flex-shrink-0"
          style={{ background: current ? '#F59E0B' : 'transparent' }}
        />
        <span className="font-mono text-text-muted text-xs">{String(index + 1).padStart(2, '0')}</span>
        {current && (
          <span className="font-mono text-[10px] bg-amber/10 text-amber border border-amber/30 px-2 py-0.5 rounded-full">
            Current
          </span>
        )}
      </div>

      <div className="mt-6 mb-6">
        <h3 className="font-display font-semibold text-text-primary text-xl mb-1 group-hover:text-amber transition-colors duration-300">
          {role}
        </h3>
        <p className="font-mono text-amber text-sm mb-1">{company}</p>
        <p className="font-mono text-text-muted text-xs">{period} · {location}</p>
      </div>

      <ul className="flex flex-col gap-3">
        {highlights.map((h, i) => (
          <li key={i} className="flex gap-3 text-text-secondary text-sm font-display leading-relaxed">
            <span className="text-amber/60 shrink-0 mt-0.5">→</span>
            {h}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Timeline() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const scrambleRef = useScrambleText('EXPERIENCE')
  const { playMode } = useGame()

  useGSAP(() => {
    gsap.from('.timeline-heading', {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.7,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    })
  }, [])

  useLayoutEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track || playMode) return // play mode shows the sort game, no pin

    const CARD_W = 380
    const CARD_GAP = 24
    const cards = Array.from(track.querySelectorAll('.timeline-card-h'))

    // Set initial state on all cards
    gsap.set(cards, { rotateY: 5, z: -50, opacity: 0.65 })

    const getWidth = () => track.scrollWidth - window.innerWidth + 120

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${getWidth()}`,
      pin: true,
      anticipatePin: 1,
      scrub: 1.2,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const totalX = getWidth()
        gsap.set(track, { x: -totalX * self.progress })

        // Drive 3D depth for each card from progress — no nested ScrollTriggers
        const viewLeft = totalX * self.progress
        cards.forEach((card, i) => {
          const cardLeft = i * (CARD_W + CARD_GAP) + 32 // 32 = px-8 padding
          const relPos = (cardLeft - viewLeft) / window.innerWidth // 0=left edge, 1=right
          const clamped = Math.max(0, Math.min(1, relPos))
          gsap.set(card, {
            rotateY: clamped * 5,
            z: -clamped * 50,
            opacity: 1 - clamped * 0.35,
          })
        })
      },
    })

    ScrollTrigger.refresh()

    return () => st.kill()
  }, [playMode])

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className={playMode ? '' : 'overflow-hidden'}
      style={playMode ? undefined : { height: '100vh' }}
    >
      {/* Header — pinned at top inside the section */}
      <div className="px-8 pt-24 pb-10">
        <p className="section-label timeline-heading mb-4">
          // 04 <span ref={scrambleRef} />
        </p>
        <div className="relative mb-2">
          <SectionNumber num="04" />
          <h2
            className="timeline-heading relative z-10 font-display font-bold text-text-primary"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em', paddingTop: '0.1em' }}
          >
            3+ years of shipping <span className="text-amber">production software.</span>
          </h2>
        </div>
        <p className="timeline-heading text-text-secondary font-display max-w-xl text-sm">
          Drag or scroll to explore — fullstack engineering across web and mobile.
        </p>
      </div>

      {playMode ? (
        <div className="px-8 pb-24">
          <TimelineGame />
        </div>
      ) : (
        /* Horizontal track */
        <div
          ref={trackRef}
          className="flex gap-6 px-8"
          style={{ width: 'max-content', paddingRight: '120px', perspective: '800px' }}
        >
          {EXPERIENCE.map((exp, i) => (
            <TimelineCardH key={exp.id} {...exp} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}
