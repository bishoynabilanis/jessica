import { createOcrWorker } from '@/lib/ocrEngine'
import { loadPdf } from '@/lib/pdf'
import { confirmBigDownload, OCR_DOWNLOAD_MB } from '@/lib/weakPhone'

/**
 * OCR a single PDF page in the browser. The engine ships with the app and loads
 * lazily; only the language data downloads on first use.
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

  if (!(await confirmBigDownload('the text-reading engine (Arabic + English)', OCR_DOWNLOAD_MB))) throw new Error('Download cancelled')
  onProgress?.('loading', 0)
  const worker = await createOcrWorker(language, onProgress)
  try {
    const { data } = await worker.recognize(canvas)
    return String(data?.text || '')
      .replace(/\s+/g, ' ')
      .trim()
  } finally {
    await worker.terminate().catch(() => undefined)
  }
}

export interface PageRecognizer {
  recognize: (pageNumber: number) => Promise<string>
  close: () => Promise<void>
}

/**
 * Many pages in a row: open the PDF and the OCR engine once, then read page
 * after page. Opening them again for every page would be slow and wasteful.
 */
export async function createPageRecognizer(
  url: string,
  language = 'ara+eng',
  onProgress?: (status: string, progress: number) => void,
): Promise<PageRecognizer> {
  const doc = await loadPdf(url)
  if (!(await confirmBigDownload('the text-reading engine (Arabic + English)', OCR_DOWNLOAD_MB))) throw new Error('Download cancelled')
  onProgress?.('loading', 0)
  const worker = await createOcrWorker(language, onProgress)
  return {
    recognize: async (pageNumber: number) => {
      const page = await doc.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas is not available')
      await page.render({ canvasContext: ctx, viewport }).promise
      const { data } = await worker.recognize(canvas)
      canvas.width = canvas.height = 0
      return String(data?.text || '').replace(/\s+/g, ' ').trim()
    },
    close: async () => {
      await worker.terminate().catch(() => undefined)
    },
  }
}
