import { test, expect } from '@playwright/test'

// Visiting a public /welcome/ page must not contact a font host: Cairo is served from this site.
for (const path of ['welcome/', 'welcome/en/', 'welcome/grades/primary-3/', 'welcome/quiz/primary-3/']) {
  test(`${path} loads Cairo from this site and calls no Google host`, async ({ page }) => {
    const hosts = new Set<string>()
    page.on('request', (request) => hosts.add(new URL(request.url()).hostname))
    await page.goto(`/${path}`)
    await page.waitForLoadState('networkidle')
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready
      return [...document.fonts].filter((face) => face.family.includes('Cairo') && face.status === 'loaded').length
    })
    expect(loaded).toBeGreaterThan(0)
    expect([...hosts].filter((host) => /google|gstatic/.test(host))).toEqual([])
  })
}
