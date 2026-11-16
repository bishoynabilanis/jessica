import { test, expect } from '@playwright/test'

test('the stars screen shows the last seven days for a child', async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const pad = (n: number) => String(n).padStart(2, '0')
    const key = (offset: number) => {
      const d = new Date()
      d.setDate(d.getDate() + offset)
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    }
    const book = { id: 'k1', title: 'Maths 3', subject: 'Mathematics', grade: 3, term: 'Term 1', pageCount: 60, custom: true, units: [] }
    window.localStorage.setItem(
      'jessica-profile-v1',
      JSON.stringify({
        state: {
          onboarded: true,
          acceptedTerms: 1,
          name: 'Maria',
          apiKey: '',
          model: 'gemini-1.5-flash',
          xp: 210,
          streak: 2,
          coins: 9,
          customBooks: [book],
          completedTopics: [],
          skillStats: {},
          mistakes: [],
          dailyLog: {
            [key(-1)]: { xp: 25, seconds: 0 },
            [key(-3)]: { xp: 15, seconds: 0 },
            [key(0)]: { xp: 40, seconds: 0 },
          },
          settings: {
            language: 'en',
            gradeLevel: 3,
            curriculum: 'egypt',
            schoolType: 'government',
            primaryUi: 'auto',
            aiProvider: 'gemini',
            theme: 'dark',
            keyOptional: true,
            quickStart: true,
            sound: false,
          },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  })

  await page.goto('/#/kids')
  await page.getByTestId('kids-stars-entry').click()

  await expect(page.getByRole('heading', { name: 'My stars' })).toBeVisible()
  await expect(page.getByText(/You collected \d+ stars in the last seven days\./)).toBeVisible()
  await expect(page.getByText(/Your best day was \d+ stars\. Beat it!/)).toBeVisible()
  await expect(page.getByText('Days I played')).toBeVisible()

  await page.getByTestId('kids-stars-practice').click()
  await expect(page.getByRole('heading', { name: 'Practise and win stars' })).toBeVisible()
})
