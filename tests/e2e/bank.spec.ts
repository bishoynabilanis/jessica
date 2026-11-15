import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
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
  })
})

test('a ten-question drill runs end to end with explanations', async ({ page }) => {
  await page.goto('/#/bank')

  await expect(page.getByRole('heading', { name: 'A bank that never runs out' })).toBeVisible()
  await page.getByTestId('bank-start').click()

  for (let question = 1; question <= 10; question += 1) {
    await expect(page.getByText(`Question ${question} of 10`)).toBeVisible()
    const options = page.getByTestId('bank-option')
    await expect(options).toHaveCount(4)
    await options.first().click()
    await expect(page.getByText(/Correct — here is why|Not quite — here is the trick/)).toBeVisible()
    await expect(page.getByTestId('bank-next')).toBeEnabled()
    await page.getByTestId('bank-next').click()
  }

  await expect(page.getByRole('button', { name: /New drill/ })).toBeVisible()
  await expect(page.getByText(/Weakest skill here/)).toBeVisible()

  const stats = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    return raw ? JSON.parse(raw).state.skillStats : {}
  })
  expect(Object.keys(stats).length).toBeGreaterThan(0)
})

test('another subject produces its own questions', async ({ page }) => {
  await page.goto('/#/bank')
  await page.getByRole('button', { name: 'Science' }).click()
  await page.getByTestId('bank-start').click()
  await expect(page.getByText(/Question 1 of 10/)).toBeVisible()
  await expect(page.getByText(/Science ·/)).toBeVisible()
})
