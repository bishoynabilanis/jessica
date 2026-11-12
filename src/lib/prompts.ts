import type { Book, ChapterText, ChatMessage, RoleplayPersona } from '@/types'
import { getLanguage } from '@/i18n'

const MAX_CONTEXT = 52_000

export interface TutorOptions {
  book?: Book
  chapter?: ChapterText
  socratic?: boolean
  persona?: RoleplayPersona | null
  extra?: string
}

export function retrieveContext(chapter: ChapterText | undefined, query = '', maxChars = MAX_CONTEXT) {
  if (!chapter || !chapter.text.trim()) {
    return 'NO TEXTBOOK IS LOADED. Tell the student to pick a book from the Library. You may still help with general first-preparatory questions, but clearly say the answer is not grounded in their book.'
  }
  if (chapter.text.length <= maxChars) {
    return `[SOURCE: ${chapter.bookId}]\n${chapter.text}`
  }

  const queryTokens = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 2)
    .slice(0, 30)

  const chunks: { text: string; score: number; page: number; order: number }[] = []
  let order = 0
  for (const page of chapter.pages) {
    const paragraphs = page.text.split(/\n{2,}/).filter((p) => p.trim())
    let buf = ''
    for (const para of paragraphs) {
      if ((buf + para).length > 1600 && buf) {
        chunks.push({ text: buf, score: 0, page: page.page, order: order++ })
        buf = ''
      }
      buf += (buf ? '\n\n' : '') + para
    }
    if (buf) chunks.push({ text: buf, score: 0, page: page.page, order: order++ })
  }

  for (const chunk of chunks) {
    const lower = chunk.text.toLowerCase()
    let score = 0
    for (const token of queryTokens) {
      if (lower.includes(token)) score += 3
    }
    // Always favour the opening pages a little.
    if (chunk.page <= 2) score += 1
    chunk.score = score
  }

  const ranked = [...chunks].sort((a, b) => b.score - a.score)
  const picked = new Map<number, (typeof chunks)[number]>()
  let used = 0
  for (const chunk of ranked) {
    if (used + chunk.text.length > maxChars) continue
    picked.set(chunk.order, chunk)
    used += chunk.text.length
    if (used > maxChars * 0.92) break
  }

  return (
    `[SOURCE: ${chapter.bookId} — selected excerpts from ${chapter.pages.length} pages]\n\n` +
    [...picked.values()]
      .sort((a, b) => a.order - b.order)
      .map((c) => `--- Page ${c.page} ---\n${c.text}`)
      .join('\n\n')
  )
}

export function tutorSystem(opts: TutorOptions) {
  const { book, socratic, persona } = opts
  const profile = studentProfile(book)
  const languageLine = book
    ? `The current textbook is "${book.title}" (${book.subject}, ${book.language.toUpperCase()}, ${profile.label}).`
    : 'No textbook is loaded right now.'

  return `You are JESSICA, a warm and encouraging AI tutor for a ${profile.age}-year-old Egyptian student in ${profile.label} at a language school.

${languageLine}

CORE RULES
1. GROUNDING: Base academic answers primarily on the TEXTBOOK CONTEXT provided by the user. Quote or point to it when useful. If the context is missing the answer, say so briefly, then give a clearly-labelled general explanation. Never invent page numbers, exercises or quotes.
2. LANGUAGE: ${languageRule('tutor')}
   CITATIONS: The textbook context marks every page as [Page N]. When a statement comes from the book, add the page reference at the end in the learner's language, e.g. (ص 12) or (p. 12). Never invent a page that is not in the context.
3. LEVEL: ${profile.style}
4. FORMAT: Markdown. Use short headings, bullets and bold for key terms. Max ~220 words unless the student asks for depth. End with one small check-for-understanding question when appropriate.
5. MATH: Always use LaTeX delimiters. Inline: $x^2 + 3x$. Display: $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$. Never write raw asterisks for multiplication in math.
6. SAFETY: Age-appropriate only. No external links, no requests for personal data, no medical/legal advice. If the student seems frustrated, validate the feeling and shrink the problem.
7. ACCURACY: If unsure, say "I'm not fully sure — let's check the book together." Never bluff.

${socratic ? 'SOCRATIC MODE IS ON: Refuse to state the final answer. Ask one guiding question at a time, give tiny hints, and celebrate each step. Only confirm the answer after the student produces it themselves.' : 'In normal mode, explain clearly and show worked steps.'}

${persona ? `ROLEPLAY MODE — stay in character: ${persona.prompt} Keep the teaching accurate; never let the roleplay replace real explanations.` : ''}

${opts.extra || ''}`
}

export function buildChatParts(message: string, chapter: ChapterText | undefined, selection?: string) {
  const context = retrieveContext(chapter, message)
  const selectionLine = selection
    ? `\n\nThe student highlighted this exact passage in the PDF:\n"""${selection.slice(0, 3000)}"""\nExplain it directly and clearly.`
    : ''
  return `TEXTBOOK CONTEXT (local PDF extract):
${context}
${selectionLine}

STUDENT MESSAGE:
${message}`
}

export function historyToContents(history: ChatMessage[]) {
  return history
    .filter((m) => m.role === 'user' || m.role === 'model')
    .slice(-14)
    .map((m) => ({ role: m.role, parts: [{ text: m.content.slice(0, 8000) }] }))
}


/**
 * The learner's chosen UI language. Prompts are built when a request is made, so
 * this reflects the live setting instead of the language at module load.
 */
export function unitSummaryPrompt(book: Book | undefined, chapter: ChapterText | undefined) {
  return `Write a compact revision summary of ONE textbook unit for a 13-year-old Egyptian preparatory student.
Use Markdown with these sections in the learner's language:
## Big idea
## Five key ideas
## Formulas & rules (use LaTeX when needed)
## Vocabulary table (term | meaning)
## Common mistakes
## Three quick exam questions (with answers hidden under a short line)

Rules:
- Maximum 380 words.
- Ground everything in the unit text below and cite pages as [Page N] exactly as they appear in the context.
- Do not invent facts that are not in the context.
- ${languageRule('content')}

UNIT TEXT:
${retrieveContext(chapter, book?.subject || 'summary', 30_000)}`
}


/**
 * Age- and stage-aware student profile. Primary 4 gets a gentler, more
 * concrete teaching style than the preparatory grades.
 */
export function profileForGrade(grade?: number) {
  if (grade && grade <= 6) {
    const age = grade + 5
    return {
      age,
      label: `Primary ${grade}`,
      style: `This is a ${age}-year-old primary student, not a teenager. Use very short sentences, concrete examples from home, toys, games, food and school life, one idea per paragraph, and explain any new word. Avoid abstract grammar jargon. Keep answers under 120 words unless the child asks for more. Be warm and encouraging.`,
    }
  }
  const label =
    grade === 8 ? 'Second Preparatory' : grade === 9 ? 'Third Preparatory' : 'First Preparatory'
  return {
    age: 13,
    label,
    style:
      'This is a 13-year-old, not a university student. Short sentences, relatable examples (football, gaming, food, phones, school life), no condescension. Max about 220 words unless the student asks for depth.',
  }
}

export function studentProfile(book?: Book) {
  return profileForGrade(book?.grade)
}

export function languageRule(kind: 'tutor' | 'content' = 'content') {
  const lang = getLanguage()
  if (lang === 'ar') {
    return kind === 'tutor'
      ? 'The app language is ARABIC. Reply in clear Modern Standard Arabic with a warm Egyptian tone. Keep subject terminology, quotes and textbook exercises in their original language with a short Arabic gloss. Keep math and formulas unchanged.'
      : 'The app language is ARABIC. Write every learner-facing title, explanation, label and sentence in Modern Standard Arabic with a friendly Egyptian tone. Keep textbook terms and quoted source text in their original language with a short Arabic gloss. JSON keys and value formats stay exactly as specified.'
  }
  const names: Record<string, string> = {
    fr: 'FRENCH',
    es: 'SPANISH',
    de: 'GERMAN',
    tr: 'TURKISH',
    id: 'INDONESIAN',
    ur: 'URDU',
  }
  const name = names[lang]
  if (name) {
    return kind === 'tutor'
      ? `The app language is ${name}. Reply in clear ${name} with a friendly tone. Keep subject terminology, quotes and textbook exercises in their original language with a short ${name} gloss. Keep math and formulas unchanged.`
      : `The app language is ${name}. Write every learner-facing title, explanation, label and sentence in clear ${name}. Keep textbook terms and quoted source text in their original language with a short ${name} gloss. JSON keys and value formats stay exactly as specified.`
  }
  return 'The app language is ENGLISH. Write every learner-facing title, explanation, label and sentence in clear English. Keep textbook terms in their original language.'
}

/* ------------------------------ Tool prompts ------------------------------ */

export function quizPrompt(book: Book | undefined, chapter: ChapterText | undefined, count = 5) {
  return `Create a ${count}-question multiple-choice quiz for this student based on the textbook context below.
Difficulty: ${studentProfile(book).label} (age ${studentProfile(book).age}). Mix recall, understanding and one application question. ${(book?.grade ?? 99) <= 6 ? 'Use very simple wording and concrete examples.' : ''}
Use the textbook's language for questions (${book?.language || 'en'}), and add a short Arabic hint inside the explanation when useful.

Return ONLY valid JSON matching:
{"questions":[{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"...","topic":"..."}]}
- Exactly 4 options per question.
- "answer" is the zero-based index of the correct option.
- "topic" is a 1-3 word curriculum concept (e.g. "present simple", "photosynthesis").
- Explanations max 35 words.
- No markdown fences, no commentary outside JSON.

TEXTBOOK CONTEXT:
${retrieveContext(chapter, book?.subject || 'quiz', 40_000)}

${languageRule()}`
}

export function flashcardsPrompt(book: Book | undefined, chapter: ChapterText | undefined, count = 8) {
  return `Create ${count} high-retention flashcards for a ${studentProfile(book).age}-year-old student from this textbook excerpt.
Front: a clear question or a term. Back: a concise answer (max 30 words) with one memory hook.
Cover the most exam-relevant vocabulary, rules and concepts. Use ${book?.language || 'English'} with Arabic support where useful.

Return ONLY JSON:
{"cards":[{"front":"...","back":"..."}]}

TEXTBOOK CONTEXT:
${retrieveContext(chapter, book?.subject || 'flashcards', 40_000)}

${languageRule()}`
}

export function cheatSheetPrompt(book: Book | undefined, chapter: ChapterText | undefined) {
  return `Summarise this chapter into a beautiful one-page exam cheat sheet in Markdown.

Structure:
# [Chapter title]
> One-sentence big idea
## Key Concepts (5-7 bullets, bold the term)
## Formulas & Rules (use LaTeX for math)
## Vocabulary (a compact table: term | meaning | Arabic)
## Common Mistakes (3 bullets)
## 60-Second Recap (3 bullets)

Keep the whole thing under 550 words. Be precise and exam-focused. Use ${book?.language || 'English'} with Arabic glosses for key terms.

TEXTBOOK CONTEXT:
${retrieveContext(chapter, book?.subject || 'summary', 45_000)}

${languageRule()}`
}

export function plannerPrompt(book: Book | undefined, chapter: ChapterText | undefined, days = 5) {
  return `Build a realistic ${days}-day study plan for a ${studentProfile(book).age}-year-old ${studentProfile(book).label} student using the chapter below.
Each day should take 25-45 minutes total. Include active recall, practice and one rest/light day.
Today is ${new Date().toDateString()}.

Return ONLY JSON:
{"tasks":[{"day":"YYYY-MM-DD","title":"...","detail":"...","minutes":30,"subject":"${book?.subject || 'Study'}"}]}
4 tasks per day maximum. Titles max 8 words. Detail max 25 words. No markdown.

TEXTBOOK CONTEXT:
${retrieveContext(chapter, book?.subject || 'plan', 28_000)}

${languageRule()}`
}

export function essayPrompt(language: string, prompt?: string, grade?: number) {
  const profile = profileForGrade(grade)
  return `You are an encouraging ${language} writing examiner for a ${profile.age}-year-old Egyptian student (${profile.label}).
Grade the student's paragraph out of 10 using age-appropriate criteria: task completion, grammar, vocabulary, spelling, punctuation and coherence.

Return ONLY JSON:
{
 "score": 0,
 "band": "Excellent | Good | Developing | Needs practice",
 "summary": "2 warm sentences",
 "corrections": [{"original":"...","correction":"...","type":"grammar | spelling | punctuation | vocabulary","explanation":"short Arabic-friendly explanation"}],
 "vocabulary": [{"word":"...","meaning":"...","example":"..."}],
 "rewrite": "A polished A1/A2 version of the student's paragraph, same ideas, not too advanced",
 "encouragement": "One specific next step"
}
Find at least 3 corrections when possible. Never invent errors that are not there. Keep the rewrite close to the student's level.

${prompt ? `TASK THE STUDENT WAS ANSWERING: ${prompt}` : ''}`
}

export function mindmapPrompt(book: Book | undefined, chapter: ChapterText | undefined) {
  return `Turn this chapter into a Mermaid mind map that a ${studentProfile(book).age}-year-old can revise from.

Return ONLY the Mermaid code, no fences, using this exact shape:
mindmap
  root((Chapter Title))
    Branch One
      Detail
      Detail
    Branch Two
      Detail
Use 5-8 first-level branches, max 4 children each, short labels, no special characters that break Mermaid. Include key formulas as plain words (e.g. "Density = mass / volume", not LaTeX). Use ${book?.language || 'English'} and short Arabic glosses only where helpful.

TEXTBOOK CONTEXT:
${retrieveContext(chapter, book?.subject || 'mindmap', 30_000)}

${languageRule()}`
}

export function podcastPrompt(book: Book | undefined, chapter: ChapterText | undefined) {
  return `Write a fun 2-3 minute educational podcast episode that summarises this chapter for a ${studentProfile(book).age}-year-old.
Two speakers:
- Nour: curious student, asks the questions a ${studentProfile(book).age}-year-old would ask.
- Ziad: friendly expert, explains with analogies.
Natural Egyptian-Arabic/English mix is welcome, but keep academic terms in ${book?.language || 'English'} and explain them.
12-18 short lines total. Each line max 40 words. Include a hook, 3 key ideas, one common mistake, and a memorable ending.

Return ONLY JSON:
{"title":"...","lines":[{"speaker":"Nour","text":"..."},{"speaker":"Ziad","text":"..."}]}

TEXTBOOK CONTEXT:
${retrieveContext(chapter, book?.subject || 'podcast', 35_000)}

${languageRule()}`
}

export function comicPrompt(topic: string, chapter?: ChapterText, book?: Book) {
  return `Create a 4-panel educational comic strip about: "${topic}".
It should teach the concept through a tiny story with two characters (Nour, a curious student, and a wise guide who fits the topic).
Each panel: a vivid scene description for an illustrator, one short dialogue line, and an optional caption/narration.

Return ONLY JSON:
{"title":"...","panels":[{"scene":"...","dialogue":"...","caption":"..."}]}
Exactly 4 panels. Keep dialogue under 22 words. Use ${book?.language || 'English'} with a little Arabic if it helps.

SOURCE CONTEXT:
${retrieveContext(chapter, topic, 25_000)}

${languageRule()}`
}

export function examPrompt(book: Book | undefined, chapter: ChapterText | undefined, count = 10) {
  return `Create a formal mock exam for ${studentProfile(book).label} (language schools), following Ministry of Education style.
Subject: ${book?.subject || 'General revision'} — ${book?.title || 'First term'}.
Include ${count} multiple-choice questions: 60% understanding/application, 20% recall, 20% challenging.
Each question has 4 options, one correct answer, a topic label, and a short explanation.
Use ${book?.language || 'English'}. No trick questions outside the syllabus.

Return ONLY JSON:
{"questions":[{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"...","topic":"..."}]}

SYLLABUS CONTEXT:
${retrieveContext(chapter, book?.subject || 'exam', 42_000)}

${languageRule()}`
}

export function questsPrompt(name: string, completed: string[], weak: string[], grade?: number) {
  const primary = (grade ?? 99) <= 6
  return `Generate 4 daily micro-quests for a ${primary ? 'primary-school' : '13-year-old Egyptian'} student named ${name || 'student'}.
Make them specific, achievable in 5-20 minutes, and fun. ${primary ? 'Keep titles and descriptions very simple and concrete for a young child.' : ''} Use a mix of these kinds ONLY:
quiz (complete a quiz), pages (read pages), cards (review flashcards), chat (ask the tutor questions), study (study minutes), riddle (solve the daily riddle), essay (write a paragraph), voice (speak/record practice).
Completed topics: ${completed.slice(-8).join(', ') || 'none yet'}.
Weak areas: ${weak.join(', ') || 'unknown'}.

Return ONLY JSON:
{"quests":[{"title":"...","description":"...","kind":"quiz","target":1,"xp":40}]}
Exactly 4 quests. Titles max 7 words. XP between 20 and 60. Targets between 1 and 15. Do not include emojis.

Today: ${new Date().toDateString()}.

${languageRule()}`
}

export function visionInstruction() {
  return `You are Jessica's Vision Solver. The student photographed a question from an external book (possibly Egyptian Arabic or English).
1. First transcribe the question accurately.
2. Identify the subject and what is being asked.
3. Solve it step by step, showing every stage.
4. Use LaTeX for all math.
5. If the image is unclear, say exactly what is unreadable and ask for a sharper photo — do not guess.
6. End with the final answer in a highlighted line and one exam tip.
Keep the tone warm and encouraging.

${languageRule()}`
}

export function pronunciationInstruction(target: string, language: string) {
  return `You are a ${language} pronunciation coach. The student recorded themselves saying:
"${target}"

Listen carefully to the audio. Evaluate:
- individual sounds that are unclear or influenced by Arabic;
- word stress and rhythm;
- fluency and confidence.
Be kind but specific. Give 2-3 fixes max, each with a mouth/tongue tip and a mini practice drill.

Return ONLY JSON:
{"score":0,"transcript":"what you heard","strengths":["..."],"fixes":[{"sound":"...","tip":"...","practice":"..."}],"encouragement":"..."}
Score out of 100. If the audio is silent or unintelligible, score 0 and say so gently.

${languageRule()}`
}

export function riddleInstruction() {
  return `Create one fun curriculum riddle for an Egyptian First Preparatory student.
Return ONLY JSON: {"subject":"...","question":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."}
The answer index is zero-based. Keep it solvable in under 60 seconds and school-appropriate.

${languageRule()}`
}
