import { KeyRound, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { useNavigate } from 'react-router-dom'
import { useSpeech } from '@/lib/speech'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { tr } from '@/i18n'

export function KeyNotice({ compact }: { compact?: boolean }) {
  const apiKey = useApp((s) => s.apiKey)
  if (apiKey) return null
  return (
    <div className={cn('flex flex-col gap-2 rounded-2xl border border-sun/25 bg-sun/10 p-3 sm:flex-row sm:items-center sm:justify-between', compact && 'p-2.5')}>
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sun/15 text-sun">
          <KeyRound className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-bold text-main">{tr('Your AI tutor is one key away')}</p>
          <p className="text-[10px] leading-relaxed text-muted">
            {tr('Add a free Gemini API key to unlock chat, quizzes, vision and more. It stays on your device.')}
          </p>
        </div>
      </div>
      <Link to="/settings">
        <Button size="sm" variant="secondary" className="shrink-0 border-sun/30 text-sun">
          {tr('Add key')} <Sparkles className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  )
}

export function useRequireKey() {
  const apiKey = useApp((s) => s.apiKey)
  const pushToast = useUI((s) => s.pushToast)
  const navigate = useNavigate()
  return () => {
    if (apiKey.trim()) return true
    pushToast({
      title: tr('Add your Gemini API key'),
      description: tr('It is free and takes about a minute. Your key never leaves this browser.'),
      type: 'info',
    })
    navigate('/settings')
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
        speaking ? stop() : speak(text, lang)
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
