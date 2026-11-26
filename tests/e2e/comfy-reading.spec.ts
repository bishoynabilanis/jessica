import { test, expect, type Page } from '@playwright/test'

async function seed(page: Page, comfy: boolean, language = 'en') {
  await page.addInitScript(
    ({ comfy, language }) => {
      if (window.localStorage.getItem('jessica-profile-v1')) return
      window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: {
            onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: '', model: 'gemini-1.5-flash', xp: 1, streak: 1, coins: 0,
            customBooks: [{ id: 'm1', title: 'Book m1', subject: 'Science', language: 'en', emoji: '', accent: '', term: 'Term 1', description: '', file: '', pageCount: 30, grade: 7, catalogId: 'cat-1', units: [] }],
            completedTopics: [], skillStats: {}, mistakes: [],
            settings: { language, gradeLevel: 7, curriculum: 'egypt', schoolType: 'government', primaryUi: 'study', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false, comfyReading: comfy, textScale: 100 },
          },
          version: 3,
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
    },
    { comfy, language },
  )
}

for (const [lang, width] of [['en', 1280], ['ar', 390]] as const) {
  test(`comfortable reading turns on from the panel, enlarges text, calms colours and is kept (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    await seed(page, false, lang)
    await page.goto('./#/')
    const html = page.locator('html')
    await expect(html).not.toHaveClass(/comfy-reading/)
    const before = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))
    const bgBefore = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    await page.screenshot({ path: `test-results/comfy-before-${lang}.png` })
    await page.getByRole('button', { name: lang === 'en' ? 'Accessibility quick settings' : /إعدادات سريعة/ }).first().click({ timeout: 15000 })
    await expect(page.getByRole('switch', { name: /Font with clearer letters|خط بحروف أوضح/ })).toBeVisible()
    await expect(page.getByText(/dyslexia|عسر القراءة/i)).toHaveCount(0)
    await page.getByRole('switch', { name: /Comfortable reading|القراءة المريحة/ }).click()
    await expect(html).toHaveClass(/comfy-reading/)
    const after = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))
    expect(after).toBeGreaterThan(before * 1.1)
    const bgAfter = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(bgAfter).not.toBe(bgBefore)
    const lh = await page.evaluate(() => getComputedStyle(document.body).lineHeight)
    expect(parseFloat(lh)).toBeGreaterThan(after * 1.7)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `test-results/comfy-after-${lang}.png` })
    await page.reload()
    await expect(html).toHaveClass(/comfy-reading/)
  })
}

test('with comfortable reading off nothing changes', async ({ page }) => {
  await seed(page, false)
  await page.goto('./#/')
  await expect(page.locator('html')).not.toHaveClass(/comfy-reading/)
  const fs = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)
  expect(fs).toBe('16px')
})
