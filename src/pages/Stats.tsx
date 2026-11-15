import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, Globe2, RefreshCw, Smartphone, Zap } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp, levelInfo } from '@/store/useApp'
import { localOpens, readCounters, type AppCounters } from '@/lib/counter'
import { todayKey } from '@/lib/utils'
import { num, tr } from '@/i18n'

export function Stats() {
  const xp = useApp((s) => s.xp)
  const streak = useApp((s) => s.streak)
  const dailyLog = useApp((s) => s.dailyLog)
  const completedTopics = useApp((s) => s.completedTopics)
  const [counters, setCounters] = useState<AppCounters | null>(null)
  const [loading, setLoading] = useState(true)

  const { level } = levelInfo(xp)
  const today = dailyLog[todayKey()] || { xp: 0, seconds: 0 }
  const minutesToday = Math.round(today.seconds / 60)
  const installs = (counters?.installs || 0) + (counters?.pwa || 0)

  const refresh = async () => {
    setLoading(true)
    try {
      setCounters(await readCounters())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
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

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Globe2, label: tr('App opens'), value: counters?.opens, accent: 'text-aurora-300' },
          { icon: Smartphone, label: tr('Installs'), value: counters ? installs : null, accent: 'text-violet-glow' },
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

      {counters?.pwa ? (
        <Card className="border-aurora-400/25 bg-aurora-400/5 p-4">
          <p className="text-[11px] font-bold text-aurora-200">
            {tr('{n} opened from the home screen', { n: num(counters.pwa) })}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-muted">
            {tr('That is the honest install count: the browser fired “installed” or the app launched from the home screen.')}
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
          <li>• {tr('App opens: one anonymous increment per browsing session, no identifiers.')}</li>
          <li>• {tr('Installs: a launch from the home screen, counted once per device.')}</li>
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
