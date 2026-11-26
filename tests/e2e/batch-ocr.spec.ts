import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

// The app now serves the OCR engine from its own origin, where the service worker
// would answer before a test double can; block it so the double is used.
test.use({ serviceWorkers: 'block' })

const book = {
  id: 'scan-book',
  title: 'Scan Book',
  subject: 'Science',
  grade: 7,
  term: 'Term 1',
  pageCount: 2,
  custom: true,
  file: 'local:scan-book',
  units: [],
}

const profile = (language: string) => ({
  state: {
    onboarded: true,
    acceptedTerms: 1,
    name: 'Tester',
    apiKey: '',
    model: 'gemini-1.5-flash',
    xp: 10,
    streak: 1,
    coins: 0,
    customBooks: [book],
    completedTopics: [],
    unitMastery: {},
    lessonProgress: {},
    skillStats: {},
    settings: {
      language,
      gradeLevel: 7,
      curriculum: 'egypt',
      schoolType: 'government',
      primaryUi: 'auto',
      aiProvider: 'gemini',
      theme: 'dark',
      keyOptional: true,
      quickStart: false,
    },
  },
  version: 3,
})

// A stand-in for the OCR engine so the test never needs the internet.
const fakeEngine = (failFirst: boolean) => `
let calls = 0
let failed = ${failFirst ? 'false' : 'true'}
export async function createWorker() {
  return {
    recognize: async () => {
      await new Promise((r) => setTimeout(r, 1000))
      calls++
      if (!failed && calls === 2) { failed = true; throw new Error('network down') }
      return { data: { text: 'هذا نص الصفحة الممسوحة رقم ' + calls + ' من الكتاب' } }
    },
    terminate: async () => {},
  }
}
`

async function seed(page: Page, opts: { language?: string; failFirst?: boolean } = {}) {
  await page.route('**/tesseract.esm.min.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: fakeEngine(!!opts.failFirst) }),
  )
  await page.addInitScript((data) => {
    if (!window.localStorage.getItem('jessica-profile-v1')) {
      window.localStorage.setItem('jessica-profile-v1', JSON.stringify(data))
    }
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, profile(opts.language || 'en'))
  await page.goto('/#/library')
  await page.waitForTimeout(400)
  const bytes = Array.from(readFileSync('tests/e2e/fixtures/mini-book.pdf'))
  await page.evaluate(
    async ({ bytes }) => {
      const pages = [1, 2].map((n) => ({ page: n, text: '' }))
      const chapter = { bookId: 'scan-book', extractedAt: Date.now(), text: 'x', pages }
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('jessica-db', 1)
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains('kv')) request.result.createObjectStore('kv')
          if (!request.result.objectStoreNames.contains('cards')) request.result.createObjectStore('cards', { keyPath: 'id' })
        }
        request.onsuccess = () => {
          const tx = request.result.transaction('kv', 'readwrite')
          tx.objectStore('kv').put(chapter, 'chapter:scan-book')
          tx.objectStore('kv').put(new Uint8Array(bytes), 'pdf:scan-book')
          tx.oncomplete = () => resolve()
          tx.onerror = () => reject(tx.error)
        }
        request.onerror = () => reject(request.error)
      })
    },
    { bytes },
  )
}

const savedPages = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const request = indexedDB.open('jessica-db', 1)
        request.onsuccess = () => {
          const get = request.result.transaction('kv').objectStore('kv').get('chapter:scan-book')
          get.onsuccess = () =>
            resolve((get.result.pages as { page: number; text: string }[]).filter((p) => p.text.length > 20).map((p) => p.page))
        }
      }),
  )

test('a range of pages is scanned and saved', async ({ page }) => {
  await seed(page)
  await page.goto('/#/reader/scan-book')
  await page.getByTestId('batch-ocr-open').click()
  await expect(page.getByTestId('batch-ocr-todo')).toContainText('2 pages in this range have no text yet')
  await page.getByTestId('batch-ocr-start').click()
  await expect(page.getByTestId('batch-ocr')).toHaveAttribute('data-phase', 'finished', { timeout: 30000 })
  await expect(page.getByTestId('batch-ocr-review')).toContainText('Text saved for pages 1–2')
  expect(await savedPages(page)).toEqual([1, 2])
})

test('pausing keeps finished pages and continuing does the rest', async ({ page }) => {
  await seed(page)
  await page.goto('/#/reader/scan-book')
  await page.getByTestId('batch-ocr-open').click()
  await page.getByTestId('batch-ocr-start').click()
  await expect(page.getByTestId('batch-ocr-progress')).toContainText('Reading page 1', { timeout: 30000 })
  await page.getByTestId('batch-ocr-pause').click()
  await expect(page.getByTestId('batch-ocr')).toHaveAttribute('data-phase', 'paused', { timeout: 30000 })
  expect(await savedPages(page)).toEqual([1])
  await page.getByTestId('batch-ocr-resume').click()
  await expect(page.getByTestId('batch-ocr')).toHaveAttribute('data-phase', 'finished', { timeout: 30000 })
  expect(await savedPages(page)).toEqual([1, 2])
})

test('a failed page is listed and can be tried again', async ({ page }) => {
  await seed(page, { failFirst: true })
  await page.goto('/#/reader/scan-book')
  await page.getByTestId('batch-ocr-open').click()
  await page.getByTestId('batch-ocr-start').click()
  await expect(page.getByTestId('batch-ocr-failed')).toContainText('Could not scan pages 2', { timeout: 30000 })
  expect(await savedPages(page)).toEqual([1])
  await page.getByTestId('batch-ocr-retry').click()
  await expect(page.getByTestId('batch-ocr-review')).toContainText('Text saved for pages 2', { timeout: 30000 })
  expect(await savedPages(page)).toEqual([1, 2])
})

test('the scan box reads fine in Arabic on a phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await seed(page, { language: 'ar', failFirst: true })
  await page.goto('/#/reader/scan-book')
  await page.getByTestId('batch-ocr-open').click()
  await page.getByTestId('batch-ocr-start').click()
  await expect(page.getByTestId('batch-ocr-failed')).toContainText('معرفتش أمسح الصفحات', { timeout: 30000 })
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'test-results/batch-ocr-ar-390.png' })
})
