import fs from 'node:fs'
import { chromium } from 'playwright'

/**
 * Clean capture for the Remotion hybrid: no captions, no intro/end cards.
 * Only the app + tap ripples, so Remotion can own the typography.
 */
const BASE = process.env.DEMO_URL || 'http://127.0.0.1:4175'
const RAW = '/tmp/jessica-hybrid'

fs.rmSync(RAW, { recursive: true, force: true })
fs.mkdirSync(RAW, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({
  viewport: { width: 540, height: 960 },
  deviceScaleFactor: 2,
  recordVideo: { dir: RAW, size: { width: 540, height: 960 } },
})

await context.addInitScript(() => {
  if (localStorage.getItem('jessica-profile-v1')) return
  const book = {
    id: 'b1', title: 'رياضيات', subject: 'Mathematics', language: 'ar', emoji: '📘',
    accent: '#21e6c9', term: 'الترم الأول', description: '', file: '', pageCount: 60,
    grade: 7, custom: true, units: [],
  }
  localStorage.setItem('jessica-profile-v1', JSON.stringify({
    state: {
      onboarded: true, acceptedTerms: 1, name: 'مينا', apiKey: '', model: 'gemini-1.5-flash',
      xp: 420, streak: 5, coins: 9, customBooks: [book], completedTopics: [], skillStats: {},
      mistakes: [], dailyLog: {},
      settings: {
        language: 'ar', gradeLevel: 7, curriculum: 'egypt', schoolType: 'government',
        primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true,
        quickStart: false, sound: false, aiMode: 'cloud',
      },
    },
    version: 3,
  }))
  localStorage.setItem('jessica-disclaimer-v1', '1')
})

const warm = await context.newPage()
for (const route of ['#/labs', '#/library', '#/bank']) {
  await warm.goto(`${BASE}/${route}`, { waitUntil: 'load' })
  await warm.waitForTimeout(700)
}
await warm.evaluate(() => localStorage.removeItem('jessica-last-route'))
await warm.close()

const page = await context.newPage()
await page.goto(`${BASE}/#/labs`, { waitUntil: 'load' })
await page.waitForTimeout(700)

await page.evaluate(() => {
  const style = document.createElement('style')
  style.textContent = `
    .demo-ripple { position: fixed; z-index: 2147483001; width: 54px; height: 54px; margin: -27px 0 0 -27px;
      border-radius: 999px; border: 2px solid rgba(33,230,201,.9); background: rgba(33,230,201,.16);
      pointer-events: none; animation: demoRipple .55s ease-out forwards; }
    @keyframes demoRipple { from { transform: scale(.35); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }
  `
  document.head.appendChild(style)
  document.addEventListener('pointerdown', (event) => {
    const dot = document.createElement('span')
    dot.className = 'demo-ripple'
    dot.style.left = `${event.clientX}px`
    dot.style.top = `${event.clientY}px`
    document.body.appendChild(dot)
    setTimeout(() => dot.remove(), 600)
  }, true)
})

const smoothTo = async (locator) => {
  await locator.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  await page.waitForTimeout(850)
}

// Scene 1 — hub (hold)
await page.waitForTimeout(900)
await page.getByTestId('lab-filter-all').click()
await page.waitForTimeout(1600)

// Scene 2 — water cycle
const water = page.getByRole('button', { name: /معمل دورة المية/ })
await smoothTo(water)
await water.click()
await page.waitForTimeout(900)
await page.getByTestId('cycle-heat').fill('100')
await page.waitForFunction(
  () => (document.querySelector('[data-testid="cycle-state"]')?.textContent || '').includes('بتمطر'),
  null,
  { timeout: 16000 },
)
await page.waitForTimeout(1200)

// Scene 3 — binary
await page.evaluate(() => {
  location.hash = '#/labs'
  window.scrollTo(0, 0)
})
await page.waitForTimeout(600)
const binary = page.getByRole('button', { name: /معمل النظام الثنائي/ })
await smoothTo(binary)
await binary.click()
await page.waitForTimeout(900)
await page.getByTestId('binary-bit-1').click()
await page.getByTestId('binary-bit-7').click()
await page.waitForTimeout(2800)

const video = page.video()
await context.close()
await browser.close()
console.log(await video.path())
