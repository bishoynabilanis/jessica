import fs from 'node:fs'
import path from 'node:path'

const BASE = 'https://bishoynabilanis.github.io/jessica'
const OUT = 'public/welcome/guides'

const GUIDES = [
  {
    slug: 'study-method',
    emoji: '📖',
    title: 'إزاي تذاكر من كتاب الوزارة صح',
    h1: 'إزاي تذاكر من كتاب الوزارة صح (طريقة ٥ خطوات)',
    description: 'طريقة عملية من ٥ خطوات للمذاكرة من كتاب الوزارة نفسه: قراءة، استدعاء، تدريب، ومراجعة متباعدة — بدل حفظ الملخصات.',
    minutes: 6,
    intro:
      'أغلب الطلبة بيذاكروا من ملخصات ومراجعات خارجية، وبعدين يتفاجئوا إن الامتحان جاي من الكتاب نفسه. الكتاب مش مصدر إضافي — هو المرجع اللي الأسئلة بتتكتب منه. الطريقة دي بتخليك تذاكر من الكتاب في وقت أقل، وتفضل فاكر.',
    sections: [
      {
        h: '١) ابدأ بالأسئلة قبل القراءة',
        p: [
          'قبل ما تقرأ الدرس، افتح آخر صفحة فيه وشوف الأسئلة. مش المطلوب تحلها، المطلوب تعرف إيه اللي الكتاب عايز منك. دماغك هتبدأ تدوّر على الإجابات وأنت بتقرأ، وده بيوفر نص الوقت.',
          'لو الكتاب مفيهوش أسئلة، اكتب ٣ أسئلة من عندك على العنوان: إيه؟ ليه؟ وإزاي؟',
        ],
      },
      {
        h: '٢) اقرأ صفحة واحدة بصوت عالي',
        p: [
          'مش الدرس كله — صفحة واحدة. اقرأها بصوت عالي، وعلّم على ٣ مصطلحات بس. القراءة الصامتة السريعة بتخليك تعدّي على المعنى من غير ما تسجله.',
          'بعد الصفحة، اقفل الكتاب. لو مش قادر تحكي اللي قرأته بكلامك، يبقى محتاج تعيدها — مش تكمل.',
        ],
      },
      {
        h: '٣) اكتب اللي فهمته من غير ما تبص',
        p: [
          'ده أهم جزء: استدعاء المعلومة من دماغك بدل إعادة قراءتها. خد ورقة واكتب ٣ جمل: الفكرة الأساسية، مثال، وسؤال لسه مش فاهمه.',
          'الكتابة بالكلام البسيط بتكشف الفجوات. اللي مش قادر تكتبه، ده اللي هتراجع فيه بكرة.',
        ],
      },
      {
        h: '٤) حل ٥ أسئلة على نفس الصفحة',
        p: [
          'مش ٥٠ سؤال. خمسة أسئلة كفاية عشان تتأكد إنك فهمت. صحّح فورًا، وسجّل كل غلطة في مكان واحد.',
          'الغلطة اللي بتتكرر هي اللي بتاخد درجاتك في الامتحان، مش الدرس اللي مش فاهمه.',
        ],
      },
      {
        h: '٥) راجع بعد يوم، ٣ أيام، وأسبوع',
        p: [
          'النسيان مش عيب، هو طبيعة الدماغ. المراجعة القصيرة على فترات متباعدة أقوى من جلسة طويلة. كل مراجعة ٥ دقايق: بطاقات، أو أسئلة سريعة على نفس الدرس.',
          'لو راجعت الدرس ٣ مرات قصيرة، هتفضل فاكره وقت الامتحان أكتر من اللي قرأه ٣ ساعات مرة واحدة.',
        ],
      },
    ],
    faq: [
      ['هل الطريقة دي تنفع لكل المواد؟', 'أيوه. الرياضيات بتزود خطوة حل الأمثلة قبل الأسئلة، واللغات بتزود خطوة قراءة بصوت عالي وترجمة الجمل. الباقي زي ما هو.'],
      ['أعمل إيه لو الوقت ضيق قبل الامتحان؟', 'قلل عدد الصفحات مش عدد الخطوات. صفحة واحدة بالطريقة دي أفضل من ١٠ صفحات قراءة سريعة من غير استدعاء.'],
    ],
    cta: 'جرّب الخطوات على أول درس في كتابك',
  },
  {
    slug: 'exam-week',
    emoji: '🗓️',
    title: 'خطة آخر أسبوع قبل الامتحان',
    h1: 'خطة آخر أسبوع قبل الامتحان (٧ أيام)',
    description: 'خطة مراجعة عملية لآخر ٧ أيام قبل الامتحان: إيه اللي تراجعه كل يوم، وإزاي تقسم الـ ٩٠ دقيقة، وإيه اللي تتجنبه.',
    minutes: 7,
    intro:
      'آخر أسبوع مش وقت تعلم من الصفر — هو وقت تثبيت وتدريب. الخطة دي بتفترض إنك ذاكرت خلال السنة، وبتستخدم الأسبوع عشان تحوّل اللي فاهمه لدرجات. لو لسه في البداية، ركز على الأجزاء اللي بتتكرر في الامتحانات.',
    sections: [
      {
        h: 'قبل ما تبدأ: جهّز أدواتك',
        p: [
          'نزّل كتب المواد الرسمية، وامتحان واحد أو اتنين من نفس المنهج، وورقة وقلم. حدد ٣ مواد أساسية بس — اللي بيحاول يراجع كل حاجة في أسبوع بينتهي بإنه ما راجعش حاجة.',
        ],
      },
      {
        h: 'اليوم ١–٢: الأساسيات والأفكار الكبيرة',
        p: [
          'اقرأ فهرس كل مادة، واكتب على ورقة عناوين الوحدات. الهدف إنك تعرف خريطة المنهج في دماغك، مش تحفظ كل تفصيلة. أي وحدة مش فاكر عنها حاجة، دي أولوية.',
        ],
      },
      {
        h: 'اليوم ٣–٤: تدريب على الأسئلة',
        p: [
          'حل أسئلة من الكتاب أو امتحان سابق، وصحّح فورًا. ممنوع تحل من غير تصحيح — الحل من غير مراجعة بيثبت الغلط.',
          'سجّل كل غلطة في دفتر واحد: السؤال، سبب الغلط، والقاعدة الصح.',
        ],
      },
      {
        h: 'اليوم ٥: أضعف نقطك فقط',
        p: [
          'ارجع للغلطات اللي سجلتها، وذاكر الموضوع اللي وراها من الكتاب. مش مراجعة عامة — علاج لنقط محددة. ده اليوم اللي بيجيب أعلى فرق في الدرجة.',
        ],
      },
      {
        h: 'اليوم ٦: امتحان كامل بتوقيت',
        p: [
          'حل امتحان كامل في نفس وقت الامتحان الحقيقي، من غير موبايل. بعدها صحح واحسب درجتك. ده بيقلل توتر الامتحان أكتر من أي نصيحة.',
        ],
      },
      {
        h: 'اليوم ٧: مراجعة خفيفة ونوم',
        p: [
          'مراجعة سريعة للقوانين والبطاقات، ومراجعة دفتر الأخطاء. من غير حل جديد. نام بدري — السهر ليلة الامتحان بيضيع أكتر مما بيضيف.',
        ],
      },
      {
        h: 'إزاي تقسم الـ ٩٠ دقيقة',
        p: [
          '٢٠ دقيقة قراءة من الكتاب، ٤٠ دقيقة حل أسئلة، ١٠ دقايق تصحيح وتسجيل الغلطات، ٢٠ دقيقة بطاقات مراجعة. الكتلة دي أفضل من ٤ ساعات متقطعة.',
        ],
      },
    ],
    faq: [
      ['هل أحل امتحانات كتير ولا أراجع الكتاب؟', 'الاتنين، بس مش في نفس الوقت. حل امتحان كامل مرة، وبعدها راجع الغلطات من الكتاب. التصحيح هو اللي بيعلم.'],
      ['أذاكر ليلة الامتحان؟', 'مراجعة خفيفة ٣٠ دقيقة للبطاقات والقوانين كفاية. التعلم الجديد ليلة الامتحان بيزود التوتر وبينسّيك اللي فاكره.'],
    ],
    cta: 'ابدأ خطة الأسبوع من كتبك الرسمية',
  },
  {
    slug: 'bubble-sheet',
    emoji: '✏️',
    title: 'إزاي تحل ورقة البابل شيت صح',
    h1: 'إزاي تحل ورقة البابل شيت صح (بدون أخطاء)',
    description: 'قواعد عملية للإجابة على البابل شيت: إدارة الوقت، التظليل الصح، التعامل مع الأسئلة الصعبة، والمراجعة قبل التسليم.',
    minutes: 5,
    intro:
      'درجات كثيرة بتضيع في البابل شيت مش لأن الطالب مش فاهم، لكن لأن التظليل غلط أو الوقت خلص. القواعد دي بسيطة، وبتوفر درجات من غير مذاكرة إضافية.',
    sections: [
      {
        h: 'قبل ما تبدأ',
        p: [
          'اكتب اسمك ورقمك، واقرأ تعليمات الورقة. تأكد من عدد الأسئلة، وهل فيه أسئلة اختيار من متعدد بس ولا فيه جزء كتابي. راجع ترقيم الأسئلة في الورقة وفي نموذج الإجابة.',
        ],
      },
      {
        h: 'ابدأ بالأسهل',
        p: [
          'مش لازم تحل بالترتيب. أول لفة: حل الأسئلة اللي واثق فيها في ثواني. تاني لفة: الأسئلة اللي محتاجة تفكير. تالت لفة: الأسئلة الصعبة واللي فاضية.',
          'ده بيضمن إنك خدت درجات الأسئلة السهلة قبل ما الوقت يخلص.',
        ],
      },
      {
        h: 'التظليل الصح',
        p: [
          'ظلل الدائرة بالكامل بقلم رصاص أو قلم جاف غامق حسب التعليمات. ممنوع علامات صح أو خطوط أو تظليل جزئي — الماسح الضوئي ممكن يقراها غلط.',
          'لو غلطت، امسح بالكامل أو اكتب «ملغي» حسب تعليمات اللجنة، ومتسيبش أثر.',
        ],
      },
      {
        h: 'متسيبش سؤال فاضي',
        p: [
          'مفيش خصم على الإجابة الغلط في معظم الامتحانات. خمّن أحسن من تسيب فاضي. استبعد الاختيارات الغلط الأول، وده بيرفع نسبة التخمين.',
        ],
      },
      {
        h: 'المراجعة الأخيرة',
        p: [
          'خصص ٥ دقايق: هل فيه سؤال فاضي؟ هل الترقيم متطابق؟ هل ظللت سؤال في مكان سؤال تاني؟ أغلب الأخطاء بتحصل في النقلة بين الأسئلة.',
        ],
      },
      {
        h: 'بعد الامتحان: صحّح ورقتك',
        p: [
          'لو معاك نسخة من ورقتك أو صوّرت البابل شيت، استخدم Jessica لتصحيحه بالكاميرا. هتعرف درجتك فورًا، وكل غلطة هتتضاف لدفتر الأخطاء عشان تراجعها قبل الامتحان الجاي.',
        ],
      },
    ],
    faq: [
      ['هل التخمين أفضل من ترك السؤال؟', 'في معظم أنظمة الامتحانات أيوه، لأن مفيش خصم على الغلط. راجع تعليمات الورقة الأول.'],
      ['إزاي أتدرب على البابل شيت؟', 'حل امتحان بنفس عدد الأسئلة ونفس الوقت، وظلل على ورقة منفصلة زي الامتحان الحقيقي. التدريب على الشكل نفسه بيقلل الأخطاء.'],
    ],
    cta: 'صحّح ورقتك بالكاميرا في دقيقة',
  },
]

function head({ title, description, slug, ld, emoji }) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${BASE}/welcome/guides/${slug}/">
<link rel="alternate" hreflang="ar" href="${BASE}/welcome/guides/${slug}/">
<link rel="alternate" hreflang="x-default" href="${BASE}/welcome/guides/${slug}/">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="ar_EG">
<meta property="og:url" content="${BASE}/welcome/guides/${slug}/">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${BASE}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${BASE}/og.jpg">
<link rel="icon" href="../../../icons/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../style.css">
<style>
  .article { max-width: 760px; margin: 0 auto; padding: 40px 0 60px; }
  .article .eyebrow { display: inline-flex; }
  .article h1 { font-size: clamp(28px, 4vw, 42px); line-height: 1.4; margin: 14px 0; }
  .article .meta { color: var(--muted); font-size: 12px; margin-bottom: 26px; }
  .article h2 { font-size: 21px; margin: 28px 0 8px; }
  .article p { color: var(--muted); line-height: 2.1; font-size: 15px; margin-bottom: 10px; }
  .lead { border-inline-start: 3px solid var(--mint); padding-inline-start: 14px; }
  .article .cta-box { margin-top: 30px; border: 1px solid rgba(46,230,197,.3); background: rgba(46,230,197,.07); border-radius: 18px; padding: 18px; text-align: center; }
  .article .cta-box p { color: var(--text); font-weight: 700; }
  .article .faq { margin-top: 34px; }
  .article .faq details { border: 1px solid var(--line); border-radius: 16px; padding: 14px 16px; background: rgba(255,255,255,.03); margin-bottom: 8px; }
  .article .faq summary { cursor: pointer; font-weight: 700; font-size: 14px; }
  .article .faq p { margin-bottom: 0; }
  .article .back { display: inline-block; margin-top: 26px; color: var(--mint); font-size: 13px; font-weight: 700; }
</style>
<script type="application/ld+json">
${JSON.stringify(ld)}
</script>
</head>
<body>
<div class="bg-glow"></div>
<header><div class="wrap nav"><a class="brand" href="../../"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="../../../">افتح التطبيق</a></div></header>
<main><div class="wrap"><article class="article">
<span class="eyebrow">${emoji || '📘'} دليل مذاكرة</span>`
}

function foot({ slug }) {
  return `<a class="back" href="../">← كل أدلة المذاكرة</a>
</article></div></main>
<footer><div class="wrap foot"><span>© Jessica — صُنع في مصر 🇪🇬</span><span><a href="../../">الرئيسية</a> · <a href="../">الأدلة</a> · <a href="../../grades/">كتب الوزارة</a></span></div></footer>
</body>
</html>`
}

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

const cards = []

for (const guide of GUIDES) {
  const url = `${BASE}/welcome/guides/${guide.slug}/`
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.h1,
    description: guide.description,
    inLanguage: 'ar',
    url,
    mainEntityOfPage: url,
    author: { '@type': 'Person', name: 'Bishoy Nabil' },
    publisher: { '@type': 'Organization', name: 'Jessica' },
    datePublished: '2026-11-13',
    dateModified: '2026-11-13',
  }
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
  const body = guide.sections
    .map((section) => `<h2>${section.h}</h2>${section.p.map((text) => `<p>${text}</p>`).join('')}`)
    .join('\n')
  const faq = guide.faq
    .map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`)
    .join('')

  fs.mkdirSync(path.join(OUT, guide.slug), { recursive: true })
  fs.writeFileSync(
    path.join(OUT, guide.slug, 'index.html'),
    `${head({ title: `${guide.title} | Jessica`, description: guide.description, slug: guide.slug, ld, emoji: guide.emoji })}
<h1>${guide.h1}</h1>
<p class="meta">⏱️ ${guide.minutes} دقايق قراءة · تحديث نوفمبر ٢٠٢٦</p>
<p class="lead">${guide.intro}</p>
${body}
<div class="cta-box">
  <p>${guide.cta}</p>
  <p style="font-weight:400;font-size:13px">جيسيكا مجانية، بدون حساب، وبتشتغل على كتب الوزارة الرسمية.</p>
  <a class="btn" href="../../../">افتح Jessica ←</a>
  <a class="btn ghost" href="../../quiz/">⏱️ اختبر نفسك في ٦٠ ثانية</a>
</div>
<div class="faq"><h2>أسئلة شائعة</h2>${faq}</div>
${foot({ slug: guide.slug })}
<script type="application/ld+json">
${JSON.stringify(faqLd)}
</script>`,
  )
  cards.push(
    `<a class="guide-card" href="./${guide.slug}/"><span class="guide-emoji">${guide.emoji}</span><strong>${guide.title}</strong><span>${guide.description}</span><small>${guide.minutes} دقايق قراءة</small></a>`,
  )
}

const indexLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'أدلة المذاكرة — Jessica',
  description: 'أدلة عملية مجانية للمذاكرة من كتب الوزارة، خطة آخر أسبوع قبل الامتحان، وحل البابل شيت.',
  url: `${BASE}/welcome/guides/`,
  inLanguage: 'ar',
}

fs.writeFileSync(
  path.join(OUT, 'index.html'),
  `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>أدلة المذاكرة — من كتاب الوزارة للامتحان | Jessica</title>
<meta name="description" content="أدلة مذاكرة مجانية: إزاي تذاكر من كتاب الوزارة، خطة آخر أسبوع قبل الامتحان، وإزاي تحل البابل شيت صح.">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${BASE}/welcome/guides/">
<link rel="alternate" hreflang="ar" href="${BASE}/welcome/guides/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="ar_EG">
<meta property="og:url" content="${BASE}/welcome/guides/">
<meta property="og:title" content="أدلة المذاكرة — Jessica">
<meta property="og:description" content="أدلة عملية للمذاكرة من كتب الوزارة، والمراجعة، وحل البابل شيت.">
<meta property="og:image" content="${BASE}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../../icons/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../style.css">
<style>
  .guides-hero { padding: 56px 0 10px; text-align: center; }
  .guides-hero h1 { font-size: clamp(30px, 4vw, 44px); margin: 12px 0; }
  .guides-hero p { color: var(--muted); max-width: 700px; margin-inline: auto; line-height: 2; }
  .guide-grid { display: grid; gap: 12px; grid-template-columns: repeat(3, 1fr); margin-top: 26px; }
  .guide-card { border: 1px solid var(--line); border-radius: 20px; padding: 18px; background: rgba(255,255,255,.03); display: flex; flex-direction: column; gap: 6px; }
  .guide-card:hover { border-color: rgba(46,230,197,.4); }
  .guide-emoji { font-size: 26px; }
  .guide-card strong { font-size: 15px; }
  .guide-card span { font-size: 12px; color: var(--muted); line-height: 1.9; }
  .guide-card small { margin-top: auto; color: var(--mint); font-size: 11px; font-weight: 700; }
  .guides-note { margin-top: 30px; color: var(--muted); font-size: 13px; line-height: 2; }
  @media (max-width: 860px) { .guide-grid { grid-template-columns: 1fr; } }
</style>
<script type="application/ld+json">
${JSON.stringify(indexLd)}
</script>
</head>
<body>
<div class="bg-glow"></div>
<header><div class="wrap nav"><a class="brand" href="../"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="../../">افتح التطبيق</a></div></header>
<main><div class="wrap">
<section class="guides-hero">
  <span class="eyebrow">📘 أدلة مجانية</span>
  <h1>من الكتاب… للامتحان</h1>
  <p>ثلاث طرق عملية تستخدمها النهاردة: إزاي تذاكر من كتاب الوزارة، إزاي تنظّم آخر أسبوع، وإزاي تحل البابل شيت من غير أخطاء.</p>
</section>
<div class="guide-grid">${cards.join('\n')}</div>
<p class="guides-note">الأدلة دي مكتوبة لطلاب المدارس المصرية من الأول الابتدائي للتالت الإعدادي، وبتشتغل مع أي كتاب رسمي. <a href="../grades/" style="color:var(--mint)">نزّل كتب صفك من هنا</a>.</p>
</div></main>
<footer><div class="wrap foot"><span>© Jessica — صُنع في مصر 🇪🇬</span><span><a href="../">الرئيسية</a> · <a href="../grades/">كتب الوزارة</a> · <a href="../topics/">مواضيع المذاكرة</a></span></footer>
</body>
</html>`,
)

console.log('guides written:', GUIDES.length + 1)
