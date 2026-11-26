import fs from 'node:fs'
import path from 'node:path'

const BASE = 'https://bishoynabilanis.github.io/jessica'
const OUT = 'public/welcome/en/topics'

const TOPICS = [
  {
    slug: 'parents',
    title: 'A parent’s guide to Jessica (5 minutes to start)',
    description:
      'What Jessica does, how to set it up for your child in five minutes, the weekly routine that works, and exactly what stays on your device.',
    h1: 'A parent’s guide to Jessica',
    lead:
      'Jessica is a study app built on the Egyptian Ministry books: it reads the page your child is on, explains it, builds questions and keeps a plan. No account, no subscription, and nothing leaves the device.',
    sections: [
      {
        h: 'What it actually does — in plain terms',
        p: [
          'Three things matter for a school night: the child reads the right page, they answer questions about it, and someone notices what they got wrong. Jessica does all three in one place. The library holds the official books, the reader shows the page, and the question bank turns that page into practice with a reason after every answer.',
          'Everything procedural — the questions, the plan, the timer, the marking — is generated on the device. That is why it works with no internet and why there is no login to forget.',
        ],
      },
      {
        h: 'Setting it up in five minutes',
        list: [
          'Install it on the phone or laptop the child actually uses (the install guide has Android, iPhone and desktop steps).',
          'Choose the grade and the school type in the settings, so the plan and the questions land at the right level.',
          'Open the library and import one book — the current term is enough to start.',
          'Optionally add a free Gemini key if you want the AI explanations. Without a key the question bank, the plan, the timer and the marking all still work.',
          'Add a profile per child if there are siblings: each keeps a separate progress and streak.',
        ],
      },
      {
        h: 'The weekly routine that works',
        p: [
          'Do not aim for a daily hour. Aim for three short sessions: one reading session of twenty-five minutes with the focus timer, one ten-question drill on the lesson they just read, and one weekly paper on Friday built from the weakest skills.',
          'After a week, open the weekly review. It shows the minutes that were actually logged, the days the child showed up, and the accuracy per skill. If the minutes are zero, the problem is the routine, not the app — move the session to right after dinner and keep it to fifteen minutes.',
        ],
      },
      {
        h: 'Privacy and money, honestly',
        p: [
          'There is no server holding your child’s work. Books, answers, streaks and mistakes live in the browser on that device. That also means: if you clear the site data, the progress goes with it, so export a backup from the settings page once a month.',
          'There is no subscription. If you add your own AI key, you pay that provider directly for what you use; without a key, the app is fully usable.',
        ],
      },
    ],
    faq: [
      {
        q: 'Does my child need an email or a phone number?',
        a: 'No. There is no account at all, so there is nothing to sign up for and nothing to verify.',
      },
      {
        q: 'Can two children share one device?',
        a: 'Yes. Create a profile for each child in the profiles page; books and settings are shared, progress and mistakes are not.',
      },
      {
        q: 'What happens if the child uses it without internet?',
        a: 'The question bank, the focus timer, the plan, the flashcards and the marking all keep working. Only the AI explanations need a connection and a key.',
      },
      {
        q: 'How do I know it is helping?',
        a: 'The weekly review gives three numbers: minutes studied, days present, and accuracy per skill. Accuracy is the one to watch.',
      },
    ],
  },
  {
    slug: 'study-plan',
    title: 'A study plan that survives the week (not just Sunday)',
    description:
      'How to build a realistic study week for an Egyptian student: three short blocks, a fixed review paper, what to drop first, and how to tell it is working.',
    h1: 'A study plan that survives the week',
    lead:
      'Most plans fail on Tuesday, not on Sunday. They are built for the ideal week — the one with no football, no visit and no tired evening. A plan that survives is smaller than you think and has one fixed review.',
    sections: [
      {
        h: 'Start from the real week, not the ideal one',
        p: [
          'Write down the nights that are actually free. For most families that is three nights, not seven. Three nights of twenty-five minutes is seventy-five minutes of focused work — more than a three-hour session that never happens.',
          'Put the sessions after a fixed event (dinner, prayer, the school run) instead of at a fixed clock time. Events are stable; clock times move.',
        ],
      },
      {
        h: 'The three-block week',
        list: [
          'Block one — read: one lesson from the current unit, with the focus timer running and the phone face down.',
          'Block two — answer: ten questions on that same lesson in the question bank, reading the reason after every answer.',
          'Block three — repair: a ten-question paper on the skills that were wrong this week, plus the mistakes notebook.',
        ],
      },
      {
        h: 'One fixed review, once a week',
        p: [
          'Friday gets a single twenty-question paper on the weakest four skills. It is short, it is marked, and it is comparable week to week — which is exactly what a plan needs. A plan you cannot measure is a wish.',
          'Keep the paper in one place (the paper history in the app). Looking at four Fridays in a row tells you more than any single mark.',
        ],
      },
      {
        h: 'What to drop first when the week collapses',
        p: [
          'Drop the reading block before the question block. Reading feels productive and is easy to postpone; questions are where the gaps show. If a night disappears, keep ten questions and skip the page.',
          'Never drop the Friday paper. It is the only part of the plan that tells you whether the other blocks worked.',
        ],
      },
    ],
    faq: [
      {
        q: 'How many minutes a night for primary?',
        a: 'Fifteen to twenty-five minutes is enough for primary. Long sessions at that age produce fatigue, not understanding.',
      },
      {
        q: 'Should the plan cover every subject?',
        a: 'No. Cover the two subjects with the nearest exams, and let the rest ride on homework. A plan that lists six subjects is a list, not a plan.',
      },
      {
        q: 'What if the child refuses?',
        a: 'Cut the block to ten minutes and let them choose the subject. Starting is the hard part; the length can grow later.',
      },
    ],
  },
  {
    slug: 'exam-anxiety',
    title: 'Exam nerves: a plan for the last week',
    description:
      'A calm, practical week before an exam: what to study, what to stop doing, how to sleep, and a script for the morning of the paper.',
    h1: 'Exam nerves: a plan for the last week',
    lead:
      'Nerves are not a character flaw and they do not disappear by being told to relax. They shrink when the work becomes specific: fewer pages, more questions, and a fixed bedtime.',
    sections: [
      {
        h: 'Stop re-reading, start retrieving',
        p: [
          'The week before an exam, re-reading feels safe and teaches very little. Answering questions from memory is harder and works. Ten questions with the reasons beats an hour of highlighting.',
          'Use the question bank on the unit you are being examined on, then the weekly paper on the weakest skills. If an answer is wrong, the reason is right there — read it once, then answer the next question.',
        ],
      },
      {
        h: 'A week that fits in the evenings',
        list: [
          'Night one and two: one unit review paper each, twenty questions, marked, no clock pressure.',
          'Night three: the mistakes notebook only — drill the questions that were wrong.',
          'Night four and five: a timed twenty-minute paper, at the same time of day as the real exam.',
          'The last night: nothing new. Read the mistakes notebook once and sleep early.',
        ],
      },
      {
        h: 'Sleep, screens and the last hour',
        p: [
          'The night before, the last study hour should end at least an hour before bed, and the phone should leave the room. A tired brain loses more marks than a missed page.',
          'On the morning of the paper, eat something small, arrive with time to spare, and read the whole paper for two minutes before writing. Most lost marks are misread questions, not unknown answers.',
        ],
      },
      {
        h: 'What to say when the fear shows up',
        p: [
          'Name it, shrink it, and give one action: “You are nervous because it matters. Ten questions now, then we stop.” A specific next action lowers the noise more than reassurance does.',
          'After the exam, ask what was hard rather than how many marks they think they got. The first question teaches; the second only feeds the worry.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is a timed paper the night before a good idea?',
        a: 'Not the night before. Timed practice belongs three to five days earlier; the last night is for the mistakes notebook and sleep.',
      },
      {
        q: 'Should we study a new lesson the day before?',
        a: 'No. New material the day before raises anxiety and rarely sticks. Revise what is already known.',
      },
      {
        q: 'How do I stop the phone from breaking the session?',
        a: 'Use the focus timer and put the phone in another room for the twenty-five minutes. A timer in the same app replaces the “just checking” loop.',
      },
    ],
  },
  {
    slug: 'homework',
    title: 'Homework without the nightly fight',
    description:
      'A three-step homework routine that removes the argument, what to say when the child says “I don’t get it”, and when to stop and mark it instead.',
    h1: 'Homework without the nightly fight',
    lead:
      'Most homework arguments are not about difficulty. They are about starting, about who is in charge, and about a parent hovering close enough to answer every hesitation.',
    sections: [
      {
        h: 'The fight is usually about starting',
        p: [
          'A child who refuses homework at seven in the evening is often tired, hungry, or still deciding who wins. Fix the conditions first: a snack, ten minutes of nothing, then the bag on the table with the phone in another room.',
          'Do not ask “do you have homework?” — the answer is always no. Ask them to open the bag and put the books on the table, then leave. The physical start does more than the negotiation.',
        ],
      },
      {
        h: 'The three-step routine',
        list: [
          'Step one — empty the bag: every book out, every task named out loud, one line of what it asks.',
          'Step two — order by friction: start with the shortest task, not the hardest. Momentum first, stamina second.',
          'Step three — check with questions, not answers: “show me the one you are sure about” before “is it right?”.',
        ],
      },
      {
        h: 'When the child says “I don’t get it”',
        p: [
          'Read the question aloud once, slowly. If that does not unlock it, read the page it came from together, or have the app read it. Then ask for one example and stop there — after that, mark it and move on.',
          'A marked question is information for the teacher. A question solved by a parent at nine at night is information for nobody.',
        ],
      },
      {
        h: 'Ten minutes of practice beats an hour of copying',
        p: [
          'When the written work is done, ten questions on the same lesson is worth more than another page of copying. The question bank marks them instantly and shows the reason, so the child sees why an answer was wrong while the lesson is still warm.',
          'Keep the session short and end on a win: the last question should be one they can answer.',
        ],
      },
    ],
    faq: [
      {
        q: 'Should I sit next to my child during homework?',
        a: 'Sit nearby at first if they need it, then move away. Being watched makes every hesitation feel like a test.',
      },
      {
        q: 'What if the homework takes two hours?',
        a: 'Set a limit (forty minutes for primary) and mark what is unfinished. Two hours of grinding teaches avoidance, not the subject.',
      },
      {
        q: 'My child finishes fast and makes careless mistakes. What helps?',
        a: 'Ask them to read the question aloud before answering, and add ten questions from the bank afterwards. Speed without checking is the habit to break.',
      },
    ],
  },
  {
    slug: 'memorization',
    title: 'Memorising without cramming: what actually sticks',
    description:
      'Why re-reading feels like studying and is not, the three-pass method for a page of facts, and how spaced flashcards fit into a normal school night.',
    h1: 'Memorising without cramming',
    lead:
      'Re-reading a page feels like studying because it is comfortable. It is also the least efficient way to remember anything. What sticks is the moment you try to produce the answer and cannot quite reach it.',
    sections: [
      {
        h: 'Recognition is not recall',
        p: [
          'Highlighting and re-reading train recognition: the page looks familiar, so the brain says “I know this”. The exam asks for recall, which is a different skill.',
          'Close the book and say the three points out loud. Whatever you cannot say is what you do not know yet — the rest you can stop revising.',
        ],
      },
      {
        h: 'The three-pass method',
        list: [
          'Pass one — read a short block (one heading, not the chapter) and mark only the words you could not produce yourself.',
          'Pass two — close the book and write the block from memory in five lines, in your own words.',
          'Pass three — check, correct in a different colour, and turn each correction into a question.',
        ],
      },
      {
        h: 'Space it, do not repeat it',
        p: [
          'One session tonight, ten minutes tomorrow, ten minutes in three days beats three hours tonight. The gap is doing the work; the forgetting and the recovery is what makes it durable.',
          'In the app, the flashcards schedule themselves and the mistakes notebook brings back the exact questions that were missed — so you do not have to decide what to review.',
        ],
      },
      {
        h: 'Sleep is part of the method',
        p: [
          'Facts consolidated during sleep are the ones you keep. A late night before an exam trades tomorrow’s memory for tonight’s comfort. Stop an hour before bed and let the last pass settle.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is it better to write the answer or say it?',
        a: 'Both work; writing is slower and closer to an exam. For a quick check on a school night, saying it out loud is enough.',
      },
      {
        q: 'How many flashcards a day?',
        a: 'Ten to fifteen minutes of due cards, not a fixed number. The app shows what is due, which is the point of spacing.',
      },
      {
        q: 'What if my child memorises without understanding?',
        a: 'Ask them to explain it in their own words, then give one question that applies it. If they cannot, the page needs a lesson, not more repetition.',
      },
    ],
  },
  {
    slug: 'monthly-tests',
    title: 'The monthly test: two weeks without burning out',
    description:
      'A two-week plan for the Egyptian monthly test: unit reviews early, timed papers later, the night before, and how to read the mark when it arrives.',
    h1: 'The monthly test: two weeks without burning out',
    lead:
      'The monthly test is small enough to ignore and frequent enough to matter. Two weeks of short sessions beats one weekend of panic, and it leaves the child able to sit the next one without dread.',
    sections: [
      {
        h: 'Week one: cover the units, not the subject',
        p: [
          'List the units the test covers — usually two or three — and give each one a review paper of twenty questions. Mark it, then drill only what was wrong.',
          'Do not open a new unit in week one. The test is on what was taught, and new material this late competes with revision instead of adding to it.',
        ],
      },
      {
        h: 'Week two: the clock and the mistakes',
        list: [
          'Two timed papers of twenty minutes, at the same time of day as the real test.',
          'After each paper, only the mistakes notebook. No new questions until the old ones are fixed.',
          'The last two nights: nothing new. One pass over the notebook, then sleep.',
        ],
      },
      {
        h: 'The night before and the morning of',
        p: [
          'The night before, read the mistakes notebook once and stop. Pack the bag, sharpen the pencils, and set the alarm half an hour earlier than feels necessary.',
          'In the morning, a small breakfast and two minutes reading the whole paper before writing. Most lost marks in a monthly test are misread questions, not unknown answers.',
        ],
      },
      {
        h: 'How to read the mark when it arrives',
        p: [
          'Separate the mark into three causes: did not know it, knew it and misread it, or ran out of time. Each one has a different fix — content, reading habit, or timed practice.',
          'A low mark that is mostly careless mistakes is better news than a middle mark that is mostly gaps, and only the paper itself tells you which one you have.',
        ],
      },
    ],
    faq: [
      {
        q: 'When should revision start?',
        a: 'Two weeks before for a monthly test, three to four for a term exam. The first session should be a marked paper, not reading.',
      },
      {
        q: 'Should we use old exam papers?',
        a: 'Yes, if they are available — but only after the content is secure. Papers diagnose; they do not teach.',
      },
      {
        q: 'What if the test is next week already?',
        a: 'Do the unit review papers for the units covered, then the mistakes notebook. Skip everything else; it is the highest-value hour you have.',
      },
    ],
  },
]

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const STYLE = `
  .article { max-width: 780px; margin: 0 auto; padding: 40px 0 60px; }
  .article h1 { font-size: clamp(28px, 4vw, 42px); line-height: 1.35; margin: 14px 0; }
  .article .meta { color: var(--muted); font-size: 12px; margin-bottom: 22px; }
  .article h2 { font-size: 21px; margin: 30px 0 10px; }
  .article p { color: var(--muted); line-height: 1.95; font-size: 15px; margin-bottom: 10px; }
  .article ul { color: var(--muted); line-height: 1.9; font-size: 14px; padding-inline-start: 22px; margin-bottom: 12px; }
  .article ul li::marker { color: var(--mint); }
  .lead { border-inline-start: 3px solid var(--mint); padding-inline-start: 14px; }
  .cta-box { margin-top: 28px; border: 1px solid rgba(46,230,197,.3); background: rgba(46,230,197,.07); border-radius: 18px; padding: 18px; text-align: center; }
  .cta-box p { color: var(--text); font-weight: 700; margin-bottom: 10px; }
  .faq { margin-top: 30px; }
  .faq details { border: 1px solid var(--line); border-radius: 16px; padding: 14px 16px; background: rgba(255,255,255,.03); margin-bottom: 8px; }
  .faq summary { cursor: pointer; font-weight: 700; font-size: 14px; }
  .faq p { margin-bottom: 0; }
  .rel-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .rel-grid a { border: 1px solid var(--line); border-radius: 999px; padding: 8px 14px; font-size: 12px; font-weight: 700; color: var(--muted); }
  .rel-grid a:hover { color: var(--text); border-color: rgba(46,230,197,.35); }
  .back { display: inline-block; margin-top: 26px; color: var(--mint); font-size: 13px; font-weight: 700; }
  .nav-actions { display: flex; align-items: center; gap: 8px; }
  .topic-list { display: grid; gap: 12px; margin-top: 18px; }
  .topic-card { display: block; border: 1px solid var(--line); border-radius: 18px; padding: 16px 18px; background: rgba(255,255,255,.03); }
  .topic-card:hover { border-color: rgba(46,230,197,.4); }
  .topic-card b { display: block; color: var(--text); font-size: 16px; margin-bottom: 4px; }
  .topic-card span { color: var(--muted); font-size: 13px; line-height: 1.8; }
`

function page({ title, description, h1, body, canonical, arPath, jsonld, depth = 2 }) {
  const A = depth === 3 ? '../../../../' : '../../../'
  const W = depth === 3 ? '../../../' : '../../'
  const E = depth === 3 ? '../../' : '../'
  const bodyFixed = body.replace(/{{A}}/g, A).replace(/{{W}}/g, W).replace(/{{E}}/g, E)
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
${arPath ? `<link rel="alternate" hreflang="ar" href="${arPath}">` : ''}
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="en_GB">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${BASE}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${BASE}/og.jpg">
<link rel="icon" href="${A}icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${A}icons/icon-192.png">
<link rel="stylesheet" href="${W}style.css">
<style>${STYLE}</style>
${jsonld}
</head>
<body>
<div class="bg-glow"></div>
<header><div class="wrap nav"><a class="brand" href="${E}"><span class="mark">J</span><span>jessica<i>.</i></span></a><div class="nav-actions"><a class="btn sm" href="${A}">Open the app</a><a class="btn ghost sm" href="${W}topics/">العربية</a></div></div></header>
<main><div class="wrap"><article class="article">
${bodyFixed}
</article></div></main>
</body>
</html>
`
}

const HUB = {
  title: 'Study guides for Egyptian parents and students',
  description:
    'Practical guides on building a study week, handling exam nerves and running Jessica at home — written for parents, short enough to act on tonight.',
  h1: 'Study guides you can act on tonight',
  lead: 'Six guides, no filler: homework, memorising, the study week, exam nerves, monthly tests, and how a parent sets the app up in five minutes.',
}

let count = 0

for (const topic of TOPICS) {
  const canonical = `${BASE}/welcome/en/topics/${topic.slug}/`
  const arPath = `${BASE}/welcome/topics/${topic.slug}/`
  const body = `
<span class="eyebrow">📘 Parent guide</span>
<h1>${esc(topic.h1)}</h1>
<p class="meta">📖 4 minute read · updated November 2026</p>
<p class="lead">${esc(topic.lead)}</p>
${topic.sections
  .map(
    (section) => `<h2>${esc(section.h)}</h2>
${(section.p || []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join('\n')}
${section.list ? `<ul>${section.list.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}`,
  )
  .join('\n')}

<div class="cta-box">
  <p>Turn the plan into questions tonight.</p>
  <a class="btn" href="{{A}}#/bank">🧩 Open the question bank</a>
</div>

<h2>Frequently asked</h2>
<div class="faq">
${topic.faq.map((item) => `<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`).join('\n')}
</div>

<h2>Keep going</h2>
<div class="rel-grid">
  <a href="{{E}}bank/">🧩 Question bank</a>
  <a href="{{E}}focus/">⏱️ Focus timer</a>
  <a href="{{E}}install/">📲 Install the app</a>
  <a href="{{E}}">🌍 English page</a>
</div>

<a class="back" href="{{E}}topics/">← Back to the guides</a>`

  const jsonld = `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: topic.h1,
  description: topic.description,
  inLanguage: 'en',
  datePublished: '2026-11-16',
  dateModified: '2026-11-16',
  image: `${BASE}/og.jpg`,
  author: { '@type': 'Organization', name: 'Jessica' },
  publisher: {
    '@type': 'Organization',
    name: 'Jessica',
    logo: { '@type': 'ImageObject', url: `${BASE}/icons/icon-192.png` },
  },
  mainEntityOfPage: canonical,
})}
</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  inLanguage: 'en',
  mainEntity: topic.faq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
})}
</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Jessica', item: `${BASE}/welcome/en/` },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: `${BASE}/welcome/en/topics/` },
    { '@type': 'ListItem', position: 3, name: topic.h1, item: canonical },
  ],
})}
</script>`

  const dir = path.join(OUT, topic.slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    path.join(dir, 'index.html'),
    page({
      title: `${topic.title} | Jessica`,
      description: topic.description,
      h1: topic.h1,
      body,
      canonical,
      arPath,
      jsonld,
      depth: 3,
    }),
  )
  count += 1
}

// hub
const hubCanonical = `${BASE}/welcome/en/topics/`
const hubBody = `
<span class="eyebrow">📘 Guides</span>
<h1>${esc(HUB.h1)}</h1>
<p class="meta">📖 Updated November 2026</p>
<p class="lead">${esc(HUB.lead)}</p>
<div class="topic-list">
${TOPICS.map(
  (topic) => `<a class="topic-card" href="./${topic.slug}/"><b>${esc(topic.h1)}</b><span>${esc(topic.description)}</span></a>`,
).join('\n')}
</div>
<h2>How to use them</h2>
<p>They cover the moments where families actually get stuck: the homework that turns into an argument, the week that collapses by Tuesday, the last seven days before an exam, and the monthly test that arrives faster than expected.</p>
<h2>More topics in Arabic</h2>
<p>There are fifteen longer guides in Arabic — subjects, memorisation, homework, monthly tests and more. They are written for the same audience and link back to the same tools.</p>
<div class="rel-grid">
  <a href="{{W}}topics/">كل المواضيع بالعربي</a>
  <a href="{{E}}bank/">🧩 Question bank</a>
  <a href="{{E}}focus/">⏱️ Focus timer</a>
</div>
<a class="back" href="{{E}}">← Back to the English page</a>`

const hubJsonLd = `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: HUB.h1,
  description: HUB.description,
  inLanguage: 'en',
  url: hubCanonical,
  hasPart: TOPICS.map((topic) => ({
    '@type': 'Article',
    name: topic.h1,
    url: `${BASE}/welcome/en/topics/${topic.slug}/`,
  })),
})}
</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Jessica', item: `${BASE}/welcome/en/` },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: hubCanonical },
  ],
})}
</script>`

fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(
  path.join(OUT, 'index.html'),
  page({
    title: `${HUB.title} | Jessica`,
    description: HUB.description,
    h1: HUB.h1,
    body: hubBody,
    canonical: hubCanonical,
    arPath: `${BASE}/welcome/topics/`,
    jsonld: hubJsonLd,
  }),
)

console.log(`english topics: ${count} articles + hub`)
