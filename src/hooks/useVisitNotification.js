import { useEffect } from 'react'

// Pings the /api/notify-visit function once per browser session so you get
// an email when someone lands on the portfolio. Deduped via sessionStorage so
// reloads and React StrictMode double-mounts don't spam you.
export function useVisitNotification() {
  useEffect(() => {
    const KEY = 'visit-notified'
    try {
      if (sessionStorage.getItem(KEY)) return
      sessionStorage.setItem(KEY, '1')
    } catch {
      // Private mode / storage disabled — skip rather than risk repeat sends.
      return
    }

    // New vs. returning visitor + a running visit counter (persists across
    // sessions via localStorage; sessionStorage above only dedupes one session).
    let isReturning = false
    let visitCount = 1
    try {
      const prev = parseInt(localStorage.getItem('visit-count') || '0', 10)
      isReturning = prev > 0
      visitCount = prev + 1
      localStorage.setItem('visit-count', String(visitCount))
    } catch {
      // localStorage unavailable — leave defaults.
    }

    const nav = navigator
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection

    const payload = {
      // Location within the site + how they got here.
      page: window.location.pathname,
      url: window.location.href,
      query: window.location.search || '',
      referrer: document.referrer || 'direct',

      // Locale & time.
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      localTime: new Date().toLocaleString(),
      language: nav.language || 'unknown',
      languages: Array.isArray(nav.languages) ? nav.languages.join(', ') : '',

      // Display.
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio || 1,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light',

      // Device hints.
      cores: nav.hardwareConcurrency || 'unknown',
      memory: nav.deviceMemory || 'unknown',
      touch: (nav.maxTouchPoints || 0) > 0,
      connection: conn?.effectiveType || 'unknown',

      // Visitor history.
      isReturning,
      visitCount,
    }

    fetch('/api/notify-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Never let a notification failure affect the visitor.
    })

    // --- Session timing ---------------------------------------------------
    // Measure how long they stayed, and how much of that was spent in the 3D
    // Drive Mode (which fires drivemode:on / drivemode:off on enter / exit).
    const sessionStart = Date.now()
    let sceneMs = 0
    let sceneEnterAt = null
    const onSceneOn = () => {
      sceneEnterAt = Date.now()
    }
    const onSceneOff = () => {
      if (sceneEnterAt) {
        sceneMs += Date.now() - sceneEnterAt
        sceneEnterAt = null
      }
    }
    window.addEventListener('drivemode:on', onSceneOn)
    window.addEventListener('drivemode:off', onSceneOff)

    // Report the durations once, when the visitor leaves. Prefer sendBeacon so
    // it survives the page unload; visibilitychange→hidden is the most reliable
    // "leaving" signal across desktop and mobile.
    let ended = false
    const sendEnd = () => {
      if (ended) return
      ended = true
      if (sceneEnterAt) {
        sceneMs += Date.now() - sceneEnterAt
        sceneEnterAt = null
      }
      const data = JSON.stringify({
        event: 'session_end',
        dwellMs: Date.now() - sessionStart,
        sceneMs,
        page: window.location.pathname,
        isReturning,
        visitCount,
      })
      try {
        const blob = new Blob([data], { type: 'application/json' })
        if (navigator.sendBeacon && navigator.sendBeacon('/api/notify-visit', blob)) return
      } catch {
        // sendBeacon unavailable — fall through to fetch.
      }
      fetch('/api/notify-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
      }).catch(() => {})
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') sendEnd()
    }
    window.addEventListener('pagehide', sendEnd)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('drivemode:on', onSceneOn)
      window.removeEventListener('drivemode:off', onSceneOff)
      window.removeEventListener('pagehide', sendEnd)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
}
