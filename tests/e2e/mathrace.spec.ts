import { test, expect, type Page } from '@playwright/test'

const units = [
  { id: 'u1', title: 'القوة والحركة', startPage: 5, endPage: 6 },
  { id: 'u2', title: 'وحدة فاضية', startPage: 7, endPage: 8 },
]

const pageText =
  'تعلمنا الجمع والطرح. جمع ٣ + ٤ ثم طرح ١٥ - ٦ ثم ضرب ٣ × ٤ وقسمة ١٢ ÷ ٣. العدد ٢٠ والعدد ١٠ و ١٨. ' + 'القوة هي تأثير يغير حركة الجسم أو شكله. الاحتكاك قوة تعمل بين سطحين متلامسين. ' +
  'كلما كان السطح أخشن زادت قوة الاحتكاك بين الجسمين. الجسم الساكن يحتاج إلى دفعة حتى يتحرك. ' +
  'الجاذبية تجذب الأجسام نحو مركز الأرض دائما. السيارة تتوقف ببطء عندما نرفع القدم عن البنزين.'

async function seed(page: Page, withText: boolean) {
  await page.addInitScript((u) => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = { id: 'b1', title: 'العلوم', subject: 'Mathematics', grade: 3, term: 'Term 1', pageCount: 40, custom: true, units: u }
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


test('60 second race: numbers come from the book, a wrong answer returns, best is kept on the device', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page, true)
  await page.goto('/#/kids/play')
  await page.getByTestId('open-race').click()
  await page.getByTestId('race-unit').first().click()
  await expect(page.getByTestId('race-ready')).toBeVisible()
  await expect(page.getByTestId('race-ready')).toContainText(/20|٢٠/)
  for (const op of ['add', 'sub', 'mul', 'div']) await expect(page.getByTestId(`race-op-${op}`)).toBeVisible()
  await page.getByTestId('race-go').click()

  const answerNow = async () => Number(await page.getByTestId('race-question').getAttribute('data-answer'))
  const type = async (n: number) => {
    for (const d of String(n)) await page.getByTestId(`key-${d}`).click()
    await page.getByTestId('key-ok').click()
  }
  // a wrong answer is gentle and moves on
  const wrongText = (await page.getByTestId('race-question').getAttribute('data-text'))!
  await type((await answerNow()) + 1)
  await expect(page.getByTestId('race-lastwrong')).not.toHaveText('')
  // right answers count
  for (let i = 0; i < 3; i++) await type(await answerNow())
  await expect(page.getByText(/Correct: 3|صح: ٣/)).toBeVisible()
  await page.waitForTimeout(300)
  await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/race-play.png` : undefined })
  expect(wrongText.length).toBeGreaterThan(3)

  // end the round quickly by moving the clock
  await page.evaluate(() => {
    const real = Date.now
    Date.now = () => real() + 61000
  })
  await expect(page.getByTestId('race-done')).toBeVisible({ timeout: 3000 })
  await expect(page.getByTestId('race-best-after')).toContainText(/New personal best|رقم قياسي جديد/)
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('jessica-mathrace-v1') || '{}'))
  expect(Object.values(stored.best)[0]).toBe(3)
  expect(stored.missed.length).toBe(1)
  await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/race-done.png` : undefined })

  // next round (after a reload): the missed question comes back first
  await page.reload()
  await page.getByTestId('race-unit').first().click()
  await page.getByTestId('race-go').click()
  await expect(page.getByTestId("race-question")).toHaveAttribute("data-text", wrongText)

})

test('a unit with no text invents nothing', async ({ page }) => {
  await seed(page, false)
  await page.goto('/#/kids/race')
  await page.getByTestId('race-unit').nth(1).click()
  await expect(page.getByTestId('race-norange')).toBeVisible()
  await expect(page.getByTestId('race-go')).toHaveCount(0)
})
