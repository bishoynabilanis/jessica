import { test, expect, type Page } from '@playwright/test'

function code() {
  const payload = {
    v: 1, id: 'b-test-1', subject: 'Mathematics', challenger: 'Omar', target: 1,
    questions: [{ question: 'Two plus two?', options: ['3', '4', '5', '6'], answer: 1, explanation: 'Four.' }],
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

async function seed(page: Page, language: string) {
  await page.addInitScript(
    ({ language }) => {
      const make = (name: string) =>
        JSON.stringify({
          state: {
            onboarded: true, acceptedTerms: 1, name, apiKey: 'test-key',
            aiKeys: { gemini: 'test-key', openai: '', anthropic: '', openrouter: '', custom: '' },
            model: 'gemini-1.5-flash', xp: 1, streak: 1, coins: 0,
            customBooks: [{ id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }],
            completedTopics: [], skillStats: {}, mistakes: [],
            settings: { language, gradeLevel: 7, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false },
          },
          version: 3,
        })
      ;(window as unknown as { __make: (n: string) => string }).__make = make
      if (!window.localStorage.getItem('jessica-profile-v1')) window.localStorage.setItem('jessica-profile-v1', make('Mona'))
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
    },
    { language },
  )
}

async function play(page: Page) {
  await page.locator('button', { has: page.locator('span.leading-relaxed', { hasText: /^4$/ }) }).click()
  await page.getByRole('button', { name: /Results|Next/ }).click()
}

for (const [lang, width] of [['en', 1280], ['ar', 390]] as const) {
  test(`battle result card and device scoreboard (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 800 })
    await seed(page, lang)
    await page.goto(`./#/battle?d=${code()}`)
    await play(page)
    await expect(page.getByTestId('battle-card-image')).toBeVisible()
    await expect(page.getByTestId('battle-board').locator('li')).toHaveCount(1)

    // a second child on the same device plays the same battle
    await page.evaluate(() => {
      const raw = JSON.parse(localStorage.getItem('jessica-profile-v1')!)
      raw.state.name = 'Youssef'
      localStorage.setItem('jessica-profile-v1', JSON.stringify(raw))
    })
    await page.goto(`./#/battle?d=${code()}`)
    await page.reload()
    await play(page)
    await expect(page.getByTestId('battle-board').locator('li')).toHaveCount(2)
    await expect(page.getByTestId('battle-board')).toContainText('Mona')
    await expect(page.getByTestId('battle-board')).toContainText('Youssef')
    await page.getByTestId('battle-card-image').scrollIntoViewIfNeeded()
    await page.screenshot({ path: `test-results/battle-card-${lang}.png`, fullPage: true })

    const download = page.waitForEvent('download')
    await page.getByTestId('battle-card-save').click()
    expect((await download).suggestedFilename()).toBe('jessica-battle-result.png')
  })
}
