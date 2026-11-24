import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, CheckCircle2, Equal, NotebookPen, RotateCcw } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { addNotebookEntry, compare, entriesFor, loadNotebook, secondDiffers, type NotebookEntry, type Trend } from '@/lib/labNotebook'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

const TRENDS: Array<{ id: Trend; label: string; icon: typeof ArrowUp }> = [
  { id: 'up', label: 'Goes up or gets bigger', icon: ArrowUp },
  { id: 'down', label: 'Goes down or gets smaller', icon: ArrowDown },
  { id: 'same', label: 'Stays the same', icon: Equal },
]

const trendLabel = (id: Trend) => tr(TRENDS.find((item) => item.id === id)!.label)

function TrendPick({ value, onChange, testid }: { value: Trend | null; onChange: (t: Trend) => void; testid: string }) {
  return (
    <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
      {TRENDS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          data-testid={`${testid}-${id}`}
          className={cn(
            'flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-start text-[11px] font-bold',
            value === id ? 'border-sun bg-sun/25 text-ink-950' : 'border-line bg-white/70 text-ink-800',
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" /> {tr(label)}
        </button>
      ))}
    </div>
  )
}

/**
 * Lab rescue mission and predict-test-compare notebook, one engine.
 * Predict, try, change ONE thing, try again, compare, explain. No timer, no score.
 */
export function LabNotebook({ bookId, unitId, lab, page }: { bookId: string; unitId: string; lab: string; page: number }) {
  const book = useApp((s) => s.customBooks.find((item) => item.id === bookId))
  const unit = book?.units?.find((item) => item.id === unitId)
  const [step, setStep] = useState(0)
  const [watching, setWatching] = useState('')
  const [prediction, setPrediction] = useState<Trend | null>(null)
  const [r1, setR1] = useState<Trend | null>(null)
  const [n1, setN1] = useState('')
  const [changed, setChanged] = useState('')
  const [r2, setR2] = useState<Trend | null>(null)
  const [n2, setN2] = useState('')
  const [explanation, setExplanation] = useState('')
  const [saved, setSaved] = useState(false)
  const [all, setAll] = useState<NotebookEntry[]>(() => loadNotebook())
  const mine = useMemo(() => entriesFor(all, bookId, unitId, lab), [all, bookId, unitId, lab])

  if (!book || !unit) return null

  const reset = () => {
    setStep(0)
    setWatching('')
    setPrediction(null)
    setR1(null)
    setN1('')
    setChanged('')
    setR2(null)
    setN2('')
    setExplanation('')
    setSaved(false)
  }

  const canNext = [watching.trim().length > 0 && prediction !== null, r1 !== null, changed.trim().length > 0 && r2 !== null][step]

  const draft =
    prediction && r1 && r2
      ? { prediction, first: { changed: '', result: r1, note: n1.trim() }, second: { changed: changed.trim(), result: r2, note: n2.trim() } }
      : null

  const save = () => {
    if (!draft || explanation.trim().length === 0) return
    setAll(
      addNotebookEntry({
        bookId,
        unitId,
        lab,
        page,
        watching: watching.trim(),
        prediction: draft.prediction,
        first: draft.first,
        second: draft.second,
        explanation: explanation.trim(),
      }),
    )
    setSaved(true)
  }

  const titles = ['Predict', 'Try it', 'Change one thing', 'Compare and explain']

  return (
    <section className="rounded-3xl border-2 border-sun/40 bg-sun/10 p-4" data-testid="lab-notebook">
      <p className="flex items-center gap-2 text-sm font-extrabold text-main">
        <NotebookPen className="h-4 w-4 text-sun" /> {tr('Lab mission: predict, test, compare')}
      </p>
      <p className="mt-1 text-[11px] font-semibold text-muted">
        {tr('Use the lab above. Write what you think first, then test it. Nobody is graded here.')} ·{' '}
        {tr('From page {page} of {book}', { page: num(page), book: book.title })}
      </p>

      {!saved && (
        <>
          <ol className="mt-3 flex flex-wrap gap-1.5" aria-label={tr('Steps')}>
            {titles.map((title, index) => (
              <li
                key={title}
                aria-current={index === step ? 'step' : undefined}
                className={cn('rounded-full px-2.5 py-1 text-[10px] font-extrabold', index === step ? 'bg-sun text-ink-950' : index < step ? 'bg-aurora-400/25 text-main' : 'bg-white/50 text-muted')}
              >
                {num(index + 1)}. {tr(title)}
              </li>
            ))}
          </ol>

          <div className="mt-3 space-y-2" data-testid={`notebook-step-${step}`}>
            {step === 0 && (
              <>
                <label className="block text-[11px] font-extrabold text-main" htmlFor="nb-watching">
                  {tr('What will you watch in the lab?')}
                </label>
                <input id="nb-watching" value={watching} onChange={(e) => setWatching(e.target.value.slice(0, 80))} data-testid="notebook-watching" className="w-full rounded-xl border-2 border-line bg-white px-3 py-2 text-sm text-ink-950" />
                <p className="text-[11px] font-extrabold text-main">{tr('What do you think will happen to it?')}</p>
                <TrendPick value={prediction} onChange={setPrediction} testid="notebook-predict" />
              </>
            )}
            {step === 1 && (
              <>
                <p className="text-[11px] font-extrabold text-main">{tr('Play with the lab above. What happened to “{thing}”?', { thing: watching })}</p>
                <TrendPick value={r1} onChange={setR1} testid="notebook-try1" />
                <input value={n1} onChange={(e) => setN1(e.target.value.slice(0, 120))} placeholder={tr('Anything you noticed (optional)')} aria-label={tr('Anything you noticed (optional)')} className="w-full rounded-xl border-2 border-line bg-white px-3 py-2 text-sm text-ink-950" />
              </>
            )}
            {step === 2 && (
              <>
                <label className="block text-[11px] font-extrabold text-main" htmlFor="nb-changed">
                  {tr('Now change only ONE thing in the lab. What did you change?')}
                </label>
                <input id="nb-changed" value={changed} onChange={(e) => setChanged(e.target.value.slice(0, 80))} data-testid="notebook-changed" className="w-full rounded-xl border-2 border-line bg-white px-3 py-2 text-sm text-ink-950" />
                <p className="text-[11px] font-extrabold text-main">{tr('What happened to “{thing}” this time?', { thing: watching })}</p>
                <TrendPick value={r2} onChange={setR2} testid="notebook-try2" />
                <input value={n2} onChange={(e) => setN2(e.target.value.slice(0, 120))} placeholder={tr('Anything you noticed (optional)')} aria-label={tr('Anything you noticed (optional)')} className="w-full rounded-xl border-2 border-line bg-white px-3 py-2 text-sm text-ink-950" />
              </>
            )}
            {step === 3 && draft && (
              <>
                <div className="overflow-hidden rounded-2xl border-2 border-white bg-white/80 text-[11px] font-semibold text-ink-900" data-testid="notebook-compare">
                  <p className="border-b border-line px-3 py-2"><b>{tr('Your prediction')}:</b> {trendLabel(draft.prediction)}</p>
                  <p className="border-b border-line px-3 py-2"><b>{tr('Try 1')}:</b> {trendLabel(draft.first.result)}</p>
                  <p className="px-3 py-2"><b>{tr('Try 2')} ({draft.second.changed}):</b> {trendLabel(draft.second.result)}</p>
                </div>
                <p className="text-[11px] font-bold text-ink-800" data-testid="notebook-verdict">
                  {compare(draft) === 'prediction-right' ? tr('Your prediction matched Try 1. Nice thinking.') : tr('Try 1 was different from your prediction. That is useful: scientists learn from it.')}{' '}
                  {secondDiffers(draft) ? tr('Changing that one thing gave a different result.') : tr('Changing that one thing gave the same result.')}
                </p>
                <label className="block text-[11px] font-extrabold text-main" htmlFor="nb-explain">
                  {tr('Explain in your own words what changed and why.')}
                </label>
                <textarea id="nb-explain" value={explanation} onChange={(e) => setExplanation(e.target.value.slice(0, 400))} rows={3} data-testid="notebook-explain" className="w-full rounded-xl border-2 border-line bg-white px-3 py-2 text-sm text-ink-950" />
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {step > 0 && (
              <Button size="sm" variant="secondary" onClick={() => setStep(step - 1)}>
                {tr('Back')}
              </Button>
            )}
            {step < 3 ? (
              <Button size="sm" disabled={!canNext} onClick={() => setStep(step + 1)} data-testid="notebook-next">
                {tr('Next')}
              </Button>
            ) : (
              <Button size="sm" disabled={explanation.trim().length === 0} onClick={save} data-testid="notebook-save">
                {tr('Save in my notebook')}
              </Button>
            )}
          </div>
        </>
      )}

      {saved && (
        <div className="mt-3 rounded-2xl bg-aurora-400/15 p-3 text-center" data-testid="notebook-saved">
          <p className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-main">
            <CheckCircle2 className="h-4 w-4 text-aurora-600" /> {tr('Saved in your notebook on this device.')}
          </p>
          <Button size="sm" className="mt-2" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> {tr('Another experiment')}
          </Button>
        </div>
      )}

      {mine.length > 0 && (
        <div className="mt-4" data-testid="notebook-entries">
          <p className="text-[11px] font-extrabold text-main">{tr('My notebook for this lesson')}</p>
          <ul className="mt-1.5 space-y-1.5">
            {mine.slice(0, 5).map((entry) => (
              <li key={entry.id} data-testid="notebook-entry" className="rounded-xl bg-white/70 px-3 py-2 text-[11px] font-semibold text-ink-900">
                <b>{entry.watching}</b>: {trendLabel(entry.prediction)} → {trendLabel(entry.first.result)} → {trendLabel(entry.second.result)}
                <span className="mt-0.5 block text-ink-700">{entry.explanation}</span>
                <span className="block text-[10px] text-ink-600">{tr('Page {page} of {book}', { page: num(entry.page), book: book.title })}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
