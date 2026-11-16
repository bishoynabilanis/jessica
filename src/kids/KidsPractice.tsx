import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Sparkles, Star, X } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { Button } from '@/components/ui/Button'
import { buildDrill, type BankSubject, type BankQuestion } from '@/lib/questionBank'
import { num, tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { playCorrect, playFinish, playWrong } from '@/lib/sound'
import { celebrate } from '@/lib/celebrate'
import { SolutionSteps } from '@/components/tools/SolutionSteps'

type Phase = 'pick' | 'quiz' | 'done'

const SUBJECTS: Array<{ value: BankSubject; emoji: string }> = [
  { value: 'Mathematics', emoji: '🔢' },
  { value: 'Science', emoji: '🔬' },
  { value: 'English', emoji: '🔤' },
  { value: 'Arabic', emoji: '📖' },
]

const COUNT = 10

/**
 * The kids world gets its own practice screen: ten questions from the same
 * generator the bank uses, but with stars, big buttons and no exam clock.
 */
export function KidsPractice() {
  const navigate = useNavigate()
  const grade = useApp((s) => s.settings.gradeLevel)
  const addXP = useApp((s) => s.addXP)
  const recordSkill = useApp((s) => s.recordSkill)
  const sound = useApp((s) => s.settings.sound !== false)
  const updateSettings = useApp((s) => s.updateSettings)
  const recordPractice = useApp((s) => s.recordPractice)

  const [phase, setPhase] = useState<Phase>('pick')
  const [subject, setSubject] = useState<BankSubject>('Mathematics')
  const [questions, setQuestions] = useState<BankQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const current = questions[index]
  const stars = useMemo(() => (score >= 9 ? 3 : score >= 6 ? 2 : score >= 1 ? 1 : 0), [score])
  const praise = useMemo(
    () => ['You are on fire today!', 'That was quick and clean!', 'Your buddy is proud of you!'][score % 3],
    [score],
  )

  const start = (next: BankSubject = subject) => {
    setSubject(next)
    setQuestions(buildDrill(next, grade, COUNT))
    setIndex(0)
    setPicked(null)
    setScore(0)
    setPhase('quiz')
  }

  const choose = (option: number) => {
    if (!current || picked !== null) return
    setPicked(option)
    const ok = option === current.answer
    if (sound) {
      if (ok) playCorrect()
      else playWrong()
    }
    if (ok) setScore((value) => value + 1)
    recordSkill(current.subject, current.skill, ok)
  }

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      setPicked(null)
      return
    }
    addXP(5 + score)
    recordPractice()
    if (score >= questions.length - 2) celebrate()
    if (sound) playFinish()
    setPhase('done')
  }

  if (phase === 'pick') {
    return (
      <div className="space-y-4">
        <div className="rounded-[32px] border-2 border-white bg-white/80 p-5 text-center shadow-[0_18px_40px_-24px_rgba(15,23,42,.4)]">
          <p className="text-4xl">🎯</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-ink-950">{tr('Practise and win stars')}</h1>
          <p className="mt-1 text-xs font-semibold text-ink-600">{tr('Ten questions from your own grade. Every right answer is a star.')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SUBJECTS.map((item) => (
            <button
              key={item.value}
              onClick={() => start(item.value)}
              data-testid={`kids-practice-${item.value}`}
              className="rounded-[28px] border-2 border-white bg-white/85 p-4 text-center shadow-[0_14px_30px_-22px_rgba(15,23,42,.45)] transition active:scale-[.97]"
            >
              <span className="block text-3xl">{item.emoji}</span>
              <span className="mt-1 block text-sm font-extrabold text-ink-950">{tr(item.value)}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/kids')}
          className="mx-auto block text-xs font-extrabold text-ink-600 underline"
        >
          {tr('Back home')}
        </button>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="space-y-4">
        <div className="rounded-[32px] border-2 border-white bg-white/85 p-6 text-center shadow-[0_18px_40px_-24px_rgba(15,23,42,.4)]">
          <div className="flex justify-center gap-2 text-4xl">
            {[0, 1, 2].map((slot) => (
              <span key={slot} className={slot < stars ? 'kids-bob' : 'opacity-25'}>
                ⭐
              </span>
            ))}
          </div>
          <p className="mt-3 font-display text-xl font-extrabold text-ink-950">
            {tr('You got {n} of {m} right', { n: num(score), m: num(questions.length) })}
          </p>
          <p className="mt-1 text-sm font-extrabold text-violet-700">{tr(praise)}</p>
          <p className="mt-1 text-xs font-semibold text-ink-600">
            {stars === 3 ? tr('Perfect — that is three stars!') : stars >= 1 ? tr('Good work. Try again for three stars.') : tr('Every try makes it easier. Go again!')}
          </p>
          <p className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-[11px] font-extrabold text-amber-700">
            ⭐ {tr('{n} stars went to today’s goal', { n: num(5 + score) })}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button size="md" onClick={() => start(subject)} data-testid="kids-practice-again">
              <Sparkles className="h-4 w-4" /> {tr('Play again')}
            </Button>
            <Button size="md" variant="secondary" onClick={() => setPhase('pick')}>
              {tr('Pick another subject')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!current) return null

  const revealed = picked !== null
  const correct = revealed && picked === current.answer

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-full border-2 border-white bg-white/80 px-4 py-2">
        <span className="text-[11px] font-extrabold text-ink-700">
          {tr('Question {n} of {m}', { n: num(index + 1), m: num(questions.length) })}
        </span>
        <span className="flex items-center gap-2">
          <button
            onClick={() => updateSettings({ sound: !sound })}
            aria-label={sound ? tr('Mute sounds') : tr('Turn sounds on')}
            data-testid="kids-practice-sound"
            className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-xs"
          >
            {sound ? '🔊' : '🔇'}
          </button>
          <span className="text-sm font-extrabold text-amber-600">⭐ {num(score)}</span>
        </span>
      </div>

      <div className="flex gap-1">
        {questions.map((question, slot) => (
          <span
            key={question.id}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              slot < index ? 'bg-emerald-400' : slot === index ? 'bg-sky-400' : 'bg-black/10',
            )}
          />
        ))}
      </div>

      <div className="rounded-[32px] border-2 border-white bg-white/90 p-5 shadow-[0_18px_40px_-24px_rgba(15,23,42,.4)]">
        <p className="text-center font-display text-lg font-extrabold leading-relaxed text-ink-950" dir="auto">
          {current.prompt}
        </p>

        <div className="mt-4 grid gap-2">
          {current.options.map((option, optionIndex) => {
            const isCorrect = optionIndex === current.answer
            const isPicked = picked === optionIndex
            return (
              <button
                key={`${current.id}-${optionIndex}`}
                onClick={() => choose(optionIndex)}
                disabled={revealed}
                data-testid="kids-practice-option"
                className={cn(
                  'flex items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-start text-base font-extrabold transition active:scale-[.98]',
                  !revealed && 'border-black/10 bg-white text-ink-950',
                  revealed && isCorrect && 'border-emerald-400 bg-emerald-50 text-emerald-900',
                  revealed && isPicked && !isCorrect && 'border-rose-300 bg-rose-50 text-rose-900',
                  revealed && !isCorrect && !isPicked && 'border-black/5 bg-white/60 text-ink-400',
                )}
              >
                <span dir="auto">{option}</span>
                {revealed && isCorrect && <Check className="h-5 w-5 text-emerald-500" />}
                {revealed && isPicked && !isCorrect && <X className="h-5 w-5 text-rose-400" />}
              </button>
            )
          })}
        </div>

        {revealed && (
          <div
            className={cn(
              'mt-3 rounded-2xl px-3 py-2 text-center text-[12px] font-extrabold',
              correct ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800',
            )}
          >
            {correct
              ? tr('Correct! ⭐')
              : tr('Almost! The answer is {answer}', { answer: current.options[current.answer] })}
            <span className="mt-1 block text-[10px] font-semibold opacity-80" dir="auto">
              {current.explanation}
            </span>
            <SolutionSteps question={current} />
          </div>
        )}

        <div className="mt-3 flex justify-center">
          <Button size="md" onClick={next} disabled={!revealed} data-testid="kids-practice-next">
            {index + 1 === questions.length ? tr('See my stars') : tr('Next question')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>

      <p className="flex items-center justify-center gap-1 text-[10px] font-bold text-ink-500">
        <Star className="h-3 w-3 text-amber-500" /> {tr('Every right answer is one star for your buddy.')}
      </p>
    </div>
  )
}
