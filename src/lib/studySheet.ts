import { effectiveAccuracy } from '@/lib/confidence'
import { isDue } from '@/lib/mistakeReview'

/**
 * "The weekly study sheet": one picture of what the child really did in the
 * last seven days, built only from data already on the device. Nothing is sent
 * anywhere. The picture leaves the phone only if a parent taps share.
 */

export interface SheetInput {
  days: { date: string; label: string; seconds: number; xp: number }[]
  topicLog: { id: string; title: string; subject: string; date: string }[]
  skillStats: Record<string, { correct: number; total: number; guessedRight?: number }>
  mistakes: { createdAt: number; reviewAt?: number; reviewStep?: number }[]
  attempts: { at: number; score: number; total: number }[]
  now?: number
}

export interface StudySheet {
  from: string
  to: string
  days: { date: string; label: string; minutes: number; active: boolean }[]
  minutes: number
  activeDays: number
  topics: { title: string; subject: string }[]
  topicCount: number
  tests: number
  testAverage: number | null
  dueMistakes: number
  focus: { topic: string; subject: string; percent: number }[]
}

export function buildStudySheet(input: SheetInput): StudySheet {
  const now = input.now ?? Date.now()
  const dates = new Set(input.days.map((d) => d.date))
  const days = input.days.map((d) => ({
    date: d.date,
    label: d.label,
    minutes: Math.round(d.seconds / 60),
    active: d.seconds > 0 || d.xp > 0,
  }))
  const topics = input.topicLog.filter((t) => dates.has(t.date))
  const since = now - 7 * 86_400_000
  const tests = input.attempts.filter((a) => a.at >= since && a.total > 0)
  const testAverage = tests.length
    ? Math.round((tests.reduce((sum, a) => sum + a.score / a.total, 0) / tests.length) * 100)
    : null
  const focus = Object.entries(input.skillStats)
    .map(([key, stat]) => {
      const [subject, topic] = key.split('|')
      return { subject, topic, total: stat.total, accuracy: effectiveAccuracy(stat) ?? 1 }
    })
    .filter((item) => item.total >= 3 && item.accuracy < 0.8 && item.topic)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map((item) => ({ topic: item.topic, subject: item.subject, percent: Math.round(item.accuracy * 100) }))
  return {
    from: input.days[0]?.date || '',
    to: input.days[input.days.length - 1]?.date || '',
    days,
    minutes: days.reduce((sum, d) => sum + d.minutes, 0),
    activeDays: days.filter((d) => d.active).length,
    topics: topics.slice(0, 5).map((t) => ({ title: t.title, subject: t.subject })),
    topicCount: topics.length,
    tests: tests.length,
    testAverage,
    dueMistakes: input.mistakes.filter((m) => isDue(m, now)).length,
    focus,
  }
}

export interface SheetLabels {
  title: string
  range: string
  name?: string
  grade: string
  minutes: string
  activeDays: string
  topicsDone: string
  studied: string
  nothingYet: string
  tests: string
  revisit: string
  revisitDue: string
  noRevisit: string
  privacy: string
  rtl: boolean
}

const W = 1080
const H = 1700

function fit(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text
  let out = text
  while (out.length > 1 && ctx.measureText(`${out}…`).width > max) out = out.slice(0, -1)
  return `${out}…`
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const lines: string[] = []
  let current = ''
  for (const word of text.split(' ')) {
    const next = current ? `${current} ${word}` : word
    if (ctx.measureText(next).width > max && current) {
      lines.push(current)
      current = word
    } else current = next
  }
  if (current) lines.push(current)
  return lines
}

/** Draws the sheet. Light paper colours so it also prints well. */
export function drawStudySheet(sheet: StudySheet, labels: SheetLabels): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const font = (weight: number, size: number) => `${weight} ${size}px Cairo, system-ui, sans-serif`
  const rtl = labels.rtl
  ctx.direction = rtl ? 'rtl' : 'ltr'
  const edge = rtl ? W - 70 : 70
  const align: CanvasTextAlign = rtl ? 'right' : 'left'

  ctx.fillStyle = '#fbf8f1'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#12b8a0'
  ctx.fillRect(0, 0, W, 18)

  ctx.textAlign = align
  ctx.fillStyle = '#12304a'
  ctx.font = font(800, 70)
  ctx.fillText(labels.title, edge, 130)
  ctx.fillStyle = '#5b6b7e'
  ctx.font = font(600, 32)
  ctx.fillText([labels.name, labels.grade].filter(Boolean).join(' · '), edge, 185)
  ctx.fillText(labels.range, edge, 230)

  // seven days
  const baseY = 520
  const colW = (W - 140) / 7
  const maxMin = Math.max(30, ...sheet.days.map((d) => d.minutes))
  sheet.days.forEach((day, i) => {
    const col = rtl ? 6 - i : i
    const cx = 70 + col * colW + colW / 2
    const barH = Math.max(day.active ? 12 : 6, (day.minutes / maxMin) * 190)
    ctx.fillStyle = day.active ? '#12b8a0' : '#e3dfd3'
    ctx.beginPath()
    ctx.roundRect(cx - 28, baseY - barH, 56, barH, 14)
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.fillStyle = '#12304a'
    ctx.font = font(700, 28)
    ctx.fillText(day.label, cx, baseY + 44)
    ctx.fillStyle = '#5b6b7e'
    ctx.font = font(600, 24)
    ctx.fillText(day.minutes ? String(day.minutes) : '–', cx, baseY - barH - 12)
  })

  // three numbers
  const stats = [
    { value: String(sheet.minutes), label: labels.minutes },
    { value: `${sheet.activeDays}/7`, label: labels.activeDays },
    { value: String(sheet.topicCount), label: labels.topicsDone },
  ]
  const bw = (W - 140 - 40) / 3
  stats.forEach((stat, i) => {
    const x = 70 + (rtl ? 2 - i : i) * (bw + 20)
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#e3dfd3'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(x, 610, bw, 170, 28)
    ctx.fill()
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.fillStyle = '#0e8f7c'
    ctx.font = font(800, 62)
    ctx.fillText(stat.value, x + bw / 2, 690)
    ctx.fillStyle = '#5b6b7e'
    ctx.font = font(600, 26)
    ctx.fillText(fit(ctx, stat.label, bw - 24), x + bw / 2, 740)
  })

  const section = (title: string, y: number) => {
    ctx.textAlign = align
    ctx.fillStyle = '#12304a'
    ctx.font = font(800, 40)
    ctx.fillText(title, edge, y)
  }
  const bullet = (text: string, y: number, color = '#12304a') => {
    ctx.textAlign = align
    ctx.fillStyle = '#12b8a0'
    ctx.beginPath()
    ctx.arc(rtl ? W - 78 : 78, y - 11, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = color
    ctx.font = font(600, 32)
    const x = rtl ? W - 105 : 105
    ctx.fillText(fit(ctx, text, W - 190), x, y)
  }

  section(labels.studied, 850)
  if (sheet.topics.length) sheet.topics.forEach((t, i) => bullet(`${t.title} · ${t.subject}`, 910 + i * 56))
  else bullet(labels.nothingYet, 910, '#5b6b7e')

  let y = 1220
  if (sheet.tests) {
    ctx.textAlign = align
    ctx.fillStyle = '#12304a'
    ctx.font = font(700, 32)
    ctx.fillText(labels.tests, edge, y)
    y += 70
  }

  section(labels.revisit, y + 10)
  y += 70
  const items: string[] = []
  if (sheet.dueMistakes) items.push(labels.revisitDue)
  sheet.focus.forEach((f) => items.push(`${f.topic} · ${f.subject} · ${f.percent}%`))
  if (items.length) items.slice(0, 4).forEach((text, i) => bullet(text, y + 20 + i * 56))
  else bullet(labels.noRevisit, y + 20, '#5b6b7e')

  ctx.textAlign = 'center'
  ctx.direction = rtl ? 'rtl' : 'ltr'
  ctx.fillStyle = '#5b6b7e'
  ctx.font = font(600, 25)
  wrap(ctx, labels.privacy, W - 140).slice(0, 2).forEach((line, i) => ctx.fillText(line, W / 2, H - 112 + i * 36))
  ctx.fillStyle = '#12b8a0'
  ctx.font = font(700, 26)
  ctx.fillText('jessica · bishoynabilanis.github.io/jessica', W / 2, H - 28)
  return canvas
}

export async function canvasToFile(canvas: HTMLCanvasElement, filename = 'jessica-weekly-study-sheet.png') {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  return blob ? new File([blob], filename, { type: 'image/png' }) : null
}

/** Opens the phone's share sheet with the image (WhatsApp is one of the choices), or saves it. */
export async function shareSheetFile(file: File, title: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const nav = navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean
    share?: (data: { files?: File[]; title?: string }) => Promise<void>
  }
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], title })
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }
  return saveSheetFile(file)
}

export function saveSheetFile(file: File): 'downloaded' {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
  return 'downloaded'
}
