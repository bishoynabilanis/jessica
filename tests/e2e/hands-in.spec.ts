import { test, expect } from '@playwright/test'

const seed = `(() => {
  if (window.localStorage.getItem('jessica-profile-v1')) return
  window.localStorage.setItem('jessica-profile-v1', JSON.stringify({
    state: { onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: '', model: 'gemini-1.5-flash', xp: 100, streak: 1, coins: 0,
      customBooks: [{ id: 'b1', title: 'Science', subject: 'Science', grade: 3, term: 'Term 1', pageCount: 40, custom: true, units: [] }], completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {},
      settings: { language: 'ar', gradeLevel: 3, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false, sound: false, aiMode: 'cloud' } },
    version: 3 }))
  window.localStorage.setItem('jessica-disclaimer-v1', '1')
})()`

test('water journey: tap the stages in order, a wrong stage only gives a hint', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(seed)
  await page.goto('/#/kids/labs?lab=water')
  const box = page.getByTestId('handsin-water')
  await expect(box).toBeVisible()
  // tap the last stage first: wrong
  await box.locator('[data-label="Collection"]').click()
  await expect(box.getByTestId('handsin-hint')).toBeVisible()
  for (const label of ['Evaporation', 'Condensation', 'Rain', 'Collection']) {
    await box.locator(`[data-label="${label}"]`).click()
  }
  await expect(box.getByTestId('handsin-done')).toBeVisible()
  await box.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/handsin-water-mobile.png` : undefined })
  await box.getByRole('button', { name: /العب تاني/ }).click()
  await expect(box.getByTestId('handsin-done')).toHaveCount(0)
})

test('plant parts: read what the part does, tap the part', async ({ page }) => {
  await page.addInitScript(seed)
  await page.goto('/#/kids/labs?lab=plants')
  const box = page.getByTestId('handsin-plants')
  await expect(box).toBeVisible()
  const order = ['Leaves', 'Stem', 'Roots', 'Flower']
  await box.locator('[data-label="Flower"]').click()
  await expect(box.getByTestId('handsin-hint')).toBeVisible()
  for (const label of order) await box.locator(`[data-label="${label}"]`).click()
  await expect(box.getByTestId('handsin-done')).toBeVisible()
})
