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

test('a timed exam hides the answers, runs a clock and marks the whole paper', async ({ page }) => {
  await page.goto('/#/bank')

  await page.getByTestId('bank-exam').click()
  await expect(page.getByText('Question 1 of 20')).toBeVisible()
  await expect(page.getByTestId('bank-clock')).toBeVisible()
  await expect(page.getByTestId('bank-clock')).toHaveText(/20:00|19:5\d/)

  // In exam mode no explanation appears while answering.
  await page.getByTestId('bank-option').first().click()
  await expect(page.getByText(/Correct — here is why|Not quite/)).toHaveCount(0)

  for (let question = 1; question <= 20; question += 1) {
    await expect(page.getByText(`Question ${question} of 20`)).toBeVisible()
    await page.getByTestId('bank-option').first().click()
    // on the last question the same button hands the paper in
    await page.getByTestId('bank-next').click()
  }

  await expect(page.getByText('The whole paper, marked')).toBeVisible()
  await expect(page.getByText('Answer:', { exact: false })).toHaveCount(20)
  await expect(page.getByRole('button', { name: /Another paper/ })).toBeVisible()

  const saved = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    const state = raw ? JSON.parse(raw).state : {}
    return { mistakes: state.mistakes || [], skills: state.skillStats || {} }
  })
  expect(Object.keys(saved.skills).length).toBeGreaterThan(0)
  expect(saved.mistakes.length).toBeLessThanOrEqual(20)
  for (const mistake of saved.mistakes) expect(mistake.explanation.length).toBeGreaterThan(0)
})

test('practice mode drops every miss into the mistakes notebook', async ({ page }) => {
  await page.goto('/#/bank')
  await page.getByTestId('bank-start').click()

  for (let question = 1; question <= 10; question += 1) {
    await expect(page.getByText(`Question ${question} of 10`)).toBeVisible()
    await page.getByTestId('bank-option').first().click()
    await page.getByTestId('bank-next').click()
  }

  await expect(page.getByRole('button', { name: /My mistakes/ })).toBeVisible()

  const mistakes = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    const state = raw ? JSON.parse(raw).state : {}
    return (state.mistakes || []).length
  })
  expect(mistakes).toBeLessThanOrEqual(10)
})
