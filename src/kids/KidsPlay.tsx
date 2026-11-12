import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Loader2, Play, Sparkles } from 'lucide-react'
import type { BookUnit, ChapterText } from '@/types'
import { useApp } from '@/store/useApp'
import { openChapter } from '@/lib/library'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { QuizModal } from '@/components/tools/QuizModal'
import { cn, pct } from '@/lib/utils'
import { tr } from '@/i18n'

export function KidsPlay() {
  const navigate = useNavigate()
  const customBooks = useApp((s) => s.customBooks)
  const grade = useApp((s) => s.settings.gradeLevel)
  const completedTopics = useApp((s) => s.completedTopics)
  const unitMastery = useApp((s) => s.unitMastery)
  const [params] = useSearchParams()
  const wantedBook = params.get('book')
  const wantedUnit = params.get('unit')
  const autoOpened = useRef(false)
  const books = useMemo(() => customBooks.filter((b) => b.grade === grade), [customBooks, grade])
  const [bookId, setBookId] = useState(books.some((b) => b.id === wantedBook) ? wantedBook! : books[0]?.id || '')
  const [chapter, setChapter] = useState<ChapterText | undefined>()
  const [loading, setLoading] = useState(false)
  const [quizUnit, setQuizUnit] = useState<BookUnit | null>(null)

  useEffect(() => {
    if (!books.some((b) => b.id === bookId)) setBookId(books.some((b) => b.id === wantedBook) ? wantedBook! : books[0]?.id || '')
  }, [books, bookId, wantedBook])

  const book = books.find((b) => b.id === bookId)

  useEffect(() => {
    if (!book) {
      setChapter(undefined)
      return
    }
    let alive = true
    setLoading(true)
    setChapter(undefined)
    openChapter(book).then((text) => alive && setChapter(text)).catch(() => undefined).finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [book?.id])

  useEffect(() => {
    if (autoOpened.current || !wantedUnit || !chapter || !book) return
    const target = (book.units || []).find((unit) => unit.id === wantedUnit)
    if (target) {
      autoOpened.current = true
      setQuizUnit(target)
    }
  }, [wantedUnit, chapter, book])

  const chapterFor = (unit: BookUnit): ChapterText | undefined => {
    if (!book || !chapter) return undefined
    const pages = chapter.pages.filter((p) => p.page >= unit.startPage && p.page <= unit.endPage)
    return {
      bookId: `${book.id}:${unit.id}`,
      pages,
      text: pages.map((p) => `[Page ${p.page}]\n${p.text}`).join('\n\n'),
      extractedAt: Date.now(),
    }
  }

  if (!books.length) {
    return (
      <Card className="p-5 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-aurora-400/15 text-3xl">🎮</span>
        <p className="mt-3 font-display text-lg font-extrabold text-main">{tr('Add a book to play')}</p>
        <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-muted">
          {tr('Ask a grown-up to add your school book, then the quiz games appear here.')}
        </p>
        <Button className="mt-4" onClick={() => navigate('/kids/library')}>
          {tr('Open my books')}
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-main sm:text-3xl">🎮 {tr('Play and learn')}</h1>
          <p className="mt-1 text-xs text-muted">{tr('Pick a book, then pick a unit. Five fun questions.')}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/kids/cards')}>
          <Sparkles className="h-4 w-4" /> {tr('My cards')}
        </Button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {books.map((item) => (
          <button
            key={item.id}
            onClick={() => setBookId(item.id)}
            className={cn(
              'flex items-center gap-3 rounded-3xl border p-3.5 text-start transition',
              bookId === item.id ? 'border-sun/60 bg-sun/10 shadow-lg' : 'border-line bg-white/70 hover:bg-white',
            )}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl" style={{ background: `${item.accent}22` }}>
              {item.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-extrabold text-main">{item.title}</span>
              <span className="text-[10px] text-muted">{item.units?.length || 0} {tr('units')}</span>
            </span>
            {bookId === item.id && <CheckCircle2 className="h-5 w-5 shrink-0 text-sun" />}
          </button>
        ))}
      </div>

      {book && (
        <button
          onClick={() => navigate(`/kids/lesson/${book.id}`)}
          className="kids-sticker flex w-full items-center gap-3 rounded-3xl border-2 border-white bg-gradient-to-r from-violet-neon/15 via-white to-sun/15 p-3.5 text-start"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-neon/15 text-xl">⏱️</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-extrabold text-ink-950">{tr('Start a 5-minute lesson')}</span>
            <span className="text-[10px] font-semibold text-ink-600">{tr('Read a little, then answer two questions.')}</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-violet-neon" />
        </button>
      )}

      {loading ? (
        <Card className="flex items-center justify-center gap-2 p-6 text-xs font-bold text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-sun" /> {tr('Opening your book…')}
        </Card>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {(book?.units || []).map((unit, index) => {
            const key = `${book!.id}:${unit.id}`
            const stat = unitMastery[key]
            const best = stat ? pct(stat.best, stat.total) : 0
            const mastered = completedTopics.includes(key) || best >= 80
            return (
              <button
                key={unit.id}
                onClick={() => setQuizUnit(unit)}
                disabled={!chapterFor(unit)}
                className={cn(
                  'flex items-center gap-3 rounded-3xl border p-3.5 text-start transition disabled:opacity-40',
                  mastered ? 'border-aurora-400/50 bg-aurora-400/10' : 'border-line bg-white/70 hover:bg-white',
                )}
              >
                <span
                  className={cn(
                    'grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-black',
                    mastered ? 'bg-aurora-400 text-ink-950' : 'bg-violet-neon/10 text-violet-glow',
                  )}
                >
                  {mastered ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-extrabold text-main">{unit.title}</span>
                  <span className="text-[9px] text-muted">
                    {tr('Pages {from}–{to}', { from: unit.startPage, to: unit.endPage })}
                    {stat ? ` · ${tr('Best {n}%', { n: best })}` : ''}
                  </span>
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sun/20 text-sun">
                  <Play className="h-4 w-4" />
                </span>
              </button>
            )
          })}
        </div>
      )}

      {quizUnit && book && (
        <QuizModal
          open
          onClose={() => setQuizUnit(null)}
          book={book}
          chapter={chapterFor(quizUnit)}
          unitKey={`${book.id}:${quizUnit.id}`}
        />
      )}
    </div>
  )
}
