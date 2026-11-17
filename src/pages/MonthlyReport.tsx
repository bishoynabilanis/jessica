import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, CalendarRange, Clock, Flame, Printer, Sparkles, Target, Trophy, Users } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, ProgressBar } from '@/components/ui/Card'
import { useApp, levelInfo } from '@/store/useApp'
import { buildMonthlyReport, monthTotals } from '@/lib/monthlyReport'
import { readAttempts } from '@/lib/bankHistory'
import { readRegistry, readSlotState } from '@/lib/profiles'
import { levelLabel } from '@/lib/curriculum'
import type { GradeLevel } from '@/types'
import { cn } from '@/lib/utils'
import { dateLocale, num, tr } from '@/i18n'

const percent = (value: number) => `${num(Math.round(value * 100))}%`

export function MonthlyReport() {
  const state = useApp()
  const attempts = useMemo(() => readAttempts(), [])
  const reports = useMemo(
    () =>
      buildMonthlyReport({
        dailyLog: state.dailyLog,
        topicLog: state.topicLog,
        skillStats: state.skillStats,
        mistakes: state.mistakes,
        exams: state.exams,
        attempts,
        unitMastery: state.unitMastery,
      }),
    [state.dailyLog, state.topicLog, state.skillStats, state.mistakes, state.exams, state.unitMastery, attempts],
  )

  const { dailyLog } = state
  const siblings = useMemo(() => {
    const registry = readRegistry()
    if (registry.slots.length < 2) return []
    return registry.slots.map((slot) => {
      const snapshot = slot.id === registry.active ? null : readSlotState(slot.id)
      const log =
        slot.id === registry.active
          ? dailyLog
          : ((snapshot?.state?.dailyLog as Record<string, { xp: number; seconds: number }> | undefined) || {})
      return { id: slot.id, name: slot.name, grade: slot.grade, ...monthTotals(log) }
    })
  }, [dailyLog])

  const { level } = levelInfo(state.xp)
  const grade = levelLabel(state.settings.gradeLevel, state.settings.curriculum)
  const maxWeek = Math.max(1, ...reports.weeks.map((week) => week.minutes))
  const empty = reports.minutes === 0 && reports.activeDays === 0 && reports.weakest.length === 0

  const recommendations = useMemo(() => {
    const list: Array<{ title: string; hint: string; to: string }> = []
    const weakest = reports.weakest[0]
    if (weakest && weakest.accuracy < 0.6) {
      list.push({
        title: tr('Start with {topic}', { topic: weakest.topic }),
        hint: tr('Accuracy is {n}% — the daily plan can carry it.', { n: Math.round(weakest.accuracy * 100) }),
        to: '/skills',
      })
    }
    if (reports.mistakes.due > 0) {
      list.push({
        title: tr('Review {n} due mistakes', { n: reports.mistakes.due }),
        hint: tr('They come back exactly when forgetting starts.'),
        to: '/bank?mode=mistakes&due=1',
      })
    }
    if (reports.activeDays < 12) {
      list.push({
        title: tr('More days, not longer sessions'),
        hint: tr('{n} active days out of {d} — fifteen minutes is enough.', { n: reports.activeDays, d: reports.days }),
        to: '/plan',
      })
    }
    if (reports.trend >= 15) {
      list.push({
        title: tr('The second half of the month is stronger'),
        hint: tr('Minutes are up {n}% on the two weeks before.', { n: reports.trend }),
        to: '/plan',
      })
    }
    if (list.length < 3 && reports.unitsMastered > 0) {
      list.push({
        title: tr('{n} units are mastered', { n: reports.unitsMastered }),
        hint: tr('A timed paper on one of them keeps it fresh.'),
        to: '/bank',
      })
    }
    return list.slice(0, 3)
  }, [reports])

  const dateRange = `${new Date(`${reports.from}T00:00:00`).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' })} — ${new Date(`${reports.to}T00:00:00`).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' })}`

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Monthly report')}
        title={tr('The last four weeks, on one page')}
        subtitle={tr('Minutes, subjects, weakest skills, exams and the mistakes review — built from this device, ready to print or save as a PDF.')}
        icon={<CalendarRange className="h-5 w-5" />}
        actions={
          <>
            <Button size="sm" onClick={() => window.print()} data-testid="monthly-print">
              <Printer className="h-3.5 w-3.5" /> {tr('Print / save PDF')}
            </Button>
            <Link to="/report">
              <Button size="sm" variant="secondary">
                <BarChart3 className="h-3.5 w-3.5" /> {tr('Weekly report')}
              </Button>
            </Link>
          </>
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-2 border-aurora-400/25 bg-aurora-400/5 p-4">
        <div>
          <p className="text-sm font-extrabold text-main">{state.name || tr('My child')}</p>
          <p className="text-[10px] text-muted">
            {grade} · {dateRange} · {tr('Level {n}', { n: level })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-line bg-card-2 px-3 py-1 text-[10px] font-bold text-muted">
          <Flame className="h-3.5 w-3.5 text-sun" /> {tr('{n}-day streak', { n: state.streak })}
        </div>
      </Card>

      {empty ? (
        <Card className="p-5">
          <EmptyState
            icon={<CalendarRange className="h-6 w-6" />}
            title={tr('No data for this period yet')}
            description={tr('A week of study is enough to fill the report. Start with one fifteen-minute session.')}
            action={
              <Link to="/plan">
                <Button size="sm">{tr('Open the daily plan')}</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {[
              { label: tr('Minutes'), value: reports.minutes, icon: Clock, tone: 'text-aurora-200', testid: 'monthly-minutes' },
              { label: tr('XP'), value: reports.xp, icon: Sparkles, tone: 'text-violet-200', testid: 'monthly-xp' },
              { label: tr('Active days'), value: `${reports.activeDays}/${reports.days}`, icon: Flame, tone: 'text-sun', testid: 'monthly-days' },
              { label: tr('Units mastered'), value: reports.unitsMastered, icon: Trophy, tone: 'text-aurora-200', testid: 'monthly-units' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.label} className="p-3.5" data-testid={item.testid}>
                  <Icon className={cn('h-4 w-4', item.tone)} />
                  <p className="mt-1.5 font-display text-xl font-extrabold text-main">{num(String(item.value))}</p>
                  <p className="text-[9px] font-bold text-muted">{item.label}</p>
                </Card>
              )
            })}
          </div>

          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="label text-aurora-300">{tr('Four weeks')}</p>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                  reports.trend >= 0 ? 'bg-aurora-400/15 text-aurora-200' : 'bg-coral/15 text-coral',
                )}
              >
                {reports.trend >= 0 ? '↑' : '↓'} {num(Math.abs(reports.trend))}%
              </span>
            </div>
            <div className="mt-2 space-y-2.5">
              {reports.weeks.map((week, index) => (
                <div key={week.start}>
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold">
                    <span className="text-muted-2">
                      {tr('Week {n}', { n: index + 1 })} ·{' '}
                      {new Date(`${week.start}T00:00:00`).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="tabular-nums text-main">
                      {num(week.minutes)} {tr('min')} · {num(week.xp)} XP
                    </span>
                  </div>
                  <ProgressBar value={week.minutes} max={maxWeek} height="h-1.5" className="mt-1" />
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 lg:grid-cols-2">
            <Card className="p-4">
              <p className="label text-aurora-300">{tr('Subjects studied')}</p>
              {reports.subjects.length === 0 ? (
                <p className="mt-2 text-[11px] text-muted">{tr('No lesson was opened in this period.')}</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {reports.subjects.map((item) => (
                    <span key={item.subject} className="rounded-full border border-line bg-card-2 px-2.5 py-1 text-[10px] font-bold text-main">
                      {tr(item.subject)} · {num(item.topics)}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="label text-aurora-300">{tr('Mistakes review')}</p>
                <Link to="/mistakes" className="text-[10px] font-extrabold text-aurora-300 hover:text-aurora-200">
                  {tr('Open')}
                </Link>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-aurora-400/25 bg-aurora-400/5 p-2">
                  <p className="font-display text-lg font-extrabold text-aurora-200">{num(reports.mistakes.due)}</p>
                  <p className="text-[8px] font-bold text-muted">{tr('Due now')}</p>
                </div>
                <div className="rounded-xl border border-line bg-card-2 p-2">
                  <p className="font-display text-lg font-extrabold text-main">{num(reports.mistakes.later)}</p>
                  <p className="text-[8px] font-bold text-muted">{tr('Scheduled')}</p>
                </div>
                <div className="rounded-xl border border-violet-neon/25 bg-violet-neon/10 p-2">
                  <p className="font-display text-lg font-extrabold text-violet-200">{num(reports.mistakes.mastered)}</p>
                  <p className="text-[8px] font-bold text-muted">{tr('Mastered')}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="label text-aurora-300">{tr('Weakest skills')}</p>
              <Link to="/skills" className="text-[10px] font-extrabold text-aurora-300 hover:text-aurora-200">
                {tr('Skills map')}
              </Link>
            </div>
            {reports.weakest.length === 0 ? (
              <p className="mt-2 text-[11px] text-muted">{tr('Five answered questions per skill are needed before this table fills.')}</p>
            ) : (
              <div className="mt-2 space-y-2">
                {reports.weakest.map((skill) => (
                  <div key={skill.key}>
                    <div className="flex items-center justify-between gap-2 text-[10px] font-bold">
                      <span className="truncate text-main">{skill.topic}</span>
                      <span className={cn('tabular-nums', skill.accuracy < 0.6 ? 'text-coral' : 'text-aurora-200')}>
                        {percent(skill.accuracy)} · {num(skill.correct)}/{num(skill.total)}
                      </span>
                    </div>
                    <ProgressBar value={skill.correct} max={skill.total} height="h-1" className="mt-1" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {(reports.exams.length > 0 || reports.attempts.length > 0) && (
            <Card className="p-4">
              <p className="label text-aurora-300">{tr('Exams and papers')}</p>
              <div className="mt-2 space-y-1.5">
                {reports.exams.map((exam, index) => (
                  <div key={`exam-${index}`} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card-2 px-2.5 py-1.5 text-[10px] font-bold">
                    <span className="truncate text-main">{tr(exam.subject)}</span>
                    <span className="tabular-nums text-muted">
                      {num(exam.score)}/{num(exam.total)} ·{' '}
                      {new Date(exam.date).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
                {reports.attempts.map((attempt, index) => (
                  <div key={`attempt-${index}`} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card-2 px-2.5 py-1.5 text-[10px] font-bold">
                    <span className="truncate text-main">
                      {tr(attempt.subject)} · {tr('Question bank')}
                    </span>
                    <span className="tabular-nums text-muted">
                      {num(attempt.score)}/{num(attempt.total)} ·{' '}
                      {new Date(attempt.at).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {siblings.length > 1 && (
            <Card className="p-4">
              <p className="label flex items-center gap-1.5 text-aurora-300">
                <Users className="h-3 w-3" /> {tr('Siblings on this device')}
              </p>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-muted-2">
                      <th className="py-1 text-start font-bold">{tr('Child')}</th>
                      <th className="py-1 text-start font-bold">{tr('Grade')}</th>
                      <th className="py-1 text-end font-bold">{tr('Minutes')}</th>
                      <th className="py-1 text-end font-bold">{tr('XP')}</th>
                      <th className="py-1 text-end font-bold">{tr('Active days')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siblings.map((child) => (
                      <tr key={child.id} className="border-t border-line text-main">
                        <td className="py-1.5 font-extrabold">{child.name}</td>
                        <td className="py-1.5 text-muted">{levelLabel(child.grade as GradeLevel, state.settings.curriculum)}</td>
                        <td className="py-1.5 text-end tabular-nums">{num(child.minutes)}</td>
                        <td className="py-1.5 text-end tabular-nums">{num(child.xp)}</td>
                        <td className="py-1.5 text-end tabular-nums">{num(child.activeDays)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {recommendations.length > 0 && (
            <Card className="p-4">
              <p className="label flex items-center gap-1.5 text-aurora-300">
                <Target className="h-3 w-3" /> {tr('Recommendations')}
              </p>
              <div className="mt-2 space-y-1.5">
                {recommendations.map((item) => (
                  <Link
                    key={item.title}
                    to={item.to}
                    className="flex items-center gap-2 rounded-xl border border-line bg-card-2 px-3 py-2 transition hover:border-aurora-400/40"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-extrabold text-main">{item.title}</span>
                      <span className="block truncate text-[9px] text-muted">{item.hint}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted rtl:rotate-180" />
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* The printed page: white, A4, no screen chrome. */}
      <div className="print-report" dir={state.settings.language === 'ar' ? 'rtl' : 'ltr'} data-testid="monthly-sheet">
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Jessica — {tr('Monthly report')}</h1>
        <p style={{ margin: '4px 0 14px', fontSize: 12, color: '#555' }}>
          {(state.name || tr('My child'))} · {grade} · {dateRange}
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <tbody>
            <tr>
              <td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{tr('Minutes')}</td>
              <td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{num(reports.minutes)}</td>
              <td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{tr('XP')}</td>
              <td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{num(reports.xp)}</td>
            </tr>
            <tr>
              <td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{tr('Active days')}</td>
              <td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{num(reports.activeDays)}/{num(reports.days)}</td>
              <td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{tr('Units mastered')}</td>
              <td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{num(reports.unitsMastered)}</td>
            </tr>
          </tbody>
        </table>

        <h2 style={{ fontSize: 15, margin: '16px 0 6px' }}>{tr('Four weeks')}</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'start', padding: 4, borderBottom: '1px solid #ddd' }}>{tr('Week')}</th>
              <th style={{ textAlign: 'start', padding: 4, borderBottom: '1px solid #ddd' }}>{tr('Minutes')}</th>
              <th style={{ textAlign: 'start', padding: 4, borderBottom: '1px solid #ddd' }}>XP</th>
              <th style={{ textAlign: 'start', padding: 4, borderBottom: '1px solid #ddd' }}>{tr('Active days')}</th>
            </tr>
          </thead>
          <tbody>
            {reports.weeks.map((week, index) => (
              <tr key={week.start}>
                <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>
                  {tr('Week {n}', { n: index + 1 })} · {new Date(`${week.start}T00:00:00`).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' })}
                </td>
                <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{num(week.minutes)}</td>
                <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{num(week.xp)}</td>
                <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{num(week.activeDays)}/7</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ fontSize: 15, margin: '16px 0 6px' }}>{tr('Weakest skills')}</h2>
        {reports.weakest.length === 0 ? (
          <p style={{ fontSize: 11 }}>{tr('No skill has five answers yet.')}</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'start', padding: 4, borderBottom: '1px solid #ddd' }}>{tr('Skill')}</th>
                <th style={{ textAlign: 'start', padding: 4, borderBottom: '1px solid #ddd' }}>{tr('Accuracy')}</th>
                <th style={{ textAlign: 'start', padding: 4, borderBottom: '1px solid #ddd' }}>{tr('Questions')}</th>
              </tr>
            </thead>
            <tbody>
              {reports.weakest.map((skill) => (
                <tr key={skill.key}>
                  <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{skill.topic}</td>
                  <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{percent(skill.accuracy)}</td>
                  <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{num(skill.correct)}/{num(skill.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2 style={{ fontSize: 15, margin: '16px 0 6px' }}>{tr('Mistakes review')}</h2>
        <p style={{ fontSize: 11, margin: '0 0 6px' }}>
          {tr('Due now')}: {num(reports.mistakes.due)} · {tr('Scheduled')}: {num(reports.mistakes.later)} · {tr('Mastered')}: {num(reports.mistakes.mastered)}
        </p>

        {siblings.length > 1 && (
          <>
            <h2 style={{ fontSize: 15, margin: '16px 0 6px' }}>{tr('Siblings on this device')}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'start', padding: 4, borderBottom: '1px solid #ddd' }}>{tr('Child')}</th>
                  <th style={{ textAlign: 'start', padding: 4, borderBottom: '1px solid #ddd' }}>{tr('Minutes')}</th>
                  <th style={{ textAlign: 'start', padding: 4, borderBottom: '1px solid #ddd' }}>XP</th>
                  <th style={{ textAlign: 'start', padding: 4, borderBottom: '1px solid #ddd' }}>{tr('Active days')}</th>
                </tr>
              </thead>
              <tbody>
                {siblings.map((child) => (
                  <tr key={child.id}>
                    <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{child.name}</td>
                    <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{num(child.minutes)}</td>
                    <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{num(child.xp)}</td>
                    <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{num(child.activeDays)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {recommendations.length > 0 && (
          <>
            <h2 style={{ fontSize: 15, margin: '16px 0 6px' }}>{tr('Recommendations')}</h2>
            <ul style={{ fontSize: 11, paddingInlineStart: 18 }}>
              {recommendations.map((item) => (
                <li key={item.title} style={{ marginBottom: 3 }}>
                  <b>{item.title}</b> — {item.hint}
                </li>
              ))}
            </ul>
          </>
        )}

        <p style={{ marginTop: 28, fontSize: 10, color: '#666' }}>{tr('Generated on this device by Jessica.')}</p>
        <p style={{ marginTop: 26, fontSize: 11 }}>__________________________________<br />{tr('Parent signature')}</p>
      </div>
    </div>
  )
}
