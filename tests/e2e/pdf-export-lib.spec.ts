import { test, expect } from '@playwright/test'

// The PDF library is upgraded for security fixes. This runs the same calls the app uses
// (canvas -> JPEG -> addImage -> setProperties) in a real browser and checks the PDF bytes.
test('jsPDF makes a valid two-page A4 PDF from canvases', async ({ page }) => {
  await page.goto('./#/')
  await page.addScriptTag({ path: 'node_modules/jspdf/dist/jspdf.umd.min.js' })
  const result = await page.evaluate(() => {
    const { jsPDF } = (window as unknown as { jspdf: { jsPDF: new (o: object) => any } }).jspdf
    const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
    const w = pdf.internal.pageSize.getWidth()
    const h = pdf.internal.pageSize.getHeight()
    for (let i = 0; i < 2; i++) {
      if (i > 0) pdf.addPage()
      const c = document.createElement('canvas')
      c.width = 200
      c.height = 280
      const ctx = c.getContext('2d')!
      ctx.fillStyle = i ? '#2ee6c5' : '#ffd166'
      ctx.fillRect(0, 0, 200, 280)
      pdf.addImage(c.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, w, h, undefined, 'FAST')
    }
    pdf.setProperties({ title: 'Test sheet', creator: 'Jessica', subject: 'AI study sheet' })
    const bytes = new Uint8Array(pdf.output('arraybuffer'))
    return { head: String.fromCharCode(...bytes.slice(0, 5)), size: bytes.length, pages: pdf.getNumberOfPages(), w: Math.round(w), h: Math.round(h) }
  })
  expect(result.head).toBe('%PDF-')
  expect(result.pages).toBe(2)
  expect(result.size).toBeGreaterThan(1000)
  expect([result.w, result.h]).toEqual([595, 842])
})
