import { test, expect } from '@playwright/test'

const profile = {
  state: {
    onboarded: true,
    acceptedTerms: 1,
    name: 'Tester',
    apiKey: '',
    model: 'gemini-1.5-flash',
    xp: 0,
    streak: 0,
    coins: 0,
    customBooks: [],
    completedTopics: [],
    skillStats: {},
    mistakes: [],
    dailyLog: {},
    settings: {
      language: 'ar',
      gradeLevel: 7,
      curriculum: 'egypt',
      schoolType: 'government',
      primaryUi: 'auto',
      aiProvider: 'gemini',
      theme: 'dark',
      keyOptional: false,
      quickStart: false,
      sound: false,
      aiMode: 'cloud',
    },
  },
  version: 3,
}

async function seed(page: import('@playwright/test').Page) {
  await page.addInitScript((value) => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify(value))
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, profile)
}

test('setup offers the AI without a key when the device can run the model', async ({ page }) => {
  await seed(page)
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'gpu', { value: {}, configurable: true })
    Object.defineProperty(navigator, 'deviceMemory', { value: 8, configurable: true })
  })

  await page.goto('/#/')
  await expect(page.getByText('١. شغّل المدرّس الذكي')).toBeVisible({ timeout: 20_000 })
  // The one-tap download is in the first screen a learner sees, not hidden in settings.
  await expect(page.getByTestId('offline-model-download')).toBeVisible()
  await expect(page.getByText('شغّل الذكاء من غير مفتاح')).toBeVisible()
})

test('on a device that cannot run the model, setup does not promise it', async ({ page }) => {
  await seed(page)
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'deviceMemory', { value: 4, configurable: true })
  })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/#/')
  await expect(page.getByText('١. شغّل المدرّس الذكي')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByTestId('offline-model-download')).toHaveCount(0)
  // The key path stays available instead.
  await expect(page.getByRole('button', { name: /Google Gemini|Gemini/ }).first()).toBeVisible()
  expect(errors).toEqual([])
})
