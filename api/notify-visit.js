// Vercel serverless function — notifies you by email when someone visits.
// The Resend API key lives here (server-side) and is never exposed to the browser.

// Escape untrusted values before dropping them into the HTML email.
function esc(v) {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Turn a 2-letter ISO country code into its flag emoji (e.g. "MA" -> 🇲🇦).
function flag(code) {
  if (!/^[A-Za-z]{2}$/.test(code)) return ''
  const A = 0x1f1e6
  return String.fromCodePoint(
    A + code.toUpperCase().charCodeAt(0) - 65,
    A + code.toUpperCase().charCodeAt(1) - 65,
  )
}

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
  const city = decodeURIComponent(req.headers['x-vercel-ip-city'] || 'unknown')
  const userAgent = req.headers['user-agent'] || 'unknown'
  const referrer = body.referrer || 'direct'
  const page = body.page || 'unknown'
  const tz = body.timezone || 'unknown'
  const screen = body.screen || 'unknown'

  const now = new Date()
  const when = now.toISOString()
  // Human-friendly UTC stamp, e.g. "Jul 2, 2026, 14:32 UTC".
  const whenPretty =
    now.toLocaleString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' UTC'

  const locParts = []
  if (city !== 'unknown') locParts.push(city)
  if (country !== 'unknown') locParts.push(country)
  const locationLabel = locParts.length
    ? `${locParts.join(', ')} ${flag(country)}`.trim()
    : 'Unknown location'

  // --- plain-text fallback (clients that don't render HTML) ---
  const text = [
    `New visit on your portfolio`,
    ``,
    `Time:      ${whenPretty}`,
    `Page:      ${page}`,
    `Referrer:  ${referrer}`,
    `Location:  ${locationLabel}`,
    `IP:        ${ip}`,
    `Timezone:  ${tz}`,
    `Screen:    ${screen}`,
    `Device:    ${userAgent}`,
  ].join('\n')

  // --- HTML email ---
  const rows = [
    ['🌍', 'Location', locationLabel],
    ['🔗', 'Referrer', referrer],
    ['📄', 'Page', page],
    ['🕑', 'Local timezone', tz],
    ['🖥️', 'Screen', screen],
    ['📡', 'IP address', ip],
    ['🧭', 'Device', userAgent],
  ]

  const rowsHtml = rows
    .map(
      ([icon, label, value], i) => `
      <tr>
        <td style="padding:14px 20px;border-top:${
          i === 0 ? '0' : '1px solid #23262e'
        };vertical-align:top;width:150px;color:#8b909a;font-size:13px;font-weight:500;">
          <span style="font-size:15px;">${icon}</span>&nbsp;&nbsp;${esc(label)}
        </td>
        <td style="padding:14px 20px;border-top:${
          i === 0 ? '0' : '1px solid #23262e'
        };vertical-align:top;color:#e8eaed;font-size:14px;font-weight:500;word-break:break-word;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;">
          ${esc(value)}
        </td>
      </tr>`,
    )
    .join('')

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
</head>
<body style="margin:0;padding:0;background-color:#0b0c0f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0c0f;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#111318;border:1px solid #23262e;border-radius:16px;overflow:hidden;">
          <!-- header -->
          <tr>
            <td style="padding:28px 28px 22px 28px;background:linear-gradient(135deg,#6d5efc 0%,#4c8dff 100%);">
              <div style="font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.75);font-weight:600;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                Portfolio Alert
              </div>
              <div style="font-size:24px;line-height:1.25;margin-top:6px;color:#ffffff;font-weight:700;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                👀 New visitor just landed
              </div>
              <div style="font-size:13px;margin-top:8px;color:rgba(255,255,255,0.85);font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                ${esc(whenPretty)}
              </div>
            </td>
          </tr>
          <!-- details -->
          <tr>
            <td style="padding:8px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                ${rowsHtml}
              </table>
            </td>
          </tr>
          <!-- footer -->
          <tr>
            <td style="padding:18px 28px 24px 28px;border-top:1px solid #23262e;">
              <div style="font-size:12px;color:#6b7078;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.5;">
                Sent automatically from <span style="color:#9aa0aa;">portefolioist.vercel.app</span> · one email per visitor session.
              </div>
            </td>
          </tr>
        </table>
        <div style="font-size:11px;color:#4a4e57;margin-top:16px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          ${esc(when)}
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`

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
        subject: `👀 New portfolio visit — ${locationLabel}`,
        html,
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
