import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Award, CalendarCheck, Flame, Share2, Sparkles, Target } from 'lucide-react'
import { useApp, levelInfo } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { dueCards } from '@/lib/db'
import { buildCourse, lessonLink } from '@/lib/course'
import { dayKeyOffset, pct } from '@/lib/utils'
import { shareStory } from '@/lib/shareCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { dateLocale, num, tr } from '@/i18n'

interface Day {
  date: string
  xp: number
  seconds: number
  label: string
  name: string
}

function windowDays(dailyLog: Record<string, { xp: number; seconds: number }>, from: number, to: number): Day[] {
  const days: Day[] = []
  for (let offset = from; offset <= to; offset += 1) {
    const date = dayKeyOffset(offset)
    days.push({
      date,
      xp: dailyLog[date]?.xp || 0,
      seconds: dailyLog[date]?.seconds || 0,
      label: new Date(date).toLocaleDateString(dateLocale(), { weekday: 'narrow' }),
      name: new Date(date).toLocaleDateString(dateLocale(), { weekday: 'long' }),
    })
  }
  return days
}

export function WeeklyReview() {
  const state = useApp()
  const { dailyLog, topicLog, skillStats, customBooks, bookProgress, completedTopics, unitMastery, lessonProgress } = state
  const pushToast = useUI((s) => s.pushToast)
  const [due, setDue] = useState(0)

  useEffect(() => {
    dueCards()
      .then((cards) => setDue(cards.length))
      .catch(() => undefined)
  }, [])

  const week = useMemo(() => windowDays(dailyLog, -6, 0), [dailyLog])
  const previous = useMemo(() => windowDays(dailyLog, -13, -7), [dailyLog])

  const minutes = Math.round(week.reduce((sum, day) => sum + day.seconds, 0) / 60)
  const lastMinutes = Math.round(previous.reduce((sum, day) => sum + day.seconds, 0) / 60)
  const xp = week.reduce((sum, day) => sum + day.xp, 0)
  const activeDays = week.filter((day) => day.seconds > 0 || day.xp > 0).length
  const bestDay = [...week].sort((a, b) => b.xp - a.xp)[0]
  const delta = lastMinutes >= 20 ? Math.min(300, Math.round(((minutes - lastMinutes) / lastMinutes) * 100)) : null

  const start = week[0]?.date || ''
  const lessonsThisWeek = topicLog.filter((entry) => entry.date >= start).length

  const accuracy = useMemo(() => {
    const values = Object.values(skillStats)
    const correct = values.reduce((sum, item) => sum + item.correct, 0)
    const total = values.reduce((sum, item) => sum + item.total, 0)
    return total ? pct(correct, total) : 0
  }, [skillStats])

  const weakest = useMemo(
    () =>
      Object.entries(skillStats)
        .map(([key, value]) => ({ key, accuracy: value.total ? value.correct / value.total : 0, total: value.total }))
        .filter((item) => item.total >= 3)
        .sort((a, b) => a.accuracy - b.accuracy)[0],
    [skillStats],
  )

  const activeBook = useMemo(() => {
    const sorted = [...customBooks].sort(
      (a, b) => (bookProgress[b.id]?.updatedAt || 0) - (bookProgress[a.id]?.updatedAt || 0),
    )
    return sorted[0] || customBooks[0]
  }, [customBooks, bookProgress])

  const course = useMemo(
    () => (activeBook ? buildCourse(activeBook, { unitMastery, completedTopics, lessonProgress }) : undefined),
    [activeBook, unitMastery, completedTopics, lessonProgress],
  )

  const maxXp = Math.max(30, ...week.map((day) => day.xp))
  const { level } = levelInfo(state.xp)

  const share = async () => {
    const result = await shareStory({
      title: tr('My week with Jessica'),
      subtitle: tr('{n} minutes · {lessons} lessons · level {level}', {
        n: minutes,
        lessons: lessonsThisWeek,
        level,
      }),
      emoji: minutes >= 60 ? '🔥' : '🌱',
      stats: [
        { label: tr('Minutes'), value: `${minutes}` },
        { label: tr('Active days'), value: `${activeDays}/7` },
        { label: tr('Lessons'), value: `${lessonsThisWeek}` },
      ],
      footer: tr('Small steps, every day.'),
    })
    if (result === 'downloaded') pushToast({ title: tr('Card saved as an image'), type: 'success' })
  }

  return (
    <Card className="p-4 sm:p-5" data-testid="weekly-review">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="label mb-1 text-violet-glow">{tr('Weekly review')}</p>
          <h2 className="font-display text-lg font-extrabold text-main">{tr('Your last 7 days')}</h2>
        </div>
        <Button size="sm" variant="ghost" onClick={share} aria-label={tr('Share my week')}>
          <Share2 className="h-3.5 w-3.5" /> {tr('Share my week')}
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { icon: Flame, value: num(minutes), label: tr('minutes studied'), accent: 'text-coral' },
          { icon: CalendarCheck, value: num(activeDays), label: tr('active days'), accent: 'text-aurora-300' },
          { icon: Target, value: `${num(accuracy)}%`, label: tr('answer accuracy'), accent: 'text-violet-glow' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-line bg-card-2 px-2.5 py-2">
            <item.icon className={cn('h-3.5 w-3.5', item.accent)} />
            <p className="mt-1 font-display text-lg font-extrabold text-main">{item.value}</p>
            <p className="text-[9px] font-semibold text-muted">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-end gap-1.5">
        {week.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-16 w-full items-end justify-center">
              <div
                className={cn(
                  'w-full max-w-[26px] rounded-t-md',
                  day.xp > 0 ? 'bg-gradient-to-t from-violet-neon/40 to-aurora-400' : 'bg-white/5',
                )}
                style={{ height: `${Math.max(6, (day.xp / maxXp) * 100)}%` }}
                title={`${day.xp} XP`}
              />
            </div>
            <span className="text-[8px] font-bold text-muted-2">{day.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-2 text-[10px] text-muted">
        {minutes === 0
          ? tr('Nothing yet this week — one mission today is enough to start.')
          : delta === null
            ? tr('{xp} XP this week · last week {mins} min. Best day: {day}.', {
                xp: num(xp),
                mins: num(lastMinutes),
                day: bestDay?.name || '—',
              })
            : tr('{xp} XP this week · {delta} vs last week. Best day: {day}.', {
                xp: num(xp),
                delta: delta >= 0 ? `+${num(delta)}%` : `−${num(Math.abs(delta))}%`,
                day: bestDay?.name || '—',
              })}
      </p>

      <div className="mt-4 border-t border-line pt-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-main">{tr('Next week at a glance')}</p>
          <span className="text-[9px] font-bold text-muted-2">{tr('3 small moves')}</span>
        </div>
        <div className="mt-2 space-y-1.5">
          {course?.next && (
            <Link
              to={lessonLink(course.book.id, course.next)}
              className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card-2 px-3 py-2 transition hover:border-aurora-400/40"
            >
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-bold text-main">{course.next.unit.title}</span>
                <span className="block text-[9px] text-muted">{tr('Next lesson in {book}', { book: course.book.title })}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted rtl:rotate-180" />
            </Link>
          )}
          {weakest && (
            <Link
              to="/practice"
              className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card-2 px-3 py-2 transition hover:border-aurora-400/40"
            >
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-bold text-main">{weakest.key.split('|')[1] || weakest.key}</span>
                <span className="block text-[9px] text-muted">
                  {tr('Weakest skill · {n}% accuracy', { n: num(Math.round(weakest.accuracy * 100)) })}
                </span>
              </span>
              <Target className="h-3.5 w-3.5 shrink-0 text-muted" />
            </Link>
          )}
          {due > 0 && (
            <Link
              to="/study?tab=review"
              className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card-2 px-3 py-2 transition hover:border-aurora-400/40"
            >
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-bold text-main">{tr('{n} cards due', { n: num(due) })}</span>
                <span className="block text-[9px] text-muted">{tr('Ten minutes of recall beats re-reading.')}</span>
              </span>
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-muted" />
            </Link>
          )}
          {!course?.next && (
            <Link
              to="/certificate"
              className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card-2 px-3 py-2 transition hover:border-aurora-400/40"
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-bold text-main">{tr('Open my certificate')}</span>
                <span className="block text-[9px] text-muted">{tr('Every lesson in your course is done.')}</span>
              </span>
              <Award className="h-3.5 w-3.5 shrink-0 text-muted" />
            </Link>
          )}
        </div>
      </div>
    </Card>
  )
}
