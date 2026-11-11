import { useEffect, useRef, useState } from 'react'
import {
  Bookmark,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  Waves,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Card'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateJSON } from '@/lib/gemini'
import { pronunciationInstruction, pronunciationInstruction as prompt } from '@/lib/prompts'
import { startRecording } from '@/lib/audio'
import { useSpeech } from '@/lib/speech'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { cn, friendlyError } from '@/lib/utils'
import { tr } from '@/i18n'

interface CoachResult {
  score: number
  transcript: string
  strengths: string[]
  fixes: { sound: string; tip: string; practice: string }[]
  encouragement: string
}

const defaults: Record<string, string> = {
  en: 'I usually walk to school with my best friend.',
  de: 'Guten Tag! Ich heiße Nour und ich wohne in Alexandria.',
  fr: 'Bonjour ! Je m’appelle Nour et j’habite à Alexandrie.',
  ar: 'الطالبُ المجتهدُ يحققُ أحلامَهُ بالعملِ والصبر.',
}

export function PronunciationModal({
  open,
  onClose,
  language = 'en',
  subject,
}: {
  open: boolean
  onClose: () => void
  language?: string
  subject?: string
}) {
  const requireKey = useRequireKey()
  const { apiKey, model, addXP, addVault, track } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const { speak, stop } = useSpeech()
  const [target, setTarget] = useState(defaults[language] || defaults.en)
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CoachResult | null>(null)
  const [error, setError] = useState('')
  const recRef = useRef<Awaited<ReturnType<typeof startRecording>> | null>(null)
  const timerRef = useRef<number | null>(null)

  const cleanup = () => {
    recRef.current?.cancel()
    recRef.current = null
    setRecording(false)
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
    stop()
  }

  useEffect(() => {
    if (!open) {
      cleanup()
      setResult(null)
      setError('')
      setAudioBlob(null)
      setAudioUrl('')
      setSeconds(0)
      setTarget(defaults[language] || defaults.en)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, language])

  useEffect(() => () => cleanup(), [])

  const start = async () => {
    setError('')
    setResult(null)
    try {
      const rec = await startRecording()
      recRef.current = rec
      setRecording(true)
      setSeconds(0)
      timerRef.current = window.setInterval(() => setSeconds((s) => {
        if (s + 1 >= 30) {
          stopRecording()
          return 30
        }
        return s + 1
      }), 1000)
    } catch {
      setError('Microphone access was blocked. Allow the mic in your browser settings and try again.')
    }
  }

  const stopRecording = async () => {
    if (!recRef.current) return
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
    try {
      const blob = await recRef.current.stop()
      recRef.current = null
      setRecording(false)
      setAudioBlob(blob)
      setAudioUrl(URL.createObjectURL(blob))
      if (blob.size < 800) {
        setError('That recording was too short. Hold the mic and read the full phrase.')
      }
    } catch {
      setRecording(false)
      setError('Could not finish the recording. Try once more.')
    }
  }

  const analyze = async () => {
    if (!requireKey()) return
    if (!audioBlob) {
      pushToast({ title: tr("Record yourself first"), type: 'info' })
      return
    }
    setLoading(true)
    setError('')
    try {
      const { base64, mimeType } = await import('@/lib/audio').then((m) => m.blobToWavBase64(audioBlob))
      const data = await generateJSON<CoachResult>({
        apiKey,
        model,
        system: 'You are a warm, precise pronunciation coach. Listen closely and return only JSON.',
        parts: [
          { text: prompt(target, language.toUpperCase()) },
          { inlineData: { mimeType, data: base64 } },
        ],
        temperature: 0.3,
        maxOutputTokens: 1200,
      })
      setResult({
        score: Math.max(0, Math.min(100, Math.round(Number(data.score) || 0))),
        transcript: data.transcript || '',
        strengths: (data.strengths || []).filter(Boolean).slice(0, 4),
        fixes: (data.fixes || []).filter((f) => f.tip).slice(0, 4),
        encouragement: data.encouragement || 'You are brave for speaking out loud — that is how fluency is built.',
      })
      addXP(15, true)
      track('voice', 1)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Accent & pronunciation coach")}
      subtitle={tr("Record a phrase. Jessica listens to the audio itself and tunes your sounds, stress and rhythm.")}
      icon={<Waves className="h-4.5 w-4.5" />}
      size="lg"
      footer={
        result ? (
          <div className={"flex flex-wrap items-center justify-between gap-2"}>
            <p className={"text-[10px] text-muted-2"}>{tr("Audio is sent only to your own Gemini key for this analysis.")}</p>
            <div className={"flex gap-2"}>
              <Button size={"sm"} variant={"secondary"} onClick={() => { setResult(null); setAudioBlob(null); setAudioUrl(''); }}>
                <RotateCcw className={"h-3.5 w-3.5"} /> {tr("Try again")}
              </Button>
              <Button
                size={"sm"}
                onClick={() =>
                  addVault({
                    title: `Pronunciation ${result.score}/100`,
                    content: `**Target:** ${target}\n\n**Heard:** ${result.transcript}\n\n**Strengths**\n${result.strengths.map((s) => `- ${s}`).join('\n')}\n\n**Fixes**\n${result.fixes.map((f) => `- ${f.sound}: ${f.tip} Practice: ${f.practice}`).join('\n')}\n\n${result.encouragement}`,
                    tag: tr("Pronunciation"),
                  })
                }
              >
                <Bookmark className={"h-3.5 w-3.5"} /> {tr("Save feedback")}
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-gradient-to-br from-violet-neon/10 via-card-2 to-aurora-400/10 p-4">
          <div className="flex items-center justify-between">
            <p className="label">{tr("Phrase to practise")}</p>
            <span className="chip">{subject || language.toUpperCase()}</span>
          </div>
          <textarea
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            rows={2}
            className="field mt-2 resize-none text-sm font-semibold"
            dir="auto"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => speak(target, language)}>
              <Volume2 className="h-3.5 w-3.5" /> {tr("Hear model")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setTarget(defaults[language] || defaults.en)
                setResult(null)
                setAudioBlob(null)
                setAudioUrl('')
              }}
            >
              {tr("Reset phrase")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-card-2 p-5">
          <button
            onClick={() => (recording ? stopRecording() : start())}
            className={cn(
              'relative grid h-20 w-20 place-items-center rounded-full transition-all',
              recording ? 'bg-coral text-white animate-pulseRing' : 'bg-aurora-400 text-ink-950 shadow-glow hover:bg-aurora-300',
            )}
            aria-label={recording ? 'Stop recording' : 'Start recording'}
          >
            {recording ? <Square className="h-7 w-7 fill-current" /> : <Mic className="h-8 w-8" />}
          </button>
          <p className="text-sm font-bold text-main">
            {recording ? `Listening… ${seconds}s` : audioBlob ? 'Recording ready' : 'Tap to record'}
          </p>
          <p className="text-center text-[10px] text-muted">
            {recording ? 'Read the phrase naturally. Max 30 seconds.' : 'Allow microphone access when asked. Speak close enough to the mic.'}
          </p>
          {recording && (
            <div className="flex h-8 items-end gap-0.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1 animate-pulse rounded-full bg-coral/60"
                  style={{ height: `${20 + ((i * 17) % 70)}%`, animationDelay: `${i * 40}ms` }}
                />
              ))}
            </div>
          )}
          {audioUrl && !recording && (
            <div className="flex items-center gap-2">
              <audio src={audioUrl} controls className="h-8 max-w-[240px]" />
              <Button size="sm" onClick={analyze} loading={loading}>
                <Sparkles className="h-3.5 w-3.5" /> {tr("Get AI feedback")}
              </Button>
            </div>
          )}
        </div>

        {loading && <Spinner label={tr("Listening for vowel sounds, stress and rhythm…")} />}
        {error && <p className="rounded-xl border border-coral/30 bg-coral/10 p-2.5 text-[11px] leading-relaxed text-coral">{error}</p>}

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 rounded-2xl border border-line bg-card-2 p-4">
              <div
                className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4"
                style={{
                  borderColor: result.score >= 80 ? '#21e6c9' : result.score >= 55 ? '#ffd166' : '#ff7a8a',
                  background: 'rgba(255,255,255,.03)',
                }}
              >
                <div className="text-center">
                  <p className="font-display text-2xl font-extrabold text-main">{result.score}</p>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-muted">/ 100</p>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="label">{tr("Jessica heard")}</p>
                <p className="mt-0.5 text-xs font-semibold leading-relaxed text-main" dir="auto">“{result.transcript || '…'}”</p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted">{result.encouragement}</p>
              </div>
            </div>

            {result.strengths.length > 0 && (
              <div>
                <p className="label mb-1.5 text-aurora-300">{tr("What worked")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.strengths.map((s, i) => (
                    <span key={i} className="chip border-aurora-400/25 bg-aurora-400/10 text-aurora-200">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {result.fixes.length > 0 && (
              <div>
                <p className="label mb-1.5">{tr("Fine-tuning")}</p>
                <div className="space-y-1.5">
                  {result.fixes.map((f, i) => (
                    <div key={i} className="rounded-xl border border-violet-neon/20 bg-violet-neon/5 p-3">
                      <p className="text-[11px] font-extrabold text-violet-glow">{f.sound}</p>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-main">{f.tip}</p>
                      <p className="mt-1 rounded-lg bg-ink-950/30 px-2 py-1 text-[10px] text-muted">🎯 {f.practice}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="secondary" size="sm" className="w-full" onClick={() => speak(target, language, { rate: 0.8 })}>
              <Volume2 className="h-3.5 w-3.5" /> {tr("Hear the phrase slowly")}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
