import { useMemo, useRef, useState } from 'react'
import { BookOpen, Download, Info, Sparkles, Trash2, Upload } from 'lucide-react'
import type { OfficialBook } from '@/data/officialBooks'
import { officialFor } from '@/data/officialBooks'
import { levelLabel } from '@/lib/curriculum'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { BookCard } from '@/components/common/BookCard'
import { OfficialBookCard } from '@/components/library/OfficialBookCard'
import { AddBookModal } from '@/components/library/AddBookModal'
import { BatchImportModal } from '@/components/library/BatchImportModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { deleteChapterCache, deletePdfBytes } from '@/lib/db'
import { tr } from '@/i18n'

export function KidsLibrary() {
  const customBooks = useApp((s) => s.customBooks)
  const grade = useApp((s) => s.settings.gradeLevel)
  const curriculum = useApp((s) => s.settings.curriculum)
  const removeCustomBook = useApp((s) => s.removeCustomBook)
  const pushToast = useUI((s) => s.pushToast)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingCatalog, setPendingCatalog] = useState<OfficialBook | null>(null)
  const [batchFiles, setBatchFiles] = useState<File[] | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const books = useMemo(() => customBooks.filter((b) => b.grade === grade), [customBooks, grade])
  const official = useMemo(() => officialFor(grade, 'Term 1', 'All'), [grade])
  const importedByCatalog = useMemo(() => {
    const map = new Map<string, (typeof books)[number]>()
    for (const book of books) if (book.catalogId) map.set(book.catalogId, book)
    return map
  }, [books])

  const openPicker = (entry: OfficialBook | null) => {
    setPendingCatalog(entry)
    inputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-main sm:text-3xl">📚 {tr('My books')}</h1>
          <p className="mt-1 text-xs text-muted">
            {tr('Read with Jessica. Tap a book to start.')}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => openPicker(null)}>
          <Upload className="h-4 w-4" /> {tr('Add a book')}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        multiple
        onChange={(e) => {
          const files = [...(e.target.files || [])]
          if (files.length > 1) {
            setPendingCatalog(null)
            setBatchFiles(files)
          } else if (files[0]) {
            setPendingFile(files[0])
          }
          e.target.value = ''
        }}
      />

      {books.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {books.map((book) => (
            <div key={book.id} className="relative">
              <BookCard book={book} to={`/kids/reader/${book.id}`} />
              <button
                onClick={async () => {
                  if (!window.confirm(tr('A grown-up should confirm deleting this book. Continue?'))) return
                  await deletePdfBytes(book.id)
                  await deleteChapterCache(book.id)
                  removeCustomBook(book.id)
                  pushToast({ title: tr('Book deleted'), type: 'info' })
                }}
                className="absolute end-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-xl border border-line bg-white/90 text-muted backdrop-blur transition hover:text-coral"
                aria-label={tr('Delete book')}
                title={tr('Delete book')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-5 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-sun/15 text-3xl">📖</span>
          <p className="mt-3 font-display text-lg font-extrabold text-main">{tr('No books yet')}</p>
          <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-muted">
            {tr('Ask a grown-up to add your school book below. It stays on this device.')}
          </p>
        </Card>
      )}

      <Card className="border-sun/25 bg-sun/5 p-4">
        <div className="flex items-start gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sun/20 text-sun">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-main">{tr('Official books for {grade}', { grade: levelLabel(grade, curriculum) })}</p>
            <p className="text-[10px] leading-relaxed text-muted">
              {tr('A grown-up can download the PDF and add it once. Jessica will read it with you.')}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {official.map((entry) => (
          <OfficialBookCard
            key={entry.id}
            entry={entry}
            imported={importedByCatalog.get(entry.id)}
            onImport={openPicker}
            basePath="/kids/reader"
          />
        ))}
      </div>

      <Card className="flex items-center gap-2.5 p-3">
        <Info className="h-4 w-4 shrink-0 text-sky" />
        <p className="text-[10px] leading-relaxed text-muted">
          {tr('Download the PDF, then tap Import and choose the file. Everything stays on this device.')}
        </p>
        <Download className="ms-auto h-4 w-4 shrink-0 text-muted-2" />
      </Card>

      <BatchImportModal
        files={batchFiles}
        onClose={() => setBatchFiles(null)}
        onDone={(added) => {
          if (added.length) pushToast({ title: tr('{n} books added', { n: added.length }), type: 'success' })
        }}
      />
      <AddBookModal
        file={pendingFile}
        catalog={pendingCatalog}
        onClose={() => {
          setPendingFile(null)
          setPendingCatalog(null)
        }}
        onAdded={(book) => {
          setPendingFile(null)
          setPendingCatalog(null)
          pushToast({ title: tr('{name} is ready!', { name: book.title }), type: 'success' })
        }}
      />
    </div>
  )
}
