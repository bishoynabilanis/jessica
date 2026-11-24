import { test, expect } from '@playwright/test'

function seedScript(units: Array<{ id: string; title: string; startPage: number; endPage: number }>) {
  return `(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = { id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 3, term: 'Term 1', pageCount: 40, custom: true, units: ${JSON.stringify(units)} }
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify({
      state: { onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: '', model: 'gemini-1.5-flash', xp: 100, streak: 1, coins: 0,
        customBooks: [book], completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {},
        settings: { language: 'ar', gradeLevel: 3, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false, sound: false, aiMode: 'cloud' } },
      version: 3 }))
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  })()`
}

test('the child fixes the bridge by placing the right plank in each gap, wrong planks only give a hint', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(seedScript([{ id: 'u1', title: 'الكسور المتكافئة', startPage: 12, endPage: 18 }, { id: 'u2', title: 'درس بدون أرقام', startPage: 19, endPage: 22 }]))
  await page.goto('/#/kids/play')
  await page.getByTestId('open-bridge').click()
  await expect(page.getByTestId('bridge-unit')).toHaveCount(1)
  await expect(page.getByTestId('bridge-unit')).toContainText('١٢')
  await page.getByTestId('bridge-unit').click()

  // a wrong plank gives a hint and does not fill the gap
  const gaps = page.getByTestId('bridge-gap')
  const firstAnswer = await gaps.nth(0).getAttribute('data-answer')
  const planks = page.getByTestId('bridge-plank')
  const count = await planks.count()
  for (let i = 0; i < count; i++) {
    const value = await planks.nth(i).getAttribute('data-value')
    if (value !== firstAnswer && !(await gaps.evaluateAll((els) => els.map((e) => e.getAttribute('data-answer')))).includes(value)) {
      await planks.nth(i).click()
      await gaps.nth(0).click()
      break
    }
  }
  await expect(page.getByTestId('bridge-hint')).toBeVisible()
  await expect(page.getByTestId('bridge-done')).toHaveCount(0)

  for (let g = 0; g < 4; g++) {
    const answer = await gaps.nth(g).getAttribute('data-answer')
    await page.locator(`[data-testid="bridge-plank"][data-value="${answer}"]:not([disabled])`).first().click()
    await gaps.nth(g).click()
  }
  await expect(page.getByTestId('bridge-done')).toBeVisible()
  await page.waitForTimeout(500)
  await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/bridge-kids-mobile.png` : undefined })
  await page.getByRole('button', { name: /كوبري تاني/ }).click()
  await expect(page.getByTestId('bridge-done')).toHaveCount(0)
})

test('with no maths unit the game says so and invents nothing', async ({ page }) => {
  await page.addInitScript(seedScript([{ id: 'u2', title: 'درس بدون أرقام', startPage: 19, endPage: 22 }]))
  await page.goto('/#/kids/bridge')
  await expect(page.getByTestId('bridge-empty')).toBeVisible()
  await expect(page.getByTestId('bridge-unit')).toHaveCount(0)
})
