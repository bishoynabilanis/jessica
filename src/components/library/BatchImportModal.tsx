import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Check, FileText, Loader2 } from 'lucide-react'
import type { Book } from '@/types'
import { useApp } from '@/store/useApp'
import { Modal } from '@/components/ui/Modal'
import {
  detectFromFilename,
  importPdfFile,
  matchCatalog,
  titleFromFile,
  type ImportMeta,
} from '@/lib/importBook'
import { tr } from '@/i18n'

type Entry = { name: string; status: 'pending' | 'working' | 'done' | 'skipped' | 'error'; message?: string }

export function BatchImportModal({
  files,
  onClose,
  onDone,
}: {
  files: File[] | null
  onClose: () => void
  onDone?: (books: Book[]) => void
}) {
  const addCustomBook = useApp((s) => s.addCustomBook)
  const defaultGrade = useApp((s) => s.settings.gradeLevel)
  const [entries, setEntries] = useState<Entry[]>([])
  const [progress, setProgress] = useState({ page: 0, total: 0 })
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (!files?.length || started.current) return
    started.current = true
    setRunning(true)
    setEntries(files.map((file) => ({ name: file.name, status: 'pending' })))

    const run = async () => {
      const added: Book[] = []
      const existing = new Set(useApp.getState().customBooks.map((b) => b.catalogId).filter(Boolean))
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const detected = detectFromFilename(file.name)
        const catalog = matchCatalog(detected)
        const meta: ImportMeta = {
          title: catalog?.title || titleFromFile(file.name),
          subject: catalog?.subject || detected.subject || 'English',
          term: catalog?.term || detected.term,
          grade: catalog?.grade || detected.grade || defaultGrade,
          catalog,
        }
        if (catalog && existing.has(catalog.id)) {
          setEntries((list) =>
            list.map((e, index) =>
              index === i ? { ...e, status: 'skipped', message: tr('Already in your library') } : e,
            ),
          )
          continue
        }
        setEntries((list) => list.map((e, index) => (index === i ? { ...e, status: 'working' } : e)))
        setProgress({ page: 0, total: 0 })
        try {
          const book = await importPdfFile(file, meta, (page, total) => setProgress({ page, total }))
          addCustomBook(book)
          if (book.catalogId) existing.add(book.catalogId)
          added.push(book)
          setEntries((list) => list.map((e, index) => (index === i ? { ...e, status: 'done' } : e)))
        } catch (err) {
          setEntries((list) =>
            list.map((e, index) =>
              index === i
                ? { ...e, status: 'error', message: err instanceof Error ? err.message : tr('Could not read this PDF.') }
                : e,
            ),
          )
        }
      }
      setRunning(false)
      setFinished(true)
      onDone?.(added)
    }

    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

  const done = entries.filter((e) => e.status === 'done').length
  const errors = entries.filter((e) => e.status === 'error').length
  const skipped = entries.filter((e) => e.status === 'skipped').length
  const settled = entries.filter((e) => e.status === 'done' || e.status === 'error' || e.status === 'skipped').length
  const percent = entries.length ? Math.round((settled / entries.length) * 100) : 0
  const pagePercent = progress.total ? Math.round((progress.page / progress.total) * 100) : 0

  return (
    <Modal
      open={!!files?.length}
      onClose={() => (running ? undefined : onClose())}
      title={tr('Importing your books')}
      subtitle={tr('Each PDF is indexed locally, one page at a time.')}
      icon={<FileText className="h-4.5 w-4.5" />}
      size="md"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-bold text-main">
          <span>
            {done} / {entries.length} {tr('books imported')}
          </span>
          <span className="text-muted">{percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-aurora-400 transition-all" style={{ width: `${Math.max(3, percent)}%` }} />
        </div>

        <div className="max-h-64 space-y-1.5 overflow-y-auto">
          {entries.map((entry, index) => (
            <div key={`${entry.name}-${index}`} className="flex items-center gap-2 rounded-xl border border-line bg-card-2 px-2.5 py-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/5">
                {entry.status === 'done' ? (
                  <Check className="h-3.5 w-3.5 text-aurora-400" />
                ) : entry.status === 'error' ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-coral" />
                ) : entry.status === 'working' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-aurora-300" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-muted-2" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-main" dir="ltr">
                  {entry.name}
                </p>
                {entry.status === 'working' && progress.total > 0 && (
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-aurora-400" style={{ width: `${Math.max(3, pagePercent)}%` }} />
                  </div>
                )}
                {entry.message && <p className="truncate text-[9px] text-coral">{entry.message}</p>}
              </div>
              {entry.status === 'working' && progress.total > 0 && (
                <span className="shrink-0 text-[9px] font-bold text-muted">
                  {progress.page}/{progress.total}
                </span>
              )}
            </div>
          ))}
        </div>

        {finished && (
          <p className="rounded-xl border border-line bg-card-2 p-2.5 text-[10px] leading-relaxed text-muted">
            {errors
              ? tr('{n} books could not be read. You can try them again individually.', { n: errors })
              : skipped
                ? tr('{n} books were already in your library and were skipped.', { n: skipped })
                : tr('All books are indexed and ready. Open them from My library.')}
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            disabled={running}
            className="btn btn-primary h-9 px-4 text-[11px] disabled:opacity-40"
          >
            {running ? tr('Please wait…') : tr('Done')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
