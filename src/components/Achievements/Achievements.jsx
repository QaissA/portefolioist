import { useRef } from 'react'
import { gsap } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'
import { ACHIEVEMENTS } from '@/utils/constants'
import MetricCard from './MetricCard'

export default function Achievements() {
  const sectionRef = useRef(null)

  useGSAP(() => {
    gsap.from('.achievements-heading', {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.7,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    })

    gsap.from('.metric-card', {
      y: 50,
      opacity: 0,
      scale: 0.95,
      stagger: 0.1,
      ease: 'back.out(1.7)',
      duration: 0.7,
      scrollTrigger: { trigger: '.metrics-grid', start: 'top 80%' },
    })
  }, [])

  return (
    <section id="achievements" ref={sectionRef} className="max-w-7xl mx-auto px-8 py-24">
      <p className="section-label achievements-heading mb-4">// 03 Impact & Numbers</p>
      <h2
        className="achievements-heading font-display font-bold text-text-primary mb-4"
        style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}
      >
        Results that speak <span className="text-amber">louder than claims.</span>
      </h2>
      <p className="achievements-heading text-text-secondary font-display mb-16 max-w-xl">
        Every number represents a real project, a real team, and a real problem solved.
      </p>

      <div className="metrics-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACHIEVEMENTS.map((item, i) => (
          <MetricCard key={i} {...item} index={i} />
        ))}
      </div>
    </section>
  )
}
