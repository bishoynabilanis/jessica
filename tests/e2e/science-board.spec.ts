import { test, expect, type Page } from '@playwright/test'

async function seed(page: Page, language: string) {
  await page.addInitScript(
    ({ language }) => {
      if (window.localStorage.getItem('jessica-profile-v1')) return
      window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: {
            onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: 'test-key',
            aiKeys: { gemini: 'test-key', openai: '', anthropic: '', openrouter: '', custom: '' },
            model: 'gemini-1.5-flash', xp: 1, streak: 1, coins: 0,
            customBooks: [{ id: 'b1', title: 'Science', subject: 'Science', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }],
            completedTopics: [], skillStats: {}, mistakes: [],
            settings: { language, gradeLevel: 7, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false },
          },
          version: 3,
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
    },
    { language },
  )
  let prompt = ''
  await page.route('**/generativelanguage.googleapis.com/**', (route) => {
    prompt = route.request().postData() || ''
    const reply = {
      title: 'How a plant makes food',
      steps: [
        { title: 'Light comes in', detail: 'The leaf catches sunlight with chlorophyll.' },
        { title: 'Water and air', detail: 'Roots bring water and leaves take in carbon dioxide.' },
        { title: 'Food is made', detail: 'The plant makes sugar and releases oxygen.' },
      ],
      keyWords: ['chlorophyll', 'sugar'],
      remember: 'Plants make their own food using light.',
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(reply) }] } }] }),
    })
  })
  return () => prompt
}

for (const [lang, width] of [['en', 1280], ['ar', 390]] as const) {
  test(`a typed science question becomes a board (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 800 })
    const getPrompt = await seed(page, lang)
    await page.goto('./#/ask')
    await page.getByTestId('board-link').click()
    await expect(page).toHaveURL(/#\/science-board/)
    await page.getByTestId('board-question').fill('How does a plant make food?')
    await page.getByTestId('board-make').click()
    await expect(page.getByTestId('board-result')).toBeVisible()
    await expect(page.getByTestId('board-step')).toHaveCount(3)
    await expect(page.getByTestId('board-keywords')).toContainText('chlorophyll')
    await expect(page.getByTestId('board-honesty')).toBeVisible()
    expect(getPrompt()).toContain('How does a plant make food?')
    await page.screenshot({ path: `test-results/board-${lang}.png`, fullPage: true })
  })
}
