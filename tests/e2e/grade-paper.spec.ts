import { test, expect } from '@playwright/test'

const questions = Array.from({ length: 5 }, (_, index) => ({
  id: `q${index + 1}`,
  subject: 'Mathematics',
  skill: 'Addition',
  prompt: `${index + 1} + ${index + 1} = ?`,
  options: ['1', '2', '3', '4'],
  answer: 1,
  explanation: `The answer is 2`,
}))

test.beforeEach(async ({ page }) => {
  await page.addInitScript((paper) => {
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
            sound: false,
          },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
    window.localStorage.setItem('jessica-printed-papers-v1', JSON.stringify([paper]))
  }, { id: 'paper_1', code: 'JP-TEST1', subject: 'Mathematics', at: Date.now(), questions })
})

test('a printed sheet can be marked from the child’s written answers', async ({ page }) => {
  await page.goto('/#/grade')

  await expect(page.getByRole('heading', { name: 'Tap the answers your child wrote' })).toBeVisible()
  await expect(page.getByTestId('grade-paper-row')).toHaveCount(1)
  await page.getByTestId('grade-paper-row').click()

  await expect(page.getByTestId('grade-mark')).toBeVisible()
  // the child wrote the first option on every question
  const choices = page.getByTestId('grade-choice')
  for (let question = 0; question < 5; question += 1) {
    await choices.nth(question * 4).click()
  }
  await page.getByTestId('grade-submit').click()

  await expect(page.getByTestId('grade-result')).toBeVisible()
  await expect(page.getByTestId('grade-result')).toContainText('/')

  const saved = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    const state = raw ? JSON.parse(raw).state : {}
    return { mistakes: state.mistakes?.length || 0, skills: Object.keys(state.skillStats || {}).length }
  })
  expect(saved.mistakes).toBe(5)
  expect(saved.skills).toBeGreaterThan(0)
})
