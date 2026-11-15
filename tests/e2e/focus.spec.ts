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

test('the focus timer counts down, pauses and resumes', async ({ page }) => {
  await page.goto('/#/focus')

  await expect(page.getByRole('heading', { name: /Twenty-five minutes/ })).toBeVisible()
  // default 25:00
  await expect(page.getByText('25:00')).toBeVisible()

  await page.getByRole('button', { name: '15 min' }).click()
  await expect(page.getByText('15:00')).toBeVisible()

  await page.getByRole('button', { name: 'Start' }).click()
  await page.waitForTimeout(1300)
  await expect(page.getByText(/14:5\d/)).toBeVisible()

  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible()
})

test('a running session survives a reload', async ({ page }) => {
  await page.goto('/#/focus')
  await page.getByRole('button', { name: 'Start' }).click()
  await page.waitForTimeout(800)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  await expect(page.getByText(/2[45]:\d\d/)).toBeVisible()
})
