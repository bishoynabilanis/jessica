import fs from 'node:fs'
import path from 'node:path'

const BASE = 'https://bishoynabilanis.github.io/jessica'
const OUT = 'public/welcome/quiz'

const GRADES = [
  {
    slug: 'primary-1',
    name: 'أولى ابتدائي',
    intro:
      'اختبار خفيف على الجمع والطرح لحد ٢٠، وهو اللي بيتبني عليه كل حاجة بعد كده. ١٠ أسئلة بس، وكل إجابة بتظهرلك صح ولا غلط مع سبب واضح — عشان الطفل يفهم مش بس يخمّن.',
    covers: ['جمع وطرح حتى ٢٠', 'العدّ والتجميع', 'اختيار الإجابة الصح من ٤', 'شرح مبسّط بعد كل سؤال'],
    tip: 'خلي الطفل يقول الخطوات بصوت عالي وهو بيحل. لو قالها صح، يبقى فاهم.',
  },
  {
    slug: 'primary-2',
    name: 'تانية ابتدائي',
    intro:
      'أسئلة على الجمع والطرح لحد ١٠٠ وجدول ضرب صغير. الهدف إن الطفل يعدّ بسرعة من غير ما يستخدم صواحبه، وده اللي بيفرق في تالتة.',
    covers: ['جمع وطرح حتى ١٠٠', 'جدول الضرب من ٢ لـ ٥', 'الحساب الذهني', 'تصحيح فوري وشرح'],
    tip: '٥ دقايق كل يوم أحسن من ساعة مرة في الأسبوع. الاختبار ده مناسب لجلسة قصيرة.',
  },
  {
    slug: 'primary-3',
    name: 'تالتة ابتدائي',
    intro:
      'تالتة ابتدائي هي سنة جدول الضرب والقسمة. الاختبار بيركّز على الضرب والقسمة والجمع لأرقام كبيرة — أهم ٣ مهارات في السنة دي.',
    covers: ['جدول الضرب كامل', 'قسمة بدون باقي', 'جمع أرقام من ٣ خانات', 'شرح لكل إجابة'],
    tip: 'لو الطفل غلط في سؤال ضرب، راجعه من الجدول قبل ما تكمل. الأساس أهم من السرعة.',
  },
  {
    slug: 'primary-4',
    name: 'رابعة ابتدائي',
    intro:
      'اختبار على ضرب عدد من رقمين، جمع الكسور بنفس المقام، ومحيط المستطيل. دي أول سنة الكسور بتبدأ فيها بجد، والاختبار بيقيسها في دقيقة.',
    covers: ['ضرب عدد من رقمين في رقم', 'جمع كسور بمقام واحد', 'محيط المستطيل', 'تصحيح مع شرح'],
    tip: 'في الكسور، اسأل نفسك الأول: المقامات زي بعض؟ لو أيوه، اجمع البسط بس.',
  },
  {
    slug: 'primary-5',
    name: 'خامسة ابتدائي',
    intro:
      'الأعداد العشرية والنسبة المئوية والمساحة. الاختبار بيقيس أهم ٣ مهارات في خامسة، وبيعطيك شرح لكل إجابة غلط عشان تصلحها فورًا.',
    covers: ['جمع الأعداد العشرية', 'النسبة المئوية', 'مساحة المستطيل', 'مراجعة الأخطاء في الآخر'],
    tip: 'في العشريات، حط الفاصلة تحت الفاصلة قبل ما تجمع. أغلب الأخطاء بتبدأ من هنا.',
  },
  {
    slug: 'primary-6',
    name: 'سادسة ابتدائي',
    intro:
      'سادسة ابتدائي بتحضّرك للإعدادي، فالاختبار فيه نسبة مئوية وتناسب ومتوسط وترتيب عمليات. ١٠ أسئلة بتوريك مستواك الحقيقي قبل ما تدخل أولى إعدادي.',
    covers: ['النسبة المئوية', 'التناسب', 'المتوسط الحسابي', 'ترتيب العمليات'],
    tip: 'افتكر: الضرب والقسمة قبل الجمع والطرح. سؤال واحد فيه العمليتين بيكشف الفرق.',
  },
  {
    slug: 'prep-1',
    name: 'أولى إعدادي',
    intro:
      'أولى إعدادي بتبدأ فيها الأعداد السالبة والمعادلات والقوى. الاختبار ده بيقيس الأساس ده بالظبط، لأن كل اللي بعده في الإعدادي مبني عليه.',
    covers: ['جمع الأعداد السالبة', 'حل معادلة بخطوة', 'القوى', 'زوايا المثلث'],
    tip: 'لو المعادلة فيها +، اطرح من الطرفين. الهدف تخلي س لوحده.',
  },
  {
    slug: 'prep-2',
    name: 'تانية إعدادي',
    intro:
      'تعويض جبري، جذور تربيعية، ونظرية فيثاغورس. الاختبار قصير لكنه بيغطي أهم أفكار تانية إعدادي اللي بتتكرر في الامتحان.',
    covers: ['التعويض في المقادير الجبرية', 'الجذر التربيعي', 'فيثاغورس', 'حل معادلة بخطوتين'],
    tip: 'في فيثاغورس: الوتر دائمًا أطول ضلع، ومربعه = مجموع مربعي الضلعين الآخرين.',
  },
  {
    slug: 'prep-3',
    name: 'تالتة إعدادي',
    intro:
      'سنة الشهادة. الاختبار بيركّز على المعادلات والجذور والنسب المثلثية الشهيرة والفرق بين مربعين — أفكار بتتكرر كتير في امتحانات الإعدادية.',
    covers: ['معادلات من الدرجة الأولى', 'جذور تربيعية', 'جا وجتا للزوايا الشهيرة', 'الفرق بين مربعين'],
    tip: 'في الشهادة، السر مش حل أسئلة أكتر — السر إنك تراجع غلطاتك. الاختبار بيعمل ده لوحده.',
  },
]

const FAQ_SHARED = [
  ['هل الاختبار مجاني؟', 'أيوه، مجاني بالكامل وبدون تسجيل وبدون إدخال أي بيانات. بتفتح الصفحة وتحل على طول.'],
  ['هل الأسئلة من منهج الوزارة؟', 'الأسئلة بتتبع نفس المهارات الأساسية في منهج الرياضيات لكل صف، وبتتولّد بشكل عشوائي عشان تقدر تعيده كل مرة من غير ما تحفظ الإجابات.'],
  ['إزاي أشارك نتيجتي؟', 'بعد آخر سؤال بيظهرلك زر واتساب بيبعت نتيجتك ووقتك ولينك الاختبار. وفيه كمان زر تنزيل كارت النتيجة كصورة.'],
  ['الاختبار بيحفظ بياناتي؟', 'لأ. أفضل نتيجة بتتخزن على جهازك بس (في المتصفح) عشان تشوف تقدمك، ومفيش أي بيانات بتتبعت لأي سيرفر.'],
]

function shell({ up, title, description, canonical, jsonld, bodyAttrs, body }) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="ar" href="${canonical}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="ar_EG">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${BASE}/og-quiz.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="اختبار ٦٠ ثانية — ١٠ أسئلة على مستوى صفك">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${BASE}/og-quiz.jpg">
<link rel="icon" href="${up}../icons/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${up}style.css">
<link rel="stylesheet" href="${up}quiz.css">
<script type="application/ld+json">
${JSON.stringify(jsonld)}
</script>
</head>
<body ${bodyAttrs}>
<div class="bg-glow"></div>
<header><div class="wrap nav"><a class="brand" href="${up}"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="${up}../">افتح التطبيق</a></div></header>
<main><div class="wrap">
${body}
</div></main>
<footer><div class="wrap foot"><span>© Jessica — صُنع في مصر 🇪🇬</span><span><a href="${up}">الرئيسية</a> · <a href="${up}quiz/">الاختبارات</a> · <a href="${up}grades/">كتب الوزارة</a> · <a href="${up}guides/">أدلة المذاكرة</a> · <a href="${up}topics/">مواضيع المذاكرة</a></span></div></footer>
<script src="${up}quiz.js"></script>
</body>
</html>
`
}

function gradePage(grade) {
  const up = '../../'
  const canonical = `${BASE}/welcome/quiz/${grade.slug}/`
  const faq = [
    [
      `الاختبار ده مناسب لمستوى ${grade.name}؟`,
      `أيوه، الأسئلة متولّدة على نفس مهارات منهج ${grade.name}: ${grade.covers.slice(0, 3).join('، ')}. لو الطالب جاب درجة منخفضة، ده معناه إن فيه مهارة محتاجة مراجعة — والاختبار بيقولك هي إيه بالظبط.`,
    ],
    [
      'كل مرة الأسئلة بتتغير؟',
      'أيوه، الأسئلة بتتولّد عشوائيًا من نفس المهارات. تقدر تعيده ١٠ مرات ومش هتلاقي نفس الأسئلة بالترتيب نفسه.',
    ],
    [
      `إزاي أذاكر ${grade.name} بعد الاختبار؟`,
      'ابدأ بالمهارة اللي غلطت فيها، راجعها من كتاب الوزارة، وبعدها أعد الاختبار. لو الدرجة اتحسنت، يبقى المهارة ثبتت.',
    ],
    ...FAQ_SHARED.slice(0, 2),
  ]

  const faqHtml = faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')
  const others = GRADES.filter((g) => g.slug !== grade.slug)
    .map((g) => `<a class="quiz-grade" href="../${g.slug}/">${g.name}</a>`)
    .join('')

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: `اختبار رياضيات ${grade.name} — ١٠ أسئلة في دقيقة`,
    description: `اختبار رياضيات تفاعلي مجاني لـ${grade.name}: ${grade.covers.join('، ')}. تصحيح فوري وشرح لكل إجابة.`,
    url: canonical,
    inLanguage: 'ar',
    educationalLevel: grade.name,
    learningResourceType: 'Quiz',
    isAccessibleForFree: true,
    about: { '@type': 'Thing', name: 'رياضيات' },
    provider: { '@type': 'Organization', name: 'Jessica', url: `${BASE}/welcome/` },
  }

  const body = `
<section class="quiz-hero">
  <span class="eyebrow">⏱️ اختبار ٦٠ ثانية</span>
  <h1>اختبار رياضيات ${grade.name}</h1>
  <p>${grade.intro}</p>
  <div class="quiz-chips">${grade.covers.map((c) => `<span>${c}</span>`).join('')}</div>
</section>

<section class="quiz-card" id="quiz-stage">
  <div id="quiz-start" class="quiz-start">
    <h2>جاهز؟ ١٠ أسئلة، دقيقة واحدة</h2>
    <ul class="quiz-rules">
      <li>✅ تصحيح فوري بعد كل سؤال</li>
      <li>🧠 شرح قصير ليه الإجابة دي صح</li>
      <li>🔥 في الآخر تقدر تبعت نتيجتك كتحدي — صاحبك بيشوف رقمك ويحاول يغلبه</li>
      <li>📊 نتيجتك في الآخر + مراجعة الغلطات</li>
      <li>🔒 بدون تسجيل وبدون ما تدخل أي بيانات</li>
    </ul>
    <button class="btn quiz-cta" id="quiz-start-btn" type="button">ابدأ الاختبار ←</button>
    <p class="quiz-mini" id="quiz-best" hidden></p>
  </div>

  <div id="quiz-play" class="quiz-play" hidden>
    <div class="quiz-top">
      <span id="quiz-counter">سؤال ١ من ١٠</span>
      <span class="quiz-clock">⏱️ <span id="quiz-timer">٠:٠٠</span></span>
    </div>
    <div class="quiz-track"><div class="quiz-fill" id="quiz-bar"></div></div>
    <h2 class="quiz-prompt" id="quiz-prompt"></h2>
    <div class="quiz-choices" id="quiz-choices"></div>
    <p class="quiz-feedback" id="quiz-feedback" hidden></p>
    <button class="btn quiz-next" id="quiz-next" type="button" hidden>السؤال التالي</button>
  </div>

  <div id="quiz-result" class="quiz-result" hidden>
    <span class="eyebrow">نتيجتك</span>
    <div class="quiz-score" id="quiz-score">٠/١٠</div>
    <p class="quiz-tier" id="quiz-tier"></p>
    <p class="quiz-mini">الوقت: <span id="quiz-time">٠:٠٠</span></p>
    <div class="quiz-actions">
      <a class="btn quiz-share" id="quiz-share" href="#" target="_blank" rel="noopener">🔥 ابعت التحدي على واتساب</a>
      <button class="btn ghost" id="quiz-save-card" type="button">نزّل كارت النتيجة</button>
      <button class="btn ghost" id="quiz-copy" type="button">انسخ لينك التحدي</button>
      <button class="btn ghost" id="quiz-retry" type="button">أعد الاختبار</button>
      <a class="btn ghost" href="../../../">📲 افتح التطبيق كامل</a>
    </div>
    <div class="quiz-review" id="quiz-review" hidden></div>
  </div>
</section>

<section class="quiz-about">
  <h2>إيه اللي بيقيسه الاختبار ده؟</h2>
  <p>الاختبار مبني على المهارات الأساسية في ${grade.name}، مش على حفظ أسئلة. الأسئلة بتتولّد عشوائيًا كل مرة، فمش هتحفظ إجابات — هتفهم الطريقة.</p>
  <ul class="quiz-list">${grade.covers.map((c) => `<li>${c}</li>`).join('')}</ul>
  <div class="quiz-tip"><strong>نصيحة سريعة</strong><span>${grade.tip}</span></div>
</section>

<section class="quiz-about">
  <h2>أسئلة شائعة</h2>
  ${faqHtml}
</section>

<section class="quiz-cta-box">
  <h2>عايز تذاكر من كتاب الوزارة نفسه؟</h2>
  <p>جيسيكا فيها كتب ${grade.name} الرسمية PDF، ومدرس ذكي يشرح أي صفحة، وبطاقات مراجعة — مجانًا وبدون حساب.</p>
  <a class="btn" href="${up}../">افتح Jessica ←</a>
  <a class="btn ghost" href="${up}grades/${grade.slug}/">نزّل كتب ${grade.name}</a>
  <div class="quiz-related">
    <a href="${up}topics/study-plan/">🗓️ جدول مذاكرة</a>
    <a href="${up}topics/math/">➗ إزاي تذاكر رياضيات</a>
    <a href="${up}topics/exam-anxiety/">🧠 قلق الامتحان</a>
    <a href="${up}topics/">🧭 كل مواضيع المذاكرة</a>
  </div>
</section>

<section class="quiz-others">
  <h2>جرّب صف تاني</h2>
  <div class="quiz-grades">${others}</div>
</section>`

  return shell({
    up,
    title: `اختبار رياضيات ${grade.name} — ١٠ أسئلة في دقيقة | Jessica`,
    description: `اختبار رياضيات مجاني لـ${grade.name}: ١٠ أسئلة، تصحيح فوري، شرح لكل إجابة، ونتيجة تشاركها على واتساب. بدون تسجيل.`,
    canonical,
    jsonld,
    bodyAttrs: `data-grade="${grade.slug}" data-grade-name="${grade.name}"`,
    body,
  })
}

function indexPage() {
  const up = '../'
  const canonical = `${BASE}/welcome/quiz/`
  const cards = GRADES.map(
    (g) => `<a class="quiz-grade-card" href="./${g.slug}/">
  <span class="quiz-grade-name">${g.name}</span>
  <span class="quiz-grade-desc">${g.covers.slice(0, 2).join(' · ')}</span>
  <span class="quiz-grade-go">ابدأ ←</span>
</a>`,
  ).join('\n')

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'اختبارات رياضيات سريعة — Jessica',
    description: 'اختبارات رياضيات مجانية لكل الصفوف: ١٠ أسئلة، تصحيح فوري، ونتيجة تشاركها على واتساب.',
    url: canonical,
    inLanguage: 'ar',
    hasPart: GRADES.map((g) => ({ '@type': 'Quiz', name: `اختبار رياضيات ${g.name}`, url: `${BASE}/welcome/quiz/${g.slug}/` })),
  }

  const body = `
<section class="quiz-hero">
  <span class="eyebrow">⏱️ ٦٠ ثانية · مجاني · بدون تسجيل</span>
  <h1>اختبر مستواك في الرياضيات</h1>
  <p>١٠ أسئلة على أهم مهارات صفك، تصحيح فوري وشرح لكل إجابة، وفي الآخر نتيجتك وكارت تشاركه على واتساب. وكل نتيجة بتتحوّل لتحدي — صاحبك يشوف رقمك ويحاول يغلبه. من غير تسجيل ومن غير ما تدخل أي بيانات.</p>
</section>
<div class="quiz-challenge-hint">
  <strong>🔥 كل نتيجة بتبقى تحدي</strong>
  <span>بعد ما تخلص، ابعت اللينك لصاحبك — هيشوف رقمك ويحاول يغلبه، وكل واحد بيبعت التحدي للي بعده.</span>
</div>
<div class="quiz-grades quiz-grades-grid">${cards}</div>
<section class="quiz-about">
  <h2>ليه اختبار ٦٠ ثانية؟</h2>
  <p>لأن أطول اختبار مش دائمًا أفضل اختبار. ١٠ أسئلة مركزة بتكشف المهارة اللي محتاجة مراجعة في دقيقة، وتقدر تعيدها كل يوم كتسخين قبل المذاكرة.</p>
  <ul class="quiz-list">
    <li>الأسئلة بتتولّد عشوائيًا، فمفيش حفظ إجابات.</li>
    <li>كل إجابة بتظهر مع سبب واضح، عشان تتعلم من الغلط فورًا.</li>
    <li>في الآخر مراجعة بكل غلطة عشان تعرف تراجع إيه.</li>
    <li>لينك التحدي بيحمل نتيجتك، فاللي يفتحه يعرف رقمك ويحاول يغلبه — سلسلة تحدي بدون أي حساب.</li>
    <li>نتيجتك بتتخزن على جهازك بس، ومفيش بيانات بتتبعت.</li>
  </ul>
</section>
<section class="quiz-cta-box">
  <h2>بعد الاختبار… افتح كتبك</h2>
  <p>جيسيكا فيها كتب الوزارة الرسمية لكل الصفوف، ومدرس ذكي يشرح أي صفحة، وبطاقات مراجعة — كل ده مجانًا وبدون حساب.</p>
  <a class="btn" href="${up}../">افتح Jessica ←</a>
  <a class="btn ghost" href="${up}grades/">كتب الوزارة</a>
  <div class="quiz-related">
    <a href="${up}install/">📲 تثبيت التطبيق</a>
    <a href="${up}guides/">📘 أدلة المذاكرة</a>
    <a href="${up}topics/">🧭 مواضيع المذاكرة</a>
  </div>
</section>`

  return shell({
    up,
    title: 'اختبار رياضيات سريع — ١٠ أسئلة في دقيقة | Jessica',
    description: 'اختبارات رياضيات مجانية لكل الصفوف: ١٠ أسئلة، تصحيح فوري، شرح لكل إجابة، ونتيجة تشاركها على واتساب. بدون تسجيل.',
    canonical,
    jsonld,
    bodyAttrs: 'data-grade="prep-3" data-grade-name="تالتة إعدادي"',
    body,
  })
}

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

for (const grade of GRADES) {
  fs.mkdirSync(path.join(OUT, grade.slug), { recursive: true })
  fs.writeFileSync(path.join(OUT, grade.slug, 'index.html'), gradePage(grade))
}
fs.writeFileSync(path.join(OUT, 'index.html'), indexPage())

console.log('quiz pages written:', GRADES.length + 1)
