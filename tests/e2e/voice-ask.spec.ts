import { test, expect, type Page } from '@playwright/test'

async function seed(page: Page, language = 'en') {
  await page.addInitScript(
    ({ language }) => {
      if (!window.localStorage.getItem('jessica-profile-v1')) window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: {
            onboarded: true,
            acceptedTerms: 1,
            name: 'Youssef',
            apiKey: 'test-key',
            aiKeys: { gemini: 'test-key', openai: '', anthropic: '', openrouter: '', custom: '' },
            model: 'gemini-1.5-flash',
            xp: 1,
            streak: 1,
            coins: 0,
            customBooks: [{ id: 'b1', title: 'Science', subject: 'Science', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }],
            completedTopics: [],
            skillStats: {},
            mistakes: [],
            vault: [
              { id: 'v1', title: 'Photosynthesis', content: 'Photosynthesis is how plants make food from light, water and carbon dioxide.', tag: 'Science', createdAt: 1 },
            ],
            settings: { language, gradeLevel: 7, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false },
          },
          version: 3,
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
      // Fake microphone: says one sentence as soon as it starts.
      class FakeRec {
        lang = ''
        continuous = false
        interimResults = false
        onresult: ((e: unknown) => void) | null = null
        onerror: (() => void) | null = null
        onend: (() => void) | null = null
        start() {
          setTimeout(() => {
            this.onresult?.({
              resultIndex: 0,
              results: [Object.assign([{ transcript: 'Explain photosynthesis' }], { isFinal: true })],
            })
            this.onend?.()
          }, 50)
        }
        stop() {}
      }
      ;(window as any).SpeechRecognition = FakeRec
      const spoken: string[] = []
      ;(window as any).__spoken = spoken
      const fake = {
        speaking: false,
        pending: false,
        paused: false,
        getVoices: () => [],
        addEventListener() {},
        removeEventListener() {},
        cancel() {},
        pause() {},
        resume() {},
        speak(u: { text: string; onend?: () => void }) {
          spoken.push(u.text)
          setTimeout(() => u.onend?.(), 20)
        },
      }
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: fake })
      ;(window as any).SpeechSynthesisUtterance = function (this: any, text: string) {
        this.text = text
      }
    },
    { language },
  )
  await page.route('**/generativelanguage.googleapis.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Plants turn light into food [1].' }] } }] }),
    }),
  )
}

test('ask by voice, then listen to the answer', async ({ page }) => {
  await seed(page)
  await page.goto('/#/ask')
  const mic = page.getByTestId('ask-mic')
  await expect(mic).toBeVisible()
  await mic.click()
  await expect(page.locator('input.field')).toHaveValue('Explain photosynthesis')
  await expect(page.getByText('Plants turn light into food')).toBeVisible()
  await page.getByTestId('ask-listen').click()
  await expect.poll(() => page.evaluate(() => (window as any).__spoken.length)).toBeGreaterThan(0)
  const said = await page.evaluate(() => (window as any).__spoken.join(' '))
  expect(said).toContain('Plants turn light into food')
  await page.screenshot({ path: 'test-results/voice-ask-desktop.png', fullPage: true })
})

test('Arabic 390px: mic and listen fit without sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page, 'ar')
  await page.goto('/#/ask')
  await page.getByTestId('ask-mic').click()
  await expect(page.getByTestId('ask-listen')).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
  await page.screenshot({ path: 'test-results/voice-ask-ar-390.png', fullPage: true })
})
