import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Lightbulb, RotateCcw, TrainFront, Undo2 } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { openChapter } from '@/lib/library'
import { makeTrainRound, shuffledOrder, type TrainRound } from '@/lib/wordTrain'
import type { Book, BookUnit } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

interface Picked {
  book: Book
  unit: BookUnit
}

/** Word train. Tap the word cars in order to rebuild a sentence from the book. No drag needed, no timer, no penalty. */
export function WordTrain({ kids = false }: { kids?: boolean }) {
  const navigate = useNavigate()
  const customBooks = useApp((s) => s.customBooks)
  const grade = useApp((s) => s.settings.gradeLevel)
  const books = useMemo(() => customBooks.filter((b) => (b.grade ?? grade) === grade), [customBooks, grade])
  const units = useMemo(() => books.flatMap((book) => (book.units || []).map((unit) => ({ book, unit }))), [books])
  const [active, setActive] = useState<Picked | null>(null)
  const [round, setRound] = useState<TrainRound | null>(null)
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
      const next = makeTrainRound(chapter, item.unit.startPage, item.unit.endPage)
      if (next) {
        setRound(next)
        setOrder(shuffledOrder(next.words.length))
      } else setNoText(true)
    } catch {
      setNoText(true)
    } finally {
      setLoading(false)
    }
  }

  const tap = (index: number) => {
    if (!round || placed.includes(index)) return
    // a car is right when its word is the next word (a repeated word can go in either place)
    if (round.words[index] === round.words[placed.length]) {
      setPlaced([...placed, index])
      setHint(false)
    } else setHint(true)
  }

  const undo = () => {
    setPlaced(placed.slice(0, -1))
    setHint(false)
  }

  const done = round ? placed.length === round.words.length : false
  const back = kids ? '/kids/play' : '/games'

  return (
    <div className="mx-auto max-w-2xl space-y-4" data-testid="word-train">
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
            <TrainFront className="h-5 w-5 text-sky" /> {tr('Word train')}
          </h1>
          <p className="text-[11px] font-semibold text-ink-600">{tr('Tap the word cars in order to rebuild a sentence from your book.')}</p>
        </div>
      </div>

      {!active ? (
        units.length === 0 ? (
          <Card className="p-5 text-center" data-testid="train-empty">
            <p className="text-sm font-extrabold text-ink-950">{tr('No train for your books yet')}</p>
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
                data-testid="train-unit"
                className="flex items-center gap-3 rounded-3xl border-2 border-white bg-white/80 p-3.5 text-start"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky/20 text-sky">
                  <TrainFront className="h-5 w-5" />
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
        <Card className="p-5 text-center" data-testid="train-notext">
          <p className="text-sm font-extrabold text-ink-950">{tr('No short sentence in this unit yet')}</p>
          <p className="mt-1 text-[11px] font-semibold text-ink-600">
            {tr('The text of this unit is empty or has no short sentence, so there is nothing to build. Try another unit.')}
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
          <p className="mt-2 text-[11px] font-bold text-ink-700">{tr('Tap the words in the right order.')}</p>

          <div className="mt-2 flex min-h-[56px] flex-wrap gap-1.5 rounded-2xl bg-sky/10 p-2.5" data-testid="train-track">
            {placed.map((i) => (
              <span key={i} data-testid="train-placed" className="rounded-xl border-2 border-aurora-500 bg-aurora-400/20 px-3 py-1.5 text-sm font-extrabold text-ink-950">
                {round.words[i]}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2" data-testid="train-cars">
            {order.map((i) => (
              <button
                key={i}
                onClick={() => tap(i)}
                disabled={placed.includes(i)}
                data-testid="train-car"
                data-word={round.words[i]}
                className={cn('rounded-xl border-2 border-white bg-amber-100 px-3 py-2 text-sm font-extrabold text-ink-950 transition disabled:opacity-30')}
              >
                {round.words[i]}
              </button>
            ))}
          </div>

          {placed.length > 0 && !done && (
            <Button size="sm" variant="secondary" className="mt-3" onClick={undo} data-testid="train-undo">
              <Undo2 className="h-3.5 w-3.5" /> {tr('Take back the last word')}
            </Button>
          )}

          {hint && !done && (
            <p className="mt-3 rounded-xl bg-sun/15 px-3 py-2 text-[11px] font-bold text-amber-800" data-testid="train-hint">
              <Lightbulb className="me-1 inline h-3.5 w-3.5" /> {tr('That word does not come next. Read the sentence in your head. Take your time.')}
            </p>
          )}

          {done && (
            <div className="mt-3 rounded-2xl bg-aurora-400/15 p-3 text-center" data-testid="train-done">
              <p className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-ink-950">
                <CheckCircle2 className="h-4 w-4 text-aurora-600" /> {tr('The train is ready. This is the sentence from your book.')}
              </p>
              <p className="mt-1 text-[10px] font-semibold text-ink-600">{tr('Page {page} of {book}', { page: num(round.page), book: active.book.title })}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <Button size="sm" onClick={() => start(active)}>
                  <RotateCcw className="h-3.5 w-3.5" /> {tr('Another train')}
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

export function KidsWordTrain() {
  return <WordTrain kids />
}
