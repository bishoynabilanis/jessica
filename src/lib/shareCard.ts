export interface ShareCardInput {
  title: string
  subtitle?: string
  lines: string[]
  emoji?: string
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawCard(input: ShareCardInput): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350
  const ctx = canvas.getContext('2d')!

  const background = ctx.createLinearGradient(0, 0, 1080, 1350)
  background.addColorStop(0, '#0a0f1e')
  background.addColorStop(0.55, '#111a33')
  background.addColorStop(1, '#1b1230')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, 1080, 1350)

  const glow = ctx.createRadialGradient(830, 190, 20, 830, 190, 520)
  glow.addColorStop(0, 'rgba(167,139,250,0.45)')
  glow.addColorStop(1, 'rgba(167,139,250,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 1080, 1350)

  const glow2 = ctx.createRadialGradient(200, 1180, 20, 200, 1180, 460)
  glow2.addColorStop(0, 'rgba(46,230,197,0.3)')
  glow2.addColorStop(1, 'rgba(46,230,197,0)')
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, 1080, 1350)

  ctx.textAlign = 'center'
  ctx.direction = 'rtl'

  ctx.fillStyle = '#2ee6c5'
  ctx.font = '800 46px Cairo, system-ui, sans-serif'
  ctx.fillText('jessica.', 540, 150)

  ctx.font = '130px "Apple Color Emoji", "Segoe UI Emoji", serif'
  ctx.fillText(input.emoji || '🏆', 540, 360)

  ctx.fillStyle = '#eef3ff'
  ctx.font = '800 62px Cairo, system-ui, sans-serif'
  const titleLines = wrapText(ctx, input.title, 820)
  titleLines.forEach((line, index) => ctx.fillText(line, 540, 500 + index * 80))

  if (input.subtitle) {
    ctx.fillStyle = '#98a6bf'
    ctx.font = '700 38px Cairo, system-ui, sans-serif'
    ctx.fillText(input.subtitle, 540, 660)
  }

  ctx.fillStyle = '#eef3ff'
  ctx.font = '700 40px Cairo, system-ui, sans-serif'
  let y = 790
  for (const line of input.lines.slice(0, 4)) {
    ctx.fillText(line, 540, y)
    y += 76
  }

  ctx.fillStyle = '#6f7c92'
  ctx.font = '600 26px Cairo, system-ui, sans-serif'
  const date = new Date().toLocaleDateString('ar-EG')
  ctx.fillText(date, 540, 1210)
  ctx.fillStyle = '#2ee6c5'
  ctx.font = '700 26px Cairo, system-ui, sans-serif'
  ctx.fillText('bishoynabilanis.github.io/jessica', 540, 1265)

  return canvas
}

export interface StoryCardInput {
  title: string
  subtitle?: string
  emoji?: string
  stats: { value: string; label: string }[]
  line?: string
  footer?: string
}

/** 1080×1920 card sized for WhatsApp status, Instagram and TikTok stories. */
function drawStory(input: StoryCardInput): HTMLCanvasElement {
  const W = 1080
  const H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const background = ctx.createLinearGradient(0, 0, W, H)
  background.addColorStop(0, '#070b16')
  background.addColorStop(0.5, '#101a33')
  background.addColorStop(1, '#1d1233')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, W, H)

  const glow = ctx.createRadialGradient(840, 280, 20, 840, 280, 700)
  glow.addColorStop(0, 'rgba(167,139,250,0.42)')
  glow.addColorStop(1, 'rgba(167,139,250,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  const glow2 = ctx.createRadialGradient(180, 1500, 20, 180, 1500, 620)
  glow2.addColorStop(0, 'rgba(46,230,197,0.32)')
  glow2.addColorStop(1, 'rgba(46,230,197,0)')
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, W, H)

  ctx.textAlign = 'center'
  ctx.direction = 'rtl'

  ctx.fillStyle = '#2ee6c5'
  ctx.font = '800 58px Cairo, system-ui, sans-serif'
  ctx.fillText('jessica.', W / 2, 170)

  ctx.fillStyle = '#8f9db5'
  ctx.font = '600 30px Cairo, system-ui, sans-serif'
  ctx.fillText(input.footer || 'تعلّم أذكى، كل يوم', W / 2, 220)

  const circle = ctx.createLinearGradient(400, 420, 680, 700)
  circle.addColorStop(0, 'rgba(46,230,197,0.22)')
  circle.addColorStop(1, 'rgba(167,139,250,0.22)')
  ctx.fillStyle = circle
  ctx.beginPath()
  ctx.arc(W / 2, 570, 155, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.font = '160px "Apple Color Emoji", "Segoe UI Emoji", serif'
  ctx.fillText(input.emoji || '🏆', W / 2, 635)

  ctx.fillStyle = '#eef3ff'
  ctx.font = '800 74px Cairo, system-ui, sans-serif'
  const titleLines = wrapText(ctx, input.title, 860)
  titleLines.slice(0, 3).forEach((line, index) => ctx.fillText(line, W / 2, 900 + index * 92))

  if (input.subtitle) {
    ctx.fillStyle = '#9aa7bd'
    ctx.font = '700 40px Cairo, system-ui, sans-serif'
    const subLines = wrapText(ctx, input.subtitle, 820)
    subLines.slice(0, 2).forEach((line, index) => ctx.fillText(line, W / 2, 1120 + index * 58))
  }

  const stats = input.stats.slice(0, 3)
  const boxWidth = stats.length === 3 ? 280 : 360
  const gap = 24
  const totalWidth = stats.length * boxWidth + (stats.length - 1) * gap
  let x = (W - totalWidth) / 2
  const boxY = 1270
  for (const stat of stats) {
    ctx.fillStyle = 'rgba(255,255,255,0.055)'
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(x, boxY, boxWidth, 230, 34)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#2ee6c5'
    ctx.font = '800 58px Cairo, system-ui, sans-serif'
    ctx.fillText(stat.value, x + boxWidth / 2, boxY + 105)

    ctx.fillStyle = '#9aa7bd'
    ctx.font = '600 26px Cairo, system-ui, sans-serif'
    ctx.fillText(stat.label, x + boxWidth / 2, boxY + 165)
    x += boxWidth + gap
  }

  if (input.line) {
    ctx.fillStyle = '#eef3ff'
    ctx.font = '700 34px Cairo, system-ui, sans-serif'
    wrapText(ctx, input.line, 840)
      .slice(0, 2)
      .forEach((text, index) => ctx.fillText(text, W / 2, 1640 + index * 48))
  }

  ctx.fillStyle = '#6f7c92'
  ctx.font = '600 28px Cairo, system-ui, sans-serif'
  ctx.fillText(new Date().toLocaleDateString('ar-EG'), W / 2, 1770)

  ctx.fillStyle = '#2ee6c5'
  ctx.font = '700 28px Cairo, system-ui, sans-serif'
  ctx.fillText('bishoynabilanis.github.io/jessica', W / 2, 1820)

  return canvas
}

async function shareCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  title: string,
  text: string,
): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return 'cancelled'

  const file = new File([blob], filename, { type: 'image/png' })
  const nav = navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean
    share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>
  }

  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], title, text })
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
  return 'downloaded'
}

/** Shares an achievement card as an image, or downloads it when sharing is unsupported. */
export async function shareAchievement(input: ShareCardInput): Promise<'shared' | 'downloaded' | 'cancelled'> {
  return shareCanvas(drawCard(input), 'jessica-achievement.png', input.title, input.title)
}

/** Shares a vertical story card (1080×1920) for WhatsApp status or Instagram. */
export async function shareStory(input: StoryCardInput): Promise<'shared' | 'downloaded' | 'cancelled'> {
  return shareCanvas(drawStory(input), 'jessica-story.png', input.title, input.title)
}
