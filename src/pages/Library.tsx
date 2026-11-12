import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  Download,
  Filter,
  GraduationCap,
  HardDrive,
  Info,
  LibraryBig,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import type { Book, Subject } from '@/types'
import { subjectMeta } from '@/data/books'
import { gradeLabel, officialFor, type OfficialBook } from '@/data/officialBooks'
import { GLOBAL_LEVELS, hasOfficialLibrary, levelLabel } from '@/lib/curriculum'
import { useApp } from '@/store/useApp'
import { BookCard } from '@/components/common/BookCard'
import { PageHeader } from '@/components/common/PageHeader'
import { OfficialBookCard } from '@/components/library/OfficialBookCard'
import { AddBookModal } from '@/components/library/AddBookModal'
import { BatchImportModal } from '@/components/library/BatchImportModal'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState } from '@/components/ui/Card'
import { cn, pct } from '@/lib/utils'
import { formatBytes, getStorageInfo, requestPersistentStorage, type StorageInfo } from '@/lib/storage'
import { deleteChapterCache, deletePdfBytes } from '@/lib/db'
import { defaultGradeForStage, gradesForStage, stageForGrade, type SchoolStage } from '@/lib/stage'
import { useUI } from '@/store/useUI'
import { tr } from '@/i18n'

const subjects: (Subject | 'All')[] = ['All', 'English', 'Arabic', 'German', 'French', 'Science', 'Mathematics', 'Social Studies']

export function Library() {
  const settings = useApp((s) => s.settings)
  const updateSettings = useApp((s) => s.updateSettings)
  const bookProgress = useApp((s) => s.bookProgress)
  const completedTopics = useApp((s) => s.completedTopics)
  const customBooks = useApp((s) => s.customBooks)
  const removeCustomBook = useApp((s) => s.removeCustomBook)
  const pushToast = useUI((s) => s.pushToast)

  const [term, setTerm] = useState<'Term 1' | 'Term 2'>('Term 1')
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState<Subject | 'All'>('All')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingCatalog, setPendingCatalog] = useState<OfficialBook | null>(null)
  const [batchFiles, setBatchFiles] = useState<File[] | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [storage, setStorage] = useState<StorageInfo | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const refreshStorage = () => {
    getStorageInfo().then(setStorage).catch(() => undefined)
  }

  useEffect(() => {
    refreshStorage()
  }, [customBooks.length])

  const grade = settings.gradeLevel
  const curriculum = settings.curriculum
  const official = hasOfficialLibrary(curriculum)
  const stage = stageForGrade(grade)

  const catalog = useMemo(() => {
    const q = query.trim().toLowerCase()
    return officialFor(grade, term, subject).filter(
      (book) => !q || `${book.title} ${book.subject} ${book.term}`.toLowerCase().includes(q),
    )
  }, [grade, term, subject, query])

  const imported = useMemo(() => {
    const q = query.trim().toLowerCase()
    return customBooks
      .filter((b) => (b.grade ?? grade) === grade && b.term === term)
      .filter((b) => subject === 'All' || b.subject === subject)
      .filter((b) => !q || `${b.title} ${b.subject} ${b.description}`.toLowerCase().includes(q))
  }, [customBooks, grade, term, subject, query])

  const totalPages = imported.reduce((sum, b) => sum + b.pageCount, 0)
  const readPages = imported.reduce((sum, b) => sum + Math.min(b.pageCount, bookProgress[b.id]?.lastPage || 0), 0)
  const finished = imported.filter((b) => pct(bookProgress[b.id]?.lastPage || 0, b.pageCount) >= 100).length
  const importedByCatalog = useMemo(() => {
    const map = new Map<string, Book>()
    for (const book of customBooks) if (book.catalogId) map.set(book.catalogId, book)
    return map
  }, [customBooks])

  const openPicker = (entry: OfficialBook | null) => {
    setPendingCatalog(entry)
    fileInput.current?.click()
  }

  const stats = [
    ...(official
      ? [{ label: tr('Official books'), value: officialFor(grade, term, 'All').length, hint: levelLabel(grade, curriculum), icon: LibraryBig }]
      : []),
    { label: tr('In my library'), value: imported.length, hint: tr('{n} completed', { n: finished }), icon: CheckCircle2 },
    { label: tr('Read so far'), value: `${readPages}/${totalPages}`, hint: tr('pages across your books'), icon: BookOpen },
    { label: tr('Chapters mastered'), value: completedTopics.length, hint: tr('Across all subjects'), icon: GraduationCap },
  ]

  const dropFiles = (files: File[]) => {
    const pdfs = files.filter((file) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name))
    if (!pdfs.length) return
    if (pdfs.length === 1) setPendingFile(pdfs[0])
    else setBatchFiles(pdfs)
  }

  return (
    <div
      className="relative space-y-5"
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        dropFiles([...e.dataTransfer.files])
      }}
    >
      {dragOver && (
        <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center rounded-3xl border-2 border-dashed border-aurora-400/60 bg-ink-950/80 backdrop-blur-sm">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-aurora-300" />
            <p className="mt-2 text-sm font-extrabold text-white">{tr('Drop your PDFs here')}</p>
            <p className="text-[10px] text-slate-300">{tr('One file opens the editor, several import in a batch.')}</p>
          </div>
        </div>
      )}
      <PageHeader
        eyebrow={tr('Your digital bookshelf')}
        title={tr('Library')}
        subtitle={official ? tr('Official Egyptian Ministry books for primary and preparatory grades. Download a book, import it once, and Jessica teaches from its real pages at the right level — fully on your device.') : tr('Import any textbook PDF. Jessica indexes it on your device and teaches from its real pages — no official catalog needed.')}
        icon={<LibraryBig className="h-5 w-5" />}
        actions={
          <>
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              multiple
              onChange={(e) => {
                const files = [...(e.target.files || [])]
                if (files.length > 1) {
                  setPendingCatalog(null)
                  setBatchFiles(files)
                }
                else if (files[0]) setPendingFile(files[0])
                e.target.value = ''
              }}
            />
            <Button onClick={() => openPicker(null)}>
              <Upload className="h-4 w-4" /> {tr('Add your own PDF')}
            </Button>
            <Link to="/constellation">
              <Button variant="secondary">
                <GraduationCap className="h-4 w-4" /> {tr('Learning map')}
              </Button>
            </Link>
          </>
        }
      />

      {/* Grade + term */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {official && (
          <div>
            <p className="label mb-1.5">{tr('Stage')}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(['primary', 'prep'] as SchoolStage[]).map((value) => {
                const active = stage === value
                return (
                  <button
                    key={value}
                    onClick={() => updateSettings({ gradeLevel: defaultGradeForStage(value) })}
                    className={cn(
                      'flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition',
                      active
                        ? value === 'primary'
                          ? 'border-sun/50 bg-sun/10'
                          : 'border-aurora-400/50 bg-aurora-400/10'
                        : 'border-line bg-card-2 hover:bg-white/5',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base',
                        active ? (value === 'primary' ? 'bg-sun/20 text-sun' : 'bg-aurora-400/15 text-aurora-300') : 'bg-white/5 text-muted',
                      )}
                    >
                      {value === 'primary' ? '🧸' : '🎓'}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-extrabold text-main">
                        {value === 'primary' ? tr('Primary stage') : tr('Preparatory stage')}
                      </span>
                      <span className="block text-[9px] text-muted">
                        {value === 'primary' ? tr('Grade 4 and younger') : tr('Grades 1–3')}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          )}

          <div>
            <p className="label mb-1.5">{tr(official ? 'Grade' : 'Learner level')}</p>
            <div className="flex flex-wrap gap-1.5">
              {(official ? gradesForStage(stage).map((g) => ({ grade: g, label: tr(gradeLabel(g)) })) : GLOBAL_LEVELS.map((l) => ({ grade: l.grade, label: tr(l.label) }))).map((item) => (
                <button
                  key={item.grade}
                  onClick={() => updateSettings({ gradeLevel: item.grade })}
                  className={cn(
                    'rounded-xl border px-3 py-1.5 text-[11px] font-bold transition',
                    grade === item.grade
                      ? 'border-aurora-400/50 bg-aurora-400/15 text-aurora-200'
                      : 'border-line bg-card-2 text-muted hover:text-main',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="label mb-1.5">{tr('Term')}</p>
              <div className="flex gap-1 rounded-xl border border-line bg-card-2 p-1">
                {(['Term 1', 'Term 2'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTerm(t)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-[11px] font-bold transition',
                      term === t ? 'bg-aurora-400 text-ink-950' : 'text-muted hover:text-main',
                    )}
                  >
                    {tr(t)}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr('Search by book, subject or unit…')}
                className="field pl-9"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {subjects.map((s) => {
              const meta = s === 'All' ? null : subjectMeta[s]
              return (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold transition',
                    subject === s ? 'border-aurora-400/50 bg-aurora-400/15 text-aurora-200' : 'border-line bg-card-2 text-muted hover:text-main',
                  )}
                >
                  {meta && <span>{meta.emoji}</span>}
                  {tr(s)}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{s.label}</p>
              <s.icon className="h-4 w-4 text-aurora-300" />
            </div>
            <p className="mt-2 font-display text-2xl font-extrabold text-main">{s.value}</p>
            <p className="mt-0.5 text-[10px] text-muted">{s.hint}</p>
          </Card>
        ))}
      </div>

      {imported.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-extrabold text-main">{tr('My library')}</h2>
            <span className="text-[10px] font-bold text-muted">{imported.length}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {imported.map((book) => (
              <div key={book.id} className="relative">
                <BookCard book={book} />
                <button
                  onClick={async () => {
                    if (!window.confirm(tr('Delete this book? Its progress and cached text will be removed.'))) return
                    await deletePdfBytes(book.id)
                    await deleteChapterCache(book.id)
                    removeCustomBook(book.id)
                    pushToast({ title: tr('Book deleted'), type: 'info' })
                  }}
                  className="absolute end-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-xl border border-line bg-app/80 text-muted backdrop-blur transition hover:text-coral"
                  aria-label={tr('Delete book')}
                  title={tr('Delete book')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {official && (
      <section className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-extrabold text-main">{tr('Official library')}</h2>
            <p className="text-[10px] text-muted">
              {tr(gradeLabel(grade))} · {tr(term)} · {tr('Ministry of Education')}
            </p>
          </div>
          <span className="chip border-sun/25 bg-sun/10 text-sun">
            <Download className="h-3 w-3" /> {tr('Download then import')}
          </span>
        </div>

        {catalog.length === 0 ? (
          <EmptyState
            icon={<Filter className="h-6 w-6" />}
            title={term === 'Term 2' ? tr('Term 2 books are on the way') : tr('No books match that search')}
            description={
              term === 'Term 2'
                ? tr('The ministry has not published every Term 2 book yet. Switch to Term 1, or add your own PDF.')
                : tr('Try a different subject or clear the search — or add your own PDF with the button above.')
            }
            action={
              <Button variant="secondary" size="sm" onClick={() => { setQuery(''); setSubject('All'); setTerm('Term 1') }}>
                {tr('Show Term 1')}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {catalog.map((entry) => (
              <OfficialBookCard
                key={entry.id}
                entry={entry}
                imported={importedByCatalog.get(entry.id)}
                onImport={openPicker}
              />
            ))}
          </div>
        )}
      </section>
      )}

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky/15 text-sky">
              <HardDrive className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-main">{tr('Device storage')}</p>
              <p className="text-[10px] text-muted">
                {storage?.supported
                  ? tr('{used} used of {quota} available', {
                      used: formatBytes(storage.usage, settings.language),
                      quota: formatBytes(storage.quota, settings.language),
                    })
                  : tr('Storage estimate is not available in this browser.')}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant={storage?.persisted ? 'secondary' : 'primary'}
            disabled={!storage?.supported || storage?.persisted}
            onClick={async () => {
              const ok = await requestPersistentStorage()
              refreshStorage()
              pushToast({
                title: ok ? tr('Persistent storage enabled') : tr('Could not enable persistent storage'),
                description: ok ? tr('Your books will not be evicted by the browser.') : tr('Try adding the app to your home screen first.'),
                type: ok ? 'success' : 'info',
              })
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {storage?.persisted ? tr('Persistent storage on') : tr('Keep my books safe')}
          </Button>
        </div>
        {storage?.supported && storage.quota > 0 && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-sky"
              style={{ width: `${Math.min(100, Math.max(1, (storage.usage / storage.quota) * 100))}%` }}
            />
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sun/15 text-sun">
            <Info className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-main">{tr('How the official books work')}</p>
            <p className="mt-0.5 max-w-2xl text-[11px] leading-relaxed text-muted">
              {tr('Tap Download PDF to open the ministry file, save it on your device, then tap Import and pick it. Jessica indexes every page locally, so the tutor answers from the real book and everything keeps working offline.')}
            </p>
          </div>
        </div>
        <span className="chip shrink-0 border-aurora-400/25 text-aurora-200">
          <Sparkles className="h-3 w-3" /> {tr('100% local indexing')}
        </span>
      </Card>

      <BatchImportModal
        files={batchFiles}
        onClose={() => {
          setBatchFiles(null)
          refreshStorage()
        }}
        onDone={(books) => {
          refreshStorage()
          if (books.length) {
            pushToast({
              title: tr('{n} books imported', { n: books.length }),
              description: tr('Open them from My library. Everything is indexed locally.'),
              type: 'success',
            })
          }
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
          pushToast({
            title: tr('Book added to your library'),
            description: tr('{name} is ready with {n} units.', { name: book.title, n: book.units?.length || 0 }),
            type: 'success',
          })
        }}
      />
    </div>
  )
}
