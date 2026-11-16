import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = { id: 'b1', title: 'School', subject: 'Social Studies', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }
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
            aiMode: 'cloud',
          },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  })
})

test('a pasted school paper becomes a marked exam', async ({ page }) => {
  await page.goto('/#/school-exam')

  await page.getByTestId('school-new').click()
  await page.getByTestId('school-text').fill(
    [
      'What is the capital of Egypt? | Cairo | Alexandria | Aswan | Tanta | 1',
      'Which sea does the Nile reach? | Red | Mediterranean | Black | Arabian | 2',
      'Suez Canal links? | Med and Red | Red and Arabian | Med and Black | Black and Caspian | 1',
    ].join('\n'),
  )

  await expect(page.getByText('3 questions ready')).toBeVisible()
  await page.getByTestId('school-save').click()

  await expect(page.getByTestId('school-take')).toBeVisible()
  await expect(page.getByText('Question 1 of 3')).toBeVisible()

  // answer the first one correctly, then hand in via the last question
  await page.getByTestId('school-option').nth(0).click()
  await page.getByTestId('school-next').click()
  await page.getByTestId('school-option').nth(1).click()
  await page.getByTestId('school-next').click()
  await page.getByTestId('school-option').nth(0).click()
  await page.getByTestId('school-submit').click()

  await expect(page.getByTestId('school-result')).toBeVisible()
  await page.getByTestId('school-back').click()
  await expect(page.getByTestId('school-row')).toHaveCount(1)

  const saved = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    return raw ? JSON.parse(raw).state.skillStats : {}
  })
  expect(Object.keys(saved).length).toBeGreaterThan(0)
})
