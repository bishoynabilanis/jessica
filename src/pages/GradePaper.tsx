import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, Layers, Printer, RotateCcw, Share2, X } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, ProgressBar } from '@/components/ui/Card'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { celebrate } from '@/lib/celebrate'
import { addAttempt, previousAttempt } from '@/lib/bankHistory'
import { readPrintedPapers, type PrintedPaper } from '@/lib/printedPapers'
import { SolutionSteps } from '@/components/tools/SolutionSteps'
import { dateLocale, num, tr } from '@/i18n'
import { cn } from '@/lib/utils'

type Phase = 'pick' | 'mark' | 'result'

export function GradePaper() {
  const recordSkill = useApp((s) => s.recordSkill)
  const addMistake = useApp((s) => s.addMistake)
  const addXP = useApp((s) => s.addXP)
  const language = useApp((s) => s.settings.language)
  const pushToast = useUI((s) => s.pushToast)

  const [papers] = useState<PrintedPaper[]>(() => readPrintedPapers())
  const [paper, setPaper] = useState<PrintedPaper | null>(null)
  const [phase, setPhase] = useState<Phase>('pick')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [delta, setDelta] = useState<number | null>(null)
  const [params, setParams] = useSearchParams()

  useEffect(() => {
    const code = params.get('code')
    if (!code) return
    const found = readPrintedPapers().find((item) => item.code === code)
    if (found) {
      setPaper(found)
      setAnswers({})
      setDelta(null)
      setPhase('mark')
    }
    params.delete('code')
    setParams(params, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const letters = language === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D']
  const answered = Object.keys(answers).length
  const score = useMemo(
    () => (paper ? paper.questions.filter((question) => answers[question.id] === question.answer).length : 0),
    [paper, answers],
  )

  const start = (next: PrintedPaper) => {
    setPaper(next)
    setAnswers({})
    setDelta(null)
    setPhase('mark')
  }

  const mark = () => {
    if (!paper) return
    let correct = 0
    for (const question of paper.questions) {
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
    addXP(5 + correct)
    const before = previousAttempt(paper.subject, 'paper')
    setDelta(before ? correct - before.score : null)
    addAttempt({ subject: paper.subject, mode: 'paper', score: correct, total: paper.questions.length, seconds: 0 })
    if (correct >= Math.ceil(paper.questions.length * 0.6)) celebrate()
    pushToast({ title: tr('Sheet marked: {n} out of {m}', { n: num(correct), m: num(paper.questions.length) }), type: 'success' })
    setPhase('result')
  }

  const share = () => {
    if (!paper) return
    const text = `${tr('My child scored {n} out of {m} on a Jessica sheet.', { n: num(score), m: num(paper.questions.length) })} — is.gd/jessicaapp`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <PageHeader
        eyebrow={tr('Grade a paper')}
        title={tr('Tap the answers your child wrote')}
        subtitle={tr('Every sheet you print is saved here with a code. Tap what the child wrote on paper and the app marks it, records the skills and files the mistakes.')}
        icon={<Check className="h-5 w-5" />}
      />

      {phase === 'pick' && (
        <>
          {papers.length === 0 ? (
            <Card className="p-5">
              <EmptyState
                icon={<Printer className="h-6 w-6" />}
                title={tr('No printed sheets yet')}
                description={tr('Print a sheet from the question bank first, then come back with the child’s answers.')}
                action={
                  <Link to="/bank">
                    <Button size="sm">{tr('Open the question bank')}</Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <Card className="p-4">
              <p className="label text-aurora-300">{tr('Printed sheets')}</p>
              <div className="mt-2 space-y-2">
                {papers.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => start(item)}
                    data-testid="grade-paper-row"
                    className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card-2 px-3 py-2.5 text-start transition hover:border-aurora-400/40"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-[10px] font-extrabold text-aurora-200">
                      {item.code.slice(-3)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-extrabold text-main">{tr(item.subject)}</span>
                      <span className="block text-[10px] text-muted-2">
                        {tr(item.code)} · {new Date(item.at).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' })} ·{' '}
                        {tr('{n} questions', { n: num(item.questions.length) })}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-2 rtl:rotate-180" />
                  </button>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {phase === 'mark' && paper && (
        <Card className="p-4" data-testid="grade-mark">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold text-aurora-300">{tr(paper.code)}</p>
              <p className="font-display text-sm font-extrabold text-main">{tr(paper.subject)}</p>
            </div>
            <span className="text-[10px] font-bold text-muted">
              {tr('Answered {n} of {m}', { n: num(answered), m: num(paper.questions.length) })}
            </span>
          </div>
          <ProgressBar value={answered} max={paper.questions.length} height="h-1.5" className="mt-2" />

          <div className="mt-3 max-h-[52vh] space-y-2 overflow-y-auto pe-1">
            {paper.questions.map((question, index) => (
              <div key={question.id} className="rounded-2xl border border-line bg-card-2 p-2.5">
                <p className="text-[11px] font-bold leading-relaxed text-main" dir="auto">
                  {num(index + 1)}. {question.prompt}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={`${question.id}-${optionIndex}`}
                      onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))}
                      data-testid="grade-choice"
                      aria-label={`${tr('Question')} ${index + 1} ${letters[optionIndex]}`}
                      className={cn(
                        'min-w-9 rounded-xl border px-2.5 py-1 text-[11px] font-extrabold transition',
                        answers[question.id] === optionIndex
                          ? 'border-aurora-400/70 bg-aurora-400/15 text-main'
                          : 'border-line bg-white/5 text-muted hover:border-aurora-400/40',
                      )}
                    >
                      {letters[optionIndex]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap justify-between gap-2">
            <Button size="sm" variant="ghost" onClick={() => setPhase('pick')}>
              <X className="h-3.5 w-3.5" /> {tr('Cancel')}
            </Button>
            <Button size="md" onClick={mark} disabled={answered === 0} data-testid="grade-submit">
              <Check className="h-4 w-4" /> {tr('Mark the paper')}
            </Button>
          </div>
        </Card>
      )}

      {phase === 'result' && paper && (
        <div className="space-y-4">
          <Card className="p-5 text-center" data-testid="grade-result">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-aurora-400 to-violet-neon text-3xl">
              {score === paper.questions.length ? '🏆' : score >= paper.questions.length * 0.6 ? '🎯' : '💪'}
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold text-main">
              {num(score)} <span className="text-base text-muted-2">/ {num(paper.questions.length)}</span>
            </p>
            <p className="text-[11px] text-muted">{tr('score')}</p>
            {delta !== null && (
              <p className="mx-auto mt-2 w-fit rounded-full border border-line bg-white/5 px-3 py-1 text-[10px] font-bold text-muted">
                {delta > 0
                  ? tr('{n} better than the last paper', { n: num(delta) })
                  : delta < 0
                    ? tr('{n} below the last paper', { n: num(Math.abs(delta)) })
                    : tr('Same as the last paper')}
              </p>
            )}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={share}>
                <Share2 className="h-3.5 w-3.5" /> {tr('Send the result')}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setPhase('pick')} data-testid="grade-again">
                <RotateCcw className="h-3.5 w-3.5" /> {tr('Grade another sheet')}
              </Button>
              <Link to="/bank">
                <Button size="sm" variant="ghost">
                  <Layers className="h-3.5 w-3.5" /> {tr('Print a new sheet')}
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-[10px] text-muted-2">{tr('Every miss is already in the mistakes notebook.')}</p>
          </Card>

          <Card className="p-4">
            <p className="label text-aurora-300">{tr('Question by question')}</p>
            <div className="mt-2 space-y-2">
              {paper.questions.map((question, index) => {
                const chosen = answers[question.id]
                const ok = chosen === question.answer
                return (
                  <div
                    key={question.id}
                    className={cn(
                      'rounded-2xl border p-3',
                      chosen === undefined ? 'border-line bg-card-2/60' : ok ? 'border-aurora-400/40 bg-aurora-400/5' : 'border-red-400/40 bg-red-400/5',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-extrabold leading-relaxed text-main" dir="auto">
                        {num(index + 1)}. {question.prompt}
                      </p>
                      {chosen === undefined ? (
                        <span className="shrink-0 text-[9px] font-bold text-muted-2">{tr('left blank')}</span>
                      ) : ok ? (
                        <Check className="h-4 w-4 shrink-0 text-aurora-300" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-red-300" />
                      )}
                    </div>
                    <p className="mt-1 text-[10px] font-bold text-aurora-200" dir="auto">
                      {tr('Answer: {answer}', { answer: question.options[question.answer] })}
                    </p>
                    {chosen !== undefined && !ok && (
                      <p className="text-[10px] text-red-200" dir="auto">
                        {tr('The child wrote: {answer}', { answer: question.options[chosen] })}
                      </p>
                    )}
                    <SolutionSteps question={question} />
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
