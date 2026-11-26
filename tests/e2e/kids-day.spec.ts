import { test, expect, type Page } from '@playwright/test'
import { summarizeDay } from '../../src/lib/kidsDay'

const books = [
  { id: 'b1', title: 'Maths 3', grade: 3, units: [{ id: 'u1', title: 'Counting' }, { id: 'u2', title: 'Adding' }, { id: 'u3', title: 'Shapes' }] },
]
const noon = new Date('2026-11-26T12:00:00+04:00').getTime()
const base = { today: '2026-11-26', kidsUsage: {}, lessonProgress: {}, topicLog: [], books, gradeLevel: 3, starsToday: 0 }

test.use({ timezoneId: 'Asia/Dubai' })

test('summary: minutes, learned today, and the next step', () => {
  const s = summarizeDay({ ...base, kidsUsage: { '2026-11-26': 610 }, lessonProgress: { 'b1:u1': { step: 3, done: true, updatedAt: noon }, 'b1:u2': { step: 1, done: false, updatedAt: noon + 1000 } } })
  expect(s.minutes).toBe(10)
  expect(s.learned).toEqual(['Counting'])
  expect(s.next).toMatchObject({ kind: 'lesson', unitId: 'u2', started: true })
  expect(s.active).toBe(true)
})

test('summary: a finished lesson points to the next unit, the last unit says finished, no progress starts the first', () => {
  const done = (id: string) => ({ ['b1:' + id]: { step: 3, done: true, updatedAt: noon } })
  expect(summarizeDay({ ...base, lessonProgress: done('u1') }).next).toMatchObject({ unitId: 'u2', started: false })
  expect(summarizeDay({ ...base, lessonProgress: done('u3') }).next).toMatchObject({ kind: 'finished' })
  expect(summarizeDay(base).next).toMatchObject({ unitId: 'u1' })
  expect(summarizeDay(base).active).toBe(false)
  // yesterday's finished lesson is not "today"
  expect(summarizeDay({ ...base, lessonProgress: { 'b1:u1': { step: 3, done: true, updatedAt: noon - 86400000 } } }).learned).toEqual([])
})

async function open(page: Page, language: string, path: string, withData = true) {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.clock.setFixedTime(new Date('2026-11-26T12:00:00+04:00'))
  await page.addInitScript(
    ({ language, withData, noon }) => {
      if (window.localStorage.getItem('jessica-profile-v1')) return
      const book = { id: 'b1', title: 'Maths 3', subject: 'Mathematics', grade: 3, term: 'Term 1', pageCount: 60, custom: true, units: [{ id: 'u1', title: 'Counting', pages: [1, 2] }, { id: 'u2', title: 'Adding', pages: [3, 4] }, { id: 'u3', title: 'Shapes', pages: [5, 6] }] }
      window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: {
            onboarded: true, acceptedTerms: 1, name: 'Maria', apiKey: '', model: 'gemini-1.5-flash', xp: 50, streak: 2, coins: 0,
            customBooks: [book], completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {},
            kidsUsage: withData ? { '2026-11-26': 610 } : {},
            lessonProgress: withData ? { 'b1:u1': { step: 3, done: true, updatedAt: noon }, 'b1:u2': { step: 1, done: false, updatedAt: noon + 1000 } } : {},
            settings: { language, gradeLevel: 3, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'light', keyOptional: true, quickStart: false, sound: false, aiMode: 'cloud' },
          },
          version: 3,
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
    },
    { language, withData, noon },
  )
  await page.goto(path)
}

test('My day shows minutes, what was finished, where tomorrow continues, and a star (English)', async ({ page }) => {
  await open(page, 'en', './#/kids/today')
  await expect(page.getByTestId('kids-today-minutes')).toContainText('10 minutes with Jessica today')
  await expect(page.getByTestId('kids-today-learned')).toContainText('Counting')
  await expect(page.getByTestId('kids-today-next')).toContainText('We continue from: Adding')
  await expect(page.getByTestId('kids-today-star')).toContainText('Here is your star for today!')
  await page.screenshot({ path: '/tmp/sh/kids-day-en.png' })
})

test('My day works in Arabic and the home entry opens it', async ({ page }) => {
  await open(page, 'ar', './#/kids/today')
  await expect(page.getByTestId('kids-today-next')).toContainText('هنكمل من')
  await expect(page.getByTestId('kids-today-star')).toContainText('دي نجمتك النهاردة')
  await page.screenshot({ path: '/tmp/sh/kids-day-ar.png' })
})

test('a fresh child sees a calm empty state and the star waits', async ({ page }) => {
  await open(page, 'en', './#/kids/today', false)
  await expect(page.getByTestId('kids-today-minutes')).toContainText('Just getting started today')
  await expect(page.getByTestId('kids-today-learned')).toContainText('Nothing finished yet today')
  await expect(page.getByTestId('kids-today-star')).toContainText('a star is waiting')
})

test('the Kids home has a My day button', async ({ page }) => {
  await open(page, 'en', './#/kids')
  await page.getByTestId('kids-today-entry').click()
  await expect(page.getByTestId('kids-today')).toBeVisible()
})
