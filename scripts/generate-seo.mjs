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

const STAGE = {
  1: { stage: 'المرحلة الابتدائية', about: 'الصف الأول الابتدائي هو أول سنة في المدرسة، وهدفه تعليم الحروف والأرقام والقراءة والكتابة من الصفر. الكتب هنا بسيطة ومصوّرة، والأفضل مراجعتها مع الطفل ١٠ دقايق كل يوم بدل جلسات طويلة.', why: 'المنهج في أولى ابتدائي بيبني الأساس: لو الطفل قرأ وكتب كويس من هنا، كل السنوات اللي بعده بتبقى أسهل.' },
  2: { stage: 'المرحلة الابتدائية', about: 'الصف الثاني الابتدائي بيبني على أساس الأول: قراءة نصوص أطول، جمع وطرح بأرقام أكبر، وعلوم أولية عن الجسم والنبات. الكتب بتزوّد التدريبات تدريجيًا عشان الطفل يثبّت المهارة قبل اللي بعدها.', why: 'لو الطفل اتأخر في القراءة هنا، التأخير بيكبر في تالتة ورابعة، فمراجعة أسبوعية بسيطة بتوفر مجهود كبير بعدين.' },
  3: { stage: 'المرحلة الابتدائية', about: 'الصف الثالث الابتدائي بيدخل مفاهيم جديدة زي الضرب والقسمة والعلوم البيئية، وبيبدأ يطلب من الطفل يفكر مش يحفظ بس. الكتب الرسمية هنا هي المرجع اللي الامتحان بييجي منه حرفيًا.', why: 'ثالثة ابتدائي أول سنة بيظهر فيها فرق واضح بين طالب فاهم وطالب حافظ، والكتب الرسمية بتديك نفس ترتيب المنهج.' },
  4: { stage: 'المرحلة الابتدائية', about: 'الصف الرابع الابتدائي بداية المنهج متعدد المواد بشكل أوسع: علوم ورياضيات ودراسات ولغات. عدد الكتب بيزيد، وده بيخلي تنظيم المذاكرة أهم من عدد الساعات.', why: 'مع تعدد المواد، الطالب اللي عنده خطة أسبوعية بسيطة بيفضل متقدم من غير ضغط آخر السنة.' },
  5: { stage: 'المرحلة الابتدائية', about: 'الصف الخامس الابتدائي بيكبّر المفاهيم: كسور وأعداد عشرية، ودورات في العلوم، ودراسات أعمق. الكتب هنا بتفصّل الشرح بأمثلة، والامتحان بيعتمد على فهم الفكرة مش الحفظ.', why: 'خامسة بتبدأ تجهيز الطالب للإعدادي، فالمهارات اللي بتتبني فيها بتظهر نتيجتها في أولى إعدادي.' },
  6: { stage: 'المرحلة الابتدائية', about: 'الصف السادس الابتدائي آخر سنة ابتدائي، وهدفه تثبيت الأساس قبل نقلة الإعدادي. المنهج فيه مراجعة لمفاهيم سابقة مع تعمق أكبر، وده بيخليه سنة مفصلية.', why: 'سادسة ابتدائي فرصة أخيرة لتقوية القراءة والرياضيات قبل ما المواد تزيد في الإعدادي.' },
  7: { stage: 'المرحلة الإعدادية', about: 'الصف الأول الإعدادي أول نقلة حقيقية في طريقة المذاكرة: مواد أكتر، مفاهيم أعمق، وامتحانات بتحتاج تنظيم. الكتب الرسمية هنا هي الحد الأدنى اللي لازم يتذاكر، مش كل حاجة.', why: 'أولى إعدادي بتحدد عادة المذاكرة لباقي الإعدادي، والبداية المنظمة بتوفر تعب كبير بعدين.' },
  8: { stage: 'المرحلة الإعدادية', about: 'الصف الثاني الإعدادي بيكمّل بناء المفاهيم في العلوم والرياضيات والدراسات، وبيبدأ يطلب تحليل وربط بين الدروس. الاعتماد على الملخصات بس هنا بيبقى خطر.', why: 'ثانية إعدادي سنة الفرق: اللي بيفهم من الكتاب بيحل أي صيغة سؤال، واللي بيحفظ بيقع في أول سؤال مختلف.' },
  9: { stage: 'المرحلة الإعدادية', about: 'الصف الثالث الإعدادي سنة الشهادة الإعدادية، وأهم سنة في المرحلة. المنهج محدود لكن الامتحان بيقيس الفهم والتطبيق، والكتب الرسمية هي المرجع الأدق.', why: 'في سنة الشهادة، حل امتحانات سنوات سابقة على نفس المنهج بيفرق أكتر من أي حاجة تانية.' },
}

const SUBJECT_AR = {
  English: 'إنجليزي',
  Arabic: 'عربي',
  Mathematics: 'رياضيات',
  Science: 'علوم',
  'Social Studies': 'دراسات اجتماعية',
  French: 'فرنساوي',
  German: 'ألماني',
  Religion: 'تربية دينية',
}


const FAQ = {
  1: [
    ['ابني لسه بيتعلم الحروف، الكتب دي مناسبة؟', 'أيوه، كتب أولى ابتدائي مبنية خطوة بخطوة من الحروف للأصوات للكلمات. ابدأ بجلسة ١٠ دقايق يوميًا، وخلي الطفل يقرأ بصوت عالي قبل ما تحل أي تدريب.'],
    ['إيه أهم حاجة أتابعها في أولى ابتدائي؟', 'القراءة والكتابة أكتر من الحفظ. لو الطفل قدر يقرأ كلمة جديدة ويكتبها لوحده، يبقى الأساس سليم وهيكمل أسهل في تانية وتالتة.'],
  ],
  2: [
    ['إيه أهم مهارة في تانية ابتدائي؟', 'القراءة بطلاقة والجمع والطرح الذهني. لو الطفل لسه بيعدّ على صواحبه، خصص ٥ دقايق يوميًا لجدول الضرب البسيط والجمع السريع.'],
    ['ابني بينسى اللي ذاكره، أعمل إيه؟', 'النسيان طبيعي. راجع نفس الدرس بعد يوم وبعد ٣ أيام وبعد أسبوع. المراجعة القصيرة المتكررة أقوى من جلسة طويلة واحدة.'],
  ],
  3: [
    ['هل الضرب والقسمة بيبدأوا فعلاً في تالتة؟', 'أيوه، تالتة ابتدائي بتبدأ جدول الضرب والقسمة البسيطة، ومعاها علوم بيئية. لو الأساس ده اتأسس صح، رابعة وخامسة بيبقوا أسهل بكتير.'],
    ['إزاي أخلي الطفل يحب العلوم؟', 'اربط الدرس بحاجة من البيت: النبات اللي على البلكونة، المية والنور. بعدها اقرأ الدرس من الكتاب واسأله سؤال واحد يشرحه بكلامه.'],
  ],
  4: [
    ['المنهج الجديد في رابعة ابتدائي صعب؟', 'المواد كترت مش لأن كل مادة صعبة، لكن لأن التنظيم بقى مهم. خطة أسبوعية بسيطة (مادة كل يوم) أفضل من مذاكرة كل المواد آخر الأسبوع.'],
    ['إزاي أوزع وقت المذاكرة في رابعة؟', '٤٥ دقيقة يوميًا كافية: ٢٠ دقيقة قراءة من الكتاب، ١٥ دقيقة حل أسئلة، و١٠ دقايق مراجعة سريعة للدرس القديم.'],
  ],
  5: [
    ['إزاي أجهز لخامسة والإعدادي قريب؟', 'خامسة هي سنة بناء المهارات: كسور وأعداد عشرية وقراءة نصوص أطول. ركز على الفهم والتدريب، مش على حفظ الملخصات، وهتلاقي أولى إعدادي أسهل.'],
    ['هل الكسور هي أصعب حاجة في خامسة؟', 'الكسور والأعداد العشرية أكتر حاجة بتوقف الطلبة، والسبب إنها بتتبني على القسمة. راجع القسمة الأول لو لسه ضعيفة، وبعدها الكسور هتبقى منطقية.'],
  ],
  6: [
    ['إيه اللي لازم يخلص قبل الإعدادي؟', 'القراءة بطلاقة، العمليات الأربع على الكسور والأعداد العشرية، ومعرفة إزاي يلخص درس بكلامه. لو التلاتة دول تمام، الانتقال للإعدادي هيكون سلس.'],
    ['إزاي أتعامل مع ضغط سادسة ابتدائي؟', 'قسّم الأسبوع: ٣ أيام مواد أساسية ويوم مراجعة ويوم حل امتحان. المذاكرة المنتظمة ٤٥ دقيقة بتغلب جلسات ٤ ساعات آخر الأسبوع.'],
  ],
  7: [
    ['أولى إعدادي نقلة صعبة؟', 'هي نقلة في الكم مش في النوع: مواد أكتر ومفاهيم أعمق. الفرق الحقيقي إن الطالب يبدأ يعتمد على الكتاب والملاحظات بدل الحفظ قبل الامتحان.'],
    ['إزاي أذاكر الرياضيات في أولى إعدادي؟', 'افهم القانون أولًا، بعدها حل ٣ أمثلة من الكتاب، وبعدها ٥ أسئلة من غير ما تبص على الحل. أي قانون مش قادر تشرحه بكلامك يبقى لسه محتاج مراجعة.'],
  ],
  8: [
    ['إزاي أحسن درجة العلوم في تانية إعدادي؟', 'العلوم هنا بتبدأ تربط مفاهيم: اقرأ الدرس، ارسم مخطط بسيط بأيدك، وبعدها حل أسئلة الكتاب. الرسم والمخطط بيثبتوا المعلومة أكتر من إعادة القراءة.'],
    ['ثانية إعدادي محتاجة حفظ أكتر؟', 'لأ، محتاجة فهم وربط. الحفظ لوحده بينفع في سؤال واحد، لكن أسئلة «ليه» و«قارن» بتحتاج تكون فاهم العلاقة بين الدروس.'],
  ],
  9: [
    ['إيه أفضل طريقة مراجعة لتالتة إعدادي؟', 'ابدأ بمراجعة الفكرة من الكتاب، بعدها حل امتحان كامل بتوقيت، وبعدها راجع الغلطات فقط. التصحيح أهم من حل امتحانات كتير من غير مراجعة.'],
    ['هل حل امتحانات سنوات سابقة مهم؟', 'أيوه، هو أهم حاجة في سنة الشهادة. بيعرّفك شكل الأسئلة، وبيكشف النقط اللي بتغلط فيها تحت ضغط الوقت. حل ٣ امتحانات بتركيز أفضل من ١٠ من غير تصحيح.'],
  ],
}

const PREP3_FAQ = [
  ['إيه الفرق بين تالتة إعدادي والسنين اللي قبلها؟', 'الفرق مش في صعوبة المنهج، هو في إن السنة كلها بتتحسب. عشان كده المذاكرة المنتظمة من أول شهر أهم من أي مذاكرة مكثفة آخر السنة. سنين قبل كده كان ينفع تعوّض، هنا التعويض بيكلف أكتر.'],
  ['إزاي أوزّع ٩ مواد على أسبوع؟', 'مش كل مادة كل يوم. اختار ٣ مواد «أساسية» (رياضيات + علوم + لغة) بجلسة يومية قصيرة، ووزّع الباقي على ٣ أيام في الأسبوع. الجلسة القصيرة المتكررة بتغلب الجلسة الطويلة مرة واحدة.'],
  ['أذاكر من الكتاب ولا من الملخصات؟', 'الكتاب الرسمي هو مرجع الأسئلة، والملخص مفيد للمراجعة السريعة بعد ما تكون فهمت. القاعدة: افهم من الكتاب، راجع من الملخص، وامتحن نفسك من الأسئلة.'],
  ['ابني بيذاكر ساعات وبينسى — السبب إيه؟', 'غالبًا بيقرأ من غير استرجاع. القراءة بتدّي إحساس بالفهم، لكن اللي بيثبّت هو إنه يقفل الكتاب ويكتب أو يحكي اللي فهمه. جرّب أسبوع: ٣ جمل مكتوبة بعد كل درس.'],
  ['لو الدرجة قليلة في نصف السنة، ينفع ألحق؟', 'أيوه، وبشرط واحد: تعرف المهارة الناقصة بالتحديد. مراجعة المنهج كله من الأول بتضيّع الوقت. راجع الأخطاء، وحدد ٣ مهارات، واشتغل عليهم أسبوعين، وقيس تاني.'],
]

const SHARED_FAQ = [
  ['هل الكتب دي رسمية؟', 'أيوه، كل الكتب بروابط مباشرة من سيرفر وزارة التربية والتعليم، وحقوق الطبع محفوظة للوزارة. التطبيق نفسه مجاني وبيشتغل على جهازك.'],
  ['إزاي أذاكر من غير إنترنت؟', 'نزّل الكتاب مرة واحدة واستورده في تطبيق Jessica. بعد كده القراءة والبطاقات والملاحظات تشتغل أوفلاين.'],
  ['مادتي مش موجودة في الكتالوج، أعمل إيه؟', 'استورد أي PDF من جهازك داخل التطبيق، وجيسيكا تفهرسه وتديك أسئلة منه زي أي كتاب رسمي.'],
]

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
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${BASE}/welcome/grades/${slug}/">
<link rel="alternate" hreflang="ar" href="${BASE}/welcome/grades/${slug}/">
<link rel="alternate" hreflang="x-default" href="${BASE}/welcome/grades/${slug}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="ar_EG">
<meta property="og:url" content="${BASE}/welcome/grades/${slug}/">
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
  .about { display: grid; gap: 18px; margin-top: 34px; }
  .about p { color: var(--muted); line-height: 2; font-size: 14px; }
  .about h2 { font-size: 22px; margin-bottom: 10px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 14px; }
  .chips span { border: 1px solid rgba(46,230,197,.28); background: rgba(46,230,197,.07); color: var(--mint); border-radius: 999px; padding: 6px 14px; font-size: 12px; font-weight: 700; }
  .why { display: grid; gap: 10px; grid-template-columns: repeat(3, 1fr); }
  .why div { border: 1px solid var(--line); border-radius: 16px; padding: 12px 14px; background: rgba(255,255,255,.03); font-size: 12px; color: var(--muted); line-height: 1.8; }
  .why b { display: block; color: var(--text); font-size: 13px; margin-bottom: 2px; }
  @media (max-width: 760px) { .why { grid-template-columns: 1fr; } }
  .faq { margin-top: 30px; }
  .faq h2 { font-size: 22px; margin-bottom: 12px; }
  .faq details { border: 1px solid var(--line); border-radius: 16px; padding: 14px 16px; background: rgba(255,255,255,.03); margin-bottom: 8px; }
  .faq summary { cursor: pointer; font-weight: 700; font-size: 14px; }
  .faq p { margin-top: 8px; color: var(--muted); font-size: 13px; line-height: 1.9; }
  .related { margin-top: 30px; }
  .related h2 { font-size: 20px; margin-bottom: 10px; }
  .rel-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .rel-grid a { border: 1px solid var(--line); border-radius: 999px; padding: 8px 14px; font-size: 12px; font-weight: 700; color: var(--muted); }
  .rel-grid a:hover { color: var(--text); border-color: rgba(46,230,197,.35); }
  .exam { margin-top: 34px; border: 1px solid rgba(46,230,197,.28); background: rgba(46,230,197,.06); border-radius: 20px; padding: 20px; }
  .exam h2 { font-size: 21px; margin-bottom: 10px; }
  .exam p { color: var(--muted); font-size: 14px; line-height: 2; }
  .exam ol { margin: 12px 0 8px; padding-inline-start: 20px; display: grid; gap: 8px; }
  .exam li { color: var(--muted); font-size: 13px; line-height: 1.95; }
  .exam li b { color: var(--text); }
</style>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"CollectionPage","name":"${title}","description":"${description}","url":"${BASE}/welcome/grades/${slug}/","inLanguage":"ar"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":${body.faqJson}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
  {"@type":"ListItem","position":1,"name":"Jessica","item":"${BASE}/welcome/"},
  {"@type":"ListItem","position":2,"name":"كتب الوزارة","item":"${BASE}/welcome/grades/"},
  {"@type":"ListItem","position":3,"name":"${body.gradeLabel}","item":"${BASE}/welcome/grades/${slug}/"}
]}
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
    <button class="btn ghost" type="button" onclick="navigator.share ? navigator.share({ title: document.title, url: location.href }).catch(function(){}) : window.open('https://wa.me/?text=' + encodeURIComponent(document.title + ' ' + location.href), '_blank')">🔗 شارك الصفحة</button>
  </div>
</section>
<section>
  <div class="section-head"><h2>الكتب المتاحة</h2><p>روابط رسمية مباشرة من سيرفر الوزارة. نزّل الكتاب واستورده في التطبيق مرة واحدة.</p></div>
  <table class="books-table">
    <thead><tr><th>المادة</th><th>الكتاب</th><th>الحجم</th><th>التحميل</th></tr></thead>
    <tbody>${body.rows}</tbody>
  </table>
  <p class="note">${body.note}</p>
  <div class="grade-nav">${body.nav}<a href="../../quiz/${body.slug}/">⏱️ اختبر نفسك</a><a href="../../guides/">📘 أدلة المذاكرة</a></div>
</section>
<section class="about">
  <div>
    <h2>عن الصف ${body.gradeLabel}</h2>
    <p>${body.about}</p>
    <div class="chips">${body.chips}</div>
    <p>${body.whyIntro}</p>
  </div>
  <div class="why">
    <div><b>📥 تحميل مباشر</b>ملفات PDF رسمية من سيرفر الوزارة، من غير روابط وسيطة.</div>
    <div><b>🤖 مدرس ذكي</b>بعد الاستيراد، جيسيكا تشرح أي صفحة وتولّد أسئلة منها.</div>
    <div><b>📴 أوفلاين</b>الكتاب والبطاقات والملاحظات تشتغل بدون إنترنت.</div>
  </div>
</section>
<section class="faq">
  <h2>أسئلة شائعة عن الصف ${body.gradeLabel}</h2>
  ${body.faqHtml}
</section>
${body.examHtml}
<section class="related">
  <h2>روابط مهمة</h2>
  <div class="rel-grid">${body.related}</div>
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
  const stage = STAGE[grade]
  const subjects = [...new Set(list.map((book) => book.subject))]
  const chips = subjects.map((subject) => `<span>${SUBJECT_AR[subject] || subject}</span>`).join('')
  const about = `${stage.about} في الصفحة دي ${list.length} كتاب رسمي متاح للترم الأول${subjects.length ? ` في ${subjects.length} مواد: ${subjects.map((subject) => SUBJECT_AR[subject] || subject).join('، ')}` : ''}.`
  const whyIntro = stage.why
  const faqItems =
    grade === 9
      ? [...(FAQ[grade] || []), ...PREP3_FAQ, ...SHARED_FAQ.slice(0, 1)]
      : [...(FAQ[grade] || []), ...SHARED_FAQ]
  const faqHtml = faqItems.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')
  const faqJson = JSON.stringify(
    faqItems.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  )

  const all = Object.values(LABELS)
  const at = all.findIndex(([, , s]) => s === slug)
  const prev = at > 0 ? all[at - 1] : null
  const next = at >= 0 && at < all.length - 1 ? all[at + 1] : null
  const rel = [
    `<a href="../../quiz/${slug}/">⏱️ اختبار رياضيات ${arLabel}</a>`,
    `<a href="../../install/">📲 تثبيت التطبيق على الموبايل</a>`,
    `<a href="../../topics/">🧭 مواضيع المذاكرة</a>`,
    `<a href="../../guides/exam-week/">🗓️ خطة آخر أسبوع قبل الامتحان</a>`,
    `<a href="../../guides/study-method/">📖 إزاي تذاكر من الكتاب</a>`,
  ]
  if (prev) rel.push(`<a href="../${prev[2]}/">→ كتب ${prev[0]}</a>`)
  if (next) rel.push(`<a href="../${next[2]}/">← كتب ${next[0]}</a>`)
  if (['primary-6', 'prep-1', 'prep-2'].includes(slug)) {
    rel.push(`<a href="../prep-3/">🟣 كتب تالتة إعدادي (سنة الشهادة)</a>`)
  }
  if (slug === 'prep-3') {
    rel.push(`<a href="../../guides/bubble-sheet/">✏️ حل البابل شيت صح</a>`)
  }
  const related = rel.join('')

  const examHtml =
    slug === 'prep-3'
      ? `<section class="exam">
  <h2>امتحانات تالتة إعدادي: إزاي تحوّل المذاكرة لدرجات</h2>
  <p>سنة الشهادة مش امتحان واحد — هي ٩ شهور بيتبني فيها الفرق. الطالب اللي بيذاكر صح مش بيحل أسئلة أكتر، هو بيراجع غلطاته أقل. الخطة دي مبنية على نفس المنهج الرسمي الموجود فوق.</p>
  <ol>
    <li><b>اقرأ الدرس من الكتاب مرة واحدة بس.</b> وبعدها اقفل الكتاب واكتب اللي فهمته في ٣ جمل. اللي مش قادر تكتبه هو اللي هتراجعه، مش الدرس كله.</li>
    <li><b>امتحان بتوقيت كل أسبوع.</b> ٦٠ دقيقة، من غير موبايل، وبعدها صحّح فورًا. التصحيح هو اللي بيعلّم، مش الحل.</li>
    <li><b>دفتر أخطاء واحد.</b> كل غلطة تتكتب بقاعدة الصح جنبها. قبل أي امتحان، راجع الدفتر مش الكتاب.</li>
    <li><b>مراجعة متباعدة.</b> الدرس يتزار بعد يوم، ٣ أيام، أسبوع. كل مرة ٥ دقايق، مش ساعة.</li>
  </ol>
  <p>وابدأ بقياس سريع: <a href="../../quiz/prep-3/" style="color:var(--mint);font-weight:700">اختبار رياضيات تالتة إعدادي في ٦٠ ثانية</a> — ١٠ أسئلة بتقولك مهارتك الحقيقية، وبعدها افتح الكتاب على الصفحة اللي محتاجها.</p>
</section>
<section class="exam" style="margin-top:14px">
  <h2>خطة سنة تالتة إعدادي: ٩ شهور في ٤ مراحل</h2>
  <p>سنة الشهادة بتتقسم طبيعيًا لأربع مراحل، وكل مرحلة ليها هدف مختلف. اللي بيفشل غالبًا مش بيذاكر أقل — هو بيذاكر كل حاجة بنفس الطريقة في كل مرحلة.</p>
  <ol>
    <li><b>الترم الأول (سبتمبر–ديسمبر): التأسيس.</b> هدفك تفهم مش تحفظ. لكل درس: اقرأ، اشرح لنفسك بصوت عالي، وحل ٥ مسائل. ابدأ دفتر الأخطاء من أول يوم — مش قبل الامتحان.</li>
    <li><b>امتحانات نصف السنة (يناير): القياس.</b> امتحان واحد بتوقيت حقيقي على كل مادة أساسية. النتيجة هنا مش مهمة لدرجاتك — مهمة لأنها بتقولك المواد اللي محتاجة خطة مختلفة في الترم التاني.</li>
    <li><b>الترم الثاني (فبراير–أبريل): التوسّع + التعويض.</b> نفس أسلوب الترم الأول، بس مع مادة أو اتنين من اللي ظهرت ضعيفة في نصف السنة، بجلسة إضافية أسبوعيًا. متحاولش تعوّض كل حاجة مرة واحدة.</li>
    <li><b>آخر ٦ أسابيع: التثبيت.</b> مفيش دروس جديدة. مراجعة من دفتر الأخطاء + امتحان بتوقيت كل أسبوع + مراجعة متباعدة للدروس القديمة. أي درس مش فاهمه، راجع شرحه بس — مش المنهج كله.</li>
  </ol>
  <p>ولو محتاج تبني الجدول اليومي نفسه: <a href="../../topics/study-plan/" style="color:var(--mint);font-weight:700">طريقة جدول مذاكرة واقعي في ١٠ دقايق</a> · ولو التوتر هو المشكلة: <a href="../../topics/exam-anxiety/" style="color:var(--mint);font-weight:700">خطة التعامل مع قلق الامتحان</a>.</p>
</section>`
      : ''

  const dir = path.join(outRoot, slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    path.join(dir, 'index.html'),
    page(grade, {
      title: `كتب الوزارة ${arLabel} — تحميل PDF رسمي | Jessica`,
      description,
      slug,
      body: { heading, intro, rows, note, nav, slug, gradeLabel: arLabel, about, chips, whyIntro, faqHtml, faqJson, related, examHtml },
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

const gradeCards = Object.entries(LABELS)
  .map(([g, [ar, en, slug]]) => {
    const count = books.filter((book) => book.grade === Number(g) && book.term === 'Term 1').length
    const subjects = [...new Set(books.filter((b) => b.grade === Number(g) && b.term === 'Term 1').map((b) => b.subject))]
    return `<a class="grade" href="./${slug}/"><strong>${ar}</strong><span>${count} كتاب${subjects.length ? ` · ${subjects.slice(0, 3).map((subject) => SUBJECT_AR[subject] || subject).join(' · ')}` : ''}</span></a>`
  })
  .join('')

const today = new Date().toISOString().slice(0, 10)

fs.mkdirSync(outRoot, { recursive: true })
fs.writeFileSync(
  path.join(outRoot, 'index.html'),
  `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>كتب الوزارة لكل الصفوف — تحميل PDF رسمي | Jessica</title>
<meta name="description" content="روابط رسمية لكتب وزارة التربية والتعليم المصرية من الأول الابتدائي للتالت الإعدادي — ${books.length} كتاب للترم الأول، مع تطبيق Jessica المجاني للمذاكرة بالذكاء الاصطناعي.">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${BASE}/welcome/grades/">
<link rel="alternate" hreflang="ar" href="${BASE}/welcome/grades/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="ar_EG">
<meta property="og:url" content="${BASE}/welcome/grades/">
<meta property="og:title" content="كتب الوزارة لكل الصفوف — Jessica">
<meta property="og:description" content="روابط رسمية لكتب وزارة التربية والتعليم المصرية من الأول الابتدائي للتالت الإعدادي.">
<meta property="og:image" content="${BASE}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../../icons/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../style.css">
<style>
  .grade-hero { padding: 60px 0 20px; text-align: center; }
  .grade-hero h1 { font-size: clamp(30px, 4vw, 46px); margin: 12px 0; }
  .grade-hero p { color: var(--muted); max-width: 680px; margin-inline: auto; line-height: 2; }
  .grades { display: grid; gap: 10px; grid-template-columns: repeat(3, 1fr); margin-top: 22px; }
  .grade { border: 1px solid var(--line); border-radius: 18px; padding: 16px 18px; background: rgba(255,255,255,.03); display: flex; flex-direction: column; gap: 4px; }
  .grade strong { font-size: 15px; }
  .grade span { font-size: 11px; color: var(--muted); }
  .grade:hover { border-color: rgba(46,230,197,.4); }
  .about { margin-top: 34px; color: var(--muted); font-size: 13.5px; line-height: 2; }
  @media (max-width: 860px) { .grades { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .grades { grid-template-columns: 1fr; } }
</style>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"CollectionPage","name":"كتب الوزارة لكل الصفوف","description":"روابط رسمية لكتب وزارة التربية والتعليم المصرية من الأول الابتدائي للتالت الإعدادي.","url":"${BASE}/welcome/grades/","inLanguage":"ar"}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
  {"@type":"ListItem","position":1,"name":"Jessica","item":"${BASE}/welcome/"},
  {"@type":"ListItem","position":2,"name":"كتب الوزارة","item":"${BASE}/welcome/grades/"}
]}
</script>
</head>
<body>
<div class="bg-glow"></div>
<header><div class="wrap nav"><a class="brand" href="../"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="../../">افتح التطبيق</a></div></header>
<main><div class="wrap">
<section class="grade-hero">
  <span class="eyebrow">🇪🇬 ${books.length} كتاب رسمي</span>
  <h1>كتب الوزارة لكل الصفوف</h1>
  <p>من الأول الابتدائي للتالت الإعدادي. اختار صفك، نزّل الكتب الرسمية للترم الأول بروابط مباشرة، واستوردها في Jessica مرة واحدة عشان تذاكر منها أوفلاين.</p>
</section>
<div class="grades">${gradeCards}</div>
<section class="about" style="margin-top:34px">
  <h2 style="font-size:20px;margin-bottom:10px">إزاي تختار الكتاب اللي محتاجه؟</h2>
  <p>كل صفحة صف فيها كتب المواد الأساسية للترم الأول، وكل كتاب ليه صفحة رسمية على سيرفر الوزارة. الطريقة الأسرع:</p>
  <ol style="margin:12px 0 12px;padding-inline-start:20px;display:grid;gap:8px">
    <li><b>حدد الصف والترم.</b> لو مش متأكد من الترم، اسأل المدرس — الكتالوج هنا للترم الأول وبيتحدّث مع بداية كل ترم.</li>
    <li><b>نزّل مادة واحدة الأول.</b> مش لازم تنزّل ٨ كتب مرة واحدة. ابدأ بالمادة اللي عليها امتحان قريب.</li>
    <li><b>استورد الكتاب في التطبيق مرة واحدة.</b> بعد كده القراءة والبحث والشرح بيشتغلوا أوفلاين من غير إنترنت.</li>
  </ol>
  <p>ولو مادة مش موجودة في الكتالوج، تقدر تستورد أي PDF من جهازك — التطبيق بيفهرسه وبيولّد أسئلة منه بنفس طريقة الكتب الرسمية.</p>
</section>
<p class="about">كل الكتب منشورة على سيرفر وزارة التربية والتعليم الرسمي، وحقوق الطبع محفوظة للوزارة. التطبيق نفسه مجاني وبدون حساب، وبيشتغل على الموبايل والتابلت والكمبيوتر، ويقدر يقرا أي PDF تستورده من جهازك لو مادتك مش موجودة في الكتالوج.</p>
</div></main>
<footer><div class="wrap foot"><span>© Jessica — صُنع في مصر 🇪🇬</span><span><a href="../">الرئيسية</a> · <a href="../topics/">مواضيع المذاكرة</a> · <a href="../install/">التثبيت</a> · <a href="../../">التطبيق</a></span></div></footer>
</body>
</html>`,
)

const urls = [
  { loc: `${BASE}/welcome/`, freq: 'weekly', priority: '1.0' },
  { loc: `${BASE}/welcome/en/`, freq: 'weekly', priority: '0.9' },
  { loc: `${BASE}/welcome/grades/`, freq: 'weekly', priority: '0.9' },
  ...Object.values(LABELS).map(([, , slug]) => ({ loc: `${BASE}/welcome/grades/${slug}/`, freq: 'monthly', priority: '0.8' })),
  { loc: `${BASE}/welcome/guides/`, freq: 'monthly', priority: '0.8' },
  { loc: `${BASE}/welcome/guides/study-method/`, freq: 'monthly', priority: '0.7' },
  { loc: `${BASE}/welcome/guides/exam-week/`, freq: 'monthly', priority: '0.7' },
  { loc: `${BASE}/welcome/guides/bubble-sheet/`, freq: 'monthly', priority: '0.7' },
  { loc: `${BASE}/welcome/quiz/`, freq: 'weekly', priority: '0.9' },
  { loc: `${BASE}/welcome/install/`, freq: 'monthly', priority: '0.8' },
  { loc: `${BASE}/welcome/topics/`, freq: 'weekly', priority: '0.9' },
  ...['study-plan', 'homework', 'parents', 'math', 'exam-anxiety', 'memorization', 'english', 'monthly-tests', 'focus', 'science', 'arabic', 'primary-kid', 'midyear', 'word-problems', 'study-notes'].map((slug) => ({
    loc: `${BASE}/welcome/topics/${slug}/`,
    freq: 'monthly',
    priority: '0.8',
  })),
  ...Object.values(LABELS).map(([, , slug]) => ({ loc: `${BASE}/welcome/quiz/${slug}/`, freq: 'weekly', priority: '0.8' })),
  { loc: `${BASE}/`, freq: 'weekly', priority: '0.7' },
]
fs.writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.freq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`,
)
console.log('index + sitemap done')
