import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = {
      id: 'u1',
      title: 'Maths',
      subject: 'Mathematics',
      language: 'ar',
      emoji: '📘',
      accent: '#21e6c9',
      term: 'Term 1',
      description: '',
      file: '',
      pageCount: 40,
      grade: 7,
      custom: true,
      units: [
        { id: 'unit-1', title: 'Unit one', startPage: 1, endPage: 10 },
        { id: 'unit-2', title: 'Unit two', startPage: 11, endPage: 20 },
      ],
    }
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

test('a parent can rename a unit and the course follows it', async ({ page }) => {
  await page.goto('/#/course/u1')

  await page.getByTestId('units-edit').click()
  const editor = page.getByTestId('units-editor')
  await expect(editor).toBeVisible()

  const firstTitle = editor.getByLabel('Unit title').first()
  await firstTitle.fill('Fractions')
  await page.getByTestId('units-save').click()

  await expect(editor).toHaveCount(0)
  await expect(page.getByText('Fractions')).toBeVisible()

  const saved = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    const state = raw ? JSON.parse(raw).state : {}
    return state.customBooks[0].units
  })
  expect(saved[0].title).toBe('Fractions')
  expect(saved).toHaveLength(2)
})
