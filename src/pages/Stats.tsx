import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, Globe2, RefreshCw, Smartphone, Zap } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp, levelInfo } from '@/store/useApp'
import { localOpens, readCounters, type AppCounters } from '@/lib/counter'
import { todayKey } from '@/lib/utils'
import { num } from '@/i18n'
import { counterTr as tr } from '@/i18n/counters'

export function Stats() {
  const xp = useApp((s) => s.xp)
  const streak = useApp((s) => s.streak)
  const dailyLog = useApp((s) => s.dailyLog)
  const completedTopics = useApp((s) => s.completedTopics)
  const [counters, setCounters] = useState<AppCounters | null>(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<{ date: string; opens: number | null }[] | null>(null)

  const { level } = levelInfo(xp)
  const today = dailyLog[todayKey()] || { xp: 0, seconds: 0 }
  const minutesToday = Math.round(today.seconds / 60)
  const installs = counters?.installs
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      setCounters(await readCounters())
      setUpdatedAt(new Date().toLocaleString())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    fetch(`${import.meta.env.BASE_URL}stats.json`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setHistory(Array.isArray(data?.days) ? data.days.slice(-14) : null))
      .catch(() => setHistory(null))
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader
        back
        eyebrow={tr('Numbers')}
        title={tr('The app, by the numbers')}
        subtitle={tr('Anonymous totals from everyone, and your own progress on this device.')}
        icon={<BarChart3 className="h-5 w-5" />}
        actions={
          <Button size="md" variant="secondary" onClick={refresh} loading={loading}>
            <RefreshCw className="h-4 w-4" /> {tr('Refresh')}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Globe2, label: tr('Browser records'), value: counters?.browsers, accent: 'text-aurora-300' },
          { icon: Smartphone, label: tr('Install browser records'), value: installs, accent: 'text-violet-glow' },
          { icon: Globe2, label: tr('App opens'), value: counters?.opens, accent: 'text-aurora-300' },
          { icon: Zap, label: tr('Opens on this device'), value: localOpens(), accent: 'text-sun' },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <item.icon className={`h-4 w-4 ${item.accent}`} />
            <p className="mt-2 font-display text-3xl font-extrabold text-main">
              {item.value == null ? '—' : num(item.value)}
            </p>
            <p className="text-[10px] font-bold text-muted">{item.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4 space-y-2" data-testid="counter-notice">
        <p className="text-xs font-bold text-aurora-300">{tr('New browser and install counters start on 24 November 2026. Older totals cannot be recovered.')}</p>
        <p className="text-xs text-muted">{tr('One local flag per browser profile, not one person or physical device. Clearing storage or using another browser can count again; failures and opt-outs can miss counts.')}</p>
        <p className="text-xs text-muted">{tr("The counter provider receives normal connection metadata, including your IP address. Jessica does not store an IP address or send a device ID. Turn off the anonymous counter to stop these requests.")}</p>
        <p className="text-xs text-muted">{tr('Country and governorate are not collected.')}</p>
        <p className="text-xs text-muted">{tr('Totals are visible to anyone. This is not a private owner dashboard.')}</p>
        {updatedAt && <p className="text-[10px] text-muted-2">{tr('Last checked: {time}', { time: updatedAt })}</p>}
      </Card>

      {history && history.length >= 2 ? (
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="label text-aurora-300">{tr('Cumulative snapshots')}</p>
            <span className="text-[9px] font-bold text-muted-2">
              {tr('{n} days', { n: history.length })}
            </span>
          </div>
          <div className="mt-3 flex h-20 items-end gap-1.5">
            {history.map((day) => {
              const max = Math.max(1, ...history.map((item) => item.opens || 0))
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-14 w-full items-end justify-center">
                    <div
                      className="w-full max-w-[22px] rounded-t bg-gradient-to-t from-violet-neon/40 to-aurora-400"
                      style={{ height: `${Math.max(6, ((day.opens || 0) / max) * 100)}%` }}
                      title={`${day.date}: ${day.opens ?? '—'}`}
                    />
                  </div>
                  <span className="text-[7px] font-bold text-muted-2" dir="ltr">
                    {day.date.slice(5)}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-[10px] text-muted-2">
            {tr('A snapshot is taken every day, so a bad day at the counter service never loses the trend.')}
          </p>
        </Card>
      ) : null}

      <Card className="p-4 sm:p-5">
        <p className="label mb-2 text-violet-glow">{tr('On this device')}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: tr('Level'), value: num(level) },
            { label: tr('XP'), value: num(xp) },
            { label: tr('Streak'), value: num(streak) },
            { label: tr('Minutes today'), value: num(minutesToday) },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-line bg-card-2 px-3 py-2">
              <p className="font-display text-lg font-extrabold text-main">{item.value}</p>
              <p className="text-[9px] font-bold text-muted">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-muted-2">
          {tr('{n} units mastered so far.', { n: num(completedTopics.length) })}
        </p>
      </Card>

      <Card className="p-4">
        <p className="text-[11px] font-extrabold text-main">{tr('How these numbers work')}</p>
        <ul className="mt-2 space-y-1.5 text-[10px] leading-relaxed text-muted">
          <li>• {tr('Session opens and new browser/install signals increment public totals without sending a device identifier. Local flags reduce repeats; these are estimates, not a user census.')}</li>
          <li>• {tr('Installation and home-screen launch share one local flag, so the two signals are not added together.')}</li>
          <li>• {tr('Nothing about your books, answers or name ever leaves this device.')}</li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/settings">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {tr('Settings')}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
