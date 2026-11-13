/**
 * Daily SEO watcher.
 *
 * Runs on a GitHub Actions schedule (and manually). It checks that the public
 * site is still crawlable, that the sitemap and every URL in it answer 200,
 * pings IndexNow, and — when a Google service account is configured — reports
 * the Search Console sitemap status and the index status of the key pages.
 *
 * No secrets are required for the health checks. The Google part is optional:
 * add the `GSC_SERVICE_ACCOUNT` repository secret (JSON key) and the
 * `GSC_SITE_URL` repository variable to turn it on.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'

const SITE = (process.env.SITE_URL || 'https://bishoynabilanis.github.io/jessica').replace(/\/+$/, '')
const SITE_URL = (process.env.GSC_SITE_URL || `${SITE}/`).replace(/\/?$/, '/')
const SITEMAP_URL = process.env.SITEMAP_URL || `${SITE}/sitemap.xml`
const NTFY_TOPIC = (process.env.NTFY_TOPIC || '').trim()
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '8f3c1d7a9b2e6f405a1c8d3e7b9f2a64'
const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const KEY_PAGES = [
  `${SITE}/welcome/`,
  `${SITE}/welcome/grades/`,
  `${SITE}/welcome/grades/prep-3/`,
  `${SITE}/welcome/grades/primary-4/`,
]

const rows = []
const problems = []
function record(name, ok, detail) {
  rows.push({ name, ok, detail })
  if (!ok) problems.push(`${name}: ${detail}`)
}

async function get(url, options = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(30000),
    ...options,
    headers: { 'User-Agent': UA, ...(options.headers || {}) },
  })
  const text = await response.text()
  return { status: response.status, type: response.headers.get('content-type') || '', text }
}

function canonicalOf(html) {
  return html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] || ''
}

/* ------------------------------- health ------------------------------- */

async function checkSitemap() {
  try {
    const res = await get(SITEMAP_URL)
    const urls = [...res.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim())
    record('Sitemap', res.status === 200 && res.type.includes('xml') && urls.length > 0, `${res.status} · ${urls.length} URLs · ${res.type || 'no type'}`)
    return urls
  } catch (error) {
    record('Sitemap', false, error.message)
    return []
  }
}

async function checkUrls(urls) {
  let bad = 0
  for (const url of urls) {
    try {
      const res = await get(url)
      const ok = res.status === 200 && /<title>/i.test(res.text) && Boolean(canonicalOf(res.text))
      if (!ok) bad += 1
      record(url.replace(SITE, '') || '/', ok, `${res.status}${ok ? '' : ' · missing title/canonical'}`)
    } catch (error) {
      bad += 1
      record(url.replace(SITE, ''), false, error.message)
    }
  }
  return bad
}

async function pingIndexNow(urls) {
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(SITE).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
      signal: AbortSignal.timeout(20000),
    })
    record('IndexNow ping', res.status === 200 || res.status === 202, `HTTP ${res.status}`)
  } catch (error) {
    record('IndexNow ping', false, error.message)
  }
}

/* --------------------------- Search Console --------------------------- */

function base64url(input) {
  return Buffer.from(input).toString('base64url')
}

async function searchAnalytics(token, dimension, rowLimit) {
  const fmt = (date) => date.toISOString().slice(0, 10)
  const body = {
    startDate: fmt(new Date(Date.now() - 28 * 86400000)),
    endDate: fmt(new Date()),
    rowLimit,
    dataType: 'web',
  }
  if (dimension) body.dimensions = [dimension]
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    },
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `searchAnalytics HTTP ${res.status}`)
  return (data.rows || []).map((row) => ({
    key: dimension ? row.keys?.[0] || '' : '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }))
}

async function googleToken(raw) {
  const { client_email, private_key } = JSON.parse(raw)
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = base64url(
    JSON.stringify({
      iss: client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  )
  const signature = base64url(crypto.createSign('RSA-SHA256').update(`${header}.${claim}`).sign(private_key))
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claim}.${signature}`,
    }),
    signal: AbortSignal.timeout(20000),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.error || `token HTTP ${res.status}`)
  return data.access_token
}

async function gscReport(token) {
  const api = 'https://www.googleapis.com/webmasters/v3/sites'
  const sitemapRes = await fetch(`${api}/${encodeURIComponent(SITE_URL)}/sitemaps`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(20000),
  })
  const sitemapData = await sitemapRes.json()
  if (!sitemapRes.ok) throw new Error(sitemapData.error?.message || `sitemaps HTTP ${sitemapRes.status}`)
  const sitemaps = (sitemapData.sitemap || []).map((item) => ({
    path: item.path,
    errors: item.errors || 0,
    warnings: item.warnings || 0,
    lastDownloaded: item.lastDownloaded || '',
    submitted: (item.contents || []).reduce((sum, part) => sum + Number(part.submitted || 0), 0),
  }))

  const inspections = []
  for (const url of KEY_PAGES) {
    try {
      const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL, languageCode: 'en' }),
        signal: AbortSignal.timeout(20000),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
      const index = data.inspectionResult?.indexStatusResult || {}
      inspections.push({
        url,
        verdict: index.verdict || 'UNKNOWN',
        coverage: index.coverageState || '',
        crawl: index.pageFetchState || '',
        lastCrawl: index.lastCrawlTime || '',
      })
    } catch (error) {
      inspections.push({ url, verdict: 'ERROR', coverage: error.message, crawl: '', lastCrawl: '' })
    }
  }

  let analytics = null
  try {
    analytics = {
      totals: (await searchAnalytics(token, null, 1))[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      queries: await searchAnalytics(token, 'query', 15),
      pages: await searchAnalytics(token, 'page', 10),
    }
  } catch (error) {
    analytics = { error: error.message, totals: null, queries: [], pages: [] }
  }

  return { sitemaps, inspections, analytics }
}

/* -------------------------------- report ------------------------------ */

function markdown(report) {
  const lines = [`# SEO watch — ${new Date().toISOString().slice(0, 10)}`, '', '## Site health', '', '| Check | Result |', '| --- | --- |']
  for (const row of rows) lines.push(`| ${row.ok ? '✅' : '❌'} ${row.name} | ${row.detail} |`)

  if (report) {
    lines.push('', '## Search Console — sitemaps', '', '| Sitemap | Last read | Submitted | Errors | Warnings |', '| --- | --- | --- | --- | --- |')
    if (!report.sitemaps.length) lines.push('| — | — | — | — | — |')
    for (const item of report.sitemaps) {
      lines.push(`| ${item.path.replace(SITE, '')} | ${item.lastDownloaded ? item.lastDownloaded.slice(0, 10) : 'not read yet'} | ${item.submitted} | ${item.errors} | ${item.warnings} |`)
    }
    lines.push('', '## Search Console — index status', '', '| URL | Verdict | Coverage | Fetch | Last crawl |', '| --- | --- | --- | --- | --- |')
    for (const item of report.inspections) {
      lines.push(`| ${item.url.replace(SITE, '')} | ${item.verdict} | ${item.coverage} | ${item.crawl} | ${item.lastCrawl ? item.lastCrawl.slice(0, 10) : '—'} |`)
    }

    const analytics = report.analytics
    if (analytics?.error) {
      lines.push('', '## Search Console — last 28 days', '', `⚠️ Search Analytics unavailable: ${analytics.error}`)
    } else if (analytics) {
      const { totals } = analytics
      lines.push(
        '',
        '## Search Console — last 28 days',
        '',
        `**${totals.clicks}** clicks · **${totals.impressions}** impressions · CTR **${(totals.ctr * 100).toFixed(1)}%** · avg position **${totals.position.toFixed(1)}**`,
      )

      lines.push('', '### Top queries', '', '| Query | Clicks | Impressions | CTR | Position |', '| --- | --- | --- | --- | --- |')
      if (!analytics.queries.length) lines.push('| — no query data yet — | | | | |')
      for (const row of analytics.queries) {
        lines.push(`| ${row.key} | ${row.clicks} | ${row.impressions} | ${(row.ctr * 100).toFixed(1)}% | ${row.position.toFixed(1)} |`)
      }

      lines.push('', '### Top pages', '', '| Page | Clicks | Impressions | CTR | Position |', '| --- | --- | --- | --- | --- |')
      if (!analytics.pages.length) lines.push('| — no page data yet — | | | | |')
      for (const row of analytics.pages) {
        lines.push(`| ${row.key.replace(SITE, '')} | ${row.clicks} | ${row.impressions} | ${(row.ctr * 100).toFixed(1)}% | ${row.position.toFixed(1)} |`)
      }
    }
  } else {
    lines.push('', '## Search Console', '', 'Not configured. Add the `GSC_SERVICE_ACCOUNT` secret and `GSC_SITE_URL` variable to include index status.', '', 'See `marketing/growth/automation-ar.md` for the 10-minute setup.')
  }

  lines.push('', '## What to do', '', problems.length ? problems.map((item) => `- ${item}`).join('\n') : '- Everything looks healthy. Indexing changes can take a few days.')
  return lines.join('\n')
}

async function notify(text) {
  if (!NTFY_TOPIC) return
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: { Title: 'Jessica SEO watch', Tags: problems.length ? 'warning' : 'white_check_mark', Priority: problems.length ? 'high' : 'default' },
      body: text.slice(0, 3800),
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    /* notifications must never break the job */
  }
}

/* --------------------------------- run -------------------------------- */

const urls = await checkSitemap()
const badUrls = await checkUrls(urls.length ? urls : KEY_PAGES)
await pingIndexNow(urls.length ? urls : KEY_PAGES)

let report = null
try {
  const token = process.env.GSC_ACCESS_TOKEN || (process.env.GSC_SERVICE_ACCOUNT ? await googleToken(process.env.GSC_SERVICE_ACCOUNT) : '')
  if (token && process.env.SITEMAP_RESET === '1') {
    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps/${encodeURIComponent(SITEMAP_URL)}`
    await fetch(endpoint, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    const put = await fetch(endpoint, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
    record('Sitemap re-submitted', put.ok, `HTTP ${put.status}`)
  }
  if (token) report = await gscReport(token)
} catch (error) {
  record('Search Console API', false, error.message)
}

const text = markdown(report)
console.log(text)
fs.writeFileSync('seo-report.md', `${text}\n`)
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`)
await notify(text)
if (badUrls > 0 || problems.some((item) => item.startsWith('Sitemap:'))) process.exitCode = 1
