import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = {
      id: 'u1',
      title: 'Maths',
      subject: 'Mathematics',
      language: 'ar',
      emoji: '📘',
      accent: '#21e6c9',
      term: 'Term 1',
      description: '',
      file: '',
      pageCount: 40,
      grade: 7,
      custom: true,
      units: [
        { id: 'unit-1', title: 'Unit one', startPage: 1, endPage: 10 },
        { id: 'unit-2', title: 'Unit two', startPage: 11, endPage: 20 },
      ],
    }
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
          bookProgress: { u1: { page: 3, total: 40, updatedAt: Date.now() } },
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

test('the bank offers a review of the current unit', async ({ page }) => {
  await page.goto('/#/bank')

  const card = page.getByTestId('bank-unit-card')
  await expect(card).toBeVisible()
  await expect(card).toContainText('Maths')
  await expect(card).toContainText('Unit one')

  await page.getByTestId('bank-unit').click()

  await expect(page.getByText('Question 1 of 20')).toBeVisible()

  // it behaves like practice: the answer and the reason appear on the spot
  await page.getByTestId('bank-option').first().click()
  await expect(page.getByText(/Correct — here is why|Not quite — here is the trick/)).toBeVisible()
})
