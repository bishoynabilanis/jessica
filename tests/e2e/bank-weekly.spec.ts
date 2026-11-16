import { test, expect } from '@playwright/test'

test('the bank builds a weekly paper from the weakest skills', async ({ page }) => {
  await page.addInitScript(() => {
    const book = { id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }
    const now = Date.now()
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
          skillStats: {
            'Mathematics|Equations': { correct: 1, total: 6, lastAt: now },
            'Science|Speed': { correct: 2, total: 5, lastAt: now },
            'Mathematics|Addition': { correct: 9, total: 10, lastAt: now },
          },
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

  await page.goto('/#/bank')

  const card = page.getByTestId('bank-weekly-card')
  await expect(card).toBeVisible()
  await expect(card).toContainText('Equations')
  await expect(card).toContainText('Speed')

  await page.getByTestId('bank-weekly').click()
  await expect(page.getByText('Question 1 of 10')).toBeVisible()
  await page.getByTestId('bank-option').first().click()
  await expect(page.getByText(/Correct — here is why|Not quite — here is the trick/)).toBeVisible()
})
