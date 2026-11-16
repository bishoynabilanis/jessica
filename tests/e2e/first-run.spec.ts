import { test, expect } from '@playwright/test'

test('a brand-new profile is offered three small steps, and they work', async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = { id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }
    window.localStorage.setItem(
      'jessica-profile-v1',
      JSON.stringify({
        state: {
          onboarded: true,
          acceptedTerms: 1,
          name: 'Adam',
          apiKey: '',
          model: 'gemini-1.5-flash',
          xp: 0,
          streak: 0,
          coins: 0,
          studySeconds: 0,
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

  await page.goto('/#/')

  const card = page.getByTestId('first-run')
  await expect(card).toBeVisible()
  await expect(card).toContainText('Adam')

  await page.getByTestId('first-run-bank').click()
  await expect(page.getByRole('heading', { name: 'A bank that never runs out' })).toBeVisible()
})

test('a profile with history does not see the first-run card', async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = { id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }
    window.localStorage.setItem(
      'jessica-profile-v1',
      JSON.stringify({
        state: {
          onboarded: true,
          acceptedTerms: 1,
          name: 'Mina',
          apiKey: '',
          model: 'gemini-1.5-flash',
          xp: 480,
          streak: 4,
          coins: 9,
          studySeconds: 5400,
          customBooks: [book],
          completedTopics: [],
          skillStats: { 'Mathematics|Equations': { correct: 4, total: 6, lastAt: Date.now() } },
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

  await page.goto('/#/')
  await expect(page.getByTestId('first-run')).toHaveCount(0)
})
