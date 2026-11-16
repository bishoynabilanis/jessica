import { toBankSubject, type BankQuestion, type BankSubject } from './questionBank'

/**
 * A paper the school sent home: the parent pastes the questions in one compact
 * line each, and the app runs it as a timed exam with marking and a notebook.
 *
 *   ما عاصمة مصر؟ | القاهرة | الإسكندرية | أسوان | طنطا | 1
 *
 * The last field is the number of the correct option (1–4), Arabic digits OK.
 */

export interface SchoolExam {
  id: string
  code: string
  title: string
  subject: BankSubject
  minutes: number
  createdAt: number
  questions: BankQuestion[]
}

const KEY = 'jessica-school-exams-v1'
const LIMIT = 20

const AR = '٠١٢٣٤٥٦٧٨٩'
const toDigits = (value: string) => value.replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)))

export interface ParseResult {
  questions: BankQuestion[]
  errors: string[]
}

export function parseSchoolPaper(raw: string, subject: BankSubject): ParseResult {
  const questions: BankQuestion[] = []
  const errors: string[] = []

  raw
    .split(/\r?\n/)
    .forEach((line, index) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const parts = trimmed.split('|').map((part) => part.trim())
      if (parts.length < 6) {
        errors.push(`${index + 1}`)
        return
      }
      const [prompt, ...rest] = parts
      const answerRaw = rest.pop() || ''
      const options = rest
      const answer = Number(toDigits(answerRaw)) - 1
      if (!prompt || options.length !== 4 || options.some((option) => !option) || answer < 0 || answer > 3) {
        errors.push(`${index + 1}`)
        return
      }
      questions.push({
        id: `school-${index}`,
        subject,
        skill: subject,
        prompt,
        options,
        answer,
        explanation: '',
      })
    })

  return { questions, errors }
}

export function readSchoolExams(): SchoolExam[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((exam) => exam && Array.isArray(exam.questions)).slice(0, LIMIT)
  } catch {
    return []
  }
}

export function saveSchoolExam(input: {
  title: string
  subject: BankSubject
  minutes: number
  questions: BankQuestion[]
}): SchoolExam {
  const createdAt = Date.now()
  const exam: SchoolExam = {
    id: `exam_${createdAt.toString(36)}`,
    code: `SE-${createdAt.toString(36).slice(-5).toUpperCase()}`,
    title: input.title.trim() || input.subject,
    subject: input.subject,
    minutes: input.minutes,
    createdAt,
    questions: input.questions,
  }
  const next = [exam, ...readSchoolExams()].slice(0, LIMIT)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* the exam still runs in memory */
  }
  return exam
}

export function removeSchoolExam(id: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(readSchoolExams().filter((exam) => exam.id !== id)))
  } catch {
    /* ignore */
  }
}

export { toBankSubject }
