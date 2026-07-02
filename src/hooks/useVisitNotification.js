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

    const payload = {
      page: window.location.pathname,
      referrer: document.referrer || 'direct',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${window.screen.width}x${window.screen.height}`,
    }

    fetch('/api/notify-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Never let a notification failure affect the visitor.
    })
  }, [])
}
