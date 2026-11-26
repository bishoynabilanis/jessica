import { OFFLINE_MODEL } from './config'

/**
 * Mode C: a small language model that runs in the browser through WebGPU.
 * The library is a separate file shipped with the app, loaded only when the user
 * asks for it, so the first load stays small. The model files download on demand.
 */

const READY_KEY = 'jessica-offline-model-v1'

type Progress = { progress: number; text: string }

interface EngineLike {
  chat: {
    completions: {
      create: (body: Record<string, unknown>) => Promise<{ choices: Array<{ message?: { content?: string } }> }>
    }
  }
  unload?: () => Promise<void>
}

let engine: EngineLike | null = null
let loading: Promise<void> | null = null

export interface OfflineSupport {
  webgpu: boolean
  ios: boolean
  memory: number
  ok: boolean
  reason: 'ok' | 'no-webgpu' | 'ios' | 'low-memory'
}

export function offlineSupport(): OfflineSupport {
  if (typeof navigator === 'undefined') return { webgpu: false, ios: false, memory: 8, ok: false, reason: 'no-webgpu' }
  const nav = navigator as Navigator & { gpu?: unknown; deviceMemory?: number }
  const ua = navigator.userAgent
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const webgpu = Boolean(nav.gpu)
  const memory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 8
  if (ios) return { webgpu, ios, memory, ok: false, reason: 'ios' }
  if (!webgpu) return { webgpu, ios, memory, ok: false, reason: 'no-webgpu' }
  if (memory < 6) return { webgpu, ios, memory, ok: false, reason: 'low-memory' }
  return { webgpu, ios, memory, ok: true, reason: 'ok' }
}

export function offlineReady(): boolean {
  try {
    return localStorage.getItem(READY_KEY) === '1'
  } catch {
    return false
  }
}

export function markOfflineReady() {
  try {
    localStorage.setItem(READY_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function clearOfflineReady() {
  try {
    localStorage.removeItem(READY_KEY)
  } catch {
    /* ignore */
  }
}

async function loadLib(): Promise<Record<string, unknown>> {
  // Shipped with the app (copied at build time from the pinned npm package); loaded only when asked.
  const url = new URL('vendor/web-llm.js', document.baseURI).href
  return (await import(/* @vite-ignore */ url)) as Record<string, unknown>
}

export async function loadOfflineModel(onProgress?: (progress: Progress) => void): Promise<void> {
  if (engine) return
  if (loading) {
    await loading
    return
  }
  loading = (async (): Promise<void> => {
    const mod = await loadLib()
    const create = mod.CreateMLCEngine as (
      model: string,
      options: { initProgressCallback?: (report: { progress?: number; text?: string }) => void },
    ) => Promise<EngineLike>
    if (!create) throw new Error('OFFLINE_UNAVAILABLE')
    const created = await create(OFFLINE_MODEL, {
      initProgressCallback: (report) =>
        onProgress?.({ progress: Math.max(0, Math.min(1, report.progress ?? 0)), text: report.text || '' }),
    })
    engine = created
    markOfflineReady()
  })()
  try {
    await loading
  } finally {
    loading = null
  }
}

export async function offlineGenerate(prompt: string, options: { temperature?: number; maxTokens?: number } = {}) {
  if (!engine) await loadOfflineModel()
  if (!engine) throw new Error('OFFLINE_UNAVAILABLE')
  const result = await engine.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 1200,
  })
  return result.choices?.[0]?.message?.content?.trim() || ''
}

/** Frees the ~1.8 GB of model files from this browser. */
export async function clearOfflineModel(): Promise<void> {
  try {
    await engine?.unload?.()
  } catch {
    /* ignore */
  }
  engine = null
  clearOfflineReady()
  try {
    const mod = await loadLib()
    const remove = (mod.deleteModelAllInfoInCache || mod.deleteModelCache) as ((model: string) => Promise<void>) | undefined
    if (remove) await remove(OFFLINE_MODEL)
  } catch {
    /* the CDN may be offline; the flag is already cleared */
  }
  try {
    if (typeof caches !== 'undefined') {
      const names = await caches.keys()
      await Promise.all(names.filter((name) => /webllm|mlc/i.test(name)).map((name) => caches.delete(name)))
    }
  } catch {
    /* ignore */
  }
}
