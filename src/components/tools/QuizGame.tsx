import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronRight, RotateCcw, StopCircle, Trophy, Volume2, X, Zap } from 'lucide-react'
import type { QuizQuestion } from '@/types'
import { cn, shuffle } from '@/lib/utils'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { Button } from '@/components/ui/Button'
import { Markdown } from '@/components/Markdown'
import { useSpeech } from '@/lib/speech'
import { tr } from '@/i18n'

export function QuizGame({
  questions,
  subject,
  title,
  xpPerCorrect = 8,
  onFinish,
  onRetry,
  compact,
  bookId,
  unitKey,
}: {
  questions: QuizQuestion[]
  subject: string
  title?: string
  xpPerCorrect?: number
  onFinish?: (score: number, total: number, wrong: QuizQuestion[]) => void
  onRetry?: () => void
  compact?: boolean
  bookId?: string
  unitKey?: string
}) {
  const addXP = useApp((s) => s.addXP)
  const addMistake = useApp((s) => s.addMistake)
  const recordSkill = useApp((s) => s.recordSkill)
  const { speak, stop, speaking } = useSpeech()
  const track = useApp((s) => s.track)
  const pushToast = useUI((s) => s.pushToast)
  const [deck, setDeck] = useState(questions)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const [wrong, setWrong] = useState<{ q: QuizQuestion; picked: number }[]>([])
  const [startedAt] = useState(Date.now())

  useEffect(() => {
    setDeck(questions)
    setIndex(0)
    setSelected(null)
    setSubmitted(false)
    setScore(0)
    setFinished(false)
    setXpEarned(0)
    setWrong([])
  }, [questions])

  const current = deck[index]
  const progress = useMemo(() => ((index + (submitted ? 1 : 0)) / Math.max(1, deck.length)) * 100, [index, submitted, deck.length])

  const choose = (option: number) => {
    if (submitted || !current) return
    setSelected(option)
    setSubmitted(true)
    recordSkill(subject, current.topic || tr('General'), option === current.answer)
    if (option === current.answer) {
      setScore((s) => s + 1)
      setXpEarned((x) => x + xpPerCorrect)
      addXP(xpPerCorrect, true)
    } else {
      setWrong((w) => [...w, { q: current, picked: option }])
      addMistake({
        question: current.question,
        options: current.options,
        answer: current.answer,
        chosen: option,
        explanation: current.explanation,
        topic: current.topic,
        subject,
        bookId,
        unitKey,
      })
    }
  }

  const next = () => {
    if (index + 1 >= deck.length) {
      setFinished(true)
      track('quiz', 1)
      const bonus = Math.round((score / Math.max(1, deck.length)) * 12)
      if (bonus > 0) addXP(bonus, true)
      setXpEarned((x) => x + bonus)
      pushToast({
        title: score === deck.length ? 'Flawless victory! 🏆' : 'Quiz complete',
        description: `${score}/${deck.length} correct · +${Math.round((score / Math.max(1, deck.length)) * 12) + score * xpPerCorrect} XP`,
        type: 'xp',
        xp: Math.round((score / Math.max(1, deck.length)) * 12) + score * xpPerCorrect,
      })
      onFinish?.(score, deck.length, wrong.map((item) => item.q))
    } else {
      setIndex((i) => i + 1)
      setSelected(null)
      setSubmitted(false)
    }
  }

  const retry = () => {
    // Re-map correct index after shuffling so retry is not memorised.
    const mapped = shuffle(questions).map((q) => {
      const correctText = q.options[q.answer]
      const options = shuffle(q.options)
      return { ...q, options, answer: options.indexOf(correctText) }
    })
    setDeck(mapped)
    setIndex(0)
    setSelected(null)
    setSubmitted(false)
    setScore(0)
    setFinished(false)
    setXpEarned(0)
    setWrong([])
    onRetry?.()
  }

  if (!deck.length) return null

  if (finished) {
    const pctScore = Math.round((score / Math.max(1, deck.length)) * 100)
    const message =
      pctScore === 100 ? 'Perfect. You absolutely crushed it.' : pctScore >= 80 ? 'Excellent work — exam-ready energy.' : pctScore >= 50 ? 'Solid start. Review the misses and go again.' : 'Every mistake is a clue. Read the explanations and retry.'
    return (
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3 grid h-28 w-28 place-items-center">
          <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="url(#quizGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(pctScore / 100) * 326.7} 326.7`}
            />
            <defs>
              <linearGradient id="quizGrad" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#21e6c9" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div>
            <p className="font-display text-3xl font-extrabold text-main">{score}/{deck.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{pctScore}%</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-sun/10 px-3 py-1 text-[11px] font-bold text-sun">
          <Zap className="h-3.5 w-3.5" /> +{xpEarned} {tr("XP earned")}
        </div>
        <h3 className="mt-3 font-display text-xl font-extrabold text-main">{message}</h3>
        <p className="mt-1 text-[11px] text-muted">{subject} · {deck.length} {tr("questions ·")} {Math.max(1, Math.round((Date.now() - startedAt) / 1000))}s</p>

        {wrong.length > 0 && (
          <div className="mt-4 w-full space-y-2 text-left">
            <p className="label">{tr("Review your misses")}</p>
            {wrong.map((w, i) => (
              <div key={i} className="rounded-xl border border-coral/20 bg-coral/5 p-3">
                <p className="text-xs font-semibold text-main">{w.q.question}</p>
                <p className="mt-1 text-[10px] text-muted">
                  {tr("You chose:")} <span className="text-coral">{w.q.options[w.picked]}</span>
                </p>
                <p className="text-[10px] text-aurora-300">{tr("Correct:")} {w.q.options[w.q.answer]}</p>
                <div className="mt-1.5 text-[10px] leading-relaxed text-muted">
                  <Markdown>{w.q.explanation}</Markdown>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex w-full flex-wrap justify-center gap-2">
          <Button variant="secondary" onClick={retry}>
            <RotateCcw className="h-4 w-4" /> {tr("Try again")}
          </Button>
          {wrong.length > 0 && (
            <Button
              onClick={() => {
                setDeck(wrong.map((w) => w.q))
                setIndex(0)
                setSelected(null)
                setSubmitted(false)
                setScore(0)
                setFinished(false)
                setXpEarned(0)
                setWrong([])
              }}
            >
              <Trophy className="h-4 w-4" /> {tr("Drill")} {wrong.length} {tr("misses")}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="label mb-0.5 text-aurora-300">{title || subject}</p>
          <p className="text-[11px] text-muted">{tr("Question")} {index + 1} {tr("of")} {deck.length}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-sun/10 px-2.5 py-1 text-[10px] font-bold text-sun">
          <Zap className="h-3 w-3" /> +{xpPerCorrect} {tr("/ correct")}
        </div>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-aurora-400 to-violet-neon transition-all duration-500" style={{ width: `${Math.max(4, progress)}%` }} />
      </div>

      <p className={cn('font-display font-extrabold leading-snug text-main', compact ? 'text-base' : 'text-lg sm:text-xl')}>
        <span className="flex items-start gap-2">
          <span className="min-w-0 flex-1">{current.question}</span>
          <button
            onClick={() =>
              speaking
                ? stop()
                : speak(
                    `${current.question}. ${current.options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join('. ')}`,
                    /arab/i.test(subject) ? 'ar' : /fran|french/i.test(subject) ? 'fr' : /german|deutsch/i.test(subject) ? 'de' : 'en',
                  )
            }
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-line bg-card-2 text-muted transition hover:text-main"
            aria-label={speaking ? tr('Stop reading') : tr('Read the question')}
            title={speaking ? tr('Stop reading') : tr('Read the question')}
          >
            {speaking ? <StopCircle className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        </span>
      </p>

      <div className="mt-4 space-y-2">
        {current.options.map((option, i) => {
          const isCorrect = i === current.answer
          const isPicked = selected === i
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={submitted}
              className={cn(
                'flex w-full items-start gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-[13px] font-medium transition-all',
                !submitted && 'border-line bg-card-2 text-main hover:border-aurora-400/40 hover:bg-white/5',
                submitted && isCorrect && 'border-aurora-400/60 bg-aurora-400/15 text-main',
                submitted && isPicked && !isCorrect && 'border-coral/50 bg-coral/10 text-main',
                submitted && !isCorrect && !isPicked && 'border-line bg-card-2 opacity-50',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[10px] font-bold',
                  submitted && isCorrect ? 'bg-aurora-400 text-ink-950' : submitted && isPicked ? 'bg-coral text-white' : 'bg-white/5 text-muted',
                )}
              >
                {submitted && isCorrect ? <Check className="h-3.5 w-3.5" /> : submitted && isPicked ? <X className="h-3.5 w-3.5" /> : String.fromCharCode(65 + i)}
              </span>
              <span className="leading-relaxed">{option}</span>
            </button>
          )
        })}
      </div>

      {submitted && (
        <div className="mt-3 animate-pop rounded-2xl border border-line bg-card-2 p-3">
          <div className="flex items-center justify-between">
            <p className={cn('text-xs font-extrabold', selected === current.answer ? 'text-aurora-300' : 'text-coral')}>
              {selected === current.answer ? `Correct! +${xpPerCorrect} XP` : 'Not quite — here’s the clue'}
            </p>
            <Button size="sm" className="h-8" onClick={next}>
              {index + 1 >= deck.length ? 'Results' : 'Next'} <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="mt-1.5 text-[11px] leading-relaxed text-muted">
            <Markdown>{current.explanation}</Markdown>
          </div>
        </div>
      )}
    </div>
  )
}
