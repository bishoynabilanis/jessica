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
          skillStats: { 'Mathematics|Equations': { correct: 1, total: 5, lastAt: Date.now() } },
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

test('a skill link opens a paper aimed at that skill', async ({ page }) => {
  await page.goto('/#/bank?skill=Equations&subject=Mathematics')

  await expect(page.getByText('Question 1 of 10')).toBeVisible()
  await expect(page.getByText(/Equations/)).toBeVisible()
  // the deep link is consumed, so a reload starts a normal bank
  expect(page.url()).not.toContain('skill=')

  await page.getByTestId('bank-option').first().click()
  await expect(page.getByText(/Correct — here is why|Not quite — here is the trick/)).toBeVisible()
})
