import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Check, ChevronLeft, Clock, Flame, MoonStar, Plus } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { getQuizzes, type StoredQuiz } from '@/lib/db'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { QuizGame } from '@/components/tools/QuizGame'
import { dateLocale, tr } from '@/i18n'
import { cn, dayKeyOffset, todayKey } from '@/lib/utils'

const SUBJECTS = [
  'English',
  'Arabic',
  'Mathematics',
  'Science',
  'Social Studies',
  'French',
  'German',
  'Religion',
] as const

function daysUntil(date: string) {
  const target = new Date(`${date}T00:00:00`).getTime()
  const today = new Date(`${todayKey()}T00:00:00`).getTime()
  return Math.round((target - today) / 86400000)
}

export function ExamCalendar() {
  const examDates = useApp((s) => s.examDates)
  const setExamDate = useApp((s) => s.setExamDate)
  const addPlannerTask = useApp((s) => s.addPlannerTask)
  const skillStats = useApp((s) => s.skillStats)
  const customBooks = useApp((s) => s.customBooks)
  const completedTopics = useApp((s) => s.completedTopics)
  const pushToast = useUI((s) => s.pushToast)

  const [banks, setBanks] = useState<StoredQuiz[]>([])
  const [night, setNight] = useState<string | null>(null)
  const [drill, setDrill] = useState<{ subject: string; questions: StoredQuiz['questions'] } | null>(null)

  useEffect(() => {
    getQuizzes().then(setBanks).catch(() => undefined)
  }, [])

  const exams = useMemo(
    () =>
      Object.entries(examDates)
        .map(([subject, date]) => ({ subject, date, days: daysUntil(date) }))
        .sort((a, b) => a.days - b.days),
    [examDates],
  )

  const nearest = exams.find((exam) => exam.days >= 0)

  const weakest = useMemo(() => {
    const list = Object.entries(skillStats)
      .map(([key, value]) => {
        const [subject, topic] = key.split('|')
        return { subject, topic, accuracy: value.total ? value.correct / value.total : 1, total: value.total }
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => a.accuracy - b.accuracy)
    return list[0]
  }, [skillStats])

  const week = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = dayKeyOffset(index)
      const label = new Date(`${date}T00:00:00`).toLocaleDateString(dateLocale(), {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      })
      let title = tr('Review due flashcards')
      let minutes = 10
      let subject = nearest?.subject || 'General'
      if (index === 0) {
        title = nearest ? tr('Revise {subject} for the exam', { subject: nearest.subject }) : tr('Read the next textbook unit')
        minutes = 20
      } else if (index === 1) {
        title = weakest ? tr('Practise {topic}', { topic: weakest.topic }) : tr('Quick 5-question quiz')
        minutes = 15
        subject = weakest?.subject || subject
      } else if (index === 2) {
        title = tr('Read the next textbook unit')
        minutes = 20
      } else if (index === 3) {
        title = tr('Drill your saved mistakes')
        minutes = 15
        subject = 'Review'
      } else if (index === 4) {
        title = nearest ? tr('Mock exam: {subject}', { subject: nearest.subject }) : tr('Mock exam practice')
        minutes = 20
        subject = nearest?.subject || 'General'
      } else if (index === 5) {
        title = tr('Summarise one unit')
        minutes = 15
      }
      return { date, label, title, minutes, subject }
    })
  }, [nearest, weakest])

  const addWeek = () => {
    week.forEach((item) => {
      addPlannerTask({
        title: item.title,
        detail: tr('Auto-planned from your exams'),
        day: item.date,
        minutes: item.minutes,
        subject: item.subject,
        xp: 20,
      })
    })
    pushToast({ title: tr('Week added to your planner'), description: tr('Open Study → Planner to follow it.'), type: 'success' })
  }

  const nightQuestions = useMemo(() => {
    if (!night) return []
    return banks
      .filter((bank) => bank.subject.toLowerCase() === night.toLowerCase())
      .flatMap((bank) => bank.questions)
      .slice(0, 10)
  }, [night, banks])

  if (drill) {
    return (
      <div className="space-y-4">
        <PageHeader back eyebrow={tr('Exam night')} title={tr('{subject} in 30 minutes', { subject: tr(drill.subject) })} icon={<MoonStar className="h-5 w-5" />} />
        <QuizGame
          questions={drill.questions}
          subject={drill.subject}
          title={tr('Exam-night drill')}
          onFinish={() => undefined}
          onRetry={() => setDrill(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Exam calendar')}
        title={tr('Plan around your exams')}
        subtitle={tr('Add your exam dates and Jessica builds a week that adapts when a day slips.')}
        icon={<CalendarDays className="h-5 w-5" />}
        actions={
          <Button onClick={addWeek}>
            <Plus className="h-4 w-4" /> {tr('Add week to planner')}
          </Button>
        }
      />

      <Card className="p-4 sm:p-5">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-extrabold text-main">
          <CalendarDays className="h-4 w-4 text-aurora-300" /> {tr('Your exam dates')}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SUBJECTS.map((subject) => (
            <label key={subject} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card-2 px-2.5 py-2">
              <span className="text-[11px] font-bold text-main">{tr(subject)}</span>
              <input
                type="date"
                value={examDates[subject] || ''}
                onChange={(event) => setExamDate(subject, event.target.value)}
                className="rounded-lg border border-line bg-app px-2 py-1 text-[10px] font-semibold text-main"
              />
            </label>
          ))}
        </div>
      </Card>

      {exams.length > 0 && (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.subject} className={cn('p-4', exam.days <= 3 && exam.days >= 0 && 'border-sun/30 bg-sun/5')}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-extrabold text-main">{tr(exam.subject)}</p>
                <span
                  className={cn(
                    'chip',
                    exam.days < 0
                      ? 'border-line text-muted-2'
                      : exam.days <= 3
                        ? 'border-coral/30 bg-coral/10 text-coral'
                        : 'border-aurora-400/25 bg-aurora-400/10 text-aurora-200',
                  )}
                >
                  {exam.days < 0
                    ? tr('Done')
                    : exam.days === 0
                      ? tr('Today')
                      : tr('{n} days left', { n: exam.days })}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-muted">
                {new Date(`${exam.date}T00:00:00`).toLocaleDateString(dateLocale(), {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3 w-full"
                onClick={() => {
                  setNight(exam.subject)
                }}
                disabled={nightQuestions.length === 0}
              >
                <MoonStar className="h-3.5 w-3.5" /> {tr('Exam night')}
              </Button>
            </Card>
          ))}
        </div>
      )}

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-base font-extrabold text-main">{tr('This week')}</h2>
          <span className="text-[10px] text-muted">{tr('Auto-adjusts from your exams and weakest skills')}</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {week.map((day, index) => (
            <Card key={day.date} className={cn('p-3.5', index === 0 && 'border-aurora-400/30 bg-aurora-400/5')}>
              <p className="text-[9px] font-bold uppercase tracking-wide text-muted-2">{day.label}</p>
              <p className="mt-1 text-[11px] font-extrabold text-main">{day.title}</p>
              <p className="mt-1 flex items-center gap-1 text-[9px] text-muted">
                <Clock className="h-3 w-3" /> {day.minutes} {tr('min')} · {tr(day.subject)}
              </p>
              <Link
                to="/study?tab=planner"
                className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold text-aurora-300 hover:underline"
              >
                {tr('Open planner')} <ChevronLeft className="h-3 w-3 rtl-flip" />
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {completedTopics.length === 0 && customBooks.length > 0 && (
        <Card className="flex items-center gap-2 border-line bg-card-2 p-3 text-[10px] text-muted">
          <Flame className="h-3.5 w-3.5 text-sun" /> {tr('Finish one unit to make the weekly plan even smarter.')}
        </Card>
      )}

      <Modal
        open={Boolean(night)}
        onClose={() => setNight(null)}
        title={tr('Exam night · {subject}', { subject: night ? tr(night) : '' })}
        subtitle={tr('A focused 30-minute plan: summary, quick drill, then due cards.')}
        icon={<MoonStar className="h-4 w-4" />}
        size="md"
      >
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-card-2 p-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-aurora-400/10 text-aurora-300">
              <Clock className="h-4 w-4" />
            </span>
            <div className="text-[10px] leading-relaxed text-muted">
              <p className="font-bold text-main">{tr('30 minutes')}</p>
              <p>{tr('10 min summary · 15 min drill · 5 min due cards. Stop after that — sleep beats cramming.')}</p>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={nightQuestions.length === 0}
            onClick={() => {
              if (!night) return
              setDrill({ subject: night, questions: nightQuestions })
              setNight(null)
            }}
          >
            <MoonStar className="h-4 w-4" /> {tr('Start 10-question drill ({n} available)', { n: nightQuestions.length })}
          </Button>
          {nightQuestions.length === 0 && (
            <p className="text-[10px] text-muted">
              {tr('No saved bank for this subject yet. Generate one quiz from a unit first, then come back.')}
            </p>
          )}
          <div className="flex gap-2">
            <Link to="/study" className="flex-1">
              <Button variant="secondary" className="w-full" size="sm">
                {tr('Open summaries')}
              </Button>
            </Link>
            <Link to="/study?tab=review" className="flex-1">
              <Button variant="ghost" className="w-full" size="sm">
                {tr('Review due cards')}
              </Button>
            </Link>
          </div>
          <p className="flex items-center gap-1 text-[9px] text-muted-2">
            <Check className="h-3 w-3" /> {tr('Your answers update skills and the mistake notebook automatically.')}
          </p>
        </div>
      </Modal>
    </div>
  )
}
