import type { LanguageCode } from '@/types'
import { friendlyError } from './utils'

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta'

export const GEMINI_MODELS = [
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', hint: 'Recommended · fast multimodal' },
  { id: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash 8B', hint: 'Lightest · lowest cost' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', hint: 'Deeper reasoning · 1M context' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', hint: 'Newer fallback' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', hint: 'Newest fallback' },
]
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

function endpoint(model: string, action: 'generateContent' | 'streamGenerateContent', key: string) {
  const suffix = action === 'streamGenerateContent' ? '&alt=sse' : ''
  return `${API_ROOT}/models/${encodeURIComponent(model)}:${action}?key=${encodeURIComponent(key)}${suffix}`
}

function buildBody(opts: GenerateOptions) {
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

function extractText(data: unknown): string {
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
  const text = candidate?.content?.parts?.map((p) => p.text || '').join('') || ''
  if (!text && candidate?.finishReason) {
    throw new GeminiError(`The model stopped early (${candidate.finishReason}). Try again.`, 0)
  }
  return text
}

async function modelFallbacks(model: string) {
  const list = [model]
  if (model.startsWith('gemini-1.5')) {
    list.push('gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-pro')
  }
  return [...new Set(list)]
}

async function requestOnce(
  model: string,
  action: 'generateContent' | 'streamGenerateContent',
  opts: GenerateOptions,
): Promise<Response> {
  const res = await fetch(endpoint(model, action, opts.apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildBody(opts)),
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

/** Non-streaming generation with automatic model fallback for retired models. */
export async function generateText(opts: GenerateOptions): Promise<string> {
  if (!opts.apiKey) throw new GeminiError('Add your Gemini API key in Settings first.', 401)
  let lastError: unknown
  for (const model of await modelFallbacks(opts.model || DEFAULT_MODEL)) {
    try {
      const res = await requestOnce(model, 'generateContent', opts)
      const data = await res.json()
      return extractText(data)
    } catch (err) {
      lastError = err
      if (err instanceof GeminiError && (err.status === 404 || err.status === 400)) continue
      if (err instanceof DOMException && err.name === 'AbortError') throw err
      break
    }
  }
  throw new Error(friendlyError(lastError))
}

/** Streams tokens to onChunk and returns the full text. */
export async function streamText(opts: GenerateOptions): Promise<string> {
  if (!opts.apiKey) throw new GeminiError('Add your Gemini API key in Settings first.', 401)
  let lastError: unknown
  for (const model of await modelFallbacks(opts.model || DEFAULT_MODEL)) {
    try {
      const res = await requestOnce(model, 'streamGenerateContent', opts)
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
            const json = JSON.parse(raw)
            const chunk = extractText(json)
            if (chunk) {
              full += chunk
              opts.onChunk?.(chunk)
            }
          } catch {
            /* partial JSON line — wait for the next chunk */
          }
        }
      }
      if (!full.trim()) throw new GeminiError('Gemini returned an empty reply. Try again.', 0)
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

export async function generateJSON<T>(opts: Omit<GenerateOptions, 'json'>): Promise<T> {
  const { parseJsonLoose } = await import('./utils')
  let raw = await generateText({ ...opts, json: true })
  try {
    return parseJsonLoose<T>(raw)
  } catch {
    // One repair attempt: ask the model to fix its own JSON.
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

export async function validateKey(apiKey: string): Promise<{ ok: boolean; message: string }> {
  if (!apiKey.trim()) return { ok: false, message: 'Enter a key first.' }
  try {
    const res = await fetch(`${API_ROOT}/models?key=${encodeURIComponent(apiKey)}&pageSize=50`)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      return {
        ok: false,
        message: data?.error?.message || `Key rejected (${res.status}).`,
      }
    }
    const data = await res.json()
    const names: string[] = (data.models || []).map((m: { name: string }) => m.name)
    return {
      ok: true,
      message: `Connected. ${names.length} models available to your key.`,
    }
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
