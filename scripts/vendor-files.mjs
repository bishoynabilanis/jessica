// Third-party code the app used to fetch from CDNs now ships with it, pinned by
// package-lock.json: the text-reading engine (worker + core), the offline AI
// library and the PDF character maps. OCR language data is plain data and still
// downloads on demand. Runs after `vite build` (see the build script).
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const nm = path.join(root, 'node_modules')
const copy = (from, to) => {
  if (!existsSync(from)) throw new Error(`vendor file missing: ${from}`)
  mkdirSync(path.dirname(to), { recursive: true })
  cpSync(from, to, { recursive: true })
}
copy(path.join(nm, 'tesseract.js/dist/tesseract.esm.min.js'), path.join(dist, 'ocr/tesseract.esm.min.js'))
copy(path.join(nm, 'tesseract.js/dist/worker.min.js'), path.join(dist, 'ocr/worker.min.js'))
for (const core of ['tesseract-core-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js']) {
  copy(path.join(nm, 'tesseract.js-core', core), path.join(dist, 'ocr/core', core))
}
copy(path.join(nm, '@mlc-ai/web-llm/lib/index.js'), path.join(dist, 'vendor/web-llm.js'))
copy(path.join(nm, 'pdfjs-dist/cmaps'), path.join(dist, 'cmaps'))
