import { test, expect, type Page } from '@playwright/test'

async function seed(page: Page, language = 'en') {
  await page.addInitScript(
    ({ language }) => {
      if (window.localStorage.getItem('jessica-profile-v1')) return
      const book = {
        id: 'u1', title: 'Maths', subject: 'Mathematics', language: 'en', emoji: '📘', accent: '#21e6c9',
        term: 'Term 1', description: '', file: '', pageCount: 40, grade: 7, custom: true,
        units: [
          { id: 'unit-1', title: 'Unit one', startPage: 1, endPage: 10 },
          { id: 'unit-2', title: 'Unit two', startPage: 11, endPage: 20 },
        ],
      }
      window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: {
            onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: '', model: 'gemini-1.5-flash',
            xp: 100, streak: 1, coins: 0, customBooks: [book], completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {},
            unitMastery: {
              'u1:unit-1': { best: 7, total: 10, attempts: 2, lastAt: 1, weak: { Fractions: 3, Decimals: 1 } },
            },
            settings: { language, gradeLevel: 7, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false },
          },
          version: 3,
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
    },
    { language },
  )
}

test('a lesson shows mastery points and the idea to review', async ({ page }) => {
  await seed(page)
  await page.goto('/#/course/u1')
  const first = page.getByTestId('course-lesson').first()
  await expect(first.getByTestId('lesson-mastery')).toContainText('Mastery 70 points')
  await expect(first.getByTestId('lesson-mastery')).toContainText('Almost there')
  await expect(first.getByTestId('lesson-weakest')).toContainText('Fractions')
  // A lesson never tried shows no points.
  await expect(page.getByTestId('course-lesson').nth(1).getByTestId('lesson-mastery')).toHaveCount(0)
  await page.screenshot({ path: 'test-results/mastery-desktop.png', fullPage: true })
})

test('Arabic 390px: points fit without sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page, 'ar')
  await page.goto('/#/course/u1')
  await expect(page.getByTestId('lesson-mastery').first()).toContainText('٧٠')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
  await page.screenshot({ path: 'test-results/mastery-ar-390.png', fullPage: true })
})
