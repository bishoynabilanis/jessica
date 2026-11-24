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

test('the child rebuilds a real sentence by tapping the word cars in order', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page, true)
  await page.goto('/#/kids/play')
  await page.getByTestId('open-train').click()
  await page.getByTestId('train-unit').first().click()
  await expect(page.getByTestId('train-car').first()).toBeVisible()
  const sentenceWords = await page.getByTestId('train-car').evaluateAll((els) => els.map((e) => e.getAttribute('data-word') || ''))
  expect(sentenceWords.length).toBeGreaterThanOrEqual(4)

  // the real sentence is one of the book's own short sentences
  const known = pageText.replace(/\s+/g, ' ')
  const joinedSorted = [...sentenceWords].sort().join(' ')
  const sentences = known.split(/(?<=[.])\s+/)
  const match = sentences.find((x) => x.split(' ').slice().sort().join(' ') === joinedSorted)
  expect(match).toBeTruthy()
  const target = match!.split(' ')

  // a wrong word only gives a hint
  const firstWord = target[0]
  const wrong = sentenceWords.find((w) => w !== firstWord)!
  await page.locator(`[data-testid="train-car"][data-word="${wrong}"]:not([disabled])`).first().click()
  await expect(page.getByTestId('train-hint')).toBeVisible()
  await expect(page.getByTestId('train-done')).toHaveCount(0)

  for (const w of target) await page.locator(`[data-testid="train-car"][data-word="${w}"]:not([disabled])`).first().click()
  await expect(page.getByTestId('train-done')).toBeVisible()
  await page.waitForTimeout(400)
  await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/train-kids-mobile.png` : undefined })
})

test('a unit with no usable text says so and invents nothing', async ({ page }) => {
  await seed(page, false)
  await page.goto('/#/kids/train')
  await page.getByTestId('train-unit').nth(1).click()
  await expect(page.getByTestId('train-notext')).toBeVisible()
  await expect(page.getByTestId('train-car')).toHaveCount(0)
})
