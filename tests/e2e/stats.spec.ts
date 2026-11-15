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
          xp: 1240,
          streak: 9,
          coins: 0,
          customBooks: [book],
          completedTopics: ['a', 'b'],
          skillStats: {},
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

test('the numbers board shows the device figures and explains the counters', async ({ page }) => {
  await page.goto('/#/stats')

  await expect(page.getByText('The app, by the numbers')).toBeVisible()
  await expect(page.getByText('Opens on this device')).toBeVisible()
  await expect(page.getByText('On this device', { exact: true })).toBeVisible()
  await expect(page.getByText(/125\d/)).toBeVisible()
  await expect(page.getByText('How these numbers work')).toBeVisible()
  await expect(page.getByRole('main').getByRole('link', { name: 'Settings' })).toBeVisible()
})

test('the settings counter links to the board', async ({ page }) => {
  await page.goto('/#/settings')
  await expect(page.getByRole('link', { name: /Open the numbers board/ })).toBeVisible()
  await page.getByRole('link', { name: /Open the numbers board/ }).click()
  await expect(page).toHaveURL(/#\/stats/)
  await expect(page.getByText('The app, by the numbers')).toBeVisible()
})
