import { test, expect } from '@playwright/test'

const book = {
  id: 'course-book',
  title: 'Physics Book',
  subject: 'Science',
  grade: 7,
  term: 'Term 1',
  pageCount: 40,
  custom: true,
  units: [
    { id: 'u1', title: 'الضغط', startPage: 1, endPage: 8 },
    { id: 'u2', title: 'الضوء', startPage: 9, endPage: 16 },
  ],
}

function profile(overrides: Record<string, unknown> = {}) {
  return {
    state: {
      onboarded: true,
      acceptedTerms: 1,
      name: 'Tester',
      apiKey: '',
      model: 'gemini-1.5-flash',
      xp: 120,
      streak: 3,
      coins: 0,
      customBooks: [book],
      completedTopics: [],
      unitMastery: {},
      lessonProgress: {},
      skillStats: {},
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
      ...overrides,
    },
    version: 3,
  }
}

async function seed(page: import('@playwright/test').Page, data: Record<string, unknown>) {
  await page.addInitScript((payload) => {
    if (!window.localStorage.getItem('jessica-profile-v1')) {
      window.localStorage.setItem('jessica-profile-v1', JSON.stringify(payload))
    }
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, data)
}

test('the course list shows progress and continues the next lesson', async ({ page }) => {
  await seed(page, profile({ completedTopics: ['course-book:u1'] }))
  await page.goto('/#/courses')

  const card = page.getByTestId('course-card')
  await expect(card).toHaveCount(1)
  await expect(card).toContainText('Physics Book')
  await expect(card).toContainText('1 of 2 lessons')
  await expect(card).toContainText('50%')
  await expect(card).toContainText('Next: الضوء')

  await card.getByRole('button', { name: /Continue/ }).click()
  await expect(page).toHaveURL(/#\/lesson\/course-book\/u2/)
})

test('a course page lists every lesson with its state', async ({ page }) => {
  await seed(
    page,
    profile({
      completedTopics: ['course-book:u1'],
      unitMastery: { 'course-book:u1': { best: 4, total: 4, attempts: 1 } },
    }),
  )
  await page.goto('/#/course/course-book')

  await expect(page.getByText('1 of 2 lessons')).toBeVisible()
  const lessons = page.getByTestId('course-lesson')
  await expect(lessons).toHaveCount(2)
  await expect(lessons.first()).toContainText('الضغط')
  await expect(lessons.first()).toContainText('Completed')
  await expect(lessons.nth(1)).toContainText('الضوء')
  await expect(lessons.nth(1)).toContainText('Not started')
  await expect(lessons.nth(1)).toContainText('Start')
})

test('a finished course points at the certificate', async ({ page }) => {
  await seed(
    page,
    profile({ completedTopics: ['course-book:u1', 'course-book:u2'] }),
  )
  await page.goto('/#/course/course-book')

  await expect(page.getByText('Course complete — your certificate is ready.')).toBeVisible()
  await expect(page.getByRole('button', { name: /Open my certificate/ })).toBeVisible()
})
