import fs from 'node:fs'
import path from 'node:path'
import { SUBJECT_META } from './subjects-data.mjs'
import { TOC_UNITS } from './toc-units.mjs'

// Seasonal pages: monthly curriculum plans, December revision, exam schedule,
// prep-3 model exams, term-1 study plan.
// Facts come from the official 2026/2027 school-year time map (Ministry):
// term 1 started Sat 2026-09-12, نقل exams Sat 2027-01-09 to Thu 2027-01-14,
// prep-certificate exams Sat 2027-01-16 to Thu 2027-01-21, mid-year break
// Sat 2027-01-23 to Thu 2027-02-04, term 2 starts Sat 2027-02-06.
// Unit lists come from the official Ministry book PDFs (toc-units.mjs).
// The month-by-month split is OUR suggested study plan and is labeled as such.

const BLOB = 'https://elearnningcontent.blob.core.windows.net/elearnningcontent'
const BASE = 'https://bishoynabilanis.github.io/jessica'
const source = fs.readFileSync('src/data/officialBooks.ts', 'utf8')
const re =
  /id: '([^']+)',\s*grade: (\d),\s*subject: '([^']+)',\s*term: '([^']+)',\s*title: '([^']+)',\s*url: file\('([^']+)'\),\s*sizeMb: ([\d.]+),\s*language: '([^']+)'/g

const books = []
let match
while ((match = re.exec(source))) {
  books.push({
    id: match[1], grade: Number(match[2]), subject: match[3], term: match[4],
    title: match[5], url: `${BLOB}/${match[6]}`, sizeMb: Number(match[7]), language: match[8],
  })
}

const GRADES = {
  1: { slug: 'primary-1', ar: 'الأول الابتدائي', colloq: 'أولى ابتدائي', en: 'Primary 1' },
  2: { slug: 'primary-2', ar: 'الثاني الابتدائي', colloq: 'تانية ابتدائي', en: 'Primary 2' },
  3: { slug: 'primary-3', ar: 'الثالث الابتدائي', colloq: 'تالتة ابتدائي', en: 'Primary 3' },
  4: { slug: 'primary-4', ar: 'الرابع الابتدائي', colloq: 'رابعة ابتدائي', en: 'Primary 4' },
  5: { slug: 'primary-5', ar: 'الخامس الابتدائي', colloq: 'خامسة ابتدائي', en: 'Primary 5' },
  6: { slug: 'primary-6', ar: 'السادس الابتدائي', colloq: 'سادسة ابتدائي', en: 'Primary 6' },
  7: { slug: 'prep-1', ar: 'الأول الإعدادي', colloq: 'أولى إعدادي', en: 'Prep 1' },
  8: { slug: 'prep-2', ar: 'الثاني الإعدادي', colloq: 'تانية إعدادي', en: 'Prep 2' },
  9: { slug: 'prep-3', ar: 'الثالث الإعدادي', colloq: 'تالتة إعدادي', en: 'Prep 3' },
}

const MONTHS_AR = ['سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const MONTHS_EN = ['September', 'October', 'November', 'December']

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ups = (d) => Array.from({ length: d }, () => '..').join('/') || '.'

function chunkUnits(units) {
  const n = units.length
  if (!n) return [[], [], [], []]
  const per = Math.ceil(n / 4)
  return [units.slice(0, per), units.slice(per, per * 2), units.slice(per * 2, per * 3), units.slice(per * 3)]
}

function unitsFor(list, preferLang) {
  const preferred = list.find((b) => b.language === preferLang) || list[0]
  const toc = TOC_UNITS[preferred.id]
  if (Array.isArray(toc)) return toc.length ? toc : null
  return toc && toc.units && toc.units.length ? toc.units : null
}

const STYLE = `
  .sub-hero { padding: 60px 0 20px; text-align: center; }
  .sub-hero h1 { font-size: clamp(28px, 4vw, 42px); margin: 12px 0; }
  .sub-hero p { color: var(--muted); max-width: 720px; margin-inline: auto; line-height: 2; }
  .month-table { width: 100%; border-collapse: collapse; margin: 14px 0 26px; border-radius: 18px; overflow: hidden; }
  .month-table th, .month-table td { padding: 12px 14px; border-bottom: 1px solid var(--line); text-align: start; font-size: 14px; vertical-align: top; }
  .month-table th { background: rgba(255,255,255,.05); }
  .month-table td ul { margin: 0; padding-inline-start: 18px; line-height: 1.9; }
  .note { color: var(--muted); font-size: 13px; line-height: 2; }
  .plan-box { border: 1px solid var(--line); border-radius: 20px; padding: 18px 22px; background: rgba(255,255,255,.03); margin: 16px 0 26px; }
  .plan-box h2 { font-size: 19px; margin: 0 0 8px; }
  .plan-box p, .plan-box li { color: var(--muted); line-height: 2; font-size: 15px; }
  .grade-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin: 20px 0 30px; }
  .grade-grid a { display: block; border: 1px solid var(--line); border-radius: 16px; padding: 16px; text-align: center; color: var(--text); font-weight: 700; background: rgba(255,255,255,.03); }
  .grade-grid a:hover { border-color: var(--brand, #22d3ee); }
  .reel { margin: 26px 0; text-align: center; }
  .reel h2 { font-size: 19px; }
  .reel video { width: min(420px, 100%); border-radius: 18px; border: 1px solid var(--line); }
  .reel-cap { color: var(--muted); font-size: 13px; }
  details { border: 1px solid var(--line); border-radius: 14px; padding: 12px 16px; margin: 10px 0; background: rgba(255,255,255,.03); }
  summary { cursor: pointer; font-weight: 700; }
  details p { color: var(--muted); line-height: 2; }
  section { margin-bottom: 30px; }
  h2 { font-size: 21px; }
  .dates li { line-height: 2.1; color: var(--muted); }
  .dates strong { color: var(--text); }
`

function head({ lang, dir, title, description, canonical, altAr, altEn, depth, jsonld }) {
  const up = ups(depth)
  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="ar" href="${altAr}">
<link rel="alternate" hreflang="en" href="${altEn}">
<link rel="alternate" hreflang="x-default" href="${altAr}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jessica">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${BASE}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${up}/../icons/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="${up}/style.css">
<style>${STYLE}</style>
<script type="application/ld+json">
${jsonld}
</script>
</head>
<body>
<div class="bg-glow"></div>`
}

function shell({ lang, dir, depth, title, description, canonical, altAr, altEn, jsonld, body, footerAr }) {
  const up = ups(depth)
  const app = `${up}/../`
  const home = footerAr ? `${up}/` : `${ups(depth - 1)}/`
  const sitemap = footerAr ? `${up}/sitemap/` : `${ups(depth - 1)}/sitemap/`
  const header = footerAr
    ? `<header><div class="wrap nav"><a class="brand" href="${home}"><span class="mark">J</span><span>jessica</span></a><a class="btn sm" href="${app}">افتح التطبيق</a></div></header>`
    : `<header><div class="wrap nav"><a class="brand" href="${home}"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="${app}">Open the app</a></div></header>`
  const footer = footerAr
    ? `<footer><div class="wrap foot"><span>© Jessica — صُنع في مصر 🇪🇬</span><span><a href="${home}">الرئيسية</a> · <a href="${sitemap}">خريطة الموقع</a> · <a href="${app}#/disclaimer">إخلاء المسؤولية</a></span></div></footer>`
    : `<footer><div class="wrap foot"><span>© Jessica — Made in Egypt 🇪🇬</span><span><a href="${home}">Home</a> · <a href="${sitemap}">Sitemap</a> · <a href="${app}#/disclaimer">Disclaimer</a></span></div></footer>`
  return `${head({ lang, dir, title, description, canonical, altAr, altEn, depth, jsonld })}
${header}
<main><div class="wrap">
${body}
</div></main>
${footer}
</body>
</html>`
}

function reelBlock(depth, id, caption, heading) {
  const up = ups(depth)
  return `<section class="reel"><h2>${heading}</h2><video controls preload="none" playsinline poster="${up}/media/reels/${id}.jpg"><source src="${up}/media/reels/${id}.mp4" type="video/mp4"></video><p class="reel-cap">${esc(caption)}</p></section>`
}

function faqJson(items) {
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  })
}
function faqHtml(items) {
  return items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n')
}

// ---------- Monthly grade pages ----------
for (const [gradeNum, g] of Object.entries(GRADES)) {
  const list = books.filter((b) => b.grade === Number(gradeNum) && b.term === 'Term 1')
  if (!list.length) continue
  const bySubject = new Map()
  for (const b of list) {
    if (!bySubject.has(b.subject)) bySubject.set(b.subject, [])
    bySubject.get(b.subject).push(b)
  }

  // Arabic page
  {
    const depth = 2 // welcome/monthly/<slug>/
    const canonical = `${BASE}/welcome/monthly/${g.slug}/`
    const altEn = `${BASE}/welcome/en/monthly/${g.slug}/`
    const title = `منهج ${g.colloq} الترم الأول 2026/2027 شهر بشهر | Jessica`
    const description = `وحدات كل مادة في ${g.ar} الترم الأول من كتب الوزارة الرسمية، مع خطة مذاكرة مقترحة شهر بشهر من سبتمبر ليناير ومواعيد الامتحانات.`
    const sections = []
    for (const [subject, sBooks] of bySubject) {
      const meta = SUBJECT_META[subject]
      if (!meta) continue
      const units = unitsFor(sBooks, 'ar') || unitsFor(sBooks, 'en')
      if (!units) continue
      const chunks = chunkUnits(units)
      const rows = chunks.map((c, i) => `<tr><td><strong>${MONTHS_AR[i]}</strong></td><td><ul>${c.map((u) => `<li>${esc(u)}</li>`).join('')}</ul></td></tr>`).join('')
      sections.push(`<section><h2>منهج ${meta.ar} - ${g.ar}</h2>
<table class="month-table"><thead><tr><th>الشهر</th><th>الوحدات المقترحة</th></tr></thead><tbody>${rows}</tbody></table>
<p class="note">الوحدات مكتوبة زي ما هي في كتاب الوزارة الرسمي. <a href="../../grades/${g.slug}/${meta.slug}/">حمّل كتاب ${meta.ar} ${g.colloq} PDF</a> وذاكره في Jessica أوفلاين.</p></section>`)
    }
    const faqs = [
      [`إيه مصدر وحدات المنهج دي؟`, `الوحدات منسوخة من فهرس كتب وزارة التربية والتعليم الرسمية للترم الأول 2026/2027، والروابط بتوديك لصفحة تحميل كل كتاب من سيرفر الوزارة.`],
      [`هل التوزيع الشهري ده رسمي من الوزارة؟`, `لا. التقسيمة على الشهور خطة مذاكرة مقترحة من Jessica مبنية على عدد وحدات كل كتاب وعلى الخريطة الزمنية الرسمية (الدراسة بدأت 12 سبتمبر 2026 والامتحانات تبدأ 9 يناير 2027). وزّع الوحدات مع جدول مدرسة ابنك.`],
      [`امتحانات الترم الأول امتى؟`, `امتحانات صفوف النقل من 9 لحد 14 يناير 2027، وامتحانات الشهادة الإعدادية من 16 لحد 21 يناير 2027 حسب الخريطة الزمنية المعتمدة.`],
    ]
    const body = `<section class="sub-hero">
  <span class="eyebrow">🇪🇬 منهج الترم الأول 2026/2027</span>
  <h1>منهج ${g.ar} بالشهور - الترم الأول</h1>
  <p>كل وحدات ${g.ar} في الترم الأول من كتب الوزارة، متقسمة في خطة مقترحة على شهور سبتمبر وأكتوبر ونوفمبر وديسمبر، ويناير للمراجعة قبل الامتحانات.</p>
  <div class="hero-actions" style="justify-content:center"><a class="btn" href="../../../">افتح Jessica مجانًا ←</a></div>
</section>
<div class="plan-box"><h2>إزاي نستعمل الخطة دي؟</h2>
<p>الوحدات نفسها رسمية من فهرس كل كتاب. التقسيمة على الشهور اقتراح منا بيساعد ابنك يخلّص المنهج قبل الامتحانات بأسبوعين للمراجعة: امتحانات صفوف النقل من <strong>9 لحد 14 يناير 2027</strong>، والشهادة الإعدادية من <strong>16 لحد 21 يناير 2027</strong>، حسب الخريطة الزمنية الرسمية للعام الدراسي 2026/2027. لو مدرسة ابنك ماشية أسرع أو أبطأ، عدّل الشهور بحرية - المهم يخلّص ديسمبر وهو مغطّي كل الوحدات.</p></div>
${sections.join('\n')}
${reelBlock(depth, 'jessica-09', 'شاشة نجوم الأسبوع في Jessica: الطفل بيجمع نجوم كل ما يذاكر من كتابه.', 'شوف بيتشجع إزاي')}
<section><h2>أسئلة شائعة</h2>${faqHtml(faqs)}</section>
<div class="rel-grid"><a href="../../grades/${g.slug}/">📚 كتب ${g.ar} PDF</a><a href="../../guides/exam-schedule-2027/">🗓️ مواعيد امتحانات الترم الأول</a><a href="${altEn}">🇬🇧 English version</a></div>`
    const html = shell({ lang: 'ar', dir: 'rtl', depth, title, description, canonical, altAr: canonical, altEn, jsonld: faqJson(faqs), body, footerAr: true })
    const dir = path.join('public/welcome/monthly', g.slug)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), html)
  }

  // English page
  {
    const depth = 3 // welcome/en/monthly/<slug>/
    const canonical = `${BASE}/welcome/en/monthly/${g.slug}/`
    const altAr = `${BASE}/welcome/monthly/${g.slug}/`
    const title = `${g.en} Term 1 Curriculum by Month (2026/2027) | Jessica`
    const description = `Every Term 1 unit for Egyptian ${g.en} from the official Ministry textbooks, with a suggested month-by-month study plan from September to the January exams.`
    const sections = []
    for (const [subject, sBooks] of bySubject) {
      const meta = SUBJECT_META[subject]
      if (!meta) continue
      const units = unitsFor(sBooks, 'en') || unitsFor(sBooks, 'ar')
      if (!units) continue
      const chunks = chunkUnits(units)
      const rows = chunks.map((c, i) => `<tr><td><strong>${MONTHS_EN[i]}</strong></td><td><ul>${c.map((u) => `<li>${esc(u)}</li>`).join('')}</ul></td></tr>`).join('')
      sections.push(`<section><h2>${meta.en} - ${g.en}</h2>
<table class="month-table"><thead><tr><th>Month</th><th>Suggested units</th></tr></thead><tbody>${rows}</tbody></table>
<p class="note">Unit names are copied from the official Ministry textbook. <a href="../../../grades/${g.slug}/${meta.slug}/">Download the ${meta.en} book for ${g.en} as a free PDF</a> and study it offline in Jessica.</p></section>`)
    }
    const faqs = [
      [`Where do these unit lists come from?`, `They are transcribed from the tables of contents of the official Egyptian Ministry of Education textbooks for Term 1, 2026/2027. Each subject section links to the free official PDF download page.`],
      [`Is this monthly split official?`, `No. The month-by-month split is a suggested study plan from Jessica, built from each book's unit count and the official school calendar (term started 12 September 2026, exams start 9 January 2027). Adjust it to your child's school pace.`],
      [`When are the Term 1 exams?`, `Per the official 2026/2027 time map: exams for most grades run 9-14 January 2027, and the preparatory certificate exams run 16-21 January 2027.`],
    ]
    const body = `<section class="sub-hero">
  <span class="eyebrow">🇪🇬 Term 1 curriculum 2026/2027</span>
  <h1>${g.en} Curriculum by Month - Term 1</h1>
  <p>All Term 1 units for ${g.en} from the official Ministry textbooks, arranged into a suggested plan across September, October, November and December, with January kept for revision before the exams.</p>
  <div class="hero-actions" style="justify-content:center"><a class="btn" href="../../../../">Open Jessica for free ←</a></div>
</section>
<div class="plan-box"><h2>How to use this plan</h2>
<p>The units themselves are official, copied from each textbook's contents page. The monthly split is our suggestion to finish the book two weeks before exams: most grades sit exams <strong>9-14 January 2027</strong> and the preparatory certificate <strong>16-21 January 2027</strong>, per the official 2026/2027 school calendar. If your child's school moves faster or slower, shift the months freely - the goal is to finish all units by the end of December.</p></div>
${sections.join('\n')}
${reelBlock(depth, 'jessica-09', 'The weekly stars screen in Jessica: children collect stars as they study from their own book.', 'See how Jessica motivates kids')}
<section><h2>Common questions</h2>${faqHtml(faqs)}</section>
<div class="rel-grid"><a href="../../grades/${g.slug}/">📚 ${g.en} textbooks PDF</a><a href="../../guides/exam-schedule-2027/">🗓️ Term 1 exam dates</a><a href="${altAr}">🇪🇬 النسخة العربية</a></div>`
    const html = shell({ lang: 'en', dir: 'ltr', depth, title, description, canonical, altAr, altEn: canonical, jsonld: faqJson(faqs), body, footerAr: false })
    const dir = path.join('public/welcome/en/monthly', g.slug)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), html)
  }
}

// ---------- Monthly index pages ----------
{
  const gradeLinksAr = Object.values(GRADES).map((g) => `<a href="./${g.slug}/">منهج ${g.ar}</a>`).join('\n')
  const faqs = [
    ['المنهج متقسم على الشهور إزاي؟', 'بنقسم وحدات كل كتاب رسمي على أربع شهور (سبتمبر لديسمبر) كخطة مقترحة، ويناير للمراجعة، بناءً على الخريطة الزمنية الرسمية: الدراسة بدأت 12 سبتمبر 2026 وامتحانات الترم الأول من 9 يناير 2027.'],
    ['هل الخطة دي بديل عن جدول المدرسة؟', 'لا، دي خطة مساعدة للمذاكرة في البيت. جدول المدرسة هو المرجع، والخطة بتساعد ولي الأمر يتابع التقدم شهر بشهر ويعرف المفروض ابنه وصل لفين.'],
  ]
  const body = `<section class="sub-hero">
  <span class="eyebrow">🇪🇬 الترم الأول 2026/2027</span>
  <h1>المنهج شهر بشهر لكل الصفوف</h1>
  <p>اختار صف ابنك وشوف وحدات كل مادة في الترم الأول من كتب الوزارة الرسمية، مع خطة مذاكرة مقترحة من سبتمبر ليناير ومواعيد الامتحانات المعتمدة، عشان تعرف دايمًا المفروض يخلّص إيه الشهر ده.</p>
</section>
<div class="grade-grid">${gradeLinksAr}</div>
<div class="plan-box"><h2>الخريطة الزمنية الرسمية بسرعة</h2><ul class="dates">
<li>الدراسة بدأت يوم <strong>السبت 12 سبتمبر 2026</strong>.</li>
<li>امتحانات الترم الأول لصفوف النقل: <strong>9 - 14 يناير 2027</strong>.</li>
<li>امتحانات الشهادة الإعدادية: <strong>16 - 21 يناير 2027</strong>.</li>
<li>إجازة نصف العام: <strong>23 يناير - 4 فبراير 2027</strong>.</li>
</ul></div>
<section><h2>أسئلة شائعة</h2>${faqHtml(faqs)}</section>
<div class="rel-grid"><a href="../grades/">📚 كل كتب الوزارة PDF</a><a href="../guides/exam-schedule-2027/">🗓️ تفاصيل مواعيد الامتحانات</a><a href="../en/monthly/">🇬🇧 English version</a></div>`
  const html = shell({
    lang: 'ar', dir: 'rtl', depth: 1,
    title: 'المنهج شهر بشهر لكل الصفوف - الترم الأول 2026/2027 | Jessica',
    description: 'وحدات الترم الأول لكل صف من أولى ابتدائي لتالتة إعدادي من كتب الوزارة الرسمية، مع خطة مذاكرة مقترحة شهر بشهر ومواعيد امتحانات يناير 2027.',
    canonical: `${BASE}/welcome/monthly/`, altAr: `${BASE}/welcome/monthly/`, altEn: `${BASE}/welcome/en/monthly/`,
    jsonld: faqJson(faqs), body, footerAr: true,
  })
  fs.mkdirSync('public/welcome/monthly', { recursive: true })
  fs.writeFileSync('public/welcome/monthly/index.html', html)
}
{
  const gradeLinksEn = Object.values(GRADES).map((g) => `<a href="./${g.slug}/">${g.en} curriculum</a>`).join('\n')
  const faqs = [
    ['How is the curriculum split across months?', 'We divide the units of each official textbook across four months (September to December) as a suggested plan, keeping January for revision, based on the official calendar: term started 12 September 2026 and Term 1 exams start 9 January 2027.'],
    ['Does this replace the school timetable?', 'No. It is a home-study helper. The school timetable is the reference; the plan helps parents track progress month by month.'],
  ]
  const body = `<section class="sub-hero">
  <span class="eyebrow">🇪🇬 Term 1, 2026/2027</span>
  <h1>The Egyptian Curriculum Month by Month</h1>
  <p>Pick your child's grade to see every Term 1 unit from the official Ministry textbooks, with a suggested September-to-January study plan and the official exam dates, so you always know what should be finished this month.</p>
</section>
<div class="grade-grid">${gradeLinksEn}</div>
<div class="plan-box"><h2>The official calendar in brief</h2><ul class="dates">
<li>School year started on <strong>Saturday 12 September 2026</strong>.</li>
<li>Term 1 exams for most grades: <strong>9-14 January 2027</strong>.</li>
<li>Preparatory certificate exams: <strong>16-21 January 2027</strong>.</li>
<li>Mid-year break: <strong>23 January - 4 February 2027</strong>.</li>
</ul></div>
<section><h2>Common questions</h2>${faqHtml(faqs)}</section>
<div class="rel-grid"><a href="../../grades/">📚 All Ministry textbooks PDF</a><a href="../guides/exam-schedule-2027/">🗓️ Full exam schedule</a><a href="../../monthly/">🇪🇬 النسخة العربية</a></div>`
  const html = shell({
    lang: 'en', dir: 'ltr', depth: 2,
    title: 'Egyptian Curriculum by Month - Term 1 2026/2027 | Jessica',
    description: 'Term 1 units for every grade from Primary 1 to Prep 3, from the official Ministry textbooks, with a suggested monthly study plan and the January 2027 exam dates.',
    canonical: `${BASE}/welcome/en/monthly/`, altAr: `${BASE}/welcome/monthly/`, altEn: `${BASE}/welcome/en/monthly/`,
    jsonld: faqJson(faqs), body, footerAr: false,
  })
  fs.mkdirSync('public/welcome/en/monthly', { recursive: true })
  fs.writeFileSync('public/welcome/en/monthly/index.html', html)
}

console.log('seasonal monthly pages done')

// ---------- Seasonal guides ----------
const guides = [
  {
    arSlug: 'exam-schedule-2027', enSlug: 'exam-schedule-2027',
    ar: {
      title: 'مواعيد امتحانات الترم الأول 2027 - الخريطة الرسمية | Jessica',
      description: 'مواعيد امتحانات الفصل الدراسي الأول 2026/2027 المعتمدة: صفوف النقل من 9 لـ14 يناير 2027، والشهادة الإعدادية من 16 لـ21 يناير 2027، وإجازة نصف العام.',
      h1: 'مواعيد امتحانات الترم الأول 2027',
      eyebrow: '🗓️ الخريطة الزمنية الرسمية 2026/2027',
      hero: 'كل المواعيد المهمة للترم الأول من الخريطة الزمنية المعتمدة من وزارة التربية والتعليم: بداية الامتحانات، آخر يوم امتحان، وإجازة نصف العام.',
    },
    en: {
      title: 'Egypt Term 1 Exam Dates 2027 - Official School Calendar | Jessica',
      description: 'Official Egyptian 2026/2027 Term 1 exam dates: most grades sit exams 9-14 January 2027, preparatory certificate 16-21 January 2027, plus the mid-year break dates.',
      h1: 'Term 1 Exam Dates 2027 in Egypt',
      eyebrow: '🗓️ Official 2026/2027 school calendar',
      hero: 'Every important Term 1 date from the official Ministry time map: first exam day, last exam day, and the mid-year break.',
    },
    bodyAr: `<div class="plan-box"><h2>المواعيد الرسمية للعام الدراسي 2026/2027</h2><ul class="dates">
<li>بداية العام الدراسي: <strong>السبت 12 سبتمبر 2026</strong>.</li>
<li>امتحانات الفصل الدراسي الأول لصفوف النقل: من <strong>السبت 9 يناير 2027</strong> لحد <strong>الخميس 14 يناير 2027</strong>.</li>
<li>امتحانات الشهادة الإعدادية للترم الأول: من <strong>السبت 16 يناير 2027</strong> لحد <strong>الخميس 21 يناير 2027</strong>.</li>
<li>إجازة نصف العام: من <strong>السبت 23 يناير 2027</strong> لحد <strong>الخميس 4 فبراير 2027</strong>.</li>
<li>بداية الفصل الدراسي الثاني: <strong>السبت 6 فبراير 2027</strong>.</li>
</ul>
<p>المديريات التعليمية بتنظّم جداول الامتحانات التفصيلية لكل محافظة وتعلنها في مواعيدها، فالأيام دي هي الإطار الرسمي العام، وجدول مدرسة ابنك هو المرجع النهائي لترتيب المواد.</p></div>
<div class="plan-box"><h2>نصايح للاستعداد قبل الامتحانات</h2><ul>
<li>خلّص المنهج بنهاية ديسمبر عشان يناير يكون كله مراجعة وحل أسئلة.</li>
<li>قسّم المراجعة على الأيام المتبقية: مادة أساسية كل يومين بدل الزحمة في آخر أسبوع.</li>
<li>استعمل Jessica في المراجعة: اسأل من كتاب الوزارة نفسه واطلب اختبار قصير بعد كل وحدة.</li>
</ul></div>`,
    bodyEn: `<div class="plan-box"><h2>Official 2026/2027 dates</h2><ul class="dates">
<li>School year start: <strong>Saturday 12 September 2026</strong>.</li>
<li>Term 1 exams for transfer grades: <strong>Saturday 9 January 2027</strong> to <strong>Thursday 14 January 2027</strong>.</li>
<li>Preparatory certificate (Prep 3) Term 1 exams: <strong>Saturday 16 January 2027</strong> to <strong>Thursday 21 January 2027</strong>.</li>
<li>Mid-year break: <strong>Saturday 23 January 2027</strong> to <strong>Thursday 4 February 2027</strong>.</li>
<li>Term 2 starts: <strong>Saturday 6 February 2027</strong>.</li>
</ul>
<p>Directorates publish the detailed per-governorate timetables closer to the exams, so treat these as the official frame and your child's school timetable as the final reference for subject order.</p></div>
<div class="plan-box"><h2>How to prepare</h2><ul>
<li>Finish the curriculum by the end of December so January is all revision and practice.</li>
<li>Split revision across the remaining days: one main subject every two days instead of cramming.</li>
<li>Use Jessica for revision: ask questions from the Ministry book itself and request a short quiz after each unit.</li>
</ul></div>`,
    faqsAr: [
      ['امتحانات الترم الأول 2027 تبدأ امتى؟', 'امتحانات صفوف النقل تبدأ يوم السبت 9 يناير 2027 وتستمر لحد الخميس 14 يناير 2027 حسب الخريطة الزمنية المعتمدة من وزارة التربية والتعليم.'],
      ['امتحانات الشهادة الإعدادية الترم الأول امتى؟', 'من السبت 16 يناير 2027 لحد الخميس 21 يناير 2027. جدول ترتيب المواد بتعلنه كل مديرية تعليمية على حدة.'],
      ['إجازة نصف العام 2027 تبدأ امتى؟', 'إجازة نصف العام تبدأ يوم السبت 23 يناير 2027 وتنتهي يوم الخميس 4 فبراير 2027، ويبدأ الترم الثاني يوم السبت 6 فبراير 2027.'],
    ],
    faqsEn: [
      ['When do Term 1 exams start in Egypt in 2027?', 'Transfer-grade exams start on Saturday 9 January 2027 and run until Thursday 14 January 2027, per the official Ministry time map.'],
      ['When are the preparatory certificate exams?', 'From Saturday 16 January 2027 to Thursday 21 January 2027. Each governorate publishes its own subject-order timetable.'],
      ['When is the mid-year break?', 'The mid-year break runs from Saturday 23 January 2027 to Thursday 4 February 2027, and Term 2 begins on Saturday 6 February 2027.'],
    ],
    linksAr: `<div class="rel-grid"><a href="../../monthly/">📅 المنهج شهر بشهر</a><a href="../../guides/study-plan-term1/">📝 خطة مذاكرة الترم الأول</a><a href="../../en/guides/exam-schedule-2027/">🇬🇧 English version</a></div>`,
    linksEn: `<div class="rel-grid"><a href="../../monthly/">📅 Curriculum by month</a><a href="../study-plan-term1/">📝 Term 1 study plan</a><a href="../../../guides/exam-schedule-2027/">🇪🇬 النسخة العربية</a></div>`,
  },
  {
    arSlug: 'december-revision', enSlug: 'december-revision',
    ar: {
      title: 'مراجعة ديسمبر قبل امتحانات الترم الأول 2027 | Jessica',
      description: 'خطة مراجعة ديسمبر مقترحة قبل امتحانات الترم الأول: إزاي تقفل المنهج في ديسمبر وتجهز ابنك لامتحانات يناير 2027 من كتاب الوزارة مباشرة.',
      h1: 'مراجعة ديسمبر: قفلة المنهج قبل امتحانات يناير',
      eyebrow: '📚 الترم الأول 2026/2027',
      hero: 'ديسمبر آخر شهر كامل قبل امتحانات الترم الأول (9 يناير 2027). لو ابنك قفل منهجه في ديسمبر، يناير يبقى مراجعة وتدريب بس مش لحاق منهج.',
    },
    en: {
      title: 'December Revision Plan Before Term 1 Exams 2027 | Jessica',
      description: 'A suggested December revision plan before the Egyptian Term 1 exams: how to close out the curriculum in December and get your child ready for the January 2027 exams.',
      h1: 'December Revision: Closing the Curriculum Before January',
      eyebrow: '📚 Term 1, 2026/2027',
      hero: 'December is the last full month before the Term 1 exams (9 January 2027). If your child closes out the curriculum in December, January becomes pure revision and practice.',
    },
    bodyAr: `<div class="plan-box"><h2>ليه ديسمبر مهم؟</h2>
<p>حسب الخريطة الزمنية الرسمية، امتحانات صفوف النقل من <strong>9 لـ14 يناير 2027</strong> والشهادة الإعدادية من <strong>16 لـ21 يناير 2027</strong>. يعني بعد ديسمبر فاضل أسبوع واحد بس قبل أول امتحان. الهدف في ديسمبر: يخلّص كل وحدات الترم الأول ويعمل مراجعة أولى لكل مادة.</p></div>
<div class="plan-box"><h2>خطة ديسمبر المقترحة</h2><ul>
<li><strong>الأسبوع الأول:</strong> قفّل وحدات نوفمبر المتبقية وابدأ وحدات ديسمبر من صفحة <a href="../../monthly/">المنهج شهر بشهر</a> لصف ابنك.</li>
<li><strong>الأسبوع التاني والتالت:</strong> خلّص آخر وحدات كل مادة، وبعد كل وحدة اطلب من Jessica اختبار قصير من الكتاب نفسه.</li>
<li><strong>الأسبوع الرابع:</strong> مراجعة سريعة لكل الوحدات: اسأل ابنك أسئلة شفوية من فهرس الكتاب، وأي وحدة تعثر فيها ترجع لها في التطبيق.</li>
<li><strong>آخر يومين في ديسمبر:</strong> راحة وتجهيز أدوات، وابدأوا يناير بجداول حل امتحانات.</li>
</ul></div>
<div class="plan-box"><h2>Jessica بتساعد إزاي في المراجعة؟</h2><ul>
<li>كل سؤال بيتجاوب من كتاب الوزارة اللي ابنك مستورده، مش من معلومات عامة.</li>
<li>اختبارات قصيرة بعد كل وحدة بتكشف الأجزاء اللي محتاجة ترجيع.</li>
<li>النجوم والهدايا اليومية بتحوّل المراجعة لعادة ممتعة بدل المشاكل اليومية.</li>
</ul></div>`,
    bodyEn: `<div class="plan-box"><h2>Why December matters</h2>
<p>Per the official calendar, transfer-grade exams run <strong>9-14 January 2027</strong> and the preparatory certificate <strong>16-21 January 2027</strong>. That leaves only one week after December before the first exam. The December goal: finish every Term 1 unit and do a first revision pass of each subject.</p></div>
<div class="plan-box"><h2>The suggested December plan</h2><ul>
<li><strong>Week 1:</strong> close any remaining November units and start the December units on the <a href="../../monthly/">curriculum by month</a> page for your child's grade.</li>
<li><strong>Weeks 2-3:</strong> finish the last units of each subject, and after each unit ask Jessica for a short quiz from the book itself.</li>
<li><strong>Week 4:</strong> quick revision of all units: ask your child oral questions from the book's contents page and revisit weak units in the app.</li>
<li><strong>Last two days of December:</strong> rest and prepare supplies, then start January with past-paper practice.</li>
</ul></div>
<div class="plan-box"><h2>How Jessica helps with revision</h2><ul>
<li>Every answer comes from the Ministry book your child imported, not generic information.</li>
<li>Short quizzes after each unit reveal what needs another look.</li>
<li>Stars and daily gifts turn revision into a habit instead of a daily battle.</li>
</ul></div>`,
    faqsAr: [
      ['ابني لسه مخلصش المنهج وديسمبر خلص، أعمل إيه؟', 'ركّز على الوحدات اللي لسه متذاكرتش أولًا من صفحة المنهج شهر بشهر لصفه، واديله أولوية للمواد الأساسية. في يناير وازن بين قفل الباقي والمراجعة العامة.'],
      ['أعرف إزاي إن ابني مستعد للامتحان؟', 'اطلب منه يشرحلك كل وحدة بكلامه من فهرس الكتاب. اللي يقدر يشرحه اتقنه، واللي يتلكأ فيه يفتحه في Jessica ويطلب اختبار عليه.'],
    ],
    faqsEn: [
      ['December is over and my child has not finished the curriculum. What now?', 'Focus first on the units not yet studied, using the curriculum-by-month page for their grade, and prioritize core subjects. In January, balance closing the gap with general revision.'],
      ['How do I know my child is exam-ready?', 'Ask them to explain each unit in their own words from the book contents page. What they can explain, they have mastered; what they stumble on, they should reopen in Jessica and quiz themselves on.'],
    ],
    linksAr: `<div class="rel-grid"><a href="../../monthly/">📅 المنهج شهر بشهر</a><a href="../exam-schedule-2027/">🗓️ مواعيد الامتحانات</a><a href="../../en/guides/december-revision/">🇬🇧 English version</a></div>`,
    linksEn: `<div class="rel-grid"><a href="../../monthly/">📅 Curriculum by month</a><a href="../exam-schedule-2027/">🗓️ Exam dates</a><a href="../../../guides/december-revision/">🇪🇬 النسخة العربية</a></div>`,
    reelAr: ['jessica-10', 'الهدايا اليومية في Jessica: كل يوم مذاكرة بيفتح هدية جديدة بتشجع الطفل يكمّل.', 'شوف الهدايا اليومية'],
    reelEn: ['jessica-10', 'Daily gifts in Jessica: every study day unlocks a new gift that keeps children going.', 'See the daily gifts'],
  },
  {
    arSlug: 'prep-3-model-exams', enSlug: 'prep-3-model-exams',
    ar: {
      title: 'نماذج امتحانات الصف الثالث الإعدادي 2027 الرسمية | Jessica',
      description: 'النماذج الاسترشادية الرسمية للشهادة الإعدادية 2026/2027 من موقع وزارة التربية والتعليم، ومواعيد امتحانات الترم الأول من 16 لـ21 يناير 2027.',
      h1: 'نماذج امتحانات الشهادة الإعدادية 2027',
      eyebrow: '🎓 الصف الثالث الإعدادي - الترم الأول',
      hero: 'الوزارة بتنشر النماذج الاسترشادية الرسمية لامتحانات الشهادة الإعدادية على موقعها. هنا هتوصل لها مباشرة، وتعرف مواعيد الامتحانات وإزاي تتدرب عليها.',
    },
    en: {
      title: 'Official Prep 3 Model Exams 2027 (Egypt) | Jessica',
      description: 'The official Egyptian Ministry model exams for the preparatory certificate 2026/2027, direct from the Ministry website, plus Term 1 exam dates 16-21 January 2027.',
      h1: 'Official Preparatory Certificate Model Exams 2027',
      eyebrow: '🎓 Prep 3 - Term 1',
      hero: 'The Ministry publishes its official model exams for the preparatory certificate on its own website. Here you reach them directly, and learn the exam dates and how to practise.',
    },
    bodyAr: `<div class="plan-box"><h2>النماذج الاسترشادية الرسمية</h2>
<p>وزارة التربية والتعليم نشرت على موقعها الرسمي صفحة مخصصة للنماذج الاسترشادية للصف الثالث الإعدادي، فيها حاليًا:</p>
<ul>
<li>النموذج الاسترشادي الأول والثاني والثالث.</li>
<li>ثلاثة نماذج إضافية لمادتي العلوم والرياضيات لمدارس اللغات.</li>
</ul>
<p>الرابط الرسمي المباشر: <a href="https://moe.gov.eg/ar/prep3/" target="_blank" rel="noreferrer">النماذج الاسترشادية للصف الثالث الإعدادي - موقع الوزارة</a></p>
<p class="note">بننصح بالتحميل من موقع الوزارة فقط عشان تضمن إن النموذج أصلي ومحدّث، مش نسخة متنقولة على مواقع تانية.</p></div>
<div class="plan-box"><h2>مواعيد امتحانات الشهادة الإعدادية الترم الأول</h2>
<p>حسب الخريطة الزمنية الرسمية 2026/2027: الامتحانات من <strong>السبت 16 يناير 2027</strong> لحد <strong>الخميس 21 يناير 2027</strong>، وكل مديرية بتعلن جدول ترتيب المواد الخاص بيها.</p></div>
<div class="plan-box"><h2>إزاي تتدرب على النماذج؟</h2><ul>
<li>حمّل النموذج من موقع الوزارة وحلّه في وقت امتحان حقيقي من غير كتاب.</li>
<li>صحّح من الكتاب الرسمي، وأي سؤال غلط افتح الوحدة بتاعته في Jessica واطلب شرحها واختبار عليها.</li>
<li>كرر مع النموذج التاني بعد أسبوع مراجعة، وقارن نتيجتك.</li>
</ul></div>`,
    bodyEn: `<div class="plan-box"><h2>The official model exams</h2>
<p>The Ministry of Education publishes a dedicated page for the Prep 3 model exams on its official website. It currently offers:</p>
<ul>
<li>The first, second and third general model exams.</li>
<li>Three additional models for Science and Mathematics for language schools.</li>
</ul>
<p>Direct official link: <a href="https://moe.gov.eg/ar/prep3/" target="_blank" rel="noreferrer">Prep 3 model exams - Ministry website</a></p>
<p class="note">Download only from the Ministry website so you know the model is authentic and up to date, not a re-uploaded copy on another site.</p></div>
<div class="plan-box"><h2>Preparatory certificate Term 1 exam dates</h2>
<p>Per the official 2026/2027 time map: exams run from <strong>Saturday 16 January 2027</strong> to <strong>Thursday 21 January 2027</strong>, and each governorate publishes its own subject-order timetable.</p></div>
<div class="plan-box"><h2>How to practise with the models</h2><ul>
<li>Download a model from the Ministry site and solve it under real exam timing without the book.</li>
<li>Mark against the official textbook, and for every wrong answer open that unit in Jessica and ask for an explanation and a quiz.</li>
<li>Repeat with the next model after a week of revision and compare your score.</li>
</ul></div>`,
    faqsAr: [
      ['النماذج الاسترشادية دي رسمية؟', 'أيوة، الرابط اللي في الصفحة بيوديك لموقع وزارة التربية والتعليم الرسمي moe.gov.eg، وهو المصدر الوحيد اللي بننصح بالتحميل منه.'],
      ['امتحانات الشهادة الإعدادية الترم الأول امتى؟', 'من 16 لحد 21 يناير 2027 حسب الخريطة الزمنية المعتمدة، وجدول ترتيب المواد بتعلنه كل مديرية تعليمية.'],
      ['هل حل النماذج كفاية للمراجعة؟', 'النماذج بتدريب على شكل الامتحان، لكن المراجعة الأساسية بتكون من كتاب الوزارة نفسه. الأفضل الاتنين مع بعض: وحدة بوحدة في Jessica، وبعدين نموذج كامل كل أسبوع.'],
    ],
    faqsEn: [
      ['Are these model exams official?', 'Yes. The link on this page goes to the official Ministry of Education website moe.gov.eg, which is the only source we recommend downloading from.'],
      ['When are the preparatory certificate Term 1 exams?', 'From 16 to 21 January 2027 per the official time map, with each governorate publishing its own subject timetable.'],
      ['Is solving models enough revision?', 'Models train exam technique, but core revision is from the Ministry textbook itself. Best is both together: unit by unit in Jessica, then one full model each week.'],
    ],
    linksAr: `<div class="rel-grid"><a href="../../grades/prep-3/">📚 كتب تالتة إعدادي PDF</a><a href="../exam-schedule-2027/">🗓️ مواعيد الامتحانات</a><a href="../../en/guides/prep-3-model-exams/">🇬🇧 English version</a></div>`,
    linksEn: `<div class="rel-grid"><a href="../../../grades/prep-3/">📚 Prep 3 textbooks PDF</a><a href="../exam-schedule-2027/">🗓️ Exam dates</a><a href="../../../guides/prep-3-model-exams/">🇪🇬 النسخة العربية</a></div>`,
    reelAr: ['jessica-17', 'إزاي تسأل Jessica سؤال واضح من الكتاب عشان تجاوبك بدقة.', 'إزاي تسأل سؤال واضح'],
    reelEn: ['jessica-17', 'How to ask Jessica a clear question from the book so it answers precisely.', 'How to ask a clear question'],
  },
  {
    arSlug: 'study-plan-term1', enSlug: 'study-plan-term1',
    ar: {
      title: 'خطة مذاكرة الترم الأول 2026/2027 من سبتمبر ليناير | Jessica',
      description: 'خطة مذاكرة مقترحة للترم الأول: تقسيم الأسبوع، وقت المذاكرة اليومي حسب السن، وتجهيز يناير للمراجعة قبل امتحانات 9 يناير 2027.',
      h1: 'خطة مذاكرة الترم الأول من سبتمبر ليناير',
      eyebrow: '📝 خطة مقترحة 2026/2027',
      hero: 'خطة بسيطة وواقعية تخلّي ابنك يمشي مع المنهج أول بأول من غير زحمة قبل الامتحانات: تقسيم الأسبوع، المذاكرة اليومية، والمراجعة الشهرية.',
    },
    en: {
      title: 'Term 1 Study Plan 2026/2027 - September to January | Jessica',
      description: 'A suggested Term 1 study plan for Egyptian students: weekly split, daily study time by age, and a January revision block before the 9 January 2027 exams.',
      h1: 'Term 1 Study Plan: September to January',
      eyebrow: '📝 Suggested plan, 2026/2027',
      hero: 'A simple, realistic plan that keeps your child moving with the curriculum steadily, without pre-exam cramming: weekly split, daily study, and monthly revision.',
    },
    bodyAr: `<div class="plan-box"><h2>الأسبوع النموذجي</h2><ul>
<li><strong>السبت - الاتنين:</strong> مذاكرة واجبات المدرسة + وحدة جديدة من خطة الشهر في صفحة <a href="../../monthly/">المنهج شهر بشهر</a>.</li>
<li><strong>التلات والأربع:</strong> تثبيت الوحدات الجديدة بأسئلة قصيرة من Jessica.</li>
<li><strong>الخميس:</strong> مراجعة اللي اتذاكر في الأسبوع كله، واختبار قصير على كل مادة.</li>
<li><strong>الجمعة:</strong> راحة ولعب، وقراءة حرة بس.</li>
</ul></div>
<div class="plan-box"><h2>وقت المذاكرة اليومي المقترح حسب السن</h2><ul>
<li>أولى لتالتة ابتدائي: 20-30 دقيقة مع بابا أو ماما.</li>
<li>رابعة لسادسة ابتدائي: 45-60 دقيقة، منها 15 دقيقة مراجعة لوحده.</li>
<li>إعدادي: 60-90 دقيقة مقسمين على مادتين، مع اختبار قصير آخر اليوم.</li>
</ul></div>
<div class="plan-box"><h2>المحطات المهمة في الترم</h2><ul class="dates">
<li><strong>نهاية كل شهر:</strong> راجع وحدات الشهر من صفحة صف ابنك وقارن مع خطة الشهر.</li>
<li><strong>نهاية ديسمبر:</strong> المنهج كله اتقفل - شوف <a href="../december-revision/">خطة مراجعة ديسمبر</a>.</li>
<li><strong>أول يناير:</strong> حل نماذج ومراجعة عامة، وامتحانات النقل من <strong>9 يناير 2027</strong> والشهادة الإعدادية من <strong>16 يناير 2027</strong>.</li>
</ul></div>`,
    bodyEn: `<div class="plan-box"><h2>A model week</h2><ul>
<li><strong>Saturday-Monday:</strong> school homework plus one new unit from the monthly plan on the <a href="../../monthly/">curriculum by month</a> page.</li>
<li><strong>Tuesday-Wednesday:</strong> lock in the new units with short Jessica quizzes.</li>
<li><strong>Thursday:</strong> review the whole week and take a short quiz in each subject.</li>
<li><strong>Friday:</strong> rest and play, with free reading only.</li>
</ul></div>
<div class="plan-box"><h2>Suggested daily study time by age</h2><ul>
<li>Primary 1-3: 20-30 minutes with a parent.</li>
<li>Primary 4-6: 45-60 minutes, including 15 minutes of self-revision.</li>
<li>Prep stage: 60-90 minutes split across two subjects, with a short quiz at the end.</li>
</ul></div>
<div class="plan-box"><h2>Key milestones in the term</h2><ul class="dates">
<li><strong>End of each month:</strong> review the month's units from your child's grade page against the monthly plan.</li>
<li><strong>End of December:</strong> the whole curriculum is closed - see the <a href="../december-revision/">December revision plan</a>.</li>
<li><strong>Early January:</strong> past papers and general revision; transfer-grade exams start <strong>9 January 2027</strong>, preparatory certificate <strong>16 January 2027</strong>.</li>
</ul></div>`,
    faqsAr: [
      ['الخطة دي تنفع مع أي جدول مدرسة؟', 'أيوة، لأنها مبنية على وحدات الكتاب الرسمي مش على ترتيب مدرسة معينة. لو المدرسة ماشية أسرع، نقل الوحدات بين الشهور بحرية.'],
      ['ابني بيمل بسرعة، إيه الحل؟', 'قسّم المذاكرة لجلسات قصيرة 15-20 دقيقة بينها راحة، وخلي Jessica هي اللي بتسأل - النجوم والهدايا اليومية بتحافظ على الحماس أطول من المذاكرة التقليدية.'],
    ],
    faqsEn: [
      ['Does this plan work with any school timetable?', 'Yes, because it is built on the official book units, not on one school\'s order. If the school moves faster, shift units between months freely.'],
      ['My child gets bored quickly. What helps?', 'Split study into short 15-20 minute sessions with breaks, and let Jessica do the quizzing - the stars and daily gifts keep motivation up longer than traditional studying.'],
    ],
    linksAr: `<div class="rel-grid"><a href="../../monthly/">📅 المنهج شهر بشهر</a><a href="../exam-schedule-2027/">🗓️ مواعيد الامتحانات</a><a href="../../en/guides/study-plan-term1/">🇬🇧 English version</a></div>`,
    linksEn: `<div class="rel-grid"><a href="../../monthly/">📅 Curriculum by month</a><a href="../exam-schedule-2027/">🗓️ Exam dates</a><a href="../../../guides/study-plan-term1/">🇪🇬 النسخة العربية</a></div>`,
  },
]

for (const guide of guides) {
  // Arabic
  {
    const depth = 2 // welcome/guides/<slug>/
    const canonical = `${BASE}/welcome/guides/${guide.arSlug}/`
    const altEn = `${BASE}/welcome/en/guides/${guide.enSlug}/`
    const reel = guide.reelAr ? reelBlock(depth, guide.reelAr[0], guide.reelAr[1], guide.reelAr[2]) : ''
    const body = `<section class="sub-hero">
  <span class="eyebrow">${guide.ar.eyebrow}</span>
  <h1>${guide.ar.h1}</h1>
  <p>${guide.ar.hero}</p>
  <div class="hero-actions" style="justify-content:center"><a class="btn" href="../../../">افتح Jessica مجانًا ←</a></div>
</section>
${guide.bodyAr}
${reel}
<section><h2>أسئلة شائعة</h2>${faqHtml(guide.faqsAr)}</section>
${guide.linksAr}`
    const html = shell({ lang: 'ar', dir: 'rtl', depth, title: guide.ar.title, description: guide.ar.description, canonical, altAr: canonical, altEn, jsonld: faqJson(guide.faqsAr), body, footerAr: true })
    const dir = path.join('public/welcome/guides', guide.arSlug)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), html)
  }
  // English
  {
    const depth = 3 // welcome/en/guides/<slug>/
    const canonical = `${BASE}/welcome/en/guides/${guide.enSlug}/`
    const altAr = `${BASE}/welcome/guides/${guide.arSlug}/`
    const reel = guide.reelEn ? reelBlock(depth, guide.reelEn[0], guide.reelEn[1], guide.reelEn[2]) : ''
    const body = `<section class="sub-hero">
  <span class="eyebrow">${guide.en.eyebrow}</span>
  <h1>${guide.en.h1}</h1>
  <p>${guide.en.hero}</p>
  <div class="hero-actions" style="justify-content:center"><a class="btn" href="../../../../">Open Jessica for free ←</a></div>
</section>
${guide.bodyEn}
${reel}
<section><h2>Common questions</h2>${faqHtml(guide.faqsEn)}</section>
${guide.linksEn}`
    const html = shell({ lang: 'en', dir: 'ltr', depth, title: guide.en.title, description: guide.en.description, canonical, altAr, altEn: canonical, jsonld: faqJson(guide.faqsEn), body, footerAr: false })
    const dir = path.join('public/welcome/en/guides', guide.enSlug)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), html)
  }
}

console.log('seasonal guides done')
