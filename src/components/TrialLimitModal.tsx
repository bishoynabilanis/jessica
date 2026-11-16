import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, Sparkles, Timer } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { onTrialLimit, trialRemaining } from '@/lib/ai/trial'
import { TRIAL_ACTIONS_PER_DAY } from '@/lib/ai/config'
import { num, tr } from '@/i18n'

/**
 * Shown the moment the daily free actions run out: wait until tomorrow, or add
 * a personal key and keep going without limits.
 */
export function TrialLimitModal() {
  const [open, setOpen] = useState(false)

  useEffect(
    () =>
      onTrialLimit(() => {
        setOpen(true)
      }),
    [],
  )

  return (
    <Modal open={open} onClose={() => setOpen(false)} title={tr('Today’s free usage is over')} size="sm">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-aurora-400 to-violet-neon text-2xl">
          ⏳
        </div>
        <p className="mt-3 text-sm font-extrabold text-main">
          {tr('You used {n} free actions today.', { n: num(TRIAL_ACTIONS_PER_DAY) })}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          {tr('You can wait until tomorrow, or add your free Google Gemini key and remove the limit entirely — the key stays on your device.')}
        </p>

        <div className="mt-3 space-y-1.5 text-start">
          <p className="flex items-center gap-2 rounded-xl border border-line bg-card-2 px-2.5 py-2 text-[10px] text-muted">
            <Timer className="h-3.5 w-3.5 shrink-0 text-aurora-300" />
            {tr('The limit resets by itself after midnight.')}
          </p>
          <p className="flex items-center gap-2 rounded-xl border border-line bg-card-2 px-2.5 py-2 text-[10px] text-muted">
            <KeyRound className="h-3.5 w-3.5 shrink-0 text-aurora-300" />
            {tr('A Gemini key is free from Google AI Studio, and you can delete it any time.')}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Link to="/settings" onClick={() => setOpen(false)}>
            <Button className="w-full" data-testid="trial-limit-settings">
              <Sparkles className="h-4 w-4" /> {tr('Add my key and continue without limits')}
            </Button>
          </Link>
          <Button variant="ghost" onClick={() => setOpen(false)} className="w-full">
            {tr('Fine, I will wait until tomorrow')}
          </Button>
        </div>

        <p className="mt-3 text-[9px] text-muted-2">
          {tr('{n} actions left today.', { n: num(trialRemaining()) })}
        </p>
      </div>
    </Modal>
  )
}
