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

// Best-effort, dependency-free User-Agent parser -> "Chrome 120 on Windows 11".
function parseUA(ua) {
  if (!ua || ua === 'unknown') return { pretty: 'unknown', device: 'unknown', isBot: false }

  const isBot = /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|headless/i.test(ua)

  // OS
  let os = 'Unknown OS'
  let m
  if ((m = ua.match(/Windows NT ([\d.]+)/))) {
    const map = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' }
    os = `Windows ${map[m[1]] || m[1]}`
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    m = ua.match(/OS ([\d_]+)/)
    os = `iOS ${m ? m[1].replace(/_/g, '.') : ''}`.trim()
  } else if ((m = ua.match(/Mac OS X ([\d_]+)/))) {
    os = `macOS ${m[1].replace(/_/g, '.')}`
  } else if (/Android/.test(ua)) {
    m = ua.match(/Android ([\d.]+)/)
    os = `Android ${m ? m[1] : ''}`.trim()
  } else if (/Linux/.test(ua)) {
    os = 'Linux'
  }

  // Browser (order matters — Edge/Opera masquerade as Chrome)
  let browser = 'Unknown browser'
  if ((m = ua.match(/Edg(?:e|A|iOS)?\/([\d.]+)/))) browser = `Edge ${m[1].split('.')[0]}`
  else if ((m = ua.match(/OPR\/([\d.]+)/)) || (m = ua.match(/Opera\/([\d.]+)/))) browser = `Opera ${m[1].split('.')[0]}`
  else if ((m = ua.match(/SamsungBrowser\/([\d.]+)/))) browser = `Samsung Internet ${m[1].split('.')[0]}`
  else if ((m = ua.match(/Firefox\/([\d.]+)/))) browser = `Firefox ${m[1].split('.')[0]}`
  else if (/iPhone|iPad|iPod|Macintosh/.test(ua) && (m = ua.match(/Version\/([\d.]+).*Safari/))) browser = `Safari ${m[1].split('.')[0]}`
  else if ((m = ua.match(/Chrome\/([\d.]+)/))) browser = `Chrome ${m[1].split('.')[0]}`

  // Device type
  let device = 'Desktop'
  if (/iPad|Tablet/.test(ua)) device = 'Tablet'
  else if (/Mobi|iPhone|Android.*Mobile/.test(ua)) device = 'Mobile'

  return { pretty: `${browser} on ${os}`, device, isBot }
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
  const h = req.headers
  const ip = (h['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'

  // --- Geo (from Vercel edge headers) ---
  const country = h['x-vercel-ip-country'] || 'unknown'
  const city = decodeURIComponent(h['x-vercel-ip-city'] || 'unknown')
  const region = decodeURIComponent(h['x-vercel-ip-country-region'] || '')
  const lat = h['x-vercel-ip-latitude'] || ''
  const lng = h['x-vercel-ip-longitude'] || ''
  const geoTz = h['x-vercel-ip-timezone'] || ''
  const acceptLang = (h['accept-language'] || '').split(',')[0].trim() || 'unknown'
  const proto = h['x-forwarded-proto'] || 'unknown'

  // --- Device (parse the raw UA into something readable) ---
  const userAgent = h['user-agent'] || 'unknown'
  const { pretty: devicePretty, device: deviceType, isBot } = parseUA(userAgent)

  // --- Client-reported context (from the fetch body) ---
  const referrer = body.referrer || 'direct'
  const page = body.page || 'unknown'
  const url = body.url || 'unknown'
  const query = body.query || ''
  const tz = body.timezone || 'unknown'
  const localTime = body.localTime || 'unknown'
  const language = body.language || 'unknown'
  const screen = body.screen || 'unknown'
  const viewport = body.viewport || 'unknown'
  const pixelRatio = body.pixelRatio || 'unknown'
  const colorScheme = body.colorScheme || 'unknown'
  const cores = body.cores || 'unknown'
  const memory = body.memory || 'unknown'
  const touch = body.touch === true ? 'Yes' : body.touch === false ? 'No' : 'unknown'
  const connection = body.connection || 'unknown'
  const isReturning = body.isReturning === true
  const visitCount = body.visitCount || 'unknown'

  // Parse UTM / campaign params out of the query string, if any.
  const utm = {}
  try {
    const sp = new URLSearchParams(query)
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref']) {
      const val = sp.get(key)
      if (val) utm[key] = val
    }
  } catch {
    // Malformed query — ignore.
  }
  const utmLabel = Object.keys(utm).length
    ? Object.entries(utm).map(([k, v]) => `${k.replace('utm_', '')}=${v}`).join(' · ')
    : ''

  // One-click map link when we have coordinates.
  const mapsUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : ''

  const visitorType = isBot
    ? '🤖 Bot / crawler'
    : isReturning
      ? `Returning (visit #${visitCount})`
      : 'First-time visitor'

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
  if (region) locParts.push(region)
  if (country !== 'unknown') locParts.push(country)
  const locationLabel = locParts.length
    ? `${locParts.join(', ')} ${flag(country)}`.trim()
    : 'Unknown location'

  // --- plain-text fallback (clients that don't render HTML) ---
  const text = [
    `New visit on your portfolio`,
    ``,
    `Visitor:    ${visitorType}`,
    `Time:       ${whenPretty}`,
    `Local time: ${localTime}`,
    `Page:       ${page}`,
    `URL:        ${url}`,
    utmLabel ? `Campaign:   ${utmLabel}` : null,
    `Referrer:   ${referrer}`,
    `Location:   ${locationLabel}`,
    mapsUrl ? `Map:        ${mapsUrl}` : null,
    lat && lng ? `Coords:     ${lat}, ${lng}` : null,
    `Timezone:   ${tz}${geoTz && geoTz !== tz ? ` (geo: ${geoTz})` : ''}`,
    `Language:   ${language}${acceptLang !== 'unknown' ? ` / ${acceptLang}` : ''}`,
    `Device:     ${devicePretty} (${deviceType})`,
    `Theme:      ${colorScheme}`,
    `Screen:     ${screen} @${pixelRatio}x`,
    `Viewport:   ${viewport}`,
    `Touch:      ${touch}`,
    `Hardware:   ${cores} cores, ${memory}GB RAM`,
    `Connection: ${connection}`,
    `IP:         ${ip} (${proto})`,
    `User-Agent: ${userAgent}`,
  ]
    .filter(Boolean)
    .join('\n')

  // --- HTML email ---
  // Each row: [icon, label, value, optional href]. Rows with an empty value
  // are dropped so we never show blank fields.
  const rows = [
    ['👤', 'Visitor', visitorType],
    ['🌍', 'Location', locationLabel, mapsUrl],
    ['📍', 'Coordinates', lat && lng ? `${lat}, ${lng}` : ''],
    ['🔗', 'Referrer', referrer],
    ['📢', 'Campaign', utmLabel],
    ['📄', 'Page', page],
    ['🌐', 'Full URL', url === 'unknown' ? '' : url, url === 'unknown' ? '' : url],
    ['🕑', 'Local time', localTime],
    ['🧭', 'Timezone', geoTz && geoTz !== tz ? `${tz} (geo: ${geoTz})` : tz],
    ['🗣️', 'Language', acceptLang !== 'unknown' && acceptLang !== language ? `${language} / ${acceptLang}` : language],
    ['💻', 'Device', `${devicePretty} · ${deviceType}`],
    ['🎨', 'Theme', colorScheme],
    ['🖥️', 'Screen', pixelRatio !== 'unknown' ? `${screen} @${pixelRatio}x` : screen],
    ['📐', 'Viewport', viewport],
    ['✋', 'Touch', touch],
    ['⚙️', 'Hardware', cores !== 'unknown' || memory !== 'unknown' ? `${cores} cores · ${memory}GB RAM` : ''],
    ['📶', 'Connection', connection],
    ['📡', 'IP address', `${ip} · ${proto}`],
    ['🧬', 'User-Agent', userAgent],
  ].filter(([, , value]) => value && value !== 'unknown')

  const rowsHtml = rows
    .map(([icon, label, value, href], i) => {
      const valueInner = href
        ? `<a href="${esc(href)}" style="color:#6d9bff;text-decoration:none;">${esc(value)}</a>`
        : esc(value)
      return `
      <tr>
        <td style="padding:14px 20px;border-top:${
          i === 0 ? '0' : '1px solid #23262e'
        };vertical-align:top;width:150px;color:#8b909a;font-size:13px;font-weight:500;">
          <span style="font-size:15px;">${icon}</span>&nbsp;&nbsp;${esc(label)}
        </td>
        <td style="padding:14px 20px;border-top:${
          i === 0 ? '0' : '1px solid #23262e'
        };vertical-align:top;color:#e8eaed;font-size:14px;font-weight:500;word-break:break-word;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;">
          ${valueInner}
        </td>
      </tr>`
    })
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
        subject: isBot
          ? `🤖 Bot visit — ${locationLabel}`
          : `👀 New${isReturning ? ' (returning)' : ''} portfolio visit — ${locationLabel}`,
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
