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
          },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  })
})

test('a printable sheet carries the questions and an answer key', async ({ page }) => {
  await page.goto('/#/bank')

  await page.getByTestId('bank-print').click()

  const sheet = page.locator('.worksheet-print')
  await expect(sheet).toHaveCount(1)

  const text = (await sheet.textContent()) || ''
  expect(text).toContain('Practice sheet from Jessica')
  expect(text).toContain('Answer key and why')
  expect(text).toContain('Name')
  // ten questions on the sheet, each with four lettered options
  await expect(sheet.locator('li')).toHaveCount(10)
  expect((text.match(/A\)/g) || []).length).toBeGreaterThanOrEqual(10)
  expect((text.match(/D\)/g) || []).length).toBeGreaterThanOrEqual(10)
})

test('a finished exam is kept in the history and compared to the last one', async ({ page }) => {
  await page.goto('/#/bank')

  // first paper
  await page.getByTestId('bank-exam').click()
  await page.getByTestId('bank-option').first().click()
  await page.getByTestId('bank-submit').click()
  await expect(page.getByText('The whole paper, marked')).toBeVisible()

  // back to the intro: the paper is listed
  await page.getByRole('button', { name: 'Change subject' }).click()
  await expect(page.getByTestId('bank-history')).toBeVisible()
  await expect(page.getByTestId('bank-history')).toContainText('/20')

  // second paper: the result compares to the first
  await page.getByTestId('bank-exam').click()
  await page.getByTestId('bank-option').first().click()
  await page.getByTestId('bank-submit').click()
  await expect(page.getByTestId('bank-delta')).toBeVisible()

  const saved = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-bank-attempts-v1')
    return raw ? JSON.parse(raw) : []
  })
  expect(saved.length).toBe(2)
  expect(saved[0].mode).toBe('exam')
  expect(saved[0].total).toBe(20)
})
