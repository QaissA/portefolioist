import { useEffect, useRef, useState } from 'react'
import { joinRoom, selfId } from 'trystero'

// Trystero's default strategy is nostr (public relays) — no backend, no keys.
// Everyone in Drive Mode joins the same room and sees each other drive.
const APP_ID = 'qaiss-portfolio-drive-v1'
const ROOM = 'world'
const SEND_HZ = 15

const COLORS = ['#22d3ee', '#f43f5e', '#a855f7', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#f97316']

// Stable per-peer color derived from the peer id (no shared state needed).
function colorFor(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}

const r2 = (n) => Math.round(n * 100) / 100

/**
 * Peer-to-peer presence for Drive Mode via Trystero (WebRTC + public nostr
 * signaling — no server). Broadcasts our car pose and keeps a live map of
 * other players' poses in peersRef (mutated outside React so pose updates never
 * re-render). `count` (state) tracks how many are online, incl. self.
 *
 * @param posRef  ref holding the local car pose { x, z, heading, speed, drifting }
 * @param nameRef ref holding the local display name (may be empty → auto handle)
 */
export function useMultiplayer(posRef, nameRef) {
  const peersRef = useRef(new Map()) // peerId -> { target, cur, color, name, drifting, last }
  const [count, setCount] = useState(1)

  useEffect(() => {
    let room
    let alive = true
    const peers = peersRef.current
    const fallbackName = `Driver-${selfId.slice(0, 4)}`

    try {
      room = joinRoom({ appId: APP_ID }, ROOM)
      console.info('[mp] joined room as', selfId)
    } catch (err) {
      // signaling unavailable — single-player still works fine
      console.warn('[mp] joinRoom failed:', err)
      return
    }

    // Trystero 0.25 API: makeAction returns an object with `send` + an
    // assignable `onMessage`; peer callbacks are assignable properties.
    const pose = room.makeAction('pose')

    pose.onMessage = (data, ctx) => {
      const peerId = ctx && ctx.peerId
      if (!peerId || !data || typeof data.x !== 'number') return
      let p = peers.get(peerId)
      if (!p) {
        p = { cur: { x: data.x, z: data.z, heading: data.h }, color: colorFor(peerId) }
        peers.set(peerId, p)
        setCount(peers.size + 1)
        console.info('[mp] first pose from', peerId)
      }
      p.target = { x: data.x, z: data.z, heading: data.h, speed: data.s || 0 }
      p.name = data.n || peerId.slice(0, 6)
      p.drifting = !!data.d
      p.last = Date.now()
    }

    room.onPeerJoin = (peerId) => {
      console.info('[mp] peer joined', peerId)
      setCount(peers.size + 1)
    }
    room.onPeerLeave = (peerId) => {
      console.info('[mp] peer left', peerId)
      peers.delete(peerId)
      setCount(peers.size + 1)
    }

    const interval = setInterval(() => {
      if (!alive) return
      const p = posRef.current
      if (!p) return
      try {
        pose.send({
          x: r2(p.x),
          z: r2(p.z),
          h: r2(p.heading),
          s: Math.round(p.speed || 0),
          n: (nameRef.current || '').trim() || fallbackName,
          d: !!p.drifting,
        })
      } catch {
        /* no peers yet / transient send error — ignore */
      }
    }, 1000 / SEND_HZ)

    return () => {
      alive = false
      clearInterval(interval)
      try {
        room.leave()
      } catch {
        /* ignore */
      }
      peers.clear()
    }
  }, [posRef, nameRef])

  return { peersRef, count }
}
