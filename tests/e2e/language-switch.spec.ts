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

test('the home bar shows the current language and lets you pick another', async ({ page }) => {
  await page.goto('/#/')
  await expect(page.getByTestId('language-current')).toHaveText('العربية')

  await page.getByTestId('language-button').click()
  const menu = page.getByTestId('language-menu')
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitemradio')).toHaveCount(7)

  await menu.getByText('English', { exact: true }).click()
  await expect(page.getByTestId('language-current')).toHaveText('English')
  await expect(page.getByTestId('language-menu')).toHaveCount(0)

  const language = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    return raw ? JSON.parse(raw).state.settings.language : ''
  })
  expect(language).toBe('en')
})
