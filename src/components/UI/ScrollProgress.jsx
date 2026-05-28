import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '@/utils/gsapConfig'
import { gsap } from '@/utils/gsapConfig'

export default function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    gsap.set(bar, { scaleX: 0 })

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress })
      },
    })

    return () => st.kill()
  }, [])

  return <div ref={barRef} className="scroll-progress-bar" />
}
