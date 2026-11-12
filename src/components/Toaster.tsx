import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, Sparkles, Trophy, X, Zap } from 'lucide-react'
import { useUI } from '@/store/useUI'
import { cn } from '@/lib/utils'
import { tr } from '@/i18n'

export function Toaster() {
  const { toasts, dismiss } = useUI()
  // Marketing screenshots pass ?clean=1 to hide transient toasts.
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('clean')) return null
  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-24 z-[95] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 backdrop-blur-2xl',
              t.type === 'levelup'
                ? 'border-sun/40 bg-gradient-to-r from-violet-neon/25 to-aurora-400/20 shadow-glow'
                : t.type === 'error'
                  ? 'border-coral/35 bg-ink-900/90'
                  : 'border-line-strong bg-ink-900/90',
            )}
          >
            <div
              className={cn(
                'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl',
                t.type === 'xp' || t.type === 'levelup'
                  ? 'bg-sun/15 text-sun'
                  : t.type === 'error'
                    ? 'bg-coral/15 text-coral'
                    : t.type === 'success'
                      ? 'bg-aurora-400/15 text-aurora-300'
                      : 'bg-sky/15 text-sky',
              )}
            >
              {t.type === 'xp' && <Zap className="h-4 w-4" />}
              {t.type === 'levelup' && <Trophy className="h-4 w-4" />}
              {t.type === 'success' && <Check className="h-4 w-4" />}
              {t.type === 'error' && <X className="h-4 w-4" />}
              {t.type === 'info' && <Info className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">{tr(t.title)}</p>
                {typeof t.xp === 'number' && t.xp > 0 && (
                  <span className="chip border-sun/30 bg-sun/10 text-sun">+{t.xp} {tr("XP")}</span>
                )}
                {t.type === 'levelup' && <Sparkles className="h-3.5 w-3.5 text-sun" />}
              </div>
              {t.description && (
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-300">{tr(t.description)}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded-md p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
              aria-label={tr("Dismiss")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
