import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const key = (offset: number) => {
      const d = new Date()
      d.setDate(d.getDate() + offset)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    const dailyLog: Record<string, { xp: number; seconds: number }> = {}
    for (let offset = -27; offset <= 0; offset += 1) dailyLog[key(offset)] = { xp: 20, seconds: 600 }
    const topicLog = [
      { id: 't1', title: 'Algebra', subject: 'Mathematics', date: key(-3) },
      { id: 't2', title: 'Forces', subject: 'Science', date: key(-4) },
    ]
    const skillStats = {
      'Mathematics|Algebra': { correct: 3, total: 10, lastAt: Date.now() },
      'Science|Forces': { correct: 9, total: 10, lastAt: Date.now() },
    }
    const mistakes = [
      { id: 'm1', question: 'q', options: ['a', 'b'], answer: 1, chosen: 0, explanation: '', subject: 'Mathematics', topic: 'Algebra', createdAt: Date.now() - 10 * 86_400_000 },
      { id: 'm2', question: 'q2', options: ['a', 'b'], answer: 1, chosen: 0, explanation: '', subject: 'Science', topic: 'Forces', createdAt: Date.now() - 20 * 86_400_000, reviewStep: 4, reviewAt: Number.MAX_SAFE_INTEGER },
    ]
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
          xp: 400,
          streak: 6,
          coins: 5,
          customBooks: [book],
          completedTopics: [],
          skillStats,
          mistakes,
          dailyLog,
          topicLog,
          unitMastery: { 'b1:u1': { best: 9, total: 10, attempts: 1, lastAt: Date.now() } },
          exams: [{ id: 'e1', subject: 'Mathematics', score: 8, total: 10, date: Date.now() - 5 * 86_400_000, weakTopics: [], durationSeconds: 600 }],
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
    // A second child, for the sibling table.
    window.localStorage.setItem(
      'jessica-profiles-v1',
      JSON.stringify({
        active: 'p1',
        slots: [
          { id: 'p1', name: 'Mina', grade: 7, at: Date.now() },
          { id: 'p2', name: 'Mariam', grade: 4, at: Date.now() },
        ],
      }),
    )
    window.localStorage.setItem(
      'jessica-slot-p2',
      JSON.stringify({ state: { dailyLog: { [key(-1)]: { xp: 10, seconds: 300 } } }, version: 3 }),
    )
    ;(window as unknown as { __printed: number }).__printed = 0
    window.print = () => {
      ;(window as unknown as { __printed: number }).__printed += 1
    }
  })
})

test('the month report gathers four weeks, the weakest skill and the siblings', async ({ page }) => {
  await page.goto('/#/report-month')

  await expect(page.getByTestId('monthly-print')).toBeVisible()
  await expect(page.getByTestId('monthly-minutes')).toContainText('٢٨٠')
  await expect(page.getByText('Algebra', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Mariam').first()).toBeVisible()
  await expect(page.getByTestId('monthly-sheet')).toHaveCount(1)
})

test('print asks the browser for the PDF sheet', async ({ page }) => {
  await page.goto('/#/report-month')
  await page.getByTestId('monthly-print').click()
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __printed: number }).__printed))
    .toBe(1)
})
