import { useEffect, useRef, useState, useCallback } from 'react'

export const speechLang: Record<string, string> = {
  en: 'en-US',
  ar: 'ar-EG',
  de: 'de-DE',
  fr: 'fr-FR',
}

/** Text-to-speech with a single global utterance so audio never overlaps. */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [supported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  )
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

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
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  const speak = useCallback(
    (text: string, lang = 'en', opts?: { rate?: number; pitch?: number; onEnd?: () => void }) => {
      if (!supported || !text.trim()) return
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = speechLang[lang] || lang
      utter.rate = opts?.rate ?? 0.97
      utter.pitch = opts?.pitch ?? 1
      const langVoices = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.toLowerCase().startsWith((utter.lang || 'en').slice(0, 2)))
      if (langVoices[0]) utter.voice = langVoices[0]
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

  const pause = useCallback(() => {
    if (supported) window.speechSynthesis.pause()
  }, [supported])

  const resume = useCallback(() => {
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
    rec.lang = speechLang[lang] || lang
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
