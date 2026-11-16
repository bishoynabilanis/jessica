/**
 * Jessica — free-trial proxy (Cloudflare Worker, zero dependencies).
 *
 * Holds one shared Gemini key, forwards only the shapes the app sends, and
 * enforces a per-IP daily limit using the Cache API so no KV or database is
 * needed. Deploy steps live in DEPLOY.md beside this file.
 *
 *   POST /generate  { system, parts, history, temperature, maxOutputTokens, json }
 *   GET  /health    { ok: true, model, limit }
 */

const ALLOWED_ORIGINS = [/^https:\/\/bishoynabilanis\.github\.io$/, /^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/]
const DAILY_LIMIT = 15
const GEMINI_ROOT = 'https://generativelanguage.googleapis.com/v1beta'
const ARABIC_LIMIT = 'الاستخدام المجاني النهارده خلص. تقدر تستنى لبكرة، أو تحط مفتاح Gemini بتاعك في الإعدادات وتكمل من غير حدود.'
const ARABIC_ERROR = 'حصلت مشكلة مؤقتة في الخدمة. جرّب تاني بعد شوية.'

function corsHeaders(origin) {
  const allowed = origin && ALLOWED_ORIGINS.some((pattern) => pattern.test(origin))
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://bishoynabilanis.github.io',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(origin) },
  })
}

function dayKey() {
  return new Date().toISOString().slice(0, 10)
}

async function readCount(ip) {
  const key = `https://limit.jessica.internal/${ip}/${dayKey()}`
  const hit = await caches.default.match(key)
  if (!hit) return 0
  const value = await hit.text()
  return Number.parseInt(value, 10) || 0
}

async function writeCount(ip, count) {
  const key = `https://limit.jessica.internal/${ip}/${dayKey()}`
  await caches.default.put(
    key,
    new Response(String(count), {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    }),
  )
}

function toGeminiBody(payload) {
  const contents = []
  for (const item of payload.history || []) {
    if (!item || !Array.isArray(item.parts)) continue
    contents.push({ role: item.role === 'model' ? 'model' : 'user', parts: item.parts })
  }
  contents.push({ role: 'user', parts: Array.isArray(payload.parts) ? payload.parts : [] })

  const body = {
    contents,
    generationConfig: {
      temperature: typeof payload.temperature === 'number' ? payload.temperature : 0.6,
      maxOutputTokens: typeof payload.maxOutputTokens === 'number' ? payload.maxOutputTokens : 1200,
    },
  }
  if (payload.system) body.systemInstruction = { parts: [{ text: String(payload.system).slice(0, 12000) }] }
  if (payload.json) body.generationConfig.responseMimeType = 'application/json'
  return body
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    const url = new URL(request.url)

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, model: env.GEMINI_MODEL || 'gemini-2.0-flash', limit: DAILY_LIMIT }, 200, origin)
    }

    if (request.method !== 'POST' || url.pathname !== '/generate') {
      return json({ error: 'Not found' }, 404, origin)
    }

    if (!env.GEMINI_API_KEY) {
      return json({ error: 'الخدمة مش متظبطة على السيرفر. حط مفتاحك من الإعدادات.' }, 500, origin)
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const used = await readCount(ip)

    if (used >= DAILY_LIMIT) {
      return json({ error: ARABIC_LIMIT, code: 'RATE_LIMITED' }, 429, origin)
    }

    let payload
    try {
      payload = await request.json()
    } catch {
      return json({ error: 'الطلب مش مظبوط.' }, 400, origin)
    }

    if (!payload || !Array.isArray(payload.parts) || payload.parts.length === 0) {
      return json({ error: 'الطلب مش مظبوط.' }, 400, origin)
    }

    const model = env.GEMINI_MODEL || 'gemini-2.0-flash'
    const endpoint = `${GEMINI_ROOT}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`

    let upstream
    try {
      upstream = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toGeminiBody(payload)),
      })
    } catch {
      return json({ error: ARABIC_ERROR }, 502, origin)
    }

    const data = await upstream.json().catch(() => null)

    if (!upstream.ok) {
      const message = data?.error?.message || ARABIC_ERROR
      const status = upstream.status === 429 ? 429 : 502
      return json({ error: status === 429 ? ARABIC_LIMIT : message, code: status === 429 ? 'RATE_LIMITED' : 'UPSTREAM' }, status, origin)
    }

    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || '')
      .join('')
      .trim()

    if (!text) return json({ error: 'الموديل ماردش بحاجة. جرّب تاني.' }, 502, origin)

    await writeCount(ip, used + 1)
    return json({ text, remaining: Math.max(0, DAILY_LIMIT - (used + 1)) }, 200, origin)
  },
}
