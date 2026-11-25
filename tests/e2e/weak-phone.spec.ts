import { test, expect, type Page } from '@playwright/test'

async function seed(page: Page, weak: boolean, language = 'en') {
  await page.addInitScript(
    ({ weak, language }) => {
      Object.defineProperty(navigator, 'gpu', { value: {}, configurable: true })
      Object.defineProperty(navigator, 'deviceMemory', { value: 8, configurable: true })
      if (window.localStorage.getItem('jessica-profile-v1')) return
      window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: {
            onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: '', model: 'gemini-1.5-flash', xp: 1, streak: 1, coins: 0,
            customBooks: [{ id: 'm1', title: 'Book m1', subject: 'Science', language: 'en', emoji: '', accent: '', term: 'Term 1', description: '', file: '', pageCount: 30, grade: 7, catalogId: 'cat-1', units: [] }], completedTopics: [], skillStats: {}, mistakes: [],
            settings: { language, gradeLevel: 7, curriculum: 'egypt', schoolType: 'government', primaryUi: 'study', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false, weakPhone: weak, aiMode: 'cloud' },
          },
          version: 3,
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
    },
    { weak, language },
  )
}

test('the toggle turns weak phone mode on and off and it is remembered', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page, false)
  await page.goto('./#/')
  const html = page.locator('html')
  await expect(html).not.toHaveClass(/weak-phone/)
  const open = page.getByRole('button', { name: 'Accessibility quick settings' }).first()
  await open.click({ timeout: 15000 })
  await page.getByRole('switch', { name: 'Weak phone mode' }).click()
  await expect(html).toHaveClass(/weak-phone/)
  await page.reload()
  await expect(html).toHaveClass(/weak-phone/)
  const anim = await page.evaluate(() => {
    const el = document.createElement('div')
    el.className = 'animate-float'
    document.body.appendChild(el)
    return getComputedStyle(el).animationName
  })
  expect(anim).toBe('none')
})

test('weak phone mode shows the size in MB before a big download and cancel stops it', async ({ page }) => {
  await seed(page, true)
  await page.goto('./#/settings')
  const card = page.getByTestId('ai-mode-card')
  await expect(card).toBeVisible({ timeout: 20000 })
  const btn = page.getByTestId('ai-offline-download')
  await expect(btn).toBeVisible()
  await btn.click()
  const warn = page.getByTestId('download-warning')
  await expect(warn).toContainText('1843 MB')
  await page.screenshot({ path: 'test-results/weak-warning.png' })
  await page.getByTestId('download-cancel').click()
  await expect(warn).toHaveCount(0)
  await expect(btn).toBeVisible()
})

test('without weak phone mode there is no warning dialog', async ({ page }) => {
  await seed(page, false)
  await page.goto('./#/settings')
  const card = page.getByTestId('ai-mode-card')
  await expect(card).toBeVisible({ timeout: 20000 })
  const btn = page.getByTestId('ai-offline-download')
  await expect(btn).toBeVisible()
  await btn.click()
  await expect(page.getByTestId('download-warning')).toHaveCount(0)
})
