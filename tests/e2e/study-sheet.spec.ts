import { test, expect, type Page } from '@playwright/test'

const today = new Date()
const key = (offset: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function seed(page: Page, language = 'en') {
  await page.addInitScript(
    ({ language, d0, d1, d2 }) => {
      if (window.localStorage.getItem('jessica-profile-v1')) return
      window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: {
            onboarded: true,
            acceptedTerms: 1,
            name: 'Youssef',
            apiKey: '',
            model: 'gemini-1.5-flash',
            xp: 100,
            streak: 3,
            coins: 0,
            customBooks: [{ id: 'b1', title: 'Science', subject: 'Science', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }],
            completedTopics: [],
            skillStats: { 'Science|Forces': { correct: 2, total: 5, lastAt: 1 } },
            mistakes: [{ id: 'm1', question: 'q', options: ['a', 'b'], answer: 0, chosen: 1, explanation: '', subject: 'Science', createdAt: 1 }],
            topicLog: [
              { id: 't1', title: 'Forces and motion', subject: 'Science', date: d0 },
              { id: 't2', title: 'Fractions', subject: 'Mathematics', date: d1 },
            ],
            dailyLog: { [d0]: { xp: 60, seconds: 1800 }, [d1]: { xp: 40, seconds: 1200 }, [d2]: { xp: 10, seconds: 300 } },
            settings: {
              language,
              gradeLevel: 7,
              curriculum: 'egypt',
              schoolType: 'government',
              primaryUi: 'auto',
              aiProvider: 'gemini',
              theme: 'dark',
              keyOptional: true,
              quickStart: false,
            },
          },
          version: 3,
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
    },
    { language, d0: key(0), d1: key(-1), d2: key(-3) },
  )
}

test('the sheet is drawn from what the child did and says it stays on the device', async ({ page }) => {
  await seed(page)
  await page.goto('/#/report')
  await page.getByTestId('sheet-link').click()
  await expect(page).toHaveURL(/#\/sheet/)
  await expect(page.getByTestId('sheet-privacy')).toContainText('No account, no tracking, no server')
  const image = page.getByTestId('sheet-image')
  await expect(image).toBeVisible()
  const box = await image.boundingBox()
  expect(box!.height).toBeGreaterThan(box!.width)
})

test('the name only appears when the parent turns it on', async ({ page }) => {
  await seed(page)
  await page.goto('/#/sheet')
  const image = page.getByTestId('sheet-image')
  await expect(image).toBeVisible()
  const off = await image.getAttribute('src')
  await page.getByTestId('sheet-name').check()
  await expect.poll(async () => image.getAttribute('src')).not.toBe(off)
})

test('sharing hands the picture to the phone share sheet as a PNG file', async ({ page }) => {
  await seed(page)
  await page.addInitScript(() => {
    const nav = navigator as unknown as Record<string, unknown>
    nav.canShare = () => true
    nav.share = async (data: { files: File[] }) => {
      ;(window as unknown as Record<string, unknown>).__shared = `${data.files[0].type}:${data.files[0].size > 5000}`
    }
  })
  await page.goto('/#/sheet')
  await page.getByTestId('sheet-share').click()
  await expect.poll(() => page.evaluate(() => (window as unknown as Record<string, string>).__shared)).toBe('image/png:true')
})

test('the sheet reads fine in Arabic on a phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await seed(page, 'ar')
  await page.goto('/#/sheet')
  await expect(page.getByTestId('sheet-privacy')).toContainText('من غير حساب')
  await expect(page.getByTestId('sheet-image')).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'test-results/sheet-ar-390.png', fullPage: true })
})

test('desktop preview', async ({ page }) => {
  await seed(page)
  await page.goto('/#/sheet')
  await expect(page.getByTestId('sheet-image')).toBeVisible()
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'test-results/sheet-desktop.png', fullPage: true })
})
