import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bus, CheckCircle2, Construction, Flag, Lightbulb, RotateCcw, Waves } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { bridgeHint, bridgeUnits, makeBridgeRound, type BridgeRound, type BridgeUnit } from '@/lib/bridge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

/** Bridge rescue. Tap a plank, then tap the gap it fits. No timer, no penalty, no streak. */
export function BridgeRescue({ kids = false }: { kids?: boolean }) {
  const navigate = useNavigate()
  const customBooks = useApp((s) => s.customBooks)
  const grade = useApp((s) => s.settings.gradeLevel)
  const books = useMemo(() => customBooks.filter((b) => (b.grade ?? grade) === grade), [customBooks, grade])
  const units = useMemo(() => bridgeUnits(books), [books])
  const [active, setActive] = useState<BridgeUnit | null>(null)
  const [round, setRound] = useState<BridgeRound | null>(null)
  const [placed, setPlaced] = useState<Array<string | null>>([])
  const [held, setHeld] = useState<number | null>(null)
  const [hint, setHint] = useState('')
  const [shake, setShake] = useState<number | null>(null)

  const start = (unit: BridgeUnit) => {
    const next = makeBridgeRound(unit.kind)
    setActive(unit)
    setRound(next)
    setPlaced(next.gaps.map(() => null))
    setHeld(null)
    setHint('')
  }

  const usedPlanks = (list: Array<string | null>, planks: string[]) => {
    const used = new Set<number>()
    list.forEach((value) => {
      if (value === null) return
      const idx = planks.findIndex((p, i) => p === value && !used.has(i))
      if (idx >= 0) used.add(idx)
    })
    return used
  }

  const done = round ? placed.every((value) => value !== null) : false
  const back = kids ? '/kids/play' : '/games'
  const used = round ? usedPlanks(placed, round.planks) : new Set<number>()

  const dropOn = (gapIndex: number) => {
    if (!round) return
    if (placed[gapIndex] !== null) return
    if (held === null) {
      setHint(tr('Pick a plank first.'))
      return
    }
    const value = round.planks[held]
    if (value === round.gaps[gapIndex].answer) {
      const next = [...placed]
      next[gapIndex] = value
      setPlaced(next)
      setHeld(null)
      setHint('')
    } else {
      setShake(gapIndex)
      window.setTimeout(() => setShake(null), 450)
      setHint(tr(bridgeHint(round.kind)))
      setHeld(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4" data-testid="bridge-rescue">
      <div className="flex items-center gap-2">
        <button
          onClick={() => (active ? setActive(null) : navigate(back))}
          className="grid h-9 w-9 place-items-center rounded-xl border-2 border-white bg-white text-ink-700"
          aria-label={tr('Back')}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
        <div>
          <h1 className="flex items-center gap-1.5 font-display text-xl font-extrabold text-ink-950 sm:text-2xl"><Construction className="h-5 w-5 text-sun" /> {tr('Bridge rescue')}</h1>
          <p className="text-[11px] font-semibold text-ink-600">{tr('Put the right plank in every gap so the bus can cross.')}</p>
        </div>
      </div>

      {!active || !round ? (
        units.length === 0 ? (
          <Card className="p-5 text-center" data-testid="bridge-empty">
            <p className="text-sm font-extrabold text-ink-950">{tr('No bridge for your books yet')}</p>
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
                data-testid="bridge-unit"
                className="flex items-center gap-3 rounded-3xl border-2 border-white bg-white/80 p-3.5 text-start"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sun/20 text-ink-800"><Construction className="h-5 w-5" /></span>
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

          <div className="mt-3 rounded-3xl bg-gradient-to-b from-sky/20 to-aurora-400/10 p-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-testid="bridge-gaps">
              {round.gaps.map((gap, index) => {
                const value = placed[index]
                return (
                  <button
                    key={gap.prompt}
                    onClick={() => dropOn(index)}
                    data-testid="bridge-gap"
                    data-answer={gap.answer}
                    aria-label={gap.prompt}
                    className={cn(
                      'min-h-[84px] rounded-2xl border-2 border-dashed p-2 text-center transition',
                      value !== null ? 'border-aurora-500 bg-aurora-400/20' : held !== null ? 'border-sun bg-white' : 'border-ink-300 bg-white/70',
                      shake === index && 'animate-pulse border-coral',
                    )}
                  >
                    <bdi dir="ltr" className="block text-base font-black text-ink-950">{gap.prompt}</bdi>
                    <span className="mt-1 block text-lg font-black text-aurora-700">{value !== null ? <bdi dir="ltr">{value}</bdi> : '＿'}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-2 flex items-center justify-center gap-2 text-ink-800" aria-hidden>
              {done ? (
                <>
                  <Bus className="h-6 w-6" /> <Flag className="h-6 w-6 text-aurora-600" />
                </>
              ) : (
                <>
                  <Bus className="h-6 w-6" /> <Waves className="h-6 w-6 text-sky" /> <Waves className="h-6 w-6 text-sky" />
                </>
              )}
            </p>
          </div>

          <p className="mt-3 text-[11px] font-extrabold text-ink-700">{tr('Your planks')}</p>
          <div className="mt-1.5 flex flex-wrap gap-2" data-testid="bridge-planks">
            {round.planks.map((plank, index) => (
              <button
                key={`${plank}-${index}`}
                onClick={() => setHeld(held === index ? null : index)}
                disabled={used.has(index)}
                data-testid="bridge-plank"
                data-value={plank}
                className={cn(
                  'min-w-[56px] rounded-xl border-2 px-3 py-2 text-base font-black transition disabled:opacity-30',
                  held === index ? 'border-sun bg-sun/30' : 'border-white bg-amber-100 text-ink-950',
                )}
              >
                <bdi dir="ltr">{plank}</bdi>
              </button>
            ))}
          </div>

          {hint && (
            <p className="mt-3 rounded-xl bg-sun/15 px-3 py-2 text-[11px] font-bold text-amber-800" data-testid="bridge-hint">
              <Lightbulb className="me-1 inline h-3.5 w-3.5" /> {hint} {tr('Try another plank. Take your time.')}
            </p>
          )}

          {done && (
            <div className="mt-3 rounded-2xl bg-aurora-400/15 p-3 text-center" data-testid="bridge-done">
              <p className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-ink-950">
                <CheckCircle2 className="h-4 w-4 text-aurora-600" /> {tr('You fixed the bridge. The bus crossed!')}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <Button size="sm" onClick={() => start(active)}>
                  <RotateCcw className="h-3.5 w-3.5" /> {tr('Another bridge')}
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

export function KidsBridgeRescue() {
  return <BridgeRescue kids />
}
