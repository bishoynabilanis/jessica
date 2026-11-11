import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUp,
  Bot,
  Check,
  Mic,
  MicOff,
  RefreshCw,
  Sparkles,
  Volume2,
  Waves,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Markdown } from '@/components/Markdown'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateText } from '@/lib/gemini'
import { speakable, useDictation, useSpeech } from '@/lib/speech'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { cn, friendlyError, pct } from '@/lib/utils'
import { tr } from '@/i18n'

type Mode = 'conversation' | 'drill'

const languages = [
  { code: 'en', label: 'English', emoji: '🇬🇧' },
  { code: 'de', label: 'German', emoji: '🇩🇪' },
  { code: 'fr', label: 'French', emoji: '🇫🇷' },
  { code: 'ar', label: 'Arabic', emoji: '📖' },
]

const drills: Record<string, string[]> = {
  en: [
    'I usually wake up at half past six and have breakfast.',
    'Could you explain this question again, please?',
    'My favourite subject is science because I love experiments.',
  ],
  de: [
    'Guten Morgen! Ich heiße Nour und ich bin dreizehn Jahre alt.',
    'Meine Lieblingsfächer sind Deutsch und Mathematik.',
    'Kannst du mir bitte helfen?',
  ],
  fr: [
    'Bonjour ! Je m’appelle Nour et j’ai treize ans.',
    'Ma matière préférée est le français.',
    'Est-ce que tu peux m’aider, s’il te plaît ?',
  ],
  ar: [
    'الطالبُ المجتهدُ يحققُ أحلامَهُ بالعملِ والصبر.',
    'أحبُّ مادةَ العلومِ لأنني أستمتعُ بالتجارب.',
    'هل يمكنُ أن تشرحَ لي هذا السؤالَ مرةً أخرى؟',
  ],
}

const scenarioByLanguage: Record<string, string[]> = {
  en: ['Order food at a café', 'Talk about your weekend', 'Ask a teacher for help'],
  de: ['Im Café bestellen', 'Über die Schule sprechen', 'Nach dem Weg fragen'],
  fr: ['Commander au café', 'Parler de mon week-end', 'Demander de l’aide'],
  ar: ['اطلب طعاماً في مطعم', 'تحدث عن يومك', 'اسأل المعلم سؤالاً'],
}

interface Line {
  role: 'user' | 'model'
  text: string
  score?: number
}

function normalizeWords(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, '')
    .split(/\s+/)
    .filter(Boolean)
}

function similarity(target: string, spoken: string) {
  const a = normalizeWords(target)
  const b = normalizeWords(spoken)
  if (!a.length) return 0
  const matched = a.filter((w) => b.includes(w)).length
  return Math.round((matched / a.length) * 100)
}

export function VoiceTutorModal({
  open,
  onClose,
  language = 'en',
}: {
  open: boolean
  onClose: () => void
  language?: string
}) {
  const requireKey = useRequireKey()
  const { apiKey, model, settings, addXP, track } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const { speak, stop, speaking } = useSpeech()
  const [mode, setMode] = useState<Mode>('drill')
  const [lang, setLang] = useState(language)
  const [drillIndex, setDrillIndex] = useState(0)
  const [lines, setLines] = useState<Line[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [lastScore, setLastScore] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const drillText = drills[lang]?.[drillIndex % (drills[lang]?.length || 1)] || drills.en[0]
  const drillsForLang = useMemo(() => drills[lang] || drills.en, [lang])

  const dictation = useDictation(lang, (text) => {
    setDraft(text)
    if (mode === 'drill') checkDrill(text)
  })

  useEffect(() => {
    if (!open) {
      stop()
      setLines([])
      setDraft('')
      setError('')
      setLastScore(null)
      setMode('drill')
      setLang(language)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, language])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [lines, busy])

  const checkDrill = (spoken: string) => {
    const score = similarity(drillText, spoken)
    setLastScore(score)
    setLines((prev) => [...prev, { role: 'user', text: spoken, score }])
    addXP(score >= 70 ? 8 : 3, true)
    track('voice', 1)
    if (score >= 85) {
      pushToast({ title: tr("Beautiful pronunciation!"), description: tr("Almost native. Try the next phrase."), type: 'success', xp: 8 })
      setDrillIndex((i) => (i + 1) % drillsForLang.length)
      setLastScore(null)
    }
  }

  const send = async (raw = draft) => {
    const text = raw.trim()
    if (!text || busy) return
    if (!requireKey()) return
    setDraft('')
    setError('')
    const history = [...lines]
    setLines((prev) => [...prev, { role: 'user', text }, { role: 'model', text: '' }])
    setBusy(true)
    try {
      const reply = await generateText({
        apiKey,
        model,
        system: `You are Jessica, a warm voice tutor for a 13-year-old Egyptian student. The student is speaking ${languages.find((l) => l.code === lang)?.label}. Reply in that language using simple A1-A2 wording. Keep the reply under 70 words, conversational, and end with one short question so the conversation continues. Never use markdown headings or code.`,
        parts: [
          {
            text: `Conversation so far:\n${history
              .slice(-8)
              .map((l) => `${l.role === 'user' ? 'Student' : 'Jessica'}: ${l.text}`)
              .join('\n')}\n\nStudent just said: ${text}`,
          },
        ],
        temperature: 0.65,
        maxOutputTokens: 300,
      })
      setLines((prev) => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'model', text: reply }
        return copy
      })
      speak(speakable(reply), lang, { rate: settings.ttsRate })
      addXP(3, true)
    } catch (err) {
      setError(friendlyError(err))
      setLines((prev) => prev.slice(0, -2))
    } finally {
      setBusy(false)
    }
  }

  const microphone = () => {
    if (dictation.listening) dictation.stop()
    else if (!dictation.start())
      pushToast({
        title: tr("Speech recognition unavailable"),
        description: tr("Chrome or Edge support live speech. You can still type."),
        type: 'error',
      })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Voice tutor")}
      subtitle={tr("Speak out loud, get instant feedback and build real confidence — no typing needed.")}
      icon={<Waves className="h-4.5 w-4.5" />}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] text-muted-2">{tr("Mic audio is processed by your browser; only text is sent to Gemini.")}</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => speak(mode === 'drill' ? drillText : lines.filter((l) => l.role === 'model').slice(-1)[0]?.text || drillText, lang)}
          >
            <Volume2 className="h-3.5 w-3.5" /> {tr("Hear model")}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex gap-1 rounded-2xl border border-line bg-card-2 p-1">
            {(['drill', 'conversation'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'flex-1 rounded-xl px-2 py-1.5 text-[11px] font-bold capitalize transition',
                  mode === m ? 'bg-aurora-400 text-ink-950' : 'text-muted hover:text-main',
                )}
              >
                {m === 'drill' ? 'Phrase drill' : 'Free conversation'}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-2xl border border-line bg-card-2 p-1">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code)
                  setLines([])
                  setLastScore(null)
                  setDrillIndex(0)
                }}
                className={cn(
                  'flex-1 rounded-xl px-1 py-1.5 text-[11px] font-bold transition',
                  lang === l.code ? 'bg-violet-neon text-white' : 'text-muted hover:text-main',
                )}
                title={l.label}
              >
                {l.emoji}
              </button>
            ))}
          </div>
        </div>

        {mode === 'drill' ? (
          <div className="space-y-3">
            <div className="rounded-3xl border border-line bg-gradient-to-br from-aurora-400/10 via-card-2 to-violet-neon/10 p-5 text-center">
              <p className="label text-aurora-300">{tr("Say this out loud")}</p>
              <p className="mt-2 text-lg font-extrabold leading-snug text-main" dir="auto">{drillText}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => speak(drillText, lang, { rate: 0.82 })}>
                  <Volume2 className="h-3.5 w-3.5" /> {tr("Slow model")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDrillIndex((i) => (i + 1) % drillsForLang.length)
                    setLastScore(null)
                    setDraft('')
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> {tr("Next phrase")}
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={microphone}
                className={cn(
                  'grid h-20 w-20 place-items-center rounded-full transition-all',
                  dictation.listening ? 'animate-pulseRing bg-coral text-white' : 'bg-aurora-400 text-ink-950 shadow-glow hover:bg-aurora-300',
                )}
                aria-label={dictation.listening ? 'Stop listening' : 'Start listening'}
              >
                {dictation.listening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </button>
              <p className="text-xs font-bold text-main">{dictation.listening ? 'Listening…' : 'Tap and speak'}</p>
              <p className="max-w-xs text-center text-[10px] leading-relaxed text-muted">
                {tr("Read the phrase naturally. Jessica compares what it hears with the target and tracks your accuracy.")}
              </p>
              {dictation.interim && <p className="rounded-lg bg-violet-neon/10 px-2 py-1 text-[10px] text-violet-glow">🎙️ {dictation.interim}</p>}
            </div>

            {lastScore !== null && (
              <div className="rounded-2xl border border-line bg-card-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-main">{tr("Accuracy")}</p>
                  <p className="font-display text-xl font-extrabold text-aurora-300">{lastScore}%</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn('h-full rounded-full transition-all', lastScore >= 80 ? 'bg-aurora-400' : lastScore >= 50 ? 'bg-sun' : 'bg-coral')}
                    style={{ width: `${Math.max(4, lastScore)}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">
                  {lastScore >= 85
                    ? 'Excellent — move to the next phrase.'
                    : lastScore >= 55
                      ? 'Good. Repeat once more and stress the bold words.'
                      : 'Try again a little slower, and copy the model audio.'}
                </p>
                {draft && <p className="mt-1 text-[10px] text-muted-2">{tr("Heard: “")}{draft}”</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {(scenarioByLanguage[lang] || scenarioByLanguage.en).map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border border-line bg-card-2 px-2 py-1 text-[10px] font-semibold text-muted transition hover:border-aurora-400/30 hover:text-main"
                >
                  {s}
                </button>
              ))}
            </div>

            <div ref={scrollRef} className="max-h-[36vh] min-h-[180px] space-y-2 overflow-y-auto rounded-2xl border border-line bg-card-2 p-3">
              {lines.length === 0 && (
                <div className="flex h-full min-h-[150px] flex-col items-center justify-center gap-2 text-center">
                  <Bot className="h-8 w-8 text-aurora-300/50" />
                  <p className="text-xs font-bold text-main">{tr("Start a voice conversation")}</p>
                  <p className="max-w-xs text-[10px] leading-relaxed text-muted">
                    {tr("Ask about homework, order food, or practise a school presentation. Jessica replies out loud.")}
                  </p>
                </div>
              )}
              {lines.map((line, i) => (
                <div key={i} className={cn('flex', line.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[86%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed',
                      line.role === 'user'
                        ? 'rounded-tr-sm bg-aurora-400 font-medium text-ink-950'
                        : 'rounded-tl-sm border border-line bg-card text-main',
                    )}
                  >
                    {line.text ? <Markdown className="text-[12px] leading-5">{line.text}</Markdown> : <span className="flex gap-1"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-aurora-400" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-aurora-400 [animation-delay:-.1s]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-aurora-400 [animation-delay:-.2s]" /></span>}
                  </div>
                </div>
              ))}
            </div>

            {speaking && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-aurora-300">
                <Volume2 className="h-3 w-3 animate-pulse" /> {tr("Jessica is speaking…")}
                <button onClick={stop} className="ml-auto text-muted hover:text-main">{tr("Stop")}</button>
              </div>
            )}

            <div className="flex items-end gap-1.5 rounded-2xl border border-line bg-card-2 p-1.5">
              <button
                onClick={microphone}
                className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl transition', dictation.listening ? 'bg-coral/20 text-coral' : 'text-muted hover:text-main')}
                aria-label={tr("Speak")}
              >
                {dictation.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={tr("Speak or type a message…")}
                className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-[12px] text-main outline-none placeholder:text-muted-2"
              />
              <button
                onClick={() => send()}
                disabled={!draft.trim() || busy}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-aurora-400 text-ink-950 transition hover:bg-aurora-300 disabled:opacity-30"
                aria-label={tr("Send")}
              >
                {busy ? <Sparkles className="h-4 w-4 animate-pulse" /> : <ArrowUp className="h-4 w-4" />}
              </button>
            </div>
            {dictation.interim && <p className="text-[10px] text-violet-glow">🎙️ {dictation.interim}</p>}
            {error && <p className="rounded-lg border border-coral/30 bg-coral/10 px-2 py-1.5 text-[10px] text-coral">{error}</p>}
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-line bg-card-2 px-3 py-2">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted">
            <Check className="h-3 w-3 text-aurora-400" /> {tr("3 XP per attempt · 8 XP for great pronunciation")}
          </p>
          <span className="text-[10px] font-bold text-aurora-300">{pct(lines.filter((l) => l.role === 'user').length, Math.max(1, lines.length))}{tr("% spoken")}</span>
        </div>
      </div>
    </Modal>
  )
}
