import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Brain, Check, Gauge, RotateCcw, Sparkles, Target, Trophy, X } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, ProgressBar } from '@/components/ui/Card'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { levelLabel } from '@/lib/curriculum'
import { levelBand, placementTest, scoreBySkill } from '@/lib/placement'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'

type Phase = 'intro' | 'quiz' | 'result'

const QUESTION_COUNT = 12

export function Diagnostic() {
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const name = useApp((s) => s.name)
  const recordSkill = useApp((s) => s.recordSkill)
  const addXP = useApp((s) => s.addXP)
  const pushToast = useUI((s) => s.pushToast)

  const [phase, setPhase] = useState<Phase>('intro')
  const [seed, setSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [picked, setPicked] = useState<number | null>(null)

  const questions = useMemo(() => placementTest(gradeLevel, QUESTION_COUNT), [gradeLevel, seed])

  const score = useMemo(
    () => questions.filter((question) => answers[question.id] === question.answer).length,
    [questions, answers],
  )
  const skills = useMemo(() => scoreBySkill(questions, answers), [questions, answers])
  const weakest = skills[0]
  const band = levelBand(score, questions.length)
  const current = questions[index]

  const restart = () => {
    setSeed((value) => value + 1)
    setPhase('quiz')
    setIndex(0)
    setAnswers({})
    setPicked(null)
  }

  const finish = (finalAnswers: Record<string, number>) => {
    const correct = questions.filter((question) => finalAnswers[question.id] === question.answer).length
    addXP(10 + correct * 2)
    if (correct >= questions.length - 2) {
      pushToast({ title: tr('Strong result!'), description: tr('Your plan is now tuned to the few gaps left.'), type: 'success' })
    }
    setPhase('result')
  }

  const choose = (option: number) => {
    if (picked !== null || !current) return
    setPicked(option)
    setAnswers((prev) => ({ ...prev, [current.id]: option }))
    recordSkill('Mathematics', current.skill, option === current.answer)
  }

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      setPicked(null)
      return
    }
    finish({ ...answers })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Level test')}
        title={tr('Where do you actually stand?')}
        subtitle={tr('Twelve questions, two minutes. No key and no internet: every question is generated on this device.')}
        icon={<Gauge className="h-5 w-5" />}
        actions={
          <Link to="/skills">
            <Button variant="secondary" size="md">
              <Target className="h-4 w-4" /> {tr('Skills map')}
            </Button>
          </Link>
        }
      />

      {phase === 'intro' && (
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-neon/15 text-violet-glow">
              <Brain className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-main">
                {name ? tr('Ready, {name}?', { name }) : tr('Ready when you are.')}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {tr('We start easy and get harder. Whatever you miss becomes the base of your plan — nothing is graded, nobody sees it.')}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { emoji: '🎯', label: tr('{n} questions', { n: QUESTION_COUNT }) },
              { emoji: '⏱️', label: tr('About two minutes') },
              { emoji: '🧭', label: tr('Level + gaps + plan') },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 rounded-xl border border-line bg-card-2 px-3 py-2">
                <span>{item.emoji}</span>
                <span className="text-[10px] font-bold text-muted">{item.label}</span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[10px] text-muted-2">
            {tr('Grade: {grade}', { grade: levelLabel(gradeLevel, 'egypt') })}
          </p>

          <Button className="mt-4 w-full sm:w-auto" size="md" onClick={restart}>
            <Sparkles className="h-4 w-4" /> {tr('Start the test')}
          </Button>
        </Card>
      )}

      {phase === 'quiz' && current && (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-2">
              {tr('Question {n} of {m}', { n: index + 1, m: questions.length })}
            </span>
            <span className="chip border-line bg-white/5 text-[10px] font-bold text-muted">{tr(current.skill)}</span>
          </div>
          <ProgressBar value={index} max={questions.length} height="h-1.5" className="mt-2" />

          <p className="mt-5 font-display text-2xl font-extrabold text-main" dir="rtl">
            {current.prompt}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {current.options.map((option, optionIndex) => {
              const isCorrect = optionIndex === current.answer
              const isPicked = picked === optionIndex
              const revealed = picked !== null
              return (
                <button
                  key={option}
                  data-testid="placement-option"
                  onClick={() => choose(optionIndex)}
                  disabled={revealed}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-start transition',
                    !revealed && 'border-line bg-card-2 hover:border-aurora-400/40 hover:bg-white/5',
                    revealed && isCorrect && 'border-aurora-400/60 bg-aurora-400/10',
                    revealed && isPicked && !isCorrect && 'border-red-400/50 bg-red-400/10',
                    revealed && !isCorrect && !isPicked && 'border-line bg-card-2 opacity-60',
                  )}
                >
                  <span className="font-display text-lg font-extrabold text-main" dir="rtl">
                    {option}
                  </span>
                  {revealed && isCorrect && <Check className="h-4 w-4 shrink-0 text-aurora-300" />}
                  {revealed && isPicked && !isCorrect && <X className="h-4 w-4 shrink-0 text-red-300" />}
                </button>
              )
            })}
          </div>

          {picked !== null && (
            <div className="mt-4 rounded-2xl border border-line bg-card-2 p-3">
              <p className="text-[11px] font-bold text-main" dir="rtl">
                {picked === current.answer ? tr('Correct — here is why') : tr('Not quite — here is the trick')}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted" dir="rtl">
                {current.why}
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button size="md" data-testid="placement-next" onClick={next} disabled={picked === null}>
              {index + 1 === questions.length ? tr('Show my level') : tr('Next question')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </Card>
      )}

      {phase === 'result' && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-aurora-400 to-violet-neon text-xl">
                  {band >= 4 ? '🏆' : band === 3 ? '🎯' : '💪'}
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-2">{tr('Your level')}</p>
                  <p className="font-display text-xl font-extrabold text-main">
                    {band >= 4 ? tr('Strong') : band === 3 ? tr('On track') : band === 2 ? tr('Getting there') : tr('Needs a hand')}
                  </p>
                </div>
              </div>
              <div className="text-end">
                <p className="font-display text-3xl font-extrabold text-main">
                  {score}
                  <span className="text-lg text-muted-2">/{questions.length}</span>
                </p>
                <p className="text-[10px] text-muted">{tr('correct answers')}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {skills.map((item) => {
                const ratio = item.total ? item.correct / item.total : 0
                return (
                  <div key={item.skill}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-main">{tr(item.skill)}</span>
                      <span className="text-[10px] font-bold text-muted">
                        {item.correct}/{item.total}
                      </span>
                    </div>
                    <ProgressBar
                      value={item.correct}
                      max={item.total}
                      height="h-1.5"
                      className="mt-1"
                      barClassName={ratio >= 0.8 ? 'from-aurora-400 to-aurora-400' : ratio >= 0.5 ? 'from-sun to-sun' : 'from-red-400 to-red-400'}
                    />
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="border-violet-neon/25 bg-gradient-to-br from-violet-neon/10 via-card to-aurora-400/5 p-4">
            <div className="flex items-start gap-2.5">
              <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-sun" />
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-main">{tr('What happens next')}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  {weakest
                    ? tr('Every miss is already in your skills map, so today’s plan now starts with {skill}.', { skill: tr(weakest.skill) })
                    : tr('Your plan now follows your weakest skills.')}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/plan">
                <Button size="sm">
                  <Sparkles className="h-3.5 w-3.5" /> {tr('See my plan')}
                </Button>
              </Link>
              <Link to="/practice">
                <Button size="sm" variant="secondary">
                  <Target className="h-3.5 w-3.5" /> {tr('Practise the weak spots')}
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={restart}>
                <RotateCcw className="h-3.5 w-3.5" /> {tr('Try again')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
