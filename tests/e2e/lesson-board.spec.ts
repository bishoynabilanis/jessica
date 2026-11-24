import { test, expect, type Page } from '@playwright/test'

const units = [
  { id: 'u1', title: 'القوة والحركة', startPage: 5, endPage: 6 },
  { id: 'u2', title: 'وحدة فاضية', startPage: 7, endPage: 8 },
]

const pageText =
  'القوة هي تأثير يغير حركة الجسم أو شكله. الاحتكاك قوة تعمل بين سطحين متلامسين. ' +
  'كلما كان السطح أخشن زادت قوة الاحتكاك بين الجسمين. الجسم الساكن يحتاج إلى دفعة حتى يتحرك. ' +
  'الجاذبية تجذب الأجسام نحو مركز الأرض دائما. السيارة تتوقف ببطء عندما نرفع القدم عن البنزين.'

async function seed(page: Page, withText: boolean) {
  await page.addInitScript((u) => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = { id: 'b1', title: 'العلوم', subject: 'Science', grade: 3, term: 'Term 1', pageCount: 40, custom: true, units: u }
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify({
      state: { onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: '', model: 'gemini-1.5-flash', xp: 100, streak: 1, coins: 0,
        customBooks: [book], completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {},
        settings: { language: 'ar', gradeLevel: 3, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false, sound: false, aiMode: 'cloud' } },
      version: 3 }))
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, units)
  await page.goto('/#/library')
  await page.waitForTimeout(500)
  await page.evaluate(async (payload) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('jessica-db', 1)
      request.onupgradeneeded = () => {
        for (const n of ['kv']) if (!request.result.objectStoreNames.contains(n)) request.result.createObjectStore(n)
        if (!request.result.objectStoreNames.contains('cards')) request.result.createObjectStore('cards', { keyPath: 'id' })
      }
      request.onsuccess = () => {
        const tx = request.result.transaction('kv', 'readwrite')
        tx.objectStore('kv').put(payload, `chapter:${payload.bookId}`)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      }
      request.onerror = () => reject(request.error)
    })
  }, { bookId: 'b1', pages: withText ? [{ page: 5, text: pageText }] : [{ page: 9, text: 'x' }], text: 'x', extractedAt: 1 })
}

test('the child puts book sentences back in the page order by tapping them', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page, true)
  await page.goto('/#/kids/play')
  await page.getByTestId('open-board').click()
  await page.getByTestId('board-unit').first().click()
  await expect(page.getByTestId('board-car').first()).toBeVisible()
  const shown = await page.getByTestId('board-car').evaluateAll((els) => els.map((e) => (e.getAttribute('data-sentence') || '').trim()))
  expect(shown.length).toBeGreaterThanOrEqual(3)

  // every card is a real sentence of the book page, and they follow each other there
  const all = pageText.replace(/\s+/g, ' ').split(/(?<=[.])\s+/)
  for (const s of shown) expect(all).toContain(s)
  const order = [...shown].sort((a, b) => all.indexOf(a) - all.indexOf(b))
  for (let i = 1; i < order.length; i++) expect(all.indexOf(order[i])).toBe(all.indexOf(order[i - 1]) + 1)

  // a wrong sentence only gives a hint
  await page.locator(`[data-testid="board-car"][data-sentence="${order[order.length - 1]}"]`).click()
  await expect(page.getByTestId('board-hint')).toBeVisible()
  await expect(page.getByTestId('board-done')).toHaveCount(0)

  for (const s of order) await page.locator(`[data-testid="board-car"][data-sentence="${s}"]:not([disabled])`).click()
  await expect(page.getByTestId('board-done')).toBeVisible()
  await page.waitForTimeout(400)
  await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/board-kids-mobile.png` : undefined })
})

test('a unit with no usable text says so and invents nothing', async ({ page }) => {
  await seed(page, false)
  await page.goto('/#/kids/board')
  await page.getByTestId('board-unit').nth(1).click()
  await expect(page.getByTestId('board-notext')).toBeVisible()
  await expect(page.getByTestId('board-car')).toHaveCount(0)
})
