import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Lightbulb, RotateCcw, LayoutList, Undo2 } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { openChapter } from '@/lib/library'
import { makeBoardRound, type BoardRound } from '@/lib/lessonBoard'
import { shuffledOrder } from '@/lib/wordTrain'
import type { Book, BookUnit } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

interface Picked {
  book: Book
  unit: BookUnit
}

/** Restore the lesson board. Tap the sentences in the book's order. No drag needed, no timer, no penalty. */
export function LessonBoard({ kids = false }: { kids?: boolean }) {
  const navigate = useNavigate()
  const customBooks = useApp((s) => s.customBooks)
  const grade = useApp((s) => s.settings.gradeLevel)
  const books = useMemo(() => customBooks.filter((b) => (b.grade ?? grade) === grade), [customBooks, grade])
  const units = useMemo(() => books.flatMap((book) => (book.units || []).map((unit) => ({ book, unit }))), [books])
  const [active, setActive] = useState<Picked | null>(null)
  const [round, setRound] = useState<BoardRound | null>(null)
  const [order, setOrder] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [noText, setNoText] = useState(false)
  const [placed, setPlaced] = useState<number[]>([])
  const [hint, setHint] = useState(false)

  const start = async (item: Picked) => {
    setActive(item)
    setRound(null)
    setNoText(false)
    setPlaced([])
    setHint(false)
    setLoading(true)
    try {
      const chapter = await openChapter(item.book)
      const next = makeBoardRound(chapter, item.unit.startPage, item.unit.endPage)
      if (next) {
        setRound(next)
        setOrder(shuffledOrder(next.sentences.length))
      } else setNoText(true)
    } catch {
      setNoText(true)
    } finally {
      setLoading(false)
    }
  }

  const tap = (index: number) => {
    if (!round || placed.includes(index)) return
    // a card is right when it is the next sentence in the book
    if (round.sentences[index] === round.sentences[placed.length]) {
      setPlaced([...placed, index])
      setHint(false)
    } else setHint(true)
  }

  const undo = () => {
    setPlaced(placed.slice(0, -1))
    setHint(false)
  }

  const done = round ? placed.length === round.sentences.length : false
  const back = kids ? '/kids/play' : '/games'

  return (
    <div className="mx-auto max-w-2xl space-y-4" data-testid="lesson-board">
      <div className="flex items-center gap-2">
        <button
          onClick={() => (active ? setActive(null) : navigate(back))}
          className="grid h-9 w-9 place-items-center rounded-xl border-2 border-white bg-white text-ink-700"
          aria-label={tr('Back')}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
        <div>
          <h1 className="flex items-center gap-1.5 font-display text-xl font-extrabold text-ink-950 sm:text-2xl">
            <LayoutList className="h-5 w-5 text-sky" /> {tr('Restore the lesson board')}
          </h1>
          <p className="text-[11px] font-semibold text-ink-600">{tr('Put the sentences back in the order of your book page.')}</p>
        </div>
      </div>

      {!active ? (
        units.length === 0 ? (
          <Card className="p-5 text-center" data-testid="board-empty">
            <p className="text-sm font-extrabold text-ink-950">{tr('No lesson board for your books yet')}</p>
            <p className="mt-1 text-[11px] font-semibold text-ink-600">
              {tr('This game reads a unit from your book. Ask a grown-up to add the book and its units first.')}
            </p>
            <Button className="mt-3" onClick={() => navigate(back)}>
              {tr('Back to games')}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {units.map((item) => (
              <button
                key={`${item.book.id}:${item.unit.id}`}
                onClick={() => start(item)}
                data-testid="board-unit"
                className="flex items-center gap-3 rounded-3xl border-2 border-white bg-white/80 p-3.5 text-start"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky/20 text-sky">
                  <LayoutList className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-extrabold text-ink-950">{item.unit.title}</span>
                  <span className="text-[10px] font-semibold text-ink-600">
                    {tr('From page {page} of {book}', { page: num(item.unit.startPage), book: item.book.title })}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )
      ) : loading ? (
        <Card className="p-5 text-center text-xs font-semibold text-ink-600">{tr('Opening your book…')}</Card>
      ) : noText || !round ? (
        <Card className="p-5 text-center" data-testid="board-notext">
          <p className="text-sm font-extrabold text-ink-950">{tr('No page to restore in this unit yet')}</p>
          <p className="mt-1 text-[11px] font-semibold text-ink-600">
            {tr('The text of this unit is empty or has no run of sentences to put in order, so there is nothing to restore. Try another unit.')}
          </p>
          <Button className="mt-3" onClick={() => setActive(null)}>
            {tr('Pick another unit')}
          </Button>
        </Card>
      ) : (
        <Card className="border-2 border-white p-4">
          <p className="text-[10px] font-semibold text-ink-600">
            {active.unit.title} · {tr('Page {page} of {book}', { page: num(round.page), book: active.book.title })}
          </p>
          <p className="mt-2 text-[11px] font-bold text-ink-700">{tr('Tap the sentences in the order they come on the page.')}</p>

          <div className="mt-2 flex min-h-[56px] flex-col gap-1.5 rounded-2xl bg-sky/10 p-2.5" data-testid="board-track">
            {placed.map((i) => (
              <span key={i} data-testid="board-placed" className="w-full rounded-xl border-2 border-aurora-500 bg-aurora-400/20 px-3 py-2 text-sm leading-relaxed font-extrabold text-ink-950">
                {round.sentences[i]}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-2" data-testid="board-cars">
            {order.map((i) => (
              <button
                key={i}
                onClick={() => tap(i)}
                disabled={placed.includes(i)}
                data-testid="board-car"
                data-sentence={round.sentences[i]}
                className={cn('w-full rounded-xl border-2 border-white bg-amber-100 px-3 py-2 text-start text-sm font-bold leading-relaxed text-ink-950 transition disabled:opacity-30')}
              >
                {round.sentences[i]}
              </button>
            ))}
          </div>

          {placed.length > 0 && !done && (
            <Button size="sm" variant="secondary" className="mt-3" onClick={undo} data-testid="board-undo">
              <Undo2 className="h-3.5 w-3.5" /> {tr('Take back the last sentence')}
            </Button>
          )}

          {hint && !done && (
            <p className="mt-3 rounded-xl bg-sun/15 px-3 py-2 text-[11px] font-bold text-amber-800" data-testid="board-hint">
              <Lightbulb className="me-1 inline h-3.5 w-3.5" /> {tr('That sentence does not come next. Read them again. Take your time.')}
            </p>
          )}

          {done && (
            <div className="mt-3 rounded-2xl bg-aurora-400/15 p-3 text-center" data-testid="board-done">
              <p className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-ink-950">
                <CheckCircle2 className="h-4 w-4 text-aurora-600" /> {tr('The board is restored. This is the order of your book page.')}
              </p>
              <p className="mt-1 text-[10px] font-semibold text-ink-600">{tr('Page {page} of {book}', { page: num(round.page), book: active.book.title })}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <Button size="sm" onClick={() => start(active)}>
                  <RotateCcw className="h-3.5 w-3.5" /> {tr('Another board')}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setActive(null)}>
                  {tr('Pick another unit')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export function KidsLessonBoard() {
  return <LessonBoard kids />
}
