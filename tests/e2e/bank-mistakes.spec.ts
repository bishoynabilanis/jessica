import { test, expect } from '@playwright/test'

const MISTAKES = [
  { id: 'm_1', question: '2 + 2 = ?', options: ['3', '4', '5', '6'], answer: 1, chosen: 0, explanation: '2 + 2 = 4', subject: 'Mathematics', topic: 'Addition', createdAt: 1 },
  { id: 'm_2', question: 'The plural of “city” is', options: ['citys', 'cities', 'cityes', 'citis'], answer: 1, chosen: 3, explanation: 'city → cities', subject: 'English', topic: 'Plurals', createdAt: 2 },
  { id: 'm_3', question: 'جمع «كتاب» هو', options: ['كتابات', 'كتب', 'كتائب', 'مكتبات'], answer: 1, chosen: 0, explanation: 'جمع «كتاب» هو «كتب».', subject: 'Arabic', topic: 'الجمع', createdAt: 3 },
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
          },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, MISTAKES)
})

test('the notebook becomes a drill, and a corrected mistake moves one step out', async ({ page }) => {
  await page.goto('/#/bank')

  const button = page.getByTestId('bank-mistakes')
  await expect(button).toBeEnabled()
  await expect(button).toContainText('3')
  await button.click()

  await expect(page.getByText('Question 1 of 3')).toBeVisible()

  // the seeded answers are all index 1
  for (let question = 1; question <= 3; question += 1) {
    await expect(page.getByText(`Question ${question} of 3`)).toBeVisible()
    await page.getByTestId('bank-option').nth(1).click()
    await page.getByTestId('bank-next').click()
  }

  await expect(page.getByRole('button', { name: /New drill/ })).toBeVisible()

  const after = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    const list = raw ? JSON.parse(raw).state.mistakes : []
    return list.map((item: { reviewStep?: number; reviewAt?: number }) => ({
      step: item.reviewStep,
      inFuture: typeof item.reviewAt === 'number' && item.reviewAt > Date.now(),
    }))
  })
  // Correct answers are not deleted — they are rescheduled, one step further out.
  expect(after.length).toBe(3)
  for (const entry of after) {
    expect(entry.step).toBe(1)
    expect(entry.inFuture).toBe(true)
  }
})
