import { test, expect, type Page } from '@playwright/test'

const MISTAKES = [
  { id: 'm_1', question: '2 + 2 = ?', options: ['3', '4', '5', '6'], answer: 1, chosen: 0, explanation: '2 + 2 = 4', subject: 'Mathematics', topic: 'Addition', createdAt: 1 },
]

async function seed(page: Page, language = 'en') {
  await page.addInitScript(
    ({ mistakes, language }) => {
      if (window.localStorage.getItem('jessica-profile-v1')) return
      window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: {
            onboarded: true,
            acceptedTerms: 1,
            name: 'Tester',
            apiKey: '',
            model: 'gemini-1.5-flash',
            xp: 100,
            streak: 1,
            coins: 0,
            customBooks: [{ id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }],
            completedTopics: [],
            skillStats: {},
            mistakes,
            dailyLog: {},
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
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
    },
    { mistakes: MISTAKES, language },
  )
}

const state = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('jessica-profile-v1') || '{}').state)

async function drill(page: Page, ar = false) {
  await page.goto('/#/mistakes')
  await page.getByRole('button', { name: ar ? /فرّن|مراجعة|Drill/ : /Drill mistakes/ }).first().click()
}

test('a right answer marked as a guess counts for half', async ({ page }) => {
  await seed(page)
  await drill(page)
  await page.getByRole('button', { name: /^B\s*4$|4$/ }).first().click()
  await expect(page.getByTestId('confidence')).toContainText('Did you understand it, or guess?')
  await page.getByTestId('confidence-guessed').click()
  await expect(page.getByTestId('confidence')).toContainText('bring this topic back sooner')
  const s = await state(page)
  const stat = s.skillStats['Mathematics|Addition']
  expect(stat.correct).toBe(1)
  expect(stat.total).toBe(1)
  expect(stat.guessedRight).toBe(1)
})

test('a wrong answer the student was sure about comes back tomorrow', async ({ page }) => {
  await seed(page)
  await drill(page)
  await page.getByRole('button', { name: /^C\s*5$|5$/ }).first().click()
  await page.getByTestId('confidence-understood').click()
  await expect(page.getByTestId('confidence')).toContainText('come back tomorrow')
  const s = await state(page)
  expect(s.skillStats['Mathematics|Addition'].understoodWrong).toBe(1)
  const fresh = s.mistakes.find((m: { chosen: number }) => m.chosen === 2)
  expect(fresh.reviewAt - Date.now()).toBeLessThan(26 * 3600 * 1000)
})

test('skipping the question changes nothing and the quiz moves on', async ({ page }) => {
  await seed(page)
  await drill(page)
  await page.getByRole('button', { name: /^B\s*4$|4$/ }).first().click()
  await expect(page.getByTestId('confidence')).toBeVisible()
  const s = await state(page)
  expect(s.skillStats['Mathematics|Addition'].guessedRight || 0).toBe(0)
  await page.getByRole('button', { name: /Results/ }).click()
})

test('the question reads fine in Arabic on a phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await seed(page, 'ar')
  await page.goto('/#/mistakes')
  await page.locator('button:has(svg.lucide-play)').first().click()
  await page.getByRole('button', { name: /^B\s*4$|4$/ }).first().click()
  await expect(page.getByTestId('confidence')).toContainText('فهمتها ولا خمّنت؟')
  await page.waitForTimeout(700)
  await page.screenshot({ path: 'test-results/understood-ar-390.png' })
})
