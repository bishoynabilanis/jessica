import type { Book, PlanTask } from '@/types'
import { todayKey } from '@/lib/utils'
import { tr } from '@/i18n'

export interface DailyMission {
  id: string
  emoji: string
  title: string
  hint: string
  to: string
  minutes: number
}

interface PlanInput {
  skillStats: Record<string, { correct: number; total: number; lastAt: number }>
  unitMastery: Record<string, { best: number; total: number; attempts: number }>
  customBooks: Book[]
  bookProgress: Record<string, { lastPage: number; updatedAt: number }>
  completedTopics: string[]
  examDates: Record<string, string>
  mistakes: number
  dueCards: number
  planner: PlanTask[]
}

/** Build a short, personalised 15–20 minute plan from the learner's own data. */
export function buildDailyPlan(input: PlanInput): DailyMission[] {
  const missions: DailyMission[] = []
  const add = (mission: DailyMission) => {
    if (missions.length < 3 && !missions.some((item) => item.id === mission.id)) missions.push(mission)
  }

  const upcoming = Object.entries(input.examDates)
    .map(([subject, date]) => ({
      subject,
      days: Math.ceil((new Date(`${date}T00:00:00`).getTime() - Date.now()) / 86400000),
    }))
    .filter((item) => item.days >= 0 && item.days <= 30)
    .sort((a, b) => a.days - b.days)[0]

  if (upcoming) {
    add({
      id: `exam-${upcoming.subject}`,
      emoji: '📅',
      title: tr('{subject} exam in {n} days', { subject: tr(upcoming.subject), n: upcoming.days }),
      hint: tr('Review the weakest unit for 10 minutes.'),
      to: '/skills',
      minutes: 10,
    })
  }

  const weakestSkill = Object.entries(input.skillStats)
    .map(([key, value]) => ({ key, ...value, accuracy: value.total ? value.correct / value.total : 0 }))
    .filter((item) => item.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy)[0]

  if (weakestSkill) {
    const [subject, topic] = weakestSkill.key.split('|')
    add({
      id: `skill-${weakestSkill.key}`,
      emoji: '🧠',
      title: tr('Practise {topic}', { topic }),
      hint: tr('Your accuracy here is {n}% — a short drill helps.', { n: Math.round(weakestSkill.accuracy * 100) }),
      to: '/skills',
      minutes: 8,
    })
  }

  if (input.dueCards > 0) {
    add({
      id: 'cards',
      emoji: '🃏',
      title: tr('Review {n} due cards', { n: input.dueCards }),
      hint: tr('Two minutes of recall beats re-reading.'),
      to: '/study?tab=review',
      minutes: 5,
    })
  }

  const activeBook = [...input.customBooks]
    .filter((book) => input.bookProgress[book.id]?.updatedAt)
    .sort((a, b) => (input.bookProgress[b.id]?.updatedAt || 0) - (input.bookProgress[a.id]?.updatedAt || 0))[0]
  const fallbackBook = activeBook || input.customBooks[0]
  if (fallbackBook) {
    const nextUnit = (fallbackBook.units || []).find(
      (unit) => !input.completedTopics.includes(`${fallbackBook.id}:${unit.id}`),
    )
    if (nextUnit) {
      add({
        id: `read-${nextUnit.id}`,
        emoji: '📖',
        title: tr('Read {unit}', { unit: nextUnit.title }),
        hint: tr('Pages {from}–{to} from {book}.', {
          from: nextUnit.startPage,
          to: nextUnit.endPage,
          book: fallbackBook.title,
        }),
        to: `/reader/${fallbackBook.id}?page=${nextUnit.startPage}`,
        minutes: 10,
      })
    }
  }

  if (input.mistakes > 0) {
    add({
      id: 'mistakes',
      emoji: '🎯',
      title: tr('Drill {n} saved mistakes', { n: input.mistakes }),
      hint: tr('Turn yesterday’s errors into today’s wins.'),
      to: '/mistakes',
      minutes: 7,
    })
  }

  add({
    id: 'filler-quiz',
    emoji: '🎮',
    title: tr('Quick 5-question quiz'),
    hint: tr('Keep the streak alive with one tiny win.'),
    to: '/games',
    minutes: 5,
  })
  add({
    id: 'filler-cards',
    emoji: '🃏',
    title: tr('Browse your flashcards'),
    hint: tr('Even five cards count.'),
    to: '/study?tab=cards',
    minutes: 5,
  })

  return missions
}
