import { test, expect, type Page } from '@playwright/test'

const sentence = (term: string, n: number) =>
  `${term} هو مفهوم أساسي في الدرس رقم ${n} ويجب أن يفهم الطالب معنى ${term} جيدا قبل الانتقال.`
const terms = ['الضغط', 'القوة', 'المساحة', 'الباسكال', 'الكتلة']
const longText = (n: number) => terms.map((t) => sentence(t, n)).join(' ')

const book = {
  id: 'ready-book',
  title: 'Science Book',
  subject: 'Science',
  grade: 7,
  term: 'Term 1',
  pageCount: 6,
  custom: true,
  file: 'local:ready-book',
  units: [
    { id: 'u1', title: 'الوحدة الأولى', startPage: 1, endPage: 2 },
    { id: 'u2', title: 'الوحدة الثانية', startPage: 3, endPage: 4 },
  ],
}

const profile = {
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
      language: 'en',
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
}

async function seed(page: Page, opts: { pdf: boolean; emptyPage?: number }) {
  await page.addInitScript((data) => {
    if (!window.localStorage.getItem('jessica-profile-v1')) {
      window.localStorage.setItem('jessica-profile-v1', JSON.stringify(data))
    }
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, profile)
  await page.goto('/#/library')
  await page.waitForTimeout(400)
  const pages = [1, 2, 3, 4, 5, 6].map((n) => ({ page: n, text: n === opts.emptyPage ? '' : longText(n) }))
  const chapter = { bookId: 'ready-book', extractedAt: Date.now(), text: 'x', pages }
  await page.evaluate(
    async ({ chapter, pdf }) => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('jessica-db', 1)
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains('kv')) request.result.createObjectStore('kv')
          if (!request.result.objectStoreNames.contains('cards')) request.result.createObjectStore('cards', { keyPath: 'id' })
        }
        request.onsuccess = () => {
          const tx = request.result.transaction('kv', 'readwrite')
          tx.objectStore('kv').put(chapter, 'chapter:ready-book')
          if (pdf) tx.objectStore('kv').put(new Uint8Array([37, 80, 68, 70, 45, 49]), 'pdf:ready-book')
          tx.oncomplete = () => resolve()
          tx.onerror = () => reject(tx.error)
        }
        request.onerror = () => reject(request.error)
      })
    },
    { chapter, pdf: opts.pdf },
  )
}

test('a fully saved book is reported ready', async ({ page }) => {
  await seed(page, { pdf: true })
  await page.goto('/#/course/ready-book')
  await page.getByTestId('offline-ready-open').click()
  await expect(page.getByTestId('offline-verdict')).toContainText('Ready')
  await expect(page.getByTestId('offline-ready')).toContainText('2 of 2 lessons are saved')
  await expect(page.getByTestId('offline-ready')).toContainText('Text saved for 6 of 6 pages')
})

test('a picture-only page inside a lesson is flagged with its page number', async ({ page }) => {
  await seed(page, { pdf: true, emptyPage: 2 })
  await page.goto('/#/course/ready-book')
  await page.getByTestId('offline-ready-open').click()
  await expect(page.getByTestId('offline-verdict')).toContainText('Almost ready')
  await expect(page.getByTestId('offline-ready')).toContainText('Pages 2 are pictures with no text')
  await expect(page.getByRole('button', { name: /Go to page 2/ })).toBeVisible()
})

test('a missing book file is reported as not ready', async ({ page }) => {
  await seed(page, { pdf: false })
  await page.goto('/#/course/ready-book')
  await page.getByTestId('offline-ready-open').click()
  await expect(page.getByTestId('offline-verdict')).toContainText('Not ready')
  await expect(page.getByTestId('offline-ready')).toContainText('The book file is missing')
})

test('the check reads fine in Arabic on a phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await seed(page, { pdf: true, emptyPage: 3 })
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('jessica-profile-v1') || '{}')
    raw.state.settings.language = 'ar'
    localStorage.setItem('jessica-profile-v1', JSON.stringify(raw))
  })
  await page.goto('/#/course/ready-book')
  await page.reload()
  await page.getByTestId('offline-ready-open').click()
  await expect(page.getByTestId('offline-verdict')).toContainText('قربت تخلص')
  await page.waitForTimeout(700)
  await page.screenshot({ path: 'test-results/offline-ready-ar-390.png' })
})
