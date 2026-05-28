import { useRef, useLayoutEffect } from 'react'
import { gsap, ScrollTrigger } from '@/utils/gsapConfig'

const NODES = [
  { id: 'input', label: 'User Prompt', x: 160, y: 20, type: 'io', w: 140, h: 44 },
  { id: 'orch', label: 'Orchestrator', x: 160, y: 110, type: 'core', w: 140, h: 44 },
  { id: 'router', label: 'Tool Router', x: 160, y: 200, type: 'core', w: 140, h: 44 },
  { id: 'search', label: 'Web Search', x: 30, y: 300, type: 'tool', w: 120, h: 40 },
  { id: 'codegen', label: 'Code Gen', x: 160, y: 300, type: 'tool', w: 120, h: 40 },
  { id: 'rag', label: 'RAG Chain', x: 290, y: 300, type: 'tool', w: 120, h: 40 },
  { id: 'memory', label: 'Context Memory', x: 160, y: 395, type: 'store', w: 140, h: 44 },
  { id: 'synth', label: 'Synthesizer', x: 160, y: 490, type: 'core', w: 140, h: 44 },
  { id: 'output', label: 'Final Output', x: 160, y: 580, type: 'io', w: 140, h: 44 },
]

const PATHS = [
  { from: 'input', to: 'orch' },
  { from: 'orch', to: 'router' },
  { from: 'router', to: 'search' },
  { from: 'router', to: 'codegen' },
  { from: 'router', to: 'rag' },
  { from: 'search', to: 'memory' },
  { from: 'codegen', to: 'memory' },
  { from: 'rag', to: 'memory' },
  { from: 'memory', to: 'synth' },
  { from: 'synth', to: 'output' },
]

function getCenter(node) {
  return { x: node.x + node.w / 2, y: node.y + node.h / 2 }
}

function getNodeColor(type) {
  if (type === 'core') return '#F59E0B'
  if (type === 'tool') return '#8B5CF6'
  if (type === 'store') return '#10B981'
  return '#38BDF8'
}

function buildPath(from, to) {
  const f = getCenter(from)
  const t = getCenter(to)
  const my = (f.y + t.y) / 2
  return `M ${f.x} ${f.y + from.h / 2 - 2} C ${f.x} ${my}, ${t.x} ${my}, ${t.x} ${t.y - to.h / 2 + 2}`
}

export default function AgentFlowDiagram() {
  const svgRef = useRef(null)
  const pathRefs = useRef([])
  const pulseRefs = useRef([])

  useLayoutEffect(() => {
    const paths = pathRefs.current.filter(Boolean)
    const pulses = pulseRefs.current.filter(Boolean)

    const ctx = gsap.context(() => {
      paths.forEach((path, i) => {
        const len = path.getTotalLength()
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          delay: i * 0.12,
          scrollTrigger: {
            trigger: svgRef.current,
            start: 'top 75%',
          },
        })
      })

      gsap.to(pulses, {
        opacity: 0.6,
        scale: 1.6,
        repeat: -1,
        yoyo: true,
        duration: 1.8,
        stagger: { each: 0.25, from: 'start' },
        ease: 'sine.inOut',
        transformOrigin: 'center center',
      })
    }, svgRef)

    return () => ctx.revert()
  }, [])

  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]))

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 460 640"
      className="w-full max-w-md mx-auto"
      aria-label="AI agent orchestration flow diagram"
    >
      {/* Path connections */}
      {PATHS.map((p, i) => {
        const from = nodeMap[p.from]
        const to = nodeMap[p.to]
        return (
          <path
            key={i}
            ref={(el) => (pathRefs.current[i] = el)}
            d={buildPath(from, to)}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
        )
      })}

      {/* Nodes */}
      {NODES.map((node, i) => {
        const color = getNodeColor(node.type)
        return (
          <g key={node.id}>
            {/* Pulse circle (behind node) */}
            <circle
              ref={(el) => (pulseRefs.current[i] = el)}
              cx={node.x + node.w / 2}
              cy={node.y + node.h / 2}
              r={node.w / 2 + 4}
              fill="none"
              stroke={color}
              strokeWidth="1"
              strokeOpacity="0"
              opacity="0"
            />
            {/* Node rect */}
            <rect
              x={node.x}
              y={node.y}
              width={node.w}
              height={node.h}
              rx="8"
              fill="#111111"
              stroke={color}
              strokeWidth="1"
              strokeOpacity="0.5"
            />
            {/* Label */}
            <text
              x={node.x + node.w / 2}
              y={node.y + node.h / 2 + 5}
              textAnchor="middle"
              fill={node.type === 'io' ? '#F5F5F5' : color}
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="500"
            >
              {node.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
