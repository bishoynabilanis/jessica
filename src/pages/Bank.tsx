import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Layers,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, ProgressBar } from '@/components/ui/Card'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { BANK_SUBJECTS, buildDrill, type BankSubject } from '@/lib/questionBank'
import { levelLabel } from '@/lib/curriculum'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

type Phase = 'intro' | 'quiz' | 'result'
type Mode = 'drill' | 'exam'

const COUNTS = [10, 20]
const EXAM_COUNT = 20
const EXAM_SECONDS = 20 * 60

/**
 * Arabic-Indic digits are weak-directional, so a pure equation inside an
 * Arabic paragraph can be laid out backwards. Strings that carry no Arabic
 * letters are isolated and pinned left-to-right; sentences keep the normal
 * bidi flow.
 */
const ARABIC_LETTER = /[\u0621-\u064A]/
const MATH_OPERATOR = /([+\-\u2212×÷=⟹√^/])/g

function RichText({ text }: { text: string }) {
  if (ARABIC_LETTER.test(text)) return <>{text}</>
  return <bdi dir="ltr">{text.replace(MATH_OPERATOR, '\u200E$1\u200E')}</bdi>
}

const clock = (seconds: number) => {
  const safe = Math.max(0, seconds)
  return `${num(String(Math.floor(safe / 60)).padStart(2, '0'))}:${num(String(safe % 60).padStart(2, '0'))}`
}

export function Bank() {
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const curriculum = useApp((s) => s.settings.curriculum)
  const recordSkill = useApp((s) => s.recordSkill)
  const addMistake = useApp((s) => s.addMistake)
  const addXP = useApp((s) => s.addXP)
  const pushToast = useUI((s) => s.pushToast)

  const [phase, setPhase] = useState<Phase>('intro')
  const [mode, setMode] = useState<Mode>('drill')
  const [subject, setSubject] = useState<BankSubject>('Mathematics')
  const [count, setCount] = useState(10)
  const [seed, setSeed] = useState(0)
  const [questions, setQuestions] = useState(() => buildDrill('Mathematics', gradeLevel, 10))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [endsAt, setEndsAt] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [timedOut, setTimedOut] = useState(false)

  const remaining = endsAt ? Math.max(0, Math.round((endsAt - now) / 1000)) : EXAM_SECONDS

  const score = useMemo(
    () => questions.filter((question) => answers[question.id] === question.answer).length,
    [questions, answers],
  )

  const bySkill = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>()
    for (const question of questions) {
      const entry = map.get(question.skill) || { correct: 0, total: 0 }
      entry.total += 1
      if (answers[question.id] === question.answer) entry.correct += 1
      map.set(question.skill, entry)
    }
    return [...map.entries()]
      .map(([skill, value]) => ({ skill, ...value }))
      .sort((a, b) => a.correct / a.total - b.correct / b.total)
  }, [questions, answers])

  const weakest = bySkill[0]
  const current = questions[index]

  const finish = (reason: 'done' | 'time' = 'done') => {
    setPhase('result')
    setEndsAt(0)
    setTimedOut(reason === 'time')

    let correct = 0
    for (const question of questions) {
      const chosen = answers[question.id]
      if (chosen === undefined) continue
      const ok = chosen === question.answer
      if (ok) correct += 1
      recordSkill(question.subject, question.skill, ok)
      if (!ok) {
        addMistake({
          question: question.prompt,
          options: question.options,
          answer: question.answer,
          chosen,
          explanation: question.explanation,
          subject: question.subject,
          topic: question.skill,
        })
      }
    }

    const base = mode === 'exam' ? 10 : 5
    const per = mode === 'exam' ? 3 : 2
    addXP(base + correct * per)

    if (reason === 'time') {
      pushToast({ title: tr('Time is up — the paper is marked.'), type: 'info' })
    } else if (correct === questions.length) {
      pushToast({ title: tr('Clean sheet!'), description: tr('Every answer right — try the next subject.'), type: 'success' })
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Exam clock: it keeps running while the tab is open and marks the paper at zero.
  useEffect(() => {
    if (phase !== 'quiz' || mode !== 'exam' || !endsAt) return
    const id = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [phase, mode, endsAt])

  useEffect(() => {
    if (phase !== 'quiz' || mode !== 'exam' || !endsAt || now < endsAt) return
    finish('time')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode, endsAt, now])

  const start = (nextSubject: BankSubject = subject, nextCount = count, nextMode: Mode = 'drill') => {
    const total = nextMode === 'exam' ? EXAM_COUNT : nextCount
    setMode(nextMode)
    setSubject(nextSubject)
    setCount(nextCount)
    setQuestions(buildDrill(nextSubject, gradeLevel, total))
    setSeed((value) => value + 1)
    setIndex(0)
    setPicked(null)
    setAnswers({})
    setTimedOut(false)
    setNow(Date.now())
    setEndsAt(nextMode === 'exam' ? Date.now() + EXAM_SECONDS * 1000 : 0)
    setPhase('quiz')
  }

  const choose = (option: number) => {
    if (!current) return
    if (mode === 'drill' && picked !== null) return
    setAnswers((prev) => ({ ...prev, [current.id]: option }))
    if (mode === 'drill') setPicked(option)
  }

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      setPicked(null)
      return
    }
    finish()
  }

  const answered = Object.keys(answers).length

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Question bank')}
        title={tr('A bank that never runs out')}
        subtitle={tr('Every question is generated on this device from your own grade — no key, no internet, and every answer is explained.')}
        icon={<Layers className="h-5 w-5" />}
      />

      {phase === 'intro' && (
        <Card className="p-5">
          <p className="label text-aurora-300">{tr('Choose a subject')}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BANK_SUBJECTS.map((item) => (
              <button
                key={item}
                onClick={() => setSubject(item)}
                className={cn(
                  'rounded-2xl border px-3 py-3 text-center text-[12px] font-extrabold transition',
                  subject === item
                    ? 'border-aurora-400/60 bg-aurora-400/10 text-main'
                    : 'border-line bg-card-2 text-muted hover:border-violet-neon/40',
                )}
              >
                {tr(item)}
              </button>
            ))}
          </div>

          <p className="label mt-4 text-aurora-300">{tr('How many questions?')}</p>
          <div className="mt-2 flex gap-2">
            {COUNTS.map((value) => (
              <Button key={value} size="sm" variant={count === value ? 'primary' : 'secondary'} onClick={() => setCount(value)}>
                {tr('{n} questions', { n: num(value) })}
              </Button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button size="md" onClick={() => start(subject, count, 'drill')} data-testid="bank-start">
              <Sparkles className="h-4 w-4" /> {tr('Start the drill')}
            </Button>
            <Button size="md" variant="secondary" onClick={() => start(subject, EXAM_COUNT, 'exam')} data-testid="bank-exam">
              <Clock className="h-4 w-4" /> {tr('Timed exam — 20 questions, 20 minutes')}
            </Button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <p className="rounded-2xl border border-line bg-card-2 px-3 py-2 text-[10px] leading-relaxed text-muted">
              {tr('Practice mode shows the answer straight away, with the reason, and turns every miss into a card in your mistakes notebook.')}
            </p>
            <p className="rounded-2xl border border-line bg-card-2 px-3 py-2 text-[10px] leading-relaxed text-muted">
              {tr('Exam mode hides the answers until the clock runs out, then marks the whole paper and shows the weak spot.')}
            </p>
          </div>

          <Link to="/mistakes" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-aurora-300 hover:text-aurora-200">
            <AlertTriangle className="h-3.5 w-3.5" /> {tr('Open my mistakes notebook')}
          </Link>

          <p className="mt-3 text-[10px] leading-relaxed text-muted-2">
            {tr('Grade: {grade} · four options per question · a short explanation after every answer.', {
              grade: levelLabel(gradeLevel, curriculum),
            })}
          </p>
        </Card>
      )}

      {phase === 'quiz' && current && (
        <Card className="p-5" data-testid="bank-quiz">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-2">
              {tr('Question {n} of {m}', { n: num(index + 1), m: num(questions.length) })}
            </span>
            {mode === 'exam' ? (
              <span
                className={cn(
                  'chip border px-2 py-1 text-[11px] font-extrabold tabular-nums',
                  remaining <= 120 ? 'border-red-400/50 bg-red-400/10 text-red-200' : 'border-line bg-white/5 text-aurora-200',
                )}
                data-testid="bank-clock"
              >
                <Clock className="me-1 inline h-3 w-3" />
                {clock(remaining)}
              </span>
            ) : (
              <span className="chip border-line bg-white/5 text-[10px] font-bold text-aurora-200">
                {tr(current.subject)} · {tr(current.skill)}
              </span>
            )}
          </div>
          <ProgressBar value={index} max={questions.length} height="h-1.5" className="mt-2" />

          <p className="mt-4 font-display text-lg font-extrabold leading-relaxed text-main" dir="auto">
            <RichText text={current.prompt} />
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {current.options.map((option, optionIndex) => {
              const isCorrect = optionIndex === current.answer
              const isPicked = mode === 'exam' ? answers[current.id] === optionIndex : picked === optionIndex
              const revealed = mode === 'drill' && picked !== null
              return (
                <button
                  key={`${current.id}-${optionIndex}`}
                  data-testid="bank-option"
                  disabled={revealed}
                  onClick={() => choose(optionIndex)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-start transition',
                    !revealed && !isPicked && 'border-line bg-card-2 hover:border-aurora-400/40 hover:bg-white/5',
                    !revealed && isPicked && 'border-violet-neon/70 bg-violet-neon/15',
                    revealed && isCorrect && 'border-aurora-400/60 bg-aurora-400/10',
                    revealed && isPicked && !isCorrect && 'border-red-400/50 bg-red-400/10',
                    revealed && !isCorrect && !isPicked && 'border-line bg-card-2 opacity-60',
                  )}
                >
                  <span className="font-display text-base font-extrabold text-main" dir="auto">
                    <RichText text={option} />
                  </span>
                  {revealed && isCorrect && <Check className="h-4 w-4 shrink-0 text-aurora-300" />}
                  {revealed && isPicked && !isCorrect && <X className="h-4 w-4 shrink-0 text-red-300" />}
                </button>
              )
            })}
          </div>

          {mode === 'drill' && picked !== null && (
            <div className="mt-3 rounded-2xl border border-line bg-card-2 p-3">
              <p className="text-[11px] font-extrabold text-main">
                {picked === current.answer ? tr('Correct — here is why') : tr('Not quite — here is the trick')}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted" dir="auto">
                <RichText text={current.explanation} />
              </p>
            </div>
          )}

          {mode === 'exam' && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-1.5">
                {questions.map((question, questionIndex) => (
                  <button
                    key={question.id}
                    onClick={() => setIndex(questionIndex)}
                    aria-label={`${tr('Question')} ${questionIndex + 1}`}
                    className={cn(
                      'h-7 w-7 rounded-lg border text-[10px] font-extrabold tabular-nums transition',
                      questionIndex === index
                        ? 'border-aurora-400/70 bg-aurora-400/20 text-main'
                        : answers[question.id] === undefined
                          ? 'border-line bg-card-2 text-muted-2'
                          : 'border-violet-neon/40 bg-violet-neon/15 text-main',
                    )}
                  >
                    {num(questionIndex + 1)}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-muted-2">
                {tr('{n} of {m} answered — you can change any answer before you hand it in.', {
                  n: num(answered),
                  m: num(questions.length),
                })}
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            {mode === 'exam' ? (
              <Button size="sm" variant="ghost" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {tr('Previous')}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex flex-wrap gap-2">
              {mode === 'exam' && index + 1 < questions.length && (
                <Button size="md" variant="secondary" data-testid="bank-submit" onClick={() => finish()}>
                  <Send className="h-4 w-4" /> {tr('Hand in the paper')}
                </Button>
              )}
              <Button
                size="md"
                data-testid="bank-next"
                onClick={next}
                disabled={mode === 'drill' && picked === null}
              >
                {index + 1 === questions.length
                  ? mode === 'exam'
                    ? tr('Hand in the paper')
                    : tr('See my score')
                  : tr('Next question')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {phase === 'result' && (
        <div className="space-y-4">
          <Card className="p-5 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-aurora-400 to-violet-neon text-3xl">
              {score === questions.length ? '🏆' : score >= questions.length * 0.6 ? '🎯' : '💪'}
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold text-main">
              <RichText text={`${num(score)} / ${num(questions.length)}`} />
            </p>
            <p className="text-[11px] text-muted">{tr('score')}</p>
            {timedOut && (
              <p className="mx-auto mt-2 w-fit rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[10px] font-bold text-amber-200">
                {tr('The clock marked the paper for you.')}
              </p>
            )}
            {weakest && (
              <p className="mx-auto mt-3 max-w-sm text-[11px] leading-relaxed text-muted">
                {tr('Weakest skill here: {skill} — {correct} of {total}.', {
                  skill: tr(weakest.skill),
                  correct: num(weakest.correct),
                  total: num(weakest.total),
                })}
              </p>
            )}

            {bySkill.length > 1 && (
              <div className="mx-auto mt-4 max-w-md space-y-1.5 text-start">
                {bySkill.map((item) => (
                  <div key={item.skill} className="flex items-center gap-2">
                    <span className="w-28 shrink-0 truncate text-[10px] font-bold text-muted" dir="auto">
                      {tr(item.skill)}
                    </span>
                    <ProgressBar value={item.correct} max={item.total} height="h-1.5" className="flex-1" />
                    <span className="w-9 shrink-0 text-end text-[10px] tabular-nums text-muted-2">
                      {num(item.correct)}/{num(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => start(subject, count, mode)}>
                <RotateCcw className="h-3.5 w-3.5" /> {mode === 'exam' ? tr('Another paper') : tr('New drill')}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setPhase('intro')}>
                <Layers className="h-3.5 w-3.5" /> {tr('Change subject')}
              </Button>
              <Link to="/mistakes">
                <Button size="sm" variant="secondary">
                  <AlertTriangle className="h-3.5 w-3.5" /> {tr('My mistakes')}
                </Button>
              </Link>
              <Link to="/skills">
                <Button size="sm" variant="ghost">
                  <Trophy className="h-3.5 w-3.5" /> {tr('Skills map')}
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-[10px] text-muted-2">
              {tr('Seed {n} · every drill is new.', { n: num(seed) })}
            </p>
          </Card>

          <Card className="p-4">
            <p className="label text-aurora-300">{tr('The whole paper, marked')}</p>
            <div className="mt-2 space-y-2">
              {questions.map((question, questionIndex) => {
                const chosen = answers[question.id]
                const ok = chosen === question.answer
                return (
                  <div
                    key={question.id}
                    className={cn(
                      'rounded-2xl border p-3',
                      chosen === undefined
                        ? 'border-line bg-card-2/60'
                        : ok
                          ? 'border-aurora-400/40 bg-aurora-400/5'
                          : 'border-red-400/40 bg-red-400/5',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-extrabold leading-relaxed text-main" dir="auto">
                        <RichText text={`${num(questionIndex + 1)}. ${question.prompt}`} />
                      </p>
                      {chosen === undefined ? (
                        <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[9px] font-bold text-muted-2">
                          {tr('left blank')}
                        </span>
                      ) : ok ? (
                        <Check className="h-4 w-4 shrink-0 text-aurora-300" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-red-300" />
                      )}
                    </div>
                    <p className="mt-1 text-[10px] font-bold text-aurora-200" dir="auto">
                      <RichText text={tr('Answer: {answer}', { answer: question.options[question.answer] })} />
                    </p>
                    {chosen !== undefined && !ok && (
                      <p className="text-[10px] text-red-200" dir="auto">
                        <RichText text={tr('You chose: {answer}', { answer: question.options[chosen] })} />
                      </p>
                    )}
                    <p className="mt-1 text-[10px] leading-relaxed text-muted" dir="auto">
                      <RichText text={question.explanation} />
                    </p>
                  </div>
                )
              })}
            </div>
            <p className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-muted-2">
              <Target className="mt-0.5 h-3 w-3 shrink-0" />
              {tr('Every miss is already in your mistakes notebook, with its explanation.')}
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
