import { test, expect } from '@playwright/test'

import type { Page } from '@playwright/test'

async function playAll(page: Page, mode: 'correct' | 'wrong') {
  for (let i = 0; i < 10; i++) {
    await expect(page.locator('.quiz-choice')).toHaveCount(4)
    const selector = mode === 'correct' ? '.quiz-choice[data-correct="1"]' : '.quiz-choice[data-correct="0"]'
    await page.locator(selector).first().click()
    await expect(page.locator('#quiz-feedback')).toBeVisible()
    await page.click('#quiz-next')
  }
  await expect(page.locator('#quiz-result')).toBeVisible()
}

test('challenge link shows the rival score and beats it', async ({ page }) => {
  await page.goto('/welcome/quiz/prep-3/?beat=7&from=%D8%A3%D8%AD%D9%85%D8%AF')

  await expect(page.locator('.quiz-challenge')).toBeVisible()
  await expect(page.locator('.quiz-challenge')).toContainText('٧/١٠')
  await expect(page.locator('.quiz-challenge')).toContainText('أحمد')

  await page.click('#quiz-start-btn')
  await playAll(page, 'correct')

  await expect(page.locator('#quiz-score')).toHaveText('١٠/١٠')
  await expect(page.locator('.quiz-challenge-verdict')).toContainText('كسرت التحدي')

  const href = decodeURIComponent((await page.locator('#quiz-share').getAttribute('href')) || '')
  expect(href).toContain('beat=10')
  expect(href).toContain('wa.me')
})

test('challenge verdict explains a tie when the rival scored full marks', async ({ page }) => {
  await page.goto('/welcome/quiz/prep-3/?beat=10')

  await expect(page.locator('.quiz-challenge')).toContainText('صاحبك')
  await page.click('#quiz-start-btn')
  await playAll(page, 'correct')

  await expect(page.locator('.quiz-challenge-verdict')).toContainText('تعادل')
})

test('a losing run tells the player how many correct answers are missing', async ({ page }) => {
  await page.goto('/welcome/quiz/primary-3/?beat=8')

  await page.click('#quiz-start-btn')
  await playAll(page, 'wrong')

  await expect(page.locator('.quiz-challenge-verdict')).toContainText('لسه محتاج')
})
