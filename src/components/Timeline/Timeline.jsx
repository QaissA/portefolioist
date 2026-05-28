import { useRef } from 'react'
import { gsap } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'
import { EXPERIENCE } from '@/utils/constants'
import TimelineCard from './TimelineCard'
import TimelineLine from './TimelineLine'

export default function Timeline() {
  const sectionRef = useRef(null)
  const timelineRef = useRef(null)

  useGSAP(() => {
    gsap.from('.timeline-heading', {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.7,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    })

    gsap.from('.timeline-card', {
      x: -40,
      opacity: 0,
      stagger: 0.15,
      ease: 'power3.out',
      duration: 0.8,
      scrollTrigger: { trigger: timelineRef.current, start: 'top 80%' },
    })
  }, [])

  return (
    <section id="timeline" ref={sectionRef} className="max-w-7xl mx-auto px-8 py-24">
      <p className="section-label timeline-heading mb-4">// 04 Experience</p>
      <h2
        className="timeline-heading font-display font-bold text-text-primary mb-4"
        style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}
      >
        3+ years of shipping <span className="text-amber">production software.</span>
      </h2>
      <p className="timeline-heading text-text-secondary font-display mb-16 max-w-xl">
        From startups to enterprise — fullstack engineering across web and mobile platforms.
      </p>

      <div className="max-w-3xl">
        <div ref={timelineRef} className="relative pl-8">
          <TimelineLine containerRef={timelineRef} />
          {EXPERIENCE.map((exp) => (
            <TimelineCard key={exp.id} {...exp} />
          ))}
        </div>
      </div>
    </section>
  )
}
