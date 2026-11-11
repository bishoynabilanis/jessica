import { useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Flame, Gamepad2, Home, Lock, Sparkles, Star } from 'lucide-react'
import { Mascot } from '@/components/Mascot'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { todayKey } from '@/lib/utils'
import { useKidsReminder } from '@/kids/useKidsReminder'
import { useApp } from '@/store/useApp'
import { cn } from '@/lib/utils'
import { tr } from '@/i18n'

const nav = [
  { to: '/kids', label: 'Home', icon: Home, end: true },
  { to: '/kids/library', label: 'My books', icon: BookOpen },
  { to: '/kids/play', label: 'Play', icon: Gamepad2 },
  { to: '/kids/me', label: 'My buddy', icon: Sparkles },
]

export function KidsShell() {
  const { xp, streak } = useApp()
  const settings = useApp((s) => s.settings)
  const addKidsUsage = useApp((s) => s.addKidsUsage)
  const usage = useApp((s) => s.kidsUsage[todayKey()] || 0)
  const limitReached = settings.kidsDailyLimit > 0 && usage >= settings.kidsDailyLimit * 60
  const navigate = useNavigate()
  const location = useLocation()
  const hideNav = location.pathname.startsWith('/kids/reader')
  const parentArea = location.pathname.startsWith('/kids/parent') || location.pathname.startsWith('/kids/settings')
  useKidsReminder()

  useEffect(() => {
    let last = Date.now()
    const tick = () => {
      const now = Date.now()
      const seconds = Math.round((now - last) / 1000)
      last = now
      if (document.visibilityState !== 'visible') return
      if (seconds <= 0 || seconds > 120) return
      const state = useApp.getState()
      const used = state.kidsUsage[todayKey()] || 0
      if (state.settings.kidsDailyLimit > 0 && used >= state.settings.kidsDailyLimit * 60) return
      state.addKidsUsage(seconds)
    }
    const timer = window.setInterval(tick, 30_000)
    const onVisibility = () => {
      last = Date.now()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      tick()
    }
  }, [addKidsUsage])

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('kids-mode', 'light')
    root.classList.remove('dark')
    return () => {
      const theme = useApp.getState().settings.theme
      root.classList.remove('kids-mode')
      root.classList.toggle('light', theme === 'light')
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [])

  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-sun/25 blur-[100px]" />
        <div className="absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-aurora-400/20 blur-[100px]" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-coral/15 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-3 sm:px-5">
          <button onClick={() => navigate('/kids')} className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-sun to-coral text-lg shadow-lg">
              🧸
            </span>
            <span className="text-start">
              <span className="block font-display text-base font-extrabold leading-none text-main">
                Jessica <span className="text-sun">kids</span>
              </span>
              <span className="text-[9px] font-bold text-muted">{tr('Primary stage')}</span>
            </span>
          </button>

          <div className="ms-auto flex items-center gap-1.5">
            <span className="chip border-sun/40 bg-sun/15 text-sun">
              <Star className="h-3 w-3" /> {xp}
            </span>
            <span className="chip border-coral/30 bg-coral/10 text-coral">
              <Flame className="h-3 w-3" /> {streak}
            </span>
            <button
              onClick={() => navigate('/kids/parent')}
              className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white/70 text-muted transition hover:text-main"
              aria-label={tr('Parent settings')}
              title={tr('Parent settings')}
            >
              <Lock className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-3 pb-28 pt-4 sm:px-5">
        <Outlet />
      </main>

      {limitReached && !parentArea && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-gradient-to-b from-sky/40 via-white to-sun/30 p-5 backdrop-blur-sm">
          <Card className="max-w-sm rounded-[32px] border-2 border-white p-6 text-center">
            <div className="mx-auto w-fit">
              <Mascot xp={0} size={130} mood="sleepy" />
            </div>
            <h1 className="mt-2 font-display text-xl font-extrabold text-ink-950">{tr('Time is up for today')}</h1>
            <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-ink-600">
              {tr('You did great! Jessica is sleepy now. Come back tomorrow, or ask a grown-up to add a little more time.')}
            </p>
            <Button className="mt-4" variant="secondary" onClick={() => navigate('/kids/parent')}>
              <Lock className="h-4 w-4" /> {tr('For grown-ups')}
            </Button>
          </Card>
        </div>
      )}

      {!hideNav && !limitReached && (
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/85 px-2 pt-1.5 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-lg items-center justify-around">
            {nav.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex w-20 flex-col items-center gap-1 rounded-2xl py-1.5 text-[10px] font-extrabold transition',
                      isActive ? 'text-sun' : 'text-muted',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          'grid h-10 w-14 place-items-center rounded-2xl transition',
                          isActive ? 'bg-sun/20' : 'bg-transparent',
                        )}
                      >
                        <Icon className={cn('h-5 w-5', isActive && 'text-sun')} />
                      </span>
                      {tr(item.label)}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
