import { test, expect } from '@playwright/test'

function seed(customBooks: unknown[]) {
  window.localStorage.setItem(
    'jessica-profile-v1',
    JSON.stringify({
      state: {
        onboarded: true,
        acceptedTerms: 1,
        name: 'Maria',
        apiKey: '',
        model: 'gemini-1.5-flash',
        customBooks,
        completedTopics: [],
        skillStats: {},
        mistakes: [],
        dailyLog: {},
        settings: {
          language: 'en', gradeLevel: 1, curriculum: 'egypt', schoolType: 'government',
          primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: false, quickStart: true, sound: false,
        },
      },
      version: 3,
    }),
  )
  window.localStorage.setItem('jessica-disclaimer-v1', '1')
}

test('kids world: asking Jessica without a key opens the AI need modal', async ({ page }) => {
  await page.addInitScript(seed, [])
  await page.goto('/')
  await page.getByRole('button', { name: 'Continue without a key' }).click()
  await page.locator('input[type=file]').setInputFiles('tests/e2e/fixtures/mini-book.pdf')
  await page.getByRole('button', { name: 'Add to library' }).click()
  await expect(page.getByText('Jessica kids')).toBeVisible({ timeout: 20_000 })
  await page.goto('/#/kids/library')
  await page.getByRole('button', { name: /Start reading/ }).or(page.getByText('Start reading')).first().click()
  await page.getByPlaceholder(/Ask about this page/).fill('what is on this page?')
  await page.getByPlaceholder(/Ask about this page/).press('Enter')
  await expect(page.getByTestId('ai-need-settings')).toBeVisible()
  await page.getByTestId('ai-need-settings').click()
  await expect(page).toHaveURL(/#\/kids\/settings/)
})

test('setup: skipping the key does not claim the AI is on', async ({ page }) => {
  await page.addInitScript(seed, [])
  await page.goto('/')
  await page.getByRole('button', { name: 'Continue without a key' }).click()
  await expect(page.getByText('The AI is on — no key needed.')).toHaveCount(0)
  await expect(page.getByText(/The AI is off for now/)).toBeVisible()
})
