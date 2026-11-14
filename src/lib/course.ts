import type { Book, BookUnit } from '@/types'

/** One unit of a book, seen as a lesson in a course. */
export type LessonState = 'mastered' | 'started' | 'new'

export interface CourseLesson {
  unit: BookUnit
  index: number
  state: LessonState
  /** Saved step of the guided lesson (0 = goals). */
  step: number
  /** Best unit-quiz score, 0–100. */
  best: number
  minutes: number
}

export interface Course {
  book: Book
  lessons: CourseLesson[]
  mastered: number
  total: number
  percent: number
  minutes: number
  next: CourseLesson | undefined
}

interface ProgressInput {
  unitMastery: Record<string, { best: number; total: number; attempts: number }>
  completedTopics: string[]
  lessonProgress: Record<string, { step: number; done: boolean; updatedAt: number }>
}

/** Turn a book and the learner's history into a course with a clear next step. */
export function buildCourse(book: Book, input: ProgressInput): Course {
  const lessons = (book.units || []).map((unit, index) => {
    const key = `${book.id}:${unit.id}`
    const stat = input.unitMastery[key]
    const saved = input.lessonProgress[key]
    const best = stat && stat.total ? Math.round((stat.best / stat.total) * 100) : 0
    const mastered = input.completedTopics.includes(key) || best >= 80 || saved?.done === true
    const state: LessonState = mastered ? 'mastered' : saved || stat ? 'started' : 'new'
    const pages = Math.max(1, unit.endPage - unit.startPage + 1)
    return {
      unit,
      index,
      state,
      step: saved?.step ?? 0,
      best,
      minutes: Math.max(3, Math.round(pages * 1.5) + 1),
    }
  })

  const mastered = lessons.filter((lesson) => lesson.state === 'mastered').length
  const total = lessons.length

  return {
    book,
    lessons,
    mastered,
    total,
    percent: total ? Math.round((mastered / total) * 100) : 0,
    minutes: lessons.reduce((sum, lesson) => sum + lesson.minutes, 0),
    next: lessons.find((lesson) => lesson.state !== 'mastered'),
  }
}

export function lessonLink(bookId: string, lesson: CourseLesson) {
  return `/lesson/${bookId}/${lesson.unit.id}`
}
