import { useEffect, useRef, useState } from 'react'
import {
  Download,
  Eraser,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Undo2,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { tr } from '@/i18n'

const palette = ['#eef2ff', '#21e6c9', '#5cc8ff', '#a78bfa', '#ffd166', '#ff7a8a', '#f472b6']

type Point = { x: number; y: number }
type Stroke = { color: string; size: number; erase: boolean; points: Point[] }

export function WhiteboardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addXP = useApp((s) => s.addXP)
  const pushToast = useUI((s) => s.pushToast)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const currentRef = useRef<Stroke | null>(null)
  const [color, setColor] = useState(palette[1])
  const [size, setSize] = useState(3)
  const [erasing, setErasing] = useState(false)
  const [count, setCount] = useState(0)

  const redraw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    const all = [...strokesRef.current, ...(currentRef.current ? [currentRef.current] : [])]
    for (const stroke of all) {
      if (!stroke.points.length) continue
      ctx.beginPath()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = stroke.erase ? '#0b1220' : stroke.color
      ctx.lineWidth = stroke.size
      stroke.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.stroke()
    }
  }

  const resize = () => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const rect = wrap.getBoundingClientRect()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    redraw()
  }

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(resize, 60)
    window.addEventListener('resize', resize)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', resize)
    }
  }, [open])

  const point = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const down = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    currentRef.current = {
      color,
      size: erasing ? 22 : size,
      erase: erasing,
      points: [point(event)],
    }
    redraw()
  }

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentRef.current) return
    currentRef.current.points.push(point(event))
    redraw()
  }

  const up = () => {
    if (currentRef.current?.points.length) {
      strokesRef.current.push(currentRef.current)
      setCount(strokesRef.current.length)
    }
    currentRef.current = null
    redraw()
  }

  const undo = () => {
    strokesRef.current.pop()
    setCount(strokesRef.current.length)
    redraw()
  }

  const clear = () => {
    strokesRef.current = []
    currentRef.current = null
    setCount(0)
    redraw()
  }

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `jessica-whiteboard-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    addXP(5, true)
    pushToast({ title: tr("Whiteboard saved"), description: tr("Your notes are in your downloads."), type: 'success', xp: 5 })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Scratch whiteboard")}
      subtitle={tr("Sketch a solution, draw a diagram or map an essay plan. Everything stays on your device.")}
      icon={<Pencil className="h-4.5 w-4.5" />}
      size="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] text-muted-2">{tr("Tip: use the eraser for mistakes, undo for quick fixes.")}</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={clear} disabled={!count}>
              <Trash2 className="h-3.5 w-3.5" /> {tr("Clear")}
            </Button>
            <Button size="sm" onClick={download}>
              <Download className="h-3.5 w-3.5" /> {tr("Save PNG")}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-line bg-card-2 p-1.5">
            {palette.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c)
                  setErasing(false)
                }}
                className={cn(
                  'h-6 w-6 rounded-full border-2 transition',
                  color === c && !erasing ? 'scale-110 border-white' : 'border-transparent',
                )}
                style={{ background: c }}
                aria-label={`Pen colour ${c}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-line bg-card-2 p-1">
            <button
              onClick={() => setErasing(false)}
              className={cn('grid h-7 w-7 place-items-center rounded-lg', !erasing ? 'bg-aurora-400 text-ink-950' : 'text-muted')}
              aria-label={tr("Pen")}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setErasing(true)}
              className={cn('grid h-7 w-7 place-items-center rounded-lg', erasing ? 'bg-coral text-white' : 'text-muted')}
              aria-label={tr("Eraser")}
            >
              <Eraser className="h-3.5 w-3.5" />
            </button>
            <button onClick={undo} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:text-main" aria-label={tr("Undo")}>
              <Undo2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-line bg-card-2 px-2 py-1.5">
            <button onClick={() => setSize((s) => Math.max(1, s - 1))} className="text-muted hover:text-main" aria-label={tr("Thinner")}>
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-[10px] font-bold text-main">{size}</span>
            <button onClick={() => setSize((s) => Math.min(20, s + 1))} className="text-muted hover:text-main" aria-label={tr("Thicker")}>
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={undo} className="ml-auto" disabled={!count}>
            <RotateCcw className="h-3.5 w-3.5" /> {tr("Undo")}
          </Button>
        </div>

        <div ref={wrapRef} className="whiteboard-grid relative h-[52vh] min-h-[300px] overflow-hidden rounded-2xl border border-line">
          <canvas
            ref={canvasRef}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerLeave={up}
            className="absolute inset-0 touch-none"
            style={{ cursor: erasing ? 'cell' : 'crosshair' }}
          />
          {count === 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
              <Pencil className="h-8 w-8 text-white/15" />
              <p className="text-xs font-semibold text-white/35">{tr("Draw your thinking here")}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
