import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, RotateCcw, Search } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { openChapter } from '@/lib/library'
import { clueDisplay, detectiveCaseFor, isEvidence, type DetectiveCase } from '@/lib/detective'
import type { Book, BookUnit } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

interface Picked {
  book: Book
  unit: BookUnit
}

/** Book detective. Tap the two sentences from the book that hold the clue word. No timer, no penalty. */
export function BookDetective({ kids = false }: { kids?: boolean }) {
  const navigate = useNavigate()
  const customBooks = useApp((s) => s.customBooks)
  const grade = useApp((s) => s.settings.gradeLevel)
  const books = useMemo(() => customBooks.filter((b) => (b.grade ?? grade) === grade), [customBooks, grade])
  const units = useMemo(() => books.flatMap((book) => (book.units || []).map((unit) => ({ book, unit }))), [books])
  const [active, setActive] = useState<Picked | null>(null)
  const [round, setRound] = useState<DetectiveCase | null>(null)
  const [loading, setLoading] = useState(false)
  const [noText, setNoText] = useState(false)
  const [found, setFound] = useState<number[]>([])
  const [hint, setHint] = useState(false)

  const start = async (item: Picked) => {
    setActive(item)
    setRound(null)
    setNoText(false)
    setFound([])
    setHint(false)
    setLoading(true)
    try {
      const chapter = await openChapter(item.book)
      const next = detectiveCaseFor(chapter, item.unit.startPage, item.unit.endPage)
      if (next) setRound(next)
      else setNoText(true)
    } catch {
      setNoText(true)
    } finally {
      setLoading(false)
    }
  }

  const tap = (id: number) => {
    if (!round || found.includes(id)) return
    const sentence = round.sentences.find((s) => s.id === id)
    if (!sentence) return
    if (sentence.evidence && isEvidence(sentence.text, round.clue)) {
      setFound([...found, id])
      setHint(false)
    } else {
      setHint(true)
    }
  }

  const done = round ? found.length === 2 : false
  const back = kids ? '/kids/play' : '/games'

  return (
    <div className="mx-auto max-w-2xl space-y-4" data-testid="book-detective">
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
            <Search className="h-5 w-5 text-sky" /> {tr('Book detective')}
          </h1>
          <p className="text-[11px] font-semibold text-ink-600">{tr('Find the two sentences in your book that hold the clue word.')}</p>
        </div>
      </div>

      {!active ? (
        units.length === 0 ? (
          <Card className="p-5 text-center" data-testid="detective-empty">
            <p className="text-sm font-extrabold text-ink-950">{tr('No case for your books yet')}</p>
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
                data-testid="detective-unit"
                className="flex items-center gap-3 rounded-3xl border-2 border-white bg-white/80 p-3.5 text-start"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky/20 text-sky">
                  <Search className="h-5 w-5" />
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
        <Card className="p-5 text-center" data-testid="detective-notext">
          <p className="text-sm font-extrabold text-ink-950">{tr('No clear passage in this unit yet')}</p>
          <p className="mt-1 text-[11px] font-semibold text-ink-600">
            {tr('The text of this unit is empty or too short, so there is nothing to investigate. Try another unit.')}
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
          <p className="mt-2 rounded-2xl bg-sun/20 px-3 py-2 text-sm font-extrabold text-ink-950" data-testid="detective-clue">
            {tr('The clue word is')} «{clueDisplay(round)}»
          </p>
          <p className="mt-2 text-[11px] font-bold text-ink-700">
            {tr('Tap the two sentences that mention it.')} ({num(found.length)}/{num(2)})
          </p>

          <div className="mt-2 space-y-2" data-testid="detective-passage">
            {round.sentences.map((s) => {
              const ok = found.includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => tap(s.id)}
                  data-testid="detective-sentence"
                  data-evidence={s.evidence ? '1' : '0'}
                  aria-pressed={ok}
                  className={cn(
                    'w-full rounded-2xl border-2 p-3 text-start text-sm font-semibold leading-relaxed',
                    ok ? 'border-aurora-500 bg-aurora-400/20 text-ink-950' : 'border-white bg-white/80 text-ink-900',
                  )}
                >
                  {s.text}
                </button>
              )
            })}
          </div>

          {hint && !done && (
            <p className="mt-3 rounded-xl bg-sun/15 px-3 py-2 text-[11px] font-bold text-amber-800" data-testid="detective-hint">
              {tr('That sentence does not have the clue word. Look again. Take your time.')}
            </p>
          )}

          {done && (
            <div className="mt-3 rounded-2xl bg-aurora-400/15 p-3 text-center" data-testid="detective-done">
              <p className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-ink-950">
                <CheckCircle2 className="h-4 w-4 text-aurora-600" /> {tr('You found both pieces of evidence.')}
              </p>
              <p className="mt-1 text-[10px] font-semibold text-ink-600">
                {tr('Page {page} of {book}', { page: num(round.page), book: active.book.title })}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <Button size="sm" onClick={() => start(active)}>
                  <RotateCcw className="h-3.5 w-3.5" /> {tr('Another case')}
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

export function KidsBookDetective() {
  return <BookDetective kids />
}
