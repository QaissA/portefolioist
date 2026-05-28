import { useRef } from 'react'
import { gsap } from '@/utils/gsapConfig'

export function useMagnet(strength = 0.4) {
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(el, { x: x * strength, y: y * strength, duration: 0.3, ease: 'power2.out' })
  }

  const handleMouseLeave = () => {
    if (!ref.current) return
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
  }

  return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave }
}
