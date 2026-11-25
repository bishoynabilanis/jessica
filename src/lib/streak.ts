/**
 * Rest days keep the streak. Friday is always free. On top of that, one more
 * missed day per week is forgiven automatically. A longer gap starts again at
 * day 1, quietly. Days are the device's own calendar days, so "Friday" follows
 * the phone's time zone. Everything stays on this device.
 */

export interface StreakStep {
  streak: number
  /** week of the last forgiven non-Friday day, kept so a week only forgives one */
  restWeek: string
  rest: 'none' | 'friday' | 'weekly'
}

const parts = (key: string) => key.split('-').map(Number) as [number, number, number]
const dayNumber = (key: string) => {
  const [y, m, d] = parts(key)
  return Math.round(Date.UTC(y, m - 1, d) / 86400000)
}
const fromNumber = (n: number) => new Date(n * 86400000).toISOString().slice(0, 10)
const weekday = (key: string) => new Date(dayNumber(key) * 86400000).getUTCDay()
/** Monday of the week, as a day key. */
const weekOf = (key: string) => fromNumber(dayNumber(key) - ((weekday(key) + 6) % 7))

const MAX_GAP = 14

export function nextStreak(streak: number, lastLogin: string, today: string, restWeek: string): StreakStep {
  const fresh: StreakStep = { streak: 1, restWeek, rest: 'none' }
  if (!lastLogin || !/^\d{4}-\d{2}-\d{2}$/.test(lastLogin) || lastLogin === today) return { ...fresh, streak: Math.max(1, streak) }
  const gap = dayNumber(today) - dayNumber(lastLogin)
  if (gap < 1) return { ...fresh, streak: Math.max(1, streak) }
  if (gap === 1) return { streak: Math.max(1, streak) + 1, restWeek, rest: 'none' }
  if (gap > MAX_GAP) return fresh

  let week = restWeek
  let usedWeekly = false
  let usedFriday = false
  for (let n = dayNumber(lastLogin) + 1; n < dayNumber(today); n++) {
    const key = fromNumber(n)
    if (weekday(key) === 5) {
      usedFriday = true
      continue
    }
    const wk = weekOf(key)
    if (week === wk) return fresh
    week = wk
    usedWeekly = true
  }
  return { streak: Math.max(1, streak) + 1, restWeek: week, rest: usedWeekly ? 'weekly' : usedFriday ? 'friday' : 'none' }
}
