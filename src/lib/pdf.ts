import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { TextContent } from 'pdfjs-dist/types/src/display/api'
import type { ChapterText, PageText } from '@/types'
import { chapterCacheGet, chapterCacheSet } from './db'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export { pdfjs }

const docCache = new Map<string, Promise<pdfjs.PDFDocumentProxy>>()

export function loadPdf(url: string) {
  let promise = docCache.get(url)
  if (!promise) {
    promise = pdfjs.getDocument({ url, cMapUrl: 'https://unpkg.com/pdfjs-dist@4.9.155/cmaps/', cMapPacked: true }).promise
    docCache.set(url, promise)
    promise.catch(() => docCache.delete(url))
  }
  return promise
}

async function extractFromDoc(
  doc: pdfjs.PDFDocumentProxy,
  bookId: string,
  onProgress?: (page: number, total: number) => void,
): Promise<ChapterText> {
  const pages: PageText[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? `${item.str}${item.hasEOL ? '\n' : ' '}` : ''))
      .join('')
      .replace(/[ \t]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    pages.push({ page: i, text })
    onProgress?.(i, doc.numPages)
    // Let the UI breathe on 100+ page books.
    if (i % 4 === 0) await new Promise((resolve) => setTimeout(resolve, 0))
  }

  const chapter: ChapterText = {
    bookId,
    pages,
    text: pages.map((p) => `[Page ${p.page}]\n${p.text}`).join('\n\n'),
    extractedAt: Date.now(),
  }
  await chapterCacheSet(chapter)
  return chapter
}

export async function extractChapter(
  url: string,
  bookId: string,
  onProgress?: (page: number, total: number) => void,
): Promise<ChapterText> {
  const cached = await chapterCacheGet(bookId)
  if (cached?.text?.trim()) {
    onProgress?.(cached.pages.length, cached.pages.length)
    return cached
  }

  const doc = await loadPdf(url)
  return extractFromDoc(doc, bookId, onProgress)
}

/** Used while importing an official PDF: extract immediately so units exist. */
export async function extractChapterFromBytes(
  bytes: Uint8Array,
  bookId: string,
  onProgress?: (page: number, total: number) => void,
): Promise<ChapterText> {
  const cached = await chapterCacheGet(bookId)
  if (cached?.text?.trim()) {
    onProgress?.(cached.pages.length, cached.pages.length)
    return cached
  }
  const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise
  try {
    return await extractFromDoc(doc, bookId, onProgress)
  } finally {
    await doc.destroy()
  }
}

export interface RenderedPage {
  width: number
  height: number
  viewport: pdfjs.PageViewport
  textContent: TextContent
}

export async function renderPage(
  url: string,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  containerWidth: number,
): Promise<RenderedPage> {
  const doc = await loadPdf(url)
  const page = await doc.getPage(pageNumber)
  const base = page.getViewport({ scale: 1 })
  const scale = Math.min(2.2, Math.max(0.5, (containerWidth - 4) / base.width))
  const viewport = page.getViewport({ scale })
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = Math.floor(viewport.width * dpr)
  canvas.height = Math.floor(viewport.height * dpr)
  canvas.style.width = `${viewport.width}px`
  canvas.style.height = `${viewport.height}px`
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('Canvas is not available in this browser.')
  ctx.save()
  ctx.scale(dpr, dpr)
  await page.render({ canvasContext: ctx, viewport }).promise
  ctx.restore()
  const textContent = await page.getTextContent()
  return { width: viewport.width, height: viewport.height, viewport, textContent }
}
