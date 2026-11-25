import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Delete, Check, Timer, Trophy, RotateCcw } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { openChapter } from '@/lib/library'
import { bookRange, loadRace, nextRound, saveRace, type BookRange, type Op, type RaceQuestion } from '@/lib/mathRace'
import type { Book, BookUnit } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

interface Picked {
  book: Book
  unit: BookUnit
}

const SECONDS = 60
const OP_LABEL: Record<Op, string> = { add: '+', sub: '−', mul: '×', div: '÷' }
const shown = (text: string) => text.replace(/\d+/g, (m) => num(Number(m)))

/** Each part sits in its own box, left to right, so Arabic digits never get reordered around the sign. */
function Expr({ text, answer }: { text: string; answer?: number }) {
  const parts = [...text.split(' '), ...(answer === undefined ? [] : ['=', String(answer)])]
  return (
    <span className="inline-flex items-center justify-center gap-3" dir="ltr">
      {parts.map((part, i) => (
        <span key={i}>{shown(part)}</span>
      ))}
    </span>
  )
}

/** 60-second mental math race. Size of numbers and operations come from the child's own math book unit. Best score stays on this device. */
export function MathRace({ kids = false }: { kids?: boolean }) {
  const navigate = useNavigate()
  const customBooks = useApp((s) => s.customBooks)
  const grade = useApp((s) => s.settings.gradeLevel)
  const books = useMemo(() => customBooks.filter((b) => b.subject === 'Mathematics' && (b.grade ?? grade) === grade), [customBooks, grade])
  const units = useMemo(() => books.flatMap((book) => (book.units || []).map((unit) => ({ book, unit }))), [books])
  const [active, setActive] = useState<Picked | null>(null)
  const [range, setRange] = useState<BookRange | null>(null)
  const [loading, setLoading] = useState(false)
  const [noRange, setNoRange] = useState(false)
  const [ops, setOps] = useState<Op[]>([])
  const [phase, setPhase] = useState<'ready' | 'play' | 'done'>('ready')
  const [questions, setQuestions] = useState<RaceQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [score, setScore] = useState(0)
  const [left, setLeft] = useState(SECONDS)
  const [lastWrong, setLastWrong] = useState<RaceQuestion | null>(null)
  const [newBest, setNewBest] = useState(false)
  const [save, setSave] = useState(loadRace)
  const wrongRef = useRef<RaceQuestion[]>([])
  const fixedRef = useRef<string[]>([])
  const scoreRef = useRef(0)
  const endAt = useRef(0)

  const key = active ? `${active.book.id}:${active.unit.id}` : ''
  const best = save.best[key] ?? 0

  const start = async (item: Picked) => {
    setActive(item)
    setRange(null)
    setNoRange(false)
    setPhase('ready')
    setLoading(true)
    try {
      const found = bookRange(await openChapter(item.book), item.unit.startPage, item.unit.endPage)
      if (found) {
        setRange(found)
        setOps(found.ops)
      } else setNoRange(true)
    } catch {
      setNoRange(true)
    } finally {
      setLoading(false)
    }
  }

  const go = () => {
    if (!range || !ops.length) return
    const fresh = loadRace()
    setSave(fresh)
    setQuestions(nextRound(ops, range.max, fresh.missed))
    setIndex(0)
    setTyped('')
    setScore(0)
    scoreRef.current = 0
    wrongRef.current = []
    fixedRef.current = []
    setLastWrong(null)
    setNewBest(false)
    endAt.current = Date.now() + SECONDS * 1000
    setLeft(SECONDS)
    setPhase('play')
  }

  useEffect(() => {
    if (phase !== 'play') return
    const id = window.setInterval(() => {
      const remaining = Math.max(0, (endAt.current - Date.now()) / 1000)
      setLeft(remaining)
      if (remaining <= 0) {
        window.clearInterval(id)
        const fresh = loadRace()
        const keep = fresh.missed.filter((q) => !fixedRef.current.includes(q.text))
        const merged = [...wrongRef.current, ...keep.filter((q) => !wrongRef.current.some((w) => w.text === q.text))]
        const final = scoreRef.current
        const isBest = final > (fresh.best[key] ?? 0)
        const next = { best: isBest ? { ...fresh.best, [key]: final } : fresh.best, missed: merged }
        saveRace(next)
        setSave(next)
        setNewBest(isBest && final > 0)
        setPhase('done')
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [phase, key])

  const submit = () => {
    const q = questions[index]
    if (!q || typed === '') return
    if (Number(typed) === q.answer) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      fixedRef.current.push(q.text)
      setLastWrong(null)
    } else {
      if (!wrongRef.current.some((w) => w.text === q.text)) wrongRef.current.push(q)
      setLastWrong(q)
    }
    setTyped('')
    setIndex((i) => i + 1)
  }

  useEffect(() => {
    if (phase !== 'play') return
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) setTyped((t) => (t.length < 4 ? t + e.key : t))
      else if (e.key === 'Backspace') setTyped((t) => t.slice(0, -1))
      else if (e.key === 'Enter') submit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const back = kids ? '/kids/play' : '/games'
  const q = questions[index]
  const toggle = (op: Op) => setOps((cur) => (cur.includes(op) ? (cur.length > 1 ? cur.filter((o) => o !== op) : cur) : [...cur, op]))

  return (
    <div className="mx-auto max-w-md space-y-4" data-testid="math-race">
      <div className="flex items-center gap-2">
        <button
          onClick={() => (active ? (setPhase('ready'), setActive(null)) : navigate(back))}
          className="grid h-9 w-9 place-items-center rounded-xl border-2 border-white bg-white text-ink-700"
          aria-label={tr('Back')}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
        <div>
          <h1 className="flex items-center gap-1.5 font-display text-xl font-extrabold text-ink-950 sm:text-2xl">
            <Timer className="h-5 w-5 text-sky" /> {tr('60-second math race')}
          </h1>
          <p className="text-[11px] font-semibold text-ink-600">{tr('Race only against your own best. Numbers come from your math book. Nothing leaves this device.')}</p>
        </div>
      </div>

      {!active ? (
        units.length === 0 ? (
          <Card className="p-5 text-center" data-testid="race-empty">
            <p className="text-sm font-extrabold text-ink-950">{tr('No math book for this grade yet')}</p>
            <p className="mt-1 text-[11px] font-semibold text-ink-600">
              {tr('The race takes its numbers from your math book. Ask a grown-up to add the math book and its units first.')}
            </p>
            <Button className="mt-3" onClick={() => navigate(back)}>
              {tr('Back to games')}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-2.5">
            {units.map((item) => (
              <button
                key={`${item.book.id}:${item.unit.id}`}
                onClick={() => start(item)}
                data-testid="race-unit"
                className="flex items-center gap-3 rounded-3xl border-2 border-white bg-white/80 p-3.5 text-start"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky/20 text-sky">
                  <Timer className="h-5 w-5" />
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
      ) : noRange || !range ? (
        <Card className="p-5 text-center" data-testid="race-norange">
          <p className="text-sm font-extrabold text-ink-950">{tr('No numbers to race with in this unit yet')}</p>
          <p className="mt-1 text-[11px] font-semibold text-ink-600">
            {tr('This unit has no clear numbers and add, take away, times or share words in its text, so Jessica will not guess. Try another unit.')}
          </p>
          <Button className="mt-3" onClick={() => setActive(null)}>
            {tr('Pick another unit')}
          </Button>
        </Card>
      ) : phase === 'ready' ? (
        <Card className="border-2 border-white p-4 text-center" data-testid="race-ready">
          <p className="text-[10px] font-semibold text-ink-600">{active.unit.title}</p>
          <p className="mt-2 text-sm font-extrabold text-ink-950">{tr('Numbers up to {n}, taken from your book', { n: num(range.max) })}</p>
          <div className="mt-3 flex justify-center gap-2" role="group" aria-label={tr('Operations')}>
            {range.ops.map((op) => (
              <button
                key={op}
                onClick={() => toggle(op)}
                aria-pressed={ops.includes(op)}
                data-testid={`race-op-${op}`}
                className={cn('h-11 w-11 rounded-2xl border-2 text-lg font-extrabold', ops.includes(op) ? 'border-sky bg-sky/15 text-ink-950' : 'border-white bg-white text-ink-500')}
              >
                {OP_LABEL[op]}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-bold text-ink-700" data-testid="race-best">
            {best > 0 ? tr('Your best: {n}', { n: num(best) }) : tr('No best yet. Your first round sets it.')}
          </p>
          {save.missed.length > 0 && (
            <p className="mt-1 text-[10px] font-semibold text-ink-600">{tr('A few you missed last time will come back to help you.')}</p>
          )}
          <Button className="mt-3" onClick={go} data-testid="race-go">
            {tr('Start 60 seconds')}
          </Button>
        </Card>
      ) : phase === 'play' ? (
        <Card className="border-2 border-white p-4" data-testid="race-play">
          <div className="h-2 overflow-hidden rounded-full bg-sky/15" role="progressbar" aria-valuemin={0} aria-valuemax={SECONDS} aria-valuenow={Math.round(left)} aria-label={tr('Time left')}>
            <div className="h-full rounded-full bg-sky" style={{ width: `${(left / SECONDS) * 100}%`, transition: 'width 0.25s linear' }} />
          </div>
          <p className="mt-3 text-center text-[11px] font-bold text-ink-600">{tr('Correct: {n}', { n: num(score) })}</p>
          <p className="mt-2 text-center font-display text-5xl font-extrabold text-ink-950" dir="ltr" data-testid="race-question" data-answer={q?.answer} data-text={q?.text}>
            {q ? <Expr text={q.text} /> : null} <span>= ?</span>
          </p>
          <p className="mt-2 min-h-[44px] rounded-2xl bg-sky/10 py-2 text-center font-display text-3xl font-extrabold text-ink-950" dir="ltr" data-testid="race-typed" aria-live="polite">
            {typed ? shown(typed) : '\u00A0'}
          </p>
          <p className="mt-1 min-h-[16px] text-center text-[10px] font-semibold text-ink-600" data-testid="race-lastwrong">
            {lastWrong ? (
              <>
                <Expr text={lastWrong.text} answer={lastWrong.answer} /> · {tr('It will come back later.')}
              </>
            ) : (
              ''
            )}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2" dir="ltr">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button key={d} onClick={() => setTyped((t) => (t.length < 4 ? t + d : t))} data-testid={`key-${d}`} className="h-12 rounded-2xl border-2 border-white bg-white text-xl font-extrabold text-ink-950 active:bg-sky/15">
                {num(Number(d))}
              </button>
            ))}
            <button onClick={() => setTyped((t) => t.slice(0, -1))} data-testid="key-del" aria-label={tr('Delete')} className="grid h-12 place-items-center rounded-2xl border-2 border-white bg-white text-ink-700">
              <Delete className="h-5 w-5" />
            </button>
            <button onClick={() => setTyped((t) => (t.length < 4 ? t + '0' : t))} data-testid="key-0" className="h-12 rounded-2xl border-2 border-white bg-white text-xl font-extrabold text-ink-950 active:bg-sky/15">
              {num(0)}
            </button>
            <button onClick={submit} data-testid="key-ok" aria-label={tr('Answer')} className="grid h-12 place-items-center rounded-2xl bg-aurora-400/30 text-ink-950">
              <Check className="h-5 w-5" />
            </button>
          </div>
        </Card>
      ) : (
        <Card className="border-2 border-white p-4 text-center" data-testid="race-done">
          <Trophy className="mx-auto h-8 w-8 text-sun" />
          <p className="mt-2 text-sm font-extrabold text-ink-950">{tr('Time is up! Correct: {n}', { n: num(score) })}</p>
          <p className="mt-1 text-[11px] font-bold text-ink-700" data-testid="race-best-after">
            {newBest ? tr('New personal best!') : tr('Your best: {n}', { n: num(save.best[key] ?? 0) })}
          </p>
          {wrongRef.current.length > 0 && (
            <p className="mt-1 text-[10px] font-semibold text-ink-600">{tr('{n} to try again next round', { n: num(wrongRef.current.length) })}</p>
          )}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={go} data-testid="race-again">
              <RotateCcw className="h-3.5 w-3.5" /> {tr('Another round')}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setPhase('ready')}>
              {tr('Back')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export function KidsMathRace() {
  return <MathRace kids />
}
