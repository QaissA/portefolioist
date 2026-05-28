import { useRef } from 'react'
import { gsap, ScrollTrigger } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'

export default function HeroParallaxText({ sectionRef }) {
  const textRef = useRef(null)

  useGSAP(() => {
    gsap.to(textRef.current, {
      y: 80,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, [])

  return (
    <div
      ref={textRef}
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 2 }}
    >
      <span
        className="font-display font-bold whitespace-nowrap"
        style={{
          fontSize: 'clamp(8rem, 20vw, 18rem)',
          color: 'transparent',
          WebkitTextStroke: '1px rgba(245,158,11,0.05)',
          letterSpacing: '-0.06em',
          lineHeight: 1,
        }}
      >
        FULL·STACK
      </span>
    </div>
  )
}
