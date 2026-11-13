import { test, expect } from '@playwright/test'

const grades = [
  'primary-1',
  'primary-2',
  'primary-3',
  'primary-4',
  'primary-5',
  'primary-6',
  'prep-1',
  'prep-2',
  'prep-3',
]

test('every grade quiz page loads without errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  for (const grade of grades) {
    const response = await page.goto(`/welcome/quiz/${grade}/`)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toContainText('اختبار رياضيات')
    await expect(page.locator('#quiz-start-btn')).toBeVisible()
  }
  expect(errors).toEqual([])
})

test('quiz runs ten questions and produces a shareable score', async ({ page }) => {
  await page.goto('/welcome/quiz/prep-3/')
  await page.click('#quiz-start-btn')

  for (let i = 0; i < 10; i++) {
    await expect(page.locator('#quiz-prompt')).not.toBeEmpty()
    await expect(page.locator('.quiz-choice')).toHaveCount(4)
    await page.locator('.quiz-choice[data-correct="1"]').click()
    await expect(page.locator('#quiz-feedback')).toContainText('صح')
    await page.click('#quiz-next')
  }

  await expect(page.locator('#quiz-score')).toHaveText('١٠/١٠')
  await expect(page.locator('#quiz-tier')).toContainText('أسطورة')
  await expect(page.locator('#quiz-review')).toBeHidden()

  const href = await page.getAttribute('#quiz-share', 'href')
  expect(href).toContain('https://wa.me/?text=')
  expect(decodeURIComponent(href || '')).toContain('١٠/١٠')
})

test('a wrong answer is explained and listed in the review', async ({ page }) => {
  await page.goto('/welcome/quiz/primary-3/')
  await page.click('#quiz-start-btn')

  const wrong = page.locator('.quiz-choice[data-correct="0"]').first()
  await wrong.click()
  await expect(page.locator('#quiz-feedback')).toContainText('الإجابة الصح')

  for (let i = 0; i < 9; i++) {
    await page.click('#quiz-next')
    await page.locator('.quiz-choice[data-correct="1"]').click()
    await expect(page.locator('#quiz-feedback')).toBeVisible()
  }
  await page.click('#quiz-next')

  await expect(page.locator('#quiz-score')).toHaveText('٩/١٠')
  await expect(page.locator('#quiz-review')).toBeVisible()
  await expect(page.locator('.quiz-review-item')).toHaveCount(1)
})
