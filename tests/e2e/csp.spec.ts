import { test, expect, type Page } from '@playwright/test'

async function seed(page: Page, language: string, gradeLevel: number) {
  await page.addInitScript(
    ({ language, gradeLevel }) => {
      ;(window as any).__csp = []
      document.addEventListener('securitypolicyviolation', (e) => (window as any).__csp.push(`${e.violatedDirective} ${e.blockedURI}`))
      if (window.localStorage.getItem('jessica-profile-v1')) return
      window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: {
            onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: '', model: 'gemini-1.5-flash', xp: 100, streak: 2,
            customBooks: [{ id: 'b1', title: 'Science', subject: 'Science', grade: gradeLevel, term: 'Term 1', pageCount: 40, custom: true, units: [] }],
            completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {},
            settings: { language, gradeLevel, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false, sound: false, aiMode: 'cloud' },
          },
          version: 3,
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
    },
    { language, gradeLevel },
  )
}

const violations = (page: Page) => page.evaluate(() => (window as any).__csp as string[])

test('the built page ships a policy that blocks plugins, other bases and inline code', async ({ page }) => {
  await seed(page, 'en', 9)
  await page.goto('./#/')
  const policy = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content')
  expect(policy).toContain("object-src 'none'")
  expect(policy).toContain("base-uri 'self'")
  expect(policy).not.toContain("'unsafe-eval'")
  expect(policy).not.toMatch(/script-src[^;]*https?:/)
  expect(policy).not.toMatch(/worker-src[^;]*https?:/)
  expect(policy).not.toMatch(/script-src[^;]*'unsafe-inline'/)
  const ran = await page.evaluate(() => {
    const s = document.createElement('script')
    s.textContent = 'window.__injected = 1'
    document.body.appendChild(s)
    return (window as any).__injected === 1
  })
  expect(ran).toBe(false)
  expect((await violations(page)).some((v) => v.startsWith('script-src'))).toBe(true)
})

test('the app and the small inline start-up scripts still run under the policy', async ({ page }) => {
  await seed(page, 'ar', 9)
  await page.goto('./#/')
  await expect(page.locator('#root > *').first()).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('#boot-fallback')).toBeHidden()
  for (const route of ['./#/settings', './#/library', './#/kids']) {
    await page.goto(route)
    await page.waitForTimeout(500)
  }
  // only the deliberate injection test may trip the policy, and it is not run here
  expect(await violations(page)).toEqual([])
})

test('kids world and settings load with no policy violations', async ({ page }) => {
  await seed(page, 'en', 3)
  await page.goto('./#/kids')
  await expect(page.getByTestId('kids-today-entry')).toBeVisible()
  await page.goto('./#/kids/today')
  await page.waitForTimeout(500)
  expect(await violations(page)).toEqual([])
})
