import { useRef } from 'react'
import { gsap } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'
import SectionNumber from '@/components/UI/SectionNumber'
import { useScrambleText } from '@/hooks/useScrambleText'
import { useGame } from '@/game/GameContext'
import { CONTENT } from '@/utils/constants'
import SkillsScatter from './SkillsScatter'
import SkillsGame from './SkillsGame'

export default function Skills() {
  const sectionRef = useRef(null)
  const scrambleRef = useScrambleText(CONTENT.skills.scramble)
  const { playMode } = useGame()

  useGSAP(() => {
    gsap.from('.skills-heading', {
      y: 30,
      opacity: 0,
      duration: 0.7,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    })
  }, [])

  return (
    <section id="skills" ref={sectionRef} className="px-8 py-24">
      <p className="section-label skills-heading mb-4">
        {CONTENT.skills.labelPrefix}<span ref={scrambleRef} />
      </p>
      <div className="relative mb-16">
        <SectionNumber num="02" />
        <h2
          className="skills-heading relative z-10 font-display font-bold text-text-primary"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em', paddingTop: '0.1em' }}
        >
          {CONTENT.skills.headingLead} <span className="text-amber">{CONTENT.skills.headingAccent}</span>
        </h2>
      </div>

      {playMode ? <SkillsGame /> : <SkillsScatter />}
    </section>
  )
}
