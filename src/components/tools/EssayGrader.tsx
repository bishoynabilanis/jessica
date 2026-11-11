import { useState } from 'react'
import {
  Bookmark,
  Check,
  Copy,
  GraduationCap,
  Mic,
  MicOff,
  PenLine,
  RefreshCw,
  Sparkles,
  Volume2,
} from 'lucide-react'
import type { Book } from '@/types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Card'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateJSON } from '@/lib/gemini'
import { essayPrompt } from '@/lib/prompts'
import { useDictation, useSpeech } from '@/lib/speech'
import { speakable } from '@/lib/speech'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { cn, friendlyError } from '@/lib/utils'
import { tr } from '@/i18n'

interface Correction {
  original: string
  correction: string
  type: string
  explanation: string
}

interface EssayFeedback {
  score: number
  band: string
  summary: string
  corrections: Correction[]
  vocabulary: { word: string; meaning: string; example: string }[]
  rewrite: string
  encouragement: string
}

const languages = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'German' },
  { code: 'fr', label: 'French' },
  { code: 'ar', label: 'Arabic' },
]

export function EssayGraderPanel({
  book,
  embedded,
}: {
  book?: Book
  embedded?: boolean
}) {
  const requireKey = useRequireKey()
  const { apiKey, model, addXP, addVault, track } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const [text, setText] = useState('')
  const [task, setTask] = useState('')
  const [language, setLanguage] = useState(book?.language || 'en')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null)
  const [error, setError] = useState('')
  const dictation = useDictation(language, (t) => setText((prev) => `${prev}${prev ? ' ' : ''}${t}`))
  const { speak } = useSpeech()

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const langLabel = languages.find((l) => l.code === language)?.label || 'English'

  const grade = async () => {
    if (!requireKey()) return
    if (words < 15) {
      pushToast({ title: tr("A little more writing"), description: tr("Write at least 15 words so the examiner has something to work with."), type: 'info' })
      return
    }
    setLoading(true)
    setError('')
    setFeedback(null)
    try {
      const data = await generateJSON<EssayFeedback>({
        apiKey,
        model,
        system: `You are a kind but rigorous ${langLabel} examiner for an Egyptian First Preparatory student. Return only JSON.`,
        parts: [
          {
            text: `${essayPrompt(langLabel, task, book?.grade)}\n\nSTUDENT PARAGRAPH:\n"""${text.trim()}"""`,
          },
        ],
        temperature: 0.4,
        maxOutputTokens: 2400,
      })
      if (typeof data.score !== 'number') throw new Error('The examiner reply was incomplete. Try again.')
      setFeedback({
        score: Math.max(0, Math.min(10, Math.round(Number(data.score) * 10) / 10)),
        band: data.band || 'Good',
        summary: data.summary || '',
        corrections: (data.corrections || []).filter((c) => c.original).slice(0, 14),
        vocabulary: (data.vocabulary || []).filter((v) => v.word).slice(0, 8),
        rewrite: data.rewrite || '',
        encouragement: data.encouragement || 'Keep writing — every paragraph makes you stronger.',
      })
      addXP(20, true)
      track('essay', 1)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn(embedded ? '' : 'p-1')}>
      {!feedback && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="label mb-1.5 block">{tr("Writing language")}</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value as typeof language)} className="field">
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label mb-1.5 block">{tr("Task / prompt (optional)")}</span>
              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder={tr("e.g. Write about your favourite hobby")}
                className="field"
              />
            </label>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label">{tr("Your paragraph")}</span>
              <span className={cn('text-[10px] font-semibold', words >= 15 ? 'text-aurora-300' : 'text-muted-2')}>{words} {tr("words")}</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={9}
              placeholder={tr("Write your paragraph here… or tap the microphone and speak it.")}
              className="field resize-y leading-relaxed"
              dir="auto"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (dictation.listening) dictation.stop()
                    else if (!dictation.start()) pushToast({ title: tr("Dictation unavailable"), description: tr("Try Chrome or Edge."), type: 'error' })
                  }}
                  className={dictation.listening ? 'border-coral/40 text-coral' : ''}
                >
                  {dictation.listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  {dictation.listening ? 'Listening…' : 'Dictate'}
                </Button>
                {text && (
                  <Button variant="ghost" size="sm" onClick={() => { setText(''); setFeedback(null) }}>
                    {tr("Clear")}
                  </Button>
                )}
              </div>
              <Button onClick={grade} loading={loading}>
                <Sparkles className="h-4 w-4" /> {tr("Grade my writing")}
              </Button>
            </div>
            {dictation.listening && dictation.interim && (
              <p className="mt-1.5 rounded-lg bg-violet-neon/10 px-2 py-1 text-[10px] text-violet-glow">🎙️ {dictation.interim}</p>
            )}
            {loading && <Spinner label={tr("Reading like an examiner…")} className="py-4" />}
            {error && <p className="mt-2 rounded-xl border border-coral/30 bg-coral/10 p-2.5 text-[11px] text-coral">{error}</p>}
          </div>

          {!text && (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                { label: tr("Describe your day"), text: tr("On a normal school day, I wake up at half past six...") },
                { label: tr("My favourite hobby"), text: tr("My favourite hobby is playing football because...") },
                { label: tr("A place I love"), text: tr("Alexandria is a beautiful city by the sea...") },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setText(s.text)}
                  className="rounded-xl border border-line bg-card-2 p-2.5 text-left transition hover:bg-white/5"
                >
                  <p className="text-[11px] font-bold text-main">{s.label}</p>
                  <p className="mt-0.5 line-clamp-2 text-[9px] leading-relaxed text-muted">{s.text}</p>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {feedback && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-gradient-to-br from-aurora-400/10 via-card-2 to-violet-neon/10 p-4 sm:flex-row">
            <div className="relative grid h-24 w-24 shrink-0 place-items-center">
              <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="9" />
                <circle
                  cx="60" cy="60" r="50" fill="none" stroke="url(#essayGrad)" strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={`${(feedback.score / 10) * 314} 314`}
                />
                <defs>
                  <linearGradient id="essayGrad" x1="0" y1="0" x2="120" y2="120">
                    <stop stopColor="#21e6c9" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center">
                <p className="font-display text-3xl font-extrabold text-main">{feedback.score}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted">{tr("out of 10")}</p>
              </div>
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <span className="chip border-aurora-400/25 text-aurora-200">{feedback.band}</span>
              <p className="mt-1.5 text-xs leading-relaxed text-main">{feedback.summary}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{feedback.encouragement}</p>
            </div>
          </div>

          {feedback.corrections.length > 0 && (
            <div>
              <p className="label mb-2">{tr("Grammar, spelling & punctuation")}</p>
              <div className="space-y-1.5">
                {feedback.corrections.map((c, i) => (
                  <div key={i} className="rounded-xl border border-line bg-card-2 p-2.5">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="rounded bg-coral/15 px-1.5 py-0.5 font-mono text-coral line-through decoration-coral/60">{c.original}</span>
                      <span className="text-muted-2">→</span>
                      <span className="rounded bg-aurora-400/15 px-1.5 py-0.5 font-mono text-aurora-200">{c.correction}</span>
                      <span className="ml-auto rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-muted">{c.type}</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted">{c.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {feedback.vocabulary.length > 0 && (
            <div>
              <p className="label mb-2">{tr("Upgrade your vocabulary")}</p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {feedback.vocabulary.map((v, i) => (
                  <div key={i} className="rounded-xl border border-violet-neon/20 bg-violet-neon/5 p-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-extrabold text-violet-glow">{v.word}</p>
                      <button onClick={() => speak(v.word, language)} className="text-muted hover:text-main" aria-label={tr("Pronounce word")}>
                        <Volume2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-[10px] text-main">{v.meaning}</p>
                    <p className="mt-0.5 text-[9px] italic leading-relaxed text-muted">“{v.example}”</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {feedback.rewrite && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="label">{tr("Polished version")}</p>
                <button onClick={() => speak(speakable(feedback.rewrite), language)} className="flex items-center gap-1 text-[10px] font-semibold text-muted hover:text-aurora-300">
                  <Volume2 className="h-3 w-3" /> {tr("Listen")}
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-aurora-400/20 bg-aurora-400/5 p-3 text-[11px] leading-relaxed text-main">
                {feedback.rewrite}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-3">
            <Button variant="ghost" size="sm" onClick={() => setFeedback(null)}>
              <PenLine className="h-3.5 w-3.5" /> {tr("Edit & improve")}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `Score ${feedback.score}/10 — ${feedback.band}\n\n${feedback.summary}\n\n${feedback.corrections.map((c) => `${c.original} → ${c.correction} (${c.type}): ${c.explanation}`).join('\n')}`,
                  )
                  pushToast({ title: tr("Feedback copied"), type: 'success' })
                }}
              >
                <Copy className="h-3.5 w-3.5" /> {tr("Copy")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  addVault({
                    title: `Essay feedback · ${feedback.score}/10`,
                    content: `**My paragraph**\n\n${text}\n\n**Feedback**\n\nScore: ${feedback.score}/10 (${feedback.band})\n\n${feedback.summary}\n\n**Corrections**\n${feedback.corrections.map((c) => `- ${c.original} → ${c.correction} (${c.type})`).join('\n')}\n\n**Better version**\n\n${feedback.rewrite}`,
                    tag: 'Writing feedback',
                    bookId: book?.id,
                  })
                }
              >
                <Bookmark className="h-3.5 w-3.5" /> {tr("Save")}
              </Button>
              <Button size="sm" onClick={grade} loading={loading}>
                <RefreshCw className="h-3.5 w-3.5" /> {tr("Re-grade")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function EssayGraderModal({
  open,
  onClose,
  book,
}: {
  open: boolean
  onClose: () => void
  book?: Book
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Essay & paragraph grader")}
      subtitle={tr("A patient examiner: score out of 10, precise fixes and vocab upgrades.")}
      icon={<GraduationCap className="h-4.5 w-4.5" />}
      size="lg"
    >
      <EssayGraderPanel book={book} embedded />
    </Modal>
  )
}
