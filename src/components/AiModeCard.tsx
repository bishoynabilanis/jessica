import { useEffect, useState } from 'react'
import { Cloud, Cpu, Download, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Card'
import { useApp } from '@/store/useApp'
import { OFFLINE_MODEL_SIZE_GB, proxyConfigured } from '@/lib/ai/config'
import { useOfflineModel } from '@/lib/ai/useOfflineModel'
import { trialRemaining } from '@/lib/ai/trial'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

/**
 * Settings card that explains the three ways AI can run and lets the user pick:
 * the shared trial, their own key, or the local model on a strong device.
 */
export function AiModeCard() {
  const settings = useApp((s) => s.settings)
  const apiKey = useApp((s) => s.apiKey)
  const updateSettings = useApp((s) => s.updateSettings)
  const model = useOfflineModel()

  const [remaining, setRemaining] = useState(() => trialRemaining())

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(trialRemaining()), 4000)
    return () => window.clearInterval(id)
  }, [])

  const support = model.support
  const ready = model.ready
  const downloading = model.downloading

  const cloudHint = apiKey.trim()
    ? tr('You are using your own key — no daily limit.')
    : proxyConfigured()
      ? tr('{n} free actions left today.', { n: num(remaining) })
      : tr('No key and no trial configured — everything works except AI.')

  return (
    <div className="rounded-2xl border border-line bg-card-2 p-3" data-testid="ai-mode-card">
      <p className="flex items-center gap-1.5 text-[12px] font-extrabold text-main">
        <Cpu className="h-4 w-4 text-aurora-300" /> {tr('AI: cloud or offline?')}
      </p>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <button
          onClick={() => updateSettings({ aiMode: 'cloud' })}
          data-testid="ai-mode-cloud"
          className={cn(
            'rounded-xl border p-2.5 text-start transition',
            settings.aiMode === 'cloud' ? 'border-aurora-400/60 bg-aurora-400/10' : 'border-line bg-white/5 hover:border-aurora-400/40',
          )}
        >
          <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-main">
            <Cloud className="h-3.5 w-3.5" /> {tr('Cloud mode')}
          </span>
          <span className="mt-1 block text-[10px] leading-relaxed text-muted">{cloudHint}</span>
        </button>

        <button
          onClick={() => support.ok && ready && updateSettings({ aiMode: 'offline' })}
          disabled={!support.ok || !ready}
          data-testid="ai-mode-offline"
          className={cn(
            'rounded-xl border p-2.5 text-start transition',
            settings.aiMode === 'offline' ? 'border-violet-neon/60 bg-violet-neon/10' : 'border-line bg-white/5',
            (!support.ok || !ready) && 'cursor-not-allowed opacity-60',
          )}
        >
          <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-main">
            <Cpu className="h-3.5 w-3.5" /> {tr('Offline on your device')}
          </span>
          <span className="mt-1 block text-[10px] leading-relaxed text-muted">
            {ready
              ? tr('Ready — works without internet.')
              : tr('Free and no key needed: one download (~{size} GB).', { size: String(OFFLINE_MODEL_SIZE_GB) })}
          </span>
        </button>
      </div>

      {!support.ok && (
        <p className="mt-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-2.5 py-2 text-[10px] leading-relaxed text-amber-200">
          {tr('Offline AI runs on computers and strong devices only, to keep the browser stable.')}
        </p>
      )}

      {support.ok && (
        <div className="mt-2 space-y-2">
          {downloading ? (
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-muted">
                <span className="truncate">{model.status || tr('Downloading the model…')}</span>
                <span>{num(model.progress)}%</span>
              </div>
              <ProgressBar value={model.progress} height="h-1.5" className="mt-1" />
            </div>
          ) : ready ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-aurora-200">{tr('Model loaded on this device.')}</span>
              <Button size="sm" variant="ghost" onClick={model.remove} data-testid="ai-offline-delete">
                <Trash2 className="h-3.5 w-3.5" /> {tr('Delete the model files to free space')}
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => void model.start()} data-testid="ai-offline-download">
              <Download className="h-3.5 w-3.5" /> {tr('Download the model for offline use')}
            </Button>
          )}
        </div>
      )}

      {support.ok && !ready && !downloading && (
        <p className="mt-2 text-[10px] leading-relaxed text-muted-2">
          {tr('The download happens once; after that the model runs on your graphics card, with no internet and no key.')}
        </p>
      )}

      <p className="mt-2 flex items-center gap-1 text-[9px] text-muted-2">
        {downloading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        {tr('Model: Qwen2.5 3B · ~{size} GB · WebGPU', { size: String(OFFLINE_MODEL_SIZE_GB) })}
      </p>
    </div>
  )
}
