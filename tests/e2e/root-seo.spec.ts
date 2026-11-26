import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

const html = readFileSync('index.html', 'utf8')
const one = (re: RegExp) => html.match(re)?.[1] ?? ''

test('root page: one H1, Arabic lang, short title, ~150 char description', () => {
  expect(html.match(/<h1[\s>]/g)?.length).toBe(1)
  expect(one(/<html lang="([^"]+)"/)).toBe('ar')
  expect([...one(/<title>([^<]*)<\/title>/)].length).toBeLessThan(60)
  const description = [...one(/<meta name="description" content="([^"]*)"/)].length
  expect(description).toBeGreaterThanOrEqual(120)
  expect(description).toBeLessThanOrEqual(160)
})

test('root page: canonical points to the welcome page and matches og:url and hreflang', () => {
  const welcome = 'https://bishoynabilanis.github.io/jessica/welcome/'
  expect(one(/<link rel="canonical" href="([^"]+)"/)).toBe(welcome)
  expect(one(/<meta property="og:url" content="([^"]+)"/)).toBe(welcome)
  expect(html).toContain('hreflang="x-default" href="' + welcome + '"')
  expect(readFileSync('public/sitemap.xml', 'utf8')).toContain('<loc>' + welcome + '</loc>')
})

test('root page: the app still loads', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./#/')
  await expect(page.locator('#root > *').first()).toBeVisible()
  await expect(page.locator('#boot-fallback')).toBeHidden()
  await page.screenshot({ path: '/tmp/sh/root-after.png' })
})
