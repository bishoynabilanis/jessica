import { test, expect, type Page } from '@playwright/test'
import { bookPool, chooseDaily, dailyStreak, hashSeed } from '../../src/lib/dailyQuestion'
import type { Book } from '../../src/types'

const q = (n: number, answer = 1) => ({
  question: `Daily test question ${n}?`,
  options: ['wrong a', 'right b', 'wrong c', 'wrong d'],
  answer,
  explanation: `Because option b is right (${n}).`,
})
const book = (id: string, catalogId?: string) =>
  ({ id, title: `Book ${id}`, subject: 'Science', language: 'en', emoji: '', accent: '', term: '', description: '', file: '', pageCount: 3, grade: 7, catalogId }) as Book
const quiz = (bookId: string, qs: ReturnType<typeof q>[]) => ({ id: `${bookId}:u1`, bookId, subject: 'Science', questions: qs, createdAt: 1, done: false })

test('the pool only holds Ministry catalogue books and the pick is stable for a day', () => {
  const books = [book('m1', 'cat-1'), book('own')]
  const quizzes = [quiz('m1', [q(1), q(2), q(3)]), quiz('own', [{ ...q(9), question: 'FROM OWN PDF' }])]
  const pool = bookPool(quizzes, books)
  expect(pool).toHaveLength(3)
  expect(pool.some((item) => item.question.question === 'FROM OWN PDF')).toBe(false)
  const a = chooseDaily('2026-11-25', quizzes, books, 7)
  const b = chooseDaily('2026-11-25', quizzes, books, 7)
  expect(a?.question.question).toBe(b?.question.question)
  expect(a?.source.kind).toBe('book')
  // different days spread over the pool
  const days = Array.from({ length: 14 }, (_, i) => chooseDaily(`2026-12-${String(i + 1).padStart(2, '0')}`, quizzes, books, 7)?.question.question)
  expect(new Set(days).size).toBeGreaterThan(1)
  expect(hashSeed('x')).toBe(hashSeed('x'))
})

test('with no Ministry book questions it falls back to a labelled grade skill question', () => {
  const fallback = chooseDaily('2026-11-25', [quiz('own', [q(1)])], [book('own')], 7)
  expect(fallback?.source.kind).toBe('bank')
  expect(fallback?.question.options).toHaveLength(4)
})

test('the streak counts days in a row and breaks on a gap', () => {
  expect(dailyStreak({ '2026-11-25': true, '2026-11-24': false, '2026-11-23': true }, '2026-11-25')).toBe(3)
  expect(dailyStreak({ '2026-11-24': true, '2026-11-23': true }, '2026-11-25')).toBe(2)
  expect(dailyStreak({ '2026-11-20': true }, '2026-11-25')).toBe(0)
})

async function seed(page: Page, language: string) {
  await page.addInitScript(
    ({ language }) => {
      if (window.localStorage.getItem('jessica-profile-v1')) return
      const mk = (id: string, catalogId?: string) => ({ id, title: `Book ${id}`, subject: 'Science', language: 'en', emoji: '', accent: '', term: 'Term 1', description: '', file: '', pageCount: 30, grade: 7, catalogId, units: [] })
      window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: {
            onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: '', model: 'gemini-1.5-flash', xp: 1, streak: 1, coins: 0,
            customBooks: [mk('m1', 'cat-1'), mk('own')],
            completedTopics: [], skillStats: {}, mistakes: [],
            settings: { language, gradeLevel: 7, curriculum: 'egypt', schoolType: 'government', primaryUi: 'study', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false },
          },
          version: 3,
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
    },
    { language },
  )
}

async function seedQuizzes(page: Page, withBook: boolean) {
  await page.waitForTimeout(800)
  await page.evaluate(async (withBook) => {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.open('jessica-db', 1)
      req.onupgradeneeded = () => {
        const d = req.result
        if (!d.objectStoreNames.contains('cards')) {
          const s = d.createObjectStore('cards', { keyPath: 'id' })
          s.createIndex('due', 'due'); s.createIndex('bookId', 'bookId'); s.createIndex('subject', 'subject')
        }
        if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv')
        if (!d.objectStoreNames.contains('quizzes')) d.createObjectStore('quizzes', { keyPath: 'id' }).createIndex('createdAt', 'createdAt')
        if (!d.objectStoreNames.contains('exams')) d.createObjectStore('exams', { keyPath: 'id' })
      }
      req.onsuccess = () => {
        const tx = req.result.transaction('quizzes', 'readwrite')
        const mkq = (n: number) => ({ question: `Which part of plant number ${n} makes food?`, options: ['wrong a', 'right b', 'wrong c', 'wrong d'], answer: 1, explanation: 'Because option b is right.' })
        if (withBook) tx.objectStore('quizzes').put({ id: 'm1:u1', bookId: 'm1', subject: 'Science', questions: [mkq(1), mkq(2)], createdAt: 2, done: false })
        tx.objectStore('quizzes').put({ id: 'own:u1', bookId: 'own', subject: 'Science', questions: [{ ...mkq(7), question: 'FROM OWN PDF' }], createdAt: 3, done: false })
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      }
      req.onerror = () => reject(req.error)
    })
  }, withBook)
}

for (const [lang, width] of [['en', 1280], ['ar', 390]] as const) {
  test(`daily question from the student's Ministry book, answered once, kept after reload (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    await seed(page, lang)
    await page.goto('./#/')
    await seedQuizzes(page, true)
    await page.reload()
    const card = page.getByTestId('daily-question')
    await expect(card).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('daily-source')).toContainText('Book m1')
    await expect(card).not.toContainText('FROM OWN PDF')
    const text = await card.locator('p.font-bold').first().innerText()
    await card.scrollIntoViewIfNeeded()
    await page.screenshot({ path: `test-results/daily-before-${lang}.png` })
    await page.getByTestId('daily-option').nth(1).click()
    await expect(page.getByTestId('daily-result')).toBeVisible()
    await expect(page.getByTestId('daily-streak')).toBeVisible()
    await card.scrollIntoViewIfNeeded()
    await page.screenshot({ path: `test-results/daily-after-${lang}.png` })
    await page.reload()
    await expect(page.getByTestId('daily-result')).toBeVisible()
    await expect(card.locator('p.font-bold').first()).toHaveText(text)
    await expect(page.getByTestId('daily-option').first()).toBeDisabled()
  })
}

test('a student with no Ministry book questions gets a clearly labelled grade skill question', async ({ page }) => {
  await seed(page, 'en')
  await page.goto('./#/')
  await seedQuizzes(page, false)
  await page.reload()
  await expect(page.getByTestId('daily-source')).toContainText('Not from a book page', { timeout: 15000 })
  await expect(page.getByTestId('daily-question')).not.toContainText('FROM OWN PDF')
  await expect(page.getByTestId('daily-option')).toHaveCount(4)
})
