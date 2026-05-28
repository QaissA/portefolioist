import { useRef } from 'react'
import { gsap } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'
import { useMagnet } from '@/hooks/useMagnet'
import { PERSONAL } from '@/utils/constants'
import { FiGithub, FiLinkedin, FiMail, FiArrowUpRight } from 'react-icons/fi'
import { useScrambleText } from '@/hooks/useScrambleText'
import SectionNumber from '@/components/UI/SectionNumber'

const MARQUEE_TEXT = "LET'S WORK · AVAILABLE NOW · LET'S WORK · AVAILABLE NOW · "

export default function Contact() {
  const sectionRef = useRef(null)
  const btnRef = useRef(null)
  const magnetGh = useMagnet(0.5)
  const magnetLi = useMagnet(0.5)
  const magnetMail = useMagnet(0.5)
  const scrambleRef = useScrambleText("LET'S BUILD")

  useGSAP(() => {
    gsap.from('.contact-block > *', {
      y: 40,
      opacity: 0,
      stagger: 0.12,
      ease: 'power3.out',
      duration: 0.8,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
    })
  }, [])

  const onBtnEnter = () => {
    gsap.to(btnRef.current, { borderRadius: '16px 60px 16px 60px', duration: 0.4, ease: 'power2.out' })
  }
  const onBtnLeave = () => {
    gsap.to(btnRef.current, { borderRadius: '100px', duration: 0.4, ease: 'power2.out' })
  }

  return (
    <section id="contact" ref={sectionRef} className="overflow-hidden pt-24 pb-16">

      {/* Oversized marquee banner */}
      <div className="w-full overflow-hidden mb-16 border-y border-border/40 py-4">
        <div className="flex" style={{ width: 'max-content' }}>
          <span
            className="animate-marquee-contact whitespace-nowrap font-display font-bold text-amber select-none"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', letterSpacing: '-0.03em', paddingRight: '4rem' }}
          >
            {MARQUEE_TEXT.repeat(4)}
          </span>
          <span
            className="animate-marquee-contact whitespace-nowrap font-display font-bold text-amber select-none"
            aria-hidden="true"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', letterSpacing: '-0.03em', paddingRight: '4rem' }}
          >
            {MARQUEE_TEXT.repeat(4)}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        <div className="contact-block">
          {/* Section label */}
          <p className="section-label mb-6">
            // 06 <span ref={scrambleRef} />
          </p>

          {/* Heading with section number */}
          <div className="relative mb-10">
            <SectionNumber num="06" />
            <h2
              className="relative z-10 font-display font-bold text-text-primary"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.03em', lineHeight: 1.05, paddingTop: '0.1em' }}
            >
              Ready when <span className="text-amber">you are.</span>
            </h2>
          </div>

          {/* Large email display */}
          <div className="mb-12">
            <p className="font-mono text-text-muted text-xs mb-2">// reach me at</p>
            <a
              href={`mailto:${PERSONAL.email}`}
              className="block font-display font-bold text-text-primary hover:text-amber transition-colors duration-300"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
              data-cursor="MAIL"
            >
              <span className="block">{PERSONAL.email.split('@')[0]}</span>
              <span className="block text-amber">@{PERSONAL.email.split('@')[1]}</span>
            </a>
          </div>

          {/* CTA Button with liquid morph */}
          <div className="mb-16">
            <a
              ref={btnRef}
              href={`mailto:${PERSONAL.email}`}
              data-cursor="OPEN"
              onMouseEnter={onBtnEnter}
              onMouseLeave={onBtnLeave}
              className="inline-flex items-center gap-3 bg-amber text-background font-display font-semibold px-10 py-5 text-base tracking-wide"
              style={{ borderRadius: '100px' }}
            >
              <FiMail className="text-xl" aria-hidden="true" />
              Start a Conversation
              <FiArrowUpRight className="text-xl" aria-hidden="true" />
            </a>
          </div>

          {/* Footer row */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-border/50">
            <p className="font-mono text-text-muted text-xs">
              Designed & Engineered by {PERSONAL.name} · 2025
            </p>
            <div className="flex items-center gap-4">
              <a
                {...magnetGh}
                href={PERSONAL.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                data-cursor="VIEW"
                className="w-11 h-11 border border-border rounded-full flex items-center justify-center text-text-muted hover:border-amber/50 hover:text-amber transition-all duration-300"
              >
                <FiGithub className="text-base" aria-hidden="true" />
              </a>
              <a
                {...magnetLi}
                href={PERSONAL.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                data-cursor="VIEW"
                className="w-11 h-11 border border-border rounded-full flex items-center justify-center text-text-muted hover:border-amber/50 hover:text-amber transition-all duration-300"
              >
                <FiLinkedin className="text-base" aria-hidden="true" />
              </a>
              <a
                {...magnetMail}
                href={`mailto:${PERSONAL.email}`}
                aria-label="Email"
                data-cursor="MAIL"
                className="w-11 h-11 border border-border rounded-full flex items-center justify-center text-text-muted hover:border-amber/50 hover:text-amber transition-all duration-300"
              >
                <FiMail className="text-base" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
