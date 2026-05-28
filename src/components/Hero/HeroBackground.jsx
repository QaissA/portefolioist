import { useRef } from 'react'
import { gsap } from '@/utils/gsapConfig'
import { useGSAP } from '@/hooks/useGSAP'

export default function HeroBackground() {
  const blob1 = useRef(null)
  const blob2 = useRef(null)
  const blob3 = useRef(null)

  useGSAP(() => {
    const animate = (el, props) => {
      el.style.willChange = 'transform'
      return gsap.to(el, { ...props, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    }

    const tl1 = animate(blob1.current, { x: 70, y: -50, scale: 1.15, duration: 9 })
    const tl2 = animate(blob2.current, { x: -60, y: 40, scale: 1.1, duration: 11, delay: 2 })
    const tl3 = animate(blob3.current, { x: 30, y: 30, scale: 0.9, duration: 7, delay: 1 })

    return () => { tl1.kill(); tl2.kill(); tl3.kill() }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        ref={blob1}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        ref={blob2}
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        ref={blob3}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#F5F5F5 1px, transparent 1px), linear-gradient(90deg, #F5F5F5 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  )
}
