import { test, expect } from '@playwright/test'

const book = {
  id: 'week-book',
  title: 'Science Book',
  subject: 'Science',
  grade: 7,
  term: 'Term 1',
  pageCount: 30,
  custom: true,
  units: [
    { id: 'u1', title: 'الضغط', startPage: 1, endPage: 10 },
    { id: 'u2', title: 'الضوء', startPage: 11, endPage: 20 },
  ],
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((payload) => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const key = (offset: number) => {
      const date = new Date()
      date.setDate(date.getDate() + offset)
      return date.toISOString().slice(0, 10)
    }
    const dailyLog: Record<string, { xp: number; seconds: number }> = {
      [key(-1)]: { xp: 40, seconds: 1800 },
      [key(-3)]: { xp: 25, seconds: 900 },
      [key(-9)]: { xp: 10, seconds: 600 },
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
          xp: 200,
          streak: 2,
          coins: 0,
          customBooks: [payload],
          completedTopics: ['week-book:u1'],
          unitMastery: { 'week-book:u1': { best: 4, total: 4, attempts: 1 } },
          lessonProgress: {},
          skillStats: { 'Science|الضغط': { correct: 2, total: 6, lastAt: Date.now() } },
          dailyLog,
          topicLog: [{ id: 'week-book:u1', title: 'الضغط', subject: 'Science', date: key(-2) }],
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
  }, book)
})

test('the daily plan ends with a weekly review and next-week moves', async ({ page }) => {
  await page.goto('/#/plan')

  const review = page.getByTestId('weekly-review')
  await expect(review).toBeVisible()
  await expect(review).toContainText('Your last 7 days')
  // 1800 + 900 seconds this week = 45 minutes
  await expect(review).toContainText('45')
  await expect(review).toContainText('minutes studied')
  await expect(review).toContainText('active days')
  await expect(review).toContainText('Next week at a glance')
  await expect(review).toContainText('Next lesson in Science Book')
})
