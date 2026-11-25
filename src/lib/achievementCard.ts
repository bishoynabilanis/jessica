import { levelInfo } from '@/store/useApp'

/**
 * A small "I did it" card the student can send to a parent. Nothing is stored:
 * the list of wins is worked out from progress the app already keeps on this
 * device, and the card is drawn on the device when the student asks for it.
 */
export type AchievementKind = 'streak' | 'topics' | 'level' | 'minutes'

export interface Achievement {
  kind: AchievementKind
  value: number
}

export interface AchievementInput {
  streak: number
  completedTopics: number
  xp: number
  weekSeconds: number
}

export function earnedAchievements(input: AchievementInput): Achievement[] {
  const list: Achievement[] = []
  if (input.streak >= 3) list.push({ kind: 'streak', value: input.streak })
  if (input.completedTopics >= 1) list.push({ kind: 'topics', value: input.completedTopics })
  const level = levelInfo(input.xp).level
  if (level >= 2) list.push({ kind: 'level', value: level })
  const minutes = Math.floor(input.weekSeconds / 60)
  if (minutes >= 30) list.push({ kind: 'minutes', value: minutes })
  return list
}

export interface AchievementLabels {
  headline: string
  big: string
  caption: string
  name?: string
  grade: string
  privacy: string
  rtl: boolean
}

const W = 1080
const H = 1080

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

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, outer: number, inner: number) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

export function drawAchievementCard(labels: AchievementLabels): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const font = (weight: number, size: number) => `${weight} ${size}px Cairo, system-ui, sans-serif`
  ctx.direction = labels.rtl ? 'rtl' : 'ltr'
  ctx.textAlign = 'center'

  ctx.fillStyle = '#fbf8f1'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#12b8a0'
  ctx.fillRect(0, 0, W, 26)

  // Badge: a gold star on a teal disc.
  ctx.fillStyle = '#e6f7f3'
  ctx.beginPath()
  ctx.arc(W / 2, 270, 170, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f5b83d'
  star(ctx, W / 2, 275, 125, 55)
  ctx.fill()
  ctx.lineWidth = 8
  ctx.strokeStyle = '#d99a1f'
  ctx.stroke()

  ctx.fillStyle = '#12304a'
  ctx.font = font(800, 62)
  wrap(ctx, labels.headline, W - 160).slice(0, 2).forEach((line, i) => ctx.fillText(line, W / 2, 520 + i * 74))

  ctx.fillStyle = '#0c8a76'
  ctx.font = font(800, 190)
  ctx.fillText(labels.big, W / 2, 770)

  ctx.fillStyle = '#12304a'
  ctx.font = font(700, 48)
  wrap(ctx, labels.caption, W - 200).slice(0, 2).forEach((line, i) => ctx.fillText(line, W / 2, 840 + i * 58))

  ctx.fillStyle = '#5b6b7e'
  ctx.font = font(600, 34)
  const who = [labels.name, labels.grade].filter(Boolean).join(' · ')
  if (who) ctx.fillText(who, W / 2, 975)

  ctx.fillStyle = '#8a97a6'
  ctx.font = font(600, 24)
  wrap(ctx, labels.privacy, W - 160).slice(0, 2).forEach((line, i) => ctx.fillText(line, W / 2, 1020 + i * 30))
  ctx.fillStyle = '#12b8a0'
  ctx.font = font(700, 24)
  ctx.fillText('jessica · bishoynabilanis.github.io/jessica', W / 2, H - 12)
  return canvas
}
