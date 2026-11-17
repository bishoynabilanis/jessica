import { test, expect, type Page } from '@playwright/test'

async function seed(page: Page, grade: number) {
  await page.addInitScript((level) => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = { id: 'b1', title: 'Maths', subject: 'Mathematics', grade: level, term: 'Term 1', pageCount: 30, custom: true, units: [] }
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
          streak: 2,
          coins: 3,
          customBooks: [book],
          completedTopics: [],
          skillStats: {},
          mistakes: [],
          dailyLog: {},
          settings: {
            language: 'en',
            gradeLevel: level,
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
  }, grade)
}

test('the main header reserves the status-bar inset', async ({ page }) => {
  await seed(page, 7)
  await page.goto('/#/')
  await expect(page.locator('header').first()).toHaveClass(/safe-top/)
})

test('the kids header reserves it too', async ({ page }) => {
  await seed(page, 3)
  await page.goto('/#/kids')
  const header = page.locator('header').first()
  await expect(header).toBeVisible()
  await expect(header).toHaveClass(/safe-top/)
})

test('the built stylesheet carries the top inset rule', async ({ request }) => {
  const html = await (await request.get('./')).text()
  const href = html.match(/assets\/index-[^"]+\.css/)?.[0]
  expect(href).toBeTruthy()
  const css = await (await request.get(`./${href}`)).text()
  expect(css).toContain('safe-area-inset-top')
})
