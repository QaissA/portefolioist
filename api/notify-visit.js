// Vercel serverless function — notifies you by email when someone visits.
// The Resend API key lives here (server-side) and is never exposed to the browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Fail quietly so a missing config never breaks the visitor's page.
    return res.status(200).json({ ok: false, reason: 'not_configured' })
  }

  const to = process.env.NOTIFY_TO || 'qaissabdelhamid@gmail.com'
  const from = process.env.NOTIFY_FROM || 'Portfolio <onboarding@resend.dev>'

  // Visitor context (best-effort — nothing here is trusted/critical).
  const body = typeof req.body === 'object' && req.body ? req.body : {}
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  const country = req.headers['x-vercel-ip-country'] || 'unknown'
  const city = req.headers['x-vercel-ip-city'] || 'unknown'
  const userAgent = req.headers['user-agent'] || 'unknown'
  const referrer = body.referrer || 'direct'
  const page = body.page || 'unknown'
  const tz = body.timezone || 'unknown'
  const screen = body.screen || 'unknown'
  const when = new Date().toISOString()

  const text = [
    `New visit on your portfolio`,
    ``,
    `Time:      ${when}`,
    `Page:      ${page}`,
    `Referrer:  ${referrer}`,
    `Location:  ${decodeURIComponent(city)}, ${country}`,
    `IP:        ${ip}`,
    `Timezone:  ${tz}`,
    `Screen:    ${screen}`,
    `Device:    ${userAgent}`,
  ].join('\n')

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: `👀 New portfolio visit — ${decodeURIComponent(city)}, ${country}`,
        text,
      }),
    })

    if (!r.ok) {
      const detail = await r.text()
      return res.status(200).json({ ok: false, reason: 'resend_error', detail })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(200).json({ ok: false, reason: 'exception', detail: String(err) })
  }
}
