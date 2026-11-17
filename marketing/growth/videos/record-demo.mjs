import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE = process.env.DEMO_URL || 'http://127.0.0.1:4175'
const OUT = 'marketing/growth/videos'
const RAW = '/tmp/jessica-demo-raw'

fs.rmSync(RAW, { recursive: true, force: true })
fs.mkdirSync(RAW, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({
  viewport: { width: 540, height: 960 },
  deviceScaleFactor: 2,
  recordVideo: { dir: RAW, size: { width: 540, height: 960 } },
})
const page = await context.newPage()

await page.addInitScript(() => {
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

await page.goto(`${BASE}/#/`, { waitUntil: 'load' })
await page.waitForTimeout(900)

async function setupOverlay() {
  await page.evaluate(() => {
    const style = document.createElement('style')
    style.textContent = `
      #demo-cap { position: fixed; left: 12px; right: 12px; top: 70px; z-index: 2147483000;
        padding: 9px 16px; pointer-events: none; text-align: center; border-radius: 16px;
        font-family: 'Cairo', 'Segoe UI', system-ui, sans-serif;
        background: #080d1a; border: 1px solid rgba(33,230,201,.45);
        box-shadow: 0 10px 30px rgba(0,0,0,.35); opacity: 0; transition: opacity .25s ease; }
      #demo-cap.on { opacity: 1; }
      #demo-cap em { display: block; font-style: normal; font-size: 8px; letter-spacing: .3em; color: #21e6c9; font-weight: 800; margin-bottom: 2px; }
      #demo-cap b { display: block; font-size: 16px; line-height: 1.5; font-weight: 800; color: #fff; }
      #demo-cap i { display: block; position: absolute; bottom: -1px; left: 12px; right: 12px; height: 2px; background: linear-gradient(90deg,#21e6c9,#6b8cff); width: 0; transition: width .3s ease; }
      .demo-ripple { position: fixed; z-index: 2147483001; width: 54px; height: 54px; margin: -27px 0 0 -27px;
        border-radius: 999px; border: 2px solid rgba(33,230,201,.9); background: rgba(33,230,201,.18);
        pointer-events: none; animation: demoRipple .55s ease-out forwards; }
      @keyframes demoRipple { from { transform: scale(.35); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }
      #demo-intro, #demo-end { position: fixed; inset: 0; z-index: 2147482999; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 14px; text-align: center; padding: 40px;
        font-family: 'Cairo', 'Segoe UI', system-ui, sans-serif; color: #fff;
        background: radial-gradient(700px 620px at 90% 0%, rgba(107,140,255,.35), transparent 60%),
                    radial-gradient(700px 620px at 0% 100%, rgba(33,230,201,.22), transparent 60%),
                    linear-gradient(165deg, #05080f, #0a1020 60%, #0b1428);
        transition: opacity .45s ease; }
      #demo-intro.out, #demo-end.out { opacity: 0; pointer-events: none; }
      #demo-intro .j, #demo-end .j { width: 86px; height: 86px; border-radius: 26px; display: grid; place-items: center;
        background: linear-gradient(135deg,#21e6c9,#6b8cff); color: #061018; font-size: 42px; font-weight: 900; }
      #demo-intro h2, #demo-end h2 { font-size: 38px; font-weight: 900; margin: 0; }
      #demo-intro p, #demo-end p { font-size: 19px; font-weight: 700; color: #b9c7e4; margin: 0; line-height: 1.8; }
      #demo-end .chips { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 6px; }
      #demo-end .chip { border: 1px solid rgba(33,230,201,.4); background: rgba(33,230,201,.12); color: #8ff5e4;
        border-radius: 999px; padding: 7px 14px; font-size: 14px; font-weight: 800; }
      #demo-end .link { direction: ltr; color: #21e6c9; font-size: 14px; font-weight: 800; margin-top: 10px; }
    `
    document.head.appendChild(style)

    const cap = document.createElement('div')
    cap.id = 'demo-cap'
    cap.innerHTML = '<i></i><em>JESSICA</em><b></b>'
    document.body.appendChild(cap)

    const intro = document.createElement('div')
    intro.id = 'demo-intro'
    intro.innerHTML = '<span class="j">J</span><h2>جيسيكا</h2><p>جولة سريعة في المعامل<br>٣٩ تجربة على جهازك</p>'
    document.body.appendChild(intro)

    window.__caption = (text, progress = 0) => {
      const bar = document.getElementById('demo-cap')
      if (!bar) return
      bar.querySelector('b').textContent = text
      bar.querySelector('i').style.width = `${Math.round(progress * 100)}%`
      bar.classList.add('on')
    }
    window.__hideCaption = () => document.getElementById('demo-cap')?.classList.remove('on')
    window.__end = () => {
      document.getElementById('demo-cap')?.classList.remove('on')
      const end = document.createElement('div')
      end.id = 'demo-end'
      end.innerHTML = `
        <span class="j">J</span>
        <h2>جرّبها بنفسك</h2>
        <p>كل الكتب والخطة والمعامل<br>على جهازك، بدون حساب</p>
        <div class="chips"><span class="chip">مجاني</span><span class="chip">أوفلاين</span><span class="chip">بدون تسجيل</span></div>
        <span class="link">bishoynabilanis.github.io/jessica</span>`
      document.body.appendChild(end)
      requestAnimationFrame(() => requestAnimationFrame(() => end.classList.remove('out')))
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
}

const caption = (text, progress) => page.evaluate(([t, p]) => window.__caption(t, p), [text, progress])

async function smoothTo(locator) {
  await locator.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  await page.waitForTimeout(900)
}

await setupOverlay()
await page.waitForTimeout(2100)
await page.evaluate(() => document.getElementById('demo-intro')?.classList.add('out'))
await page.waitForTimeout(450)

await caption('كل كتبك المدرسية + مدرّس ذكي + خطة يومية', 0.06)
await page.waitForTimeout(1900)

await page.evaluate(() => { location.hash = '#/labs' })
await page.waitForTimeout(1200)
await caption('٣٩ معملاً افتراضياً من الصف ١ إلى ٩', 0.16)
await page.waitForTimeout(700)

await page.getByTestId('lab-filter-all').click()
await page.waitForTimeout(900)

const water = page.getByRole('button', { name: /معمل دورة المية/ })
await smoothTo(water)
await water.click()
await page.waitForTimeout(900)
await caption('غيّر متغير واحد… وشوف النتيجة بعينك', 0.3)
await page.waitForTimeout(700)

await page.getByTestId('cycle-heat').fill('100')
await page.waitForFunction(
  () => document.querySelector('[data-testid="cycle-state"]')?.textContent?.includes('بتمطر'),
  null,
  { timeout: 16000 },
)
await caption('الحرارة بتبخّر المية… والسحابة بتمطر', 0.44)
await page.waitForTimeout(1500)

await smoothTo(page.getByTestId('lab-guide-option-0'))
await page.getByTestId('lab-guide-option-0').click()
await page.waitForTimeout(700)
await caption('هدف → توقّع → تجربة → شرح', 0.56)
await page.waitForTimeout(1500)

const binary = page.getByRole('button', { name: /معمل النظام الثنائي/ })
await smoothTo(binary)
await binary.click()
await page.waitForTimeout(850)
await caption('ومن العلوم للبرمجة: ٦٥ = الحرف A', 0.72)
await page.waitForTimeout(500)

await page.getByTestId('binary-bit-1').click()
await page.getByTestId('binary-bit-7').click()
await page.waitForTimeout(1200)
await caption('كل معمل بيدّي XP… وكل حاجة أوفلاين', 0.86)
await page.waitForTimeout(1500)

await page.evaluate(() => window.__end())
await page.waitForTimeout(3400)

const video = page.video()
await context.close()
await browser.close()

const rawPath = await video.path()
console.log(rawPath)
