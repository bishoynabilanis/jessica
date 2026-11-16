import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clock, FilePlus2, Trash2, Upload } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, ProgressBar } from '@/components/ui/Card'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { celebrate } from '@/lib/celebrate'
import { addAttempt } from '@/lib/bankHistory'
import { BANK_SUBJECTS, type BankSubject } from '@/lib/questionBank'
import { parseSchoolPaper, readSchoolExams, removeSchoolExam, saveSchoolExam, type SchoolExam } from '@/lib/schoolExam'
import { dateLocale, num, tr } from '@/i18n'
import { cn } from '@/lib/utils'

type Phase = 'list' | 'build' | 'take' | 'result'

const SAMPLE = `ما عاصمة مصر؟ | القاهرة | الإسكندرية | أسوان | طنطا | 1
النيل بيصب في أي بحر؟ | الأحمر | المتوسط | الأسود | العربي | 2
قناة السويس بتربط بين؟ | المتوسط والأحمر | الأحمر والعربي | المتوسط والأسود | الأسود وقزوين | 1`

export function SchoolExamPage() {
  const recordSkill = useApp((s) => s.recordSkill)
  const addMistake = useApp((s) => s.addMistake)
  const addXP = useApp((s) => s.addXP)
  const pushToast = useUI((s) => s.pushToast)

  const [phase, setPhase] = useState<Phase>('list')
  const [exams, setExams] = useState<SchoolExam[]>(() => readSchoolExams())
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState<BankSubject>('Social Studies')
  const [raw, setRaw] = useState('')
  const [exam, setExam] = useState<SchoolExam | null>(null)

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [endsAt, setEndsAt] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [score, setScore] = useState(0)

  const parsed = useMemo(() => parseSchoolPaper(raw, subject), [raw, subject])
  const current = exam?.questions[index]
  const remaining = endsAt ? Math.max(0, Math.round((endsAt - now) / 1000)) : 0

  useEffect(() => {
    if (phase !== 'take' || !endsAt) return
    const id = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [phase, endsAt])

  const start = (next: SchoolExam) => {
    setExam(next)
    setIndex(0)
    setAnswers({})
    setScore(0)
    setEndsAt(Date.now() + next.minutes * 60 * 1000)
    setNow(Date.now())
    setPhase('take')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const finish = (timedOut = false) => {
    if (!exam) return
    let correct = 0
    for (const question of exam.questions) {
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
          explanation: question.explanation || tr('From a school paper. Review the lesson it came from.'),
          subject: question.subject,
          topic: question.skill,
        })
      }
    }
    setScore(correct)
    addXP(10 + correct * 2)
    addAttempt({ subject: exam.subject, mode: 'school', score: correct, total: exam.questions.length, seconds: 0 })
    if (correct >= Math.ceil(exam.questions.length * 0.6)) celebrate()
    if (timedOut) pushToast({ title: tr('Time is up — the paper is marked.'), type: 'info' })
    setEndsAt(0)
    setPhase('result')
  }

  useEffect(() => {
    if (phase === 'take' && endsAt && now >= endsAt) finish(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, endsAt, now])

  const save = () => {
    if (!parsed.questions.length) return
    const created = saveSchoolExam({
      title: title || subject,
      subject,
      minutes: Math.max(5, parsed.questions.length + 5),
      questions: parsed.questions,
    })
    setExams(readSchoolExams())
    setTitle('')
    setRaw('')
    pushToast({ title: tr('Paper saved — take it now or later.'), type: 'success' })
    start(created)
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <PageHeader
        eyebrow={tr('School exam')}
        title={tr('Turn the paper from school into a real exam')}
        subtitle={tr('Paste the questions once, and Jessica runs them as a timed exam — with marking, a mistakes notebook and a score you can compare.')}
        icon={<FilePlus2 className="h-5 w-5" />}
      />

      {phase === 'list' && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setPhase('build')} data-testid="school-new">
              <FilePlus2 className="h-4 w-4" /> {tr('Add a school paper')}
            </Button>
            <Link to="/bank">
              <Button variant="secondary">
                <ArrowRight className="h-4 w-4 rtl:rotate-180" /> {tr('Open the question bank')}
              </Button>
            </Link>
          </div>

          {exams.length === 0 ? (
            <Card className="p-5">
              <EmptyState
                icon={<Upload className="h-6 w-6" />}
                title={tr('No school papers yet')}
                description={tr('Paste the questions once; the app keeps the paper so you can re-run it before the exam.')}
              />
            </Card>
          ) : (
            <Card className="p-4">
              <p className="label text-aurora-300">{tr('Saved papers')}</p>
              <div className="mt-2 space-y-2">
                {exams.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-card-2 px-3 py-2.5" data-testid="school-row">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-extrabold text-main">{item.title}</span>
                      <span className="block text-[10px] text-muted-2">
                        {item.code} · {tr(item.subject)} · {tr('{n} questions', { n: num(item.questions.length) })} ·{' '}
                        {new Date(item.createdAt).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' })}
                      </span>
                    </span>
                    <Button size="sm" onClick={() => start(item)}>
                      <Clock className="h-3.5 w-3.5" /> {tr('Start')}
                    </Button>
                    <button
                      onClick={() => {
                        removeSchoolExam(item.id)
                        setExams(readSchoolExams())
                      }}
                      aria-label={tr('Delete')}
                      className="rounded-lg border border-line p-1.5 text-muted-2 transition hover:border-red-400/40 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-4">
            <p className="text-[10px] font-bold text-muted">{tr('How to write a line')}</p>
            <p className="mt-1 rounded-xl bg-black/30 p-2 text-[10px] leading-relaxed text-aurora-200" dir="ltr">
              ما عاصمة مصر؟ | القاهرة | الإسكندرية | أسوان | طنطا | 1
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-2">
              {tr('Question, four options, then the number of the correct one — one paper line per question. Arabic digits work too.')}
            </p>
          </Card>
        </>
      )}

      {phase === 'build' && (
        <Card className="p-4" data-testid="school-build">
          <p className="label text-aurora-300">{tr('Add a school paper')}</p>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={tr('Paper name, e.g. October exam')}
              aria-label={tr('Paper name')}
              className="rounded-xl border border-line bg-white/5 px-3 py-2 text-[12px] font-bold text-main outline-none focus:border-aurora-400/50"
            />
            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value as BankSubject)}
              aria-label={tr('Subject')}
              className="rounded-xl border border-line bg-white/5 px-3 py-2 text-[12px] font-bold text-main outline-none focus:border-aurora-400/50"
            >
              {BANK_SUBJECTS.map((name) => (
                <option key={name} value={name} className="bg-ink-900">
                  {tr(name)}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            rows={8}
            placeholder={`${tr('Paste the questions here, one line each:')}\nما عاصمة مصر؟ | القاهرة | الإسكندرية | أسوان | طنطا | 1`}
            aria-label={tr('Questions')}
            data-testid="school-text"
            className="mt-2 w-full rounded-xl border border-line bg-white/5 px-3 py-2 text-[11px] font-bold leading-relaxed text-main outline-none focus:border-aurora-400/50"
          />

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setRaw(SAMPLE)}>
              {tr('Fill an example')}
            </Button>
            <span className="text-[10px] font-bold text-muted">
              {tr('{n} questions ready', { n: num(parsed.questions.length) })}
            </span>
            {parsed.errors.length > 0 && (
              <span className="text-[10px] font-bold text-red-300">
                {tr('Check these lines: {lines}', { lines: parsed.errors.join(', ') })}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={save} disabled={!parsed.questions.length} data-testid="school-save">
              <Check className="h-4 w-4" /> {tr('Save and start')}
            </Button>
            <Button variant="ghost" onClick={() => setPhase('list')}>
              {tr('Cancel')}
            </Button>
          </div>
        </Card>
      )}

      {phase === 'take' && exam && current && (
        <Card className="p-4" data-testid="school-take">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-muted-2">
              {tr('Question {n} of {m}', { n: num(index + 1), m: num(exam.questions.length) })}
            </span>
            <span className="chip border-line bg-white/5 text-[11px] font-extrabold tabular-nums text-aurora-200">
              <Clock className="me-1 inline h-3 w-3" />
              {num(String(Math.floor(remaining / 60)).padStart(2, '0'))}:{num(String(remaining % 60).padStart(2, '0'))}
            </span>
          </div>
          <ProgressBar value={index} max={exam.questions.length} height="h-1.5" className="mt-2" />

          <p className="mt-4 font-display text-lg font-extrabold leading-relaxed text-main" dir="auto">
            {current.prompt}
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {current.options.map((option, optionIndex) => (
              <button
                key={`${current.id}-${optionIndex}`}
                data-testid="school-option"
                onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))}
                className={cn(
                  'rounded-2xl border px-4 py-3 text-start text-[13px] font-extrabold transition',
                  answers[current.id] === optionIndex
                    ? 'border-violet-neon/70 bg-violet-neon/15 text-main'
                    : 'border-line bg-card-2 text-main hover:border-aurora-400/40',
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <Button size="sm" variant="ghost" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
              {tr('Previous')}
            </Button>
            <div className="flex flex-wrap gap-2">
              {index + 1 < exam.questions.length ? (
                <Button size="md" onClick={() => setIndex(index + 1)} data-testid="school-next">
                  {tr('Next question')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              ) : (
                <Button size="md" onClick={() => finish()} data-testid="school-submit">
                  <Check className="h-4 w-4" /> {tr('Hand in the paper')}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {phase === 'result' && exam && (
        <div className="space-y-4">
          <Card className="p-5 text-center" data-testid="school-result">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-aurora-400 to-violet-neon text-3xl">
              {score === exam.questions.length ? '🏆' : score >= exam.questions.length * 0.6 ? '🎯' : '💪'}
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold text-main">
              {num(score)} <span className="text-base text-muted-2">/ {num(exam.questions.length)}</span>
            </p>
            <p className="text-[11px] text-muted">{exam.title}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => start(exam)}>
                {tr('Try it again')}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setPhase('list')} data-testid="school-back">
                {tr('All papers')}
              </Button>
              <Link to="/mistakes">
                <Button size="sm" variant="ghost">
                  {tr('My mistakes')}
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-4">
            <p className="label text-aurora-300">{tr('Question by question')}</p>
            <div className="mt-2 space-y-2">
              {exam.questions.map((question, questionIndex) => {
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
                    <p className="text-[11px] font-extrabold leading-relaxed text-main" dir="auto">
                      {num(questionIndex + 1)}. {question.prompt}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-aurora-200" dir="auto">
                      {tr('Answer: {answer}', { answer: question.options[question.answer] })}
                    </p>
                    {chosen !== undefined && !ok && (
                      <p className="text-[10px] text-red-200" dir="auto">
                        {tr('You chose: {answer}', { answer: question.options[chosen] })}
                      </p>
                    )}
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
