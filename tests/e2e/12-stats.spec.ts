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
          xp: 1240,
          streak: 9,
          coins: 0,
          customBooks: [book],
          completedTopics: ['a', 'b'],
          skillStats: {},
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
          },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  })
})

test('the numbers board shows the device figures and explains the counters', async ({ page }) => {
  await page.goto('/#/stats')

  await expect(page.getByText('The app, by the numbers')).toBeVisible()
  await expect(page.getByText('Opens on this device')).toBeVisible()
  await expect(page.getByText('On this device', { exact: true })).toBeVisible()
  await expect(page.getByText(/125\d/)).toBeVisible()
  await expect(page.getByText('How these numbers work')).toBeVisible()
  await expect(page.getByRole('main').getByRole('link', { name: 'Settings' })).toBeVisible()
})

test('the settings counter links to the board', async ({ page }) => {
  await page.goto('/#/settings')
  await expect(page.getByRole('link', { name: /Open the numbers board/ })).toBeVisible()
  await page.getByRole('link', { name: /Open the numbers board/ }).click()
  await expect(page).toHaveURL(/#\/stats/)
  await expect(page.getByText('The app, by the numbers')).toBeVisible()
})

test('browser and installation signals count once across reloads and both install signals', async ({ page, context }) => {
  const hits: string[] = []
  await context.route('https://abacus.jasoncameron.dev/**', async route => {
    const url = route.request().url()
    if (url.includes('/hit/')) hits.push(url.split('/').at(-1) || '')
    await route.fulfill({ json: { value: 42 } })
  })
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window)
    window.matchMedia = query => query === '(display-mode: standalone)'
      ? { ...original(query), matches: true } as MediaQueryList : original(query)
  })
  await page.goto('/#/stats')
  await expect.poll(() => hits.length).toBe(3)
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')))
  await page.reload()
  await expect(page.getByText('Browser records', { exact: true })).toBeVisible()
  expect(hits.filter(k => k === 'browsers-v2')).toHaveLength(1)
  expect(hits.filter(k => k === 'install-browsers-v2')).toHaveLength(1)
  expect(hits.filter(k => k === 'opens')).toHaveLength(1)
})

test('opt out prevents reads and writes to the counter provider', async ({ page, context }) => {
  const requests: string[] = []
  await context.route('https://abacus.jasoncameron.dev/**', async route => {
    requests.push(route.request().url())
    await route.fulfill({ json: { value: 99 } })
  })
  await page.addInitScript(() => {
    const profile = JSON.parse(localStorage.getItem('jessica-profile-v1') || '{}')
    profile.state.settings.shareCounts = false
    localStorage.setItem('jessica-profile-v1', JSON.stringify(profile))
  })
  await page.goto('/#/stats')
  await expect(page.getByTestId('counter-notice')).toBeVisible()
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')))
  await page.getByRole('button', { name: 'Refresh', exact: true }).click()
  expect(requests).toHaveLength(0)
})

test('a missing counter shows zero while a failed service stays unavailable', async ({ page, context }) => {
  await context.route('https://abacus.jasoncameron.dev/**', async route => {
    const url = route.request().url()
    await route.fulfill(url.endsWith('install-browsers-v2')
      ? { status: 500, json: { error: 'unavailable' } }
      : { status: 404, json: { error: 'not found' } })
  })
  await page.goto('/#/stats')
  await expect(page.getByText('Install browser records', { exact: true }).locator('..')).toContainText('—')
  await expect(page.getByText('Browser records', { exact: true }).locator('..')).toContainText('0')
})
