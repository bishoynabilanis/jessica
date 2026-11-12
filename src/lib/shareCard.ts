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

/** Shares an achievement card as an image, or downloads it when sharing is unsupported. */
export async function shareAchievement(input: ShareCardInput): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const canvas = drawCard(input)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return 'cancelled'

  const file = new File([blob], 'jessica-achievement.png', { type: 'image/png' })
  const nav = navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean
    share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>
  }

  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], title: input.title, text: input.title })
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'jessica-achievement.png'
  link.click()
  URL.revokeObjectURL(url)
  return 'downloaded'
}
