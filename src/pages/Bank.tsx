import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Layers, RotateCcw, Sparkles, Target, Trophy, X } from 'lucide-react'
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

const COUNTS = [10, 20]

export function Bank() {
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const curriculum = useApp((s) => s.settings.curriculum)
  const recordSkill = useApp((s) => s.recordSkill)
  const addXP = useApp((s) => s.addXP)
  const pushToast = useUI((s) => s.pushToast)

  const [phase, setPhase] = useState<Phase>('intro')
  const [subject, setSubject] = useState<BankSubject>('Mathematics')
  const [count, setCount] = useState(10)
  const [seed, setSeed] = useState(0)
  const [questions, setQuestions] = useState(() => buildDrill('Mathematics', gradeLevel, 10))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})

  const score = useMemo(
    () => questions.filter((question) => answers[question.id] === question.answer).length,
    [questions, answers],
  )
  const weakest = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>()
    for (const question of questions) {
      const entry = map.get(question.skill) || { correct: 0, total: 0 }
      entry.total += 1
      if (answers[question.id] === question.answer) entry.correct += 1
      map.set(question.skill, entry)
    }
    return [...map.entries()]
      .map(([skill, value]) => ({ skill, ...value }))
      .sort((a, b) => a.correct / a.total - b.correct / b.total)[0]
  }, [questions, answers])

  const current = questions[index]

  const start = (nextSubject: BankSubject = subject, nextCount = count) => {
    setSubject(nextSubject)
    setCount(nextCount)
    setQuestions(buildDrill(nextSubject, gradeLevel, nextCount))
    setSeed((value) => value + 1)
    setIndex(0)
    setPicked(null)
    setAnswers({})
    setPhase('quiz')
  }

  const choose = (option: number) => {
    if (picked !== null || !current) return
    setPicked(option)
    setAnswers((prev) => ({ ...prev, [current.id]: option }))
    recordSkill(current.subject, current.skill, option === current.answer)
  }

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      setPicked(null)
      return
    }
    addXP(5 + score * 2)
    if (score >= questions.length - 1) {
      pushToast({ title: tr('Clean sheet!'), description: tr('Every answer right — try the next subject.'), type: 'success' })
    }
    setPhase('result')
  }

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
            <Button size="md" onClick={() => start()} data-testid="bank-start">
              <Sparkles className="h-4 w-4" /> {tr('Start the drill')}
            </Button>
            <Link to="/practice">
              <Button size="md" variant="ghost">
                <Target className="h-4 w-4" /> {tr('Adaptive practice')}
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-[10px] leading-relaxed text-muted-2">
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
            <span className="chip border-line bg-white/5 text-[10px] font-bold text-aurora-200">
              {tr(current.subject)} · {tr(current.skill)}
            </span>
          </div>
          <ProgressBar value={index} max={questions.length} height="h-1.5" className="mt-2" />

          <p className="mt-4 font-display text-lg font-extrabold leading-relaxed text-main" dir="auto">
            {current.prompt}
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {current.options.map((option, optionIndex) => {
              const isCorrect = optionIndex === current.answer
              const isPicked = picked === optionIndex
              const revealed = picked !== null
              return (
                <button
                  key={`${current.id}-${optionIndex}`}
                  data-testid="bank-option"
                  disabled={revealed}
                  onClick={() => choose(optionIndex)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-start transition',
                    !revealed && 'border-line bg-card-2 hover:border-aurora-400/40 hover:bg-white/5',
                    revealed && isCorrect && 'border-aurora-400/60 bg-aurora-400/10',
                    revealed && isPicked && !isCorrect && 'border-red-400/50 bg-red-400/10',
                    revealed && !isCorrect && !isPicked && 'border-line bg-card-2 opacity-60',
                  )}
                >
                  <span className="font-display text-base font-extrabold text-main" dir="auto">
                    {option}
                  </span>
                  {revealed && isCorrect && <Check className="h-4 w-4 shrink-0 text-aurora-300" />}
                  {revealed && isPicked && !isCorrect && <X className="h-4 w-4 shrink-0 text-red-300" />}
                </button>
              )
            })}
          </div>

          {picked !== null && (
            <div className="mt-3 rounded-2xl border border-line bg-card-2 p-3">
              <p className="text-[11px] font-extrabold text-main">
                {picked === current.answer ? tr('Correct — here is why') : tr('Not quite — here is the trick')}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted" dir="auto">
                {current.explanation}
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button size="md" data-testid="bank-next" onClick={next} disabled={picked === null}>
              {index + 1 === questions.length ? tr('See my score') : tr('Next question')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
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
              {num(score)} <span className="text-base text-muted-2">/ {num(questions.length)}</span>
            </p>
            <p className="text-[11px] text-muted">{tr('score')}</p>
            {weakest && (
              <p className="mx-auto mt-3 max-w-sm text-[11px] leading-relaxed text-muted">
                {tr('Weakest skill here: {skill} — {correct} of {total}.', {
                  skill: weakest.skill,
                  correct: num(weakest.correct),
                  total: num(weakest.total),
                })}
              </p>
            )}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => start(subject, count)}>
                <RotateCcw className="h-3.5 w-3.5" /> {tr('New drill')}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setPhase('intro')}>
                <Layers className="h-3.5 w-3.5" /> {tr('Change subject')}
              </Button>
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
        </div>
      )}
    </div>
  )
}
