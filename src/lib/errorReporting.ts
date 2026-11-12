import { useApp } from '@/store/useApp'
import { ERROR_ENDPOINT } from '@/data/support'

const LAST_SENT_KEY = 'jessica-last-error-sent'
const SEEN_KEY = 'jessica-seen-errors'

function hash(text: string) {
  let result = 0
  for (let index = 0; index < text.length; index += 1) {
    result = (result * 31 + text.charCodeAt(index)) >>> 0
  }
  return result.toString(36)
}

function shouldSend(message: string) {
  if (typeof window === 'undefined') return false
  const settings = useApp.getState().settings
  if (settings.shareErrors === false) return false
  try {
    const last = Number(localStorage.getItem(LAST_SENT_KEY) || 0)
    if (Date.now() - last < 5 * 60 * 1000) return false
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}') as Record<string, number>
    const key = hash(message)
    if (seen[key] && Date.now() - seen[key] < 6 * 60 * 60 * 1000) return false
    const fresh: Record<string, number> = { [key]: Date.now() }
    for (const [item, at] of Object.entries(seen)) {
      if (Date.now() - at < 24 * 60 * 60 * 1000) fresh[item] = at
    }
    localStorage.setItem(SEEN_KEY, JSON.stringify(fresh))
    localStorage.setItem(LAST_SENT_KEY, String(Date.now()))
    return true
  } catch {
    return true
  }
}

/** Sends a small, anonymous crash report. Never includes keys, names or book content. */
export async function reportError(input: { message: string; stack?: string; source?: string }) {
  if (!input.message || !shouldSend(input.message)) return
  const settings = useApp.getState().settings
  const page = typeof location !== 'undefined' ? location.hash.replace(/^#\/?/, '').split('?')[0] || 'home' : 'unknown'
  const body = [
    `Message: ${input.message.slice(0, 300)}`,
    `Source: ${input.source || 'app'}`,
    `Page: ${page}`,
    `Language: ${settings.language} · Grade: ${settings.gradeLevel} · Provider: ${settings.aiProvider}`,
    `Online: ${typeof navigator !== 'undefined' ? navigator.onLine : 'unknown'}`,
    `Device: ${typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 180) : 'unknown'}`,
    input.stack ? `Stack: ${input.stack.slice(0, 900)}` : '',
    `At: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    await fetch(ERROR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        Title: 'Jessica error',
        Tags: 'bug',
      },
      body,
      keepalive: true,
    })
  } catch {
    /* never block the app */
  }
}
