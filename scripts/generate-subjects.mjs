import fs from 'node:fs'
import path from 'node:path'
import { SUBJECT_META, SUBJECT_FAQ_AR, SUBJECT_FAQ_EN, REELS } from './subjects-data.mjs'
import { TOC_UNITS } from './toc-units.mjs'

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
  1: { slug: 'primary-1', ar: 'الأول الابتدائي', colloq: 'أولى ابتدائي', en: 'Primary 1', stage: 'primary' },
  2: { slug: 'primary-2', ar: 'الثاني الابتدائي', colloq: 'تانية ابتدائي', en: 'Primary 2', stage: 'primary' },
  3: { slug: 'primary-3', ar: 'الثالث الابتدائي', colloq: 'تالتة ابتدائي', en: 'Primary 3', stage: 'primary' },
  4: { slug: 'primary-4', ar: 'الرابع الابتدائي', colloq: 'رابعة ابتدائي', en: 'Primary 4', stage: 'primary' },
  5: { slug: 'primary-5', ar: 'الخامس الابتدائي', colloq: 'خامسة ابتدائي', en: 'Primary 5', stage: 'primary' },
  6: { slug: 'primary-6', ar: 'السادس الابتدائي', colloq: 'سادسة ابتدائي', en: 'Sixth Primary'.replace('Sixth', 'Primary 6'), stage: 'primary' },
  7: { slug: 'prep-1', ar: 'الأول الإعدادي', colloq: 'أولى إعدادي', en: 'Prep 1', stage: 'prep' },
  8: { slug: 'prep-2', ar: 'الثاني الإعدادي', colloq: 'تانية إعدادي', en: 'Prep 2', stage: 'prep' },
  9: { slug: 'prep-3', ar: 'الثالث الإعدادي', colloq: 'تالتة إعدادي', en: 'Prep 3', stage: 'prep' },
}
GRADES[6].en = 'Primary 6'

const combos = new Map()
for (const b of books.filter((x) => x.term === 'Term 1')) {
  const key = `${b.grade}|${b.subject}`
  if (!combos.has(key)) combos.set(key, [])
  combos.get(key).push(b)
}

function unitsFor(list, preferLang) {
  const preferred = list.find((b) => b.language === preferLang) || list[0]
  return TOC_UNITS[preferred.id] || null
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function faqSection(faqItems) {
  const html = faqItems.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')
  const json = JSON.stringify(
    faqItems.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  )
  return { html, json }
}

const STYLE = `
  .sub-hero { padding: 60px 0 20px; text-align: center; }
  .sub-hero h1 { font-size: clamp(28px, 4vw, 42px); margin: 12px 0; }
  .sub-hero p { color: var(--muted); max-width: 680px; margin-inline: auto; line-height: 2; }
  .books-table { width: 100%; border-collapse: collapse; margin-top: 22px; border-radius: 18px; overflow: hidden; }
  .books-table th, .books-table td { border-bottom: 1px solid var(--line); padding: 12px 14px; text-align: start; font-size: 13px; }
  .books-table th { background: rgba(255,255,255,.04); color: var(--muted); font-weight: 700; }
  .book-link { display: inline-flex; padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(46,230,197,.3); background: rgba(46,230,197,.08); color: var(--mint); font-weight: 700; }
  .units { margin-top: 30px; }
  .units h2 { font-size: 22px; margin-bottom: 12px; }
  .units ol { display: grid; gap: 8px; padding-inline-start: 20px; }
  .units li { color: var(--muted); font-size: 14px; line-height: 1.9; }
  .reel { margin-top: 30px; text-align: center; }
  .reel video { width: 100%; max-width: 400px; border-radius: 18px; border: 1px solid var(--line); background: #000; }
  .reel-cap { color: var(--muted); font-size: 13px; margin-top: 8px; }
  .tips { margin-top: 30px; }
  .tips h2 { font-size: 22px; margin-bottom: 12px; }
  .tips ul { display: grid; gap: 10px; padding-inline-start: 20px; }
  .tips li { color: var(--muted); font-size: 14px; line-height: 1.95; }
  .faq { margin-top: 30px; }
  .faq h2 { font-size: 22px; margin-bottom: 12px; }
  .faq details { border: 1px solid var(--line); border-radius: 16px; padding: 14px 16px; background: rgba(255,255,255,.03); margin-bottom: 8px; }
  .faq summary { cursor: pointer; font-weight: 700; font-size: 14px; }
  .faq p { margin-top: 8px; color: var(--muted); font-size: 13px; line-height: 1.9; }
  .rel-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 30px; }
  .rel-grid a { border: 1px solid var(--line); border-radius: 999px; padding: 8px 14px; font-size: 12px; font-weight: 700; color: var(--muted); }
  .rel-grid a:hover { color: var(--text); border-color: rgba(46,230,197,.35); }
  .note { font-size: 12px; color: var(--muted); line-height: 1.9; margin-top: 16px; }
`

function headAr({ title, description, canonical, enUrl }) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="ar" href="${canonical}">
<link rel="alternate" hreflang="en" href="${enUrl}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="ar_EG">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${BASE}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${BASE}/og.jpg">
<link rel="icon" href="../../../../icons/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="../../../style.css">
<style>${STYLE}</style>
</head>`
}

function headEn({ title, description, canonical, arUrl }) {
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${canonical}">
<link rel="alternate" hreflang="ar" href="${arUrl}">
<link rel="alternate" hreflang="x-default" href="${arUrl}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="en_US">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${BASE}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${BASE}/og.jpg">
<link rel="icon" href="../../../../../icons/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="../../../../style.css">
<style>${STYLE}</style>
</head>`
}

const FOOT_AR = `<footer><div class="wrap foot"><span>© Jessica — صُنع في مصر 🇪🇬</span><span><a href="../../../">الرئيسية</a> · <a href="../../../sitemap/">خريطة الموقع</a> · <a href="../../../../#/disclaimer">إخلاء المسؤولية</a></span></div></footer>
</body>
</html>`
const FOOT_EN = `<footer><div class="wrap foot"><span>© Jessica — Made in Egypt 🇪🇬</span><span><a href="../../../">Home</a> · <a href="../../../sitemap/">Sitemap</a> · <a href="../../../../../#/disclaimer">Disclaimer</a></span></div></footer>
</body>
</html>`

let written = 0
for (const [key, list] of [...combos.entries()].sort()) {
  const [gradeNum, subject] = key.split('|')
  const g = GRADES[gradeNum]
  const meta = SUBJECT_META[subject]
  if (!g || !meta) { console.log('skip', key); continue }
  const arBook = list.find((b) => b.language === 'ar')
  const units = unitsFor(list, 'ar') || unitsFor(list, 'en')
  const band = g.stage
  const reel = REELS[key]

  // ---------- Arabic page ----------
  const arUrl = `${BASE}/welcome/grades/${g.slug}/${meta.slug}/`
  const enUrl = `${BASE}/welcome/en/grades/${g.slug}/${meta.slug}/`
  const rows = list
    .map((b) => `<tr><td>${b.language === 'ar' ? 'النسخة العربية' : b.language === 'fr' ? 'كتاب اللغة الفرنسية' : 'English edition'}</td><td>${esc(b.title)}</td><td>${b.sizeMb} MB</td><td><a class="book-link" href="${b.url}" target="_blank" rel="noreferrer">تحميل PDF</a></td></tr>`)
    .join('')
  const unitsHtml = units
    ? `<section class="units"><h2>منهج ${meta.ar} ${g.colloq}: وحدات الترم الأول 2026/2027</h2><ol>${units.map((u) => `<li>${esc(u)}</li>`).join('')}</ol></section>`
    : ''
  const reelHtmlAr = reel?.ar
    ? `<section class="reel"><h2>شوف Jessica شغالة إزاي</h2><video controls preload="none" playsinline poster="../../../media/reels/${reel.ar.id}.jpg"><source src="../../../media/reels/${reel.ar.id}.mp4" type="video/mp4"></video><p class="reel-cap">${esc(reel.ar.caption)}</p></section>`
    : ''
  const tips = meta.tipsAr[band]
  const faqItems = [
    ...(SUBJECT_FAQ_AR[subject] || []),
    ['الكتاب ده رسمي فعلاً؟', `أيوه، الرابط مباشر من سيرفر وزارة التربية والتعليم، وحقوق الطبع محفوظة للوزارة. التحميل مجاني تمامًا.`],
    ['ده منهج 2026/2027 الجديد؟', 'أيوه، ده أحدث إصدار من كتب وزارة التربية والتعليم للعام الدراسي 2026/2027، وبنراجع الروابط مع بداية كل ترم.'],
    ['إزاي أذاكر الكتاب أوفلاين؟', 'نزّل الـ PDF مرة واحدة واستورده في تطبيق Jessica. بعد كده تقرأه وتسأل عن أي صفحة من غير إنترنت.'],
    ['أراجع إزاي قبل الامتحان؟', `استخدم قائمة الوحدات اللي فوق كخطة مراجعة نهائية: خلص وحدة وحدة وحل تدريباتها. وبعدها جرّب <a href="../../../quiz/${g.slug}/">اختبارات ${g.colloq}</a> عشان تقيس مستواك.`],
  ]
  const faq = faqSection(faqItems)
  const arTitle = `تحميل كتاب ${meta.arShort || meta.ar} ${g.colloq} الترم الأول 2026 | Jessica`
  const arDesc = `تحميل كتاب ${meta.ar} الصف ${g.ar} الترم الأول PDF، منهج الوزارة 2026/2027، من سيرفر وزارة التربية والتعليم مباشرة - مع وحدات الكتاب مجانًا.`
  const relAr = [
    `<a href="../">📚 كل كتب ${g.ar}</a>`,
    ...[...combos.keys()].filter((k) => k.startsWith(`${gradeNum}|`) && k !== key).map((k) => {
      const m = SUBJECT_META[k.split('|')[1]]
      return m ? `<a href="../${m.slug}/">${m.ar} ${g.colloq}</a>` : ''
    }).filter(Boolean),
    `<a href="../../../quiz/${g.slug}/">📝 اختبارات ${g.colloq} أونلاين</a>`,
    `<a href="../../../guides/ministry-books-download/">📥 إزاي تحمّل كتب الوزارة من الموقع الرسمي</a>`,
    `<a href="../../../en/grades/${g.slug}/${meta.slug}/">🇬🇧 English version</a>`,
  ].join('')
  const arPage = `${headAr({ title: arTitle, description: arDesc, canonical: arUrl, enUrl })}
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"CollectionPage","name":"${esc(arTitle)}","description":"${esc(arDesc)}","url":"${arUrl}","inLanguage":"ar"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":${faq.json}}
</script>
<body>
<div class="bg-glow"></div>
<header><div class="wrap nav"><a class="brand" href="../../../"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="../../../../">افتح التطبيق</a></div></header>
<main><div class="wrap">
<section class="sub-hero">
  <span class="eyebrow">🇪🇬 منهج وزارة التربية والتعليم 2026/2027</span>
  <h1>تحميل كتاب ${meta.ar} ${g.colloq} الترم الأول PDF</h1>
  <p>النسخة الرسمية من كتاب ${meta.ar} للصف ${g.ar} للترم الأول 2026/2027، بتحميل مباشر من سيرفر الوزارة. نزّله واستورده في Jessica مرة واحدة وذاكر منه أوفلاين.</p>
  <div class="hero-actions" style="justify-content:center"><a class="btn" href="../../../../">افتح Jessica مجانًا ←</a></div>
</section>
<section>
  <div class="section-head"><h2>تحميل الكتاب من سيرفر الوزارة الرسمي</h2><p>روابط مباشرة لملفات وزارة التربية والتعليم، مجانًا ومن غير حساب.</p></div>
  <table class="books-table"><thead><tr><th>النسخة</th><th>الكتاب</th><th>الحجم</th><th>التحميل</th></tr></thead><tbody>${rows}</tbody></table>
  <p class="note">حقوق الطبع والنشر ملك وزارة التربية والتعليم. الاستخدام للمذاكرة الشخصية فقط.</p>
</section>
${unitsHtml}
${reelHtmlAr}
<section class="tips"><h2>إزاي تذاكر ${meta.ar} في ${g.colloq}؟ نصائح ومراجعة نهائية</h2><ul>${tips.map((t) => `<li>${t}</li>`).join('')}</ul></section>
<section class="faq"><h2>أسئلة شائعة</h2>${faq.html}</section>
<div class="rel-grid">${relAr}</div>
</div></main>
${FOOT_AR}`
  const arDir = path.join('public/welcome/grades', g.slug, meta.slug)
  fs.mkdirSync(arDir, { recursive: true })
  fs.writeFileSync(path.join(arDir, 'index.html'), arPage)
  written++

  // ---------- English page ----------
  const enUnits = unitsFor(list, 'en') || units
  const reelHtmlEn = reel?.en
    ? `<section class="reel"><h2>See Jessica in action</h2><video controls preload="none" playsinline poster="../../../../media/reels/${reel.en.id}.jpg"><source src="../../../../media/reels/${reel.en.id}.mp4" type="video/mp4"></video><p class="reel-cap">${esc(reel.en.caption)}</p></section>`
    : ''
  const rowsEn = list
    .map((b) => `<tr><td>${b.language === 'ar' ? 'Arabic edition' : b.language === 'fr' ? 'French edition' : 'English edition'}</td><td>${esc(b.title)}</td><td>${b.sizeMb} MB</td><td><a class="book-link" href="${b.url}" target="_blank" rel="noreferrer">Download PDF</a></td></tr>`)
    .join('')
  const unitsHtmlEn = enUnits
    ? `<section class="units"><h2>${meta.en} ${g.en} curriculum: Term 1 units (2026/2027)</h2><ol>${enUnits.map((u) => `<li>${esc(u)}</li>`).join('')}</ol></section>`
    : ''
  const tipsEn = meta.tipsEn[band]
  const faqItemsEn = [
    ...(SUBJECT_FAQ_EN[subject] || []),
    ['Is this the official textbook?', 'Yes. The link goes directly to the Egyptian Ministry of Education servers, and copyright stays with the Ministry. Download is completely free.'],
    ['Is this the new 2026/2027 edition?', 'Yes. These are the latest Ministry of Education textbooks for the 2026/2027 school year, and we review the links at the start of every term.'],
    ['How do I study this book offline?', 'Download the PDF once and import it into the Jessica app. After that you can read it and ask about any page without internet.'],
    ['How do I revise before the exam?', `Use the unit list above as your final revision plan: finish one unit at a time with its exercises, then try the <a href="../../../../quiz/${g.slug}/">${g.en} quizzes</a> to check your level.`],
  ]
  const faqEn = faqSection(faqItemsEn)
  const enTitle = `${g.en} ${meta.en} Textbook Term 1 - Free PDF | Jessica`
  const enDesc = `Download the official Egyptian Ministry ${meta.en} textbook for ${g.en}, Term 1 (2026/2027), as a free PDF, with the book units and study tips in Jessica.`
  const relEn = [
    `<a href="../">📚 All ${g.en} books</a>`,
    ...[...combos.keys()].filter((k) => k.startsWith(`${gradeNum}|`) && k !== key).map((k) => {
      const m = SUBJECT_META[k.split('|')[1]]
      return m ? `<a href="../${m.slug}/">${m.en} ${g.en}</a>` : ''
    }).filter(Boolean),
    `<a href="../../../guides/download-ministry-books/">📥 How to download Ministry books from the official site</a>`,
    `<a href="${arUrl.replace(`${BASE}/welcome/`, '../../../')}">🇪🇬 النسخة العربية</a>`,
  ].join('')
  const enPage = `${headEn({ title: enTitle, description: enDesc, canonical: enUrl, arUrl })}
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"CollectionPage","name":"${esc(enTitle)}","description":"${esc(enDesc)}","url":"${enUrl}","inLanguage":"en"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":${faqEn.json}}
</script>
<body>
<div class="bg-glow"></div>
<header><div class="wrap nav"><a class="brand" href="../../../"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="../../../../../">Open the app</a></div></header>
<main><div class="wrap">
<section class="sub-hero">
  <span class="eyebrow">🇪🇬 Egyptian Ministry of Education textbook</span>
  <h1>Download the ${meta.en} Textbook for ${g.en} - Term 1 (2026/2027)</h1>
  <p>The official ${meta.en} textbook for ${g.en}, Term 1 of the 2026/2027 school year, with a direct download from the Ministry servers. Download it once, import it into Jessica, and study it offline.</p>
  <div class="hero-actions" style="justify-content:center"><a class="btn" href="../../../../../">Open Jessica for free ←</a></div>
</section>
<section>
  <div class="section-head"><h2>Official download</h2><p>Direct links from the Egyptian Ministry of Education servers.</p></div>
  <table class="books-table"><thead><tr><th>Edition</th><th>Book</th><th>Size</th><th>Download</th></tr></thead><tbody>${rowsEn}</tbody></table>
  <p class="note">Copyright belongs to the Egyptian Ministry of Education. For personal study use only.</p>
</section>
${unitsHtmlEn}
${reelHtmlEn}
<section class="tips"><h2>How to study ${meta.en} in ${g.en} - tips and final revision</h2><ul>${tipsEn.map((t) => `<li>${t}</li>`).join('')}</ul></section>
<section class="faq"><h2>Common questions</h2>${faqEn.html}</section>
<div class="rel-grid">${relEn}</div>
</div></main>
${FOOT_EN}`
  const enDir = path.join('public/welcome/en/grades', g.slug, meta.slug)
  fs.mkdirSync(enDir, { recursive: true })
  fs.writeFileSync(path.join(enDir, 'index.html'), enPage)
  written++
}
console.log('subject pages written:', written)

// ---------- English grade overview pages ----------
for (const [gradeNum, g] of Object.entries(GRADES)) {
  const list = books.filter((b) => b.grade === Number(gradeNum) && b.term === 'Term 1').sort((a, b) => a.subject.localeCompare(b.subject))
  if (!list.length) continue
  const canonical = `${BASE}/welcome/en/grades/${g.slug}/`
  const arUrl = `${BASE}/welcome/grades/${g.slug}/`
  const subjects = [...new Set(list.map((b) => b.subject))]
  const rows = list.map((b) => `<tr><td>${SUBJECT_META[b.subject] ? SUBJECT_META[b.subject].en : b.subject}</td><td>${esc(b.title)}</td><td>${b.sizeMb} MB</td><td><a class="book-link" href="${b.url}" target="_blank" rel="noreferrer">Download PDF</a></td></tr>`).join('')
  const subLinks = subjects.map((s) => SUBJECT_META[s] ? `<a href="./${SUBJECT_META[s].slug}/">${SUBJECT_META[s].en} ${g.en}</a>` : '').filter(Boolean).join('')
  const title = `${g.en} Textbooks Term 1 - Free PDF Downloads | Jessica`
  const description = `All official Egyptian Ministry textbooks for ${g.en}, Term 1: ${list.length} free PDF books with direct links, plus offline studying in the Jessica app.`
  const pageHtml = `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${canonical}">
<link rel="alternate" hreflang="ar" href="${arUrl}">
<link rel="alternate" hreflang="x-default" href="${arUrl}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="en_US">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${BASE}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${BASE}/og.jpg">
<link rel="icon" href="../../../../icons/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="../../../style.css">
<style>${STYLE}</style>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"CollectionPage","name":"${esc(title)}","description":"${esc(description)}","url":"${canonical}","inLanguage":"en"}
</script>
</head>
<body>
<div class="bg-glow"></div>
<header><div class="wrap nav"><a class="brand" href="../../"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="../../../../">Open the app</a></div></header>
<main><div class="wrap">
<section class="sub-hero">
  <span class="eyebrow">🇪🇬 ${list.length} official books</span>
  <h1>${g.en} Textbooks - Term 1</h1>
  <p>Every official Egyptian Ministry of Education textbook available for ${g.en}, Term 1, as free PDF downloads. Download any book once, import it into Jessica, and study offline with an AI tutor that answers from your book.</p>
  <div class="hero-actions" style="justify-content:center"><a class="btn" href="../../../../">Open Jessica for free ←</a></div>
</section>
<section>
  <div class="section-head"><h2>Available books</h2><p>Direct links from the Ministry servers. Download once and import into the app.</p></div>
  <table class="books-table"><thead><tr><th>Subject</th><th>Book</th><th>Size</th><th>Download</th></tr></thead><tbody>${rows}</tbody></table>
  <p class="note">Copyright belongs to the Egyptian Ministry of Education. For personal study use only. If your subject is missing, you can import any PDF from your device inside the app.</p>
</section>
<section class="tips"><h2>Browse by subject</h2><div class="rel-grid">${subLinks}</div></section>
<section class="tips"><h2>Why study from the official book?</h2><ul>
<li>Exam questions are written from the official textbook, so studying it directly saves time and surprises.</li>
<li>Jessica turns the PDF into an interactive tutor: ask about any page, get explanations and quiz questions, all offline after a one-time import.</li>
<li>All books here are free and hosted on the Ministry's own servers - no accounts, no fees.</li>
</ul></section>
<div class="rel-grid"><a href="../../guides/download-ministry-books/">📥 How to download Ministry books from the official site</a><a href="../../../">🏠 Jessica in English</a><a href="../../../../welcome/grades/${g.slug}/">🇪🇬 النسخة العربية</a></div>
</div></main>
<footer><div class="wrap foot"><span>© Jessica — Made in Egypt 🇪🇬</span><span><a href="../../">Home</a> · <a href="../../sitemap/">Sitemap</a> · <a href="../../../../#/disclaimer">Disclaimer</a></span></div></footer>
</body>
</html>`
  const dir = path.join('public/welcome/en/grades', g.slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), pageHtml)
  written++
}
console.log('total pages written:', written)

// ---------- English guide: how to download Ministry books ----------
{
  const canonical = `${BASE}/welcome/en/guides/download-ministry-books/`
  const arUrl = `${BASE}/welcome/guides/ministry-books-download/`
  const title = 'Download Ministry Textbooks 2026/2027 (Free PDFs) | Jessica'
  const description = 'Download official Egyptian Ministry of Education textbooks 2026/2027 as free PDFs for every primary and preparatory grade, and study them offline with Jessica.'
  const steps = [
    ['Open the official Ministry library', 'Go to the Ministry of Education digital library (the EKB / ministry content portal) and choose your stage: primary or preparatory. Every book on Jessica links straight to these official files.'],
    ['Pick your grade and term', 'Books are organized by grade and by term. Make sure you choose Term 1 or Term 2 correctly - the same subject has a different book each term.'],
    ['Download the PDF once', 'Tap the download link and save the PDF to your phone or computer. Files are large, so use Wi-Fi when you can.'],
    ['Import the book into Jessica', 'Open Jessica, choose import, and select the PDF. The app indexes the book so you can search it, ask questions about any page, and get quiz questions - all offline.'],
    ['Study a little every day', 'Ten focused minutes daily beat a long session before the exam. Use the book units listed on each Jessica grade page as your checklist.'],
  ]
  const faqItems = [
    ['Are these books really free?', 'Yes. The Ministry publishes them for all students. Jessica never charges for the books - it only helps you study them.'],
    ['The download link does not open. What now?', 'Ministry servers are sometimes slow at the start of the school year. Try again later, or download on Wi-Fi. All Jessica links point to the official files, so a retry usually works.'],
    ['Can I read the books without internet?', 'Yes. After importing the PDF into Jessica once, reading, search, notes, and quizzes all work offline.'],
  ]
  const faq = faqSection(faqItems)
  const html = `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${canonical}">
<link rel="alternate" hreflang="ar" href="${arUrl}">
<link rel="alternate" hreflang="x-default" href="${arUrl}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="en_US">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${BASE}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${BASE}/og.jpg">
<link rel="icon" href="../../../../icons/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="../../../style.css">
<style>${STYLE}</style>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"HowTo","name":"How to download Egyptian Ministry textbooks","description":"${esc(description)}","step":${JSON.stringify(steps.map(([h, p], i) => ({ '@type': 'HowToStep', position: i + 1, name: h, text: p })))}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":${faq.json}}
</script>
</head>
<body>
<div class="bg-glow"></div>
<header><div class="wrap nav"><a class="brand" href="../../"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="../../../../">Open the app</a></div></header>
<main><div class="wrap">
<section class="sub-hero">
  <span class="eyebrow">📥 Free official books</span>
  <h1>How to Download Egyptian Ministry Textbooks 2026/2027 from the Official Site</h1>
  <p>Every student in Egypt can download the official textbooks for free. This guide shows the exact steps, and how to turn the PDF into an offline study companion with Jessica.</p>
</section>
<section class="tips"><h2>The five steps</h2><ul>${steps.map(([h, p]) => `<li><b>${h}.</b> ${p}</li>`).join('')}</ul></section>
<section class="reel"><h2>Watch a full walkthrough</h2><video controls preload="none" playsinline poster="../../../media/reels/jessica-first-book.jpg"><source src="../../../media/reels/jessica-first-book.mp4" type="video/mp4"></video><p class="reel-cap">A complete first-book walkthrough: download, import, and open the Primary 4 Arabic book in Jessica.</p></section>
<section class="tips"><h2>Why the official book matters</h2><ul>
<li>Exam questions are written from the official textbook, so it is the most reliable study source.</li>
<li>The books are updated every year - always download the current year edition.</li>
<li>With Jessica you can ask questions about any page and get quiz questions from your exact book, offline.</li>
</ul></section>
<section class="faq"><h2>Common questions</h2>${faq.html}</section>
<div class="rel-grid"><a href="../../grades/">📚 Browse books by grade</a><a href="../../">🏠 Jessica in English</a><a href="../../../guides/ministry-books-download/">🇪🇬 النسخة العربية</a></div>
</div></main>
<footer><div class="wrap foot"><span>© Jessica — Made in Egypt 🇪🇬</span><span><a href="../../">Home</a> · <a href="../../sitemap/">Sitemap</a> · <a href="../../../../#/disclaimer">Disclaimer</a></span></div></footer>
</body>
</html>`
  const dir = 'public/welcome/en/guides/download-ministry-books'
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), html)
  console.log('en guide written')
}

// ---------- English grades index ----------
{
  const canonical = `${BASE}/welcome/en/grades/`
  const title = 'Ministry Textbooks by Grade - Free PDF Downloads | Jessica'
  const description = 'Download official Egyptian Ministry of Education textbooks for every primary and preparatory grade as free PDFs, and study them offline with Jessica.'
  const cards = Object.values(GRADES).map((g) => {
    const count = books.filter((b) => b.term === 'Term 1' && GRADES[b.grade] && GRADES[b.grade].slug === g.slug).length
    return `<a class="grade" href="./${g.slug}/" style="border:1px solid var(--line);border-radius:18px;padding:16px 18px;background:rgba(255,255,255,.03);display:flex;flex-direction:column;gap:4px"><strong>${g.en}</strong><span style="font-size:11px;color:var(--muted)">${count} books</span></a>`
  }).join('')
  const html = `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${canonical}">
<link rel="alternate" hreflang="ar" href="${BASE}/welcome/grades/">
<link rel="alternate" hreflang="x-default" href="${BASE}/welcome/grades/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="en_US">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${BASE}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${BASE}/og.jpg">
<link rel="icon" href="../../../icons/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="../../style.css">
<style>.sub-hero{padding:60px 0 20px;text-align:center}.sub-hero h1{font-size:clamp(28px,4vw,42px);margin:12px 0}.sub-hero p{color:var(--muted);max-width:680px;margin-inline:auto;line-height:2}.grades{display:grid;gap:10px;grid-template-columns:repeat(3,1fr);margin-top:22px}@media(max-width:860px){.grades{grid-template-columns:1fr 1fr}}@media(max-width:560px){.grades{grid-template-columns:1fr}}.about{margin-top:34px;color:var(--muted);font-size:13.5px;line-height:2}</style>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"CollectionPage","name":"${esc(title)}","description":"${esc(description)}","url":"${canonical}","inLanguage":"en"}
</script>
</head>
<body>
<div class="bg-glow"></div>
<header><div class="wrap nav"><a class="brand" href="../"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="../../../">Open the app</a></div></header>
<main><div class="wrap">
<section class="sub-hero">
  <span class="eyebrow">🇪🇬 ${books.filter((b) => b.term === 'Term 1').length} official books</span>
  <h1>Ministry Textbooks for Every Grade</h1>
  <p>From Primary 1 to Prep 3. Pick your grade, download the official Term 1 books with direct links, and import them into Jessica once to study offline.</p>
</section>
<div class="grades">${cards}</div>
<section class="about">
  <h2 style="font-size:20px;margin-bottom:10px">How to pick the right book?</h2>
  <p>Each grade page lists the official Term 1 books per subject, hosted on the Ministry servers. Start with one subject, download it, and import it into the app - reading, search, and quizzes then work offline.</p>
  <p>Not sure which book you need? Every subject page shows the exact units inside the Term 1 book, so you can match the book to what your class is studying right now. The catalog covers primary grades one to six and preparatory grades one to three, and it is updated at the start of every term.</p>
  <p>All books are published by the Egyptian Ministry of Education and are free for every student. Jessica never charges for the books themselves; the app simply turns the official PDF into an interactive tutor that explains pages, answers questions, and builds quizzes from your exact curriculum, with no account needed.</p>
</section>
</div></main>
<footer><div class="wrap foot"><span>© Jessica — Made in Egypt 🇪🇬</span><span><a href="../">Home</a> · <a href="../sitemap/">Sitemap</a> · <a href="../../../#/disclaimer">Disclaimer</a></span></div></footer>
</body>
</html>`
  fs.mkdirSync('public/welcome/en/grades', { recursive: true })
  fs.writeFileSync('public/welcome/en/grades/index.html', html)
  console.log('en grades index written')
}
