import { PERSONAL, SKILLS, EXPERIENCE, ACHIEVEMENTS, PROJECTS, CONTENT } from '@/utils/constants'
import { STATIONS } from './stations'

const PANEL = CONTENT.driveMode.contentPanel
const SKILL_GROUPS = PANEL.skillGroups

function Chip({ children, color }) {
  return (
    <span
      className="rounded-full border px-2.5 py-1 font-mono text-[11px] text-text-secondary"
      style={{ borderColor: `${color}55` }}
    >
      {children}
    </span>
  )
}

function ProfileBody({ color }) {
  return (
    <>
      <h3 className="font-display text-2xl font-bold text-text-primary">{PERSONAL.name}</h3>
      <p className="mt-1 font-mono text-sm" style={{ color }}>
        {PERSONAL.title}
      </p>
      <p className="font-mono text-xs text-text-muted">{PERSONAL.subtitle} · {PERSONAL.location}</p>
      <p className="mt-4 text-sm leading-relaxed text-text-secondary">{PERSONAL.bio}</p>
    </>
  )
}

function SkillsBody({ color }) {
  return (
    <div className="flex flex-col gap-4">
      {SKILL_GROUPS.map((g) => (
        <div key={g.key}>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-text-muted">
            {g.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {SKILLS[g.key].map((s) => (
              <Chip key={s.name} color={color}>
                {s.name}
              </Chip>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ImpactBody({ color }) {
  return (
    <>
      <div className="mb-4 flex items-baseline gap-2">
        <span className="font-display text-5xl font-bold" style={{ color }}>
          {PANEL.impactHeadline}
        </span>
        <span className="font-mono text-sm text-text-secondary">{PANEL.impactCaption}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a) => (
          <div key={a.label} className="rounded-xl border border-border bg-surface-2/60 p-3">
            <p className="font-display text-xl font-bold text-text-primary">
              {a.prefix}
              {a.value}
              {a.suffix}
            </p>
            <p className="mt-0.5 font-mono text-[11px] leading-tight text-text-muted">{a.label}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function WorkBody({ color }) {
  return (
    <div className="flex flex-col gap-3">
      {EXPERIENCE.map((e) => (
        <div key={e.id} className="rounded-xl border border-border bg-surface-2/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-sm font-semibold text-text-primary">{e.role}</p>
            {e.current && (
              <span
                className="rounded-full border px-2 py-0.5 font-mono text-[9px]"
                style={{ borderColor: color, color }}
              >
                {PANEL.currentBadge}
              </span>
            )}
          </div>
          <p className="font-mono text-xs" style={{ color }}>
            {e.company}
          </p>
          <p className="font-mono text-[10px] text-text-muted">
            {e.period} · {e.location}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{e.highlights[0]}</p>
        </div>
      ))}
    </div>
  )
}

function ProjectsBody({ color }) {
  return (
    <div className="flex flex-col gap-3">
      {PROJECTS.map((p) => (
        <div key={p.id} className="rounded-xl border border-border bg-surface-2/50 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-display text-sm font-semibold text-text-primary">{p.name}</p>
            <p className="font-mono text-[10px] text-text-muted">{p.company}</p>
          </div>
          <p className="font-mono text-[11px]" style={{ color }}>
            {p.kind}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{p.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.stack.map((t) => (
              <Chip key={t} color={color}>
                {t}
              </Chip>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const BODIES = {
  profile: ProfileBody,
  skills: SkillsBody,
  experience: ImpactBody,
  work: WorkBody,
  projects: ProjectsBody,
}

/**
 * The slide-in panel showing the active station's content. Always mounted so
 * it can animate in/out; `active` is a station id (or null when driving).
 */
export default function ContentPanel({ active }) {
  const station = STATIONS.find((s) => s.id === active)
  const Body = station ? BODIES[station.id] : null
  const color = station?.color

  return (
    <div
      className={`pointer-events-none fixed bottom-4 left-4 z-[10020] w-[min(92vw,25rem)] transition-all duration-300 ${
        station ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      {station && (
        <div
          data-lenis-prevent
          className="pointer-events-auto max-h-[70vh] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface/95 p-5 shadow-2xl shadow-black/40 backdrop-blur"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="font-mono text-xs" style={{ color }}>
              {station.number}
            </span>
            <span className="h-px flex-1" style={{ background: `${color}55` }} />
            <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
              {station.title}
            </span>
          </div>
          {Body && <Body color={color} />}
        </div>
      )}
    </div>
  )
}
