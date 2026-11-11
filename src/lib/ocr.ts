import { loadPdf } from '@/lib/pdf'

/**
 * OCR a single PDF page in the browser. Tesseract is loaded lazily from a CDN
 * (the npm package is not bundled), so the first run needs a connection.
 */
export async function ocrPdfPage(
  url: string,
  pageNumber: number,
  language = 'ara+eng',
  onProgress?: (status: string, progress: number) => void,
) {
  const doc = await loadPdf(url)
  const page = await doc.getPage(pageNumber)
  const viewport = page.getViewport({ scale: 2 })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')
  await page.render({ canvasContext: ctx, viewport }).promise

  onProgress?.('loading', 0)
  // @ts-expect-error remote ESM module loaded at runtime
  const mod: any = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js')
  const worker = await mod.createWorker(language, 1, {
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    logger: (message: any) => {
      if (message?.status) onProgress?.(message.status, Number(message.progress) || 0)
    },
  })
  try {
    const { data } = await worker.recognize(canvas)
    return String(data?.text || '')
      .replace(/\s+/g, ' ')
      .trim()
  } finally {
    await worker.terminate().catch(() => undefined)
  }
}
