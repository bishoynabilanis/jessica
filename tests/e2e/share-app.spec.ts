import { test, expect } from '@playwright/test'

const PAGES = [
  { path: '/welcome/', url: 'https://bishoynabilanis.github.io/jessica/welcome/' },
  { path: '/welcome/en/', url: 'https://bishoynabilanis.github.io/jessica/welcome/en/' },
]

for (const p of PAGES) {
  test(`share button uses the native share sheet when available (${p.path})`, async ({ page }) => {
    await page.addInitScript(() => {
      ;(window as any).__shared = null
      ;(navigator as any).share = (data: unknown) => {
        ;(window as any).__shared = data
        return Promise.resolve()
      }
    })
    await page.goto(p.path)
    const buttons = page.locator('button[onclick="shareApp()"]')
    expect(await buttons.count()).toBe(2)
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => ((window as any).__shared = null))
      await buttons.nth(i).scrollIntoViewIfNeeded()
      await buttons.nth(i).click()
      const shared = await page.evaluate(() => (window as any).__shared)
      expect(shared.url).toBe(p.url)
      expect(shared.title).toBe('Jessica')
      expect(String(shared.text).length).toBeGreaterThan(20)
    }
  })

  test(`share button falls back to a WhatsApp link without native share (${p.path})`, async ({ page, context }) => {
    await page.addInitScript(() => {
      ;(navigator as any).share = undefined
      ;(window as any).__opened = []
      window.open = ((...a: unknown[]) => {
        ;(window as any).__opened.push(a)
        return null
      }) as typeof window.open
    })
    await page.goto(p.path)
    const buttons = page.locator('button[onclick="shareApp()"]')
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => ((window as any).__opened = []))
      await buttons.nth(i).scrollIntoViewIfNeeded()
      await buttons.nth(i).click()
      const opened = await page.evaluate(() => (window as any).__opened)
      expect(opened.length).toBe(1)
      const [href, target, features] = opened[0]
      expect(target).toBe('_blank')
      expect(features).toContain('noopener')
      const u = new URL(href)
      expect(u.origin + u.pathname).toBe('https://wa.me/')
      const text = u.searchParams.get('text') || ''
      expect(text.endsWith(p.url)).toBe(true)
      expect(text).toContain('Jessica')
    }
    void context
  })
}
