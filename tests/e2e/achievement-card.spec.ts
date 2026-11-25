import { test, expect, type Page } from '@playwright/test'
import { earnedAchievements } from '../../src/lib/achievementCard'

async function seed(page: Page, language: string, progress: boolean) {
  await page.addInitScript(
    ({ language, progress }) => {
      if (window.localStorage.getItem('jessica-profile-v1')) return
      window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: {
            onboarded: true, acceptedTerms: 1, name: 'Mariam', apiKey: '', model: 'gemini-1.5-flash', xp: progress ? 700 : 1, streak: progress ? 5 : 0, coins: 0,
            customBooks: [{ id: 'm1', title: 'Book m1', subject: 'Science', language: 'en', emoji: '', accent: '', term: 'Term 1', description: '', file: '', pageCount: 30, grade: 7, catalogId: 'cat-1', units: [] }],
            completedTopics: progress ? ['t1', 't2'] : [], skillStats: {}, mistakes: [],
            settings: { language, gradeLevel: 7, curriculum: 'egypt', schoolType: 'government', primaryUi: 'study', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false },
          },
          version: 3,
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
    },
    { language, progress },
  )
}

test('wins are worked out only from real progress', () => {
  expect(earnedAchievements({ streak: 2, completedTopics: 0, xp: 10, weekSeconds: 600 })).toEqual([])
  const all = earnedAchievements({ streak: 5, completedTopics: 2, xp: 700, weekSeconds: 3600 })
  expect(all.map((a) => a.kind)).toEqual(['streak', 'topics', 'level', 'minutes'])
  expect(all[2].value).toBe(3)
  expect(all[3].value).toBe(60)
})

for (const [lang, width] of [['en', 1280], ['ar', 390]] as const) {
  test(`student picks a win, sees the card, can send it on WhatsApp, nothing is stored (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    await seed(page, lang, true)
    await page.addInitScript(() => {
      ;(window as unknown as { __opened: string[] }).__opened = []
      window.open = ((url?: string | URL) => {
        ;(window as unknown as { __opened: string[] }).__opened.push(String(url))
        return null
      }) as typeof window.open
    })
    await page.goto('./#/')
    await expect(page.getByTestId('achievement-dash-link')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('achievement-dash-link').click()
    await expect(page.getByTestId('achievement-privacy')).toBeVisible()
    const img = page.getByTestId('achievement-image')
    await expect(img).toBeVisible({ timeout: 10000 })
    const size = await img.evaluate((el: HTMLImageElement) => [el.naturalWidth, el.naturalHeight])
    expect(size).toEqual([1080, 1080])
    const before = await img.getAttribute('src')
    await page.getByTestId('achievement-pick-level').click()
    await expect.poll(async () => img.getAttribute('src')).not.toBe(before)
    const noName = await img.getAttribute('src')
    await page.getByTestId('achievement-name').check()
    await expect.poll(async () => img.getAttribute('src')).not.toBe(noName)
    await page.screenshot({ path: `test-results/achievement-${lang}.png` })
    await page.getByTestId('achievement-whatsapp').click()
    const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened)
    expect(opened).toHaveLength(1)
    expect(opened[0]).toContain('https://wa.me/?text=')
    expect(decodeURIComponent(opened[0])).toContain('bishoynabilanis.github.io/jessica')
    // The card must not add anything to storage.
    const keys = await page.evaluate(() => Object.keys(window.localStorage).filter((k) => /achiev/i.test(k)))
    expect(keys).toEqual([])
  })
}

test('with no progress there is no dashboard link and the page explains how to earn a win', async ({ page }) => {
  await seed(page, 'en', false)
  await page.goto('./#/')
  await expect(page.getByTestId('daily-question')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('achievement-dash-link')).toHaveCount(0)
  await page.goto('./#/achievement')
  await expect(page.getByTestId('achievement-empty')).toBeVisible()
})
