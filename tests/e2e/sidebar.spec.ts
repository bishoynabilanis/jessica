import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

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

test('the drawer closes on navigation instead of covering the app', async ({ page }) => {
  await page.goto('/#/')
  await page.getByRole('button', { name: 'افتح القائمة' }).click()

  const drawer = page.getByTestId('sidebar-drawer')
  await expect(drawer).toBeVisible()

  await drawer.getByRole('link', { name: /بنك الأسئلة/ }).click()
  await expect(drawer).toHaveCount(0)
  await expect(page).toHaveURL(/#\/bank$/)
})

test('the drawer closes with Escape and its list scrolls to the end', async ({ page }) => {
  await page.goto('/#/')
  await page.getByRole('button', { name: 'افتح القائمة' }).click()

  const drawer = page.getByTestId('sidebar-drawer')
  await expect(drawer).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe('hidden')

  const scrollable = await drawer.getByTestId('sidebar-nav').evaluate((nav) => {
    nav.scrollTop = 2000
    return { top: nav.scrollTop, max: nav.scrollHeight - nav.clientHeight }
  })
  expect(scrollable.max).toBeGreaterThan(0)
  expect(scrollable.top).toBeGreaterThan(0)

  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
})
