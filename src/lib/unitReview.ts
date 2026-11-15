import type { Book, BookUnit, GradeLevel } from '@/types'
import { chapterCacheGet, getQuizzes } from '@/lib/db'
import { clozeQuiz, keyTerms } from '@/lib/lesson'
import { buildDrill, type BankQuestion, type BankSubject } from '@/lib/questionBank'

/**
 * A review paper for ONE unit. The order matters: questions the app already
 * generated for that unit come first, then questions written from the unit's
 * own pages, and only then the subject bank fills the rest.
 */

const SUBJECTS: Array<[RegExp, BankSubject]> = [
  [/math|رياض/i, 'Mathematics'],
  [/science|علوم/i, 'Science'],
  [/english|إنجليز|انجليز/i, 'English'],
  [/arabic|عربي|عربى/i, 'Arabic'],
]

export function toBankSubject(subject: string | undefined): BankSubject {
  if (!subject) return 'Mathematics'
  for (const [pattern, name] of SUBJECTS) if (pattern.test(subject)) return name
  return 'Mathematics'
}

export interface UnitReview {
  questions: BankQuestion[]
  /** How many came from the unit itself, before the bank filled the paper. */
  fromUnit: number
}

export async function buildUnitReview(
  book: Book,
  unit: BookUnit,
  grade: GradeLevel,
  count = 20,
): Promise<UnitReview> {
  const subject = toBankSubject(book.subject)
  const questions: BankQuestion[] = []
  const seen = new Set<string>()

  const add = (question: BankQuestion) => {
    const prompt = question.prompt.trim()
    if (!prompt || seen.has(prompt) || questions.length >= count) return
    seen.add(prompt)
    questions.push({ ...question, id: `${question.id}-${questions.length}` })
  }

  // 1) a quiz the app already saved for this unit
  try {
    const quizzes = await getQuizzes()
    const stored = quizzes.find((quiz) => quiz.id === `${book.id}:${unit.id}`)
    for (const question of stored?.questions || []) {
      if (!question.options || question.options.length < 2) continue
      if (question.answer < 0 || question.answer >= question.options.length) continue
      add({
        id: 'unit',
        subject,
        skill: unit.title,
        prompt: question.question,
        options: question.options,
        answer: question.answer,
        explanation: question.explanation || '',
      })
    }
  } catch {
    /* no saved quiz, the unit text covers it */
  }

  // 2) the unit's own pages: terms and the sentences they came from
  if (questions.length < count) {
    try {
      const chapter = await chapterCacheGet(book.id)
      const pages = (chapter?.pages || []).filter(
        (page) => page.page >= unit.startPage && page.page <= unit.endPage,
      )
      if (pages.length) {
        const terms = keyTerms(pages, 16)
        for (const question of clozeQuiz(terms, Math.max(4, count - questions.length))) {
          add({
            id: 'cloze',
            subject,
            skill: unit.title,
            prompt: question.prompt,
            options: question.options,
            answer: question.answer,
            explanation: question.sentence,
          })
        }
      }
    } catch {
      /* no cached text yet */
    }
  }

  const fromUnit = questions.length

  // 3) the subject bank fills whatever is left
  if (questions.length < count) {
    for (const question of buildDrill(subject, grade, count - questions.length)) add(question)
  }

  return { questions: questions.slice(0, count), fromUnit }
}
