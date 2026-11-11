import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlarmClock,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Flag,
  GraduationCap,
  Play,
  RefreshCw,
  Sparkles,
  Timer,
  TimerReset,
  StopCircle,
  Trophy,
  Volume2,
  X,
} from 'lucide-react'
import type { Book, ChapterText, ExamQuestion, ExamResult } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Card'
import { Markdown } from '@/components/Markdown'
import { Mascot } from '@/components/Mascot'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateJSON } from '@/lib/gemini'
import { examPrompt } from '@/lib/prompts'
import { extractChapter } from '@/lib/pdf'
import { exportCertificatePdf } from '@/lib/pdfExport'
import { saveExam } from '@/lib/db'
import { cn, pct, uid } from '@/lib/utils'
import { useSpeech } from '@/lib/speech'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { tr } from '@/i18n'

type Stage = 'setup' | 'loading' | 'exam' | 'results'

interface ExamDraft {
  bookId: string
  questions: ExamQuestion[]
  answers: (number | null)[]
  index: number
  remaining: number
  flagged: number[]
  minutes: number
}

const DRAFT_KEY = 'jessica-exam-draft'

export function ExamSimulator({
  open,
  onClose,
  book,
  chapter,
  unitKey,
}: {
  open: boolean
  onClose: () => void
  book: Book
  chapter?: ChapterText
  unitKey?: string
}) {
  const requireKey = useRequireKey()
  const { apiKey, model, addExam, addXP, track, name, settings, xp, recordUnitScore, addMistake, recordSkill } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const { speak, stop, speaking } = useSpeech()
  const [stage, setStage] = useState<Stage>('setup')
  const [count, setCount] = useState(10)
  const [minutes, setMinutes] = useState(12)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [remaining, setRemaining] = useState(0)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [error, setError] = useState('')
  const [certId, setCertId] = useState('')
  const [endAt, setEndAt] = useState(0)
  const [extraTime, setExtraTime] = useState(false)
  const [flagged, setFlagged] = useState<number[]>([])
  const [draft, setDraft] = useState<ExamDraft | null>(null)
  const startedRef = useRef(0)
  const answersRef = useRef<(number | null)[]>([])

  useEffect(() => {
    if (!open) {
      setStage('setup')
      setQuestions([])
      setAnswers([])
      answersRef.current = []
      setResult(null)
      setError('')
      setIndex(0)
    }
  }, [open])

  useEffect(() => {
    if (stage !== 'exam' || !endAt) return
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.round((endAt - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0) {
        window.clearInterval(timer)
        finish(answersRef.current)
      }
    }, 1000)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, endAt])

  useEffect(() => {
    if (!open) return
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) {
        setDraft(null)
        return
      }
      const parsed = JSON.parse(raw) as ExamDraft
      setDraft(parsed.bookId === book.id && parsed.questions?.length ? parsed : null)
    } catch {
      setDraft(null)
    }
  }, [open, book.id])

  useEffect(() => {
    if (stage !== 'exam' || !questions.length) return
    const save = () => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            bookId: book.id,
            questions,
            answers,
            index,
            remaining: Math.max(0, Math.round((endAt - Date.now()) / 1000)),
            flagged,
            minutes,
          } satisfies ExamDraft),
        )
      } catch {
        /* ignore */
      }
    }
    save()
    const timer = window.setInterval(save, 5000)
    return () => window.clearInterval(timer)
  }, [stage, questions, answers, index, flagged, endAt, minutes, book.id])

  const start = async () => {
    if (!requireKey()) return
    setStage('loading')
    setError('')
    try {
      let source = chapter
      if (!source) {
        source = await extractChapter(`books/${book.file.replace(/^books\//, '')}`, book.id)
      }
      const data = await generateJSON<{ questions: ExamQuestion[] }>({
        apiKey,
        model,
        system: 'You are a Ministry of Education exam writer for Egyptian First Preparatory language schools. Return only JSON.',
        parts: [{ text: examPrompt(book, source, count) }],
        temperature: 0.55,
        maxOutputTokens: 3600,
      })
      const clean = (data.questions || [])
        .filter((q) => q.question?.trim() && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer))
        .slice(0, count)
        .map((q) => ({
          question: q.question.trim(),
          options: q.options.map(String),
          answer: q.answer,
          explanation: q.explanation || 'Review the chapter section for this skill.',
          topic: q.topic || book.subject,
        }))
      if (clean.length < 3) throw new Error('The exam came back incomplete. Please try again.')
      setQuestions(clean)
      const blank = Array(clean.length).fill(null) as (number | null)[]
      answersRef.current = blank
      setAnswers(blank)
      setIndex(0)
      const totalMinutes = extraTime ? Math.round(minutes * 1.25) : minutes
      setRemaining(totalMinutes * 60)
      setEndAt(Date.now() + totalMinutes * 60_000)
      setFlagged([])
      startedRef.current = Date.now()
      setStage('exam')
      addXP(5, true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not build the exam.')
      setStage('setup')
    }
  }

  const finish = (finalAnswers: (number | null)[]) => {
    const score = questions.reduce((sum, q, i) => sum + (finalAnswers[i] === q.answer ? 1 : 0), 0)
    const weak = [...new Set(questions.filter((q, i) => finalAnswers[i] !== q.answer).map((q) => q.topic))].slice(0, 6)
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedRef.current) / 1000))
    const exam: ExamResult = {
      id: uid('e_'),
      subject: book.subject,
      score,
      total: questions.length,
      date: Date.now(),
      weakTopics: weak,
      durationSeconds,
    }
    setResult(exam)
    setStage('results')
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      /* ignore */
    }
    setDraft(null)
    addExam(exam)
    saveExam(exam).catch(() => undefined)
    if (unitKey) recordUnitScore(unitKey, score, questions.length, weak)
    questions.forEach((question, index) => {
      const chosen = finalAnswers[index]
      recordSkill(book.subject, question.topic || tr('General'), chosen === question.answer)
      if (chosen !== null && chosen !== undefined && chosen !== question.answer) {
        addMistake({
          question: question.question,
          options: question.options,
          answer: question.answer,
          chosen,
          explanation: question.explanation,
          topic: question.topic,
          subject: book.subject,
          bookId: book.id,
          unitKey,
        })
      }
    })
    track('quiz', 1)
    addXP(20 + score * 3, true)
    setCertId(`JESSICA-${book.subject.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`)
    pushToast({
      title: score / questions.length >= 0.5 ? 'Exam complete — certificate ready' : 'Exam complete',
      description: `${score}/${questions.length} correct. Review the weak topics below.`,
      type: 'xp',
      xp: 20 + score * 3,
    })
  }

  const select = (option: number) => {
    setAnswers((prev) => {
      const copy = [...prev]
      copy[index] = option
      answersRef.current = copy
      return copy
    })
  }

  const next = () => {
    if (index + 1 >= questions.length) finish(answers)
    else setIndex((i) => i + 1)
  }

  const downloadCertificate = async () => {
    if (!result) return
    try {
      await exportCertificatePdf({
        student: name || settings.studentName || 'Jessica Student',
        subject: result.subject,
        score: result.score,
        total: result.total,
        date: new Date(result.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
        certId,
      })
      pushToast({ title: tr("Certificate downloaded"), type: 'success' })
    } catch (err) {
      pushToast({ title: tr("Could not export certificate"), description: err instanceof Error ? err.message : 'Try again.', type: 'error' })
    }
  }

  const current = questions[index]
  const answeredCount = answers.filter((a) => a !== null).length
  const weakGroups = useMemo(() => {
    if (!result) return []
    const map = new Map<string, { total: number; wrong: number }>()
    questions.forEach((q, i) => {
      const entry = map.get(q.topic) || { total: 0, wrong: 0 }
      entry.total += 1
      if (answers[i] !== q.answer) entry.wrong += 1
      map.set(q.topic, entry)
    })
    return [...map.entries()].filter(([, v]) => v.wrong > 0)
  }, [result, questions, answers])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Mock exam simulator")}
      subtitle={tr("Timed, Ministry-style, no hints — then a precise weakness report and a certificate.")}
      icon={<GraduationCap className="h-4.5 w-4.5" />}
      size="xl"
      footer={
        stage === 'exam' ? (
          <div className={"flex items-center justify-between gap-2"}>
            <p className={"flex items-center gap-1.5 text-[11px] font-bold text-muted"}>
              <Timer className={"h-3.5 w-3.5"} /> {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} {tr("left")}
            </p>
            <div className={"flex gap-2"}>
              <Button variant={"ghost"} size={"sm"} onClick={() => finish(answers)}>
                {tr("Finish early")}
              </Button>
              <Button size={"sm"} onClick={next}>
                {index + 1 >= questions.length ? tr("Submit exam") : tr("Next question")}
                <ChevronRight className={"h-3.5 w-3.5"} />
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {stage === 'setup' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-line bg-gradient-to-br from-sun/10 via-card-2 to-violet-neon/10 p-5 text-center">
            <Mascot xp={xp} size={110} mood="proud" />
            <h3 className="mt-2 font-display text-xl font-extrabold text-main">{tr("Exam conditions, zero panic")}</h3>
            <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted">
              {tr("A real timer, formal question style and a full results breakdown. Finish above 50% to unlock a downloadable certificate.")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="label mb-1.5 block">{tr("Questions")}</span>
              <div className="flex gap-1 rounded-xl border border-line bg-card-2 p-1">
                {[5, 10, 15].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={cn('flex-1 rounded-lg py-1.5 text-[11px] font-bold', count === n ? 'bg-aurora-400 text-ink-950' : 'text-muted')}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </label>
            <label className="block">
              <span className="label mb-1.5 block">{tr("Time limit")}</span>
              <div className="flex gap-1 rounded-xl border border-line bg-card-2 p-1">
                {[8, 12, 20].map((n) => (
                  <button
                    key={n}
                    onClick={() => setMinutes(n)}
                    className={cn('flex-1 rounded-lg py-1.5 text-[11px] font-bold', minutes === n ? 'bg-violet-neon text-white' : 'text-muted')}
                  >
                    {n} {tr("min")}
                  </button>
                ))}
              </div>
            </label>
          </div>

          <div className="rounded-2xl border border-line bg-card-2 p-3">
            <p className="text-[11px] font-bold text-main">{book.title}</p>
            <p className="text-[10px] text-muted">
              {book.subject} · {count} {tr("questions · generated from your digital textbook")}
            </p>
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-line bg-card-2 p-2.5 text-[11px] font-semibold text-main">
            <input type="checkbox" checked={extraTime} onChange={(e) => setExtraTime(e.target.checked)} className="h-4 w-4 accent-sun" />
            {tr('Extra time (+25%)')}
          </label>

          {draft && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setQuestions(draft.questions)
                const restored = draft.answers.length === draft.questions.length ? draft.answers : Array(draft.questions.length).fill(null)
                setAnswers(restored)
                answersRef.current = restored
                setIndex(Math.min(draft.index, draft.questions.length - 1))
                setFlagged(draft.flagged || [])
                setRemaining(draft.remaining)
                setEndAt(Date.now() + draft.remaining * 1000)
                startedRef.current = Date.now()
                setStage('exam')
              }}
            >
              <TimerReset className="h-4 w-4" /> {tr('Resume saved exam ({n} left)', { n: draft.remaining })}
            </Button>
          )}

          <Button className="w-full" onClick={start}>
            <Play className="h-4 w-4" /> {tr("Start timed exam")}
          </Button>
          {error && <p className="rounded-xl border border-coral/30 bg-coral/10 p-2.5 text-[11px] text-coral">{error}</p>}
          <p className="text-center text-[10px] text-muted-2">{tr("No explanations during the exam. You will get the full review after submitting.")}</p>
        </div>
      )}

      {stage === 'loading' && (
        <div className="py-10">
          <Spinner label={tr("Writing a formal exam paper…")} />
          <p className="mx-auto mt-2 max-w-xs text-center text-[10px] leading-relaxed text-muted">
            {tr("Mixing recall, understanding and one challenge question per topic.")}
          </p>
        </div>
      )}

      {stage === 'exam' && current && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="label text-sun">{tr("Question")} {index + 1} {tr("of")} {questions.length}</p>
              <p className="text-[10px] text-muted">{current.topic} {tr("· answered")} {answeredCount}/{questions.length}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFlagged((list) => (list.includes(index) ? list.filter((item) => item !== index) : [...list, index]))}
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-full border transition',
                  flagged.includes(index) ? 'border-sun/50 bg-sun/15 text-sun' : 'border-line bg-card-2 text-muted hover:text-main',
                )}
                aria-label={tr('Flag this question')}
                title={tr('Flag this question')}
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            <div className="flex items-center gap-1.5 rounded-full bg-coral/10 px-2.5 py-1 text-[11px] font-bold text-coral">
              <AlarmClock className="h-3.5 w-3.5" />
              {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
            </div>
            </div>
          </div>
          <div className="mb-4 flex gap-1">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition',
                  i === index ? 'bg-aurora-400' : answers[i] !== null ? 'bg-violet-neon/60' : 'bg-white/10',
                )}
                aria-label={`Question ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 font-display text-base font-extrabold leading-snug text-main sm:text-lg">{current.question}</p>
            <button
              onClick={() => (speaking ? stop() : speak(current.question, /arab/i.test(book.subject) ? 'ar' : /fran|french/i.test(book.subject) ? 'fr' : /german|deutsch/i.test(book.subject) ? 'de' : 'en'))}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-line bg-card-2 text-muted transition hover:text-main"
              aria-label={speaking ? tr('Stop reading') : tr('Read the question')}
              title={speaking ? tr('Stop reading') : tr('Read the question')}
            >
              {speaking ? <StopCircle className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {current.options.map((option, i) => (
              <button
                key={i}
                onClick={() => select(i)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-[13px] font-medium transition',
                  answers[index] === i
                    ? 'border-aurora-400/60 bg-aurora-400/15 text-main'
                    : 'border-line bg-card-2 text-main hover:border-line-strong hover:bg-white/5',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[10px] font-bold',
                    answers[index] === i ? 'bg-aurora-400 text-ink-950' : 'bg-white/5 text-muted',
                  )}
                >
                  {answers[index] === i ? <Check className="h-3.5 w-3.5" /> : String.fromCharCode(65 + i)}
                </span>
                <span className="leading-relaxed">{option}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
              <ChevronLeft className="h-3.5 w-3.5" /> {tr("Back")}
            </Button>
            <p className="text-[10px] text-muted-2">{tr("No feedback until submission ·")} {questions.length - answeredCount} {tr("unanswered")}</p>
          </div>
        </div>
      )}

      {stage === 'results' && result && (
        <div>
          <div className="flex flex-col items-center gap-3 text-center">
            <Mascot xp={xp} size={120} mood={pct(result.score, result.total) >= 50 ? 'celebrate' : 'thinking'} />
            <div>
              <p className="font-display text-4xl font-extrabold text-main">
                {pct(result.score, result.total)}%
              </p>
              <p className="text-[11px] font-semibold text-muted">
                {result.score} {tr("of")} {result.total} {tr("correct ·")} {Math.floor(result.durationSeconds / 60)}m {result.durationSeconds % 60}s
              </p>
            </div>
            <span
              className={cn(
                'chip',
                pct(result.score, result.total) >= 80
                  ? 'border-aurora-400/30 bg-aurora-400/10 text-aurora-200'
                  : pct(result.score, result.total) >= 50
                    ? 'border-sun/30 bg-sun/10 text-sun'
                    : 'border-coral/30 bg-coral/10 text-coral',
              )}
            >
              <Trophy className="h-3 w-3" />
              {pct(result.score, result.total) >= 80 ? 'Excellent — exam ready' : pct(result.score, result.total) >= 50 ? 'Passing — keep sharpening' : 'Needs revision'}
            </span>
          </div>

          {weakGroups.length > 0 ? (
            <div className="mt-4">
              <p className="label mb-2">{tr("Weakness analysis")}</p>
              <div className="space-y-1.5">
                {weakGroups.map(([topic, stats]) => (
                  <div key={topic} className="flex items-center gap-2 rounded-xl border border-coral/20 bg-coral/5 p-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-coral/15 text-[10px] font-black text-coral">
                      {stats.wrong}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-bold text-main">{topic}</p>
                      <p className="text-[9px] text-muted">{stats.wrong} {tr("of")} {stats.total} {tr("missed · revise this before the next exam")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-aurora-400/25 bg-aurora-400/10 p-3 text-center text-[11px] font-semibold text-aurora-200">
              <Sparkles className="mr-1 inline h-3.5 w-3.5" /> {tr("Full marks — every topic is solid. Try 15 questions next.")}
            </p>
          )}

          <div className="mt-4 space-y-2">
            <p className="label">{tr("Question review")}</p>
            <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {questions.map((q, i) => {
                const correct = answers[i] === q.answer
                return (
                  <div key={i} className={cn('rounded-xl border p-2.5', correct ? 'border-aurora-400/20 bg-aurora-400/5' : 'border-coral/20 bg-coral/5')}>
                    <div className="flex items-start gap-2">
                      <span className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md', correct ? 'bg-aurora-400 text-ink-950' : 'bg-coral text-white')}>
                        {correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold leading-relaxed text-main">{q.question}</p>
                        {!correct && (
                          <p className="mt-0.5 text-[10px] text-muted">
                            {tr("Correct:")} <span className="text-aurora-300">{q.options[q.answer]}</span>
                          </p>
                        )}
                        <div className="mt-1 text-[10px] leading-relaxed text-muted">
                          <Markdown>{q.explanation}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2 border-t border-line pt-3">
            <Button variant="secondary" size="sm" onClick={downloadCertificate}>
              <Award className="h-3.5 w-3.5" /> {tr("Certificate PDF")}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setStage('setup')}>
              <RefreshCw className="h-3.5 w-3.5" /> {tr("New exam")}
            </Button>
            <Button size="sm" onClick={onClose}>
              <Download className="h-3.5 w-3.5" /> {tr("Continue studying")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
