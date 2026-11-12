import fs from 'node:fs'
import path from 'node:path'

const BLOB = 'https://elearnningcontent.blob.core.windows.net/elearnningcontent'
const source = fs.readFileSync('src/data/officialBooks.ts', 'utf8')
const re =
  /id: '([^']+)',\s*grade: (\d),\s*subject: '([^']+)',\s*term: '([^']+)',\s*title: '([^']+)',\s*url: file\('([^']+)'\),\s*sizeMb: ([\d.]+),\s*language: '([^']+)'/g

const books = []
let match
while ((match = re.exec(source))) {
  books.push({
    id: match[1],
    grade: Number(match[2]),
    subject: match[3],
    term: match[4],
    title: match[5],
    url: `${BLOB}/${match[6]}`,
    sizeMb: Number(match[7]),
    language: match[8],
  })
}

const LABELS = {
  1: ['الأول الابتدائي', 'First Primary', 'primary-1'],
  2: ['الثاني الابتدائي', 'Second Primary', 'primary-2'],
  3: ['الثالث الابتدائي', 'Third Primary', 'primary-3'],
  4: ['الرابع الابتدائي', 'Fourth Primary', 'primary-4'],
  5: ['الخامس الابتدائي', 'Fifth Primary', 'primary-5'],
  6: ['السادس الابتدائي', 'Sixth Primary', 'primary-6'],
  7: ['الأول الإعدادي', 'First Preparatory', 'prep-1'],
  8: ['الثاني الإعدادي', 'Second Preparatory', 'prep-2'],
  9: ['الثالث الإعدادي', 'Third Preparatory', 'prep-3'],
}

const BASE = 'https://bishoynabilanis.github.io/jessica'
const outRoot = 'public/welcome/grades'
fs.rmSync(outRoot, { recursive: true, force: true })

function page(grade, { title, description, body, slug }) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${BASE}/welcome/grades/${slug}/">
<link rel="alternate" hreflang="ar" href="${BASE}/welcome/grades/${slug}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${BASE}/og.jpg">
<link rel="icon" href="../../../icons/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../style.css">
<style>
  .grade-hero { padding: 60px 0 20px; text-align: center; }
  .grade-hero h1 { font-size: clamp(30px, 4vw, 46px); margin: 12px 0; }
  .grade-hero p { color: var(--muted); max-width: 680px; margin-inline: auto; }
  .books-table { width: 100%; border-collapse: collapse; margin-top: 22px; overflow: hidden; border-radius: 18px; }
  .books-table th, .books-table td { border-bottom: 1px solid var(--line); padding: 12px 14px; text-align: right; font-size: 13px; }
  .books-table th { background: rgba(255,255,255,.04); color: var(--muted); font-weight: 700; }
  .books-table a { color: var(--mint); font-weight: 700; }
  .book-link { display: inline-flex; padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(46,230,197,.3); background: rgba(46,230,197,.08); }
  .grade-nav { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 26px; }
  .grade-nav a { font-size: 12px; font-weight: 700; border: 1px solid var(--line); border-radius: 999px; padding: 8px 14px; color: var(--muted); }
  .grade-nav a:hover { color: var(--text); }
  .note { font-size: 12px; color: var(--muted); line-height: 1.9; margin-top: 16px; }
</style>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"CollectionPage","name":"${title}","description":"${description}","url":"${BASE}/welcome/grades/${slug}/","inLanguage":"ar"}
</script>
</head>
<body>
<div class="bg-glow"></div>
<header><div class="wrap nav"><a class="brand" href="../../"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="../../../">افتح التطبيق</a></div></header>
<main>
<div class="wrap">
<section class="grade-hero">
  <span class="eyebrow">🇪🇬 كتب وزارة التربية والتعليم</span>
  <h1>${body.heading}</h1>
  <p>${body.intro}</p>
  <div class="hero-actions" style="justify-content:center">
    <a class="btn" href="../../../">افتح Jessica مجانًا ←</a>
    <a class="btn ghost" href="../../#install">طريقة التثبيت</a>
  </div>
</section>
<section>
  <div class="section-head"><h2>الكتب المتاحة</h2><p>روابط رسمية مباشرة من سيرفر الوزارة. نزّل الكتاب واستورده في التطبيق مرة واحدة.</p></div>
  <table class="books-table">
    <thead><tr><th>المادة</th><th>الكتاب</th><th>الحجم</th><th>التحميل</th></tr></thead>
    <tbody>${body.rows}</tbody>
  </table>
  <p class="note">${body.note}</p>
  <div class="grade-nav">${body.nav}</div>
</section>
</div>
</main>
<footer><div class="wrap foot"><span>© Jessica — صُنع في مصر 🇪🇬</span><span><a href="../../">الرئيسية</a> · <a href="../../../#/disclaimer">إخلاء المسؤولية</a></span></div></footer>
</body>
</html>`
}

const nav = Object.entries(LABELS)
  .map(([g, [ar, en, slug]]) => `<a href="../${slug}/">${ar}</a>`)
  .join('')

for (const [gradeKey, [arLabel, enLabel, slug]] of Object.entries(LABELS)) {
  const grade = Number(gradeKey)
  const list = books
    .filter((book) => book.grade === grade && book.term === 'Term 1')
    .sort((a, b) => a.subject.localeCompare(b.subject))

  const rows = list
    .map(
      (book) =>
        `<tr><td>${book.subject}</td><td>${book.title}</td><td>${book.sizeMb} MB</td><td><a class="book-link" href="${book.url}" target="_blank" rel="noreferrer">تحميل PDF</a></td></tr>`,
    )
    .join('')

  const heading = `كتب الوزارة — الصف ${arLabel}`
  const intro = `كل كتب وزارة التربية والتعليم المتاحة للصف ${arLabel} (${enLabel}) للترم الأول، بروابط رسمية مباشرة. نزّل أي كتاب واستورده في Jessica مرة واحدة، وبعدها تقرأه وتذاكر منه بدون إنترنت.`
  const description = `تحميل كتب الوزارة الرسمية للصف ${arLabel} (${enLabel}) الترم الأول — ${list.length} كتاب بروابط مباشرة، مع تطبيق Jessica المجاني للمذاكرة بالذكاء الاصطناعي.`
  const note =
    'حقوق الطبع والنشر ملك وزارة التربية والتعليم. الروابط منشورة على سيرفرات الوزارة الرسمية، والاستخدام للمذاكرة الشخصية فقط. لو مادتك مش موجودة تقدر تستورد أي PDF من جهازك داخل التطبيق.'

  const dir = path.join(outRoot, slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    path.join(dir, 'index.html'),
    page(grade, {
      title: `كتب الوزارة ${arLabel} — تحميل PDF رسمي | Jessica`,
      description,
      slug,
      body: { heading, intro, rows, note, nav },
    }),
  )
  console.log(slug, list.length)
}

// Index page
const cards = Object.entries(LABELS)
  .map(([g, [ar, en, slug]]) => {
    const count = books.filter((book) => book.grade === Number(g) && book.term === 'Term 1').length
    return `<a class="grade" href="./${slug}/">${ar}<small>${count} كتاب</small></a>`
  })
  .join('')

fs.mkdirSync(outRoot, { recursive: true })
fs.writeFileSync(
  path.join(outRoot, 'index.html'),
  `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>كتب الوزارة لكل الصفوف — Jessica</title><meta name="description" content="روابط رسمية لكتب وزارة التربية والتعليم المصرية من الأول الابتدائي للتالت الإعدادي، مع تطبيق Jessica المجاني للمذاكرة."><link rel="canonical" href="${BASE}/welcome/grades/"><link rel="stylesheet" href="../style.css"></head><body><div class="bg-glow"></div><header><div class="wrap nav"><a class="brand" href="../"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="../../">افتح التطبيق</a></div></header><main><div class="wrap"><section class="grade-hero"><h1>كتب الوزارة لكل الصفوف</h1><p>اختار صفك وهتلاقي كل الكتب المتاحة بروابط رسمية.</p></section><div class="grades">${cards}</div></div></main><footer><div class="wrap foot"><span>© Jessica</span><span><a href="../">الرئيسية</a></span></div></footer></body></html>`,
)
console.log('index done')
