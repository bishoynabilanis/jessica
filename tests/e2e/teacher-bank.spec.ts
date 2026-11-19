import { test, expect } from '@playwright/test'

test('teachers can build a shareable assignment from the offline question bank without book units', async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = { id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }
    window.localStorage.setItem(
      'jessica-profile-v1',
      JSON.stringify({
        state: {
          onboarded: true,
          acceptedTerms: 1,
          name: 'Teacher',
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
            aiMode: 'cloud',
          },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  })

  await page.goto('/#/teacher')
  await expect(page.getByTestId('teacher-source-bank')).toBeVisible()
  await expect(page.getByTestId('teacher-generate')).toBeEnabled()

  await page.getByTestId('teacher-bank-subject').selectOption('French')
  await page.getByTestId('teacher-generate').click()

  await expect(page.getByAltText('Assignment QR')).toBeVisible()
  await expect(page.getByText(/Question bank · 8 questions · French/)).toBeVisible()
})
