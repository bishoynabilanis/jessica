import { test, expect } from '@playwright/test'

const topics = ['study-plan', 'homework', 'parents', 'math', 'exam-anxiety']

test('topic hub lists every topic page', async ({ page }) => {
  const response = await page.goto('/welcome/topics/')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toContainText('مواضيع')
  await expect(page.locator('.topic-card')).toHaveCount(topics.length)
  for (const slug of topics) {
    await expect(page.locator(`a[href="./${slug}/"]`)).toHaveCount(1)
  }
})

test('every topic page loads with valid structured data', async ({ page }) => {
  const errors: string[] = []
  const broken: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('response', (response) => {
    if (response.status() >= 400) broken.push(`${response.status()} ${response.url()}`)
  })

  for (const slug of topics) {
    const response = await page.goto(`/welcome/topics/${slug}/`)
    expect(response?.status()).toBe(200)

    const heading = (await page.locator('h1').innerText()).trim()
    expect(heading.length).toBeGreaterThan(15)
    expect(heading).not.toContain('undefined')

    await expect(page.locator('.article h2')).not.toHaveCount(0)
    await expect(page.locator('.faq details').first()).toBeVisible()

    const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
    const types = ld.map((block) => JSON.parse(block)['@type'])
    expect(types).toEqual(['Article', 'FAQPage', 'BreadcrumbList'])
  }

  expect(broken).toEqual([])
  expect(errors).toEqual([])
})

test('topic pages are linked from the landing page and topic hub', async ({ page }) => {
  await page.goto('/welcome/')
  const navLink = page.locator('header a[href="./topics/"]')
  await expect(navLink).toBeVisible()
  await navLink.click()
  await expect(page).toHaveURL(/\/welcome\/topics\/$/)

  await page.locator('a[href="./parents/"]').click()
  await expect(page).toHaveURL(/\/welcome\/topics\/parents\/$/)
  await expect(page.locator('.rel-grid a[href="../study-plan/"]')).toBeVisible()
})
