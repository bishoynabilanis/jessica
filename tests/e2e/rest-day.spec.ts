import { test, expect, type Page } from '@playwright/test'
import { nextStreak } from '../../src/lib/streak'

// 2026-11-21 Sat, 22 Sun, 23 Mon, 24 Tue, 25 Wed, 26 Thu, 27 Fri, 28 Sat, 29 Sun, 30 Mon

test('a missed Friday keeps the streak and does not use the weekly rest day', () => {
  const step = nextStreak(5, '2026-11-26', '2026-11-28', '')
  expect(step).toMatchObject({ streak: 6, rest: 'friday', restWeek: '' })
})

test('one other missed day per week is forgiven, a second one in the same week is not', () => {
  expect(nextStreak(5, '2026-11-23', '2026-11-25', '')).toMatchObject({ streak: 6, rest: 'weekly', restWeek: '2026-11-23' })
  expect(nextStreak(5, '2026-11-23', '2026-11-26', '')).toMatchObject({ streak: 1, rest: 'none' })
  // the weekly rest was already used this week
  expect(nextStreak(5, '2026-11-24', '2026-11-26', '2026-11-23')).toMatchObject({ streak: 1 })
  // a new week gets a new rest day
  expect(nextStreak(5, '2026-11-30', '2026-12-02', '2026-11-23')).toMatchObject({ streak: 6, rest: 'weekly', restWeek: '2026-11-30' })
})

test('Friday plus one weekday in the same gap is covered; a long gap starts again quietly', () => {
  // Wed login, miss Thu, Fri, back Sat: Thu uses the weekly rest, Fri is free
  expect(nextStreak(7, '2026-11-25', '2026-11-28', '')).toMatchObject({ streak: 8, rest: 'weekly' })
  expect(nextStreak(7, '2026-11-01', '2026-11-25', '')).toMatchObject({ streak: 1, rest: 'none' })
})

test('normal days are unchanged: next day adds one, same day keeps, first ever day is 1', () => {
  expect(nextStreak(5, '2026-11-24', '2026-11-25', '')).toMatchObject({ streak: 6, rest: 'none' })
  expect(nextStreak(5, '2026-11-25', '2026-11-25', '')).toMatchObject({ streak: 5 })
  expect(nextStreak(0, '', '2026-11-25', '')).toMatchObject({ streak: 1 })
})

async function open(page: Page, today: string, lastLogin: string, streak: number, restWeek = '', gradeLevel = 3) {
  await page.clock.setFixedTime(new Date(`${today}T09:00:00+04:00`))
  await page.addInitScript(
    ({ lastLogin, streak, restWeek, gradeLevel }) => {
      if (window.localStorage.getItem('jessica-profile-v1')) return
      window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: { onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: '', model: 'gemini-1.5-flash', xp: 100, streak, restWeek, longestStreak: streak, lastLogin, dailyDate: lastLogin,
            customBooks: [{ id: 'b1', title: 'Science', subject: 'Science', grade: gradeLevel, term: 'Term 1', pageCount: 40, custom: true, units: [] }], completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {},
            settings: { language: 'en', gradeLevel, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false, sound: false, aiMode: 'cloud' } },
          version: 3,
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
    },
    { lastLogin, streak, restWeek, gradeLevel },
  )
  await page.goto('/#/')
}
const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('jessica-profile-v1') || '{}').state)

test.use({ timezoneId: 'Asia/Dubai' })

test('in the app: coming back on Saturday after missing Friday keeps the streak and says so kindly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page, '2026-11-28', '2026-11-26', 5)
  await expect(page.getByTestId('rest-note')).toContainText('Friday is a free rest day')
  await page.waitForTimeout(500)
  const state = await saved(page)
  expect(state.streak).toBe(6)
  await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/rest-friday.png` : undefined })
})

test('in the app: two missed weekdays in one week start again with no scolding', async ({ page }) => {
  await open(page, '2026-11-26', '2026-11-23', 9)
  await page.waitForTimeout(1500)
  const state = await saved(page)
  expect(state.streak).toBe(1)
  await expect(page.getByText(/rest day/i)).toHaveCount(0)
})

test('in the app (older students, toast): a rest day also says so kindly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page, '2026-11-25', '2026-11-23', 5, '', 7)
  await expect(page.getByText('Your streak is safe', { exact: true })).toBeVisible()
  await expect(page.getByText(/One rest day a week is automatic/)).toBeVisible()
  expect((await saved(page)).streak).toBe(6)
})
