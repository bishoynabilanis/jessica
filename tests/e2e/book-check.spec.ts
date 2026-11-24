import { test, expect, type Page } from '@playwright/test'

import { officialBooks } from '../../src/data/officialBooks'

const entry = officialBooks.find((b) => b.id === 'off-p1-english-t1')!
const ENTRY_URL = entry.url
const SIZE = entry.sizeMb

function profile(book: Record<string, unknown>, grade: number, extra: Record<string, unknown> = {}) {
  return {
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
      bookProgress: { 'chk-book': { lastPage: 20, total: 30, updatedAt: 1 } },
      settings: {
        language: 'en',
        gradeLevel: grade,
        curriculum: 'egypt',
        schoolType: 'government',
        primaryUi: 'study',
        aiProvider: 'gemini',
        theme: 'dark',
        keyOptional: true,
        quickStart: false,
      },
      ...extra,
    },
    version: 3,
  }
}

const OLD_URL = ENTRY_URL.replace(/\d{4}_\d{4}/, '2024_2025')

const baseBook = {
  id: 'chk-book',
  title: 'English Primary 1',
  subject: 'English',
  language: 'en',
  grade: 1,
  term: 'Term 1',
  pageCount: 30,
  custom: true,
  file: 'local:chk-book',
  units: [],
}

async function open(page: Page, book: Record<string, unknown>, grade: number) {
  await page.addInitScript((data) => {
    if (!window.localStorage.getItem('jessica-profile-v1')) {
      window.localStorage.setItem('jessica-profile-v1', JSON.stringify(data))
    }
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, profile(book, grade))
  await page.goto('/#/course/chk-book')
  await page.getByTestId('book-check-open').click()
}

test('the right book and edition gets a green verdict', async ({ page }) => {
  await open(page, { ...baseBook, catalogId: 'off-p1-english-t1', sourceUrl: ENTRY_URL, sizeMb: SIZE }, 1)
  await expect(page.getByTestId('book-check-verdict')).toContainText('right book and edition')
})

test('a book for another grade is called out', async ({ page }) => {
  await open(page, { ...baseBook, catalogId: 'off-p1-english-t1', sourceUrl: ENTRY_URL, sizeMb: SIZE }, 3)
  await expect(page.getByTestId('book-check')).toHaveAttribute('data-verdict', 'wrong')
  await expect(page.getByTestId('book-check')).toContainText('but you are in')
})

test('an older edition is flagged', async ({ page }) => {
  await open(page, { ...baseBook, catalogId: 'off-p1-english-t1', sourceUrl: OLD_URL, sizeMb: SIZE }, 1)
  await expect(page.getByTestId('book-check')).toHaveAttribute('data-verdict', 'wrong')
  await expect(page.getByTestId('book-check')).toContainText('The Ministry list now has')
})

test('a file with the wrong grade in its name is refused', async ({ page }) => {
  await open(page, { ...baseBook, catalogId: 'off-p1-english-t1', sourceUrl: ENTRY_URL, sizeMb: SIZE }, 1)
  await page.getByTestId('book-check-file').setInputFiles({
    name: 'English_language_prim4_t1.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4'),
  })
  await expect(page.getByRole('alert')).toContainText('different grade')
})

test('replacing the file keeps the reading place', async ({ page }) => {
  await open(page, { ...baseBook, catalogId: 'off-p1-english-t1', sourceUrl: OLD_URL, sizeMb: SIZE }, 1)
  await page.getByTestId('book-check-file').setInputFiles('tests/e2e/fixtures/mini-book.pdf')
  await expect(page.getByTestId('book-check-done')).toBeVisible({ timeout: 20000 })
  await expect(page.getByTestId('book-check-done')).toContainText('2 pages')
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('jessica-profile-v1') || '{}').state)
  expect(state.customBooks[0].id).toBe('chk-book')
  expect(state.customBooks[0].pageCount).toBe(2)
    expect(state.bookProgress['chk-book'].lastPage).toBe(2)
})

test('the check reads fine in Arabic on a phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.addInitScript((data) => {
    if (!window.localStorage.getItem('jessica-profile-v1')) {
      data.state.settings.language = 'ar'
      window.localStorage.setItem('jessica-profile-v1', JSON.stringify(data))
    }
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, profile({ ...baseBook, catalogId: 'off-p1-english-t1', sourceUrl: OLD_URL, sizeMb: SIZE }, 3))
  await page.goto('/#/course/chk-book')
  await page.getByTestId('book-check-open').click()
  await expect(page.getByTestId('book-check-verdict')).toContainText('شكله غلط')
  await page.waitForTimeout(700)
  await page.screenshot({ path: 'test-results/book-check-ar-390.png' })
})
