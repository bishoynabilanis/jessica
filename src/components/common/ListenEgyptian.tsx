import { StopCircle, Wand2 } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { useSpeech } from '@/lib/speech'
import { isArabicText } from '@/lib/speechText'
import { Button } from '@/components/ui/Button'
import { tr } from '@/i18n'

/**
 * One tap for the Egyptian voice, right where the text is.
 *
 * The device voice is the default because it is free and offline, but a laptop
 * that only ships `ar-001` reads MSA. This button asks Gemini for the Egyptian
 * voice for this passage only — it does not change the saved setting, so it
 * cannot quietly spend quota on every read-aloud afterwards.
 *
 * It renders nothing when the text is not Arabic or the device has no Gemini
 * key, so it never becomes a dead button.
 */
export function ListenEgyptian({
  text,
  lang = 'ar',
  rate,
  className,
}: {
  text: string
  lang?: string
  rate?: number
  className?: string
}) {
  const { speak, stop, speaking } = useSpeech()
  const settings = useApp((s) => s.settings)
  const aiKeys = useApp((s) => s.aiKeys)
  const apiKey = useApp((s) => s.apiKey)

  const ready = Boolean((aiKeys.gemini || (settings.aiProvider === 'gemini' ? apiKey : '')).trim())
  if (!ready || !isArabicText(text)) return null

  return (
    <Button
      size="sm"
      variant="secondary"
      className={className}
      data-testid="listen-egyptian"
      onClick={() => (speaking ? stop() : speak(text, lang, { engine: 'cloud', rate }))}
    >
      {speaking ? <StopCircle className="h-3.5 w-3.5" /> : <Wand2 className="h-3.5 w-3.5" />}
      {speaking ? tr('Stop') : tr('Listen in Egyptian')}
    </Button>
  )
}
