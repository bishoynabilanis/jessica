/**
 * A finished battle, two ways to keep it without a server:
 * a small local scoreboard (children who play on this device) and a picture
 * the parent can share. Both are made on the device from the child's own result.
 */
const KEY = 'jessica-battle-results-v1'

export interface BattleResult {
  name: string
  score: number
  total: number
  at: number
}

type Store = Record<string, BattleResult[]>

function read(): Store {
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/** Keeps each child's best score per battle. Only the last 30 battles are remembered. */
export function recordBattleResult(battleId: string, result: Omit<BattleResult, 'at'>): BattleResult[] {
  const name = result.name.trim().slice(0, 30) || '?'
  const store = read()
  const list = [...(store[battleId] || [])]
  const index = list.findIndex((item) => item.name === name)
  const entry = { ...result, name, at: Date.now() }
  if (index < 0) list.push(entry)
  else if (result.score >= list[index].score) list[index] = entry
  store[battleId] = list
  const ids = Object.keys(store)
  if (ids.length > 30) {
    ids
      .sort((a, b) => Math.max(...store[a].map((r) => r.at)) - Math.max(...store[b].map((r) => r.at)))
      .slice(0, ids.length - 30)
      .forEach((id) => delete store[id])
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // Storage full or blocked: the scoreboard just stays empty.
  }
  return battleBoard(battleId)
}

export function battleBoard(battleId: string): BattleResult[] {
  return [...(read()[battleId] || [])].sort((a, b) => b.score - a.score || a.at - b.at)
}

export interface BattleCardLabels {
  title: string
  verdict: string
  subject: string
  score: string
  target: string
  board: string
  privacy: string
  rtl: boolean
}

const SIZE = 1080

export function drawBattleCard(
  labels: BattleCardLabels,
  rows: { name: string; score: string }[],
  won: boolean,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  const font = (weight: number, size: number) => `${weight} ${size}px Cairo, system-ui, sans-serif`
  const rtl = labels.rtl
  ctx.direction = rtl ? 'rtl' : 'ltr'
  const edge = rtl ? SIZE - 80 : 80
  ctx.textAlign = rtl ? 'right' : 'left'

  ctx.fillStyle = '#fbf8f1'
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.fillStyle = won ? '#12b8a0' : '#f0a63a'
  ctx.fillRect(0, 0, SIZE, 22)

  ctx.fillStyle = '#12304a'
  ctx.font = font(800, 64)
  ctx.fillText(labels.title, edge, 150)
  ctx.fillStyle = won ? '#0c8a76' : '#b9741a'
  ctx.font = font(800, 92)
  ctx.fillText(labels.verdict, edge, 290)
  ctx.fillStyle = '#5b6b7e'
  ctx.font = font(600, 36)
  ctx.fillText(labels.subject, edge, 350)

  ctx.fillStyle = '#12304a'
  ctx.font = font(800, 150)
  ctx.fillText(labels.score, edge, 520)
  ctx.fillStyle = '#5b6b7e'
  ctx.font = font(600, 36)
  ctx.fillText(labels.target, edge, 575)

  ctx.fillStyle = '#12304a'
  ctx.font = font(800, 40)
  ctx.fillText(labels.board, edge, 670)
  ctx.font = font(600, 36)
  rows.slice(0, 4).forEach((row, i) => {
    const y = 730 + i * 58
    ctx.fillStyle = '#12304a'
    ctx.fillText(`${i + 1}. ${row.name}`, edge, y)
    ctx.textAlign = rtl ? 'left' : 'right'
    ctx.fillText(row.score, rtl ? 80 : SIZE - 80, y)
    ctx.textAlign = rtl ? 'right' : 'left'
  })

  ctx.fillStyle = '#8a97a6'
  ctx.font = font(600, 26)
  ctx.fillText(labels.privacy, edge, SIZE - 50)
  return canvas
}
