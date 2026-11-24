import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, CloudOff, Loader2, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Book } from '@/types'
import { useApp } from '@/store/useApp'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { checkBookReadiness, pageRanges, type Readiness } from '@/lib/offlineReady'
import { requestPersistentStorage } from '@/lib/storage'
import { chapterCacheGet, deleteChapterCache } from '@/lib/db'
import { openChapter } from '@/lib/library'
import { detectUnits } from '@/lib/units'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

/** The small button that opens the check. */
export function OfflineReadyButton({ book, className }: { book: Book; className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        className={className}
        onClick={() => setOpen(true)}
        data-testid="offline-ready-open"
        title={tr('Is this lesson ready without internet?')}
      >
        <CloudOff className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{tr('Offline check')}</span>
      </Button>
      <OfflineReadyModal book={book} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function Row({ ok, warn, title, detail }: { ok: boolean; warn?: boolean; title: string; detail?: string }) {
  const Icon = ok ? CheckCircle2 : warn ? AlertTriangle : XCircle
  return (
    <li className="flex items-start gap-2.5 rounded-2xl border border-line bg-card-2 px-3 py-2.5">
      <Icon
        className={cn('mt-0.5 h-4 w-4 shrink-0', ok ? 'text-aurora-300' : warn ? 'text-sun' : 'text-coral')}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-[12px] font-extrabold text-main" dir="auto">
          {title}
        </p>
        {detail && (
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted" dir="auto">
            {detail}
          </p>
        )}
      </div>
    </li>
  )
}

export function OfflineReadyModal({ book, open, onClose }: { book: Book; open: boolean; onClose: () => void }) {
  const updateBookUnits = useApp((s) => s.updateBookUnits)
  const [result, setResult] = useState<Readiness | null>(null)
  const [busy, setBusy] = useState(false)

  const run = useCallback(async () => {
    setResult(await checkBookReadiness(book))
  }, [book])

  useEffect(() => {
    if (open) run().catch(() => undefined)
  }, [open, run])

  const saveText = async () => {
    setBusy(true)
    try {
      const cached = await chapterCacheGet(book.id)
      if (!cached?.text?.trim()) await deleteChapterCache(book.id)
      const chapter = await openChapter(book)
      if (chapter && !(book.units && book.units.length)) {
        const units = detectUnits(chapter.pages, chapter.pages.length)
        if (units.length) updateBookUnits(book.id, units)
      }
    } catch {
      /* the re-check below shows what is still missing */
    } finally {
      setBusy(false)
      // Units come from the store; wait one tick so the check sees them.
      setTimeout(() => run().catch(() => undefined), 50)
    }
  }

  const keepStorage = async () => {
    await requestPersistentStorage()
    await run()
  }

  const verdict = result
    ? result.state === 'ready'
      ? { text: tr('Ready. This book works without internet.'), tone: 'text-aurora-300', Icon: CheckCircle2 }
      : result.state === 'almost'
        ? { text: tr('Almost ready. Fix the items below before you go offline.'), tone: 'text-sun', Icon: AlertTriangle }
        : { text: tr('Not ready yet. Save the book first.'), tone: 'text-coral', Icon: XCircle }
    : null

  const firstEmpty = result?.emptyInLessons[0]
  const missingLessons = result ? result.units.filter((unit) => !unit.lesson) : []
  const missingExercises = result ? result.units.filter((unit) => unit.lesson && !unit.exercises) : []

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr('Is this lesson ready without internet?')}
      subtitle={book.title}
      icon={<CloudOff className="h-5 w-5" />}
      size="md"
    >
      <div data-testid="offline-ready" data-state={result?.state || 'loading'}>
        {!result && (
          <p className="flex items-center gap-2 text-[12px] text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> {tr('Checking what is saved on this device…')}
          </p>
        )}
        {result && verdict && (
          <>
            <p className={cn('flex items-center gap-2 font-display text-sm font-extrabold', verdict.tone)} data-testid="offline-verdict">
              <verdict.Icon className="h-5 w-5" aria-hidden /> {verdict.text}
            </p>
            <ul className="mt-3 space-y-2">
              <Row
                ok={result.fileSaved}
                title={result.fileSaved ? tr('The book file is saved') : tr('The book file is missing')}
                detail={result.fileSaved ? undefined : tr('Add the PDF again from the Library, then check again.')}
              />
              <Row
                ok={result.textSaved && result.emptyInLessons.length === 0}
                warn={result.textSaved}
                title={
                  result.textSaved
                    ? tr('Text saved for {n} of {m} pages', { n: num(result.pagesWithText), m: num(result.pageCount) })
                    : tr('The text of the pages is not saved')
                }
                detail={
                  result.textSaved
                    ? result.emptyInLessons.length
                      ? tr('Pages {pages} are pictures with no text. Scan them while you have internet.', {
                          pages: pageRanges(result.emptyInLessons).slice(0, 6).join(', '),
                        })
                      : undefined
                    : tr('Save the text now so lessons and search work offline.')
                }
              />
              <Row
                ok={result.units.length > 0 && missingLessons.length === 0}
                warn={result.units.length > 0}
                title={
                  result.units.length
                    ? tr('{n} of {m} lessons are saved', { n: num(result.lessonsReady), m: num(result.units.length) })
                    : tr('No lessons were found in this book')
                }
                detail={
                  missingLessons.length
                    ? tr('Not ready: {names}', { names: missingLessons.slice(0, 3).map((unit) => unit.title).join('، ') })
                    : undefined
                }
              />
              <Row
                ok={result.units.length > 0 && missingExercises.length === 0 && missingLessons.length === 0}
                warn={result.units.length > 0}
                title={
                  result.units.length
                    ? tr('Exercises are ready for {n} of {m} lessons', { n: num(result.exercisesReady), m: num(result.units.length) })
                    : tr('Exercises need lessons first')
                }
                detail={tr('Practice questions are made on your device from the same pages. No internet is needed.')}
              />
              {result.persisted !== null && (
                <Row
                  ok={result.persisted}
                  warn
                  title={result.persisted ? tr('The browser will keep these files') : tr('The browser may delete these files when space runs low')}
                />
              )}
              {result.appCached !== null && (
                <Row
                  ok={result.appCached}
                  warn
                  title={result.appCached ? tr('The app itself is saved for offline use') : tr('Open the app once with internet so it can save itself')}
                />
              )}
            </ul>

            <p className="mt-3 text-[10px] leading-relaxed text-muted-2">
              {tr('The AI tutor and the first scan of a picture page still need internet.')}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {result.fixes.includes('save-text') && (
                <Button size="sm" onClick={saveText} loading={busy} data-testid="offline-save-text">
                  {tr('Save the text now')}
                </Button>
              )}
              {result.fixes.includes('scan-pages') && firstEmpty && (
                <Link to={`/reader/${book.id}?page=${firstEmpty}`} onClick={onClose}>
                  <Button size="sm" variant="secondary">
                    {tr('Go to page {n} to scan it', { n: num(firstEmpty) })}
                  </Button>
                </Link>
              )}
              {result.fixes.includes('keep-storage') && (
                <Button size="sm" variant="secondary" onClick={keepStorage}>
                  {tr('Ask the browser to keep the files')}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => run()}>
                {tr('Check again')}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
