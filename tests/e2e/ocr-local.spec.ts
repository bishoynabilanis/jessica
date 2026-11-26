import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

// The text-reading engine now ships with the app. This reads a real drawn image with the
// shipped files, using the same paths the app uses, with the policy switched on.
test('the shipped OCR engine reads a drawn image under the page policy', async ({ page }) => {
  const traineddata = readFileSync('node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz')
  await page.route('https://tessdata.test/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/octet-stream', headers: { 'access-control-allow-origin': '*' }, body: traineddata }),
  )
  const violations: string[] = []
  await page.addInitScript(() => {
    ;(window as any).__csp = []
    document.addEventListener('securitypolicyviolation', (e) => (window as any).__csp.push(`${e.violatedDirective} ${e.blockedURI}`))
  })
  await page.goto('./#/')
  const text = await page.evaluate(async () => {
    const local = (p: string) => new URL(p, document.baseURI).href
    const mod: any = await import(/* @vite-ignore */ local('ocr/tesseract.esm.min.js'))
    const createWorker = mod.createWorker ?? mod.default?.createWorker
    const worker = await createWorker('eng', 1, { workerPath: local('ocr/worker.min.js'), corePath: local('ocr/core/'), langPath: 'https://tessdata.test/4.0.0' })
    const c = document.createElement('canvas')
    c.width = 500
    c.height = 140
    const x = c.getContext('2d')!
    x.fillStyle = '#fff'
    x.fillRect(0, 0, 500, 140)
    x.fillStyle = '#000'
    x.font = 'bold 64px Arial'
    x.fillText('Hello 42', 30, 90)
    const { data } = await worker.recognize(c)
    await worker.terminate()
    return String(data.text).trim()
  })
  expect(text).toContain('Hello')
  expect(text).toContain('42')
  violations.push(...(await page.evaluate(() => (window as any).__csp as string[])))
  expect(violations).toEqual([])
})

test('the app asks for no code from CDNs any more', async ({ page }) => {
  const external: string[] = []
  page.on('request', (r) => {
    const u = new URL(r.url())
    if (u.hostname !== '127.0.0.1' && /\.(m?js|wasm)$/.test(u.pathname)) external.push(r.url())
  })
  await page.goto('./#/')
  await page.waitForTimeout(1500)
  expect(external).toEqual([])
})
