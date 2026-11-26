// The "My day" summary for the Kids world. Pure functions: everything comes
// from what is already stored on the device, nothing is sent anywhere.

export interface DayUnit {
  id: string
  title: string
}
export interface DayBook {
  id: string
  title: string
  grade?: number
  units?: DayUnit[]
}
export interface DayInput {
  today: string
  /** Seconds spent in the Kids world per day (local date key). */
  kidsUsage: Record<string, number>
  lessonProgress: Record<string, { step: number; done: boolean; updatedAt: number }>
  topicLog: { id: string; title: string; date: string }[]
  books: DayBook[]
  gradeLevel: number
  starsToday: number
}
export type NextStep =
  | { kind: 'lesson'; bookId: string; unitId: string; title: string; started: boolean }
  | { kind: 'finished'; bookTitle: string }
  | { kind: 'none' }
export interface DaySummary {
  minutes: number
  learned: string[]
  next: NextStep
  starsToday: number
  active: boolean
}

function localKey(ms: number) {
  const d = new Date(ms)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function summarizeDay(input: DayInput): DaySummary {
  const { today, books } = input
  const minutes = Math.round((input.kidsUsage[today] || 0) / 60)

  const learned: string[] = []
  const add = (title: string) => {
    const clean = title.trim()
    if (clean && !learned.includes(clean)) learned.push(clean)
  }
  const entries = Object.entries(input.lessonProgress)
    .map(([key, value]) => {
      const cut = key.indexOf(':')
      const bookId = cut < 0 ? key : key.slice(0, cut)
      const unitId = cut < 0 ? '' : key.slice(cut + 1)
      const book = books.find((b) => b.id === bookId)
      const unit = book?.units?.find((u) => u.id === unitId) || (unitId === 'all' ? book?.units?.[0] : undefined)
      return { key, value, book, unit }
    })
    .filter((e) => e.book && e.unit)
    .sort((a, b) => b.value.updatedAt - a.value.updatedAt)

  for (const e of entries) {
    if (e.value.done && localKey(e.value.updatedAt) === today) add(e.unit!.title)
  }
  for (const t of input.topicLog) if (t.date === today) add(t.title)

  let next: NextStep = { kind: 'none' }
  const last = entries[0]
  if (last && last.book && last.unit) {
    const units = last.book.units || []
    if (!last.value.done) {
      next = { kind: 'lesson', bookId: last.book.id, unitId: last.unit.id, title: last.unit.title, started: true }
    } else {
      const index = units.findIndex((u) => u.id === last.unit!.id)
      const following = index >= 0 ? units[index + 1] : undefined
      next = following
        ? { kind: 'lesson', bookId: last.book.id, unitId: following.id, title: following.title, started: false }
        : { kind: 'finished', bookTitle: last.book.title }
    }
  } else {
    const first = books.find((b) => b.grade === input.gradeLevel && (b.units?.length || 0) > 0)
    if (first && first.units) next = { kind: 'lesson', bookId: first.id, unitId: first.units[0].id, title: first.units[0].title, started: false }
  }

  return { minutes, learned: learned.slice(0, 4), next, starsToday: input.starsToday, active: minutes > 0 || learned.length > 0 }
}
