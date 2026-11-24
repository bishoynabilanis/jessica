import { useMemo, useState } from 'react'
import { CheckCircle2, Hand, Lightbulb, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

/**
 * Hands-in activity for a kids lab. It only reuses the words the lab already
 * shows (stage names and part jobs), so nothing new is taught. Tap to do it,
 * no timer, no penalty, a wrong tap only shows a gentle hint.
 *  - order: tap the stages in the order the lab describes.
 *  - match: read what a part does, tap the part.
 */
export type HandsInItem = { label: string; clue?: string }

function shuffled<T>(list: T[]) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  // never start already solved
  return copy.length > 1 && copy.every((item, i) => item === list[i]) ? copy.reverse() : copy
}

export function HandsIn({ id, mode, items, title, prompt, hint, source }: { id: string; mode: 'order' | 'match'; items: HandsInItem[]; title: string; prompt: string; hint: string; source?: string }) {
  const [round, setRound] = useState(0)
  const options = useMemo(() => shuffled(items), [items, round]) // eslint-disable-line react-hooks/exhaustive-deps
  const [done, setDone] = useState<string[]>([])
  const [wrong, setWrong] = useState(false)
  const target = items[done.length]
  const finished = done.length === items.length

  const tap = (label: string) => {
    if (finished || done.includes(label)) return
    if (label === target.label) {
      setDone([...done, label])
      setWrong(false)
    } else setWrong(true)
  }

  const again = () => {
    setDone([])
    setWrong(false)
    setRound(round + 1)
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-sun/40 bg-sun/10 p-3" data-testid={`handsin-${id}`}>
      <p className="flex items-center gap-1.5 text-xs font-extrabold text-ink-950">
        <Hand className="h-4 w-4 text-sun" /> {title}
      </p>
      <p className="mt-1 text-[11px] font-semibold text-ink-700">{prompt}</p>
      {source && <p className="text-[10px] font-semibold text-ink-600">{source}</p>}

      {!finished && mode === 'match' && (
        <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-sm font-extrabold text-ink-950" data-testid="handsin-clue">
          {tr(target.clue || '')}
        </p>
      )}

      {mode === 'order' && (
        <ol className="mt-2 flex flex-wrap gap-1.5" data-testid="handsin-slots">
          {items.map((item, index) => (
            <li key={item.label} className={cn('min-w-[72px] rounded-xl border-2 border-dashed px-2 py-1.5 text-center text-[11px] font-extrabold', done[index] ? 'border-aurora-500 bg-aurora-400/20 text-ink-950' : 'border-ink-300 bg-white/60 text-ink-500')}>
              {num(index + 1)}. {done[index] ? tr(done[index]) : '＿'}
            </li>
          ))}
        </ol>
      )}
      {mode === 'match' && done.length > 0 && (
        <p className="mt-2 text-[11px] font-bold text-aurora-700" data-testid="handsin-found">
          {done.map((label) => tr(label)).join(' · ')}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((item) => (
          <button
            key={item.label}
            onClick={() => tap(item.label)}
            disabled={done.includes(item.label)}
            data-testid="handsin-option"
            data-label={item.label}
            className="rounded-xl border-2 border-white bg-white px-3 py-2 text-xs font-extrabold text-ink-950 disabled:opacity-30"
          >
            {tr(item.label)}
          </button>
        ))}
      </div>

      {wrong && !finished && (
        <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-[11px] font-bold text-amber-800" data-testid="handsin-hint">
          <Lightbulb className="me-1 inline h-3.5 w-3.5" /> {hint} {tr('Try another one. Take your time.')}
        </p>
      )}

      {finished && (
        <div className="mt-2 rounded-xl bg-aurora-400/15 p-2.5 text-center" data-testid="handsin-done">
          <p className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-ink-950">
            <CheckCircle2 className="h-4 w-4 text-aurora-600" /> {tr('You did it. Well done!')}
          </p>
          <Button size="sm" className="mt-2" onClick={again}>
            <RotateCcw className="h-3.5 w-3.5" /> {tr('Play again')}
          </Button>
        </div>
      )}
    </div>
  )
}
