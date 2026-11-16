/**
 * The Egyptian voice that does not depend on what the device installed.
 *
 * The Web Speech API can only use voices the operating system ships. A Mac with
 * only `ar-001` will read Arabic in formal MSA forever, no matter which dialect
 * the app asks for. Gemini TTS supports Egyptian Arabic directly, so this file
 * turns the user's own Gemini key into a real Egyptian voice — no server of
 * ours, no stored audio, and the text never leaves the provider they chose.
 */

const ROOT = 'https://generativelanguage.googleapis.com/v1beta'

/** A Gemini TTS model; it is independent of the chat model in Settings. */
export const GEMINI_TTS_MODEL = 'gemini-3.8-flash-tts'

export interface CloudVoice {
  id: string
  name: string
  accent?: string
  description?: string
}

interface VoiceRow {
  id?: string
  name?: string
  display_name?: string
  displayName?: string
  accent?: string
  description?: string
}

const voiceId = (row: VoiceRow): string => row.id || (row.name || '').split('/').pop() || ''

/** Ask the voice library for real Egyptian voices for this key. */
export async function listEgyptianVoices(key: string, signal?: AbortSignal): Promise<CloudVoice[]> {
  const params = new URLSearchParams()
  params.append('language_code', 'ar-EG')
  params.append('accent', 'Egyptian')
  params.append('page_size', '50')
  const response = await fetch(`${ROOT}/voices?${params.toString()}`, {
    headers: { 'x-goog-api-key': key.trim() },
    signal,
  })
  if (!response.ok) throw new Error(`voice list failed (${response.status})`)
  const data = (await response.json()) as { voices?: VoiceRow[] }
  return (data.voices || [])
    .map((row) => ({
      id: voiceId(row),
      name: row.display_name || row.displayName || voiceId(row),
      accent: row.accent,
      description: row.description,
    }))
    .filter((voice) => voice.id)
}

function collectBase64(payload: unknown): string {
  const data = payload as {
    steps?: Array<{ type?: string; content?: Array<{ type?: string; data?: string }> }>
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string }; inline_data?: { data?: string } }> } }>
  }
  let audio = ''
  for (const step of data.steps || []) {
    for (const block of step.content || []) {
      if (block?.type === 'audio' && block.data) audio = block.data
    }
  }
  if (audio) return audio
  for (const candidate of data.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      const inline = part.inlineData || part.inline_data
      if (inline?.data) audio = inline.data
    }
  }
  return audio
}

function toBlob(base64: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return new Blob([bytes], { type: 'audio/wav' })
}

export interface SynthesizeInput {
  key: string
  text: string
  /** Voice id from the library, e.g. Kore or a `voice_…` id. */
  voice: string
  /** Tone and dialect hint; the transcript itself stays verbatim. */
  style?: string
  signal?: AbortSignal
}

/** One request in, one WAV out (Gemini returns a complete RIFF file). */
export async function synthesizeSpeech({ key, text, voice, style, signal }: SynthesizeInput): Promise<Blob> {
  const body = {
    model: GEMINI_TTS_MODEL,
    input: [
      {
        type: 'user_input',
        content: [
          {
            type: 'text',
            text,
            ...(style ? { annotations: [{ type: 'speech_metadata', style }] } : {}),
          },
        ],
      },
    ],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice: voice || 'Kore' }] },
  }

  const response = await fetch(`${ROOT}/interactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key.trim(),
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    let detail = ''
    try {
      const error = (await response.json()) as { error?: { message?: string } }
      detail = error.error?.message || ''
    } catch {
      /* the status is enough */
    }
    throw new Error(detail || `speech failed (${response.status})`)
  }

  const payload = (await response.json()) as unknown
  const base64 = collectBase64(payload)
  if (!base64) throw new Error('speech returned no audio')
  return toBlob(base64)
}
