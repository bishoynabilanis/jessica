import { dayKeyOffset } from './utils'
import { daysUntilDue, isDue, isMastered } from './mistakeReview'

/**
 * The month, not the week.
 *
 * A weekly snapshot flatters a bad week and hides a good one; parents ask for
 * "how is he doing?" once a month. Everything here is derived from data already
 * on the device — no new tracking, no server.
 */

export interface MonthSkill {
  key: string
  subject: string
  topic: string
  correct: number
  total: number
  accuracy: number
}

export interface MonthWeek {
  start: string
  end: string
  minutes: number
  xp: number
  activeDays: number
}

export interface MonthSubject {
  subject: string
  topics: number
}

export interface MonthExam {
  subject: string
  date: number
  score: number
  total: number
}

export interface MonthAttempt {
  subject: string
  mode: string
  score: number
  total: number
  at: number
}

export interface MonthMistakes {
  total: number
  due: number
  mastered: number
  later: number
  nextDays: number | null
}

export interface MonthlyInput {
  dailyLog: Record<string, { xp: number; seconds: number }>
  topicLog: Array<{ date: string; subject: string }>
  skillStats: Record<string, { correct: number; total: number }>
  mistakes: Array<{ subject: string; topic?: string; reviewAt?: number; reviewStep?: number; createdAt: number }>
  exams: Array<{ subject: string; date: number; score: number; total: number }>
  attempts: Array<{ subject: string; mode: string; score: number; total: number; at: number }>
  unitMastery: Record<string, { best: number; total: number; attempts: number }>
  now?: number
}

export interface MonthReport {
  from: string
  to: string
  days: number
  minutes: number
  xp: number
  activeDays: number
  weeks: MonthWeek[]
  subjects: MonthSubject[]
  weakest: MonthSkill[]
  strongest: MonthSkill[]
  exams: MonthExam[]
  attempts: MonthAttempt[]
  mistakes: MonthMistakes
  unitsMastered: number
  /** Percentage change of minutes: last 14 days against the 14 before. */
  trend: number
}

const DAYS = 28

const dateOf = (key: string) => new Date(`${key}T00:00:00`).getTime()

export function monthTotals(dailyLog: Record<string, { xp?: number; seconds?: number }>) {
  let minutes = 0
  let xp = 0
  let activeDays = 0
  for (let offset = -(DAYS - 1); offset <= 0; offset += 1) {
    const entry = dailyLog[dayKeyOffset(offset)]
    if (!entry) continue
    const dayXp = entry.xp || 0
    const daySeconds = entry.seconds || 0
    minutes += Math.round(daySeconds / 60)
    xp += dayXp
    if (dayXp > 0 || daySeconds > 0) activeDays += 1
  }
  return { minutes, xp, activeDays }
}

export function buildMonthlyReport(input: MonthlyInput): MonthReport {
  const now = input.now ?? Date.now()
  const from = dayKeyOffset(-(DAYS - 1))
  const to = dayKeyOffset(0)
  const inRange = (key: string) => key >= from && key <= to
  const fromMs = dateOf(from)

  const weeks: MonthWeek[] = []
  for (let week = 0; week < 4; week += 1) {
    const startOffset = -(DAYS - 1) + week * 7
    const start = dayKeyOffset(startOffset)
    const end = dayKeyOffset(startOffset + 6)
    let minutes = 0
    let xp = 0
    let activeDays = 0
    for (let day = 0; day < 7; day += 1) {
      const entry = input.dailyLog[dayKeyOffset(startOffset + day)]
      if (!entry) continue
      minutes += Math.round((entry.seconds || 0) / 60)
      xp += entry.xp || 0
      if ((entry.xp || 0) > 0 || (entry.seconds || 0) > 0) activeDays += 1
    }
    weeks.push({ start, end, minutes, xp, activeDays })
  }

  const totals = monthTotals(input.dailyLog)
  const firstHalf = weeks[0].minutes + weeks[1].minutes
  const secondHalf = weeks[2].minutes + weeks[3].minutes
  const trend = firstHalf === 0 ? (secondHalf > 0 ? 100 : 0) : Math.round(((secondHalf - firstHalf) / firstHalf) * 100)

  const subjectMap = new Map<string, number>()
  for (const topic of input.topicLog) {
    if (!inRange(topic.date)) continue
    subjectMap.set(topic.subject, (subjectMap.get(topic.subject) || 0) + 1)
  }
  const subjects = [...subjectMap.entries()]
    .map(([subject, topics]) => ({ subject, topics }))
    .sort((a, b) => b.topics - a.topics)
    .slice(0, 6)

  const skills: MonthSkill[] = Object.entries(input.skillStats)
    .filter(([, value]) => value.total >= 5)
    .map(([key, value]) => {
      const [subject, ...rest] = key.split('|')
      return {
        key,
        subject,
        topic: rest.join('|') || subject,
        correct: value.correct,
        total: value.total,
        accuracy: value.total ? value.correct / value.total : 0,
      }
    })
  const weakest = skills
    .filter((skill) => skill.accuracy < 0.8)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 6)
  const strongest = [...skills]
    .filter((skill) => skill.accuracy >= 0.8)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3)

  const exams = input.exams
    .filter((exam) => exam.date >= fromMs)
    .sort((a, b) => b.date - a.date)
    .slice(0, 8)

  const attempts = input.attempts
    .filter((attempt) => attempt.at >= fromMs)
    .sort((a, b) => b.at - a.at)
    .slice(0, 10)

  const due = input.mistakes.filter((item) => isDue(item, now)).length
  const mastered = input.mistakes.filter(isMastered).length
  const later = input.mistakes.length - due - mastered
  const upcoming = input.mistakes
    .filter((item) => !isDue(item, now) && !isMastered(item))
    .map((item) => daysUntilDue(item, now))
    .sort((a, b) => a - b)
  const mistakes: MonthMistakes = {
    total: input.mistakes.length,
    due,
    mastered,
    later,
    nextDays: upcoming.length ? upcoming[0] : null,
  }

  const unitsMastered = Object.values(input.unitMastery).filter(
    (unit) => unit.attempts > 0 && unit.total > 0 && unit.best / unit.total >= 0.85,
  ).length

  return {
    from,
    to,
    days: DAYS,
    minutes: totals.minutes,
    xp: totals.xp,
    activeDays: totals.activeDays,
    weeks,
    subjects,
    weakest,
    strongest,
    exams,
    attempts,
    mistakes,
    unitsMastered,
    trend,
  }
}
