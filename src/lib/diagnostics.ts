import { useApp } from '@/store/useApp'
import { getLanguage } from '@/i18n'

const ERROR_LOG_KEY = 'jessica-error-log'
const CRASH_KEY = 'jessica-last-crash'

export function rememberCrash(error: string) {
  try {
    sessionStorage.setItem(CRASH_KEY, error.slice(0, 3000))
  } catch {
    /* ignore */
  }
}

export function lastCrash(): string {
  try {
    const crash = sessionStorage.getItem(CRASH_KEY)
    if (crash) return crash
    const log = JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || '[]') as { message?: string; at?: string }[]
    const first = log[0]
    return first ? `${first.message || 'Unknown error'} · ${first.at || ''}` : ''
  } catch {
    return ''
  }
}

export function autoSummary(): string {
  const arabic = getLanguage() === 'ar'
  const page =
    typeof location !== 'undefined'
      ? location.hash.replace(/^#\/?/, '').split('?')[0] || 'home'
      : 'home'
  return arabic
    ? `التطبيق حصل فيه خطأ وأنا على صفحة «${page}». التفاصيل التقنية مرفقة تلقائيًا — مش محتاج تشرح حاجة.`
    : `Something went wrong on the "${page}" page. Technical details are attached automatically — no need to explain.`
}

export function buildReport(input: { kind: string; message: string; contact?: string; name?: string }) {
  const state = useApp.getState()
  const settings = state.settings
  const crash = input.kind.toLowerCase().includes('bug') ? lastCrash() : ''
  const lines = [
    `[${input.kind}] Jessica`,
    '',
    input.message.trim(),
    '',
    '—',
    input.contact?.trim() ? `Contact: ${input.contact.trim()}` : '',
    input.name ? `Name: ${input.name}` : '',
    `Page: ${typeof location !== 'undefined' ? location.href : ''}`,
    `Language: ${settings.language}`,
    `Grade: ${settings.gradeLevel}`,
    `School: ${settings.schoolType}`,
    `Provider: ${settings.aiProvider}`,
    `Online: ${typeof navigator !== 'undefined' ? navigator.onLine : 'unknown'}`,
    `Device: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'}`,
    crash ? `Last error: ${crash}` : '',
    `Date: ${new Date().toISOString()}`,
  ]
  return lines.filter(Boolean).join('\n')
}
