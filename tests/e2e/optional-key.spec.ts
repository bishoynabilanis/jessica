import { test, expect } from '@playwright/test'

const baseSettings = {
  language: 'en',
  gradeLevel: 7,
  curriculum: 'egypt',
  schoolType: 'government',
  primaryUi: 'auto',
  aiProvider: 'gemini',
  theme: 'dark',
  voiceLocale: '',
  shareCounts: false,
  shareErrors: false,
}

const book = {
  id: 'test-book',
  title: 'Test Book',
  subject: 'English',
  grade: 7,
  term: 'Term 1',
  pageCount: 10,
  custom: true,
  units: [],
}

function profile(overrides: Record<string, unknown>) {
  const { settings: settingsOverride, ...rest } = overrides
  return {
    state: {
      onboarded: true,
      acceptedTerms: 1,
      name: 'Tester',
      apiKey: '',
      model: 'gemini-1.5-flash',
      xp: 0,
      streak: 0,
      coins: 0,
      customBooks: [book],
      ...rest,
      settings: { ...baseSettings, keyOptional: false, ...((settingsOverride as object) || {}) },
    },
    version: 3,
  }
}

test('the app opens without an API key when the learner chose to skip it', async ({ page }) => {
  const payload = profile({ settings: { keyOptional: true } })
  await page.addInitScript((data) => {
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify(data))
    window.sessionStorage.setItem('jessica-counted-session', '1')
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, payload)

  await page.goto('/#/')
  await expect(page.locator('body')).toContainText('Today’s plan')
  await expect(page.locator('body')).toContainText('Tester')
})

test('the setup gate offers to continue without a key and then opens the app', async ({ page }) => {
  const payload = profile({})
  await page.addInitScript((data) => {
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify(data))
    window.sessionStorage.setItem('jessica-counted-session', '1')
  }, payload)

  await page.goto('/#/')
  const skip = page.getByRole('button', { name: 'Continue without a key' })
  await expect(skip).toBeVisible()
  await skip.click()

  await expect(page.locator('body')).toContainText('Today’s plan')
})
