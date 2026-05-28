import { useRef } from 'react'
import { gsap } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'
import { SKILLS } from '@/utils/constants'
import SkillCard from './SkillCard'

const CATEGORIES = [
  { key: 'frontend', label: 'Frontend', color: '#F59E0B', number: '01' },
  { key: 'backend', label: 'Backend', color: '#10B981', number: '02' },
  { key: 'mobile', label: 'Mobile', color: '#0EA5E9', number: '03' },
  { key: 'ai', label: 'AI & Agents', color: '#8B5CF6', number: '04' },
  { key: 'devops', label: 'DevOps & QA', color: '#F43F5E', number: '05' },
]

export default function Skills() {
  const sectionRef = useRef(null)

  useGSAP(() => {
    gsap.from('.skills-heading', {
      y: 30,
      opacity: 0,
      duration: 0.7,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    })

    gsap.from('.category-col', {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      ease: 'power3.out',
      duration: 0.8,
      scrollTrigger: {
        trigger: '.skills-grid',
        start: 'top 80%',
      },
    })

    gsap.from('.skill-card', {
      y: 20,
      opacity: 0,
      scale: 0.92,
      stagger: { each: 0.04, from: 'start' },
      ease: 'back.out(1.5)',
      duration: 0.5,
      scrollTrigger: {
        trigger: '.skills-grid',
        start: 'top 75%',
      },
    })
  }, [])

  return (
    <section id="skills" ref={sectionRef} className="max-w-7xl mx-auto px-8 py-24">
      <p className="section-label skills-heading mb-4">// 02 Skills Arsenal</p>
      <h2
        className="skills-heading font-display font-bold text-text-primary mb-16"
        style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}
      >
        The full stack, <span className="text-amber">and then some.</span>
      </h2>

      <div className="skills-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {CATEGORIES.map(({ key, label, color, number }) => (
          <div key={key} className="category-col flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] text-text-muted">{number}</span>
              <span
                className="font-mono text-xs font-medium"
                style={{ color }}
              >
                {label}
              </span>
              <div className="flex-1 h-px" style={{ background: `${color}30` }} />
            </div>
            {SKILLS[key].map((skill) => (
              <SkillCard
                key={skill.name}
                name={skill.name}
                icon={skill.icon}
                glowColor={color}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
