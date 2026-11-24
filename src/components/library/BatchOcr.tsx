import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Pause, Play, ScanText } from 'lucide-react'
import type { Book, ChapterText } from '@/types'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { chapterCacheGet, chapterCacheSet, getPdfBytes } from '@/lib/db'
import { createPageRecognizer, type PageRecognizer } from '@/lib/ocr'
import { pagesToScan, runBatchOcr, withPageText, type PageOutcome } from '@/lib/batchOcr'
import { pageRanges } from '@/lib/offlineReady'
import { useUI } from '@/store/useUI'
import { num, tr } from '@/i18n'

/** The small button that opens the batch scan. */
export function BatchOcrButton({ book, onSaved, className }: { book: Book; onSaved?: () => void; className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        className={className}
        onClick={() => setOpen(true)}
        data-testid="batch-ocr-open"
        title={tr('Turn picture pages into text')}
      >
        <ScanText className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{tr('Scan pages')}</span>
      </Button>
      <BatchOcrModal book={book} open={open} onClose={() => setOpen(false)} onSaved={onSaved} />
    </>
  )
}

type Phase = 'idle' | 'running' | 'pausing' | 'paused' | 'finished'

export function BatchOcrModal({
  book,
  open,
  onClose,
  onSaved,
  recognizerFactory = createPageRecognizer,
}: {
  book: Book
  open: boolean
  onClose: () => void
  onSaved?: () => void
  recognizerFactory?: (url: string, language?: string) => Promise<PageRecognizer>
}) {
  const pushToast = useUI((s) => s.pushToast)
  const [chapter, setChapter] = useState<ChapterText | null | undefined>(undefined)
  const [hasFile, setHasFile] = useState(true)
  const [from, setFrom] = useState(1)
  const [to, setTo] = useState(book.pageCount)
  const [phase, setPhase] = useState<Phase>('idle')
  const [current, setCurrent] = useState(0)
  const [doneCount, setDoneCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [outcomes, setOutcomes] = useState<PageOutcome[]>([])
  const [message, setMessage] = useState('')
  const pauseRef = useRef(false)
  const chapterRef = useRef<ChapterText | null>(null)

  useEffect(() => {
    if (!open) return
    let alive = true
    chapterCacheGet(book.id).then((value) => {
      if (!alive) return
      chapterRef.current = value || null
      setChapter(value || null)
    })
    getPdfBytes(book.id).then((bytes) => alive && setHasFile(!!bytes))
    return () => {
      alive = false
    }
  }, [open, book.id])

  const lo = Math.max(1, Math.min(from, to))
  const hi = Math.min(book.pageCount, Math.max(from, to))
  const todo = pagesToScan(chapter, lo, hi)
  const busy = phase === 'running' || phase === 'pausing'

  const start = async (pages: number[]) => {
    if (!pages.length || busy) return
    const bytes = await getPdfBytes(book.id)
    if (!bytes) {
      setHasFile(false)
      return
    }
    pauseRef.current = false
    setPhase('running')
    setMessage('')
    setTotal(pages.length)
    setDoneCount(0)
    setOutcomes([])
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }))
    let recognizer: PageRecognizer | null = null
    try {
      recognizer = await recognizerFactory(url, 'ara+eng')
      const result = await runBatchOcr({
        pages,
        recognize: (page) => recognizer!.recognize(page),
        save: async (page, text) => {
          const base = chapterRef.current
          if (!base) throw new Error('no chapter')
          const updated = withPageText(base, page, text)
          await chapterCacheSet(updated)
          chapterRef.current = updated
          setChapter(updated)
        },
        shouldPause: () => pauseRef.current,
        onStart: setCurrent,
        onPage: (outcome, index) => {
          setDoneCount(index)
          setOutcomes((prev) => [...prev, outcome])
        },
      })
      setPhase(result.paused ? 'paused' : 'finished')
      const saved = result.outcomes.filter((o) => o.status === 'done').length
      if (saved) onSaved?.()
      if (!result.paused && saved) pushToast({ title: tr('Text saved for {n} pages', { n: num(saved) }), type: 'success' })
    } catch {
      setMessage(tr('The scan engine could not start. It needs internet the first time. Try again.'))
      setPhase('idle')
    } finally {
      await recognizer?.close().catch(() => undefined)
      URL.revokeObjectURL(url)
    }
  }

  const failed = outcomes.filter((o) => o.status === 'failed').map((o) => o.page)
  const blank = outcomes.filter((o) => o.status === 'blank').map((o) => o.page)
  const savedPages = outcomes.filter((o) => o.status === 'done').map((o) => o.page)

  return (
    <Modal
      open={open}
      onClose={() => (busy ? undefined : onClose())}
      title={tr('Turn picture pages into text')}
      subtitle={book.title}
      icon={<ScanText className="h-5 w-5" />}
      size="md"
    >
      <div data-testid="batch-ocr" data-phase={phase}>
        {chapter === undefined ? null : chapter === null ? (
          <p className="text-[12px] font-bold text-muted" dir="auto">
            {tr('Open the book once so Jessica can read its pages, then come back.')}
          </p>
        ) : !hasFile ? (
          <p className="text-[12px] font-bold text-coral" dir="auto">
            {tr('The PDF file is not saved on this device. Add it again from the Library.')}
          </p>
        ) : (
          <>
            <p className="text-[11px] leading-relaxed text-muted" dir="auto">
              {tr('Pick the pages. Jessica reads each picture page and saves its text. You can pause any time and nothing is lost.')}
            </p>
            <div className="mt-3 flex items-end gap-3">
              <label className="text-[11px] font-bold text-muted">
                {tr('From page')}
                <input
                  type="number"
                  min={1}
                  max={book.pageCount}
                  value={from}
                  disabled={busy}
                  onChange={(e) => setFrom(Number(e.target.value) || 1)}
                  className="mt-1 block w-24 rounded-xl border border-line bg-card-2 px-3 py-2 text-sm font-bold text-main"
                  data-testid="batch-ocr-from"
                />
              </label>
              <label className="text-[11px] font-bold text-muted">
                {tr('To page')}
                <input
                  type="number"
                  min={1}
                  max={book.pageCount}
                  value={to}
                  disabled={busy}
                  onChange={(e) => setTo(Number(e.target.value) || 1)}
                  className="mt-1 block w-24 rounded-xl border border-line bg-card-2 px-3 py-2 text-sm font-bold text-main"
                  data-testid="batch-ocr-to"
                />
              </label>
            </div>
            <p className="mt-3 text-[12px] font-extrabold text-main" data-testid="batch-ocr-todo" dir="auto">
              {todo.length
                ? tr('{n} pages in this range have no text yet: {pages}', { n: num(todo.length), pages: pageRanges(todo).join(", ") })
                : tr('Every page in this range already has text.')}
            </p>

            {(busy || phase === 'paused') && (
              <div className="mt-3" data-testid="batch-ocr-progress">
                <ProgressBar value={doneCount} max={Math.max(1, total)} />
                <p className="mt-1.5 text-[11px] font-bold text-muted" dir="auto">
                  {phase === 'paused'
                    ? tr('Paused. {done} of {total} pages done.', { done: num(doneCount), total: num(total) })
                    : tr('Reading page {page} ({done} of {total})', { page: num(current), done: num(doneCount), total: num(total) })}
                </p>
              </div>
            )}

            {message && (
              <p role="alert" className="mt-3 text-[11px] font-bold text-coral" dir="auto">
                {message}
              </p>
            )}

            {(phase === 'finished' || phase === 'paused') && outcomes.length > 0 && (
              <ul className="mt-3 space-y-2" data-testid="batch-ocr-review">
                {savedPages.length > 0 && (
                  <li className="flex items-start gap-2 rounded-2xl border border-line bg-card-2 px-3 py-2 text-[12px] font-extrabold text-main" dir="auto">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-aurora-300" aria-hidden />
                    {tr('Text saved for pages {pages}', { pages: pageRanges(savedPages).join(", ") })}
                  </li>
                )}
                {blank.length > 0 && (
                  <li className="flex items-start gap-2 rounded-2xl border border-line bg-card-2 px-3 py-2 text-[12px] font-extrabold text-main" dir="auto">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-sun" aria-hidden />
                    {tr('No readable text on pages {pages}. They may be drawings or blank.', { pages: pageRanges(blank).join(", ") })}
                  </li>
                )}
                {failed.length > 0 && (
                  <li className="flex items-start gap-2 rounded-2xl border border-line bg-card-2 px-3 py-2 text-[12px] font-extrabold text-main" data-testid="batch-ocr-failed" dir="auto">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-coral" aria-hidden />
                    {tr('Could not scan pages {pages}. Check your connection and try again.', { pages: pageRanges(failed).join(", ") })}
                  </li>
                )}
              </ul>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {!busy && phase !== 'paused' && (
                <Button size="sm" onClick={() => start(todo)} disabled={!todo.length} data-testid="batch-ocr-start">
                  <Play className="h-3.5 w-3.5" /> {tr('Start scanning')}
                </Button>
              )}
              {phase === 'paused' && (
                <Button size="sm" onClick={() => start(todo)} disabled={!todo.length} data-testid="batch-ocr-resume">
                  <Play className="h-3.5 w-3.5" /> {tr('Continue')}
                </Button>
              )}
              {busy && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={phase === 'pausing'}
                  onClick={() => {
                    pauseRef.current = true
                    setPhase('pausing')
                  }}
                  data-testid="batch-ocr-pause"
                >
                  <Pause className="h-3.5 w-3.5" /> {phase === 'pausing' ? tr('Pausing after this page…') : tr('Pause')}
                </Button>
              )}
              {!busy && failed.length > 0 && (
                <Button size="sm" variant="secondary" onClick={() => start(failed)} data-testid="batch-ocr-retry">
                  {tr('Try the failed pages again')}
                </Button>
              )}
              {!busy && (
                <Button size="sm" variant="ghost" onClick={onClose}>
                  {tr('Close')}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
