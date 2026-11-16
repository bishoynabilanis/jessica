import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Flame, Star, Trophy } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { Button } from '@/components/ui/Button'
import { dayKeyOffset, todayKey } from '@/lib/utils'
import { dateLocale, num, tr } from '@/i18n'

/** A kid-sized look at the last seven days: one bar per day, stars on top. */
export function KidsStars() {
  const navigate = useNavigate()
  const dailyLog = useApp((s) => s.dailyLog)
  const xp = useApp((s) => s.xp)
  const streak = useApp((s) => s.streak)

  const days = useMemo(() => {
    const today = todayKey()
    return Array.from({ length: 7 }, (_, index) => {
      const offset = index - 6
      const date = new Date()
      date.setDate(date.getDate() + offset)
      const key = dayKeyOffset(offset)
      const stars = dailyLog[key]?.xp || 0
      return {
        key,
        stars,
        isToday: key === today,
        label: date.toLocaleDateString(dateLocale(), { weekday: 'narrow' }),
      }
    })
  }, [dailyLog])

  const total = days.reduce((sum, day) => sum + day.stars, 0)
  const best = Math.max(0, ...days.map((day) => day.stars))
  const max = Math.max(10, best)
  const activeDays = days.filter((day) => day.stars > 0).length

  return (
    <div className="space-y-4">
      <div className="rounded-[32px] border-2 border-white bg-white/85 p-5 text-center shadow-[0_18px_40px_-24px_rgba(15,23,42,.4)]">
        <p className="text-3xl">⭐</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-950">{tr('My stars')}</h1>
        <p className="mt-1 text-xs font-semibold text-ink-600">
          {tr('You collected {n} stars in the last seven days.', { n: num(total) })}
        </p>

        <div className="mt-5 flex items-end justify-between gap-2" aria-hidden>
          {days.map((day) => {
            const height = Math.max(8, Math.round((day.stars / max) * 120))
            return (
              <div key={day.key} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[9px] font-extrabold text-ink-500">{day.stars ? num(day.stars) : ''}</span>
                <span
                  className={
                    'w-full rounded-t-xl ' +
                    (day.isToday
                      ? 'bg-gradient-to-t from-emerald-400 to-teal-300'
                      : day.stars
                        ? 'bg-violet-300'
                        : 'bg-black/10')
                  }
                  style={{ height }}
                />
                <span className={'text-[10px] font-extrabold ' + (day.isToday ? 'text-ink-950' : 'text-ink-500')}>
                  {day.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border-2 border-white bg-white/85 p-3 text-center">
          <Trophy className="mx-auto h-4 w-4 text-amber-500" />
          <p className="mt-1 font-display text-base font-extrabold text-ink-950">{num(xp)}</p>
          <p className="text-[9px] font-bold text-ink-500">{tr('All my stars')}</p>
        </div>
        <div className="rounded-2xl border-2 border-white bg-white/85 p-3 text-center">
          <Flame className="mx-auto h-4 w-4 text-orange-500" />
          <p className="mt-1 font-display text-base font-extrabold text-ink-950">{num(streak)}</p>
          <p className="text-[9px] font-bold text-ink-500">{tr('Day streak')}</p>
        </div>
        <div className="rounded-2xl border-2 border-white bg-white/85 p-3 text-center">
          <Star className="mx-auto h-4 w-4 text-violet-500" />
          <p className="mt-1 font-display text-base font-extrabold text-ink-950">{num(activeDays)}</p>
          <p className="text-[9px] font-bold text-ink-500">{tr('Days I played')}</p>
        </div>
      </div>

      <div className="rounded-[28px] border-2 border-emerald-200 bg-emerald-50/80 p-4 text-center">
        <p className="text-xs font-extrabold text-ink-950">
          {best > 0
            ? tr('Your best day was {n} stars. Beat it!', { n: num(best) })
            : tr('No stars yet this week — one paper is enough to start.')}
        </p>
        <Button size="sm" className="mt-3" onClick={() => navigate('/kids/practice')} data-testid="kids-stars-practice">
          {tr('Play a paper')} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <button onClick={() => navigate('/kids')} className="mx-auto block text-xs font-extrabold text-ink-600 underline">
        {tr('Back home')}
      </button>
    </div>
  )
}
