import { useEffect, useRef } from 'react'
import { gsap } from '@/utils/gsapConfig'

export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!dot || !ring || !label) return

    const onMove = (e) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.08, ease: 'none' })
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.5, ease: 'power3.out' })
    }

    const onEnter = (e) => {
      const cursorLabel = e.currentTarget.dataset.cursor || ''
      label.textContent = cursorLabel
      gsap.to(ring, { scale: cursorLabel ? 2.8 : 2, duration: 0.3, ease: 'power2.out' })
      gsap.to(label, { opacity: cursorLabel ? 1 : 0, duration: 0.2 })
      gsap.to(dot, { scale: 0, duration: 0.2 })
    }

    const onLeave = () => {
      label.textContent = ''
      gsap.to(ring, { scale: 1, duration: 0.3, ease: 'power2.out' })
      gsap.to(label, { opacity: 0, duration: 0.15 })
      gsap.to(dot, { scale: 1, duration: 0.2 })
    }

    const onMouseDown = () => {
      gsap.timeline()
        .to(ring, { scale: 3, opacity: 0.5, duration: 0.12, ease: 'power2.out' })
        .to(ring, { scale: 1, opacity: 1, duration: 0.5, ease: 'elastic.out(1,0.5)' })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onMouseDown)

    const interactives = document.querySelectorAll('a, button, [data-magnetic], [data-hover], [data-cursor]')
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onMouseDown)
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-amber rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center"
        style={{
          background: 'white',
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      >
        <span
          ref={labelRef}
          className="font-mono text-black pointer-events-none select-none"
          style={{
            fontSize: '7px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 0,
            mixBlendMode: 'normal',
          }}
        />
      </div>
    </>
  )
}
