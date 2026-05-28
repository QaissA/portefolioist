import { useRef } from 'react'
import { gsap } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'
import { useMagnet } from '@/hooks/useMagnet'
import { PERSONAL } from '@/utils/constants'
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'

export default function Contact() {
  const sectionRef = useRef(null)
  const magnetEmail = useMagnet(0.4)
  const magnetGh = useMagnet(0.5)
  const magnetLi = useMagnet(0.5)
  const magnetMail = useMagnet(0.5)

  useGSAP(() => {
    gsap.from('.contact-content > *', {
      y: 40,
      opacity: 0,
      stagger: 0.15,
      ease: 'power3.out',
      duration: 0.8,
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
    })
  }, [])

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="max-w-7xl mx-auto px-8 py-32 text-center"
    >
      <div className="contact-content flex flex-col items-center">
        <p className="section-label mb-6">// 06 Let's Build Something</p>

        <h2
          className="font-display font-bold text-text-primary mb-6"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
        >
          Ready when <span className="text-amber">you are.</span>
        </h2>

        <p className="text-text-secondary font-display text-lg max-w-xl mb-12 leading-relaxed">
          Available for senior engineering contracts, AI product builds, and technical advisory.
          Based in Rabat — remote-first, globally available.
        </p>

        <a
          {...magnetEmail}
          href={`mailto:${PERSONAL.email}`}
          className="inline-flex items-center gap-3 bg-amber text-background font-display font-semibold px-10 py-5 rounded-full text-base tracking-wide hover:bg-amber/90 transition-colors duration-200 mb-16"
        >
          <FiMail className="text-xl" aria-hidden="true" />
          Start a Conversation
        </a>

        <div className="flex items-center gap-6">
          <a
            {...magnetGh}
            href={PERSONAL.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="w-12 h-12 border border-border rounded-full flex items-center justify-center text-text-muted hover:border-amber/50 hover:text-amber transition-all duration-300"
          >
            <FiGithub className="text-lg" aria-hidden="true" />
          </a>
          <a
            {...magnetLi}
            href={PERSONAL.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className="w-12 h-12 border border-border rounded-full flex items-center justify-center text-text-muted hover:border-amber/50 hover:text-amber transition-all duration-300"
          >
            <FiLinkedin className="text-lg" aria-hidden="true" />
          </a>
          <a
            {...magnetMail}
            href={`mailto:${PERSONAL.email}`}
            aria-label="Send email"
            className="w-12 h-12 border border-border rounded-full flex items-center justify-center text-text-muted hover:border-amber/50 hover:text-amber transition-all duration-300"
          >
            <FiMail className="text-lg" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-20 pt-8 border-t border-border/50 w-full max-w-sm">
          <p className="font-mono text-text-muted text-xs">
            Designed & Engineered by {PERSONAL.name} · 2025
          </p>
        </div>
      </div>
    </section>
  )
}
