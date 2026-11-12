import { test, expect } from '@playwright/test'

const profile = {
  state: {
    onboarded: true,
    acceptedTerms: 1,
    name: 'Tester',
    apiKey: 'AIzaFAKE',
    model: 'gemini-1.5-flash',
    xp: 120,
    streak: 3,
    coins: 12,
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
    },
    customBooks: [
      {
        id: 'test-book',
        title: 'Test Book',
        subject: 'English',
        grade: 7,
        term: 'Term 1',
        pageCount: 10,
        custom: true,
        units: [],
      },
    ],
  },
  version: 3,
}

test.beforeEach(async ({ context }) => {
  await context.addInitScript((payload) => {
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify(payload))
    window.sessionStorage.setItem('jessica-counted-session', '1')
  }, profile)
})

test('dashboard opens with the learner profile', async ({ page }) => {
  await page.goto('/#/')
  await expect(page.locator('body')).toContainText('Today’s plan')
  await expect(page.locator('body')).toContainText('Tester')
})

test('ask page renders with its search box', async ({ page }) => {
  await page.goto('/#/ask')
  await expect(page.locator('body')).toContainText('Ask all your books')
  await expect(page.getByPlaceholder('e.g. Explain photosynthesis from my science book')).toBeVisible()
})

test('adaptive practice shows the question-bank card', async ({ page }) => {
  await page.goto('/#/practice')
  await expect(page.locator('body')).toContainText('Question banks')
})

test('help centre lists the FAQ', async ({ page }) => {
  await page.goto('/#/help')
  await expect(page.locator('body')).toContainText('How can we help?')
  await expect(page.locator('details').first()).toBeVisible()
})

test('bug report arrives pre-filled', async ({ page }) => {
  await page.goto('/#/feedback?kind=bug&auto=1')
  await expect(page.locator('body')).toContainText('prepared the report')
  await expect(page.locator('textarea')).not.toHaveValue('')
})

test('install page explains every device', async ({ page }) => {
  await page.goto('/#/install')
  await expect(page.locator('body')).toContainText('iPhone / iPad')
  await expect(page.locator('body')).toContainText('Android')
  await expect(page.locator('body')).toContainText('Computer')
})

test('photo solver opens with the camera actions', async ({ page }) => {
  await page.goto('/#/solve')
  await expect(page.locator('body')).toContainText('Snap any question and understand it')
  await expect(page.getByRole('button', { name: 'Open camera' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Upload a photo' })).toBeVisible()
})

test('weekly parent report shows the week stats', async ({ page }) => {
  await page.goto('/#/report')
  await expect(page.locator('body')).toContainText('This week, in one page')
  await expect(page.locator('body')).toContainText('Focus this week')
  await expect(page.locator('body')).toContainText('Active days')
})
