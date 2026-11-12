import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Copy, Github, Mail, MessageSquareWarning, Send } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useUI } from '@/store/useUI'
import { useApp } from '@/store/useApp'
import { tr } from '@/i18n'
import { GITHUB_ISSUES, SUPPORT_EMAIL, SUPPORT_INSTAGRAM, SUPPORT_WHATSAPP } from '@/data/support'
import { autoSummary, buildReport, lastCrash } from '@/lib/diagnostics'

type Kind = 'suggestion' | 'complaint' | 'bug'

const KINDS: { id: Kind; label: string; emoji: string }[] = [
  { id: 'suggestion', label: 'Suggestion', emoji: '💡' },
  { id: 'complaint', label: 'Complaint', emoji: '📣' },
  { id: 'bug', label: 'Bug report', emoji: '🐞' },
]

export function Feedback() {
  const settings = useApp((s) => s.settings)
  const name = useApp((s) => s.name)
  const pushToast = useUI((s) => s.pushToast)
  const [kind, setKind] = useState<Kind>('suggestion')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)
  const [params] = useSearchParams()
  const [auto, setAuto] = useState(false)
  const [crash, setCrash] = useState('')

  const label = KINDS.find((item) => item.id === kind)?.label || 'Suggestion'

  useEffect(() => {
    const requested = params.get('kind')
    const isAuto = params.get('auto') === '1'
    if (requested === 'bug' || requested === 'complaint' || requested === 'suggestion') setKind(requested)
    if (isAuto) {
      setAuto(true)
      setMessage((current) => current || autoSummary())
      setCrash(lastCrash())
    }
  }, [params])

  const report = () => buildReport({ kind: label, message, contact, name })

  const mailto = () => {
    if (!SUPPORT_EMAIL) return ''
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Jessica — ${label}`)}&body=${encodeURIComponent(report())}`
  }

  const github = () =>
    `${GITHUB_ISSUES}?title=${encodeURIComponent(`[${label}] Jessica feedback`)}&body=${encodeURIComponent(report())}`

  const instagram = () => (SUPPORT_INSTAGRAM ? `https://ig.me/m/${SUPPORT_INSTAGRAM}` : '')

  const whatsapp = () =>
    SUPPORT_WHATSAPP
      ? `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(report())}`
      : `https://wa.me/?text=${encodeURIComponent(report())}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report())
      setCopied(true)
      setSent(true)
      window.setTimeout(() => setCopied(false), 1800)
      pushToast({ title: tr('Report copied'), description: tr('Paste it in any message or email.'), type: 'success' })
    } catch {
      pushToast({ title: tr('Could not copy'), type: 'error' })
    }
  }

  const submit = () => {
    if (!message.trim()) {
      pushToast({ title: tr('Write your message first'), type: 'info' })
      return
    }
    if (SUPPORT_WHATSAPP) {
      window.open(whatsapp(), '_blank', 'noreferrer')
      setSent(true)
      return
    }
    const mail = mailto()
    if (mail) {
      window.location.href = mail
      setSent(true)
      return
    }
    window.open(github(), '_blank', 'noreferrer')
    setSent(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('We read everything')}
        title={tr('Suggestions & complaints')}
        subtitle={tr('Tell us what to improve, what broke, or what you wish Jessica did.')}
        icon={<MessageSquareWarning className="h-5 w-5" />}
      />

      <Card className="space-y-3 p-4 sm:p-5">
        <div>
          <p className="label mb-1.5">{tr('Type')}</p>
          <div className="flex flex-wrap gap-1.5">
            {KINDS.map((item) => (
              <button
                key={item.id}
                onClick={() => setKind(item.id)}
                className={`rounded-xl border px-3 py-2 text-[11px] font-bold transition ${
                  kind === item.id
                    ? 'border-aurora-400/50 bg-aurora-400/15 text-aurora-200'
                    : 'border-line bg-card-2 text-muted hover:text-main'
                }`}
              >
                {item.emoji} {tr(item.label)}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="label mb-1 block">{tr('Your message')}</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, 1500))}
            placeholder={tr('Describe the idea, the problem or the bug with as much detail as you can.')}
            className="field min-h-32 text-sm"
          />
          <span className="mt-1 block text-end text-[9px] text-muted-2">{message.length}/1500</span>
        </label>

        <label className="block">
          <span className="label mb-1 block">{tr('Email or WhatsApp (optional)')}</span>
          <input
            value={contact}
            onChange={(event) => setContact(event.target.value.slice(0, 120))}
            placeholder={tr('So we can reply to you')}
            className="field text-sm"
            dir="ltr"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button onClick={submit} disabled={!message.trim()}>
            <Send className="h-3.5 w-3.5" /> {tr('Send')}
          </Button>
          <Button variant="secondary" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? tr('Copied') : tr('Copy report')}
          </Button>
          <a href={whatsapp()} target="_blank" rel="noreferrer">
            <Button variant={SUPPORT_WHATSAPP ? 'secondary' : 'ghost'}>
              <MessageSquareWarning className="h-3.5 w-3.5" /> {tr('Send on WhatsApp')}
            </Button>
          </a>
          {SUPPORT_INSTAGRAM && (
            <a href={instagram()} target="_blank" rel="noreferrer">
              <Button variant="ghost">
                <MessageSquareWarning className="h-3.5 w-3.5" /> {tr('Send on Instagram')}
              </Button>
            </a>
          )}
          <a href={github()} target="_blank" rel="noreferrer">
            <Button variant="ghost">
              <Github className="h-3.5 w-3.5" /> {tr('Open on GitHub')}
            </Button>
          </a>
        </div>

        {(SUPPORT_EMAIL || SUPPORT_WHATSAPP) && (
          <p className="text-[9px] text-muted-2">
            {SUPPORT_WHATSAPP
              ? tr('Messages open in WhatsApp so you can send them in one tap.')
              : tr('Messages go to {email}.', { email: SUPPORT_EMAIL })}
          </p>
        )}

        {auto && (
          <div className="rounded-xl border border-aurora-400/25 bg-aurora-400/5 p-3 text-[10px] leading-relaxed text-aurora-200">
            {tr('We prepared the report for you — just review it and send. No need to explain the problem.')}
            {crash && <span className="mt-1 block text-[9px] text-muted-2" dir="ltr">{crash.slice(0, 140)}</span>}
          </div>
        )}

        {sent && (
          <div className="rounded-xl border border-aurora-400/25 bg-aurora-400/10 p-3 text-[11px] leading-relaxed text-aurora-200">
            {tr('Thanks! Your report is ready to send. We read every message and use it to improve Jessica.')}
          </div>
        )}
      </Card>

      <Card className="flex items-start gap-3 p-4">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-violet-glow" />
        <p className="text-[10px] leading-relaxed text-muted">
          {tr('No account needed. The report includes only your message, optional contact and basic app info (language, grade, school type, device) so we can reproduce the issue.')}
        </p>
      </Card>
    </div>
  )
}
