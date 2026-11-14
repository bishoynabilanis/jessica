import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  Layers,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react'
import type { ChapterText, QuizQuestion } from '@/types'
import { useApp } from '@/store/useApp'
import { getQuizzes } from '@/lib/db'
import { openChapter } from '@/lib/library'
import { clozeQuiz, keyTerms, objectivesOf } from '@/lib/lesson'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, ProgressBar, Spinner } from '@/components/ui/Card'
import { cn, pct } from '@/lib/utils'
import { num, tr } from '@/i18n'

type Step = 'intro' | 'read' | 'terms' | 'check' | 'done'

const STEPS: Step[] = ['intro', 'read', 'terms', 'check', 'done']

interface CheckQuestion {
  id: string
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

interface StoredBank {
  id: string
  subject: string
  questions: QuizQuestion[]
  createdAt: number
}

const MIN_SCORE = 0.6

export function Lesson() {
  const { bookId = '', unitId = '' } = useParams()
  const key = `${bookId}:${unitId}`
  const navigate = useNavigate()

  const customBooks = useApp((s) => s.customBooks)
  const lessonProgress = useApp((s) => s.lessonProgress)
  const completedTopics = useApp((s) => s.completedTopics)
  const unitMastery = useApp((s) => s.unitMastery)
  const setLessonStep = useApp((s) => s.setLessonStep)
  const completeLesson = useApp((s) => s.completeLesson)
  const completeTopic = useApp((s) => s.completeTopic)
  const recordSkill = useApp((s) => s.recordSkill)

  const book = customBooks.find((item) => item.id === bookId)
  const unit = book?.units?.find((item) => item.id === unitId)

  const [chapter, setChapter] = useState<ChapterText | undefined>()
  const [loading, setLoading] = useState(true)
  const [bank, setBank] = useState<CheckQuestion[]>([])

  const savedStep = lessonProgress[key]?.step ?? 0
  const [step, setStep] = useState<Step>(() => {
    if (savedStep > 0 && savedStep < STEPS.length) return STEPS[savedStep]
    return 'intro'
  })
  const [pageIndex, setPageIndex] = useState(0)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const lastKey = useRef(key)

  useEffect(() => {
    if (lastKey.current === key) return
    lastKey.current = key
    const saved = useApp.getState().lessonProgress[key]?.step ?? 0
    setStep(saved > 0 && saved < STEPS.length ? STEPS[saved] : 'intro')
    setPageIndex(0)
    setRevealed({})
    setIndex(0)
    setPicked(null)
    setAnswers({})
  }, [key])

  useEffect(() => {
    if (!book) {
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    openChapter(book)
      .then((text) => {
        if (alive) setChapter(text)
      })
      .catch(() => undefined)
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [book?.id])

  useEffect(() => {
    let alive = true
    getQuizzes()
      .then((banks) => {
        if (!alive) return
        const found = (banks as StoredBank[]).find((item) => item.id === key)
        setBank(
          (found?.questions || []).slice(0, 5).map((question, questionIndex) => ({
            id: `bank-${questionIndex}`,
            prompt: question.question,
            options: question.options,
            answer: question.answer,
            explanation: question.explanation,
          })),
        )
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [key])

  const pages = useMemo(() => {
    if (!chapter || !unit) return []
    return chapter.pages.filter((page) => page.page >= unit.startPage && page.page <= unit.endPage)
  }, [chapter, unit])

  const terms = useMemo(() => keyTerms(pages, 6), [pages])
  const objectives = useMemo(() => objectivesOf(pages, 3), [pages])

  const questions = useMemo<CheckQuestion[]>(() => {
    if (bank.length >= 3) return bank
    return clozeQuiz(terms, 4).map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: question.options,
      answer: question.answer,
      explanation: question.sentence,
    }))
  }, [bank, terms])

  const score = questions.filter((question) => answers[question.id] === question.answer).length
  const passed = questions.length > 0 && score / questions.length >= MIN_SCORE
  const current = questions[index]
  const nextUnit = useMemo(() => {
    if (!book?.units || !unit) return undefined
    const position = book.units.findIndex((item) => item.id === unit.id)
    return position >= 0 ? book.units[position + 1] : undefined
  }, [book, unit])

  const stat = unitMastery[key]
  const alreadyMastered = completedTopics.includes(key) || (stat ? stat.best / stat.total >= 0.8 : false)
  const minutes = Math.max(3, Math.round(pages.length * 1.5))

  const go = (next: Step) => {
    setStep(next)
    setLessonStep(key, STEPS.indexOf(next))
  }

  const finish = () => {
    questions.forEach((question) => {
      recordSkill(book?.subject || 'Study', unit?.title || '', answers[question.id] === question.answer)
    })
    if (passed && unit) completeTopic(key, unit.title, book?.subject || 'Study')
    completeLesson(key)
    setStep('done')
  }

  const restartCheck = () => {
    setAnswers({})
    setPicked(null)
    setIndex(0)
    setStep('check')
  }

  if (!book || !unit) {
    return (
      <Card className="p-5">
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title={tr('This lesson is not in your library')}
          description={tr('Open the book from the library first, then pick the unit again.')}
          action={
            <Button size="sm" onClick={() => navigate('/library')}>
              {tr('Open library')}
            </Button>
          }
        />
      </Card>
    )
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to="/study">
          <Button size="sm" variant="ghost">
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {tr('Study Hub')}
          </Button>
        </Link>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted">
          <span className="chip border-line bg-white/5">{book.emoji} {book.subject}</span>
          <span className="chip border-line bg-white/5">{tr('Unit {n}', { n: num((book.units?.findIndex((item) => item.id === unit.id) ?? 0) + 1) })}</span>
          {alreadyMastered && (
            <span className="chip border-aurora-400/30 bg-aurora-400/10 text-aurora-200">
              <CheckCircle2 className="h-3 w-3" /> {tr('Mastered')}
            </span>
          )}
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-line bg-gradient-to-r from-violet-neon/15 via-card to-aurora-400/10 px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-glow">{book.title}</p>
          <h1 className="mt-0.5 font-display text-lg font-extrabold text-main">{unit.title}</h1>

          <div className="mt-3 flex items-center gap-1">
            {STEPS.slice(0, 4).map((item, itemIndex) => (
              <div key={item} className="flex flex-1 items-center gap-1">
                <span
                  className={cn(
                    'grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-black transition',
                    itemIndex < stepIndex
                      ? 'bg-aurora-400 text-ink-950'
                      : itemIndex === stepIndex
                        ? 'bg-violet-neon text-white'
                        : 'bg-white/10 text-muted',
                  )}
                >
                  {itemIndex < stepIndex ? <Check className="h-3 w-3" /> : itemIndex + 1}
                </span>
                {itemIndex < 3 && (
                  <span
                    className={cn(
                      'h-0.5 flex-1 rounded-full',
                      itemIndex < stepIndex ? 'bg-aurora-400/70' : 'bg-white/10',
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[8px] font-bold uppercase tracking-[0.12em] text-muted-2">
            <span>{tr('Goals')}</span>
            <span>{tr('Read')}</span>
            <span>{tr('Key terms')}</span>
            <span>{tr('Check')}</span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {loading && step === 'intro' ? (
            <Spinner label={tr('Opening your book…')} />
          ) : (
            <>
              {step === 'intro' && (
                <div className="space-y-4" data-testid="lesson-step">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Layers, label: tr('{n} pages', { n: num(pages.length) }) },
                      { icon: Clock3, label: tr('About {n} min', { n: num(minutes) }) },
                      { icon: Target, label: tr('{n} questions', { n: num(Math.max(questions.length, 2)) }) },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-line bg-card-2 px-2 py-2 text-center">
                        <item.icon className="mx-auto h-3.5 w-3.5 text-aurora-300" />
                        <p className="mt-1 text-[9.5px] font-bold text-muted">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="label text-aurora-300">{tr('What you will learn')}</p>
                    <ul className="mt-2 space-y-2">
                      {(objectives.length
                        ? objectives
                        : [tr('Read the unit, collect its key terms, then check yourself with four questions.')]
                      ).map((objective, objectiveIndex) => (
                        <li key={objectiveIndex} className="flex items-start gap-2 rounded-xl border border-line bg-card-2 p-2.5">
                          <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-aurora-400/15 text-[9px] font-black text-aurora-300">
                            {objectiveIndex + 1}
                          </span>
                          <p className="text-[11px] leading-relaxed text-main">{objective}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {savedStep > 0 && savedStep < 4 && (
                    <p className="rounded-xl border border-sun/25 bg-sun/10 px-3 py-2 text-[10px] font-bold text-sun">
                      {tr('You stopped at step {n} last time — pick it up from there.', { n: num(savedStep + 1) })}
                    </p>
                  )}

                  <Button size="md" className="w-full sm:w-auto" onClick={() => go('read')} data-testid="lesson-next">
                    <Sparkles className="h-4 w-4" /> {savedStep > 0 && savedStep < 4 ? tr('Resume the lesson') : tr('Start the lesson')}
                  </Button>
                </div>
              )}

              {step === 'read' && (
                <div className="space-y-3" data-testid="lesson-step">
                  {pages.length === 0 ? (
                    <div className="rounded-2xl border border-line bg-card-2 p-4 text-center">
                      <p className="text-xs font-bold text-main">{tr('This unit has no indexable text yet')}</p>
                      <p className="mt-1 text-[10px] text-muted">{tr('Open the book once so Jessica can read it, then come back.')}</p>
                      <Button size="sm" variant="secondary" className="mt-3" onClick={() => navigate(`/reader/${book.id}`)}>
                        {tr('Open book')}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-muted">
                          {tr('Page {n} of {m}', { n: num(pageIndex + 1), m: num(pages.length) })}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button size="icon-sm" variant="secondary" disabled={pageIndex === 0} onClick={() => setPageIndex((value) => Math.max(0, value - 1))}>
                            <ChevronRight className="h-3.5 w-3.5 rtl:hidden" />
                            <ChevronLeft className="hidden h-3.5 w-3.5 rtl:block" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="secondary"
                            disabled={pageIndex >= pages.length - 1}
                            onClick={() => setPageIndex((value) => Math.min(pages.length - 1, value + 1))}
                          >
                            <ChevronLeft className="h-3.5 w-3.5 rtl:hidden" />
                            <ChevronRight className="hidden h-3.5 w-3.5 rtl:block" />
                          </Button>
                        </div>
                      </div>
                      <ProgressBar value={pageIndex + 1} max={pages.length} height="h-1" />
                      <div className="max-h-[52vh] overflow-y-auto rounded-2xl border border-line bg-card-2 p-4">
                        <p className="whitespace-pre-line text-[12.5px] leading-7 text-main" dir="auto">
                          {pages[pageIndex].text}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Button size="sm" variant="ghost" onClick={() => go('intro')}>
                          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" /> {tr('Back to goals')}
                        </Button>
                        <Button size="sm" onClick={() => go('terms')} data-testid="lesson-next">
                          {tr('Key terms')} <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 'terms' && (
                <div className="space-y-3" data-testid="lesson-step">
                  <div>
                    <p className="label text-aurora-300">{tr('Tap a card to see it in context')}</p>
                    <p className="mt-1 text-[10px] text-muted">
                      {tr('These are the words this unit keeps repeating — they are the ones exam questions use.')}
                    </p>
                  </div>

                  {terms.length === 0 ? (
                    <div className="rounded-2xl border border-line bg-card-2 p-4 text-center text-[11px] text-muted">
                      {tr('No repeated terms detected — you can go straight to the check.')}
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {terms.map((term) => (
                        <button
                          key={term.term}
                          onClick={() => setRevealed((prev) => ({ ...prev, [term.term]: !prev[term.term] }))}
                          className={cn(
                            'rounded-2xl border p-3 text-start transition',
                            revealed[term.term]
                              ? 'border-aurora-400/40 bg-aurora-400/10'
                              : 'border-line bg-card-2 hover:border-violet-neon/40',
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-sm font-extrabold text-main">{term.term}</span>
                            <span className="text-[9px] font-bold text-muted-2">{tr('{n}×', { n: num(term.count) })}</span>
                          </div>
                          <p
                            className={cn(
                              'mt-1 text-[10px] leading-relaxed text-muted',
                              !revealed[term.term] && 'line-clamp-2 opacity-70',
                            )}
                          >
                            {term.sentence}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Button size="sm" variant="ghost" onClick={() => go('read')}>
                      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" /> {tr('Read again')}
                    </Button>
                    <Button size="sm" onClick={() => go('check')} data-testid="lesson-next">
                      <Brain className="h-3.5 w-3.5" /> {tr('Check myself')}
                    </Button>
                  </div>
                </div>
              )}

              {step === 'check' && (
                <div className="space-y-3" data-testid="lesson-step">
                  {!current ? (
                    <div className="rounded-2xl border border-line bg-card-2 p-4 text-center">
                      <p className="text-xs font-bold text-main">{tr('No questions for this unit yet')}</p>
                      <p className="mx-auto mt-1 max-w-sm text-[10px] leading-relaxed text-muted">
                        {tr('Read the pages and note the key terms, then practise the unit from the study hub.')}
                      </p>
                      <div className="mt-3 flex flex-wrap justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => go('terms')}>
                          {tr('Back to key terms')}
                        </Button>
                        <Button size="sm" onClick={finish}>
                          {tr('Finish the lesson')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-2">
                          {tr('Question {n} of {m}', { n: num(index + 1), m: num(questions.length) })}
                        </span>
                        <span className="chip border-line bg-white/5 text-[10px] font-bold text-aurora-200">
                          {bank.length >= 3 ? tr('Unit quiz') : tr('Recall check')}
                        </span>
                      </div>
                      <ProgressBar value={index} max={questions.length} height="h-1.5" />

                      <p className="mt-2 font-display text-base font-extrabold leading-relaxed text-main" dir="auto">
                        {current.prompt}
                      </p>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {current.options.map((option, optionIndex) => {
                          const isCorrect = optionIndex === current.answer
                          const isPicked = picked === optionIndex
                          const payload = picked !== null
                          return (
                            <button
                              key={`${current.id}-${optionIndex}`}
                              data-testid="lesson-option"
                              disabled={payload}
                              onClick={() => {
                                setPicked(optionIndex)
                                setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))
                              }}
                              className={cn(
                                'flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 text-start text-[12px] font-bold transition',
                                !payload && 'border-line bg-card-2 hover:border-aurora-400/40 hover:bg-white/5',
                                payload && isCorrect && 'border-aurora-400/60 bg-aurora-400/10 text-main',
                                payload && isPicked && !isCorrect && 'border-red-400/50 bg-red-400/10 text-main',
                                payload && !isCorrect && !isPicked && 'border-line bg-card-2 text-muted opacity-60',
                              )}
                            >
                              <span dir="auto">{option}</span>
                              {payload && isCorrect && <Check className="h-4 w-4 shrink-0 text-aurora-300" />}
                              {payload && isPicked && !isCorrect && <X className="h-4 w-4 shrink-0 text-red-300" />}
                            </button>
                          )
                        })}
                      </div>

                      {picked !== null && (
                        <div
                          className={cn(
                            'rounded-2xl border p-3',
                            picked === current.answer ? 'border-aurora-400/30 bg-aurora-400/10' : 'border-sun/30 bg-sun/10',
                          )}
                        >
                          <p className="text-[11px] font-extrabold text-main">
                            {picked === current.answer ? tr('Correct') : tr('Not quite')}
                          </p>
                          <p className="mt-1 text-[10.5px] leading-relaxed text-muted" dir="auto">
                            {current.explanation || tr('The answer is {answer}.', { answer: current.options[current.answer] })}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          data-testid="lesson-next"
                          disabled={picked === null}
                          onClick={() => {
                            if (index + 1 < questions.length) {
                              setIndex(index + 1)
                              setPicked(null)
                              return
                            }
                            finish()
                          }}
                        >
                          {index + 1 === questions.length ? tr('See my result') : tr('Next question')}
                          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 'done' && (
                <div className="space-y-4 text-center" data-testid="lesson-step">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-aurora-400 to-violet-neon text-3xl">
                    {passed ? '🏆' : '💪'}
                  </div>
                  <div>
                    <p className="font-display text-xl font-extrabold text-main">
                      {passed ? tr('Unit mastered!') : tr('Nearly there')}
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-muted">
                      {passed
                        ? tr('You finished all four steps and answered {score} of {total}. The unit is now marked complete and 50 XP is yours.', {
                            score: num(score),
                            total: num(questions.length),
                          })
                        : tr('You answered {score} of {total}. Get {need} more right and the unit is marked complete.', {
                            score: num(score),
                            total: num(questions.length),
                            need: num(Math.ceil(questions.length * MIN_SCORE) - score),
                          })}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: BookOpen, label: tr('Read'), value: num(pages.length) },
                      { icon: Sparkles, label: tr('Key terms'), value: num(terms.length) },
                      { icon: Target, label: tr('Check'), value: questions.length ? num(pct(score, questions.length)) + '%' : '—' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-line bg-card-2 px-2 py-2">
                        <item.icon className="mx-auto h-3.5 w-3.5 text-aurora-300" />
                        <p className="mt-1 font-display text-sm font-extrabold text-main">{item.value}</p>
                        <p className="text-[9px] font-bold text-muted">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">
                    {!passed && (
                      <Button size="sm" onClick={restartCheck}>
                        <RotateCcw className="h-3.5 w-3.5" /> {tr('Try the check again')}
                      </Button>
                    )}
                    {nextUnit ? (
                      <Button size="sm" variant={passed ? 'primary' : 'secondary'} onClick={() => navigate(`/lesson/${book.id}/${nextUnit.id}`)}>
                        <GraduationCap className="h-3.5 w-3.5" /> {tr('Next unit')}
                      </Button>
                    ) : (
                      <Link to="/certificate">
                        <Button size="sm" variant={passed ? 'primary' : 'secondary'}>
                          <Award className="h-3.5 w-3.5" /> {tr('Open my certificate')}
                        </Button>
                      </Link>
                    )}
                    <Link to="/study">
                      <Button size="sm" variant="ghost">
                        <Layers className="h-3.5 w-3.5" /> {tr('Back to Study Hub')}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {step !== 'done' && (
        <p className="text-center text-[9.5px] text-muted-2">
          <Trophy className="mx-auto mb-1 h-3 w-3" />
          {tr('Finish all four steps to mark the unit complete.')}
        </p>
      )}
    </div>
  )
}

