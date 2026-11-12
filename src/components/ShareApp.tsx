import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Copy, Mail, MessageCircle, Send, Share2, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { tr } from '@/i18n'

const APP_URL = 'https://bishoynabilanis.github.io/jessica/'
const SHORT_URL = 'https://is.gd/jessicaapp'

export function shareMessage() {
  return tr(
    'Try Jessica — a free study app for Egyptian students: Ministry books, an AI tutor, exams and flashcards. Free, offline and no account needed.',
  )
}

export function ShareAppModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [qr, setQr] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    QRCode.toDataURL(SHORT_URL, {
      width: 560,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#0b1020', light: '#ffffff' },
    })
      .then(setQr)
      .catch(() => undefined)
  }, [open])

  const message = `${shareMessage()}\n${SHORT_URL}`
  const encoded = encodeURIComponent(message)
  const encodedUrl = encodeURIComponent(SHORT_URL)

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  const nativeShare = async () => {
    const nav = navigator as Navigator & { share?: (data: { title?: string; text?: string; url?: string }) => Promise<void> }
    if (nav.share) {
      try {
        await nav.share({ title: 'Jessica', text: shareMessage(), url: SHORT_URL })
        return
      } catch {
        /* cancelled */
      }
    }
    void copy(message)
  }

  const targets = [
    {
      label: 'WhatsApp',
      icon: <MessageCircle className="h-4 w-4" />,
      href: `https://wa.me/?text=${encoded}`,
      tint: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    },
    {
      label: 'Telegram',
      icon: <Send className="h-4 w-4" />,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareMessage())}`,
      tint: 'border-sky/30 bg-sky/10 text-sky',
    },
    {
      label: 'Facebook',
      icon: <Share2 className="h-4 w-4" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      tint: 'border-blue-400/30 bg-blue-400/10 text-blue-300',
    },
    {
      label: 'X',
      icon: <X className="h-4 w-4" />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(shareMessage())}`,
      tint: 'border-line bg-white/5 text-main',
    },
    {
      label: tr('Email'),
      icon: <Mail className="h-4 w-4" />,
      href: `mailto:?subject=${encodeURIComponent('Jessica')}&body=${encoded}`,
      tint: 'border-violet-neon/30 bg-violet-neon/10 text-violet-glow',
    },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr('Share Jessica')}
      subtitle={tr('Send the app to a friend, a classmate or a parent in one tap.')}
      icon={<Share2 className="h-4 w-4" />}
      size="md"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-3xl bg-white p-3 shadow-lg">
          {qr ? (
            <img src={qr} alt={tr('QR code')} className="h-44 w-44" />
          ) : (
            <div className="grid h-44 w-44 place-items-center text-[10px] font-bold text-slate-400">{tr('Generating…')}</div>
          )}
        </div>
        <p className="text-center text-[11px] leading-relaxed text-muted">
          {tr('Point the camera at the code, or send the short link below.')}
        </p>

        <div className="flex w-full items-center gap-2 rounded-2xl border border-line bg-card-2 p-2">
          <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-main" dir="ltr">
            {SHORT_URL}
          </span>
          <Button size="sm" variant="secondary" onClick={() => copy(SHORT_URL)}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? tr('Copied') : tr('Copy')}
          </Button>
        </div>

        <div className="grid w-full grid-cols-2 gap-1.5">
          {targets.map((target) => (
            <a
              key={target.label}
              href={target.href}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-bold ${target.tint}`}
            >
              {target.icon}
              {target.label}
            </a>
          ))}
          <button
            onClick={nativeShare}
            className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl border border-aurora-400/30 bg-aurora-400/10 px-2.5 py-2 text-[11px] font-bold text-aurora-200"
          >
            <Share2 className="h-3.5 w-3.5" /> {tr('More sharing options')}
          </button>
        </div>

        <p className="text-center text-[9px] text-muted-2">{APP_URL.replace('https://', '')}</p>
      </div>
    </Modal>
  )
}
