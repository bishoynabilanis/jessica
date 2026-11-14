import { test, expect } from '@playwright/test'

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

function profile(state: Record<string, unknown> = {}, settings: Record<string, unknown> = {}) {
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
      ...state,
      settings: {
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
        keyOptional: true,
        quickStart: true,
        ...settings,
      },
    },
    version: 3,
  }
}

async function boot(page: import('@playwright/test').Page, payload: unknown, extra: Record<string, string> = {}) {
  await page.addInitScript(
    ([data, stored]) => {
      // Only seed once: a reload must not overwrite what the app persisted.
      if (!window.localStorage.getItem('jessica-profile-v1')) {
        window.localStorage.setItem('jessica-profile-v1', JSON.stringify(data))
      }
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
      for (const [key, value] of Object.entries(stored as Record<string, string>)) window.localStorage.setItem(key, value)
    },
    [payload, extra] as const,
  )
}

test('a new learner sees the first five minutes checklist and can hide it', async ({ page }) => {
  await boot(page, profile())
  await page.goto('/#/')

  await expect(page.getByText('Your first five minutes')).toBeVisible()
  await expect(page.getByText('{n} of 3 done')).toHaveCount(0)
  await expect(page.getByText('0 of 3 done')).toBeVisible()
  await expect(page.getByRole('link', { name: /Open your book/ })).toBeVisible()

  await page.getByRole('button', { name: 'Hide for now' }).click()
  await expect(page.getByText('Your first five minutes')).toHaveCount(0)

  await page.reload()
  await expect(page.getByText('Your first five minutes')).toHaveCount(0)
})

test('the checklist tracks real progress and retires itself when all steps are done', async ({ page }) => {
  await boot(
    page,
    profile({
      bookProgress: { 'test-book': { lastPage: 3, total: 10, updatedAt: Date.now() } },
      unitMastery: { 'test-book:1': { best: 4, total: 5, attempts: 1, lastAt: Date.now() } },
      planner: [{ id: 'p1', title: 'Read one page', kind: 'read', minutes: 10, done: false, date: '2026-11-14' }],
    }),
  )
  await page.goto('/#/')

  await expect(page.getByText('Your first five minutes')).toHaveCount(0)
})

test('a partial checklist shows the completed step ticked', async ({ page }) => {
  await boot(page, profile({ bookProgress: { 'test-book': { lastPage: 1, total: 10, updatedAt: Date.now() } } }))
  await page.goto('/#/')

  await expect(page.getByText('Your first five minutes')).toBeVisible()
  await expect(page.getByText('1 of 3 done')).toBeVisible()
})

test('opening the app resumes the last study screen', async ({ page }) => {
  await boot(page, profile(), {
    'jessica-last-route': JSON.stringify({ path: '/plan', at: Date.now() }),
  })
  await page.goto('/#/')

  await expect(page).toHaveURL(/#\/plan/)
  await expect(page.locator('body')).toContainText('A short plan that fits today')
})

test('the primary action resumes the book the learner was reading', async ({ page }) => {
  await boot(
    page,
    profile({ bookProgress: { 'test-book': { lastPage: 4, total: 10, updatedAt: Date.now() } } }),
  )
  await page.goto('/#/')

  const cta = page.getByRole('button', { name: /Pick up where you left off/ })
  await expect(cta).toBeVisible()
  await cta.click()
  await expect(page).toHaveURL(/#\/reader\/test-book/)
})
