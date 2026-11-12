import type { AiProvider, LanguageCode } from '@/types'
import { friendlyError } from './utils'
import { useApp } from '@/store/useApp'
import { GEMINI_MODELS as GEMINI_MODEL_LIST, providerFor, type ProviderModel } from './providers'

const GEMINI_ROOT = 'https://generativelanguage.googleapis.com/v1beta'
const ANTHROPIC_ROOT = 'https://api.anthropic.com'

export const GEMINI_MODELS: ProviderModel[] = GEMINI_MODEL_LIST
export const DEFAULT_MODEL = 'gemini-1.5-flash'

export type Part = { text: string } | { inlineData: { mimeType: string; data: string } }
export interface Content {
  role: 'user' | 'model'
  parts: Part[]
}

export interface GenerateOptions {
  apiKey: string
  model?: string
  system?: string
  parts: Part[]
  history?: Content[]
  temperature?: number
  maxOutputTokens?: number
  json?: boolean
  signal?: AbortSignal
  onChunk?: (text: string) => void
}

export class GeminiError extends Error {
  status: number
  constructor(message: string, status = 0) {
    super(message)
    this.name = 'GeminiError'
    this.status = status
  }
}

function currentProvider(): AiProvider {
  return useApp.getState().settings.aiProvider
}

function keyFor(opts: GenerateOptions) {
  return opts.apiKey.trim()
}

/* ------------------------------------------------------------------ */
/* Gemini                                                              */
/* ------------------------------------------------------------------ */

function geminiEndpoint(model: string, action: 'generateContent' | 'streamGenerateContent', key: string) {
  const suffix = action === 'streamGenerateContent' ? '&alt=sse' : ''
  return `${GEMINI_ROOT}/models/${encodeURIComponent(model)}:${action}?key=${encodeURIComponent(key)}${suffix}`
}

function buildGeminiBody(opts: GenerateOptions) {
  return {
    systemInstruction: opts.system ? { parts: [{ text: opts.system }] } : undefined,
    contents: [...(opts.history || []), { role: 'user' as const, parts: opts.parts }],
    generationConfig: {
      temperature: opts.temperature ?? 0.55,
      maxOutputTokens: opts.maxOutputTokens ?? 2048,
      ...(opts.json ? { responseMimeType: 'application/json' } : {}),
    },
  }
}

function extractGeminiText(data: unknown): string {
  const payload = data as {
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[]
    promptFeedback?: { blockReason?: string }
    error?: { message?: string; code?: number }
  }
  if (payload?.error?.message) throw new GeminiError(payload.error.message, payload.error.code || 0)
  if (payload?.promptFeedback?.blockReason) {
    throw new GeminiError(
      `The request was blocked for safety (${payload.promptFeedback.blockReason}). Try rephrasing.`,
      400,
    )
  }
  const candidate = payload?.candidates?.[0]
  const text = candidate?.content?.parts?.map((part) => part.text || '').join('') || ''
  if (!text && candidate?.finishReason) {
    throw new GeminiError(`The model stopped early (${candidate.finishReason}). Try again.`, 0)
  }
  return text
}

function geminiFallbacks(model: string) {
  const list = [model]
  if (model.startsWith('gemini-1.5')) list.push('gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-pro')
  return [...new Set(list)]
}

async function geminiRequestOnce(
  model: string,
  action: 'generateContent' | 'streamGenerateContent',
  opts: GenerateOptions,
): Promise<Response> {
  const res = await fetch(geminiEndpoint(model, action, keyFor(opts)), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildGeminiBody(opts)),
    signal: opts.signal,
  })
  if (!res.ok) {
    let message = `Gemini request failed (${res.status}).`
    try {
      const err = await res.json()
      message = err?.error?.message || message
    } catch {
      /* ignore */
    }
    throw new GeminiError(message, res.status)
  }
  return res
}

async function geminiGenerate(opts: GenerateOptions): Promise<string> {
  let lastError: unknown
  for (const model of geminiFallbacks(opts.model || DEFAULT_MODEL)) {
    try {
      const res = await geminiRequestOnce(model, 'generateContent', opts)
      const data = await res.json()
      return extractGeminiText(data)
    } catch (err) {
      lastError = err
      if (err instanceof DOMException && err.name === 'AbortError') throw err
      if (err instanceof GeminiError && (err.status === 404 || err.status === 400)) continue
      break
    }
  }
  throw new Error(friendlyError(lastError))
}

async function geminiStream(opts: GenerateOptions): Promise<string> {
  let lastError: unknown
  for (const model of geminiFallbacks(opts.model || DEFAULT_MODEL)) {
    try {
      const res = await geminiRequestOnce(model, 'streamGenerateContent', opts)
      if (!res.body) throw new GeminiError('This browser cannot stream responses.', 0)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const raw = trimmed.slice(5).trim()
          if (!raw || raw === '[DONE]') continue
          try {
            const chunk = extractGeminiText(JSON.parse(raw))
            if (chunk) {
              full += chunk
              opts.onChunk?.(chunk)
            }
          } catch {
            /* partial JSON line */
          }
        }
      }
      if (!full.trim()) throw new GeminiError('The model returned an empty reply. Try again.', 0)
      return full
    } catch (err) {
      lastError = err
      if (err instanceof DOMException && err.name === 'AbortError') throw err
      if (err instanceof GeminiError && (err.status === 404 || err.status === 400)) continue
      break
    }
  }
  throw new Error(friendlyError(lastError))
}

/* ------------------------------------------------------------------ */
/* OpenAI-compatible (OpenAI, OpenRouter, custom)                      */
/* ------------------------------------------------------------------ */

function compatibleBase(provider: AiProvider) {
  const settings = useApp.getState().settings
  const base = provider === 'custom' ? settings.aiBaseUrl : providerFor(provider).defaultBaseUrl
  return (base || 'https://api.openai.com/v1').replace(/\/+$/, '')
}

function openAIContent(parts: Part[]) {
  const hasImage = parts.some((part) => 'inlineData' in part)
  if (!hasImage) return parts.map((part) => ('text' in part ? part.text : '')).join('\n')
  return parts.map((part) =>
    'text' in part
      ? { type: 'text', text: part.text }
      : { type: 'image_url', image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` } },
  )
}

function toOpenAIMessages(opts: GenerateOptions) {
  const messages: { role: string; content: unknown }[] = []
  if (opts.system) messages.push({ role: 'system', content: opts.system })
  for (const item of opts.history || []) {
    messages.push({ role: item.role === 'model' ? 'assistant' : 'user', content: openAIContent(item.parts) })
  }
  messages.push({ role: 'user', content: openAIContent(opts.parts) })
  return messages
}

async function apiError(res: Response, label: string) {
  let message = `${label} request failed (${res.status}).`
  try {
    const data = await res.json()
    message = data?.error?.message || data?.message || message
  } catch {
    /* ignore */
  }
  return new GeminiError(message, res.status)
}

async function compatibleRequest(opts: GenerateOptions): Promise<Response> {
  const provider = currentProvider()
  const base = compatibleBase(provider)
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${keyFor(opts)}`,
      ...(provider === 'openrouter' && typeof location !== 'undefined'
        ? { 'HTTP-Referer': location.origin, 'X-Title': 'Jessica' }
        : {}),
    },
    body: JSON.stringify({
      model: opts.model || providerFor(provider).defaultModel,
      messages: toOpenAIMessages(opts),
      temperature: opts.temperature ?? 0.55,
      max_tokens: opts.maxOutputTokens ?? 2048,
      stream: Boolean(opts.onChunk),
      ...(opts.json && provider === 'openai' ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal: opts.signal,
  })
  if (!res.ok) throw await apiError(res, providerFor(provider).label)
  return res
}

function openAIText(data: unknown): string {
  const payload = data as { choices?: { message?: { content?: string | { text?: string }[] } }[]; error?: { message?: string } }
  if (payload?.error?.message) throw new GeminiError(payload.error.message, 0)
  const content = payload?.choices?.[0]?.message?.content
  if (typeof content === 'string') return content
  if (Array.isArray(content)) return content.map((item) => item.text || '').join('')
  return ''
}

async function compatibleGenerate(opts: GenerateOptions): Promise<string> {
  const res = await compatibleRequest(opts)
  const data = await res.json()
  const text = openAIText(data)
  if (!text.trim()) throw new GeminiError('The model returned an empty reply. Try again.', 0)
  return text
}

async function compatibleStream(opts: GenerateOptions): Promise<string> {
  const res = await compatibleRequest(opts)
  if (!res.body) throw new GeminiError('This browser cannot stream responses.', 0)
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const raw = trimmed.slice(5).trim()
      if (!raw || raw === '[DONE]') continue
      try {
        const json = JSON.parse(raw) as { choices?: { delta?: { content?: string } }[] }
        const chunk = json.choices?.[0]?.delta?.content || ''
        if (chunk) {
          full += chunk
          opts.onChunk?.(chunk)
        }
      } catch {
        /* partial line */
      }
    }
  }
  if (!full.trim()) throw new GeminiError('The model returned an empty reply. Try again.', 0)
  return full
}

/* ------------------------------------------------------------------ */
/* Anthropic                                                           */
/* ------------------------------------------------------------------ */

function anthropicContent(parts: Part[]) {
  return parts.map((part) =>
    'text' in part
      ? { type: 'text', text: part.text }
      : { type: 'image', source: { type: 'base64', media_type: part.inlineData.mimeType, data: part.inlineData.data } },
  )
}

async function anthropicRequest(opts: GenerateOptions): Promise<Response> {
  const res = await fetch(`${ANTHROPIC_ROOT}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': keyFor(opts),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: opts.model || providerFor('anthropic').defaultModel,
      system: opts.system,
      messages: [
        ...(opts.history || []).map((item) => ({
          role: item.role === 'model' ? 'assistant' : 'user',
          content: anthropicContent(item.parts),
        })),
        { role: 'user', content: anthropicContent(opts.parts) },
      ],
      max_tokens: opts.maxOutputTokens ?? 2048,
      temperature: opts.temperature ?? 0.55,
      stream: Boolean(opts.onChunk),
    }),
    signal: opts.signal,
  })
  if (!res.ok) throw await apiError(res, 'Anthropic')
  return res
}

function anthropicText(data: unknown): string {
  const payload = data as { content?: { type: string; text?: string }[]; error?: { message?: string } }
  if (payload?.error?.message) throw new GeminiError(payload.error.message, 0)
  return (payload.content || []).map((block) => (block.type === 'text' ? block.text || '' : '')).join('')
}

async function anthropicGenerate(opts: GenerateOptions): Promise<string> {
  const res = await anthropicRequest(opts)
  const data = await res.json()
  const text = anthropicText(data)
  if (!text.trim()) throw new GeminiError('The model returned an empty reply. Try again.', 0)
  return text
}

async function anthropicStream(opts: GenerateOptions): Promise<string> {
  const res = await anthropicRequest(opts)
  if (!res.body) throw new GeminiError('This browser cannot stream responses.', 0)
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const raw = trimmed.slice(5).trim()
      if (!raw) continue
      try {
        const json = JSON.parse(raw) as { type?: string; delta?: { type?: string; text?: string }; error?: { message?: string } }
        if (json.type === 'error' && json.error?.message) throw new GeminiError(json.error.message, 0)
        if (json.delta?.type === 'text_delta' && json.delta.text) {
          full += json.delta.text
          opts.onChunk?.(json.delta.text)
        }
      } catch (err) {
        if (err instanceof GeminiError) throw err
      }
    }
  }
  if (!full.trim()) throw new GeminiError('The model returned an empty reply. Try again.', 0)
  return full
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function generateText(opts: GenerateOptions): Promise<string> {
  if (!keyFor(opts)) throw new GeminiError('Add your API key in Settings first.', 401)
  const provider = currentProvider()
  if (provider === 'gemini') return geminiGenerate(opts)
  if (provider === 'anthropic') return anthropicGenerate(opts)
  return compatibleGenerate(opts)
}

export async function streamText(opts: GenerateOptions): Promise<string> {
  if (!keyFor(opts)) throw new GeminiError('Add your API key in Settings first.', 401)
  const provider = currentProvider()
  if (provider === 'gemini') return geminiStream(opts)
  if (provider === 'anthropic') return anthropicStream(opts)
  return compatibleStream(opts)
}

export async function generateJSON<T>(opts: Omit<GenerateOptions, 'json'>): Promise<T> {
  const { parseJsonLoose } = await import('./utils')
  let raw = await generateText({ ...opts, json: true })
  try {
    return parseJsonLoose<T>(raw)
  } catch {
    raw = await generateText({
      ...opts,
      json: true,
      temperature: 0,
      parts: [
        {
          text: `Convert the following into strictly valid JSON with no markdown or commentary. Keep all content.\n\n${raw}`,
        },
      ],
    })
    return parseJsonLoose<T>(raw)
  }
}

export async function validateKey(
  apiKey: string,
  providerOverride?: AiProvider,
): Promise<{ ok: boolean; message: string }> {
  const provider = providerOverride || currentProvider()
  if (!apiKey.trim()) return { ok: false, message: 'Enter a key first.' }
  try {
    if (provider === 'gemini') {
      const res = await fetch(`${GEMINI_ROOT}/models?key=${encodeURIComponent(apiKey)}&pageSize=50`)
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        return { ok: false, message: data?.error?.message || `Key rejected (${res.status}).` }
      }
      const data = await res.json()
      const names: string[] = (data.models || []).map((model: { name: string }) => model.name)
      return { ok: true, message: `Connected. ${names.length} models available to your key.` }
    }

    if (provider === 'anthropic') {
      const res = await fetch(`${ANTHROPIC_ROOT}/v1/models?limit=20`, {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        return { ok: false, message: data?.error?.message || `Key rejected (${res.status}).` }
      }
      const data = await res.json()
      const count = Array.isArray(data?.data) ? data.data.length : 0
      return { ok: true, message: `Connected. ${count || 'Claude'} models available.` }
    }

    const base = compatibleBase(provider)
    if (provider === 'custom') {
      const model = useApp.getState().model
      const res = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        return { ok: false, message: data?.error?.message || `Endpoint rejected the key (${res.status}).` }
      }
      return { ok: true, message: 'Connected to your endpoint.' }
    }

    const res = await fetch(`${base}/models`, { headers: { Authorization: `Bearer ${apiKey}` } })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      return { ok: false, message: data?.error?.message || `Key rejected (${res.status}).` }
    }
    const data = await res.json()
    const count = Array.isArray(data?.data) ? data.data.length : 0
    return { ok: true, message: `Connected. ${count} models available.` }
  } catch (err) {
    return { ok: false, message: friendlyError(err) }
  }
}

export function pdfLanguage(code: LanguageCode) {
  const map: Record<LanguageCode, string> = {
    en: 'English',
    ar: 'Arabic (Modern Standard with Egyptian Arabic support)',
    de: 'German',
    fr: 'French',
  }
  return map[code]
}
