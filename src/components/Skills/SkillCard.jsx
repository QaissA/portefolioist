import {
  SiAngular, SiTypescript, SiReact, SiNextdotjs, SiTailwindcss,
  SiNodedotjs, SiSpring, SiGraphql, SiPostgresql,
  SiFlutter, SiDart,
  SiDocker, SiGithubactions, SiJest, SiCypress, SiSonarqubeserver,
  SiNgrx, SiReactivex, SiAnthropic, SiGithubcopilot,
} from 'react-icons/si'
import { FaJava, FaBrain, FaRobot } from 'react-icons/fa'
import { TbApi, TbBrandReact } from 'react-icons/tb'

const ICON_MAP = {
  SiAngular, SiTypescript, SiReact, SiNextdotjs, SiTailwindcss,
  SiNodedotjs, SiSpring, SiGraphql, SiPostgresql,
  SiFlutter, SiDart,
  SiDocker, SiGithubactions, SiJest, SiCypress,
  SiSonarqube: SiSonarqubeserver,
  SiNgrx, SiReactivex,
  SiAnthropic, SiGithubcopilot,
  FaJava, FaBrain, FaRobot,
  TbApi, TbBrandReact,
  TbCursorText: FaBrain,
  TbPrompt: FaBrain,
  TbBrain: FaBrain,
}

export default function SkillCard({ name, icon, glowColor }) {
  const Icon = ICON_MAP[icon] || FaBrain

  return (
    <div
      className="skill-card group flex items-center gap-3 bg-surface-2 border border-border rounded-lg px-4 py-3 transition-all duration-300 cursor-default"
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px ${glowColor}30`
        e.currentTarget.style.borderColor = `${glowColor}60`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = ''
      }}
    >
      <Icon
        className="text-base shrink-0 transition-colors duration-300"
        style={{ color: glowColor }}
        aria-hidden="true"
      />
      <span className="font-mono text-xs text-text-secondary group-hover:text-text-primary transition-colors duration-300">
        {name}
      </span>
    </div>
  )
}
