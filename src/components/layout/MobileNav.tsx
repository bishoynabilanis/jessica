import { NavLink } from 'react-router-dom'
import { AlertTriangle, Bookmark, Brain, CalendarCheck, FileText, FlaskConical, Gamepad2, GraduationCap, Home, HelpCircle, LibraryBig, MessagesSquare, Mic, MoreHorizontal, Orbit, Settings, Sparkles, Target, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { tr } from '@/i18n'
import { useKidsWorld } from '@/lib/stage'
import { useApp } from '@/store/useApp'

const primary = [
  { path: '/', label: tr("Home"), icon: Home },
  { path: '/library', label: tr("Library"), icon: LibraryBig },
  { path: '/study', label: tr("Study"), icon: GraduationCap },
  { path: '/games', label: tr("Arcade"), icon: Gamepad2 },
]

const more = [
  { path: '/labs', label: tr("Virtual labs"), icon: FlaskConical, hint: tr("Circuits, light and physics") },
  { path: '/reading', label: tr("Reading coach"), icon: Mic, hint: tr("Read aloud and get a score") },
  { path: '/mistakes', label: tr("Mistakes"), icon: AlertTriangle, hint: tr("Wrong answers and drills") },
  { path: '/skills', label: tr("Skills map"), icon: Target, hint: tr("Mastery and readiness") },
  { path: '/plan', label: tr("Daily plan"), icon: CalendarCheck, hint: tr("Today’s three missions") },
  { path: '/ask', label: tr("Ask my books"), icon: MessagesSquare, hint: tr("Answer with a page source") },
  { path: '/practice', label: tr("Adaptive practice"), icon: Brain, hint: tr("Weak-first questions") },
  { path: '/worksheets', label: tr("Worksheets"), icon: FileText, hint: tr("Printable sheets and answer keys") },
  { path: '/teacher', label: tr("Class mode"), icon: Users, hint: tr("Assignments, QR codes and results") },
  { path: '/constellation', label: tr("Learning map"), icon: Orbit, hint: tr("Your curriculum constellation") },
  { path: '/vault', label: tr("Knowledge Vault"), icon: Bookmark, hint: tr("Saved answers & rules") },
  { path: '/mascot', label: tr("Companion"), icon: Sparkles, hint: tr("Evolve your study buddy") },
  { path: '/help', label: tr("Help centre"), icon: HelpCircle, hint: tr("Answers and guides") },
  { path: '/feedback', label: tr("Suggestions & complaints"), icon: HelpCircle, hint: tr("Tell us what to improve") },
  { path: '/settings', label: tr("Settings"), icon: Settings, hint: tr("API key, accessibility, data") },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const primaryUi = useApp((s) => s.settings.primaryUi)
  const kids = useKidsWorld(gradeLevel, primaryUi)
  const kidsLabels: Record<string, string> = {
    Home: 'Home',
    Library: 'My books',
    Study: 'Study time',
    Arcade: 'Play',
    'Virtual labs': 'Experiments',
    'Learning map': 'My map',
    'Knowledge Vault': 'My treasure',
    Companion: 'My buddy',
    Settings: 'Settings',
    More: 'More',
  }
  return (
    <>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-app/85 px-2 pt-1.5 backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {primary.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex w-16 flex-col items-center gap-1 rounded-xl py-1.5 text-[9px] font-bold transition',
                    isActive ? 'text-aurora-300' : 'text-muted',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'grid h-8 w-12 place-items-center rounded-xl transition',
                        isActive && 'bg-aurora-400/15',
                      )}
                    >
                      <Icon className={cn('h-4.5 w-4.5', isActive && 'text-aurora-300')} />
                    </span>
                    {tr(kids ? kidsLabels[item.label] || item.label : item.label)}
                  </>
                )}
              </NavLink>
            )
          })}
          <button
            onClick={() => setOpen(true)}
            className="flex w-16 flex-col items-center gap-1 rounded-xl py-1.5 text-[9px] font-bold text-muted"
          >
            <span className="grid h-8 w-12 place-items-center rounded-xl">
              <MoreHorizontal className="h-4.5 w-4.5" />
            </span>
            {tr('More')}
          </button>
        </div>
      </nav>

      <Modal open={open} onClose={() => setOpen(false)} title={tr("Explore Jessica")} subtitle={tr("Everything else in your learning universe.")} size="sm">
        <div className="space-y-2">
          {more.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-line bg-card-2 p-3 transition hover:bg-white/5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-aurora-400/10 text-aurora-300">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-main">{tr(item.label)}</span>
                  <span className="text-[11px] text-muted">{tr(item.hint)}</span>
                </span>
              </NavLink>
            )
          })}
        </div>
      </Modal>
    </>
  )
}
