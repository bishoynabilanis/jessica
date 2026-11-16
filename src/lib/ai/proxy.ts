import { PROXY_ENDPOINT_URL, proxyConfigured } from './config'
import { consumeTrial, trialRemaining } from './trial'
import { notifyAiNeed } from './setup'
import type { GenerateOptions, Part } from '@/lib/gemini'

/**
 * The free-trial path: no key, one request to our own Cloudflare Worker, which
 * holds the shared key and enforces a per-IP daily limit. The local counter
 * keeps the UI honest and stops the user before the network even leaves.
 */

export class TrialLimitError extends Error {
  constructor() {
    super('TRIAL_LIMIT')
    this.name = 'TrialLimitError'
  }
}

export class ProxyUnavailableError extends Error {
  constructor() {
    super('PROXY_UNAVAILABLE')
    this.name = 'ProxyUnavailableError'
  }
}

const ARABIC_LIMIT = 'الاستخدام المجاني النهارده خلص. تقدر تستنى لبكرة، أو تحط مفتاح Gemini بتاعك وتكمل من غير حدود.'

export async function proxyGenerate(opts: Omit<GenerateOptions, 'apiKey'>): Promise<string> {
  if (!proxyConfigured()) throw new ProxyUnavailableError()

  if (trialRemaining() <= 0) {
    notifyAiNeed('limit')
    throw new TrialLimitError()
  }

  const body = {
    system: opts.system || '',
    parts: opts.parts.map((part: Part) => ('text' in part ? { text: part.text } : { inlineData: part.inlineData })),
    history: (opts.history || []).map((item) => ({
      role: item.role === 'model' ? 'model' : 'user',
      parts: item.parts.map((part) => ('text' in part ? { text: part.text } : { inlineData: part.inlineData })),
    })),
    temperature: opts.temperature,
    maxOutputTokens: opts.maxOutputTokens,
    json: Boolean(opts.json),
  }

  let response: Response
  try {
    response = await fetch(`${PROXY_ENDPOINT_URL.replace(/\/+$/, '')}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: opts.signal,
    })
  } catch {
    throw new ProxyUnavailableError()
  }

  if (response.status === 429) {
    notifyAiNeed('limit')
    throw new TrialLimitError()
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(detail || `Proxy error ${response.status}`)
  }

  consumeTrial()
  const data = (await response.json().catch(() => null)) as { text?: string; error?: string } | null
  if (data?.error) throw new Error(data.error)
  const text = data?.text || ''
  if (!text.trim()) throw new Error(ARABIC_LIMIT)
  return text
}
