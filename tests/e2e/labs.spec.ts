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
            language: 'ar',
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

test('the lab hub covers maths, science, biology, geography and English', async ({ page }) => {
  await page.goto('/#/labs')
  for (const name of ['معمل الكسور', 'معمل الهندسة', 'معمل القطع المكافئ', 'معمل الكثافة', 'معمل القوى', 'معمل الذرة', 'معمل الهضم', 'خريطة مصر', 'معمل الإنجليزي']) {
    await expect(page.getByRole('button', { name: new RegExp(name) })).toBeVisible()
  }
})

test('fractions, density and atom respond to their controls', async ({ page }) => {
  await page.goto('/#/labs')

  await page.getByRole('button', { name: /معمل الكسور/ }).click()
  await page.getByTestId('fraction-d1').fill('4')
  await page.getByTestId('fraction-n1').fill('2')
  await expect(page.getByTestId('fraction-label-one')).toContainText('2/4')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل الكثافة/ }).click()
  await expect(page.getByTestId('density-result')).toContainText('بيطفو')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل الذرة/ }).click()
  await expect(page.getByTestId('atom-element')).toHaveText('C')
  await page.getByTestId('atom-electrons').fill('5')
  await expect(page.getByTestId('atom-charge')).toContainText('+1')
})

test('the map, parabola and English quiz work', async ({ page }) => {
  await page.goto('/#/labs')

  await page.getByRole('button', { name: /خريطة مصر/ }).click()
  await page.getByTestId('map-btn-sinai').click()
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل القطع المكافئ/ }).click()
  await expect(page.getByTestId('parabola-equation')).toContainText('x²')
  await page.getByTestId('parabola-a').fill('-1')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل الإنجليزي/ }).click()
  await expect(page.getByTestId('english-word')).toHaveText('Hello')
  await page.getByTestId('english-option').filter({ hasText: 'مرحبًا' }).click()
  await expect(page.getByTestId('english-feedback')).toBeVisible()
  await expect(page.getByTestId('english-score')).toContainText('1/6')
})
