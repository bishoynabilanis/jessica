import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Lightbulb, RotateCcw, SearchCheck } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { bridgeHint } from '@/lib/bridge'
import { makeMistakeRound, mistakeUnits, type MistakeRound, type MistakeUnit } from '@/lib/mistake'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

/** Find the lab's mistake. Tap the one line that has a wrong number. No timer, no penalty. */
export function LabMistake({ kids = false }: { kids?: boolean }) {
  const navigate = useNavigate()
  const customBooks = useApp((s) => s.customBooks)
  const grade = useApp((s) => s.settings.gradeLevel)
  const books = useMemo(() => customBooks.filter((b) => (b.grade ?? grade) === grade), [customBooks, grade])
  const units = useMemo(() => mistakeUnits(books), [books])
  const [active, setActive] = useState<MistakeUnit | null>(null)
  const [round, setRound] = useState<MistakeRound | null>(null)
  const [found, setFound] = useState(false)
  const [tried, setTried] = useState<number[]>([])

  const start = (unit: MistakeUnit) => {
    setActive(unit)
    setRound(makeMistakeRound(unit.kind))
    setFound(false)
    setTried([])
  }

  const tap = (index: number) => {
    if (!round || found) return
    if (!round.lines[index].ok) setFound(true)
    else if (!tried.includes(index)) setTried([...tried, index])
  }

  const back = kids ? '/kids/play' : '/games'
  const badIndex = round ? round.lines.findIndex((l) => !l.ok) : -1

  return (
    <div className="mx-auto max-w-2xl space-y-4" data-testid="lab-mistake">
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
            <SearchCheck className="h-5 w-5 text-coral" /> {tr("Find the lab's mistake")}
          </h1>
          <p className="text-[11px] font-semibold text-ink-600">{tr('One line on the lab board has a wrong number. Can you spot it?')}</p>
        </div>
      </div>

      {!active || !round ? (
        units.length === 0 ? (
          <Card className="p-5 text-center" data-testid="mistake-empty">
            <p className="text-sm font-extrabold text-ink-950">{tr('No lab board for your books yet')}</p>
            <p className="mt-1 text-[11px] font-semibold text-ink-600">
              {tr('This game needs a maths unit in your book, like fractions, equations or times tables. Try another game for now.')}
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
                data-testid="mistake-unit"
                className="flex items-center gap-3 rounded-3xl border-2 border-white bg-white/80 p-3.5 text-start"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-coral/15 text-coral">
                  <SearchCheck className="h-5 w-5" />
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
      ) : (
        <Card className="border-2 border-white p-4">
          <p className="text-[10px] font-semibold text-ink-600">
            {active.unit.title} · {tr('From page {page} of {book}', { page: num(active.unit.startPage), book: active.book.title })}
          </p>
          <p className="mt-2 text-[11px] font-bold text-ink-700">{tr('Tap the line with the mistake.')}</p>

          <div className="mt-2 space-y-2" data-testid="mistake-board">
            {round.lines.map((l, index) => (
              <button
                key={l.fixed}
                onClick={() => tap(index)}
                data-testid="mistake-line"
                data-bad={l.ok ? '0' : '1'}
                className={cn(
                  'w-full rounded-2xl border-2 p-3 text-center text-base font-black',
                  found && index === badIndex ? 'border-coral bg-coral/10 text-ink-950' : tried.includes(index) ? 'border-aurora-500 bg-aurora-400/15 text-ink-950' : 'border-white bg-white/80 text-ink-950',
                )}
              >
                <bdi dir="ltr">{l.text}</bdi>
                {found && index === badIndex && (
                  <span className="mt-1 block text-sm font-black text-aurora-700" data-testid="mistake-fixed">
                    <bdi dir="ltr">{l.fixed}</bdi>
                  </span>
                )}
              </button>
            ))}
          </div>

          {tried.length > 0 && !found && (
            <p className="mt-3 rounded-xl bg-sun/15 px-3 py-2 text-[11px] font-bold text-amber-800" data-testid="mistake-hint">
              <Lightbulb className="me-1 inline h-3.5 w-3.5" /> {tr('That line is right. Check the others.')} {tr(bridgeHint(round.kind))}
            </p>
          )}

          {found && (
            <div className="mt-3 rounded-2xl bg-aurora-400/15 p-3 text-center" data-testid="mistake-done">
              <p className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-ink-950">
                <CheckCircle2 className="h-4 w-4 text-aurora-600" /> {tr('You found the mistake and the right answer is shown.')}
              </p>
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

export function KidsLabMistake() {
  return <LabMistake kids />
}
