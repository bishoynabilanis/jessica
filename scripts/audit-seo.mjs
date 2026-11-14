import fs from 'node:fs'
import path from 'node:path'

/**
 * Static SEO audit for the marketing pages.
 * Checks titles, descriptions, headings, canonicals, internal links and thin content.
 */
const ROOT = 'public/welcome'
const BASE = 'https://bishoynabilanis.github.io/jessica'

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.name === 'index.html') out.push(full)
  }
  return out
}

const pages = walk(ROOT)
const titles = new Map()
const descriptions = new Map()
const problems = []

for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8')
  const rel = '/' + path.relative('public', path.dirname(file)).replace(/\\/g, '/') + '/'
  const url = `${BASE}${rel}`
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || ''
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]?.trim() || ''
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]?.trim() || ''
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, '').trim())
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const words = text.split(' ').filter(Boolean).length

  if (!title) problems.push(`${rel} missing <title>`)
  if (title.length > 65) problems.push(`${rel} title too long (${title.length})`)
  if (!description) problems.push(`${rel} missing description`)
  if (description.length > 165) problems.push(`${rel} description too long (${description.length})`)
  if (description.length < 60) problems.push(`${rel} description too short (${description.length})`)
  if (h1s.length !== 1) problems.push(`${rel} has ${h1s.length} h1`)
  if (canonical !== url) problems.push(`${rel} canonical mismatch: ${canonical || 'none'}`)
  if (words < 220) problems.push(`${rel} thin content (${words} words)`)

  if (titles.has(title)) problems.push(`${rel} duplicate title with ${titles.get(title)}`)
  else titles.set(title, rel)
  if (descriptions.has(description)) problems.push(`${rel} duplicate description with ${descriptions.get(description)}`)
  else descriptions.set(description, rel)

  // internal links resolve?
  for (const match of html.matchAll(/href="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const href = match[1]
    if (/^(https?:|mailto:|tel:|javascript:)/.test(href)) continue
    const target = path.resolve(path.dirname(file), href)
    const candidates = [target, path.join(target, 'index.html'), `${target}.html`]
    if (!candidates.some((candidate) => fs.existsSync(candidate))) {
      problems.push(`${rel} broken link → ${href}`)
    }
  }
}

console.log(`pages: ${pages.length}`)
if (!problems.length) {
  console.log('no problems found')
} else {
  for (const problem of problems) console.log('•', problem)
  process.exitCode = 1
}
