import { test, expect } from '@playwright/test'

const book = {
  id: 'test-book',
  title: 'Test Book',
  subject: 'Mathematics',
  grade: 7,
  term: 'Term 1',
  pageCount: 10,
  custom: true,
  units: [],
}

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
    customBooks: [book],
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
      quickStart: false,
    },
  },
  version: 3,
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((data) => {
    // Seed once: a later navigation must keep what the app persisted.
    if (!window.localStorage.getItem('jessica-profile-v1')) {
      window.localStorage.setItem('jessica-profile-v1', JSON.stringify(data))
    }
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, profile)
})

test('the level test runs twelve generated questions and writes the skills map', async ({ page }) => {
  await page.goto('/#/diagnostic')

  await expect(page.getByText('Where do you actually stand?')).toBeVisible()
  await page.getByRole('button', { name: /Start the test/ }).click()

  for (let question = 0; question < 12; question += 1) {
    await expect(page.getByText(`Question ${question + 1} of 12`)).toBeVisible()
    const options = page.getByTestId('placement-option')
    await expect(options).toHaveCount(4)
    await options.first().click()
    // the explanation appears only after answering
    await expect(page.getByTestId('placement-next')).toBeEnabled()
    await page.getByTestId('placement-next').click()
  }

  await expect(page.getByText('Your level')).toBeVisible()
  await expect(page.getByText(/correct answers/)).toBeVisible()

  const stats = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    return raw ? JSON.parse(raw).state.skillStats : {}
  })
  const keys = Object.keys(stats)
  expect(keys.length).toBeGreaterThanOrEqual(3)
  expect(keys.every((key) => key.startsWith('Mathematics|'))).toBe(true)
})

test('the result screen leads to the skills map with the tested skills', async ({ page }) => {
  await page.goto('/#/diagnostic')
  await page.getByRole('button', { name: /Start the test/ }).click()

  for (let question = 0; question < 12; question += 1) {
    await expect(page.getByText(`Question ${question + 1} of 12`)).toBeVisible()
    await page.getByTestId('placement-option').first().click()
    await page.getByTestId('placement-next').click()
  }

  await page.goto('/#/skills')
  await expect(page.getByRole('button', { name: /Export CSV/ })).toBeVisible()
  const body = await page.locator('body').innerText()
  const tested = ['Addition', 'Subtraction', 'Counting', 'Times tables', 'Division', 'Fractions', 'Ratio', 'Area', 'Perimeter', 'Integers', 'Equations', 'Powers', 'Geometry', 'Statistics']
  expect(tested.some((skill) => body.includes(skill))).toBe(true)
})
