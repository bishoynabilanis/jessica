import { test, expect } from '@playwright/test'

const seed = (geminiKey: string) => ({
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
    mistakes: [],
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
  await expect(page.getByTestId('voice-engine-device')).toBeVisible()
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
  await page.getByTestId('voice-engine-cloud').click()
  await expect(page.getByTestId('voice-cloud-panel')).toBeVisible()
  await expect(page.getByTestId('voice-cloud-key-note')).toBeVisible()

  await page.reload()
  await expect(page.getByTestId('voice-cloud-panel')).toBeVisible()
})

test('with a Gemini key the cloud panel offers the real Egyptian voices', async ({ page }) => {
  await page.addInitScript((profile) => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify(profile))
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, seed('AIza-test-key'))

  await page.goto('/#/settings')
  await page.getByTestId('voice-engine-cloud').click()
  await expect(page.getByTestId('voice-cloud-panel')).toBeVisible()
  await expect(page.getByTestId('voice-cloud-load')).toBeVisible()
  await expect(page.getByTestId('voice-cloud-key-note')).toHaveCount(0)

  await page.getByTestId('voice-cloud-select').selectOption('Kore')
  await page.reload()
  await expect(page.getByTestId('voice-cloud-select')).toHaveValue('Kore')
})
