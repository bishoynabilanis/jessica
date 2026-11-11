import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand, Highlighter, Languages, Minus, Moon, MousePointerClick, Plus, Sparkles, Sun, Wand2 } from 'lucide-react'
import { loadPdf, pdfjs } from '@/lib/pdf'
import type { TextContent } from 'pdfjs-dist/types/src/display/api'
import { cn } from '@/lib/utils'
import { useApp } from '@/store/useApp'
import { tr } from '@/i18n'

export type SelectionAction = 'explain' | 'translate' | 'simplify' | 'highlight'

export function PdfViewer({
  url,
  page,
  onPageChange,
  onSelectionAction,
  title,
}: {
  url: string
  page: number
  onPageChange: (page: number) => void
  onSelectionAction: (text: string, action: SelectionAction) => void
  title?: string
}) {
  const pdfDark = useApp((s) => s.settings.pdfDark)
  const updateSettings = useApp((s) => s.updateSettings)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [doc, setDoc] = useState<pdfjs.PDFDocumentProxy | null>(null)
  const [numPages, setNumPages] = useState(1)
  const [width, setWidth] = useState(700)
  const [zoom, setZoom] = useState(1)
  const [loading, setLoading] = useState(true)
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState('')
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null)
  const renderTask = useRef<pdfjs.RenderTask | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    loadPdf(url)
      .then((loaded) => {
        if (!alive) return
        setDoc(loaded)
        setNumPages(loaded.numPages)
      })
      .catch((err) => {
        if (!alive) return
        setError(err instanceof Error ? err.message : tr('Could not open this PDF.'))
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [url])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width || 700
      setWidth(Math.max(280, w))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const buildTextLayer = useCallback(
    (viewport: pdfjs.PageViewport, textContent: TextContent) => {
      const layer = layerRef.current
      if (!layer) return
      layer.innerHTML = ''
      layer.style.width = `${viewport.width}px`
      layer.style.height = `${viewport.height}px`

      for (const item of textContent.items) {
        if (!('str' in item) || !item.str || !item.str.trim()) continue
        const tx = pdfjs.Util.transform(viewport.transform, item.transform)
        const fontHeight = Math.hypot(tx[2], tx[3])
        if (!fontHeight) continue
        const left = tx[4]
        const top = tx[5] - fontHeight
        const angle = Math.atan2(tx[1], tx[0])
        const span = document.createElement('span')
        span.textContent = item.str
        span.style.left = `${left}px`
        span.style.top = `${top}px`
        span.style.fontSize = `${fontHeight}px`
        span.style.fontFamily = 'sans-serif'
        span.style.transformOrigin = '0% 0%'
        if (angle) span.style.transform = `rotate(${angle}rad)`
        span.dataset.text = item.str
        layer.appendChild(span)
        const targetWidth = (item.width || 0) * viewport.scale
        if (targetWidth > 0) {
          const measured = span.getBoundingClientRect().width
          if (measured > 0) {
            const scaleX = targetWidth / measured
            span.style.transform = `${angle ? `rotate(${angle}rad) ` : ''}scaleX(${scaleX.toFixed(3)})`
          }
        }
      }
    },
    [],
  )

  useEffect(() => {
    if (!doc) return
    let cancelled = false
    const render = async () => {
      setRendering(true)
      setSelection(null)
      try {
        renderTask.current?.cancel()
      } catch {
        /* ignore */
      }
      try {
        const pdfPage = await doc.getPage(page)
        if (cancelled) return
        const base = pdfPage.getViewport({ scale: 1 })
        const scale = Math.min(2.6, Math.max(0.42, ((width - 8) / base.width) * zoom))
        const viewport = pdfPage.getViewport({ scale })
        const canvas = canvasRef.current
        if (!canvas) return
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        canvas.width = Math.floor(viewport.width * dpr)
        canvas.height = Math.floor(viewport.height * dpr)
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`
        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx) throw new Error(tr('Canvas unavailable'))
        ctx.save()
        ctx.scale(dpr, dpr)
        const task = pdfPage.render({ canvasContext: ctx, viewport })
        renderTask.current = task
        await task.promise.catch((err: unknown) => {
          if (err instanceof Error && err.name === 'RenderingCancelledException') return
          throw err
        })
        ctx.restore()
        const textContent = await pdfPage.getTextContent()
        if (cancelled) return
        buildTextLayer(viewport, textContent)
      } catch (err) {
        if (!(err instanceof Error && err.name === 'RenderingCancelledException') && !cancelled) {
          setError(err instanceof Error ? err.message : tr('Could not render this page.'))
        }
      } finally {
        if (!cancelled) setRendering(false)
      }
    }
    render()
    return () => {
      cancelled = true
    }
  }, [doc, page, width, zoom, buildTextLayer])

  const captureSelection = useCallback(() => {
    window.setTimeout(() => {
      const sel = window.getSelection()
      const text = sel?.toString().replace(/\s+/g, ' ').trim() || ''
      if (!text || text.length < 2 || !sel || !sel.rangeCount) return
      const rect = sel.getRangeAt(0).getBoundingClientRect()
      const parent = wrapRef.current?.getBoundingClientRect()
      if (!parent) return
      const maxX = Math.max(90, parent.width - 90)
      const x = Math.min(maxX, Math.max(90, rect.left + rect.width / 2 - parent.left))
      const y = Math.max(12, rect.top - parent.top - 8)
      setSelection({ text: text.slice(0, 2500), x, y })
    }, 20)
  }, [])

  useEffect(() => {
    const el = layerRef.current
    if (!el) return
    el.addEventListener('mouseup', captureSelection)
    el.addEventListener('touchend', captureSelection)
    return () => {
      el.removeEventListener('mouseup', captureSelection)
      el.removeEventListener('touchend', captureSelection)
    }
  }, [captureSelection])

  const choose = (action: SelectionAction) => {
    if (!selection) return
    onSelectionAction(selection.text, action)
    window.getSelection()?.removeAllRanges()
    setSelection(null)
  }

  const go = (next: number) => {
    const target = Math.max(1, Math.min(numPages, next))
    if (target !== page) onPageChange(target)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => go(page - 1)}
            disabled={page <= 1}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-card-2 text-muted transition hover:text-main disabled:opacity-30"
            aria-label={tr("Previous page")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1 rounded-lg border border-line bg-card-2 px-2 py-1">
            <input
              type="number"
              min={1}
              max={numPages}
              value={page}
              onChange={(e) => go(Number(e.target.value))}
              className="w-9 bg-transparent text-center text-[11px] font-bold text-main outline-none"
              aria-label={tr("Page number")}
            />
            <span className="text-[10px] text-muted-2">/ {numPages}</span>
          </div>
          <button
            onClick={() => go(page + 1)}
            disabled={page >= numPages}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-card-2 text-muted transition hover:text-main disabled:opacity-30"
            aria-label={tr("Next page")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden items-center gap-1.5 text-[10px] font-semibold text-muted sm:flex">
          <MousePointerClick className="h-3.5 w-3.5 text-aurora-300" />
          {tr("Select any text to ask Jessica")}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-card-2 text-muted transition hover:text-main"
            aria-label={tr("Zoom out")}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-[10px] font-bold text-muted">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(2, Number((z + 0.15).toFixed(2))))}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-card-2 text-muted transition hover:text-main"
            aria-label={tr("Zoom in")}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="hidden h-8 rounded-lg border border-line bg-card-2 px-2 text-[10px] font-bold text-muted transition hover:text-main sm:block"
          >
            {tr("Fit")}
          </button>
          <button
            onClick={() => updateSettings({ pdfDark: !pdfDark })}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-card-2 text-muted transition hover:text-main"
            aria-label={pdfDark ? tr('Day mode') : tr('Night mode')}
            title={pdfDark ? tr('Day mode') : tr('Night mode')}
          >
            {pdfDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => {
              const el = wrapRef.current
              if (!el) return
              if (document.fullscreenElement) document.exitFullscreen()
              else el.requestFullscreen?.()
            }}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-card-2 text-muted transition hover:text-main"
            aria-label={tr("Fullscreen")}
          >
            <Expand className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div ref={wrapRef} className={cn('relative min-h-0 flex-1 overflow-auto bg-ink-800/40 p-2 sm:p-4', pdfDark && 'pdf-dark')}>
        {selection && (
          <div
            className="absolute z-30 flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-xl border border-line-strong bg-ink-950/95 p-1 shadow-2xl backdrop-blur-xl"
            style={{ left: selection.x, top: selection.y }}
          >
            <button
              onClick={() => choose('explain')}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white transition hover:bg-white/10"
            >
              <Wand2 className="h-3 w-3 text-aurora-300" /> {tr("Explain")}
            </button>
            <button
              onClick={() => choose('simplify')}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white transition hover:bg-white/10"
            >
              <Sparkles className="h-3 w-3 text-sun" /> {tr("ELI5")}
            </button>
            <button
              onClick={() => choose('translate')}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white transition hover:bg-white/10"
            >
              <Languages className="h-3 w-3 text-violet-glow" /> {tr("Arabic")}
            </button>
            <button
              onClick={() => choose('highlight')}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white transition hover:bg-white/10"
            >
              <Highlighter className="h-3 w-3 text-sun" /> {tr("Highlight")}
            </button>
          </div>
        )}

        {loading && (
          <div className="mx-auto flex h-72 max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-card-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-aurora-400/20 border-t-aurora-400" />
            <p className="text-[11px] font-semibold text-muted">{tr("Opening your textbook…")}</p>
          </div>
        )}

        {error && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-coral/30 bg-coral/10 p-5 text-center">
            <p className="text-sm font-bold text-coral">{tr("This PDF could not be opened")}</p>
            <p className="text-[11px] leading-relaxed text-muted">{error}</p>
            <p className="text-[10px] text-muted-2">
              {tr("Re-import the file from the Library and try again.")}
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="flex min-h-full justify-center" data-pdf-page={page}>
            <div ref={stageRef} className="pdf-stage my-auto" style={{ width: 'max-content' }}>
              <canvas ref={canvasRef} aria-label={title ? `${title} page ${page}` : `PDF page ${page}`} />
              <div ref={layerRef} className={cn('pdf-text-layer', rendering && 'opacity-90')} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
