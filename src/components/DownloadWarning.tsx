import { Download } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUI } from '@/store/useUI'
import { num, tr } from '@/i18n'

/** Weak phone mode: says how many MB a download is before it starts. */
export function DownloadWarning() {
  const ask = useUI((s) => s.downloadAsk)
  const answer = useUI((s) => s.answerDownload)
  return (
    <Modal open={!!ask} onClose={() => answer(false)} title={tr('Big download')}>
      {ask && (
        <div className="space-y-4" data-testid="download-warning">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sun/15 text-sun">
              <Download className="h-5 w-5" />
            </span>
            <p className="text-sm leading-relaxed text-main">
              {tr('This will download about {mb} MB ({what}). It uses your mobile data if you are not on Wi-Fi.', {
                mb: num(ask.mb),
                what: ask.what,
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => answer(true)} data-testid="download-ok">
              {tr('Download')}
            </Button>
            <Button className="flex-1" variant="secondary" onClick={() => answer(false)} data-testid="download-cancel">
              {tr('Not now')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
