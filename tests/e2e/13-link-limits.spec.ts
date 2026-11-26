import { test, expect } from '@playwright/test'
import { deflateSync, strToU8 } from 'fflate'

// Links come from anyone. They must be capped and checked before anything is shown.
const q = (n: number) => ({ question: `Question ${n}?`, options: ['a', 'b', 'c', 'd'], answer: 1, explanation: '' })

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('jessica-profile-v1')) return
    localStorage.setItem('jessica-profile-v1', JSON.stringify({ state: { onboarded: true, acceptedTerms: 1, name: 'T', apiKey: '', customBooks: [{ id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 9, term: 'Term 1', pageCount: 30, custom: true, units: [] }], completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {}, settings: { language: 'en', gradeLevel: 9, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false, sound: false, aiMode: 'cloud' } }, version: 3 }))
    localStorage.setItem('jessica-disclaimer-v1', '1')
  })
})

test('a battle link with hundreds of questions keeps only the first 60', async ({ page }) => {
  const payload = { v: 1, id: 'b-1', subject: 'Mathematics', challenger: 'Omar', target: 1, questions: Array.from({ length: 300 }, (_, i) => q(i)) }
  await page.goto(`./#/battle?d=${Buffer.from(JSON.stringify(payload)).toString('base64url')}`)
  await expect(page.getByText(/60 questions/)).toBeVisible()
})

test('an assignment link drops broken questions and caps the rest', async ({ page }) => {
  const bad = [{ question: 'x', options: ['only one'], answer: 0 }, { question: 'y', options: ['a', 'b'], answer: 9 }, 7, null]
  const payload = { v: 1, id: 'a-1', subject: 'Mathematics', bookTitle: 'Maths', unitTitle: 'U', unitKey: 'u', createdAt: 1, questions: [...bad, ...Array.from({ length: 100 }, (_, i) => q(i))] }
  await page.goto(`./#/assign?d=${Buffer.from(JSON.stringify(payload)).toString('base64url')}`)
  await expect(page.getByText(/60 questions/)).toBeVisible()
})

test('a tiny compressed link that expands to a huge payload is refused', async ({ page }) => {
  const huge = JSON.stringify({ title: 't', subject: 'Mathematics', minutes: 5, questions: [q(1)], pad: 'a'.repeat(5_000_000) })
  const code = Buffer.from(deflateSync(strToU8(huge))).toString('base64url')
  expect(code.length).toBeLessThan(60_000)
  await page.goto(`/#/school-exam?share=${code}`)
  await page.waitForTimeout(800)
  await expect(page.getByTestId('school-row')).toHaveCount(0)
})

test('a link that is far too long is refused without freezing the page', async ({ page }) => {
  await page.goto(`./#/battle?d=${'A'.repeat(200_000)}`)
  await page.waitForTimeout(800)
  await expect(page.locator('#root > *').first()).toBeVisible()
})
