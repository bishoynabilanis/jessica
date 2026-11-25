import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Eraser, PenLine } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { openChapter } from '@/lib/library'
import { scoreTrace, traceItems, type TraceKind } from '@/lib/tracing'
import type { Book, BookUnit } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

interface Picked {
  book: Book
  unit: BookUnit
}

const W = 360
const H = 220

function paintShape(ctx: CanvasRenderingContext2D, text: string, grow: number, color: string) {
  ctx.clearRect(0, 0, W, H)
  ctx.direction = 'rtl'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineJoin = 'round'
  let size = 170
  ctx.font = `700 ${size}px "Noto Naskh Arabic", "Segoe UI", Tahoma, Arial, sans-serif`
  const w = ctx.measureText(text).width
  if (w > W - 40) {
    size = Math.floor((size * (W - 40)) / w)
    ctx.font = `700 ${size}px "Noto Naskh Arabic", "Segoe UI", Tahoma, Arial, sans-serif`
  }
  if (grow) {
    ctx.lineWidth = grow
    ctx.strokeText(text, W / 2, H / 2)
  }
  ctx.fillText(text, W / 2, H / 2)
}

function alphaMask(ctx: CanvasRenderingContext2D): Uint8Array {
  const data = ctx.getImageData(0, 0, W, H).data
  const m = new Uint8Array(W * H)
  for (let i = 0; i < m.length; i++) m[i] = data[i * 4 + 3] > 40 ? 1 : 0
  return m
}

/** Trace letters, words and numbers from the book with a finger. Free, offline, nothing is stored or sent. */
export function Tracing({ kids = false }: { kids?: boolean }) {
  const navigate = useNavigate()
  const customBooks = useApp((s) => s.customBooks)
  const grade = useApp((s) => s.settings.gradeLevel)
  const books = useMemo(() => customBooks.filter((b) => (b.grade ?? grade) === grade), [customBooks, grade])
  const units = useMemo(() => books.flatMap((book) => (book.units || []).map((unit) => ({ book, unit }))), [books])
  const [active, setActive] = useState<Picked | null>(null)
  const [items, setItems] = useState<Record<TraceKind, string[]> | null>(null)
  const [loading, setLoading] = useState(false)
  const [kind, setKind] = useState<TraceKind>('letters')
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState<'none' | 'good' | 'again'>('none')
  const guideRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef<HTMLCanvasElement>(null)
  const down = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [doneCount, setDoneCount] = useState(0)

  const start = async (item: Picked) => {
    setActive(item)
    setItems(null)
    setLoading(true)
    setIndex(0)
    setDoneCount(0)
    try {
      const chapter = await openChapter(item.book)
      const found = traceItems(chapter, item.unit.startPage, item.unit.endPage)
      setItems(found)
      setKind(found.letters.length ? 'letters' : found.words.length ? 'words' : 'numbers')
    } catch {
      setItems({ letters: [], words: [], numbers: [] })
    } finally {
      setLoading(false)
    }
  }

  const list = items?.[kind] ?? []
  const current = list[index]

  useEffect(() => {
    const g = guideRef.current?.getContext('2d')
    const d = drawRef.current?.getContext('2d')
    if (!g || !d || !current) return
    paintShape(g, current, 0, 'rgba(120,130,160,0.35)')
    d.clearRect(0, 0, W, H)
    setResult('none')
  }, [current, kind])

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height }
  }

  const check = () => {
    const d = drawRef.current?.getContext('2d')
    if (!d || !current) return
    const mk = (grow: number) => {
      const c = document.createElement('canvas')
      c.width = W
      c.height = H
      const x = c.getContext('2d')!
      paintShape(x, current, grow, '#000')
      return alphaMask(x)
    }
    const score = scoreTrace(mk(0), mk(34), alphaMask(d))
    if (score.ok) {
      setResult('good')
      setDoneCount((n) => n + 1)
    } else setResult('again')
  }

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (result === 'good') return
    e.currentTarget.setPointerCapture(e.pointerId)
    down.current = true
    const p = pos(e)
    last.current = p
    const d = drawRef.current!.getContext('2d')!
    d.fillStyle = '#0ea5e9'
    d.beginPath()
    d.arc(p.x, p.y, 9, 0, Math.PI * 2)
    d.fill()
    setResult('none')
  }
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!down.current || !last.current) return
    const p = pos(e)
    const d = drawRef.current!.getContext('2d')!
    d.strokeStyle = '#0ea5e9'
    d.lineWidth = 18
    d.lineCap = 'round'
    d.beginPath()
    d.moveTo(last.current.x, last.current.y)
    d.lineTo(p.x, p.y)
    d.stroke()
    last.current = p
  }
  const onUp = () => {
    if (!down.current) return
    down.current = false
    last.current = null
    check()
  }

  const clear = () => {
    drawRef.current?.getContext('2d')?.clearRect(0, 0, W, H)
    setResult('none')
  }
  const next = () => setIndex((i) => (i + 1 < list.length ? i + 1 : 0))
  const back = kids ? '/kids/play' : '/games'
  const empty = items && !items.letters.length && !items.words.length && !items.numbers.length

  return (
    <div className="mx-auto max-w-2xl space-y-4" data-testid="tracing">
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
            <PenLine className="h-5 w-5 text-sky" /> {tr('Trace with your finger')}
          </h1>
          <p className="text-[11px] font-semibold text-ink-600">{tr('Trace the letters, words and numbers of your book. No camera, nothing is saved.')}</p>
        </div>
      </div>

      {!active ? (
        units.length === 0 ? (
          <Card className="p-5 text-center" data-testid="trace-empty">
            <p className="text-sm font-extrabold text-ink-950">{tr('Nothing to trace yet')}</p>
            <p className="mt-1 text-[11px] font-semibold text-ink-600">
              {tr('Tracing uses the letters and words of a unit in your book. Ask a grown-up to add the book and its units first.')}
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
                data-testid="trace-unit"
                className="flex items-center gap-3 rounded-3xl border-2 border-white bg-white/80 p-3.5 text-start"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky/20 text-sky">
                  <PenLine className="h-5 w-5" />
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
      ) : empty || !items ? (
        <Card className="p-5 text-center" data-testid="trace-notext">
          <p className="text-sm font-extrabold text-ink-950">{tr('No letters found in this unit yet')}</p>
          <p className="mt-1 text-[11px] font-semibold text-ink-600">{tr('The text of this unit is empty, so there is nothing to trace. Try another unit.')}</p>
          <Button className="mt-3" onClick={() => setActive(null)}>
            {tr('Pick another unit')}
          </Button>
        </Card>
      ) : (
        <Card className="border-2 border-white p-4">
          <p className="text-[10px] font-semibold text-ink-600">{active.unit.title}</p>
          <div className="mt-2 flex gap-1.5" role="tablist">
            {(['letters', 'words', 'numbers'] as TraceKind[]).map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={kind === k}
                disabled={!items[k].length}
                data-testid={`trace-tab-${k}`}
                onClick={() => {
                  setKind(k)
                  setIndex(0)
                }}
                className={cn('rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold disabled:opacity-30', kind === k ? 'border-sky bg-sky/15 text-ink-950' : 'border-white bg-white text-ink-700')}
              >
                {k === 'letters' ? tr('Letters') : k === 'words' ? tr('Words') : tr('Numbers')}
              </button>
            ))}
          </div>

          <p className="mt-3 text-[11px] font-bold text-ink-700">
            {tr('Put your finger on the grey shape and go over it.')} · {num(index + 1)}/{num(list.length)}
          </p>
          <div className="relative mx-auto mt-2 w-full max-w-[360px] overflow-hidden rounded-2xl bg-white" style={{ aspectRatio: `${W} / ${H}` }}>
            <canvas ref={guideRef} width={W} height={H} className="absolute inset-0 h-full w-full" data-testid="trace-guide" aria-hidden="true" />
            <canvas
              ref={drawRef}
              width={W}
              height={H}
              data-testid="trace-canvas"
              className="absolute inset-0 h-full w-full"
              style={{ touchAction: 'none' }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              aria-label={current}
            />
          </div>

          {result === 'again' && (
            <p className="mt-3 rounded-xl bg-sun/15 px-3 py-2 text-[11px] font-bold text-amber-800" data-testid="trace-again">
              {tr('Not yet. Try to cover the whole grey shape and stay on it. Clear and try again, there is no limit.')}
            </p>
          )}
          {result === 'good' && (
            <p className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl bg-aurora-400/15 p-3 text-sm font-extrabold text-ink-950" data-testid="trace-good">
              <CheckCircle2 className="h-4 w-4 text-aurora-600" /> {tr('Well done! You traced it.')}
            </p>
          )}

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button size="sm" variant="secondary" onClick={clear} data-testid="trace-clear">
              <Eraser className="h-3.5 w-3.5" /> {tr('Clear')}
            </Button>
            <Button size="sm" onClick={next} data-testid="trace-next">
              {tr('Next')}
            </Button>
          </div>
          <p className="mt-2 text-center text-[10px] font-semibold text-ink-600">
            {tr('Traced so far: {n}', { n: num(doneCount) })} · {tr('Jessica checks the shape you drew, not the order of your strokes.')}
          </p>
        </Card>
      )}
    </div>
  )
}

export function KidsTracing() {
  return <Tracing kids />
}
