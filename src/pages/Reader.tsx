import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Hand,
  Highlighter,
  Layers,
  Loader2,
  MessageCircle,
  Moon,
  Search,
  Sparkles,
  StickyNote,
  Trophy,
  Trash2,
  Volume2,
  StopCircle,
  Wand2,
  X,
  Zap,
} from 'lucide-react'
import type { ChapterText } from '@/types'
import { unitForPage } from '@/lib/units'
import { extractChapter } from '@/lib/pdf'
import { chapterCacheSet, deleteChapterCache, deletePdfBytes, getPdfBytes } from '@/lib/db'
import { useIdle, useStudyTimer } from '@/hooks/usePlatform'
import { cn, pct } from '@/lib/utils'
import { useApp } from '@/store/useApp'
import { Button } from '@/components/ui/Button'
import { Card, ProgressBar } from '@/components/ui/Card'
import { PdfViewer, type SelectionAction } from '@/components/reader/PdfViewer'
import { ReaderChat, type PendingAsk } from '@/components/reader/ReaderChat'
import { ReaderStudio } from '@/components/reader/ReaderStudio'
import { Modal } from '@/components/ui/Modal'
import { useUI } from '@/store/useUI'
import { speakable, useSpeech } from '@/lib/speech'
import { ocrPdfPage } from '@/lib/ocr'
import { tr } from '@/i18n'
import { stageForGrade } from '@/lib/stage'

type Tab = 'book' | 'tutor'

export function Reader() {
  const { bookId = '' } = useParams()
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const kids = stageForGrade(gradeLevel) === 'primary'
  const backTo = kids ? '/kids/library' : '/library'
  const { speak, stop, speaking } = useSpeech()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const pushToast = useUI((s) => s.pushToast)

  const [pdfUrl, setPdfUrl] = useState('')
  const [chapterText, setChapterText] = useState<ChapterText | undefined>()
  const [extractProgress, setExtractProgress] = useState({ page: 0, total: 0 })
  const [tab, setTab] = useState<Tab>('book')
  const [studioOpen, setStudioOpen] = useState(false)
  const [pendingAsk, setPendingAsk] = useState<PendingAsk | null>(null)
  const [page, setPage] = useState(1)
  const [intervention, setIntervention] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [searchIndex, setSearchIndex] = useState(0)
  const [noteOpen, setNoteOpen] = useState(false)
  const [ocrBusy, setOcrBusy] = useState(false)
  const [highlightsOpen, setHighlightsOpen] = useState(false)
  const [ocrStatus, setOcrStatus] = useState('')
  const [noteDraft, setNoteDraft] = useState('')

  const bookProgress = useApp((s) => s.bookProgress)
  const setBookProgress = useApp((s) => s.setBookProgress)
  const recordStudy = useApp((s) => s.recordStudy)
  const track = useApp((s) => s.track)
  const completeTopic = useApp((s) => s.completeTopic)
  const completedTopics = useApp((s) => s.completedTopics)
  const customBooks = useApp((s) => s.customBooks)
  const removeCustomBook = useApp((s) => s.removeCustomBook)
  const addXP = useApp((s) => s.addXP)
  const bookmarks = useApp((s) => s.bookmarks)
  const pageNotes = useApp((s) => s.pageNotes)
  const toggleBookmark = useApp((s) => s.toggleBookmark)
  const setPageNote = useApp((s) => s.setPageNote)
  const highlights = useApp((s) => s.highlights)
  const addHighlight = useApp((s) => s.addHighlight)
  const removeHighlight = useApp((s) => s.removeHighlight)

  const book = useMemo(() => customBooks.find((b) => b.id === bookId), [customBooks, bookId])

  const units = book?.units || []
  const currentUnit = unitForPage(units, page)
  const unitTopicId = currentUnit ? `${bookId}:${currentUnit.id}` : ''
  const chapterDone = unitTopicId ? completedTopics.includes(unitTopicId) : false

  useEffect(() => {
    let alive = true
    let objectUrl = ''
    if (!book) {
      setPdfUrl('')
      return
    }
    if (book.file.startsWith('local:')) {
      getPdfBytes(book.id).then((bytes) => {
        if (!alive) return
        if (!bytes) {
          pushToast({ title: tr('Could not read this PDF'), description: tr('Add the PDF again from the Library.'), type: 'error' })
          return
        }
        objectUrl = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }))
        setPdfUrl(objectUrl)
      })
    }
    return () => {
      alive = false
      // Keep the blob URL alive: pdf.js caches the document for this session.
    }
  }, [book?.id, book?.file, pushToast])

  useEffect(() => {
    if (!book) return
    const saved = bookProgress[book.id]
    const requested = Number(params.get('page') || 0)
    setPage(requested && requested <= book.pageCount ? requested : saved?.lastPage && saved.lastPage <= book.pageCount ? saved.lastPage : 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id, params])

  useEffect(() => {
    if (!book || !pdfUrl) return
    let alive = true
    setChapterText(undefined)
    setExtractProgress({ page: 0, total: book.pageCount })
    extractChapter(pdfUrl, book.id, (p, total) => {
      if (alive) setExtractProgress({ page: p, total })
    })
      .then((chapter) => {
        if (alive) setChapterText(chapter)
      })
      .catch(() => {
        if (alive)
          pushToast({
            title: tr("Could not read this PDF"),
            description: tr("Re-import the PDF from the Library."),
            type: 'error',
          })
      })
    return () => {
      alive = false
    }
  }, [book?.id, pdfUrl, pushToast])

  useEffect(() => {
    if (!book || !page) return
    setBookProgress(book.id, page, book.pageCount)
    track('pages', 1)
  }, [book, page, setBookProgress, track])

  useStudyTimer(tab === 'book', (seconds) => recordStudy(seconds))

  const { idle } = useIdle(65_000, tab === 'book' && !!chapterText)
  useEffect(() => {
    if (!idle) return
    setIntervention(true)
    addXP(1, true)
  }, [idle, addXP])

  const askFromSelection = useCallback(
    (text: string, action: SelectionAction) => {
      if (action === 'highlight') {
        if (!book) return
        addHighlight(book.id, page, text)
        pushToast({ title: tr('Passage highlighted'), type: 'success' })
        return
      }
      const prefix =
        action === 'explain'
          ? 'Explain this highlighted passage from my textbook clearly, with a simple example:'
          : action === 'simplify'
            ? "Explain this highlighted passage like I'm 5, with a playful analogy:"
            : 'Translate and explain this highlighted passage in friendly Egyptian Arabic, keeping key terms:'
      setPendingAsk({
        id: `${Date.now()}`,
        text: `${prefix}\n\n"${text}"`,
        label: action === 'explain' ? 'Highlight explain' : action === 'simplify' ? 'ELI5 selection' : 'Arabic selection',
      })
      setTab('tutor')
      setIntervention(false)
    },
    [],
  )

  const askAboutPage = () => {
    if (!book) return
    setPendingAsk({
      id: `${Date.now()}`,
      text: `Explain page ${page} of my book in a simple, friendly way. Give me the 3 most important ideas and one quick question to check I understood.`,
      label: `Page ${page}`,
    })
    setTab('tutor')
    setIntervention(false)
  }

  const normalizeText = (text: string) =>
    text
      .normalize('NFKC')
      .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .toLowerCase()

  const runSearch = () => {
    const query = normalizeText(searchQuery.trim())
    if (!chapterText || !query) {
      setSearchResults([])
      return
    }
    const pages = chapterText.pages.filter((p) => normalizeText(p.text).includes(query)).map((p) => p.page)
    setSearchResults(pages)
    setSearchIndex(0)
    if (pages.length) setPage(pages[0])
  }

  const stepSearch = (direction: number) => {
    if (!searchResults.length) return
    const next = (searchIndex + direction + searchResults.length) % searchResults.length
    setSearchIndex(next)
    setPage(searchResults[next])
  }

  const pageText = chapterText?.pages.find((p) => p.page === page)?.text || ''
  const needsOcr = !!chapterText && pageText.trim().length < 20

  const runOcr = async () => {
    if (!chapterText || !pdfUrl || ocrBusy) return
    setOcrBusy(true)
    setOcrStatus('')
    try {
      const text = await ocrPdfPage(pdfUrl, page, 'ara+eng', (status, progress) =>
        setOcrStatus(`${status} ${Math.round(progress * 100)}%`),
      )
      if (!text) throw new Error('empty')
      const pages = chapterText.pages.map((item) => (item.page === page ? { ...item, text } : item))
      const updated = { ...chapterText, pages, text: pages.map((item) => `[Page ${item.page}]\n${item.text}`).join('\n\n') }
      setChapterText(updated)
      await chapterCacheSet(updated)
      pushToast({ title: tr('Text extracted from the page'), type: 'success' })
    } catch {
      pushToast({ title: tr('Could not scan this page'), description: tr('OCR needs internet the first time. Try again.'), type: 'error' })
    } finally {
      setOcrBusy(false)
      setOcrStatus('')
    }
  }
  const readAloud = () => {
    if (speaking) stop()
    else if (pageText) speak(speakable(pageText))
  }
  const isBookmarked = book ? (bookmarks[book.id] || []).includes(page) : false
  const currentNote = book ? pageNotes[book.id]?.[String(page)] || '' : ''

  const downloadBook = async () => {
    if (!book) return
    try {
      if (book.file.startsWith('local:')) {
        const bytes = await getPdfBytes(book.id)
        if (!bytes) throw new Error('missing')
        const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }))
        const link = document.createElement('a')
        link.href = url
        link.download = `${book.title}.pdf`
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      }
    } catch {
      pushToast({ title: tr('Could not download this PDF'), type: 'error' })
    }
  }

  const deleteBook = async () => {
    if (!book?.custom) return
    if (!window.confirm(tr('Delete this book from your library? Its progress and cached text will be removed.'))) return
    await deletePdfBytes(book.id)
    await deleteChapterCache(book.id)
    removeCustomBook(book.id)
    navigate(backTo)
  }

  if (!book) {
    return (
      <Card className="mx-auto mt-10 max-w-md p-8 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-muted" />
        <p className="mt-3 font-display text-lg font-extrabold text-main">{tr("Book not found")}</p>
        <p className="mt-1 text-[11px] text-muted">{tr("This textbook is not in your library manifest.")}</p>
        <Button className="mt-4" onClick={() => navigate(backTo)}>
          {tr("Back to library")}
        </Button>
      </Card>
    )
  }

  const progressPercent = pct(page, book.pageCount)

  return (
    <div className="-mx-3 -mt-4 flex min-h-[calc(100dvh-8rem)] flex-col sm:-mx-5 lg:-mx-7 lg:mt-0">
      {/* header */}
      <div className="border-b border-line bg-app/60 px-3 py-3 backdrop-blur-xl sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={backTo}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-card-2 text-muted transition hover:text-main"
            aria-label={tr("Back to library")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg"
            style={{ background: `${book.accent}1c` }}
          >
            {book.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-extrabold text-main">{book.title}</p>
            <p className="text-[10px] text-muted">
              {currentUnit?.title || tr(book.subject)} {tr("· page")} {page} {tr("of")} {book.pageCount}
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="w-28">
              <ProgressBar value={progressPercent} height="h-1.5" />
            </div>
            <span className="text-[10px] font-bold text-muted">{progressPercent}%</span>
          </div>

          {!kids && (
          <>
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-card-2 text-muted transition hover:text-main"
            aria-label={tr('Search inside the book')}
            title={tr('Search inside the book')}
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              toggleBookmark(book.id, page)
              pushToast({ title: isBookmarked ? tr('Bookmark removed') : tr('Page bookmarked'), type: 'info' })
            }}
            className={cn(
              'grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition',
              isBookmarked ? 'border-sun/40 bg-sun/10 text-sun' : 'border-line bg-card-2 text-muted hover:text-main',
            )}
            aria-label={tr('Bookmark this page')}
            title={tr('Bookmark this page')}
          >
            <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
          </button>
          <button
            onClick={() => {
              setNoteDraft(currentNote)
              setNoteOpen(true)
            }}
            className={cn(
              'relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition',
              currentNote ? 'border-violet-neon/40 bg-violet-neon/10 text-violet-glow' : 'border-line bg-card-2 text-muted hover:text-main',
            )}
            aria-label={tr('Page note')}
            title={tr('Page note')}
          >
            <StickyNote className="h-4 w-4" />
            {currentNote && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-violet-glow" />}
          </button>
          </>
          )}
          {kids && (
            <Button size="sm" variant="secondary" onClick={readAloud} disabled={!pageText}>
              {speaking ? <StopCircle className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{speaking ? tr('Stop') : tr('Read to me')}</span>
            </Button>
          )}
          {!kids && (
          <button
            onClick={() => setHighlightsOpen(true)}
            className={cn(
              'relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition',
              (highlights[book.id] || []).length
                ? 'border-sun/40 bg-sun/10 text-sun'
                : 'border-line bg-card-2 text-muted hover:text-main',
            )}
            aria-label={tr('Highlights')}
            title={tr('Highlights')}
          >
            <Highlighter className="h-4 w-4" />
            {(highlights[book.id] || []).length > 0 && (
              <span className="absolute -end-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-sun px-1 text-[8px] font-black text-ink-950">
                {(highlights[book.id] || []).length}
              </span>
            )}
          </button>
          )}
          {!kids && (
          <Button
            size="sm"
            variant="secondary"
            onClick={downloadBook}
            aria-label={tr('Download PDF')}
            title={tr('Download PDF')}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{tr('Download PDF')}</span>
          </Button>
          )}
          {!kids && book.custom && (
            <Button
              size="sm"
              variant="ghost"
              onClick={deleteBook}
              aria-label={tr('Delete book')}
              title={tr('Delete book')}
            >
              <Trash2 className="h-3.5 w-3.5 text-coral" />
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => setStudioOpen(true)}>
            <Sparkles className="h-3.5 w-3.5" /> {tr("Studio")}
          </Button>
          {currentUnit && (
            <Button
              size="sm"
              variant={chapterDone ? 'secondary' : 'primary'}
              onClick={() => {
                if (chapterDone) {
                  pushToast({ title: tr('Unit already mastered'), type: 'info' })
                  return
                }
                completeTopic(unitTopicId, currentUnit.title, book.subject)
              }}
            >
              {chapterDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Trophy className="h-3.5 w-3.5" />}
              {chapterDone ? tr('Mastered') : kids ? tr('Finish! ⭐') : tr('Mark unit done')}
            </Button>
          )}
        </div>

        {/* mobile tabs */}
        <div className="mt-2.5 flex gap-1 rounded-xl border border-line bg-card-2 p-1 lg:hidden">
          {(['book', 'tutor'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-bold transition',
                tab === t ? 'bg-aurora-400 text-ink-950' : 'text-muted',
              )}
            >
              {t === 'book' ? <BookOpen className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />}
              {t === 'book' ? tr('Book') : kids ? tr('Ask Jessica') : tr('AI Tutor')}
            </button>
          ))}
        </div>
      </div>

      {needsOcr && !kids && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-sun/10 px-3 py-2 sm:px-5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-sun/20 text-sun">🔍</span>
          <p className="min-w-0 flex-1 text-[10px] font-semibold text-amber-800">
            {tr('This page has no text yet — scan it so Jessica can read it.')}
          </p>
          <Button size="sm" variant="secondary" onClick={runOcr} loading={ocrBusy} disabled={!pdfUrl}>
            {ocrBusy ? ocrStatus || tr('Scanning the page…') : tr('Scan this page (OCR)')}
          </Button>
        </div>
      )}

      {searchOpen && (
        <div className="flex items-center gap-2 border-b border-line bg-card-2/60 px-3 py-2 sm:px-5">
          <Search className="h-3.5 w-3.5 shrink-0 text-aurora-300" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder={tr('Search inside the book…')}
            className="min-w-0 flex-1 bg-transparent text-[11px] font-semibold text-main outline-none placeholder:text-muted-2"
            autoFocus
          />
          <span className="shrink-0 text-[9px] font-bold text-muted">
            {searchResults.length ? `${searchIndex + 1}/${searchResults.length}` : searchQuery ? tr('No matches') : ''}
          </span>
          <button onClick={() => stepSearch(-1)} disabled={!searchResults.length} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:text-main disabled:opacity-30" aria-label={tr('Previous match')}>
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => stepSearch(1)} disabled={!searchResults.length} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:text-main disabled:opacity-30" aria-label={tr('Next match')}>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => { setSearchOpen(false); setSearchResults([]); setSearchQuery('') }} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:text-main" aria-label={tr('Close search')}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {!chapterText && (
        <div className="flex items-center gap-3 border-b border-line bg-violet-neon/10 px-4 py-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-glow" />
          <p className="text-[10px] font-semibold text-violet-glow">
            {tr("Reading the PDF locally…")} {extractProgress.page}/{extractProgress.total || book.pageCount} {tr("pages indexed. The tutor unlocks when extraction finishes.")}
          </p>
        </div>
      )}

      <div className="grid min-h-0 flex-1 lg:grid-cols-[1.45fr_1fr]">
        <div className={cn('min-h-0 border-line lg:border-r', tab !== 'book' && 'hidden lg:block')}>
          <div className="relative h-full min-h-[60vh]">
            {pdfUrl ? (
              <PdfViewer
                url={pdfUrl}
                page={page}
                onPageChange={setPage}
                onSelectionAction={askFromSelection}
                title={book.title}
              />
            ) : (
              <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-2 text-muted">
                <Loader2 className="h-5 w-5 animate-spin text-aurora-400" />
                <p className="text-[11px] font-semibold">{tr('Waiting for the PDF…')}</p>
              </div>
            )}

            {intervention && (
              <div className="absolute inset-x-3 bottom-3 z-20 animate-slide-up rounded-2xl border border-aurora-400/30 bg-ink-950/95 p-3 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-3 sm:w-80">
                <div className="flex items-start gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sun/15 text-sun">
                    <Hand className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-white">{tr("Stuck or drifting?")}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-slate-300">
                      {tr("Jessica can explain this page in one minute, or you can take a 2-minute brain break.")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button onClick={askAboutPage} className="rounded-lg bg-aurora-400 px-2 py-1 text-[10px] font-bold text-ink-950">
                        <Wand2 className="mr-1 inline h-3 w-3" /> {tr("Explain page")}
                      </button>
                      <button
                        onClick={() => {
                          setPendingAsk({
                            id: `${Date.now()}`,
                            text: `Explain page ${page} like I'm 5, with one fun football or gaming analogy.`,
                            label: tr("Proactive ELI5"),
                          })
                          setTab('tutor')
                          setIntervention(false)
                        }}
                        className="rounded-lg border border-white/15 px-2 py-1 text-[10px] font-bold text-white"
                      >
                        {tr("ELI5")}
                      </button>
                      <button
                        onClick={() => {
                          setIntervention(false)
                          pushToast({ title: tr("Brain break started"), description: tr("Stretch, sip water, and come back in 2 minutes."), type: 'info' })
                        }}
                        className="rounded-lg px-2 py-1 text-[10px] font-bold text-slate-300"
                      >
                        <Moon className="mr-1 inline h-3 w-3" /> {tr("Break")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={cn('min-h-0', tab !== 'tutor' && 'hidden lg:block')}>
          <div className="h-full min-h-[60vh] lg:h-[calc(100dvh-12.5rem)]">
            <ReaderChat
              book={book}
              chapter={chapterText}
              page={page}
              pendingAsk={pendingAsk}
              onConsumed={() => setPendingAsk(null)}
              onOpenVision={() => setStudioOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* unit rail */}
      {units.length > 0 && (
        <div className="border-t border-line bg-app/50 px-3 py-2.5 sm:px-5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="flex shrink-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-2">
              <Layers className="h-3 w-3" /> {tr("Units")}
            </span>
            {units.map((unit) => {
              const done = completedTopics.includes(`${bookId}:${unit.id}`)
              return (
                <button
                  key={unit.id}
                  onClick={() => setPage(unit.startPage)}
                  title={`${tr('Page')} ${unit.startPage}`}
                  className={cn(
                    'flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition',
                    currentUnit?.id === unit.id
                      ? 'border-aurora-400/40 bg-aurora-400/10 text-aurora-200'
                      : 'border-line bg-card-2 text-muted hover:text-main',
                  )}
                >
                  {done ? <CheckCircle2 className="h-3 w-3 text-aurora-400" /> : <Zap className="h-3 w-3" />}
                  {unit.title}
                </button>
              )
            })}
            {currentUnit && currentUnit.endPage < book.pageCount && (
              <button
                onClick={() => setPage(currentUnit.endPage + 1)}
                className="ml-auto flex shrink-0 items-center gap-1 rounded-lg bg-violet-neon/15 px-2 py-1 text-[10px] font-bold text-violet-glow"
              >
                {tr("Next unit")} <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      <Modal
        open={highlightsOpen}
        onClose={() => setHighlightsOpen(false)}
        title={tr('Highlights')}
        subtitle={book.title}
        size="md"
      >
        {(highlights[book.id] || []).length === 0 ? (
          <p className="py-6 text-center text-xs font-semibold text-muted">
            {tr('Select any text in the PDF and tap Highlight to save it here.')}
          </p>
        ) : (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {(highlights[book.id] || []).map((item) => (
              <div key={item.id} className="rounded-2xl border border-line bg-card-2 p-3">
                <div className="flex items-center justify-between text-[9px] font-bold text-muted">
                  <button onClick={() => { setPage(item.page); setHighlightsOpen(false) }} className="text-aurora-300 hover:underline">
                    {tr('Page')} {item.page}
                  </button>
                  <button onClick={() => removeHighlight(book.id, item.id)} className="text-muted hover:text-coral" aria-label={tr('Delete')}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-main" dir="auto">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title={tr('Page note')}
        subtitle={`${book.title} · ${tr('Page')} ${page}`}
        size="sm"
      >
        <div className="space-y-3">
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value.slice(0, 1200))}
            placeholder={tr('Write what you want to remember about this page…')}
            className="field min-h-32 text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setNoteOpen(false)}>{tr('Cancel')}</Button>
            <Button
              size="sm"
              onClick={() => {
                setPageNote(book.id, page, noteDraft)
                setNoteOpen(false)
                pushToast({ title: noteDraft.trim() ? tr('Note saved') : tr('Note removed'), type: 'success' })
              }}
            >
              {tr('Save note')}
            </Button>
          </div>
        </div>
      </Modal>

      <ReaderStudio open={studioOpen} onClose={() => setStudioOpen(false)} book={book} chapter={chapterText} page={page} />
    </div>
  )
}
