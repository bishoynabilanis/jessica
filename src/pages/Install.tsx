import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, Download, Laptop, Share, Smartphone, Sparkles, Tablet } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useInstallPrompt } from '@/hooks/usePlatform'
import { deviceKind, isStandalone, type DeviceKind } from '@/lib/platform'
import { SHORT_URL } from '@/data/support'
import { tr } from '@/i18n'
import QRCode from 'qrcode'

type Step = { title: string; hint?: string }

const STEPS: Record<DeviceKind, Step[]> = {
  ios: [
    { title: 'Open Jessica in Safari', hint: 'On iPhone and iPad the install option only appears in Safari.' },
    { title: 'Tap the Share button', hint: 'The square with an arrow, at the bottom or top of the screen.' },
    { title: 'Choose “Add to Home Screen”', hint: 'Scroll the share sheet if you do not see it.' },
    { title: 'Tap “Add”', hint: 'The Jessica icon appears on your home screen.' },
  ],
  android: [
    { title: 'Open Jessica in Chrome', hint: 'Samsung Internet works too: menu → Add page to → Home screen.' },
    { title: 'Tap the ⋮ menu', hint: 'Top-right corner of the browser.' },
    { title: 'Choose “Install app”', hint: 'Or “Add to Home screen” on older versions.' },
    { title: 'Confirm', hint: 'Jessica opens like a normal app and works offline.' },
  ],
  desktop: [
    { title: 'Open Jessica in Chrome or Edge', hint: 'The install icon appears in the address bar.' },
    { title: 'Click the install icon', hint: 'A small screen icon at the right side of the URL bar.' },
    { title: 'Click “Install”', hint: 'Jessica gets its own window and desktop shortcut.' },
    { title: 'Done', hint: 'You can also use the menu ⋮ → Cast, save and share → Install.' },
  ],
}

export function Install() {
  const [device, setDevice] = useState<DeviceKind>('desktop')
  const [qr, setQr] = useState('')
  const [copied, setCopied] = useState(false)
  const { canInstall, installed, install } = useInstallPrompt()
  const standalone = isStandalone()

  useEffect(() => {
    setDevice(deviceKind())
    QRCode.toDataURL(SHORT_URL, { width: 420, margin: 2, color: { dark: '#0b1020', light: '#ffffff' } })
      .then(setQr)
      .catch(() => undefined)
  }, [])

  const tabs: { id: DeviceKind; label: string; icon: React.ReactNode }[] = [
    { id: 'ios', label: 'iPhone / iPad', icon: <Tablet className="h-3.5 w-3.5" /> },
    { id: 'android', label: 'Android', icon: <Smartphone className="h-3.5 w-3.5" /> },
    { id: 'desktop', label: 'Computer', icon: <Laptop className="h-3.5 w-3.5" /> },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Install Jessica')}
        title={tr('Put Jessica on your device')}
        subtitle={tr('One tap on the home screen, works offline, and updates itself. No app store needed.')}
        icon={<Download className="h-5 w-5" />}
      />

      {(installed || standalone) && (
        <Card className="flex items-center gap-3 border-aurora-400/30 bg-aurora-400/10 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-aurora-400/15 text-aurora-300">
            <Check className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-main">{tr('Jessica is installed on this device')}</p>
            <p className="text-[10px] text-muted">{tr('Open it from your home screen any time — it works without internet after the first load.')}</p>
          </div>
        </Card>
      )}

      {canInstall && !installed && (
        <Button className="w-full" onClick={() => install()}>
          <Download className="h-4 w-4" /> {tr('Install now')}
        </Button>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setDevice(tab.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
              device === tab.id
                ? 'border-aurora-400/50 bg-aurora-400/15 text-aurora-200'
                : 'border-line bg-card-2 text-muted hover:text-main'
            }`}
          >
            {tab.icon}
            {tr(tab.label)}
          </button>
        ))}
      </div>

      <div className="grid gap-2.5">
        {STEPS[device].map((step, index) => (
          <Card key={tr(step.title)} className="flex items-start gap-3 p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-neon to-pink text-[12px] font-black text-white">
              {index + 1}
            </span>
            <div>
              <p className="text-[12px] font-extrabold text-main" dir="auto">{tr(step.title)}</p>
              {step.hint && <p className="mt-0.5 text-[10px] leading-relaxed text-muted" dir="auto">{tr(step.hint)}</p>}
            </div>
          </Card>
        ))}
      </div>

      {device === 'ios' && (
        <Card className="flex items-start gap-3 border-sun/25 bg-sun/5 p-4">
          <Share className="mt-0.5 h-4 w-4 shrink-0 text-sun" />
          <p className="text-[10px] leading-relaxed text-muted">
            {tr('On iPhone and iPad, only Safari can add the app to the home screen. If you opened this link inside Instagram or Facebook, tap “Open in browser” first.')}
          </p>
        </Card>
      )}

      <Card className="flex flex-col items-center gap-3 p-5 text-center">
        <p className="text-[11px] font-extrabold text-main">{tr('On a computer? Scan this with your phone')}</p>
        {qr ? <img src={qr} alt={tr('QR code')} className="h-36 w-36 rounded-xl bg-white p-2" /> : null}
        <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-line bg-card-2 p-2">
          <span className="min-w-0 flex-1 truncate text-[10px] font-bold text-main" dir="ltr">{SHORT_URL}</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(SHORT_URL)
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1600)
              } catch {
                /* ignore */
              }
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? tr('Copied') : tr('Copy')}
          </Button>
        </div>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3 border-aurora-400/20 bg-aurora-400/5 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-aurora-300" />
          <p className="text-[10px] leading-relaxed text-muted">
            {tr('After installing, books, flashcards and saved exams keep working offline. Updates arrive automatically.')}
          </p>
        </div>
        <Link to="/">
          <Button size="sm" variant="secondary">{tr('Back to home')}</Button>
        </Link>
      </Card>
    </div>
  )
}
