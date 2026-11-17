import { test, expect, type Page } from '@playwright/test'

async function seed(page: Page, schoolType: 'government' | 'languages') {
  await page.addInitScript((type) => {
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
            schoolType: type,
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
  }, schoolType)
}

test('a government school gets the Arabic maths and science books, and no French', async ({ page }) => {
  await seed(page, 'government')
  await page.goto('/#/library')

  const science = page.locator('[data-testid="catalog-card"][data-subject="Science"]').first()
  const maths = page.locator('[data-testid="catalog-card"][data-subject="Mathematics"]').first()

  await expect(science).toHaveAttribute('data-language', 'ar')
  await expect(science).toContainText('العلوم')
  await expect(maths).toHaveAttribute('data-language', 'ar')
  await expect(page.locator('[data-testid="catalog-card"][data-subject="French"]')).toHaveCount(0)
})

test('a language school gets the English maths and science books plus French', async ({ page }) => {
  await seed(page, 'languages')
  await page.goto('/#/library')

  const science = page.locator('[data-testid="catalog-card"][data-subject="Science"]').first()
  const maths = page.locator('[data-testid="catalog-card"][data-subject="Mathematics"]').first()

  await expect(science).toHaveAttribute('data-language', 'en')
  await expect(science).toContainText('Science (English)')
  await expect(maths).toHaveAttribute('data-language', 'en')
  await expect(page.locator('[data-testid="catalog-card"][data-subject="French"]')).toHaveCount(1)
})
