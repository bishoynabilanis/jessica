import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Cpu, KeyRound, Sparkles, Timer } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { OfflineModelSetup } from '@/components/ai/OfflineModelSetup'
import { onAiNeed, type AiNeed } from '@/lib/ai/setup'
import { trialRemaining } from '@/lib/ai/trial'
import { offlineReady, offlineSupport } from '@/lib/ai/offline'
import { TRIAL_ACTIONS_PER_DAY } from '@/lib/ai/config'
import { num, tr } from '@/i18n'

/**
 * One modal, two situations:
 * - setup: there is no key and no local model yet, so AI cannot run at all.
 * - limit: the shared free trial for today is used up.
 * Both point at the same two free paths.
 *
 * The local model is offered here as a real button, not a pointer to settings:
 * a learner who hits a dead AI button should be one tap from fixing it.
 */
export function AiNeedModal() {
  const [reason, setReason] = useState<AiNeed | null>(null)
  const { pathname } = useLocation()
  const settingsPath = pathname.startsWith('/kids') ? '/kids/settings' : '/settings'
  const support = offlineSupport()
  const ready = offlineReady()

  useEffect(() => onAiNeed((next) => setReason(next)), [])

  const close = () => setReason(null)
  const isLimit = reason === 'limit'
  const canDownload = support.ok && !ready

  return (
    <Modal
      open={reason !== null}
      onClose={close}
      title={
        isLimit
          ? tr('Today’s free usage is over')
          : support.ok
            ? tr('Want the AI to work? Two free ways.')
            : tr('Want the AI to work? One free key.')
      }
      size="sm"
    >
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-aurora-400 to-violet-neon text-2xl">
          {isLimit ? '⏳' : '🤖'}
        </div>

        {isLimit ? (
          <>
            <p className="mt-3 text-sm font-extrabold text-main">
              {tr('You used {n} free actions today.', { n: num(TRIAL_ACTIONS_PER_DAY) })}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              {tr('You can wait until tomorrow, or add your free Google Gemini key and remove the limit entirely — the key stays on your device.')}
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm font-extrabold text-main">
              {support.ok ? tr('Either of these is free, and both stay on your device.') : tr('It is free, and the key stays on your device.')}
            </p>
            <div className="mt-3 space-y-1.5 text-start">
              {canDownload ? (
                <OfflineModelSetup onReady={close} />
              ) : support.ok && ready ? (
                <p className="flex items-start gap-2 rounded-xl border border-line bg-card-2 px-2.5 py-2 text-[10px] leading-relaxed text-muted">
                  <Cpu className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aurora-300" />
                  {tr('The offline model is already on this device — switch to it and go.')}
                </p>
              ) : null}
              {!support.ok && (
                <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-2.5 py-2 text-[10px] leading-relaxed text-amber-200 [.light_&]:border-amber-600/40 [.light_&]:bg-amber-100 [.light_&]:font-bold [.light_&]:text-amber-900">
                  {tr('Offline AI runs on computers and strong devices only, to keep the browser stable. On this device, use a free key.')}
                </p>
              )}
              <p className="flex items-start gap-2 rounded-xl border border-line bg-card-2 px-2.5 py-2 text-[10px] leading-relaxed text-muted">
                <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aurora-300" />
                {tr('Or add a free Gemini key from Google AI Studio — you can delete it any time.')}
              </p>
            </div>
          </>
        )}

        <div className="mt-4 flex flex-col gap-2">
          <Link to={settingsPath} onClick={close}>
            <Button className="w-full" data-testid="ai-need-settings">
              <Sparkles className="h-4 w-4" />
              {!isLimit && !support.ok ? tr('Add a free Gemini key') : tr('Open settings')}
            </Button>
          </Link>
          <Button variant="ghost" onClick={close} className="w-full">
            {isLimit ? tr('Fine, I will wait until tomorrow') : tr('Not now')}
          </Button>
        </div>

        {isLimit && (
          <p className="mt-3 flex items-center justify-center gap-1 text-[9px] text-muted-2">
            <Timer className="h-3 w-3" /> {tr('{n} actions left today.', { n: num(trialRemaining()) })}
          </p>
        )}
      </div>
    </Modal>
  )
}
