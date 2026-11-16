import { test, expect } from '@playwright/test'

const weekStart = () => {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((week) => {
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
          practiceWeeks: { [week]: 2 },
          practiceClaimed: {},
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
            sound: false,
          },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, weekStart())
})

test('the weekly challenge counts papers and pays out once', async ({ page }) => {
  await page.goto('/#/kids')
  await expect(page.getByText('Weekly challenge')).toBeVisible()
  await expect(page.getByText('2 of 3 practice papers this week')).toBeVisible()

  // finish one paper: the third one unlocks the reward
  await page.getByTestId('kids-practice-entry').click()
  await page.getByTestId('kids-practice-Mathematics').click()
  for (let question = 1; question <= 10; question += 1) {
    await page.getByTestId('kids-practice-option').first().click()
    await page.getByTestId('kids-practice-next').click()
  }
  await expect(page.getByTestId('kids-practice-again')).toBeVisible()

  await page.goto('/#/kids')
  const claim = page.getByTestId('kids-weekly-claim')
  await expect(claim).toBeVisible()
  await claim.click()

  await expect(page.getByTestId('confetti')).toBeVisible()
  await expect(page.getByTestId('kids-weekly-claim')).toHaveCount(0)
  const saved = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    const state = raw ? JSON.parse(raw).state : {}
    return { claimed: Object.values(state.practiceClaimed || {}).some(Boolean), xp: state.xp }
  })
  expect(saved.claimed).toBe(true)
  expect(saved.xp).toBeGreaterThan(130)
})
