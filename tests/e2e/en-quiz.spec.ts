import { test, expect } from '@playwright/test'

test('the English 60-second test runs ten questions and reports a score', async ({ page }) => {
  await page.goto('/welcome/en/quiz/')

  await expect(page.getByRole('heading', { name: 'Test your child’s maths level in 60 seconds' })).toBeVisible()
  await page.selectOption('#quiz-grade', 'prep-1')
  await page.getByRole('button', { name: /Start the test/ }).click()

  for (let question = 1; question <= 10; question += 1) {
    await expect(page.locator('#quiz-counter')).toContainText(`Question ${question} of 10`)
    await page.locator('.choice').first().click()
    await expect(page.locator('#quiz-feedback')).toBeVisible()
    await page.locator('#quiz-next').click()
  }

  await expect(page.locator('#quiz-score')).toHaveText(/\d+ \/ 10/)
  await expect(page.locator('#quiz-review .review-row')).toHaveCount(10)
})
