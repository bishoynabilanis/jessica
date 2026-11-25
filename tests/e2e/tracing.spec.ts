import { test, expect, type Page } from '@playwright/test'

const units = [
  { id: 'u1', title: 'القوة والحركة', startPage: 5, endPage: 6 },
  { id: 'u2', title: 'وحدة فاضية', startPage: 7, endPage: 8 },
]

const pageText0 =
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


const pageText = pageText0 + ' في الصف ٣ و 12 تلميذا.'

async function guidePoints(page: Page) {
  return page.getByTestId('trace-guide').evaluate((c: HTMLCanvasElement) => {
    const ctx = c.getContext('2d')!
    const d = ctx.getImageData(0, 0, c.width, c.height).data
    const r = c.getBoundingClientRect()
    const pts: Array<[number, number]> = []
    for (let y = 0; y < c.height; y += 5) {
      const row: Array<[number, number]> = []
      for (let x = 0; x < c.width; x += 5) if (d[(y * c.width + x) * 4 + 3] > 40) row.push([r.left + (x * r.width) / c.width, r.top + (y * r.height) / c.height])
      if (y / 5 % 2) row.reverse()
      pts.push(...row)
    }
    return pts
  })
}

test('the child traces a letter from the book: scribbles fail, tracing the shape passes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seed(page, true)
  await page.goto('/#/kids/play')
  await page.getByTestId('open-trace').click()
  await page.getByTestId('trace-unit').first().click()
  await expect(page.getByTestId('trace-canvas')).toBeVisible()
  await expect(page.getByTestId('trace-tab-numbers')).toBeEnabled()

  // a wild scribble away from the letter is not accepted
  const box = (await page.getByTestId('trace-canvas').boundingBox())!
  await page.mouse.move(box.x + 5, box.y + 5)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width - 5, box.y + 8, { steps: 5 })
  await page.mouse.move(box.x + 5, box.y + 40, { steps: 5 })
  await page.mouse.up()
  await expect(page.getByTestId('trace-again')).toBeVisible()
  await page.getByTestId('trace-clear').click()

  // going over the whole grey shape is accepted
  const pts = await guidePoints(page)
  expect(pts.length).toBeGreaterThan(20)
  await page.mouse.move(pts[0][0], pts[0][1])
  await page.mouse.down()
  for (const [x, y] of pts) await page.mouse.move(x, y)
  await page.mouse.up()
  await expect(page.getByTestId('trace-good')).toBeVisible()
  await page.waitForTimeout(400)
  await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/trace-kids-mobile.png` : undefined })

  // words and numbers come from the book text too
  await page.getByTestId('trace-tab-words').click()
  await expect(page.getByTestId('trace-canvas')).toBeVisible()
  await page.getByTestId('trace-tab-numbers').click()
  await expect(page.getByTestId('trace-canvas')).toHaveAttribute('aria-label', /^(٣|12)$/)
})

test('a unit with no text says so and invents nothing', async ({ page }) => {
  await seed(page, false)
  await page.goto('/#/kids/trace')
  await page.getByTestId('trace-unit').nth(1).click()
  await expect(page.getByTestId('trace-notext')).toBeVisible()
  await expect(page.getByTestId('trace-canvas')).toHaveCount(0)
})
