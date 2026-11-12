import { NavLink } from 'react-router-dom'
import {
  AlertTriangle,
  Bookmark,
  CalendarCheck,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  Home,
  LibraryBig,
  Orbit,
  Settings,
  Target,
  FileText,
  Mic,
  Users,
  Sparkles,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp, levelInfo } from '@/store/useApp'
import { Mascot } from '@/components/Mascot'
import { mascotForXp } from '@/data/mascots'
import { tr } from '@/i18n'
import { useKidsWorld } from '@/lib/stage'

export const navItems = [
  { path: '/', label: tr("Home"), icon: Home },
  { path: '/plan', label: tr("Daily plan"), icon: CalendarCheck },
  { path: '/library', label: tr("Library"), icon: LibraryBig },
  { path: '/study', label: tr("Study Hub"), icon: GraduationCap },
  { path: '/games', label: tr("Arcade"), icon: Gamepad2 },
  { path: '/labs', label: tr("Labs"), icon: FlaskConical },
  { path: '/reading', label: tr("Reading coach"), icon: Mic },
  { path: '/mistakes', label: tr("Mistakes"), icon: AlertTriangle },
  { path: '/skills', label: tr("Skills map"), icon: Target },
  { path: '/worksheets', label: tr("Worksheets"), icon: FileText },
  { path: '/teacher', label: tr("Class mode"), icon: Users },
  { path: '/constellation', label: tr("Learning Map"), icon: Orbit },
  { path: '/vault', label: tr("Vault"), icon: Bookmark },
  { path: '/mascot', label: tr("Companion"), icon: Sparkles },
  { path: '/settings', label: tr("Settings"), icon: Settings },
]

export function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-aurora-400 via-aurora-500 to-violet-neon shadow-glow">
        <span className="text-lg font-black text-ink-950">J</span>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-sun shadow" />
      </div>
      {!compact && (
        <div>
          <p className="font-display text-lg font-extrabold leading-none tracking-tight text-main">
            {tr("jessica")}<span className="text-aurora-400">.</span>
          </p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-muted-2">{tr('AI learning universe')}</p>
        </div>
      )}
    </div>
  )
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const xp = useApp((s) => s.xp)
  const apiKey = useApp((s) => s.apiKey)
  const mascotName = useApp((s) => s.mascotName)
  const mascotLook = useApp((s) => s.mascotLook)
  const { level, progress, into, needed } = levelInfo(xp)
  const { current, next } = mascotForXp(xp)
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const primaryUi = useApp((s) => s.settings.primaryUi)
  const kids = useKidsWorld(gradeLevel, primaryUi)
  const kidsLabels: Record<string, string> = {
    Home: 'Home',
    Library: 'My books',
    'Study Hub': 'Study time',
    Arcade: 'Play',
    Labs: 'Experiments',
    'Learning Map': 'My map',
    Vault: 'My treasure',
    Companion: 'My buddy',
    Settings: 'Settings',
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6">
        <Brand />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-semibold transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-aurora-400/15 to-violet-neon/10 text-main ring-1 ring-inset ring-aurora-400/20'
                    : 'text-muted hover:bg-white/5 hover:text-main',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-xl transition-colors',
                      isActive
                        ? 'bg-aurora-400 text-ink-950 shadow-glow'
                        : 'bg-white/5 text-muted group-hover:text-main',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{tr(kids ? kidsLabels[item.label] || item.label : item.label)}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-aurora-400" />}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-3">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-violet-neon/15 via-card-2 to-aurora-400/10 p-4">
          <div className="flex items-center gap-3">
            <div className="relative -ml-2 -mt-2 shrink-0">
              <Mascot xp={xp} size={64} look={mascotLook} animate={false} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-main">{tr(mascotName)}</p>
              <p className="text-[10px] font-semibold text-aurora-300">
                {tr(current.name)} · {tr('Lv')} {level}
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-aurora-400 to-violet-neon transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-muted">
            <span>{into} / {needed} {tr("XP")}</span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-sun" />
              {next ? `${next.threshold - xp} ${tr('XP to next stage')}` : tr('Max stage')}
            </span>
          </div>
        </div>

        <NavLink
          to="/settings"
          onClick={onNavigate}
          className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-semibold text-muted transition hover:bg-white/5 hover:text-main"
        >
          <span className={cn('h-2 w-2 rounded-full', apiKey ? 'bg-aurora-400 animate-pulse' : 'bg-coral')} />
          {apiKey ? tr('Gemini connected · BYOK') : tr('Add your Gemini key')}
          <Zap className="ml-auto h-3 w-3" />
        </NavLink>
      </div>
    </div>
  )
}
