import { test, expect } from '@playwright/test'

const DAY = 86_400_000

const dueYet = [
  {
    id: 'm_due',
    question: '2 + 2 = ?',
    options: ['3', '4', '5', '6'],
    answer: 1,
    chosen: 0,
    explanation: '2 + 2 = 4',
    subject: 'Mathematics',
    topic: 'Addition',
    createdAt: Date.now() - 5 * DAY,
  },
  {
    id: 'm_later',
    question: 'The plural of “city” is',
    options: ['citys', 'cities', 'cityes', 'citis'],
    answer: 1,
    chosen: 3,
    explanation: 'city → cities',
    subject: 'English',
    topic: 'Plurals',
    createdAt: Date.now() - 5 * DAY,
    reviewStep: 1,
    reviewAt: Date.now() + 10 * DAY,
  },
]

test.beforeEach(async ({ page }) => {
  await page.addInitScript((mistakes) => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = { id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }
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
          customBooks: [book],
          completedTopics: [],
          skillStats: {},
          mistakes,
          dailyLog: {},
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
            sound: false,
            aiMode: 'cloud',
          },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, dueYet)
})

test('the notebook separates what is due from what is scheduled', async ({ page }) => {
  await page.goto('/#/mistakes')

  await expect(page.getByTestId('mistakes-due-card')).toBeVisible()
  await expect(page.getByTestId('mistakes-due-card')).toContainText('1 questions are back for review')
  await expect(page.getByText('Due now', { exact: true })).toBeVisible()
  await expect(page.getByText('Back in 10 days', { exact: true })).toBeVisible()
})

test('the daily plan asks for the due review', async ({ page }) => {
  await page.goto('/#/plan')
  await expect(page.getByText('1 mistakes are due for review', { exact: true })).toBeVisible()
})

test('a wrong answer sends the question back to tomorrow', async ({ page }) => {
  await page.goto('/#/mistakes')
  await page.getByTestId('mistakes-due').click()

  await expect(page.getByText('Question 1 of 1')).toBeVisible()
  await page.getByTestId('bank-option').nth(0).click()
  await page.getByTestId('bank-next').click()
  await expect(page.getByRole('button', { name: /New drill/ })).toBeVisible()

  const after = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    const list = raw ? JSON.parse(raw).state.mistakes : []
    const due = list.find((item: { id: string }) => item.id === 'm_due')
    return { step: due?.reviewStep, reviewAt: due?.reviewAt, now: Date.now() }
  })

  expect(after.step).toBe(0)
  expect(after.reviewAt).toBeGreaterThan(after.now)
  expect(after.reviewAt).toBeLessThan(after.now + 2 * DAY)
})
