import { test, expect } from '@playwright/test'

function seed(units: Array<{ id: string; title: string; startPage: number; endPage: number }>) {
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

test('the child finds the one wrong line, a right line only gives a hint, the fix is shown', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(seed([{ id: 'u1', title: 'جدول الضرب', startPage: 12, endPage: 18 }, { id: 'u2', title: 'درس بدون أرقام', startPage: 19, endPage: 22 }]))
  await page.goto('/#/kids/play')
  await page.getByTestId('open-mistake').click()
  await expect(page.getByTestId('mistake-unit')).toHaveCount(1)
  await page.getByTestId('mistake-unit').click()
  await expect(page.getByTestId('mistake-line')).toHaveCount(4)
  await expect(page.locator('[data-testid="mistake-line"][data-bad="1"]')).toHaveCount(1)

  await page.locator('[data-testid="mistake-line"][data-bad="0"]').first().click()
  await expect(page.getByTestId('mistake-hint')).toBeVisible()
  await expect(page.getByTestId('mistake-done')).toHaveCount(0)

  await page.locator('[data-testid="mistake-line"][data-bad="1"]').click()
  await expect(page.getByTestId('mistake-done')).toBeVisible()
  await expect(page.getByTestId('mistake-fixed')).toBeVisible()
  await page.waitForTimeout(400)
  await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/mistake-kids-mobile.png` : undefined })
  await page.getByRole('button', { name: /لوحة تانية/ }).click()
  await expect(page.getByTestId('mistake-done')).toHaveCount(0)
})

test('with no maths unit the game says so and invents nothing', async ({ page }) => {
  await page.addInitScript(seed([{ id: 'u2', title: 'درس بدون أرقام', startPage: 19, endPage: 22 }]))
  await page.goto('/#/kids/mistake')
  await expect(page.getByTestId('mistake-empty')).toBeVisible()
})
