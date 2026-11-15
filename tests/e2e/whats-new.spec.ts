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
          mistakes: [],
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

test('the home page announces the bank and opens it', async ({ page }) => {
  await page.goto('/#/')

  const card = page.getByTestId('whats-new')
  await expect(card).toBeVisible()
  await expect(card.getByText('A question bank that never runs out')).toBeVisible()

  await page.getByTestId('whats-new-bank').click()
  await expect(page.getByRole('heading', { name: 'A bank that never runs out' })).toBeVisible()
})

test('the announcement can be dismissed and stays dismissed', async ({ page }) => {
  await page.goto('/#/')
  await expect(page.getByTestId('whats-new')).toBeVisible()

  await page.getByRole('button', { name: 'Hide this' }).click()
  await expect(page.getByTestId('whats-new')).toHaveCount(0)

  await page.reload()
  await expect(page.getByTestId('whats-new')).toHaveCount(0)
  expect(await page.evaluate(() => window.localStorage.getItem('jessica-whatsnew-v1'))).toBe('bank-focus')
})
