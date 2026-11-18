import { test, expect } from '@playwright/test'

test('the offline shell boots on the first reload without network', async ({ page, context }) => {
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

  await page.goto('/')
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 20000 })
  await expect(page.locator('h1').first()).toBeVisible()

  // The worker must boot from its own cache before any route has been
  // revisited, which is exactly the "install, then lose the network" case.
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByText('وضع أوفلاين').first()).toBeVisible({ timeout: 12000 })
  await expect(page.locator('h1').first()).toBeVisible()
  await context.setOffline(false)
})
