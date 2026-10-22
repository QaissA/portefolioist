import { useRef } from 'react'
import { gsap } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'
import { CONTENT } from '@/utils/constants'
import { FaArrowRight } from 'react-icons/fa'
import SectionNumber from '@/components/UI/SectionNumber'

export default function Showcase() {
  const sectionRef = useRef(null)
  const S = CONTENT.showcase

  useGSAP(() => {
    gsap.from('.showcase-heading', {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.7,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    })

    gsap.from('.showcase-card', {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.showcase-grid', start: 'top 80%' },
    })
  }, [])

  return (
    <section id="showcase" ref={sectionRef} className="px-8 py-24">
      <p className="section-label showcase-heading mb-4">{S.label}</p>
      <div className="relative mb-4">
        <SectionNumber num="06" />
        <h2
          className="showcase-heading relative z-10 font-display font-bold text-text-primary"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em', paddingTop: '0.1em' }}
        >
          {S.headingLead} <span className="text-amber">{S.headingAccent}</span>
        </h2>
      </div>
      <p className="showcase-heading text-text-secondary font-display mb-16 max-w-xl">{S.description}</p>

      <div className="showcase-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {S.items.map((p) => (
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="showcase-card bg-surface border border-border rounded-2xl p-8 flex flex-col hover:border-amber/30 transition-colors duration-300 group"
          >
            <p className="font-mono text-text-muted text-xs mb-3">{p.kind}</p>
            <h3 className="font-display font-bold text-text-primary text-2xl mb-3">{p.name}</h3>
            <p className="text-text-secondary text-sm mb-6 flex-1">{p.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {p.stack.map((t) => (
                <span key={t} className="font-mono text-xs px-2 py-1 rounded-md bg-amber/10 text-amber">
                  {t}
                </span>
              ))}
            </div>
            <span className="font-mono text-sm text-amber inline-flex items-center gap-2">
              {S.visitCta}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
