import { MARQUEE_ITEMS } from '@/utils/constants'

const row1 = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
const row2 = [...MARQUEE_ITEMS].reverse().concat([...MARQUEE_ITEMS].reverse())

function MarqueeRow({ items, reverse = false }) {
  return (
    <div className="overflow-hidden py-3 group">
      <div className={`flex gap-8 whitespace-nowrap ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}>
        {items.map((item, i) => (
          <span
            key={i}
            className="font-mono text-sm text-text-muted shrink-0 flex items-center gap-2"
          >
            <span className="w-1 h-1 rounded-full bg-amber/40 inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Marquee() {
  return (
    <div className="border-y border-border/50 py-1 my-12 overflow-hidden">
      <MarqueeRow items={row1} />
      <MarqueeRow items={row2} reverse />
    </div>
  )
}
