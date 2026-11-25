import fs from 'node:fs'
import path from 'node:path'

/**
 * Builds the two HTML site maps from public/sitemap.xml.
 *
 * The XML sitemap is for crawlers; this is the human version, and it is also a
 * second internal-link path to every page (including the feature deep dives).
 * Regenerate it after generate-seo so new URLs appear automatically.
 */

const BASE = 'https://bishoynabilanis.github.io/jessica'
const xml = fs.readFileSync('public/sitemap.xml', 'utf8')
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim())

function titleOf(url) {
  const rel = url.replace(`${BASE}/`, '')
  const candidates = [path.join('public', rel, 'index.html'), path.join('public', rel)]
  for (const file of candidates) {
    try {
      const html = fs.readFileSync(file, 'utf8')
      const match = html.match(/<title>([\s\S]*?)<\/title>/i)
      if (!match) continue
      const text = match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim()
      return text.split(/\s+[|—–-]\s+/)[0].trim()
    } catch {
      continue
    }
  }
  return url
}

const esc = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const arHref = (url) => `../../${url.replace(`${BASE}/`, '')}`
const enHref = (url) => {
  const rel = url.replace(`${BASE}/`, '')
  return rel.startsWith('welcome/en/') ? `../${rel.slice('welcome/en/'.length)}` : `../../../${rel}`
}

const links = (items, fn) =>
  items
    .map((url) => `<li><a href="${esc(fn(url))}">${esc(titleOf(url))}</a></li>`)
    .join('\n')

const featuresAr = urls.filter((url) => /\/welcome\/features\/[^/]+\/$/.test(url))
const featuresEn = urls.filter((url) => /\/welcome\/en\/features\/[^/]+\/$/.test(url))
const grades = urls.filter((url) => /\/welcome\/grades\/[^/]+\/$/.test(url))
const topics = urls.filter((url) => /\/welcome\/topics\/[^/]+\/$/.test(url))
const quizzes = urls.filter((url) => /\/welcome\/quiz\/[^/]+\/$/.test(url))
const guides = urls.filter((url) => /\/welcome\/guides\/[^/]+\/$/.test(url))
const monthly = urls.filter((url) => /\/welcome\/monthly\/[^/]+\/$/.test(url))
const enAll = urls.filter((url) => url.includes('/welcome/en/') && url !== `${BASE}/welcome/en/`)
const arCore = [
  `${BASE}/welcome/`,
  `${BASE}/welcome/features/`,
  `${BASE}/welcome/grades/`,
  `${BASE}/welcome/topics/`,
  `${BASE}/welcome/quiz/`,
  `${BASE}/welcome/guides/`,
  `${BASE}/welcome/bank/`,
  `${BASE}/welcome/focus/`,
  `${BASE}/welcome/install/`,
]
const enCore = [
  `${BASE}/welcome/en/`,
  `${BASE}/welcome/en/features/`,
  `${BASE}/welcome/en/grades/`,
  `${BASE}/welcome/en/topics/`,
  `${BASE}/welcome/en/quiz/`,
  `${BASE}/welcome/en/bank/`,
  `${BASE}/welcome/en/focus/`,
  `${BASE}/welcome/en/install/`,
].filter((url) => urls.includes(url))
const enOther = enAll.filter((url) => !enCore.includes(url))

const sharedStyle = `<style>
  .map-grid { display:grid; gap:26px; margin:22px 0 30px; }
  .map-grid section { border:1px solid var(--line); border-radius:20px; padding:18px 20px; background:rgba(255,255,255,.03); }
  .map-grid h2 { font-size:18px; margin:0 0 10px; }
  .map-grid ul { list-style:none; padding:0; margin:0; display:grid; gap:7px; }
  .map-grid a { color:var(--muted); font-size:14px; }
  .map-grid a:hover { color:var(--text); }
  .map-lead { color:var(--muted); line-height:2.1; font-size:15px; }
</style>`

const ar = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>خريطة الموقع — كل صفحات Jessica</title>
<meta name="description" content="كل صفحات جيسيكا في مكان واحد: الصفوف من الأول الابتدائي للتالت الإعدادي، مواضيع المذاكرة، اختبارات سريعة، أدلة، وبنك الأسئلة.">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${BASE}/welcome/sitemap/">
<link rel="alternate" hreflang="ar" href="${BASE}/welcome/sitemap/">
<link rel="alternate" hreflang="en" href="${BASE}/welcome/en/sitemap/">
<link rel="alternate" hreflang="x-default" href="${BASE}/welcome/sitemap/">
<link rel="alternate" type="application/rss+xml" title="Jessica — آخر الصفحات" href="../feed.xml">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="ar_EG">
<meta property="og:url" content="${BASE}/welcome/sitemap/">
<meta property="og:title" content="خريطة الموقع — كل صفحات Jessica">
<meta property="og:description" content="كل صفحات جيسيكا: الصفوف، المواضيع، الاختبارات، الأدلة وبنك الأسئلة.">
<meta property="og:image" content="${BASE}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="خريطة الموقع — كل صفحات Jessica">
<meta name="twitter:description" content="كل صفحات جيسيكا: الصفوف، المواضيع، الاختبارات، الأدلة وبنك الأسئلة.">
<meta name="twitter:image" content="${BASE}/og.jpg">
<link rel="icon" href="../../icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../../icons/icon-192.png">
<link rel="stylesheet" href="../style.css">
${sharedStyle}
</head>
<body>
<header><div class="wrap nav"><a class="brand" href="../">Jessica<span>.</span></a><a class="cta" href="../../">افتح التطبيق</a></div></header>
<main class="wrap">
  <p class="eyebrow" style="margin-top:34px">خريطة الموقع</p>
  <h1>كل صفحات جيسيكا في مكان واحد</h1>
  <p class="map-lead">الصفحة دي خريطة كاملة للموقع: كل صف دراسي، كل موضوع مذاكرة، كل اختبار سريع، كل ميزة مشروحة، وكل دليل. استخدمها لو بتدور على صفحة معينة، أو لو عايز تبدأ من الصف بتاعك بدل ما تلف في القايمة. كل رابط هنا بيوصّل لصفحة فيها شرح كامل وروابط لصفحات تانية، وكلها متاحة بدون حساب ومجانية.</p>
  <p class="map-lead">لو دي أول مرة تزور جيسيكا: ابدأ بصفحة الصف، بعدين نزّل كتاب واحد، وبعدها جرّب اختبار سريع أو بنك الأسئلة. التطبيق بيشتغل على الموبايل والتابلت والكمبيوتر، وبيشتغل أوفلاين بعد أول تحميل، ومش محتاج تسجيل.</p>
  <div class="map-grid">
    <section><h2>الميزات</h2><ul>${links(featuresAr, arHref)}</ul></section>
    <section><h2>الصفوف الدراسية</h2><ul>${links(grades, arHref)}</ul></section>
    <section><h2>مواضيع المذاكرة</h2><ul>${links(topics, arHref)}</ul></section>
    <section><h2>اختبارات سريعة</h2><ul>${links(quizzes, arHref)}</ul></section>
    <section><h2>الأدلة</h2><ul>${links(guides, arHref)}</ul></section>
    <section><h2>المنهج شهر بشهر</h2><ul>${links(monthly, arHref)}</ul></section>
    <section><h2>صفحات التطبيق</h2><ul>${links(arCore, arHref)}</ul></section>
    <section><h2>English pages</h2><ul dir="ltr">${links([...enCore, ...enOther, ...featuresEn], arHref)}</ul></section>
  </div>
  <h2 style="font-size:21px">إزاي تستخدم الخريطة؟</h2>
  <p class="map-lead">لو عندك امتحان قريب: افتح صفحة الصف، اختار المادة، ونزّل كتاب الوزارة، وبعدها افتح بنك الأسئلة واعمل تدريب ١٠ أسئلة على نفس الدرس. لو عندك مشكلة في مهارة معينة: صفحة المواضيع فيها دليل لكل مهارة. ولو عايز تفهم ميزة قبل ما تستخدمها: صفحة الميزات فيها شرح المشكلة والحل والخطوات. وكل صفحة صف فيها روابط للمواد والكتب الرسمية، فمش محتاج ترجع للخريطة كل مرة.</p>
</main>
<footer><div class="wrap foot"><span>© Jessica — صُنع في مصر 🇪🇬</span><span><a href="../">الرئيسية</a> · <a href="../en/sitemap/">English map</a> · <a href="../../">التطبيق</a></span></div></footer>
</body>
</html>
`

const en = `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Site map — every Jessica page</title>
<meta name="description" content="Every Jessica page in one place: grades from Primary 1 to Prep 3, study topics, quick quizzes, guides, feature deep dives and the question bank.">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${BASE}/welcome/en/sitemap/">
<link rel="alternate" hreflang="ar" href="${BASE}/welcome/sitemap/">
<link rel="alternate" hreflang="en" href="${BASE}/welcome/en/sitemap/">
<link rel="alternate" hreflang="x-default" href="${BASE}/welcome/sitemap/">
<link rel="alternate" type="application/rss+xml" title="Jessica — latest pages" href="../../feed.xml">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="en_GB">
<meta property="og:url" content="${BASE}/welcome/en/sitemap/">
<meta property="og:title" content="Site map — every Jessica page">
<meta property="og:description" content="Grades, topics, quizzes, guides, features and the question bank in one index.">
<meta property="og:image" content="${BASE}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Site map — every Jessica page">
<meta name="twitter:description" content="Grades, topics, quizzes, guides, features and the question bank in one index.">
<meta name="twitter:image" content="${BASE}/og.jpg">
<link rel="icon" href="../../../icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../../../icons/icon-192.png">
<link rel="stylesheet" href="../../style.css">
${sharedStyle}
</head>
<body>
<header><div class="wrap nav"><a class="brand" href="../">Jessica<span>.</span></a><a class="cta" href="../../../">Open the app</a></div></header>
<main class="wrap">
  <p class="eyebrow" style="margin-top:34px">Site map</p>
  <h1>Every Jessica page in one place</h1>
  <p class="map-lead">This page is the full index of the site: every grade, every study topic, every quick quiz, every feature deep dive, every guide and the question bank. Use it when you are looking for a specific page, or when you want to start from your own grade instead of scrolling the menu. Each link leads to a complete page with explanations and links to related pages, free and without an account.</p>
  <p class="map-lead">New here? Start with your grade page, download one book, then try a quick quiz or the question bank. Jessica runs on a phone, tablet or computer, works offline after the first load, and never asks for a login.</p>
  <div class="map-grid">
    <section><h2>Features</h2><ul>${links(featuresEn, enHref)}</ul></section>
    <section><h2>English pages</h2><ul>${links(enCore, enHref)}</ul></section>
    <section><h2>English topics</h2><ul>${links(enOther.filter((url) => url.includes('/topics/')), enHref)}</ul></section>
    <section><h2>Arabic pages</h2><ul dir="rtl">${links([...grades, ...topics, ...quizzes, ...guides, ...monthly, ...featuresAr, ...arCore], enHref)}</ul></section>
  </div>
  <h2 style="font-size:21px">How to use this map</h2>
  <p class="map-lead">If an exam is close: open the grade page, pick the subject, download the ministry book, then open the question bank and run a ten-question drill on the same lesson. If one skill is the problem, the topics page has a guide for each skill. To understand a feature before using it, the features pages explain the problem, the solution and the steps. Every grade page links to its subjects and official books, so you rarely need to come back here.</p>
</main>
<footer><div class="wrap foot"><span>© Jessica — made in Egypt 🇪🇬</span><span><a href="../../">Home</a> · <a href="../../sitemap/">الخريطة العربية</a> · <a href="../../../">App</a></span></div></footer>
</body>
</html>
`

fs.mkdirSync('public/welcome/sitemap', { recursive: true })
fs.mkdirSync('public/welcome/en/sitemap', { recursive: true })
fs.writeFileSync('public/welcome/sitemap/index.html', ar)
fs.writeFileSync('public/welcome/en/sitemap/index.html', en)
console.log(`html sitemap: ${urls.length} URLs · ${featuresAr.length + featuresEn.length} features`)
