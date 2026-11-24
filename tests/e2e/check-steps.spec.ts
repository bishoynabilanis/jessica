import { test, expect, type Page } from '@playwright/test'

async function seed(page: Page, language = 'en') {
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
            customBooks: [{ id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }],
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
      steps: [
        { verdict: 'ok', hint: 'Good move' },
        { verdict: 'mistake', hint: 'Check what happens to the 5 when you move it' },
        { verdict: 'unclear', hint: '' },
      ],
      summary: 'Nearly there.',
      finalAnswerOk: false,
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(reply) }] } }] }),
    })
  })
  return () => prompt
}

async function fill(page: Page) {
  await page.getByTestId('steps-question').fill('Solve 3x + 5 = 20')
  await page.getByTestId('steps-working').fill('1. 3x + 5 = 20\n2. 3x = 20 + 5\n3. x = 25/3')
  await page.getByTestId('steps-check').click()
}

test('the solver links to the checker and each step is marked, with a hint on the wrong one', async ({ page }) => {
  const getPrompt = await seed(page)
  await page.goto('/#/solve')
  await page.getByTestId('steps-link').click()
  await expect(page).toHaveURL(/#\/steps/)
  await fill(page)
  const result = page.getByTestId('steps-result')
  await expect(result).toBeVisible()
  await expect(result.locator('[data-verdict="ok"]')).toHaveCount(1)
  await expect(result.locator('[data-verdict="mistake"]')).toContainText('Check what happens to the 5')
  await expect(result.locator('[data-verdict="unclear"]')).toHaveCount(1)
  await expect(result).toContainText('Start by fixing step 2')
  // The prompt carries the child's own steps (numbering stripped) and forbids giving the answer away.
  const sent = getPrompt()
  expect(sent).toContain('3x = 20 + 5')
  expect(sent).toContain('Do NOT write the corrected step')
  await page.screenshot({ path: 'test-results/steps-desktop.png', fullPage: true })
})

test('Arabic 390px: the checker fits without sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page, 'ar')
  await page.goto('/#/steps')
  await fill(page)
  await expect(page.getByTestId('steps-result')).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
  await page.screenshot({ path: 'test-results/steps-ar-390.png', fullPage: true })
})
