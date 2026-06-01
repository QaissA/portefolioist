import { useState, useRef, useMemo } from 'react'
import { useGame } from '@/game/GameContext'
import { NODES, PATHS, getCenter, getNodeColor, buildPath } from './AgentFlowDiagram'

const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]))
const edgeSet = new Set(PATHS.map((p) => `${p.from}>${p.to}`))
const nextOf = (id) => PATHS.filter((p) => p.from === id).map((p) => p.to)

export default function AIRouteGame() {
  const { completeGame } = useGame()
  const [route, setRoute] = useState([]) // visited node ids, in order
  const [misclicks, setMisclicks] = useState(0)
  const [flash, setFlash] = useState(null) // node id flashing red
  const doneRef = useRef(false)

  const current = route[route.length - 1] || null
  const won = current === 'output'
  const allowed = useMemo(
    () => (route.length === 0 ? ['input'] : nextOf(current)),
    [route, current],
  )

  const flashInvalid = (id) => {
    setFlash(id)
    setTimeout(() => setFlash((f) => (f === id ? null : f)), 350)
  }

  const handleClick = (id) => {
    if (won) return
    if (route.length === 0) {
      if (id === 'input') setRoute(['input'])
      else flashInvalid(id)
      return
    }
    if (route.includes(id)) return
    if (edgeSet.has(`${current}>${id}`)) {
      const next = [...route, id]
      setRoute(next)
      if (id === 'output' && !doneRef.current) {
        doneRef.current = true
        const score = Math.max(50, 300 - misclicks * 25)
        completeGame('ai', { score, xp: 100 + score })
      }
    } else {
      setMisclicks((m) => m + 1)
      flashInvalid(id)
    }
  }

  const reset = () => {
    doneRef.current = false
    setRoute([])
    setMisclicks(0)
    setFlash(null)
  }

  // which drawn paths are part of the traversed route (consecutive pairs)
  const traversed = new Set()
  for (let i = 0; i < route.length - 1; i++) traversed.add(`${route[i]}>${route[i + 1]}`)

  return (
    <div className="select-none">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 font-mono text-xs">
        <span className="text-amber">{'> prompt_router'}</span>
        <span className="text-text-secondary">
          Misroutes <span className="text-text-primary">{misclicks}</span>
        </span>
        <button
          onClick={reset}
          className="ml-auto text-text-muted hover:text-amber transition-colors"
        >
          ↻ reset
        </button>
      </div>

      <p className="text-text-secondary text-sm font-display mb-5 max-w-md">
        {won
          ? '✓ Valid pipeline! The prompt reached Final Output.'
          : 'Route the prompt from User Prompt to Final Output. Click connected nodes only — follow the arrows of the pipeline.'}
      </p>

      <svg viewBox="0 0 460 640" className="w-full max-w-md mx-auto" aria-label="Route the prompt puzzle">
        {/* edges */}
        {PATHS.map((p, i) => {
          const key = `${p.from}>${p.to}`
          const active = traversed.has(key)
          return (
            <path
              key={i}
              d={buildPath(nodeMap[p.from], nodeMap[p.to])}
              fill="none"
              stroke={active ? '#F59E0B' : '#2A2A2A'}
              strokeWidth={active ? 2.5 : 1.5}
              strokeOpacity={active ? 1 : 0.5}
            />
          )
        })}

        {/* nodes */}
        {NODES.map((node) => {
          const color = getNodeColor(node.type)
          const c = getCenter(node)
          const visited = route.includes(node.id)
          const isCurrent = current === node.id
          const isAllowed = !won && allowed.includes(node.id)
          const isFlash = flash === node.id

          let stroke = color
          let strokeOpacity = 0.4
          let fill = '#111111'
          if (visited) { fill = color; strokeOpacity = 1 }
          if (isAllowed) { strokeOpacity = 1 }
          if (isFlash) { stroke = '#F43F5E'; strokeOpacity = 1 }

          return (
            <g
              key={node.id}
              onClick={() => handleClick(node.id)}
              style={{ cursor: won ? 'default' : 'pointer' }}
            >
              {/* pulse ring on the legal next moves */}
              {isAllowed && (
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={node.w / 2 + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  opacity="0.6"
                >
                  <animate attributeName="r" values={`${node.w / 2 + 4};${node.w / 2 + 12};${node.w / 2 + 4}`} dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.4s" repeatCount="indefinite" />
                </circle>
              )}
              <rect
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                rx="8"
                fill={fill}
                stroke={stroke}
                strokeWidth={isCurrent ? 2.5 : 1.5}
                strokeOpacity={strokeOpacity}
              />
              <text
                x={c.x}
                y={c.y + 5}
                textAnchor="middle"
                fill={visited ? '#0A0A0A' : node.type === 'io' ? '#F5F5F5' : color}
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="500"
                style={{ pointerEvents: 'none' }}
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>

      {won && (
        <div className="text-center mt-4">
          <button
            onClick={reset}
            className="font-mono text-xs text-text-muted hover:text-amber transition-colors"
          >
            ↻ route another path
          </button>
        </div>
      )}
    </div>
  )
}
