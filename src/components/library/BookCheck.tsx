import { useMemo, useRef, useState } from 'react'
import { AlertTriangle, BadgeCheck, CheckCircle2, ExternalLink, FileUp, XCircle } from 'lucide-react'
import type { Book } from '@/types'
import { gradeLabel } from '@/data/officialBooks'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { checkBook, type Finding } from '@/lib/bookCheck'
import { swapBookFile, swapProblem } from '@/lib/editionSwap'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

function useBookCheck(book: Book) {
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const schoolType = useApp((s) => s.settings.schoolType)
  return useMemo(() => checkBook(book, { gradeLevel, schoolType }), [book, gradeLevel, schoolType])
}

/** Verdict only, for lists. */
export function BookCheckBadge({ book }: { book: Book }) {
  const check = useBookCheck(book)
  if (check.verdict === 'right') return null
  return (
    <span
      className={cn(
        'chip text-[9px]',
        check.verdict === 'wrong' ? 'border-coral/40 bg-coral/10 text-coral' : 'border-sun/30 bg-sun/10 text-sun',
      )}
      data-testid="book-check-badge"
    >
      <AlertTriangle className="h-3 w-3" /> {check.verdict === 'wrong' ? tr('Check this book') : tr('Check the edition')}
    </span>
  )
}

export function BookCheckButton({ book, className }: { book: Book; className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        className={className}
        onClick={() => setOpen(true)}
        data-testid="book-check-open"
        title={tr('Your book and edition')}
      >
        <BadgeCheck className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{tr('Book check')}</span>
      </Button>
      <BookCheckModal book={book} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function message(finding: Finding): { title: string; detail?: string } {
  const v = finding.vars
  switch (finding.id) {
    case 'grade':
      return {
        title: tr('This book is for {book}, but you are in {student}', {
          book: tr(gradeLabel(Number(v.book) as never)),
          student: tr(gradeLabel(Number(v.student) as never)),
        }),
        detail: tr('Change your grade in Settings, or add the book for your grade.'),
      }
    case 'language':
      return {
        title:
          v.school === 'ar'
            ? tr('This book is in English, but your school teaches this subject in Arabic')
            : tr('This book is in Arabic, but your school teaches this subject in English'),
        detail: tr('Pick the version in your school language so the words match your class.'),
      }
    case 'year':
      return {
        title: tr('This is the {have} edition. The Ministry list now has {want}', { have: String(v.have), want: String(v.want) }),
        detail: tr('Download the new file from the Ministry link, then replace it here. Your progress stays.'),
      }
    case 'link':
      return {
        title: tr('The Ministry link for this book has changed since you added it'),
        detail: tr('If your teacher uses the new file, replace it here. Your progress stays.'),
      }
    case 'size':
      return {
        title: tr('Your file is {have} MB, the Ministry file is {want} MB', { have: num(Number(v.have)), want: num(Number(v.want)) }),
        detail: tr('It may be another edition or a compressed copy. Compare it with the Ministry file.'),
      }
    default:
      return {
        title: tr('Jessica cannot compare this book with the Ministry list'),
        detail: tr('Open the Library and add the matching Ministry book to be sure.'),
      }
  }
}

export function BookCheckModal({ book, open, onClose }: { book: Book; open: boolean; onClose: () => void }) {
  const check = useBookCheck(book)
  const addCustomBook = useApp((s) => s.addCustomBook)
  const setBookProgress = useApp((s) => s.setBookProgress)
  const lastPage = useApp((s) => s.bookProgress[book.id]?.lastPage || 1)
  const pushToast = useUI((s) => s.pushToast)
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState({ page: 0, total: 0 })
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ pages: number; kept: number; fresh: number } | null>(null)

  const verdict =
    check.verdict === 'right'
      ? { text: tr('This is the right book and edition.'), tone: 'text-aurora-300', Icon: CheckCircle2 }
      : check.verdict === 'check'
        ? { text: tr('Worth a quick look.'), tone: 'text-sun', Icon: AlertTriangle }
        : { text: tr('This book looks wrong for you.'), tone: 'text-coral', Icon: XCircle }

  const pick = async (file?: File) => {
    if (!file) return
    setError('')
    const problem = swapProblem(book, file)
    if (problem) {
      setError(
        problem === 'not-pdf'
          ? tr('Choose a PDF file.')
          : problem === 'too-big'
            ? tr('This PDF is larger than 150 MB. Try a compressed copy.')
            : problem === 'other-grade'
              ? tr('This file name looks like a different grade. Pick the file for this book.')
              : tr('This file name looks like a different subject. Pick the file for this book.'),
      )
      return
    }
    setBusy(true)
    try {
      const result = await swapBookFile(book, file, lastPage, (page, total) => setProgress({ page, total }))
      addCustomBook(result.book)
      setBookProgress(book.id, result.lastPage, result.pageCount)
      setDone({ pages: result.pageCount, kept: result.keptLessons, fresh: result.newLessons })
      pushToast({ title: tr('Book replaced. Your progress is kept.'), type: 'success' })
    } catch {
      setError(tr('Could not read this PDF. Your old file is still here.'))
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => (busy ? undefined : onClose())}
      title={tr('Your book and edition')}
      subtitle={book.title}
      icon={<BadgeCheck className="h-5 w-5" />}
      size="md"
    >
      <div data-testid="book-check" data-verdict={check.verdict}>
        <p className="rounded-2xl border border-line bg-card-2 px-3 py-2 text-[11px] text-muted" dir="auto">
          {tr('{grade} · {term} · {subject}', {
            grade: book.grade ? tr(gradeLabel(book.grade)) : '',
            term: tr(book.term),
            subject: tr(book.subject),
          })}
          {editionLabel(book)}
        </p>
        <p className={cn('mt-3 flex items-center gap-2 font-display text-sm font-extrabold', verdict.tone)} data-testid="book-check-verdict">
          <verdict.Icon className="h-5 w-5" aria-hidden /> {verdict.text}
        </p>
        <ul className="mt-3 space-y-2">
          {check.findings.map((finding) => {
            const text = message(finding)
            return (
              <li key={finding.id} className="flex items-start gap-2.5 rounded-2xl border border-line bg-card-2 px-3 py-2.5">
                {finding.severity === 'problem' ? (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-coral" aria-hidden />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-sun" aria-hidden />
                )}
                <div className="min-w-0">
                  <p className="text-[12px] font-extrabold text-main" dir="auto">{text.title}</p>
                  {text.detail && <p className="mt-0.5 text-[11px] leading-relaxed text-muted" dir="auto">{text.detail}</p>}
                </div>
              </li>
            )
          })}
        </ul>

        {done && (
          <p className="mt-3 rounded-2xl border border-aurora-400/30 bg-aurora-400/10 px-3 py-2 text-[11px] font-bold text-aurora-200" data-testid="book-check-done" dir="auto">
            {tr('New file saved: {pages} pages. {kept} lessons kept their progress, {fresh} are new.', {
              pages: num(done.pages),
              kept: num(done.kept),
              fresh: num(done.fresh),
            })}
          </p>
        )}
        {busy && (
          <p className="mt-3 text-[11px] text-muted">
            {tr('Reading the new file…')} {progress.total ? `${num(progress.page)}/${num(progress.total)}` : ''}
          </p>
        )}
        {error && (
          <p className="mt-3 text-[11px] font-bold text-coral" role="alert" dir="auto">{error}</p>
        )}

        <p className="mt-3 text-[10px] leading-relaxed text-muted-2" dir="auto">
          {tr('Use only the file from the Ministry link. Replacing keeps your reading place, notes, highlights and finished lessons. Notes stay on the same page numbers.')}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            ref={input}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            data-testid="book-check-file"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <Button size="sm" onClick={() => input.current?.click()} loading={busy} data-testid="book-check-replace">
            <FileUp className="h-3.5 w-3.5" /> {tr('Replace with another file')}
          </Button>
          {check.entry && (
            <a href={check.entry.url} target="_blank" rel="noreferrer">
              <Button size="sm" variant="secondary">
                <ExternalLink className="h-3.5 w-3.5" /> {tr('Open the Ministry file')}
              </Button>
            </a>
          )}
        </div>
      </div>
    </Modal>
  )
}

function editionLabel(book: Book) {
  const year = (url?: string) => url?.match(/(\d{4})_(\d{4})/)?.slice(1, 3).join('/') || ''
  const have = year(book.sourceUrl)
  return have ? ` · ${have}` : ''
}
