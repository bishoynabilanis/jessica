import { test, expect } from '@playwright/test'

function profile(overrides: Record<string, unknown> = {}) {
  return {
    state: {
      onboarded: true,
      acceptedTerms: 1,
      name: 'Tester',
      apiKey: '',
      model: 'gemini-1.5-flash',
      xp: 0,
      streak: 0,
      longestStreak: 0,
      coins: 0,
      customBooks: [{ id: 'test-book', title: 'Test Book', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 10, custom: true, units: [] }],
      completedTopics: [],
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
      ...overrides,
    },
    version: 3,
  }
}

async function seed(page: import('@playwright/test').Page, data: Record<string, unknown>) {
  await page.addInitScript((payload) => {
    if (!window.localStorage.getItem('jessica-profile-v1')) {
      window.localStorage.setItem('jessica-profile-v1', JSON.stringify(payload))
    }
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, data)
}

test('a new learner sees the certificate sheet as a preview and cannot print it yet', async ({ page }) => {
  await seed(page, profile())
  await page.goto('/#/certificate')

  await expect(page.getByText('Not earned yet')).toBeVisible()
  await expect(page.getByTestId('certificate-sheet')).toBeVisible()
  await expect(page.getByRole('button', { name: /Print \/ Save as PDF/ })).toBeDisabled()
})

test('an earned certificate prints, shares and carries a scannable code', async ({ page }) => {
  await seed(
    page,
    profile({
      name: 'Nour',
      xp: 1240,
      streak: 9,
      completedTopics: ['math-u1', 'sci-u1', 'eng-u1'],
      skillStats: {
        'Mathematics|Fractions': { correct: 3, total: 4, lastAt: 1 },
        'Mathematics|Area': { correct: 4, total: 4, lastAt: 1 },
        'English|Reading': { correct: 2, total: 4, lastAt: 1 },
      },
    }),
  )
  await page.goto('/#/certificate')

  const sheet = page.getByTestId('certificate-sheet')
  await expect(sheet).toBeVisible()
  await expect(sheet).toContainText('Nour')
  await expect(sheet).toContainText('XP')
  // The daily-login bonus lands on load, so match the shape of the ID, not the exact XP.
  await expect(sheet).toContainText(/JSC-[0-9A-Z]+-[0-9A-Z]{3}/)

  // The QR is generated lazily, so give the chunk a moment.
  await expect(page.getByAltText('Scan to verify')).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('button', { name: /Print \/ Save as PDF/ })).toBeEnabled()
  await expect(page.getByText('Not earned yet')).toHaveCount(0)
})

test('a certificate code opens the same record in read-only mode', async ({ page }) => {
  const record = { n: 'Mariam', l: 4, x: 880, u: 5, s: 6, k: 9, g: 'Prep 1', d: '2026-03-01' }
  const value = Buffer.from(JSON.stringify(record), 'utf8').toString('base64url')

  await seed(page, profile())
  await page.goto(`/#/certificate?v=${value}`)

  await expect(page.getByText('Verified copy')).toBeVisible()
  const sheet = page.getByTestId('certificate-sheet')
  await expect(sheet).toContainText('Mariam')
  await expect(sheet).toContainText('880')
  await expect(page.getByRole('button', { name: /Print \/ Save as PDF/ })).toBeEnabled()
})
