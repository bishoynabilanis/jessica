import { test, expect, type Page } from '@playwright/test'
import {
  CHAT_LINK_LIMIT,
  QR_LINK_LIMIT,
  decodeAnyAssignment,
  decodePack,
  encodeAssignment,
  fitPack,
  type AssignmentPayload,
} from '../../src/lib/assignments'

const BASE = 'http://localhost/jessica/'

// Varied Arabic-looking text that deflate cannot squeeze much, like a real unit.
function words(seed: number, n: number) {
  let x = seed * 9301 + 49297
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    x = (x * 233280 + 12345) % 2147483647
    out.push(String.fromCharCode(0x0621 + (x % 26), 0x0621 + ((x >> 5) % 26), 0x0621 + ((x >> 9) % 26), 0x0621 + ((x >> 13) % 26)))
  }
  return out.join(' ')
}

function question(i: number, long = false) {
  return {
    question: `Question ${i}: ${long ? words(i, 14) : 'which part of the plant makes food by using sunlight?'}`,
    options: ['The leaf', long ? words(i + 50, 5) : 'The root', long ? words(i + 70, 5) : 'The stem', long ? words(i + 90, 5) : 'The seed'],
    answer: 0,
    explanation: long ? words(i + 10, 28) : 'The leaf.',
    topic: 'plants',
    difficulty: 'easy' as const,
  }
}

function pack(nq: number, nc: number, long = false): AssignmentPayload {
  return {
    v: 2,
    id: 'as_test',
    subject: 'Science',
    bookTitle: 'Science Grade 7',
    unitTitle: 'Unit 1: Plants',
    unitKey: 'b1:u1',
    questions: Array.from({ length: nq }, (_, i) => question(i + 1, long)),
    cards: Array.from({ length: nc }, (_, i) => ({ front: `Term ${i + 1}`, back: long ? words(i + 200, 22) : `Meaning of term ${i + 1} from page ${i + 3}.` })),
    createdAt: 1,
  }
}

test('pack link round trips and old plain links still open', () => {
  const full = pack(8, 8)
  const fit = fitPack(full, CHAT_LINK_LIMIT, BASE)
  expect(fit.droppedCards + fit.droppedQuestions).toBe(0)
  const code = fit.link.split('p=')[1]
  expect(decodePack(code)?.cards).toHaveLength(8)
  const old = { ...full, v: 1 as const, cards: undefined }
  const opened = decodeAnyAssignment('', encodeAssignment(old))
  expect(opened?.questions).toHaveLength(8)
  expect(opened?.cards).toBeUndefined()
})

test('a big pack is trimmed to fit a QR and says what was dropped', () => {
  const big = pack(15, 8, true)
  const chat = fitPack(big, CHAT_LINK_LIMIT, BASE)
  const qr = fitPack(big, QR_LINK_LIMIT, BASE)
  expect(chat.link.length).toBeLessThanOrEqual(CHAT_LINK_LIMIT)
  expect(qr.link.length).toBeLessThanOrEqual(QR_LINK_LIMIT)
  expect(qr.droppedCards + qr.droppedQuestions + (qr.explanations ? 0 : 1)).toBeGreaterThan(0)
  expect(qr.payload.questions.length).toBeGreaterThanOrEqual(4)
  expect(chat.payload.questions.length).toBeGreaterThanOrEqual(qr.payload.questions.length)
  // The pack never contains a personal field.
  expect(Object.keys(qr.payload).sort()).toEqual(['bookTitle', 'cards', 'createdAt', 'id', 'questions', 'subject', 'unitKey', 'unitTitle', 'v'])
})

async function seedProfile(page: Page, language: string, apiKey: string) {
  await page.addInitScript(
    ({ language, apiKey }) => {
      if (window.localStorage.getItem('jessica-profile-v1')) return
      window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: {
            onboarded: true, acceptedTerms: 1, name: 'Teacher', apiKey,
            aiKeys: { gemini: apiKey, openai: '', anthropic: '', openrouter: '', custom: '' },
            model: 'gemini-1.5-flash', xp: 1, streak: 1, coins: 0,
            customBooks: [{ id: 'b1', title: 'Science Grade 7', subject: 'Science', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [{ id: 'u1', title: 'Unit 1: Plants', startPage: 1, endPage: 3 }] }],
            completedTopics: [], skillStats: {}, mistakes: [],
            settings: { language, gradeLevel: 7, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false },
          },
          version: 3,
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
    },
    { language, apiKey },
  )
}

for (const [lang, width] of [['en', 1280], ['ar', 390]] as const) {
  test(`teacher builds a pack with cards, students study then take the quiz (${lang})`, async ({ page, context }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    await seedProfile(page, lang, 'test-key')
    const prompts: string[] = []
    await page.route('**/generativelanguage.googleapis.com/**', (route) => {
      const body = route.request().postData() || ''
      prompts.push(body)
      const reply = /flashcards/i.test(body)
        ? { cards: Array.from({ length: 8 }, (_, i) => ({ front: `Term ${i + 1}`, back: `Meaning of term ${i + 1}.` })) }
        : { questions: Array.from({ length: 15 }, (_, i) => question(i + 1, true)) }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(reply) }] } }] }),
      })
    })
    await page.goto('./#/teacher')
    await page.waitForTimeout(800)
    await page.evaluate(async () => {
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('jessica-db', 1)
        req.onupgradeneeded = () => {
          const d = req.result
          if (!d.objectStoreNames.contains('cards')) {
            const s = d.createObjectStore('cards', { keyPath: 'id' })
            s.createIndex('due', 'due'); s.createIndex('bookId', 'bookId'); s.createIndex('subject', 'subject')
          }
          if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv')
          if (!d.objectStoreNames.contains('quizzes')) d.createObjectStore('quizzes', { keyPath: 'id' }).createIndex('createdAt', 'createdAt')
          if (!d.objectStoreNames.contains('exams')) d.createObjectStore('exams', { keyPath: 'id' })
        }
        req.onsuccess = () => {
          const tx = req.result.transaction('kv', 'readwrite')
          const pages = [1, 2, 3].map((page) => ({ page, text: `Plants make food in the leaf using sunlight. This is page ${page} of the unit about plants and photosynthesis.` }))
          tx.objectStore('kv').put({ bookId: 'b1', pages, text: pages.map((p) => p.text).join('\n'), extractedAt: 1 }, 'chapter:b1')
          tx.oncomplete = () => resolve()
          tx.onerror = () => reject(tx.error)
        }
        req.onerror = () => reject(req.error)
      })
    })
    await page.reload()
    await page.getByTestId('teacher-source-book').click()
    await expect(page.getByTestId('teacher-with-cards')).toBeChecked()
    await page.locator('select').filter({ hasText: '15' }).last().selectOption('15')
    await page.getByTestId('teacher-generate').click()
    await expect(page.getByTestId('pack-size')).toBeVisible({ timeout: 15000 })
    // the card prompt carries the book-only rule
    expect(prompts.some((p) => p.includes('Use ONLY facts written in the textbook pages'))).toBe(true)
    await page.getByTestId('pack-size').scrollIntoViewIfNeeded()
    await page.screenshot({ path: `test-results/pack-teacher-${lang}.png`, fullPage: true })
    const link = await page.locator('input[readonly]').first().inputValue()
    expect(link).toContain('#/assign?p=')
    expect(link.length).toBeLessThanOrEqual(CHAT_LINK_LIMIT)

    // a student on another device (no key, no profile) opens the link
    const student = await context.newPage()
    await student.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    await seedProfile(student, lang, '')
    await student.goto(link.replace(/^https?:\/\/[^#]+/, './'))
    await expect(student.getByTestId('pack-start')).toBeVisible()
    await student.getByTestId('pack-start').click()
    await expect(student.getByTestId('pack-cards')).toBeVisible()
    await expect(student.getByTestId('pack-card')).toContainText('Term 1')
    await student.getByTestId('pack-card').click()
    await expect(student.getByTestId('pack-card')).toContainText('Meaning of term 1')
    await student.screenshot({ path: `test-results/pack-student-${lang}.png`, fullPage: true })
    const n = await student.getByTestId('pack-next').count()
    for (let i = 0; i < 7 && n; i++) await student.getByTestId('pack-next').click()
    await student.getByTestId('pack-begin-quiz').click()
    await expect(student.locator('button', { has: student.locator('span.leading-relaxed', { hasText: /^The leaf$/ }) }).first()).toBeVisible()
  })
}

test('an old plain assignment link still opens with the quiz only', async ({ page }) => {
  await seedProfile(page, 'en', '')
  const old = { ...pack(5, 0), v: 1 as const, cards: undefined }
  await page.goto(`./#/assign?d=${encodeAssignment(old)}`)
  await expect(page.getByTestId('pack-start')).toContainText(/Start assignment/)
  await page.getByTestId('pack-start').click()
  await expect(page.getByTestId('pack-cards')).toHaveCount(0)
  await expect(page.getByText('Question 1:')).toBeVisible()
})
