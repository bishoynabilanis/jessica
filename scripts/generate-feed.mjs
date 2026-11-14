import fs from 'node:fs'
import path from 'node:path'

/**
 * Builds /welcome/feed.xml from the generated pages themselves, so the feed can
 * never drift from the real titles and descriptions. Feed readers, Bing and a
 * few aggregators pick this up even when they ignore the sitemap.
 */
const BASE = 'https://bishoynabilanis.github.io/jessica'
const ROOT = 'public/welcome'
const SKIP = new Set(['en'])

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.name === 'index.html') out.push(full)
  }
  return out
}

function read(file) {
  const html = fs.readFileSync(file, 'utf8')
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || ''
  const description =
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim() || ''
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]?.trim() || ''
  const hero = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || ''
  return { title, description, canonical, hero }
}

const escape = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const files = walk(ROOT)
const items = []

for (const file of files) {
  const { title, description, canonical, hero } = read(file)
  if (!canonical || !title) continue
  items.push({ title, description: description || hero, url: canonical, file })
}

const priority = (item) => {
  if (item.url.endsWith('/welcome/')) return 0
  if (item.url.includes('/topics/')) return 1
  if (item.url.includes('/guides/')) return 2
  if (item.url.includes('/quiz/')) return 3
  if (item.url.includes('/grades/')) return 4
  return 5
}

items.sort((a, b) => priority(a) - priority(b) || a.url.localeCompare(b.url))

const now = new Date().toUTCString()
const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Jessica — كتب الوزارة، مدرس ذكي، واختبار ٦٠ ثانية</title>
    <link>${BASE}/welcome/</link>
    <description>صفحات Jessica لطلاب مصر من أولى ابتدائي لتالتة إعدادي: كتب الوزارة PDF، اختبارات ٦٠ ثانية، أدلة مذاكرة، ودليل تثبيت التطبيق.</description>
    <language>ar</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${BASE}/welcome/feed.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (item) => `    <item>
      <title>${escape(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <description>${escape(item.description)}</description>
      <pubDate>${now}</pubDate>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`

fs.writeFileSync(path.join(ROOT, 'feed.xml'), feed)
console.log(`feed: ${items.length} items`)
