import { jsPDF } from 'jspdf'

const A4_W = 1240
const A4_H = 1754
const MARGIN = 90

interface PdfOptions {
  title: string
  subtitle?: string
  markdown: string
  footer?: string
  accent?: string
  student?: string
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function stripInline(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
}

function drawPageChrome(
  ctx: CanvasRenderingContext2D,
  accent: string,
  title: string,
  page: number,
  total: number,
) {
  ctx.fillStyle = '#fbfcff'
  ctx.fillRect(0, 0, A4_W, A4_H)

  const gradient = ctx.createLinearGradient(0, 0, A4_W, 260)
  gradient.addColorStop(0, '#070b18')
  gradient.addColorStop(1, '#111a36')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, A4_W, 250)
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, 14, 250)
  ctx.globalAlpha = 0.18
  ctx.beginPath()
  ctx.arc(1080, 40, 190, 0, Math.PI * 2)
  ctx.fillStyle = accent
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.fillStyle = accent
  ctx.font = '700 23px "Plus Jakarta Sans", Arial, sans-serif'
  ctx.fillText('JESSICA · SMART STUDY SHEET', MARGIN, 78)
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 52px "Plus Jakarta Sans", "Cairo", Arial, sans-serif'
  const titleLines = wrapCanvasText(ctx, title, A4_W - MARGIN * 2).slice(0, 2)
  titleLines.forEach((line, i) => ctx.fillText(line, MARGIN, 150 + i * 58))
  ctx.fillStyle = '#b9c4e2'
  ctx.font = '500 22px "Plus Jakarta Sans", "Cairo", Arial, sans-serif'
  ctx.fillText(
    `Generated in Jessica · ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    MARGIN,
    222,
  )

  ctx.strokeStyle = 'rgba(10,20,40,.08)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(MARGIN, A4_H - 72)
  ctx.lineTo(A4_W - MARGIN, A4_H - 72)
  ctx.stroke()
  ctx.fillStyle = '#8792ad'
  ctx.font = '500 18px "Plus Jakarta Sans", Arial, sans-serif'
  ctx.fillText('Jessica — your AI learning universe', MARGIN, A4_H - 40)
  ctx.textAlign = 'right'
  ctx.fillText(`${page} / ${total}`, A4_W - MARGIN, A4_H - 40)
  ctx.textAlign = 'left'
}

function renderMarkdownToCanvases(opts: PdfOptions): HTMLCanvasElement[] {
  const accent = opts.accent || '#08c9b1'
  const canvases: HTMLCanvasElement[] = []
  const lines = opts.markdown.split('\n')
  let canvas: HTMLCanvasElement = document.createElement('canvas')
  let ctx = canvas.getContext('2d')!
  let y = 0
  let page = 0

  const startPage = () => {
    canvas = document.createElement('canvas')
    canvas.width = A4_W
    canvas.height = A4_H
    ctx = canvas.getContext('2d')!
    page += 1
    drawPageChrome(ctx, accent, opts.title, page, 1)
    y = 300
    canvases.push(canvas)
  }

  const ensureSpace = (needed: number) => {
    if (!canvas || !ctx) return
    if (y + needed > A4_H - 110) {
      startPage()
    }
  }

  startPage()

  for (const raw of lines) {
    if (!ctx || !canvas) break
    const line = raw.trimEnd()
    if (!line.trim()) {
      y += 14
      continue
    }

    let font = '400 24px "Plus Jakarta Sans", "Cairo", Arial, sans-serif'
    let color = '#263147'
    let gap = 40
    let text = line
    let indent = 0

    if (/^#\s/.test(line)) {
      text = stripInline(line.replace(/^#\s+/, ''))
      font = `800 42px "Plus Jakarta Sans", "Cairo", Arial, sans-serif`
      color = '#0a1020'
      gap = 64
      y += 10
    } else if (/^##\s/.test(line)) {
      text = stripInline(line.replace(/^##\s+/, ''))
      font = `800 30px "Plus Jakarta Sans", "Cairo", Arial, sans-serif`
      color = accent
      gap = 54
      y += 16
    } else if (/^###\s/.test(line)) {
      text = stripInline(line.replace(/^###\s+/, ''))
      font = `700 25px "Plus Jakarta Sans", "Cairo", Arial, sans-serif`
      color = '#1a2340'
      gap = 46
      y += 10
    } else if (/^>\s/.test(line)) {
      text = stripInline(line.replace(/^>\s+/, ''))
      font = `italic 500 24px "Plus Jakarta Sans", "Cairo", Arial, sans-serif`
      color = '#39476a'
      gap = 48
      ctx.fillStyle = `${accent}22`
      ctx.fillRect(MARGIN - 18, y - 24, A4_W - MARGIN * 2 + 36, 46)
      ctx.fillStyle = accent
      ctx.fillRect(MARGIN - 18, y - 24, 6, 46)
    } else if (/^[-*]\s/.test(line)) {
      text = stripInline(line.replace(/^[-*]\s+/, ''))
      indent = 22
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.arc(MARGIN + 6, y - 7, 5, 0, Math.PI * 2)
      ctx.fill()
    } else if (/^\d+[.)]\s/.test(line)) {
      indent = 22
    } else if (/^\|/.test(line)) {
      if (/^\|[\s:|-]+\|?$/.test(line)) continue
      const cells = line.split('|').slice(1, -1).map((c) => stripInline(c.trim()))
      text = cells.join('   ·   ')
      font = '500 20px "Plus Jakarta Sans", "Cairo", Arial, sans-serif'
      color = '#36415c'
      gap = 32
    }

    ctx.font = font
    ctx.fillStyle = color
    const wrapped = wrapCanvasText(ctx, text, A4_W - MARGIN * 2 - indent)
    for (const w of wrapped) {
      ensureSpace(gap)
      ctx.font = font
      ctx.fillStyle = color
      ctx.fillText(w, MARGIN + indent, y)
      y += gap
      indent = indent ? indent : 0
    }
  }

  if (opts.footer && ctx) {
    ensureSpace(60)
    ctx.fillStyle = '#8792ad'
    ctx.font = 'italic 18px "Plus Jakarta Sans", "Cairo", Arial, sans-serif'
    ctx.fillText(opts.footer, MARGIN, y + 16)
  }

  // Fix the total page count in the footer.
  canvases.forEach((c, i) => {
    const cctx = c.getContext('2d')!
    cctx.fillStyle = '#fbfcff'
    cctx.fillRect(A4_W - MARGIN - 90, A4_H - 58, 90, 28)
    cctx.fillStyle = '#8792ad'
    cctx.font = '500 18px "Plus Jakarta Sans", Arial, sans-serif'
    cctx.textAlign = 'right'
    cctx.fillText(`${i + 1} / ${canvases.length}`, A4_W - MARGIN, A4_H - 40)
    cctx.textAlign = 'left'
  })

  return canvases
}

export async function exportStudySheetPdf(opts: PdfOptions) {
  await document.fonts.ready.catch(() => undefined)
  const canvases = renderMarkdownToCanvases(opts)
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  canvases.forEach((canvas, index) => {
    if (index > 0) pdf.addPage()
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST')
  })
  pdf.setProperties({ title: opts.title, creator: 'Jessica', subject: 'AI study sheet' })
  pdf.save(`${safeName(opts.title)}.pdf`)
}

export async function exportCertificatePdf(opts: {
  student: string
  subject: string
  score: number
  total: number
  date: string
  certId: string
}) {
  await document.fonts.ready.catch(() => undefined)
  const W = 1754
  const H = 1240
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#05070f')
  bg.addColorStop(0.5, '#0b1226')
  bg.addColorStop(1, '#101a35')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W * 0.2, 0, 20, W * 0.2, 0, 700)
  glow.addColorStop(0, 'rgba(33,230,201,.22)')
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)
  const glow2 = ctx.createRadialGradient(W * 0.85, H, 20, W * 0.85, H, 700)
  glow2.addColorStop(0, 'rgba(139,92,246,.22)')
  glow2.addColorStop(1, 'transparent')
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(33,230,201,.55)'
  ctx.lineWidth = 4
  roundRect(ctx, 60, 60, W - 120, H - 120, 28)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(139,92,246,.28)'
  ctx.lineWidth = 1.5
  roundRect(ctx, 82, 82, W - 164, H - 164, 20)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.fillStyle = '#21e6c9'
  ctx.font = '700 26px "Plus Jakarta Sans", Arial, sans-serif'
  ctx.fillText('JESSICA · AI LEARNING UNIVERSE', W / 2, 180)
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 74px "Plus Jakarta Sans", "Cairo", Arial, sans-serif'
  ctx.fillText('Certificate of Achievement', W / 2, 286)
  ctx.fillStyle = '#b9c4e2'
  ctx.font = '500 26px "Plus Jakarta Sans", "Cairo", Arial, sans-serif'
  ctx.fillText('This certifies that', W / 2, 366)

  ctx.fillStyle = '#ffd166'
  ctx.font = '800 70px "Plus Jakarta Sans", "Cairo", Arial, sans-serif'
  ctx.fillText(opts.student || 'Student', W / 2, 470)

  ctx.fillStyle = '#e8edff'
  ctx.font = '500 27px "Plus Jakarta Sans", "Cairo", Arial, sans-serif'
  ctx.fillText('has successfully completed the', W / 2, 548)
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 44px "Plus Jakarta Sans", "Cairo", Arial, sans-serif'
  ctx.fillText(`${opts.subject} Mock Examination`, W / 2, 610)

  const pct = Math.round((opts.score / Math.max(1, opts.total)) * 100)
  ctx.fillStyle = pct >= 80 ? '#21e6c9' : pct >= 50 ? '#ffd166' : '#ff7a8a'
  ctx.font = '800 118px "Plus Jakarta Sans", Arial, sans-serif'
  ctx.fillText(`${pct}%`, W / 2, 750)
  ctx.fillStyle = '#b9c4e2'
  ctx.font = '500 24px "Plus Jakarta Sans", Arial, sans-serif'
  ctx.fillText(`${opts.score} of ${opts.total} correct`, W / 2, 796)

  ctx.font = '800 54px "Arial"'
  ctx.fillStyle = 'rgba(255,209,102,.9)'
  ctx.fillText('✦', W / 2, 900)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#e8edff'
  ctx.font = '600 22px "Plus Jakarta Sans", Arial, sans-serif'
  ctx.fillText('DATE', 220, 1010)
  ctx.fillText('CERTIFICATE ID', 220, 1062)
  ctx.fillText('ISSUED BY', W - 560, 1010)
  ctx.fillText('PLATFORM', W - 560, 1062)
  ctx.fillStyle = '#8f9ab8'
  ctx.font = '500 21px "Plus Jakarta Sans", Arial, sans-serif'
  ctx.fillText(opts.date, 220, 1038)
  ctx.fillText(opts.certId, 220, 1090)
  ctx.fillText('Jessica AI Tutor', W - 560, 1038)
  ctx.fillText('jessica.edu · offline-first', W - 560, 1090)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#21e6c9'
  ctx.beginPath()
  ctx.arc(W - 300, 990, 72, 0, Math.PI * 2)
  ctx.globalAlpha = 0.18
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.strokeStyle = '#21e6c9'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.fillStyle = '#21e6c9'
  ctx.font = '800 30px "Plus Jakarta Sans", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('JESSICA', W - 300, 992)
  ctx.font = '600 15px "Plus Jakarta Sans", Arial, sans-serif'
  ctx.fillText('VERIFIED', W - 300, 1018)
  ctx.textAlign = 'left'

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' })
  const pw = pdf.internal.pageSize.getWidth()
  const ph = pdf.internal.pageSize.getHeight()
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pw, ph)
  pdf.save(`Jessica-Certificate-${safeName(opts.student)}.pdf`)
}

function safeName(input: string) {
  return (input || 'jessica-study-sheet')
    .replace(/[^\p{L}\p{N}\s-]+/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
