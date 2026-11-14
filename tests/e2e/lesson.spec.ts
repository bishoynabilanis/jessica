import { test, expect, type Page } from '@playwright/test'

const book = {
  id: 'lesson-book',
  title: 'Science Book',
  subject: 'Science',
  grade: 7,
  term: 'Term 1',
  pageCount: 4,
  custom: true,
  units: [{ id: 'u1', title: 'الضغط', startPage: 1, endPage: 2 }],
}

const profile = {
  state: {
    onboarded: true,
    acceptedTerms: 1,
    name: 'Tester',
    apiKey: '',
    model: 'gemini-1.5-flash',
    xp: 0,
    streak: 0,
    coins: 0,
    customBooks: [book],
    settings: {
      language: 'en',
      gradeLevel: 7,
      curriculum: 'egypt',
      schoolType: 'government',
      primaryUi: 'auto',
      aiProvider: 'gemini',
      theme: 'dark',
      keyOptional: true,
      quickStart: false,
    },
  },
  version: 3,
}

const chapter = {
  bookId: 'lesson-book',
  extractedAt: Date.now(),
  text: 'الضغط هو القوة المؤثرة على وحدة المساحة. الضغط يقاس بوحدة الباسكال. عندما تزيد القوة يزيد الضغط. المساحة الأكبر تقلل الضغط لأن الضغط يتوزع على مساحة أكبر.',
  pages: [
    {
      page: 1,
      text: 'الضغط هو القوة المؤثرة على وحدة المساحة. الضغط يقاس بوحدة الباسكال. عندما تزيد القوة يزيد الضغط.',
    },
    {
      page: 2,
      text: 'المساحة الأكبر تقلل الضغط لأن الضغط يتوزع على مساحة أكبر. في السوائل ينتقل الضغط في كل الاتجاهات.',
    },
  ],
}

async function seedProfile(page: Page) {
  await page.addInitScript((data) => {
    if (!window.localStorage.getItem('jessica-profile-v1')) {
      window.localStorage.setItem('jessica-profile-v1', JSON.stringify(data))
    }
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }, profile)
}

async function seedChapter(page: Page) {
  await page.goto('/#/library')
  await page.waitForTimeout(500)
  await page.evaluate(async (payload) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('jessica-db', 1)
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('kv')) request.result.createObjectStore('kv')
      }
      request.onsuccess = () => {
        const database = request.result
        const tx = database.transaction('kv', 'readwrite')
        tx.objectStore('kv').put(payload, `chapter:${payload.bookId}`)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      }
      request.onerror = () => reject(request.error)
    })
  }, chapter)
}

test('a unit becomes a four-step lesson that ends in a result', async ({ page }) => {
  await seedProfile(page)
  await seedChapter(page)
  await page.goto('/#/lesson/lesson-book/u1')

  // 1. Goals
  await expect(page.getByText('What you will learn')).toBeVisible()
  await expect(page.getByText('الضغط هو القوة المؤثرة على وحدة المساحة.').first()).toBeVisible()
  await page.getByTestId('lesson-next').click()

  // 2. Read
  await expect(page.getByText('Page 1 of 2')).toBeVisible()
  await expect(page.getByText('الضغط يقاس بوحدة الباسكال.')).toBeVisible()
  await page.getByTestId('lesson-next').click()

  // 3. Key terms
  await expect(page.getByText('Tap a card to see it in context')).toBeVisible()
  await expect(page.getByText('الضغط').first()).toBeVisible()
  await page.getByTestId('lesson-next').click()

  // 4. Check: the cloze questions come from the unit's own sentences
  const label = await page.getByText(/Question 1 of \d+/i).innerText()
  const total = Number(label.match(/of (\d+)/i)?.[1] || 0)
  expect(total).toBeGreaterThanOrEqual(2)
  for (let question = 1; question <= total; question += 1) {
    await expect(page.getByText(`Question ${question} of ${total}`)).toBeVisible()
    await page.getByTestId('lesson-option').first().click()
    await expect(page.getByText(/Correct|Not quite/).first()).toBeVisible()
    await page.getByTestId('lesson-next').click()
  }

  await expect(page.getByText(/Unit mastered!|Nearly there/)).toBeVisible()

  const state = await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    return raw ? JSON.parse(raw).state : {}
  })
  expect(state.lessonProgress['lesson-book:u1'].done).toBe(true)
  expect(Object.keys(state.skillStats).some((key) => key === 'Science|الضغط')).toBe(true)
})

test('a unit without extracted text asks the learner to open the book first', async ({ page }) => {
  await seedProfile(page)
  await page.goto('/#/lesson/lesson-book/u1')

  await page.getByTestId('lesson-next').click()
  await expect(page.getByText('This unit has no indexable text yet')).toBeVisible()
})

test('an unknown lesson id falls back to the library', async ({ page }) => {
  await seedProfile(page)
  await page.goto('/#/lesson/missing-book/missing-unit')
  await expect(page.getByText('This lesson is not in your library')).toBeVisible()
  await expect(page.getByRole('button', { name: /Open library/ })).toBeVisible()
})
