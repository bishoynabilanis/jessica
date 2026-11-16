import { useEffect, useRef, useState, useCallback } from 'react'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { pickVoice, resolveVoiceLocale } from '@/lib/voices'
import { detectSpeechLang, isArabicText, normalizeForSpeech } from '@/lib/speechText'
import { synthesizeSpeech } from '@/lib/ai/tts'
import { tr } from '@/i18n'

export const speechLang: Record<string, string> = {
  en: 'en-US',
  ar: 'ar-EG',
  de: 'de-DE',
  fr: 'fr-FR',
}

/** Generated clips live for the session so a repeated line is not billed twice. */
const cloudCache = new Map<string, string>()
const CLOUD_CACHE_LIMIT = 24
let cloudFailedOnce = false

function cacheClip(key: string, url: string) {
  if (cloudCache.size >= CLOUD_CACHE_LIMIT) {
    const oldest = cloudCache.keys().next().value
    if (oldest) {
      const stale = cloudCache.get(oldest)
      if (stale) URL.revokeObjectURL(stale)
      cloudCache.delete(oldest)
    }
  }
  cloudCache.set(key, url)
}

function geminiKey(): string {
  const state = useApp.getState()
  return (state.aiKeys.gemini || (state.settings.aiProvider === 'gemini' ? state.apiKey : '')).trim()
}

function sameLanguage(a: string, b: string): boolean {
  return a.split('-')[0].toLowerCase() === b.split('-')[0].toLowerCase()
}

/** Text-to-speech with a single global utterance so audio never overlaps. */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [supported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  )
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const requestRef = useRef(0)

  useEffect(() => {
    if (!supported) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      window.speechSynthesis.cancel()
    }
  }, [supported])

  const stop = useCallback(() => {
    requestRef.current += 1
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (supported) window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  const speakDevice = useCallback(
    (text: string, lang: string, opts?: { rate?: number; pitch?: number; onEnd?: () => void }) => {
      if (!supported) {
        opts?.onEnd?.()
        return
      }
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      const settings = useApp.getState().settings
      const locale = resolveVoiceLocale(lang, settings)
      const installed = window.speechSynthesis.getVoices()
      const chosen = settings.voiceName
        ? installed.find((voice) => voice.voiceURI === settings.voiceName)
        : undefined
      const voice = chosen && sameLanguage(chosen.lang, locale) ? chosen : pickVoice(installed, locale)
      const egyptian = locale === 'ar-EG'
      utter.lang = voice?.lang || locale
      utter.rate = opts?.rate ?? (egyptian ? 1.02 : 0.97)
      utter.pitch = opts?.pitch ?? (egyptian ? 1.05 : 1)
      if (voice) utter.voice = voice
      utter.onstart = () => setSpeaking(true)
      utter.onend = () => {
        setSpeaking(false)
        opts?.onEnd?.()
      }
      utter.onerror = () => {
        setSpeaking(false)
        opts?.onEnd?.()
      }
      utterRef.current = utter
      window.speechSynthesis.speak(utter)
    },
    [supported],
  )

  const speakCloud = useCallback(
    async (
      text: string,
      lang: string,
      opts: { rate?: number; pitch?: number; onEnd?: () => void } | undefined,
      requestId: number,
    ) => {
      const key = geminiKey()
      if (!key) return false
      const settings = useApp.getState().settings
      const cacheKey = `${settings.ttsVoice}|${lang}|${text}`
      const cached = cloudCache.get(cacheKey)
      if (cached) {
        if (requestRef.current !== requestId) return true
        const audio = new Audio(cached)
        audioRef.current = audio
        audio.onended = () => {
          if (requestRef.current !== requestId) return
          setSpeaking(false)
          opts?.onEnd?.()
        }
        audio.onerror = () => {
          if (requestRef.current !== requestId) return
          setSpeaking(false)
          opts?.onEnd?.()
        }
        await audio.play().catch(() => undefined)
        return true
      }

      setSpeaking(true)
      try {
        const blob = await synthesizeSpeech({
          key,
          text,
          voice: settings.ttsVoice || 'Sulafat',
          style: isArabicText(text)
            ? 'warm, friendly Egyptian Arabic teacher speaking to a child'
            : 'warm, friendly teacher',
        })
        if (requestRef.current !== requestId) return true
        const url = URL.createObjectURL(blob)
        cacheClip(cacheKey, url)
        const audio = new Audio(url)
        if (opts?.rate) audio.playbackRate = Math.min(2, Math.max(0.5, opts.rate))
        audioRef.current = audio
        audio.onended = () => {
          if (requestRef.current !== requestId) return
          setSpeaking(false)
          opts?.onEnd?.()
        }
        audio.onerror = () => {
          if (requestRef.current !== requestId) return
          setSpeaking(false)
          opts?.onEnd?.()
        }
        await audio.play()
        return true
      } catch {
        if (requestRef.current !== requestId) return true
        setSpeaking(false)
        if (!cloudFailedOnce) {
          cloudFailedOnce = true
          useUI.getState().pushToast({
            title: tr('The Egyptian voice is unavailable — using the device voice.'),
            type: 'info',
          })
        }
        return false
      }
    },
    [],
  )

  const speak = useCallback(
    (text: string, lang = 'en', opts?: { rate?: number; pitch?: number; onEnd?: () => void }) => {
      const clean = normalizeForSpeech(text)
      if (!clean) return
      const effective = detectSpeechLang(clean, lang)
      const settings = useApp.getState().settings
      const wantsCloud = settings.voiceEngine === 'cloud' && isArabicText(clean) && !!geminiKey()

      requestRef.current += 1
      const requestId = requestRef.current

      if (wantsCloud) {
        setSpeaking(true)
        void speakCloud(clean, effective, opts, requestId).then((handled) => {
          if (!handled && requestRef.current === requestId) speakDevice(clean, effective, opts)
        })
        return
      }

      speakDevice(clean, effective, opts)
    },
    [speakCloud, speakDevice],
  )

  const pause = useCallback(() => {
    audioRef.current?.pause()
    if (supported) window.speechSynthesis.pause()
  }, [supported])

  const resume = useCallback(() => {
    void audioRef.current?.play().catch(() => undefined)
    if (supported) window.speechSynthesis.resume()
  }, [supported])

  return { speak, stop, pause, resume, speaking, supported, voices }
}

/* ----------------------------------- STT ---------------------------------- */

type RecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
}

export function useDictation(lang: string, onText: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const recRef = useRef<RecognitionLike | null>(null)
  const callbackRef = useRef(onText)
  callbackRef.current = onText

  const getRecognition = useCallback((): RecognitionLike | null => {
    const w = window as any
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Ctor) return null
    const rec: RecognitionLike = new Ctor()
    rec.lang = resolveVoiceLocale(lang, useApp.getState().settings)
    rec.continuous = false
    rec.interimResults = true
    rec.onresult = (event: any) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) finalText += result[0].transcript
        else interimText += result[0].transcript
      }
      setInterim(interimText)
      if (finalText) {
        callbackRef.current(finalText.trim())
        setInterim('')
      }
    }
    rec.onerror = () => {
      setListening(false)
      setInterim('')
    }
    rec.onend = () => {
      setListening(false)
      setInterim('')
    }
    return rec
  }, [lang])

  const start = useCallback(() => {
    const rec = getRecognition()
    if (!rec) return false
    recRef.current = rec
    try {
      rec.start()
      setListening(true)
      return true
    } catch {
      return false
    }
  }, [getRecognition])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
  }, [])

  const supported = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  return { start, stop, listening, interim, supported }
}

export function speakable(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, ' code example ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' equation ')
    .replace(/\$[^$]*\$/g, ' equation ')
    .replace(/#+\s/g, '')
    .replace(/[*_>#`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\|/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
