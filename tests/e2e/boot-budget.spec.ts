import { test, expect } from '@playwright/test'

const profile = {
  state: {
    onboarded: true,
    acceptedTerms: 1,
    name: 'Tester',
    apiKey: '',
    model: 'gemini-1.5-flash',
    xp: 0,
    streak: 0,
    coins: 0,
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
    },
  },
  version: 3,
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((data) => {
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify(data))
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, profile)
})

test('the share sheet still opens after being lazy loaded', async ({ page }) => {
  await page.goto('/#/')
  await expect(page.locator('body')).toContainText('Today’s plan')

  await page.getByRole('button', { name: 'Share Jessica' }).click()
  await expect(page.locator('body')).toContainText('Send the app to a friend')
  await expect(page.locator('a[href^="https://wa.me/"]')).toBeVisible()
})

test('the first load does not pull the AI-only bundles', async ({ page }) => {
  const requested: string[] = []
  page.on('request', (request) => {
    if (request.url().endsWith('.js')) requested.push(request.url().split('/').pop() || '')
  })

  await page.goto('/#/')
  await expect(page.locator('body')).toContainText('Today’s plan')

  const joined = requested.join(' ')
  expect(joined).not.toContain('markdown-')
  expect(joined).not.toContain('mermaid-')
  expect(joined).not.toContain('pdfjs-')
})
