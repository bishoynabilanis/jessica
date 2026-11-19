import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = { id: 'b1', title: 'Social Studies', subject: 'Social Studies', grade: 7, term: 'Term 1', pageCount: 40, custom: true, units: [] }
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
            sound: false,
            aiMode: 'cloud',
          },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  })
})

test('social studies and computing are part of the bank', async ({ page }) => {
  await page.goto('/#/bank')

  await expect(page.getByRole('button', { name: 'Social Studies' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'ICT' })).toBeVisible()

  await page.getByRole('button', { name: 'Social Studies' }).click()
  await page.getByTestId('bank-start').click()

  await expect(page.getByText('Question 1 of 10')).toBeVisible()
  await expect(page.locator('body')).toContainText('Social Studies')

  const options = page.getByTestId('bank-option')
  await expect(options).toHaveCount(4)
  await options.first().click()
  await expect(page.getByText(/Correct — here is why|Not quite — here is the trick/)).toBeVisible()
})

test('french and german are available in the question bank', async ({ page }) => {
  await page.goto('/#/bank')

  await expect(page.getByRole('button', { name: 'French' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'German' })).toBeVisible()

  await page.getByRole('button', { name: 'French' }).click()
  await page.getByTestId('bank-start').click()

  await expect(page.getByText('Question 1 of 10')).toBeVisible()
  await expect(page.locator('body')).toContainText('French')
})

test('official exam models run a timed paper and build a 7-day recovery plan', async ({ page }) => {
  await page.goto('/#/bank')

  await expect(page.getByTestId('bank-milestone-october')).toBeVisible()
  await page.getByTestId('bank-milestone-october').click()

  await expect(page.getByText('Question 1 of 15')).toBeVisible()
  await expect(page.getByTestId('bank-clock')).toBeVisible()

  // Hand in early so at least one skill is missed and the 7-day recovery plan appears.
  await page.getByTestId('bank-submit').click()
  await expect(page.getByText('October monthly assessment')).toBeVisible()
  await expect(page.getByTestId('bank-recovery-plan')).toBeVisible()

  await page.getByTestId('bank-recovery-plan').click()
  await expect(page.getByTestId('bank-recovery-open')).toBeVisible()
})
