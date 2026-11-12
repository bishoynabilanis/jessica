import type { Settings } from '@/types'

export interface VoiceLocale {
  id: string
  label: string
  language: string
}

/** Dialects and locales offered in Settings → Voice. */
export const VOICE_LOCALES: VoiceLocale[] = [
  { id: 'ar-EG', label: 'مصر', language: 'ar' },
  { id: 'ar-SA', label: 'السعودية', language: 'ar' },
  { id: 'ar-AE', label: 'الإمارات', language: 'ar' },
  { id: 'ar-KW', label: 'الكويت', language: 'ar' },
  { id: 'ar-QA', label: 'قطر', language: 'ar' },
  { id: 'ar-BH', label: 'البحرين', language: 'ar' },
  { id: 'ar-OM', label: 'عُمان', language: 'ar' },
  { id: 'ar-JO', label: 'الأردن', language: 'ar' },
  { id: 'ar-LB', label: 'لبنان', language: 'ar' },
  { id: 'ar-SY', label: 'سوريا', language: 'ar' },
  { id: 'ar-IQ', label: 'العراق', language: 'ar' },
  { id: 'ar-PS', label: 'فلسطين', language: 'ar' },
  { id: 'ar-MA', label: 'المغرب', language: 'ar' },
  { id: 'ar-DZ', label: 'الجزائر', language: 'ar' },
  { id: 'ar-TN', label: 'تونس', language: 'ar' },
  { id: 'ar-LY', label: 'ليبيا', language: 'ar' },
  { id: 'ar-SD', label: 'السودان', language: 'ar' },
  { id: 'ar-YE', label: 'اليمن', language: 'ar' },
  { id: 'ar', label: 'العربية الفصحى', language: 'ar' },
  { id: 'en-US', label: 'English (US)', language: 'en' },
  { id: 'en-GB', label: 'English (UK)', language: 'en' },
  { id: 'en-AU', label: 'English (Australia)', language: 'en' },
  { id: 'en-IN', label: 'English (India)', language: 'en' },
  { id: 'fr-FR', label: 'Français (France)', language: 'fr' },
  { id: 'fr-CA', label: 'Français (Canada)', language: 'fr' },
  { id: 'de-DE', label: 'Deutsch (Deutschland)', language: 'de' },
  { id: 'de-AT', label: 'Deutsch (Österreich)', language: 'de' },
  { id: 'es-ES', label: 'Español (España)', language: 'es' },
  { id: 'es-MX', label: 'Español (México)', language: 'es' },
  { id: 'tr-TR', label: 'Türkçe', language: 'tr' },
  { id: 'id-ID', label: 'Bahasa Indonesia', language: 'id' },
]

const UI_DEFAULT: Record<string, string> = {
  ar: 'ar-EG',
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  tr: 'tr-TR',
  id: 'id-ID',
}

/** The dialect a country/curriculum suggests before any manual choice. */
export function defaultVoiceLocale(settings: Settings): string {
  if (settings.curriculum === 'egypt') return 'ar-EG'
  if (settings.curriculum === 'gulf') return 'ar-SA'
  return UI_DEFAULT[settings.language] || 'en-US'
}

export function resolveVoiceLocale(language: string, settings: Settings): string {
  const chosen = settings.voiceLocale || ''
  const base = language.split('-')[0]
  if (chosen) {
    const chosenBase = chosen.split('-')[0]
    if (chosenBase === base || (base === 'ar' && chosen.startsWith('ar'))) return chosen
  }
  if (base === 'ar') {
    const suggested = defaultVoiceLocale(settings)
    return suggested.startsWith('ar') ? suggested : 'ar-EG'
  }
  return UI_DEFAULT[base] || speechFallback[base] || language
}

const speechFallback: Record<string, string> = {
  en: 'en-US',
  ar: 'ar-EG',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  tr: 'tr-TR',
  id: 'id-ID',
}

function scoreVoice(voice: SpeechSynthesisVoice, locale: string) {
  const voiceLang = voice.lang.replace('_', '-').toLowerCase()
  const target = locale.toLowerCase()
  const targetBase = target.split('-')[0]
  const voiceBase = voiceLang.split('-')[0]
  let score = 0
  if (voiceLang === target) score += 100
  else if (voiceBase === targetBase && voiceLang.startsWith(targetBase + '-')) score += 55
  else if (voiceBase === targetBase) score += 25
  else return -1
  if (voice.localService) score += 6
  if (/natural|neural|premium|enhanced|google/i.test(voice.name)) score += 8
  if (/compact|espeak|robot/i.test(voice.name)) score -= 4
  return score
}

/** Best available voice for a BCP-47 locale, falling back to the same language. */
export function pickVoice(
  voices: SpeechSynthesisVoice[],
  locale: string,
): SpeechSynthesisVoice | undefined {
  let best: SpeechSynthesisVoice | undefined
  let bestScore = -1
  for (const voice of voices) {
    const score = scoreVoice(voice, locale)
    if (score > bestScore) {
      best = voice
      bestScore = score
    }
  }
  return bestScore >= 0 ? best : undefined
}

/** Prompt tone that matches the chosen dialect. */
export function dialectTone(locale: string): string {
  if (locale.startsWith('ar-EG')) return 'a warm Egyptian Arabic tone'
  if (/^ar-(SA|AE|KW|QA|BH|OM)$/.test(locale)) return 'a warm Gulf Arabic tone'
  if (/^ar-(MA|DZ|TN|LY)$/.test(locale)) return 'a warm North African Arabic tone'
  if (/^ar-(JO|LB|SY|PS|IQ)$/.test(locale)) return 'a warm Levantine Arabic tone'
  return 'clear Modern Standard Arabic'
}
