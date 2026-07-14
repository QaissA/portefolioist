import { useRef } from 'react'
import { gsap } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'
import { useGame } from '@/game/GameContext'
import { CONTENT } from '@/utils/constants'
import AgentFlowDiagram from './AgentFlowDiagram'
import AIRouteGame from './AIRouteGame'
import SectionNumber from '@/components/UI/SectionNumber'

const CAPABILITIES = CONTENT.ai.capabilities

export default function AISection() {
  const sectionRef = useRef(null)
  const { playMode } = useGame()

  useGSAP(() => {
    gsap.from('.ai-heading', {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.7,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    })

    gsap.from('.ai-capability', {
      x: -30,
      opacity: 0,
      stagger: 0.12,
      ease: 'power3.out',
      duration: 0.7,
      scrollTrigger: { trigger: '.ai-capabilities', start: 'top 80%' },
    })

    gsap.from('.ai-diagram-wrap', {
      opacity: 0,
      x: 40,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.ai-diagram-wrap', start: 'top 80%' },
    })
  }, [])

  return (
    <section
      id="ai-section"
      ref={sectionRef}
      className="px-8 py-24"
    >
      <p className="section-label ai-heading mb-4">{CONTENT.ai.label}</p>
      <div className="relative mb-4">
        <SectionNumber num="05" />
        <h2
          className="ai-heading relative z-10 font-display font-bold text-text-primary"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em', paddingTop: '0.1em' }}
        >
          {CONTENT.ai.headingLead} <span className="text-amber">{CONTENT.ai.headingAccent}</span>
        </h2>
      </div>
      <p className="ai-heading text-text-secondary font-display mb-16 max-w-2xl">
        {CONTENT.ai.description}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <div className="ai-capabilities flex flex-col gap-6">
            {CAPABILITIES.map(({ title, desc }) => (
              <div
                key={title}
                className="ai-capability border-l-2 border-amber/30 pl-6 py-1 hover:border-amber transition-colors duration-300 group"
              >
                <h3 className="font-display font-semibold text-text-primary text-lg mb-2 group-hover:text-amber transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-text-secondary font-display text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-surface border border-amber/20 rounded-2xl">
            <p className="font-mono text-text-muted text-xs mb-3">{CONTENT.ai.stackLabel}</p>
            <div className="flex flex-wrap gap-2">
              {CONTENT.ai.stack.map((t) => (
                <span
                  key={t}
                  className="font-mono text-xs border border-amber/30 text-amber px-3 py-1 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="ai-diagram-wrap hidden md:block">
          <p className="section-label text-center mb-6">
            {playMode ? CONTENT.ai.diagramGameLabel : CONTENT.ai.diagramLabel}
          </p>
          <div className="bg-surface border border-border/50 rounded-2xl p-6">
            {playMode ? <AIRouteGame /> : <AgentFlowDiagram />}
          </div>
        </div>
      </div>
    </section>
  )
}
