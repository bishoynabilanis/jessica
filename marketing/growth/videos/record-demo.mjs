// OLD, do not use: numbers here (38 books, +70 features) are outdated. Current: 61 Ministry books (Term 1, Arabic/English/French editions), 50+ screens and tools.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

/**
 * Records the app with Playwright and writes an MP4-ready webm.
 * Usage: DEMO=labs-ar|lab-en|tour-ar node marketing/growth/videos/record-demo.mjs
 */
const VARIANT = process.env.DEMO || 'labs-ar'
const BASE = process.env.DEMO_URL || 'http://127.0.0.1:4175'

const CONFIGS = {
  'labs-ar': {
    lang: 'ar',
    output: 'labs-demo.mp4',
    introTitle: 'جيسيكا',
    introLines: ['جولة سريعة في المعامل', '٣٩ تجربة على جهازك'],
    endTitle: 'جرّبها بنفسك',
    endLines: ['كل الكتب والخطة والمعامل', 'على جهازك، بدون حساب'],
    chips: ['مجاني', 'أوفلاين', 'بدون تسجيل'],
    captions: {
      home: 'كل كتبك المدرسية + مدرّس ذكي + خطة يومية',
      labs: '٣٩ معملاً افتراضياً من الصف ١ إلى ٩',
      change: 'غيّر متغير واحد… وشوف النتيجة بعينك',
      rain: 'الحرارة بتبخّر المية… والسحابة بتمطر',
      flow: 'هدف → توقّع → تجربة → شرح',
      next: 'نفس الفكرة… في ٣٩ معمل',
      binary: 'ومن العلوم للبرمجة: ٦٥ = الحرف A',
      xp: 'كل معمل بيدّي XP… وكل حاجة أوفلاين',
    },
    labs: { water: /معمل دورة المية/, binary: /معمل النظام الثنائي/, pressure: /معمل الضغط/ },
  },
  'labs-en': {
    lang: 'en',
    output: 'labs-demo-en.mp4',
    introTitle: 'Jessica',
    introLines: ['A quick tour of the labs', '39 experiments on your device'],
    endTitle: 'Try it yourself',
    endLines: ['Every book, plan and lab', 'on your device, no account'],
    chips: ['Free', 'Offline', 'No sign-up'],
    captions: {
      home: 'Your books, a smart tutor and a daily plan',
      labs: '39 virtual labs, grade 1 to grade 9',
      change: 'Change one variable… watch the result',
      rain: 'Heat evaporates the sea… the cloud rains',
      flow: 'Goal → predict → experiment → explain',
      next: 'One pattern… thirty-nine labs',
      binary: 'From science to coding: 65 = the letter A',
      xp: 'Every lab earns XP — and works offline',
    },
    labs: { water: /Water cycle lab/, binary: /Binary lab/, pressure: /Pressure lab/ },
  },
  'tour-ar': {
    lang: 'ar',
    output: 'full-tour-ar.mp4',
    introTitle: 'جيسيكا',
    introLines: ['جولة كاملة في التطبيق', 'كتب · خطة · امتحانات · معامل'],
    endTitle: 'ابدأ من كتابك',
    endLines: ['نزّل كتاب الوزارة مرة واحدة', 'وكل حاجة على جهازك'],
    chips: ['مجاني', 'أوفلاين', 'بدون حساب'],
    captions: {
      home: 'كل يومك الدراسي… في شاشة واحدة',
      plan: 'خطة يومية على قد وقتك',
      library: '٣٨ كتاب وزارة + أي PDF من جهازك',
      bank: 'بنك أسئلة… تدريب جديد كل مرة',
      answer: 'اختار إجابة… واقرأ السبب',
      focus: '٢٥ دقيقة تركيز… والدقايق بتتحول XP',
      today: 'مهام صغيرة… مبنية على أضعف مهاراتك',
      labs: '٣٩ معملاً افتراضياً من الصف ١ إلى ٩',
      pressure: 'جرّب… وشوف النتيجة بعينك',
    },
    labs: { water: /معمل دورة المية/, binary: /معمل النظام الثنائي/, pressure: /معمل الضغط/ },
  },
}

const cfg = CONFIGS[VARIANT]
if (!cfg) throw new Error(`Unknown DEMO variant: ${VARIANT}`)

const OUT = 'marketing/growth/videos'
const RAW = `/tmp/jessica-demo-${VARIANT}`
fs.rmSync(RAW, { recursive: true, force: true })
fs.mkdirSync(RAW, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const context = await browser.newContext({
  viewport: { width: 540, height: 960 },
  deviceScaleFactor: 2,
  recordVideo: { dir: RAW, size: { width: 540, height: 960 } },
})
await context.addInitScript((language) => {
  if (localStorage.getItem('jessica-profile-v1')) return
  const book = {
    id: 'b1', title: 'رياضيات', subject: 'Mathematics', language: 'ar', emoji: '📘',
    accent: '#21e6c9', term: 'الترم الأول', description: '', file: '', pageCount: 60,
    grade: 7, custom: true, units: [],
  }
  localStorage.setItem('jessica-profile-v1', JSON.stringify({
    state: {
      onboarded: true, acceptedTerms: 1, name: 'Mina', apiKey: '', model: 'gemini-1.5-flash',
      xp: 420, streak: 5, coins: 9, customBooks: [book], completedTopics: [], skillStats: {},
      mistakes: [], dailyLog: {},
      settings: {
        language, gradeLevel: 7, curriculum: 'egypt', schoolType: 'government',
        primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true,
        quickStart: false, sound: false, aiMode: 'cloud',
      },
    },
    version: 3,
  }))
  localStorage.setItem('jessica-disclaimer-v1', '1')
}, cfg.lang)

// Warm the lazy route chunks in a throwaway page so the recording never
// shows the loading screen between scenes.
const warm = await context.newPage()
for (const route of ['#/labs', '#/library', '#/bank', '#/focus', '#/plan']) {
  await warm.goto(`${BASE}/${route}`, { waitUntil: 'load' })
  await warm.waitForTimeout(800)
}
await warm.close()

const page = await context.newPage()
await page.goto(`${BASE}/#/`, { waitUntil: 'load' })
await page.waitForTimeout(900)

async function setupOverlay() {
  await page.evaluate((config) => {
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
      #demo-intro.out { opacity: 0; pointer-events: none; }
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
    intro.innerHTML = `<span class="j">J</span><h2>${config.introTitle}</h2><p>${config.introLines.join('<br>')}</p>`
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
        <h2>${config.endTitle}</h2>
        <p>${config.endLines.join('<br>')}</p>
        <div class="chips">${config.chips.map((chip) => `<span class="chip">${chip}</span>`).join('')}</div>
        <span class="link">bishoynabilanis.github.io/jessica</span>`
      document.body.appendChild(end)
    }

    document.addEventListener('pointerdown', (event) => {
      const dot = document.createElement('span')
      dot.className = 'demo-ripple'
      dot.style.left = `${event.clientX}px`
      dot.style.top = `${event.clientY}px`
      document.body.appendChild(dot)
      setTimeout(() => dot.remove(), 600)
    }, true)
  }, cfg)
}

const caption = (text, progress) => page.evaluate(([t, p]) => window.__caption(t, p), [text, progress])
const go = async (hash, wait = 600) => {
  await page.evaluate((next) => {
    location.hash = next
    window.scrollTo(0, 0)
  }, hash)
  await page.locator('h1').first().waitFor({ timeout: 9000 }).catch(() => {})
  await page.waitForTimeout(wait)
}
async function smoothTo(locator) {
  await locator.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  await page.waitForTimeout(900)
}

async function flowLabs() {
  await page.waitForTimeout(1100)
  await caption(cfg.captions.home, 0.06)
  await page.waitForTimeout(1700)

  await caption(cfg.captions.labs, 0.16)
  await go('#/labs', 350)
  await page.waitForTimeout(700)

  await page.getByTestId('lab-filter-all').click()
  await page.waitForTimeout(700)

  const water = page.getByRole('button', { name: cfg.labs.water })
  await smoothTo(water)
  await water.click()
  await page.waitForTimeout(900)
  await caption(cfg.captions.change, 0.3)
  await page.waitForTimeout(700)

  await page.getByTestId('cycle-heat').fill('100')
  await page.waitForFunction(
    () => {
      const state = document.querySelector('[data-testid="cycle-state"]')?.textContent || ''
      return state.includes('بتمطر') || state.toLowerCase().includes('raining')
    },
    null,
    { timeout: 16000 },
  )
  await caption(cfg.captions.rain, 0.44)
  await page.waitForTimeout(1400)

  await smoothTo(page.getByTestId('lab-guide-option-0'))
  await page.getByTestId('lab-guide-option-0').click()
  await page.waitForTimeout(700)
  await caption(cfg.captions.flow, 0.56)
  await page.waitForTimeout(1400)

  await caption(cfg.captions.next, 0.64)
  const binary = page.getByRole('button', { name: cfg.labs.binary })
  await smoothTo(binary)
  await binary.click()
  await page.waitForTimeout(850)
  await caption(cfg.captions.binary, 0.72)
  await page.waitForTimeout(500)

  await page.getByTestId('binary-bit-1').click()
  await page.getByTestId('binary-bit-7').click()
  await page.waitForTimeout(1100)
  await caption(cfg.captions.xp, 0.86)
  await page.waitForTimeout(1300)
}

async function flowTour() {
  await page.waitForTimeout(900)
  await caption(cfg.captions.home, 0.05)
  await page.waitForTimeout(1700)

  await page.evaluate(() => window.scrollTo({ top: 620, behavior: 'smooth' }))
  await page.waitForTimeout(1200)
  await caption(cfg.captions.plan, 0.12)
  await page.waitForTimeout(1500)

  await caption(cfg.captions.library, 0.24)
  await go('#/library', 350)
  await page.waitForTimeout(1700)

  await caption(cfg.captions.bank, 0.34)
  await go('#/bank', 500)
  await page.waitForTimeout(500)
  await page.getByTestId('bank-start').click()
  await page.waitForTimeout(1400)
  await caption(cfg.captions.answer, 0.44)
  await page.waitForTimeout(500)
  await page.getByTestId('bank-option').first().click()
  await page.waitForTimeout(400)
  await page.evaluate(() => window.scrollBy({ top: 420, behavior: 'smooth' }))
  await page.waitForTimeout(1400)

  await caption(cfg.captions.focus, 0.56)
  await go('#/focus', 350)
  await page.getByRole('button', { name: /^(ابدأ|Start|كمّل|Resume)$/ }).click()
  await page.waitForTimeout(800)
  await page.waitForTimeout(1600)

  await caption(cfg.captions.today, 0.66)
  await go('#/plan', 350)
  await page.waitForTimeout(1700)

  await caption(cfg.captions.labs, 0.76)
  await go('#/labs', 350)
  await page.waitForTimeout(600)
  const pressure = page.getByRole('button', { name: cfg.labs.pressure })
  await smoothTo(pressure)
  await pressure.click()
  await page.waitForTimeout(1100)
  await page.getByTestId('pressure-area').fill('1')
  await page.waitForTimeout(900)
  await caption(cfg.captions.pressure, 0.87)
  await page.waitForTimeout(2800)
}

await setupOverlay()
await page.waitForTimeout(2000)
await page.evaluate(() => document.getElementById('demo-intro')?.classList.add('out'))
await page.waitForTimeout(450)

if (VARIANT === 'tour-ar') await flowTour()
else await flowLabs()

await page.evaluate(() => window.__end())
await page.waitForTimeout(3200)

const video = page.video()
await context.close()
await browser.close()

const rawPath = await video.path()
fs.copyFileSync(rawPath, path.join(RAW, `${VARIANT}.webm`))
console.log(path.join(RAW, `${VARIANT}.webm`))
