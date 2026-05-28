export default function TimelineCard({ company, role, period, location, highlights, current }) {
  return (
    <div className="timeline-card relative pl-12 pb-16 last:pb-0">
      {/* Dot on the line */}
      <div
        className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-amber -translate-x-1/2"
        style={{ background: current ? '#F59E0B' : '#0A0A0A', left: '1px' }}
      />

      <div className="bg-surface border border-border rounded-2xl p-8 hover:border-amber/30 transition-colors duration-300 group">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-display font-semibold text-text-primary text-xl">{role}</h3>
              {current && (
                <span className="font-mono text-[10px] bg-amber/10 text-amber border border-amber/30 px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </div>
            <p className="font-mono text-amber text-sm">{company}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-text-secondary text-sm">{period}</p>
            <p className="font-mono text-text-muted text-xs mt-1">{location}</p>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {highlights.map((h, i) => (
            <li key={i} className="flex gap-3 text-text-secondary text-sm font-display leading-relaxed">
              <span className="text-amber/60 shrink-0 mt-0.5">→</span>
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
