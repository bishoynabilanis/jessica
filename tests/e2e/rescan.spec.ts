import { test, expect, type Page } from '@playwright/test'

const book = {
  id: 'scan-book',
  title: 'Science Book',
  subject: 'Science',
  grade: 7,
  term: 'Term 1',
  pageCount: 18,
  custom: true,
  units: [{ id: 'part-1', title: 'Part 1', startPage: 3, endPage: 12 }],
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

const chapter = {
  bookId: 'scan-book',
  extractedAt: Date.now(),
  text: 'test',
  pages: [
    { page: 1, text: 'كتاب العلوم — الصف الأول الإعدادي' },
    { page: 3, text: 'الوحدة الأولى: الضغط\nالضغط هو القوة المؤثرة على وحدة المساحة.' },
    { page: 4, text: 'الضغط يقاس بوحدة الباسكال.' },
    { page: 7, text: 'الوحدة الثانية: الضوء\nالضوء ينتقل في خطوط مستقيمة.' },
    { page: 8, text: 'انعكاس الضوء وانكساره.' },
  ],
}

async function seed(page: Page) {
  await page.addInitScript((data) => {
    if (!window.localStorage.getItem('jessica-profile-v1')) {
      window.localStorage.setItem('jessica-profile-v1', JSON.stringify(data))
    }
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, profile)

  await page.goto('/#/library')
  await page.waitForTimeout(400)
  await page.evaluate(async (payload) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('jessica-db', 1)
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('kv')) request.result.createObjectStore('kv')
        if (!request.result.objectStoreNames.contains('cards')) request.result.createObjectStore('cards', { keyPath: 'id' })
      }
      request.onsuccess = () => {
        const database = request.result
        const tx = database.transaction('kv', 'readwrite')
        tx.objectStore('kv').put(payload, `chapter:${payload.bookId}`)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      }
      request.onerror = () => reject(request.error)
    })
  }, chapter)
}

test('a generic book can be re-scanned into its real arabic units', async ({ page }) => {
  await seed(page)
  await page.goto('/#/course/scan-book')

  await expect(page.getByText('0 of 1 lessons')).toBeVisible()
  const rescan = page.getByRole('button', { name: /Re-scan chapters/ })
  await expect(rescan).toBeVisible()
  await rescan.click()

  await expect(page.getByText(/Chapters re-scanned/)).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('course-lesson').first()).toContainText('الوحدة الأولى')
  await expect(page.getByTestId('course-lesson')).toHaveCount(2)

  const stored = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    return raw ? JSON.parse(raw).state.customBooks[0].units : []
  })
  expect(stored.length).toBe(2)
  expect(stored[0].title).toContain('الوحدة الأولى')
})
