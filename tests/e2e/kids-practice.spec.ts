import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
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
          xp: 120,
          streak: 3,
          coins: 5,
          customBooks: [book],
          completedTopics: [],
          skillStats: {},
          mistakes: [],
          dailyLog: {},
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
          },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  })
})

test('a primary child can practise from the kids world and earn stars', async ({ page }) => {
  await page.goto('/#/kids')
  await page.getByTestId('kids-practice-entry').click()

  await expect(page.getByRole('heading', { name: 'Practise and win stars' })).toBeVisible()
  await page.getByTestId('kids-practice-Mathematics').click()

  for (let question = 1; question <= 10; question += 1) {
    await expect(page.getByText(`Question ${question} of 10`)).toBeVisible()
    await page.getByTestId('kids-practice-option').first().click()
    await expect(page.getByTestId('kids-practice-next')).toBeEnabled()
    await page.getByTestId('kids-practice-next').click()
  }

  await expect(page.getByText(/You got \d+ of 10 right/)).toBeVisible()
  await expect(page.getByTestId('kids-practice-again')).toBeVisible()

  const stats = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    return raw ? JSON.parse(raw).state.skillStats : {}
  })
  expect(Object.keys(stats).length).toBeGreaterThan(0)
})

test('grades 4 to 6 unlock social studies, ICT and a mistakes review in kids mode', async ({ page }) => {
  await page.addInitScript(() => {
    const book = { id: 'k5', title: 'Maths 5', subject: 'Mathematics', grade: 5, term: 'Term 1', pageCount: 60, custom: true, units: [] }
    window.localStorage.setItem(
      'jessica-profile-v1',
      JSON.stringify({
        state: {
          onboarded: true,
          acceptedTerms: 1,
          name: 'Omar',
          apiKey: '',
          model: 'gemini-1.5-flash',
          xp: 150,
          streak: 2,
          coins: 4,
          customBooks: [book],
          completedTopics: [],
          skillStats: {},
          mistakes: [
            {
              id: 'm1',
              subject: 'Social Studies',
              topic: 'جغرافيا مصر',
              question: 'عاصمة مصر هي؟',
              options: ['القاهرة', 'الإسكندرية', 'أسوان', 'طنطا'],
              answer: 0,
              chosen: 1,
              explanation: 'القاهرة هي عاصمة مصر.',
              createdAt: Date.now(),
            },
          ],
          dailyLog: {},
          settings: {
            language: 'en',
            gradeLevel: 5,
            curriculum: 'egypt',
            schoolType: 'languages',
            primaryUi: 'kids',
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

  await page.goto('/#/kids/practice')
  await expect(page.getByTestId('kids-practice-Social Studies')).toBeVisible()
  await expect(page.getByTestId('kids-practice-ICT')).toBeVisible()
  await expect(page.getByTestId('kids-practice-French')).toBeVisible()
  await expect(page.getByTestId('kids-practice-mistakes')).toBeVisible()
})
