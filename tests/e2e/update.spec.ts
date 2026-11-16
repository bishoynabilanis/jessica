import { test, expect } from '@playwright/test'

// The service worker is irrelevant here: this exercises the deploy-id check
// that runs even when a browser never asks for a new worker.
test.use({ serviceWorkers: 'block' })

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

test('a new deploy raises the refresh banner even without a service worker', async ({ page }) => {
  await page.route('**/version.json*', (route) => route.fulfill({ json: { version: 'a-newer-deploy' } }))
  await page.goto('/#/')

  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await expect(page.getByText('New version available.')).toBeVisible()
})

test('the built worker carries the same deploy id as version.json', async ({ request }) => {
  const version = (await (await request.get('/version.json')).json()) as { version?: string }
  expect(version.version).toBeTruthy()

  const worker = await (await request.get('/sw.js')).text()
  expect(worker).toContain(`jessica-${version.version}`)
  expect(worker).not.toContain('__BUILD__')
})
