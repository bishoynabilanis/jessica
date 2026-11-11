import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, Clock, RefreshCw, Sparkles } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { dueCards } from '@/lib/db'
import { buildDailyPlan } from '@/lib/dailyPlan'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { tr } from '@/i18n'

export function DailyPlan() {
  const state = useApp()
  const [dueCount, setDueCount] = useState(0)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    dueCards()
      .then((cards) => setDueCount(cards.length))
      .catch(() => undefined)
  }, [refresh])

  const missions = useMemo(
    () =>
      buildDailyPlan({
        skillStats: state.skillStats,
        unitMastery: state.unitMastery,
        customBooks: state.customBooks,
        bookProgress: state.bookProgress,
        completedTopics: state.completedTopics,
        examDates: state.examDates,
        mistakes: state.mistakes.length,
        dueCards: dueCount,
        planner: state.planner,
      }),
    [state.skillStats, state.unitMastery, state.customBooks, state.bookProgress, state.completedTopics, state.examDates, state.mistakes.length, dueCount, state.planner],
  )

  const total = missions.reduce((sum, mission) => sum + mission.minutes, 0)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Today’s plan')}
        title={tr('A short plan that fits today')}
        subtitle={tr('Built from your weakest skills, due cards, current unit and the nearest exam. Fifteen minutes is enough.')}
        icon={<CalendarCheck className="h-5 w-5" />}
        actions={
          <Button variant="secondary" size="sm" onClick={() => setRefresh((value) => value + 1)}>
            <RefreshCw className="h-3.5 w-3.5" /> {tr('Refresh plan')}
          </Button>
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-2 border-aurora-400/25 bg-aurora-400/5 p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-aurora-400/15 text-aurora-300">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-main">{missions.length === 1 ? tr('One mission · about {m} minutes', { m: total }) : tr('{n} missions · about {m} minutes', { n: missions.length, m: total })}</p>
            <p className="text-[10px] text-muted">{tr('Small, specific and chosen from your own data.')}</p>
          </div>
        </div>
        <Sparkles className="h-5 w-5 text-sun" />
      </Card>

      <div className="grid gap-3">
        {missions.map((mission, index) => (
          <Card key={mission.id} className="flex flex-wrap items-center gap-3 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/5 text-xl">{mission.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-wide text-muted-2">
                {tr('Mission')} {index + 1} · {mission.minutes} {tr('min')}
              </p>
              <p className="truncate text-sm font-extrabold text-main">{mission.title}</p>
              <p className="truncate text-[10px] text-muted">{mission.hint}</p>
            </div>
            <Link to={mission.to}>
              <Button size="sm">
                {tr('Start')} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      <p className="text-center text-[10px] text-muted-2">
        {tr('Finish these three and your streak, skills and readiness all move forward.')}
      </p>
    </div>
  )
}
