import { test, expect } from '@playwright/test'

test('install guide page loads with steps, FAQ and valid structured data', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))

  const response = await page.goto('/welcome/install/')
  expect(response?.status()).toBe(200)
  expect(await page.title()).toContain('تثبيت Jessica')

  await expect(page.locator('h1')).toContainText('ثبّت Jessica')
  await expect(page.locator('.step-card')).toHaveCount(3)
  await expect(page.locator('#android')).toContainText('أندرويد')
  await expect(page.locator('#ios')).toContainText('آيفون')
  await expect(page.locator('.faq details')).toHaveCount(6)

  const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
  const types = ld.map((block) => JSON.parse(block)['@type'])
  expect(types).toEqual(['HowTo', 'FAQPage', 'BreadcrumbList'])

  expect(errors).toEqual([])
})

test('install guide is reachable from landing and grade pages', async ({ page }) => {
  await page.goto('/welcome/')
  await expect(page.locator('a[href="./install/"]').first()).toBeVisible()
  await page.locator('a[href="./install/"]').first().click()
  await expect(page).toHaveURL(/\/welcome\/install\/$/)

  await page.goto('/welcome/grades/prep-3/')
  const link = page.locator('a[href="../../install/"]').first()
  await expect(link).toBeVisible()
  await link.click()
  await expect(page).toHaveURL(/\/welcome\/install\/$/)
})
