import { test, expect, type Page } from '@playwright/test'

// The app now serves the OCR engine from its own origin, where the service worker
// would answer before a test double can; block it so the double is used.
test.use({ serviceWorkers: 'block' })

// 1x1 transparent PNG
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

const fakeEngine = `
export async function createWorker(lang) {
  return {
    recognize: async () => ({ data: { text: 'Solve 3x + 5 = 20 [' + lang + ']' } }),
    terminate: async () => {},
  }
}
`

async function seed(page: Page, language = 'en') {
  let aiCalls = 0
  await page.route('**/tesseract.esm.min.js', (route) => route.fulfill({ contentType: 'text/javascript', body: fakeEngine }))
  await page.route('**/generativelanguage.googleapis.com/**', (route) => {
    aiCalls++
    return route.abort()
  })
  await page.addInitScript(
    ({ language }) => {
      if (!window.localStorage.getItem('jessica-profile-v1')) {
        window.localStorage.setItem(
          'jessica-profile-v1',
          JSON.stringify({
            state: {
              onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: '', model: 'gemini-1.5-flash',
              xp: 1, streak: 1, coins: 0,
              customBooks: [{ id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }],
              completedTopics: [], skillStats: {}, mistakes: [],
              settings: { language, gradeLevel: 7, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false },
            },
            version: 3,
          }),
        )
      }
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
      const spoken: string[] = []
      ;(window as any).__spoken = spoken
      const fake = {
        speaking: false, pending: false, paused: false,
        getVoices: () => [], addEventListener() {}, removeEventListener() {}, cancel() {}, pause() {}, resume() {},
        speak(u: { text: string; onend?: () => void }) { spoken.push(u.text); setTimeout(() => u.onend?.(), 20) },
      }
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: fake })
      ;(window as any).SpeechSynthesisUtterance = function (this: any, text: string) { this.text = text }
    },
    { language },
  )
  return () => aiCalls
}

async function openAndRead(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /Scan a page|امسح صفحة|مسح/ }).first().click()
  await page.getByRole('button', { name: /Upload photo|ارفع صورة|رفع/ }).first().click()
  await page.locator('input[type=file]').setInputFiles({ name: 'q.png', mimeType: 'image/png', buffer: PNG })
  await page.getByTestId('vision-read').click()
}

test('the text is read on the device without an AI key, and can be listened to', async ({ page }) => {
  const aiCalls = await seed(page)
  await openAndRead(page)
  await expect(page.getByTestId('vision-text')).toHaveValue('Solve 3x + 5 = 20 [eng]')
  await page.getByTestId('vision-text-listen').click()
  await expect.poll(() => page.evaluate(() => (window as any).__spoken.join(' '))).toContain('Solve 3x')
  expect(aiCalls()).toBe(0)
  await page.screenshot({ path: 'test-results/vision-read-desktop.png' })
})

test('Arabic 390px: reads Arabic and English, fits without sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const aiCalls = await seed(page, 'ar')
  await openAndRead(page)
  await expect(page.getByTestId('vision-text')).toHaveValue('Solve 3x + 5 = 20 [ara+eng]')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
  expect(aiCalls()).toBe(0)
  await page.screenshot({ path: 'test-results/vision-read-ar-390.png' })
})
