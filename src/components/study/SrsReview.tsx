import { useEffect, useMemo, useState } from 'react'
import { Brain, Check, ChevronRight, RotateCcw, Sparkles, TimerReset } from 'lucide-react'
import type { SRSCard } from '@/types'
import { dueCards, putCard } from '@/lib/db'
import { scheduleCard, type Grade } from '@/lib/srs'
import { cn } from '@/lib/utils'
import { useApp } from '@/store/useApp'
import { Button } from '@/components/ui/Button'
import { Markdown } from '@/components/Markdown'
import { Mascot } from '@/components/Mascot'
import { ProgressBar } from '@/components/ui/Card'
import { tr } from '@/i18n'

const gradeMeta: { grade: Grade; label: string; hint: string; className: string }[] = [
  { grade: 'again', label: "Again", hint: "10 min", className: 'border-coral/40 bg-coral/10 text-coral hover:bg-coral/20' },
  { grade: 'hard', label: "Hard", hint: "1 day", className: 'border-sun/40 bg-sun/10 text-sun hover:bg-sun/20' },
  { grade: 'good', label: "Good", hint: "3 days", className: 'border-aurora-400/40 bg-aurora-400/10 text-aurora-200 hover:bg-aurora-400/20' },
  { grade: 'easy', label: "Easy", hint: "1 week", className: 'border-violet-neon/40 bg-violet-neon/10 text-violet-glow hover:bg-violet-neon/20' },
]

export function SrsReview({
  deck,
  bookId,
  onDone,
  compact,
}: {
  deck?: SRSCard[]
  bookId?: string
  onDone?: (stats: { reviewed: number; again: number }) => void
  compact?: boolean
}) {
  const xp = useApp((s) => s.xp)
  const addXP = useApp((s) => s.addXP)
  const track = useApp((s) => s.track)
  const [queue, setQueue] = useState<SRSCard[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewed, setReviewed] = useState(0)
  const [again, setAgain] = useState(0)
  const [finished, setFinished] = useState(false)
  const [session, setSession] = useState(0)

  const load = async () => {
    setLoading(true)
    setFinished(false)
    setIndex(0)
    setReviewed(0)
    setAgain(0)
    setFlipped(false)
    let cards = deck ? [...deck] : await dueCards()
    if (bookId) cards = cards.filter((c) => c.bookId === bookId)
    setQueue(cards)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, deck, session])

  const card = queue[index]
  const previews = useMemo(() => {
    if (!card) return null
    return gradeMeta.map((g) => ({ ...g, next: scheduleCard(card, g.grade) }))
  }, [card])

  const grade = async (g: Grade) => {
    if (!card) return
    const updated = scheduleCard(card, g)
    await putCard(updated)
    setReviewed((r) => r + 1)
    if (g === 'again') setAgain((a) => a + 1)
    addXP(g === 'again' ? 1 : 3, true)
    track('cards', 1)
    if (index + 1 >= queue.length) {
      setFinished(true)
      onDone?.({ reviewed: reviewed + 1, again: again + (g === 'again' ? 1 : 0) })
    } else {
      setIndex((i) => i + 1)
      setFlipped(false)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return
      if (e.code === 'Space') {
        e.preventDefault()
        setFlipped(true)
      }
      if (flipped && ['1', '2', '3', '4'].includes(e.key)) {
        const g = gradeMeta[Number(e.key) - 1].grade
        grade(g)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, flipped, index, queue])

  if (loading) {
    return <div className="py-10 text-center text-[11px] text-muted">{tr("Shuffling your memory deck…")}</div>
  }

  if (!queue.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Mascot xp={xp} size={110} mood="sleepy" />
        <div>
          <p className="text-sm font-extrabold text-main">{tr("No cards due right now.")}</p>
          <p className="mt-1 text-[11px] text-muted">{tr("Generate flashcards from a chapter, or come back when your next review unlocks.")}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load}>
          <RotateCcw className="h-3.5 w-3.5" /> {tr("Check again")}
        </Button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <Mascot xp={xp} size={140} mood="celebrate" />
        <h3 className="font-display text-xl font-extrabold text-main">{tr("Memory session complete")}</h3>
        <p className="max-w-sm text-[11px] leading-relaxed text-muted">
          {tr("You reviewed")} {reviewed} {tr("card")}{reviewed === 1 ? '' : 's'} {tr("and strengthened the neural path. Jessica scheduled the next perfect moment for each one.")}
        </p>
        <div className="grid w-full max-w-sm grid-cols-3 gap-2">
          {[
            { label: tr("Reviewed"), value: reviewed },
            { label: tr("Again"), value: again },
            { label: tr("XP"), value: `+${Math.max(1, reviewed * 3)}` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-card-2 p-2">
              <p className="font-display text-lg font-extrabold text-main">{s.value}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted">{s.label}</p>
            </div>
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setSession((s) => s + 1)}>
          <TimerReset className="h-3.5 w-3.5" /> {tr("Check for more")}
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Brain className="h-4 w-4 text-aurora-300" />
          <p className="text-[11px] font-bold text-main">{tr("Spaced repetition")}</p>
          <span className="chip">{card.subject}</span>
        </div>
        <p className="text-[10px] font-semibold text-muted">{index + 1} / {queue.length}</p>
      </div>
      <ProgressBar value={index} max={queue.length} height="h-1.5" className="mb-4" />

      <div className="[perspective:1400px]">
        <button
          onClick={() => setFlipped((v) => !v)}
          className={cn(
            'relative block w-full text-left transition-transform duration-500 [transform-style:preserve-3d]',
            compact ? 'min-h-[200px]' : 'min-h-[250px]',
            flipped && '[transform:rotateY(180deg)]',
          )}
          style={{ transformStyle: 'preserve-3d' }}
          aria-label={tr("Flip flashcard")}
        >
          <div className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-line bg-gradient-to-br from-card-2 via-card to-card-2 p-4 [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="chip border-aurora-400/25 bg-aurora-400/10 text-aurora-200">
                <Sparkles className="h-3 w-3" /> {tr("Front")}
              </span>
              <span className="text-[9px] font-semibold text-muted-2">{tr("tap to flip")}</span>
            </div>
            <p className="py-4 text-center font-display text-lg font-extrabold leading-snug text-main">{card.front}</p>
            <p className="text-center text-[9px] text-muted-2">{card.source}</p>
          </div>
          <div className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-aurora-400/30 bg-gradient-to-br from-aurora-400/15 via-card to-violet-neon/10 p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="flex items-center justify-between">
              <span className="chip border-aurora-400/30 text-aurora-200">{tr("Back")}</span>
              <span className="text-[9px] font-semibold text-muted-2">{tr("tap to hide")}</span>
            </div>
            <div className="max-h-40 overflow-y-auto py-3">
              <Markdown className="text-center text-[13px] leading-6">{card.back}</Markdown>
            </div>
            <p className="text-center text-[9px] text-muted-2">{tr("Reps")} {card.reps} {tr("· ease")} {card.ease.toFixed(1)}</p>
          </div>
        </button>
      </div>

      {!flipped ? (
        <Button className="mt-4 w-full" onClick={() => setFlipped(true)}>
          {tr("Show answer")} <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {previews?.map((p) => (
            <button
              key={p.grade}
              onClick={() => grade(p.grade)}
              className={cn('rounded-xl border px-2 py-2.5 text-center transition', p.className)}
            >
              <span className="block text-[11px] font-extrabold">{p.label}</span>
              <span className="block text-[9px] opacity-80">
                {p.next.interval < 1
                  ? '10 min'
                  : p.next.interval < 2
                    ? '1 day'
                    : p.next.interval < 7
                      ? tr('{n} days', { n: Math.round(p.next.interval) })
                      : `${Math.round(p.next.interval / 7)} weeks`}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-[9px] text-muted-2">
        <span>{tr("Space to reveal · 1-4 to grade")}</span>
        <span className="flex items-center gap-0.5"><Check className="h-3 w-3 text-aurora-400" /> {tr("+3 XP per rep")}</span>
      </div>
    </div>
  )
}
