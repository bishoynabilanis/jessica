import fs from 'node:fs'
import { chromium } from 'playwright'

/**
 * Narrated explainer in the reference style: big headline, real screen, chapters.
 * Narration segments are produced by /tmp/make_narration.py (edge-tts, ar-EG-Shakir).
 */
const BASE = process.env.DEMO_URL || 'http://127.0.0.1:4175'
const NARRATION = '/tmp/jessica-narration'
const RAW = '/tmp/jessica-explainer'
const GAP = 450

const rows = JSON.parse(fs.readFileSync(`${NARRATION}/durations.json`, 'utf8'))
const durations = Object.fromEntries(rows.map((row) => [row.index, Math.round(row.duration * 1000)]))
const scene = (index) => durations[index] + GAP

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
for (const route of ['#/labs', '#/library', '#/bank', '#/focus', '#/plan']) {
  await warm.goto(`${BASE}/${route}`, { waitUntil: 'load' })
  await warm.waitForTimeout(700)
}
await warm.evaluate(() => localStorage.removeItem('jessica-last-route'))
await warm.close()

const page = await context.newPage()
await page.goto(`${BASE}/#/`, { waitUntil: 'load' })
await page.waitForTimeout(800)

await page.evaluate(() => {
  const style = document.createElement('style')
  style.textContent = `
    #demo-title { position: fixed; left: 14px; right: 14px; top: 64px; z-index: 2147483000;
      padding: 11px 18px 13px; border-radius: 20px; text-align: center;
      background: rgba(5,8,15,.94); border: 1px solid rgba(255,255,255,.09);
      box-shadow: 0 16px 40px rgba(0,0,0,.45); opacity: 0; transform: translateY(-6px);
      transition: opacity .25s ease, transform .25s ease;
      font-family: 'Cairo', 'Segoe UI', system-ui, sans-serif; color: #fff; }
    #demo-title.on { opacity: 1; transform: none; }
    #demo-title em { display: block; font-style: normal; font-size: 9px; letter-spacing: .34em; color: #21e6c9; font-weight: 800; margin-bottom: 4px; }
    #demo-title h2 { font-size: 27px; line-height: 1.42; font-weight: 900; margin: 0; }
    #demo-title .mint { color: #21e6c9; }
    #demo-title .violet { color: #9db0ff; }
    #demo-title .sun { color: #ffd166; }
    #demo-chapter { position: fixed; left: 0; right: 0; bottom: 0; z-index: 2147483000;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 10px 18px 20px; pointer-events: none;
      background: linear-gradient(0deg, rgba(5,8,15,.92), rgba(5,8,15,0));
      font-family: 'Cairo', system-ui, sans-serif; color: #9fb2d8; font-size: 11px; font-weight: 800; }
    #demo-chapter .bar { flex: 1; height: 3px; border-radius: 999px; background: rgba(255,255,255,.12); overflow: hidden; }
    #demo-chapter .bar i { display: block; height: 100%; width: 0; background: linear-gradient(90deg,#21e6c9,#6b8cff); transition: width .35s ease; }
    #demo-net { position: fixed; top: 18px; right: 18px; z-index: 2147483002; display: none;
      align-items: center; gap: 6px; border-radius: 999px; padding: 6px 12px;
      background: rgba(255,122,138,.16); border: 1px solid rgba(255,122,138,.5); color: #ffb3bd;
      font-family: 'Cairo', system-ui, sans-serif; font-size: 11px; font-weight: 800; }
    #demo-net.on { display: flex; }
    .demo-ripple { position: fixed; z-index: 2147483001; width: 54px; height: 54px; margin: -27px 0 0 -27px;
      border-radius: 999px; border: 2px solid rgba(33,230,201,.9); background: rgba(33,230,201,.16);
      pointer-events: none; animation: demoRipple .55s ease-out forwards; }
    @keyframes demoRipple { from { transform: scale(.35); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }
    #demo-end { position: fixed; inset: 0; z-index: 2147483003; display: none; flex-direction: column;
      align-items: center; justify-content: center; gap: 14px; text-align: center; padding: 40px;
      font-family: 'Cairo', system-ui, sans-serif; color: #fff;
      background: radial-gradient(700px 620px at 90% 0%, rgba(107,140,255,.35), transparent 60%),
                  radial-gradient(700px 620px at 0% 100%, rgba(33,230,201,.22), transparent 60%),
                  linear-gradient(165deg, #05080f, #0a1020 60%, #0b1428); }
    #demo-end.on { display: flex; }
    #demo-end .j { width: 86px; height: 86px; border-radius: 26px; display: grid; place-items: center;
      background: linear-gradient(135deg,#21e6c9,#6b8cff); color: #061018; font-size: 42px; font-weight: 900; }
    #demo-end h2 { font-size: 38px; font-weight: 900; margin: 0; }
    #demo-end p { font-size: 18px; font-weight: 700; color: #b9c7e4; margin: 0; line-height: 1.8; }
    #demo-end .chips { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 4px; }
    #demo-end .chip { border: 1px solid rgba(33,230,201,.4); background: rgba(33,230,201,.12); color: #8ff5e4;
      border-radius: 999px; padding: 7px 14px; font-size: 14px; font-weight: 800; }
    #demo-end .link { direction: ltr; color: #21e6c9; font-size: 14px; font-weight: 800; margin-top: 10px; }
  `
  document.head.appendChild(style)

  const title = document.createElement('div')
  title.id = 'demo-title'
  title.innerHTML = '<em>JESSICA</em><h2></h2>'
  document.body.appendChild(title)

  const chapter = document.createElement('div')
  chapter.id = 'demo-chapter'
  chapter.innerHTML = '<span class="label"></span><span class="bar"><i></i></span><span class="count"></span>'
  document.body.appendChild(chapter)

  const net = document.createElement('div')
  net.id = 'demo-net'
  net.textContent = 'بدون إنترنت'
  document.body.appendChild(net)

  window.__title = (html) => {
    const box = document.getElementById('demo-title')
    box.querySelector('h2').innerHTML = html
    box.classList.add('on')
  }
  window.__chapter = (index, total, label) => {
    const box = document.getElementById('demo-chapter')
    const count = box.querySelector('.count')
    count.setAttribute('dir', 'ltr')
    count.textContent = `${index} / ${total}`
    box.querySelector('.label').textContent = label
    box.querySelector('.bar i').style.width = `${Math.round((index / total) * 100)}%`
  }
  window.__net = (on) => document.getElementById('demo-net')?.classList.toggle('on', on)
  window.__end = () => {
    document.getElementById('demo-title')?.classList.remove('on')
    const end = document.createElement('div')
    end.id = 'demo-end'
    end.innerHTML = `
      <span class="j">J</span>
      <h2>جرّبها بنفسك</h2>
      <p>ابدأ بكتاب واحد…<br>وكل حاجة على جهازك</p>
      <div class="chips"><span class="chip">مجاني</span><span class="chip">أوفلاين</span><span class="chip">بدون حساب</span></div>
      <span class="link">bishoynabilanis.github.io/jessica</span>`
    document.body.appendChild(end)
    requestAnimationFrame(() => end.classList.add('on'))
  }

  document.addEventListener('pointerdown', (event) => {
    const dot = document.createElement('span')
    dot.className = 'demo-ripple'
    dot.style.left = `${event.clientX}px`
    dot.style.top = `${event.clientY}px`
    document.body.appendChild(dot)
    setTimeout(() => dot.remove(), 600)
  }, true)
})

const title = (html) => page.evaluate((value) => window.__title(value), html)
const chapter = (index, total, label) => page.evaluate(([i, t, l]) => window.__chapter(i, t, l), [index, total, label])
const net = (on) => page.evaluate((value) => window.__net(value), on)
const go = async (hash, wait = 300) => {
  await page.evaluate((next) => {
    location.hash = next
    window.scrollTo(0, 0)
  }, hash)
  await page.locator('h1').first().waitFor({ timeout: 9000 }).catch(() => {})
  await page.waitForTimeout(wait)
}
const smoothTo = async (locator) => {
  await locator.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  await page.waitForTimeout(850)
}
const waitLeft = async (started, budget) => {
  const left = budget - (Date.now() - started)
  if (left > 0) await page.waitForTimeout(left)
}

// 1 — hook
{
  const started = Date.now()
  await page.evaluate(() => window.scrollTo(0, 0))
  await chapter(1, 6, 'البداية')
  await title('مفيش سيرفر.<br><span class="mint">مفيش حساب.</span>')
  await page.waitForTimeout(2600)
  await page.evaluate(() => window.scrollTo({ top: 420, behavior: 'smooth' }))
  await page.waitForTimeout(1400)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  await waitLeft(started, scene(1))
}

// 2 — books
{
  const started = Date.now()
  await chapter(2, 6, 'كتب الوزارة')
  await title('<span class="violet">كتب الوزارة.</span><br>ومدرّس ذكي.')
  await go('#/library', 250)
  await page.waitForTimeout(1100)
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'smooth' }))
  await page.waitForTimeout(1700)
  await page.evaluate(() => window.scrollTo({ top: 840, behavior: 'smooth' }))
  await waitLeft(started, scene(2))
}

// 3 — question bank
{
  const started = Date.now()
  await chapter(3, 6, 'بنك الأسئلة')
  await title('أسئلة جديدة…<br><span class="sun">تصحيح وشرح.</span>')
  await go('#/bank', 350)
  await page.waitForTimeout(1200)
  await page.getByTestId('bank-start').click()
  await page.waitForTimeout(1700)
  await page.getByTestId('bank-option').first().click()
  await page.waitForTimeout(600)
  await page.evaluate(() => window.scrollBy({ top: 430, behavior: 'smooth' }))
  await page.waitForTimeout(1300)
  await waitLeft(started, scene(3))
}

// 4 — labs
{
  const started = Date.now()
  await chapter(4, 6, 'المعامل')
  await title('<span class="mint">٣٩ معملاً</span><br>من الصف ١ لـ٩.')
  await go('#/labs', 350)
  await page.waitForTimeout(800)
  await page.getByTestId('lab-filter-all').click()
  await page.waitForTimeout(500)
  const water = page.getByRole('button', { name: /معمل دورة المية/ })
  await smoothTo(water)
  await water.click()
  await page.waitForTimeout(800)
  await page.getByTestId('cycle-heat').fill('100')
  await page.waitForFunction(
    () => (document.querySelector('[data-testid="cycle-state"]')?.textContent || '').includes('بتمطر'),
    null,
    { timeout: 14000 },
  )
  await page.waitForTimeout(1100)
  await waitLeft(started, scene(4))
}

// 5 — plan
{
  const started = Date.now()
  await chapter(5, 6, 'الخطة')
  await title('خطة يومية<br><span class="violet">على قد وقتك.</span>')
  await go('#/plan', 300)
  await page.waitForTimeout(1100)
  await page.evaluate(() => window.scrollTo({ top: 260, behavior: 'smooth' }))
  await waitLeft(started, scene(5))
}

// 6 — offline
{
  const started = Date.now()
  await chapter(6, 6, 'أوفلاين')
  await title('كل ده…<br><span class="sun">أوفلاين.</span>')
  await context.setOffline(true)
  await net(true)
  await page.waitForTimeout(450)
  await go('#/library', 300)
  await page.waitForTimeout(1900)
  await page.evaluate(() => window.scrollTo({ top: 380, behavior: 'smooth' }))
  await page.waitForTimeout(1200)
  await context.setOffline(false)
  await net(false)
  await waitLeft(started, scene(6))
}

// 7 — end card
{
  await page.evaluate(() => window.__end())
  await page.waitForTimeout(durations[7] + 2600)
}

const video = page.video()
await context.close()
await browser.close()
console.log(await video.path())
