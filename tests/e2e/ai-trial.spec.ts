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
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  })
})

test('without a key the app opens on the trial instead of a key screen', async ({ page }) => {
  await page.goto('/#/')
  await expect(page.getByRole('heading', { name: /خلّي/ }).first()).toBeVisible()
  await expect(page.getByText('مدّرسك الذكي محتاج مفتاح')).toHaveCount(0)
})

test('settings explain cloud vs offline and block offline on unsupported hardware', async ({ page }) => {
  await page.goto('/#/settings')
  const card = page.getByTestId('ai-mode-card')
  await expect(card).toBeVisible({ timeout: 20_000 })
  await expect(page.getByTestId('ai-mode-cloud')).toBeVisible()
  // headless Chrome has no WebGPU: the offline option must be disabled and explained
  await expect(page.getByTestId('ai-mode-offline')).toBeDisabled()
  // with WebGPU the download is offered, without it the notice explains why not
  const download = await page.getByTestId('ai-offline-download').count()
  const notice = await page.getByText(/الأجهزة القوية/).count()
  expect(download + notice).toBeGreaterThan(0)
})

test('without WebGPU the offline option explains itself instead of breaking', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'deviceMemory', { value: 4, configurable: true })
  })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/#/settings')
  await expect(page.getByTestId('ai-mode-card')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByText(/الأجهزة القوية/)).toBeVisible()
  await expect(page.getByTestId('ai-offline-download')).toHaveCount(0)
  expect(errors).toEqual([])
})
