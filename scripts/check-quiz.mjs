import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://127.0.0.1:4173'
const grades = ['primary-1', 'primary-2', 'primary-3', 'primary-4', 'primary-5', 'primary-6', 'prep-1', 'prep-2', 'prep-3']
const browser = await chromium.launch({ channel: process.env.CI ? undefined : 'chrome' })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
let failures = 0

for (const grade of grades) {
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(`${BASE}/welcome/quiz/${grade}/`, { waitUntil: 'networkidle' })

  await page.click('#quiz-start-btn')
  let correctCount = 0
  for (let i = 0; i < 10; i++) {
    const prompt = await page.textContent('#quiz-prompt')
    if (!prompt || !prompt.trim()) throw new Error(`${grade}: empty prompt at ${i}`)
    const choices = page.locator('.quiz-choice')
    const n = await choices.count()
    if (n !== 4) throw new Error(`${grade}: ${n} choices at ${i}`)
    // deliberately pick the correct answer to also verify the marking logic
    const correct = page.locator('.quiz-choice[data-correct="1"]')
    const before = await page.locator('.quiz-choice.is-correct').count()
    await correct.click()
    await page.waitForSelector('#quiz-feedback:not([hidden])')
    const after = await page.locator('.quiz-choice.is-correct').count()
    if (after !== before + 1) throw new Error(`${grade}: correct choice not highlighted at ${i}`)
    const text = await page.textContent('#quiz-feedback')
    if (!text.includes('صح')) throw new Error(`${grade}: feedback not "صح" at ${i}: ${text}`)
    correctCount++
    await page.click('#quiz-next')
  }
  const score = (await page.textContent('#quiz-score')).trim()
  const share = await page.getAttribute('#quiz-share', 'href')
  const hasWa = share && share.startsWith('https://wa.me/?text=')
  const ok = score === '١٠/١٠' && hasWa && errors.length === 0
  if (!ok) failures++
  console.log(`${grade}: score=${score} share=${hasWa} errors=${errors.length} ${ok ? 'OK' : 'FAIL ' + errors.join(' | ')}`)
  await page.close()
}

// mobile screenshot of the result state
const page = await ctx.newPage()
await page.setViewportSize({ width: 390, height: 844 })
await page.goto(`${BASE}/welcome/quiz/prep-3/`, { waitUntil: 'networkidle' })
await page.click('#quiz-start-btn')
for (let i = 0; i < 10; i++) {
  await page.locator('.quiz-choice').first().click()
  await page.waitForSelector('#quiz-feedback:not([hidden])')
  await page.click('#quiz-next')
}
await page.screenshot({ path: '/tmp/quiz-result-mobile.png', fullPage: true })
await page.goto(`${BASE}/welcome/quiz/`, { waitUntil: 'networkidle' })
await page.screenshot({ path: '/tmp/quiz-index.png', fullPage: true })

await browser.close()
console.log(failures === 0 ? 'ALL QUIZ CHECKS PASSED' : `${failures} GRADE(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
