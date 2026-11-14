import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Camera, Flame, Gem, Languages, Menu, MoonStar, Search, Settings2, Share2, Sparkles, Sun, Zap } from 'lucide-react'
import { useApp, levelInfo } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { Mascot } from '@/components/Mascot'
import { cn, firstName } from '@/lib/utils'
import { navItems } from './Sidebar'
import { RiddleModal } from '@/components/RiddleModal'
// These two modals pull in markdown/katex and the QR encoder, which are only
// needed once the learner actually opens them — keep them out of the first load.
const VisionSolverModal = lazy(() =>
  import('@/components/tools/VisionSolver').then((m) => ({ default: m.VisionSolverModal })),
)
const ShareAppModal = lazy(() => import('@/components/ShareApp').then((m) => ({ default: m.ShareAppModal })))
import { tr, UI_LANGUAGES, nextLanguage } from '@/i18n'
import { useKidsWorld } from '@/lib/stage'

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { xp, streak, coins, name, mascotLook, settings } = useApp()
  const { updateSettings } = useApp()
  const toggleQuickPanel = useUI((s) => s.toggleQuickPanel)
  const [riddleOpen, setRiddleOpen] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const { level, into, needed, progress } = levelInfo(xp)
  const kids = useKidsWorld(settings.gradeLevel, settings.primaryUi)

  const pageLabel = useMemo(() => {
    const found = navItems.find((n) => (n.path === '/' ? location.pathname === '/' : location.pathname.startsWith(n.path)))
    return found?.label || 'Jessica'
  }, [location.pathname])

  const [clock, setClock] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])
  const greeting = clock.getHours() < 12 ? 'Good morning' : clock.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-app/70 backdrop-blur-2xl">
        <div className="flex h-16 items-center gap-3 px-3 sm:px-6">
          <button
            onClick={onMenu}
            className="grid h-10 w-10 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-main lg:hidden"
            aria-label={tr('Open menu')}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden min-w-0 sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-2">
              {kids ? '🧸 ' : ''}{tr(greeting)}{name ? `, ${firstName(name)}` : ''}
            </p>
            <p className="truncate font-display text-sm font-extrabold text-main">{tr(pageLabel)}</p>
          </div>

          <div className="flex flex-1 items-center justify-center px-1">
            <div className="flex w-full max-w-md items-center gap-3">
              <div className="relative hidden h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-aurora-400/20 to-violet-neon/20 ring-1 ring-inset ring-aurora-400/25 sm:grid">
                <span className="text-[11px] font-black text-aurora-300">{level}</span>
                <span className="absolute -bottom-1 -right-1 rounded-full bg-violet-neon px-1 text-[7px] font-black text-white">
                  {tr('LVL')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between text-[9px] font-bold text-muted">
                  <span className="hidden sm:inline">{tr('MASTERY')}</span>
                  <span className="sm:hidden">{tr('LV')} {level}</span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 text-sun" />
                    {into}/{needed}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-aurora-400 via-aurora-300 to-violet-glow shadow-[0_0_12px_rgba(33,230,201,.5)] transition-all duration-700"
                    style={{ width: `${Math.max(3, progress)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShareOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-main"
              aria-label={tr('Share Jessica')}
              title={tr('Share Jessica')}
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setScanOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-main"
              aria-label={tr('Scan a page')}
              title={tr('Scan a page')}
            >
              <Camera className="h-4 w-4" />
            </button>
            <button
              onClick={() => window.dispatchEvent(new Event('jessica-search'))}
              className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-main"
              aria-label={tr('Search')}
              title={tr('Search')}
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => setRiddleOpen(true)}
              className="relative grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-main"
              aria-label={tr('Daily riddle and notifications')}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-sun" />
            </button>
            <div className="hidden items-center gap-1 rounded-xl border border-line bg-card-2 px-2.5 py-1.5 sm:flex" title={tr('Daily streak')}>
              <Flame className="h-3.5 w-3.5 text-coral" />
              <span className="text-xs font-extrabold text-main">{streak}</span>
            </div>
            <div className="hidden items-center gap-1 rounded-xl border border-line bg-card-2 px-2.5 py-1.5 md:flex" title={tr('Jessica coins')}>
              <Gem className="h-3.5 w-3.5 text-sky" />
              <span className="text-xs font-extrabold text-main">{coins}</span>
            </div>
            <button
              onClick={() => toggleQuickPanel(true)}
              className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-main"
              aria-label={tr('Accessibility quick settings')}
            >
              {settings.theme === 'dark' ? <MoonStar className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              onClick={() => updateSettings({ language: nextLanguage(settings.language) })}
              className="flex h-9 items-center gap-1.5 rounded-xl px-2 text-[11px] font-extrabold uppercase text-muted transition hover:bg-white/5 hover:text-main"
              aria-label={tr('Switch language')}
              title={tr('Switch language')}
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">{UI_LANGUAGES.find((item) => item.id === nextLanguage(settings.language))?.short}</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-main"
              aria-label={tr('Settings')}
            >
              <Settings2 className="h-4 w-4" />
            </button>
            <div className="relative ml-1">
              <button
                onClick={() => navigate('/mascot')}
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-line bg-card-2"
                aria-label={tr('Your companion')}
              >
                <Mascot xp={xp} size={38} look={mascotLook} animate={false} showAura={false} />
              </button>
              <span className="absolute -bottom-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-aurora-400 px-1 text-[8px] font-black text-ink-950">
                {level}
              </span>
            </div>
          </div>
        </div>
      </header>
      <RiddleModal open={riddleOpen} onClose={() => setRiddleOpen(false)} />
      <Suspense fallback={null}>
        {scanOpen && <VisionSolverModal open onClose={() => setScanOpen(false)} />}
        {shareOpen && <ShareAppModal open onClose={() => setShareOpen(false)} />}
      </Suspense>
    </>
  )
}
