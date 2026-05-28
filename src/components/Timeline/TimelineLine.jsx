import { useRef, useLayoutEffect, useState } from 'react'
import { gsap, ScrollTrigger } from '@/utils/gsapConfig'

export default function TimelineLine({ containerRef }) {
  const lineRef = useRef(null)
  const [height, setHeight] = useState(800)

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setHeight(containerRef.current.offsetHeight)
      }
    }
    updateHeight()

    const ro = new ResizeObserver(updateHeight)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [containerRef])

  useLayoutEffect(() => {
    const line = lineRef.current
    if (!line) return

    const len = line.getTotalLength ? line.getTotalLength() : height
    line.style.strokeDasharray = len
    line.style.strokeDashoffset = len

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1.5,
      onUpdate: (self) => {
        line.style.strokeDashoffset = len * (1 - self.progress)
      },
    })

    return () => trigger.kill()
  }, [height, containerRef])

  return (
    <div className="absolute left-0 top-0 bottom-0 w-px">
      <svg
        width="2"
        height={height}
        viewBox={`0 0 2 ${height}`}
        fill="none"
        className="absolute top-0 left-0"
        aria-hidden="true"
      >
        {/* Static faded track */}
        <line x1="1" y1="0" x2="1" y2={height} stroke="#2A2A2A" strokeWidth="1" />
        {/* Animated amber line */}
        <line
          ref={lineRef}
          x1="1"
          y1="0"
          x2="1"
          y2={height}
          stroke="#F59E0B"
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}
