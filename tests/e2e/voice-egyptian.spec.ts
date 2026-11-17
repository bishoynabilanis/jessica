import { test, expect } from '@playwright/test'

const seed = (geminiKey: string, mistakes: unknown[] = []) => ({
  state: {
    onboarded: true,
    acceptedTerms: 1,
    name: 'Tester',
    apiKey: '',
    aiKeys: { gemini: geminiKey, openai: '', anthropic: '', openrouter: '', custom: '' },
    model: 'gemini-1.5-flash',
    xp: 100,
    streak: 1,
    coins: 0,
    customBooks: [{ id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }],
    completedTopics: [],
    skillStats: {},
    mistakes,
    dailyLog: {},
    settings: {
      language: 'ar',
      gradeLevel: 7,
      curriculum: 'egypt',
      schoolType: 'government',
      primaryUi: 'auto',
      aiProvider: 'gemini',
      theme: 'dark',
      keyOptional: true,
      quickStart: false,
      sound: false,
      aiMode: 'cloud',
    },
  },
  version: 3,
})

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const spoken: Array<{ text: string; lang: string }> = []
    ;(window as unknown as { __spoken: typeof spoken }).__spoken = spoken
    const fake = {
      speaking: false,
      pending: false,
      paused: false,
      speak(utterance: SpeechSynthesisUtterance) {
        spoken.push({ text: utterance.text, lang: utterance.lang })
        utterance.onstart?.call(utterance, new Event('start'))
        window.setTimeout(() => utterance.onend?.call(utterance, new Event('end')), 0)
      },
      cancel() {},
      pause() {},
      resume() {},
      getVoices() {
        return []
      },
      addEventListener() {},
      removeEventListener() {},
    }
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: fake })
  })
})

test('the device voice reads Arabic with an Arabic voice', async ({ page }) => {
  await page.addInitScript((profile) => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify(profile))
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, seed(''))

  await page.goto('/#/settings')
  await expect(page.getByTestId('voice-engine-device')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByTestId('voice-device-panel')).toBeVisible()
  await expect(page.getByTestId('voice-device-select')).toHaveValue('')

  await page.getByTestId('voice-test').click()
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __spoken: Array<{ lang: string }> }).__spoken.at(-1)?.lang || ''))
    .toMatch(/^ar/)
})

test('the cloud engine explains the missing key and stays chosen after a reload', async ({ page }) => {
  await page.addInitScript((profile) => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify(profile))
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, seed(''))

  await page.goto('/#/settings')
  await expect(page.getByTestId('voice-engine-cloud')).toBeVisible({ timeout: 20_000 })
  await page.getByTestId('voice-engine-cloud').click()
  await expect(page.getByTestId('voice-cloud-panel')).toBeVisible()
  await expect(page.getByTestId('voice-cloud-key-note')).toBeVisible()

  await page.reload()
  await expect(page.getByTestId('voice-cloud-panel')).toBeVisible()
})

test('with a Gemini key the cloud panel picks a real Egyptian female voice', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/voices?')) requests.push(request.url())
  })
  await page.route('**/voices?*', (route) =>
    route.fulfill({
      json: {
        voices: [{ id: 'voice_eg_female', display_name: 'Salma', accent: 'Egyptian', gender: 'female' }],
      },
    }),
  )

  await page.addInitScript((profile) => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify(profile))
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, seed('AIza-test-key'))

  await page.goto('/#/settings')
  await page.getByTestId('voice-engine-cloud').click()
  await expect(page.getByTestId('voice-cloud-panel')).toBeVisible()
  await expect(page.getByTestId('voice-cloud-key-note')).toHaveCount(0)

  // The app asks the library for an Egyptian *female* voice and selects it.
  await expect(page.getByTestId('voice-cloud-select')).toHaveValue('voice_eg_female')
  await expect(page.getByTestId('voice-cloud-select')).toContainText('Salma')
  expect(requests.some((url) => url.includes('gender=female'))).toBe(true)

  await page.reload()
  await expect(page.getByTestId('voice-cloud-select')).toHaveValue('voice_eg_female')
})

const arabicMistake = {
  id: 'm_voice',
  question: '٢ + ٢ = ؟',
  options: ['٣', '٤', '٥', '٦'],
  answer: 1,
  chosen: 0,
  explanation: '٢ + ٢ = ٤',
  subject: 'Mathematics',
  topic: 'الجمع',
  createdAt: Date.now() - 5 * 86_400_000,
}

test('the notebook offers the Egyptian voice beside the explanation', async ({ page }) => {
  await page.addInitScript((profile) => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify(profile))
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, seed('AIza-test-key', [arabicMistake]))

  await page.goto('/#/mistakes')
  await expect(page.getByTestId('listen-egyptian').first()).toBeVisible()
})

test('without a key the Egyptian button is not shown at all', async ({ page }) => {
  await page.addInitScript((profile) => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify(profile))
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, seed('', [arabicMistake]))

  await page.goto('/#/mistakes')
  await expect(page.getByTestId('listen-egyptian')).toHaveCount(0)
})
