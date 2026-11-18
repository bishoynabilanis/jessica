import { Check, Cpu, Download } from 'lucide-react'
import { ProgressBar } from '@/components/ui/Card'
import { OFFLINE_MODEL_SIZE_GB } from '@/lib/ai/config'
import { useOfflineModel } from '@/lib/ai/useOfflineModel'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

/**
 * The "no key needed" row for setup and onboarding: one tap downloads the
 * local model and turns the AI on. It renders nothing on devices that cannot
 * run it, because a button that can only fail is worse than no button.
 */
export function OfflineModelSetup({
  className,
  onReady,
  withKeyDivider,
}: {
  className?: string
  onReady?: () => void
  /** Adds an "or bring your own key" rule below, for screens that follow with a key field. */
  withKeyDivider?: boolean
}) {
  const model = useOfflineModel(onReady)

  if (!model.support.ok) return null

  const row = model.ready ? (
    <div
      data-testid="offline-model-ready"
      className={cn(
        'flex items-center gap-2 rounded-2xl border border-aurora-400/30 bg-aurora-400/5 px-3 py-2',
        className,
      )}
    >
      <Check className="h-4 w-4 shrink-0 text-aurora-300" />
      <p className="min-w-0 text-[10px] font-bold leading-relaxed text-aurora-200">
        {tr('The offline model is ready on this device — no key needed.')}
      </p>
    </div>
  ) : model.downloading ? (
    <div
      data-testid="offline-model-progress"
      className={cn('rounded-2xl border border-line bg-card-2 px-3 py-2', className)}
    >
      <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-muted">
        <span className="truncate">{model.status || tr('Downloading the model…')}</span>
        <span>{num(model.progress)}%</span>
      </div>
      <ProgressBar value={model.progress} height="h-1.5" className="mt-1" />
    </div>
  ) : (
    <button
      type="button"
      onClick={() => void model.start()}
      data-testid="offline-model-download"
      className={cn(
        'flex w-full items-center gap-2.5 rounded-2xl border border-violet-neon/30 bg-violet-neon/10 px-3 py-2 text-start transition hover:bg-violet-neon/15',
        className,
      )}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-neon/15 text-violet-glow">
        <Cpu className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-extrabold text-main">{tr('Use the AI without a key')}</span>
        <span className="block text-[9px] leading-snug text-muted">
          {tr('One download (~{size} GB), then the tutor works here with no key and no internet.', {
            size: num(OFFLINE_MODEL_SIZE_GB),
          })}
        </span>
      </span>
      <Download className="h-4 w-4 shrink-0 text-violet-glow" />
    </button>
  )

  if (!withKeyDivider) return row

  return (
    <>
      {row}
      <div className="mt-2 flex items-center gap-2">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-2">
          {tr('Or bring your own key')}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
    </>
  )
}
