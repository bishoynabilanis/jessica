import { useEffect, useState } from 'react'
import { FileText, Loader2, Upload } from 'lucide-react'
import type { Book, Subject } from '@/types'
import type { OfficialBook } from '@/data/officialBooks'
import { useApp } from '@/store/useApp'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  importPdfFile,
  detectFromFilename,
  matchCatalog,
  titleFromFile,
  SUBJECTS,
} from '@/lib/importBook'
import { tr } from '@/i18n'
import { gradeLabel } from '@/data/officialBooks'
import { gradesForStage } from '@/lib/stage'
import type { GradeLevel } from '@/types'

const MAX_BYTES = 150 * 1024 * 1024

export function AddBookModal({
  file,
  catalog,
  onClose,
  onAdded,
}: {
  file: File | null
  catalog?: OfficialBook | null
  onClose: () => void
  onAdded?: (book: Book) => void
}) {
  const addCustomBook = useApp((s) => s.addCustomBook)
  const defaultGrade = useApp((s) => s.settings.gradeLevel)
  const customBooks = useApp((s) => s.customBooks)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState<Subject>('English')
  const [term, setTerm] = useState<'Term 1' | 'Term 2'>('Term 1')
  const [grade, setGrade] = useState<GradeLevel>(defaultGrade)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState({ page: 0, total: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!file) return
    const detected = detectFromFilename(file.name)
    const matched = matchCatalog(detected)
    setTitle(catalog ? catalog.title : matched?.title || titleFromFile(file.name))
    setSubject(catalog ? catalog.subject : detected.subject || 'English')
    setTerm(catalog ? catalog.term : detected.term || 'Term 1')
    setGrade(catalog ? catalog.grade : detected.grade || defaultGrade)
    setError('')
    setBusy(false)
    setProgress({ page: 0, total: 0 })
  }, [file, catalog, defaultGrade])

  const sizeMb = file ? file.size / (1024 * 1024) : 0
  const percent = progress.total ? Math.round((progress.page / progress.total) * 100) : 0

  const save = async () => {
    if (!file) return
    if (!title.trim()) {
      setError(tr('Give the book a title first.'))
      return
    }
    if (file.size > MAX_BYTES) {
      setError(tr('This PDF is larger than 150 MB. Try a compressed copy.'))
      return
    }

    setBusy(true)
    setError('')
    try {
      const autoCatalog = catalog || matchCatalog({ grade, subject, term }) || null
      if (autoCatalog && customBooks.some((b) => b.catalogId === autoCatalog.id)) {
        setError(tr('This book is already in your library. Delete it first to import a new copy.'))
        return
      }
      const book = await importPdfFile(
        file,
        { title, subject, term, grade, catalog: autoCatalog },
        (page, total) => setProgress({ page, total }),
      )
      addCustomBook(book)
      onAdded?.(book)
      onClose()
    } catch (err) {
      setError(
        err instanceof Error
          ? tr('Could not read this PDF. Make sure it is not password-protected: {message}', { message: err.message })
          : tr('Could not read this PDF.'),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={!!file}
      onClose={() => (busy ? undefined : onClose())}
      title={catalog ? tr('Add official book') : tr('Add your own PDF')}
      subtitle={
        catalog
          ? tr('Import the ministry PDF you downloaded so Jessica can read it locally and answer from its pages.')
          : tr('Upload an official Ministry book from this device. The file never leaves your browser.')
      }
      icon={<Upload className="h-4.5 w-4.5" />}
      size="md"
    >
      <div className="space-y-3">
        {file && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-card-2 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-aurora-400/10 text-aurora-300">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-main" dir="ltr">
                {file.name}
              </p>
              <p className="text-[10px] text-muted">{sizeMb.toFixed(1)} MB</p>
            </div>
          </div>
        )}

        <label className="block">
          <span className="label mb-1 block">{tr('Book title')}</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 90))}
            className="field text-sm"
            placeholder={tr('e.g. Connect Plus 1 — Student Book')}
            disabled={busy}
          />
        </label>

        {catalog ? (
          <div className="flex flex-wrap gap-1.5">
            <span className="chip border-aurora-400/25 text-aurora-200">{tr(gradeLabel(catalog.grade))}</span>
            <span className="chip">{tr(catalog.subject)}</span>
            <span className="chip">{tr(catalog.term)}</span>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            <label className="block">
              <span className="label mb-1 block">{tr('Grade')}</span>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as GradeLevel)}
                className="field text-sm"
                disabled={busy}
              >
                {[...gradesForStage('primary'), ...gradesForStage('prep')].map((value) => (
                  <option key={value} value={value}>
                    {tr(gradeLabel(value))}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label mb-1 block">{tr('Subject')}</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="field text-sm"
                disabled={busy}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {tr(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="label mb-1 block">{tr('Term')}</span>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value as 'Term 1' | 'Term 2')}
                className="field text-sm"
                disabled={busy}
              >
                <option value="Term 1">{tr('Term 1')}</option>
                <option value="Term 2">{tr('Term 2')}</option>
              </select>
            </label>
          </div>
        )}

        <p className="rounded-xl border border-line bg-card-2 p-2.5 text-[10px] leading-relaxed text-muted">
          {tr('Jessica reads and indexes every page on this device, so the tutor can answer from the real book. Big books can take a minute.')}
        </p>

        {busy && (
          <div className="rounded-xl border border-aurora-400/25 bg-aurora-400/5 p-2.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-aurora-200">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" /> {tr('Indexing the book…')}
              </span>
              <span>{progress.total ? `${progress.page}/${progress.total}` : ''}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-aurora-400 transition-all" style={{ width: `${Math.max(4, percent)}%` }} />
            </div>
          </div>
        )}

        {error && <p className="text-[11px] font-semibold text-coral">{error}</p>}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            {tr('Cancel')}
          </Button>
          <Button size="sm" onClick={save} disabled={busy || !file}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {busy ? tr('Indexing…') : tr('Add to library')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
