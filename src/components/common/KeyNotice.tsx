import { Cpu, Download, KeyRound, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '@/store/useApp'
import { useSpeech } from '@/lib/speech'
import { proxyConfigured } from '@/lib/ai/config'
import { notifyAiNeed } from '@/lib/ai/setup'
import { offlineReady } from '@/lib/ai/offline'
import { useOfflineModel } from '@/lib/ai/useOfflineModel'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { num, tr } from '@/i18n'

export function KeyNotice({ compact }: { compact?: boolean }) {
  const apiKey = useApp((s) => s.apiKey)
  // Hooks run before any early return: the banner disappears once a key exists.
  const model = useOfflineModel()
  if (apiKey.trim()) return null

  const ready = model.ready
  const support = model.support
  const trial = proxyConfigured()

  // Nothing to sell here: everything the device can do for free is already on.
  if (ready || trial) {
    return (
      <div className={cn('flex items-center gap-2.5 rounded-2xl border border-aurora-400/25 bg-aurora-400/10 p-3', compact && 'p-2.5')}>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-aurora-400/15 text-aurora-300">
          <Cpu className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-bold text-main">{tr('AI is ready on this device')}</p>
          <p className="text-[10px] leading-relaxed text-muted">
            {ready
              ? tr('The offline model is loaded, so chat and explanations work with no internet and no key.')
              : tr('You are on the free trial. Add your own key any time for unlimited use.')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2 rounded-2xl border border-sun/25 bg-sun/10 p-3 sm:flex-row sm:items-center sm:justify-between', compact && 'p-2.5')}>
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sun/15 text-sun">
          {support.ok ? <Cpu className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
        </span>
        <div>
          <p className="text-xs font-bold text-main">
            {support.ok ? tr('Turn the AI on — free, no key') : tr('Your AI tutor is one key away')}
          </p>
          <p className="text-[10px] leading-relaxed text-muted">
            {support.ok
              ? tr('Download the offline model once (~1.8 GB) and every AI feature works here without a key or internet.')
              : tr('This device cannot run the offline model, so a free Gemini key is the way in. It stays on your device.')}
          </p>
        </div>
      </div>
      {support.ok ? (
        <Button
          size="sm"
          variant="secondary"
          className="shrink-0 border-sun/30 text-sun"
          loading={model.downloading}
          onClick={() => void model.start()}
          data-testid="key-notice-download"
        >
          <Download className="h-3.5 w-3.5" />
          {model.downloading ? `${num(model.progress)}%` : tr('Download the model')}
        </Button>
      ) : (
        <Link to="/settings">
          <Button size="sm" variant="secondary" className="shrink-0 border-sun/30 text-sun">
            {tr('Add key')} <Sparkles className="h-3.5 w-3.5" />
          </Button>
        </Link>
      )}
    </div>
  )
}

export function useRequireKey() {
  const apiKey = useApp((s) => s.apiKey)
  return () => {
    // A key is no longer the only door: the local model and the free trial count too.
    if (apiKey.trim() || offlineReady() || proxyConfigured()) return true
    notifyAiNeed('setup')
    return false
  }
}

export function VoiceButton({
  text,
  lang = 'en',
  className,
  label,
}: {
  text: string
  lang?: string
  className?: string
  label?: string
}) {
  const { speak, stop, speaking, supported } = useSpeech()
  if (!supported) return null
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        if (speaking) stop()
        else speak(text, lang)
      }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-semibold text-muted transition hover:bg-white/5 hover:text-aurora-300',
        className,
      )}
      aria-label={speaking ? tr('Stop reading') : tr('Read aloud')}
      title={label || tr(tr("Read aloud"))}
    >
      {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      {label && <span>{speaking ? tr('Stop') : label}</span>}
    </button>
  )
}
