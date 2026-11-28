import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = { id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }
    window.localStorage.setItem(
      'jessica-profile-v1',
      JSON.stringify({
        state: {
          onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: '', model: 'gemini-1.5-flash', xp: 100, streak: 1, coins: 0,
          customBooks: [book], completedTopics: [], skillStats: {}, dailyLog: {},
          settings: { language: 'en', gradeLevel: 7, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  })
})

test('calm minute: breathing circle runs, stores nothing', async ({ page }) => {
  await page.clock.install()
  await page.goto('/#/calendar')
  await page.getByTestId('calm-open').click()
  const dialog = page.getByTestId('calm-minute')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('not treatment')).toBeVisible()
  const before = await page.evaluate(() => JSON.stringify(Object.assign({}, window.localStorage)))
  await page.getByTestId('calm-start').click()
  await expect(page.getByTestId('calm-label')).toHaveText('Breathe in')
  await page.clock.runFor(4100)
  await expect(page.getByTestId('calm-label')).toHaveText('Breathe out')
  await page.clock.runFor(4000)
  await expect(page.getByTestId('calm-label')).toHaveText('Breathe in')
  await page.clock.runFor(60000)
  await expect(page.getByTestId('calm-done')).toBeVisible()
  const after = await page.evaluate(() => JSON.stringify(Object.assign({}, window.localStorage)))
  expect(after).toBe(before)
})

test('calm minute: reduced motion keeps the circle still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#/calendar')
  await page.getByTestId('calm-open').click()
  await page.getByTestId('calm-start').click()
  const circle = page.getByTestId('calm-circle')
  await expect(circle).toHaveCSS('transition-duration', '0s')
  await expect(page.getByTestId('calm-label')).toHaveText('Breathe in')
})
