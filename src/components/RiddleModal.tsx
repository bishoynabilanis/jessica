import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, Flame, Sparkles, Zap } from 'lucide-react'
import { cn, todayKey } from '@/lib/utils'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { requestNotificationPermission, sendLocalNotification } from '@/hooks/usePlatform'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { getLanguage, tr, dateLocale } from '@/i18n'

export function RiddleCard({ compact }: { compact?: boolean }) {
  const riddle = useApp((s) => s.riddle)
  const answerRiddle = useApp((s) => s.answerRiddle)
  const settings = useApp((s) => s.settings)
  const updateSettings = useApp((s) => s.updateSettings)
  const pushToast = useUI((s) => s.pushToast)
  const [enabling, setEnabling] = useState(false)

  const selected = riddle.selected
  const solved = riddle.solved
  const attempted = riddle.attempted

  const enableReminders = async () => {
    setEnabling(true)
    const permission = await requestNotificationPermission()
    if (permission === 'granted') {
      updateSettings({ notifications: true })
      await sendLocalNotification(
        tr('Daily riddle is ready 🧠'),
        tr('Open Jessica and solve today’s riddle for bonus XP.'),
        'jessica-test',
      )
      pushToast({ title: tr("Daily reminders on"), description: tr("We will nudge you every day at 4 PM."), type: 'success' })
    } else if (permission === 'unsupported') {
      pushToast({ title: tr("Notifications not supported"), description: tr("Try installing Jessica on your phone first."), type: 'error' })
    } else {
      pushToast({ title: tr("Permission blocked"), description: tr("Allow notifications in your browser settings."), type: 'error' })
    }
    setEnabling(false)
  }

  return (
    <div className={cn('relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-sun/10 via-card-2 to-violet-neon/10 p-4 sm:p-5', compact && 'p-4')}>
      <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-sun/10 blur-2xl" />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-sun/15 text-sun">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sun">{tr("Daily riddle")}</p>
            <p className="text-[10px] text-muted">{tr(riddle.subject)} · {new Date().toLocaleDateString(dateLocale())}</p>
          </div>
        </div>
        <span className="chip border-sun/30 bg-sun/10 text-sun">
          <Zap className="h-3 w-3" /> +{riddle.xp} {tr("XP")}
        </span>
      </div>

      <p className="mt-3 text-sm font-bold leading-relaxed text-main">{riddle.question}</p>

      <div className="mt-3 grid gap-1.5">
        {riddle.options.map((option, index) => {
          const isCorrect = index === riddle.answer
          const isSelected = selected === index
          return (
            <button
              key={index}
              disabled={solved}
              onClick={() => answerRiddle(index)}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all',
                solved && isCorrect
                  ? 'border-aurora-400/50 bg-aurora-400/15 text-aurora-200'
                  : isSelected && attempted && !isCorrect
                    ? 'border-coral/40 bg-coral/10 text-coral'
                    : 'border-line bg-card-2 text-main hover:border-line-strong hover:bg-white/5',
                solved && !isCorrect && 'opacity-50',
              )}
            >
              <span
                className={cn(
                  'grid h-5 w-5 shrink-0 place-items-center rounded-md bg-white/10 text-[10px] font-bold',
                  solved && isCorrect && 'bg-aurora-400 text-ink-950',
                )}
              >
                {solved && isCorrect ? <Check className="h-3 w-3" /> : String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          )
        })}
      </div>

      {(attempted || solved) && (
        <p className={cn('mt-3 rounded-xl border p-2.5 text-[11px] leading-relaxed', solved ? 'border-aurora-400/25 bg-aurora-400/10 text-aurora-200' : 'border-coral/25 bg-coral/10 text-coral')}>
          {solved ? '✅ ' : '💡 '}
          {riddle.explanation}
        </p>
      )}

      {!solved && attempted && (
        <p className="mt-2 text-[10px] font-semibold text-muted">{tr("Not quite — read the hint and try another option.")}</p>
      )}

      {!compact && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!settings.notifications ? (
            <Button variant="secondary" size="sm" onClick={enableReminders} loading={enabling}>
              <Bell className="h-3.5 w-3.5" /> {tr("Remind me at 4 PM")}
            </Button>
          ) : (
            <span className="chip border-aurora-400/25 text-aurora-200">
              <Bell className="h-3 w-3" /> {tr("Daily 4 PM reminder on")}
            </span>
          )}
          <Link to="/games" className="text-[11px] font-bold text-aurora-300 hover:underline">
            {tr("More challenges →")}
          </Link>
        </div>
      )}

      {compact && solved && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-aurora-400/10 px-3 py-2 text-[11px] font-semibold text-aurora-200">
          <Flame className="h-3.5 w-3.5" /> {tr("Riddle solved. That’s how streaks are built.")}
        </div>
      )}
    </div>
  )
}

export function RiddleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={tr("Today’s brain teaser")} subtitle={tr("Solve it for bonus XP. A new riddle lands every afternoon.")} icon={<Sparkles className="h-4.5 w-4.5" />} size="md">
      <RiddleCard />
    </Modal>
  )
}
