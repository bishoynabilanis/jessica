import fs from 'node:fs'
import path from 'node:path'
import { FEATURES } from './features-data.mjs'

const BASE = 'https://bishoynabilanis.github.io/jessica'
const TODAY = new Date().toISOString().slice(0, 10)

const esc = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function layout({ lang, title, description, canonical, alternate, css, icons, og, feed, body, schema }) {
  const rtl = lang === 'ar'
  return `<!doctype html>
<html lang="${lang}" dir="${rtl ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="ar" href="${alternate.ar}">
<link rel="alternate" hreflang="en" href="${alternate.en}">
<link rel="alternate" hreflang="x-default" href="${alternate.ar}">
<link rel="alternate" type="application/rss+xml" title="Jessica" href="${feed}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="${rtl ? 'ar_EG' : 'en_GB'}">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${og}">
<link rel="icon" href="${icons}icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${icons}icon-192.png">
<link rel="stylesheet" href="${css}">
${schema.map((item) => `<script type="application/ld+json">${jsonLd(item)}</script>`).join('\n')}
<style>
  .feature-hero { max-width: 860px; padding: 44px 0 10px; }
  .feature-hero h1 { font-size: clamp(30px, 5vw, 50px); line-height: 1.35; margin: 14px 0 12px; }
  .feature-hero .lead { color: var(--muted); font-size: 18px; line-height: 2; }
  .feature-cta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
  .feature-body { max-width: 860px; padding-bottom: 54px; }
  .feature-body h2 { font-size: 24px; margin: 36px 0 10px; }
  .feature-body h3 { font-size: 17px; margin: 18px 0 6px; }
  .feature-body p { color: var(--muted); font-size: 15px; line-height: 2.15; margin-bottom: 10px; }
  .feature-body ul { margin: 12px 0 18px; padding-inline-start: 20px; display: grid; gap: 8px; color: var(--muted); font-size: 15px; line-height: 1.9; }
  .feature-body li b { color: var(--text); }
  .steps { display: grid; gap: 12px; margin: 16px 0 22px; }
  .step { border: 1px solid var(--line); background: rgba(255,255,255,.03); border-radius: 18px; padding: 16px 18px; }
  .step b { display: block; margin-bottom: 5px; }
  .step p { margin: 0; font-size: 14px; }
  .faq { display: grid; gap: 10px; margin: 14px 0 24px; }
  .faq details { border: 1px solid var(--line); border-radius: 16px; padding: 12px 16px; background: rgba(255,255,255,.02); }
  .faq summary { cursor: pointer; font-weight: 800; }
  .faq p { margin: 8px 0 0; font-size: 14px; }
  .related { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; margin: 20px 0 10px; }
  .related a { display: block; border: 1px solid var(--line); border-radius: 18px; padding: 14px 16px; background: rgba(255,255,255,.03); color: var(--text); }
  .related a span { display: block; color: var(--muted); font-size: 12px; line-height: 1.8; margin-top: 5px; }
  .related a:hover { border-color: rgba(33,230,201,.45); }
  .cta-box { margin: 30px 0 10px; border: 1px solid rgba(33,230,201,.35); background: linear-gradient(140deg, rgba(33,230,201,.12), rgba(107,140,255,.08)); border-radius: 24px; padding: 22px 24px; }
  .cta-box h2 { margin: 0 0 6px; font-size: 20px; }
  .cta-box p { margin: 0 0 12px; }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin: 24px 0 10px; }
  .feature-card { display: block; border: 1px solid var(--line); border-radius: 22px; padding: 20px; background: rgba(255,255,255,.03); color: var(--text); transition: transform .18s ease, border-color .18s ease; }
  .feature-card:hover { transform: translateY(-2px); border-color: rgba(33,230,201,.45); }
  .feature-card .ic { font-size: 26px; }
  .feature-card h2 { font-size: 18px; margin: 10px 0 6px; }
  .feature-card p { margin: 0 0 10px; font-size: 13px; line-height: 1.9; }
  .feature-card .more { color: #21e6c9; font-size: 12px; font-weight: 800; }
</style>
</head>
<body>
${body}
</body>
</html>
`
}

function header(lang, home, app, sitemap, featuresHref, otherHref) {
  const rtl = lang === 'ar'
  const label = rtl ? 'خريطة الموقع' : 'Site map'
  const other = rtl ? 'English' : 'العربية'
  return `<header><div class="wrap nav"><a class="brand" href="${home}">Jessica<span>.</span></a>
<span style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
<a href="${featuresHref}">${rtl ? 'كل الميزات' : 'All features'}</a>
<a href="${sitemap}">${label}</a>
<a href="${otherHref}" hreflang="${rtl ? 'en' : 'ar'}">${other}</a>
<a class="btn sm" href="${app}">${rtl ? 'افتح التطبيق' : 'Open the app'}</a>
</span></div></header>`
}

function footer(lang, home, app, sitemap, featuresHref) {
  const rtl = lang === 'ar'
  return `<footer><div class="wrap foot"><span>© Jessica — ${rtl ? 'صُنع في مصر 🇪🇬' : 'made in Egypt 🇪🇬'}</span><span>
<a href="${home}">${rtl ? 'الرئيسية' : 'Home'}</a> ·
<a href="${featuresHref}">${rtl ? 'الميزات' : 'Features'}</a> ·
<a href="${sitemap}">${rtl ? 'خريطة الموقع' : 'Site map'}</a> ·
<a href="${app}">${rtl ? 'التطبيق' : 'App'}</a>
</span></div></footer>`
}

function featurePage(feature, lang) {
  const copy = feature[lang]
  const rtl = lang === 'ar'
  const isAr = lang === 'ar'
  const prefix = isAr ? '../../' : '../../../'
  const home = isAr ? '../../' : '../../'
  const app = isAr ? '../../../' : '../../../../'
  const css = isAr ? '../../style.css' : '../../../style.css'
  const icons = isAr ? '../../../icons/' : '../../../../icons/'
  const og = isAr ? '../../../og.jpg' : '../../../../og.jpg'
  const sitemap = isAr ? '../../sitemap/' : '../../sitemap/'
  const featuresHref = isAr ? '../' : '../'
  const otherHref = isAr ? `../../en/features/${feature.slug}/` : `../../../features/${feature.slug}/`
  const canonical = `${BASE}/welcome/${isAr ? '' : 'en/'}features/${feature.slug}/`
  const alternate = {
    ar: `${BASE}/welcome/features/${feature.slug}/`,
    en: `${BASE}/welcome/en/features/${feature.slug}/`,
  }

  const related = feature.related
    .map((slug) => FEATURES.find((item) => item.slug === slug))
    .filter(Boolean)
    .map(
      (item) => `<a href="../${item.slug}/"><b>${item.emoji} ${esc(item[lang].h1)}</b><span>${esc(item[lang].lead.split('. ')[0])}.</span></a>`,
    )
    .join('\n')

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: copy.title,
      description: copy.description,
      inLanguage: lang,
      datePublished: TODAY,
      dateModified: TODAY,
      image: `${BASE}/og.jpg`,
      author: { '@type': 'Organization', name: 'Jessica' },
      publisher: { '@type': 'Organization', name: 'Jessica', logo: { '@type': 'ImageObject', url: `${BASE}/icons/icon-192.png` } },
      mainEntityOfPage: canonical,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: lang,
      mainEntity: copy.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ]

  const body = `${header(lang, home, app, sitemap, featuresHref, otherHref)}
<main class="wrap">
  <section class="feature-hero">
    <span class="eyebrow">${feature.emoji} ${esc(copy.eyebrow)}</span>
    <h1>${esc(copy.h1)}</h1>
    <p class="lead">${esc(copy.lead)}</p>
    <div class="feature-cta">
      <a class="btn" href="${app}${feature.appPath}">${rtl ? 'جرّبها الآن' : 'Try it now'} ←</a>
      <a class="btn ghost" href="${featuresHref}">${rtl ? 'كل الميزات' : 'All features'}</a>
    </div>
  </section>
  <article class="feature-body">
    <h2>${rtl ? 'المشكلة' : 'The problem'}</h2>
    ${copy.problem.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('\n')}
    <h2>${rtl ? 'الحل في جيسيكا' : 'How Jessica solves it'}</h2>
    ${copy.solution.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('\n')}
    <ul>${copy.bullets.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
    <h2>${rtl ? 'خطوة بخطوة' : 'Step by step'}</h2>
    <div class="steps">${copy.steps
      .map((step, index) => `<div class="step"><b>${index + 1}. ${esc(step.title)}</b><p>${esc(step.text)}</p></div>`)
      .join('')}</div>
    <h2>${rtl ? 'لمين؟' : 'Who is it for?'}</h2>
    <p>${esc(copy.audience)}</p>
    <h2>${rtl ? 'أسئلة شائعة' : 'Questions'}</h2>
    <div class="faq">${copy.faq
      .map((item) => `<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`)
      .join('')}</div>
    <h2>${rtl ? 'ميزات قريبة' : 'Related features'}</h2>
    <div class="related">${related}</div>
    <div class="cta-box">
      <h2>${rtl ? 'جرّبها على كتابك' : 'Try it on your own book'}</h2>
      <p>${rtl ? 'التطبيق مجاني، بدون حساب، وبعد أول تحميل بيشتغل أوفلاين.' : 'Free, no account, and it works offline after the first download.'}</p>
      <a class="btn" href="${app}">${rtl ? 'افتح التطبيق' : 'Open the app'}</a>
    </div>
  </article>
</main>
${footer(lang, home, app, sitemap, featuresHref)}`

  return layout({
    lang,
    title: copy.title,
    description: copy.description,
    canonical,
    alternate,
    css,
    icons,
    og,
    feed: isAr ? '../../feed.xml' : '../../../feed.xml',
    body,
    schema,
  })
}

function indexPage(lang) {
  const rtl = lang === 'ar'
  const isAr = lang === 'ar'
  const app = isAr ? '../../' : '../../../'
  const home = '../'
  const css = isAr ? '../style.css' : '../../style.css'
  const icons = isAr ? '../../icons/' : '../../../icons/'
  const og = isAr ? '../../og.jpg' : '../../../og.jpg'
  const sitemap = isAr ? '../sitemap/' : '../sitemap/'
  const otherHref = isAr ? '../en/features/' : '../../features/'
  const canonical = `${BASE}/welcome/${isAr ? '' : 'en/'}features/`
  const alternate = { ar: `${BASE}/welcome/features/`, en: `${BASE}/welcome/en/features/` }
  const title = isAr ? 'ميزات Jessica — ٨ حاجات بتغيّر المذاكرة' : 'Jessica features — eight things that change study'
  const description = isAr
    ? '٨ ميزات بتشرح نفسها: امتحان المدرسة، تصحيح الورقة، تقرير الشهر، المراجعة المتباعدة، الصوت المصري، أوفلاين، وضع الفصل، وعالم الأطفال.'
    : 'Eight features explained: the school paper, tap marking, the monthly report, spaced repetition, the Egyptian voice, offline, class mode and the kids world.'
  const h1 = isAr ? '٨ ميزات… كل واحدة بتحل مشكلة حقيقية' : 'Eight features — each one fixes a real problem'
  const intro = isAr
    ? [
        'التطبيق مش قايمة ميزات على البروشور. كل ميزة هنا اتولدت من مشكلة حقيقية في بيت مصري: ورقة مدرسة من غير مفتاح إجابة، تصحيح ٣٠ ورقة بالإيد، سؤال «ابنك بيعمل إيه؟» من غير أرقام، وصوت عربي جاف الطفل بيفصل منه.',
        'الصفحات دي مش إعلانات. كل صفحة بتشرح المشكلة، الحل، الخطوات، ومين يستخدمها — وتقولك كمان إيه اللي الميزة مش بتعمله. لو ميزة مش محتاجها، مش هتضيّع وقتك فيها.',
      ]
    : [
        'This is not a feature list on a brochure. Every feature here came from a real problem in an Egyptian home: a school paper with no answer key, marking thirty sheets by hand, “how is your child doing?” with no numbers, and a stiff Arabic voice a child tunes out.',
        'These pages are not ads. Each one explains the problem, the solution, the steps and who it is for — and says what the feature does not do. If you do not need it, you will not waste time on it.',
      ]
  const outro = isAr
    ? 'ابدأ بالميزة اللي وجعتك أكتر، أو افتح التطبيق وجرّبها على كتاب واحد. كل حاجة محلية على جهازك، ومفيش حساب ولا سيرفر، وكل صفحة فيها زر يوديك على الميزة نفسها جوه التطبيق.'
    : 'Start with the feature that hurts most, or open the app and try it on one book. Everything is local to your device, with no account and no server, and every page has a button that takes you straight to the feature inside the app.'

  const cards = FEATURES.map(
    (feature) => `<a class="feature-card" href="./${feature.slug}/">
  <div class="ic">${feature.emoji}</div>
  <h2>${esc(feature[lang].title)}</h2>
  <p>${esc(feature[lang].description)}</p>
  <span class="more">${rtl ? 'اقرأ الميزة ←' : 'Read the feature →'}</span>
</a>`,
  ).join('\n')

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      inLanguage: lang,
      url: canonical,
      hasPart: FEATURES.map((feature) => ({
        '@type': 'Article',
        name: feature[lang].title,
        url: `${BASE}/welcome/${isAr ? '' : 'en/'}features/${feature.slug}/`,
      })),
    },
  ]

  const body = `${header(lang, home, app, sitemap, './', otherHref)}
<main class="wrap">
  <section class="feature-hero">
    <span class="eyebrow">${rtl ? 'الميزات' : 'Features'}</span>
    <h1>${esc(h1)}</h1>
    ${intro.map((paragraph) => `<p class="lead">${esc(paragraph)}</p>`).join('\n')}
  </section>
  <div class="feature-grid">${cards}</div>
  <p class="lead">${esc(outro)}</p>
  <div class="cta-box">
    <h2>${rtl ? 'ابدأ من كتابك' : 'Start from your book'}</h2>
    <p>${rtl ? 'نزّل كتاب الوزارة مرة واحدة، واستورده، وجرّب أي ميزة.' : 'Download one ministry book, import it, and try any feature.'}</p>
    <a class="btn" href="${app}">${rtl ? 'افتح التطبيق' : 'Open the app'}</a>
  </div>
</main>
${footer(lang, home, app, sitemap, './')}`

  return layout({
    lang,
    title,
    description,
    canonical,
    alternate,
    css,
    icons,
    og,
    feed: isAr ? '../feed.xml' : '../../feed.xml',
    body,
    schema,
  })
}

function write(file, html) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
}

fs.rmSync('public/welcome/features', { recursive: true, force: true })
fs.rmSync('public/welcome/en/features', { recursive: true, force: true })

write('public/welcome/features/index.html', indexPage('ar'))
write('public/welcome/en/features/index.html', indexPage('en'))
for (const feature of FEATURES) {
  write(`public/welcome/features/${feature.slug}/index.html`, featurePage(feature, 'ar'))
  write(`public/welcome/en/features/${feature.slug}/index.html`, featurePage(feature, 'en'))
}

console.log(`features: ${FEATURES.length} × 2 pages + 2 indexes`)
