import { test, expect, type Page } from '@playwright/test'
import { sanitizeImport } from '../../src/lib/backupSafe'
import { safeParentNote, cleanParentNote } from '../../src/lib/parentNote'

test.use({ timezoneId: 'Asia/Dubai' })

test('a parent note is plain text: no links, no emails, no tags, 100 characters at most', () => {
  expect(cleanParentNote('  Proud of you!  ')).toBe('Proud of you!')
  expect(cleanParentNote('see https://evil.example/x now')).toBe('see now')
  expect(cleanParentNote('go to www.evil.example')).toBe('go to')
  expect(cleanParentNote('mail me a@b.co please')).toBe('mail me please')
  expect(cleanParentNote('<b>hi</b>')).toBe('hi')
  expect(cleanParentNote('I <3 you')).toBe('I <3 you')
  expect(cleanParentNote('go https<>://x.co now')).toBe('go now')
  expect(cleanParentNote('go ww<>w.x.co now')).toBe('go now')
  expect(cleanParentNote('see evil.example/x and t.me/abc and bit.ly/xx ok')).toBe('see and and ok')
  expect(cleanParentNote('e.g. be kind')).toBe('e.g. be kind')
  expect(cleanParentNote('a\u200bb\u202ec\u0085d')).toBe('a b c d')
  expect(cleanParentNote('💌'.repeat(150))).toBe('💌'.repeat(100))
  expect(cleanParentNote('call 01555481844 now')).toBe('call now')
  expect(cleanParentNote('call +20 155 548 1844 now')).toBe('call now')
  expect(cleanParentNote('go example[.]com now')).toBe('go now')
  expect(cleanParentNote('go evil .com/x now')).toBe('go now')
  expect(cleanParentNote('go example(dot)com now')).toBe('go now')
  expect(cleanParentNote('javascript:alert(1)')).toBe('alert(1)')
  expect(cleanParentNote('go \uff37\uff57\uff57.example.com now')).toBe('go now')
  expect(cleanParentNote('I am proud of you, 10 out of 10')).toBe('I am proud of you, 10 out of 10')
  expect(cleanParentNote('اتصلي ٠١٠٠١٢٣٤٥٦٧٨ دلوقتي')).toBe('اتصلي دلوقتي')
  expect(cleanParentNote('call ۰۱۰۰۱۲۳۴۵۶۷۸ now')).toBe('call now')
  expect(cleanParentNote('برافو ١٠ من ١٠')).toBe('برافو ١٠ من ١٠')
  expect(cleanParentNote({ x: 1 })).toBe('')
  expect(safeParentNote({ text: { x: 1 }, at: 1 })).toBeNull()
  expect(sanitizeImport({ parentNote: { text: { x: 1 } } }, { parentNote: null })).toEqual({})
  expect(sanitizeImport({ parentNote: { text: 'hi <b>x</b> a@b.co', at: 5 } }, { parentNote: null })).toEqual({ parentNote: { text: 'hi x', at: 5 } })
  expect(cleanParentNote('a'.repeat(300)).length).toBe(100)
  expect(cleanParentNote('   ')).toBe('')
})

async function open(page: Page, language: string, path: string, opts: { parent?: boolean; note?: string; raw?: unknown } = {}) {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(
    ({ language, parent, note, raw }) => {
      if (window.localStorage.getItem('jessica-profile-v1')) return
      window.localStorage.setItem(
        'jessica-profile-v1',
        JSON.stringify({
          state: {
            onboarded: true, acceptedTerms: 1, name: 'Maria', apiKey: '', model: 'gemini-1.5-flash', xp: 50, streak: 2, coins: 0,
            customBooks: [{ id: 'b1', title: 'Maths 3', subject: 'Mathematics', grade: 3, term: 'Term 1', pageCount: 60, custom: true, units: [{ id: 'u1', title: 'Counting', pages: [1, 2] }] }], completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {},
            parentNote: raw !== undefined ? raw : note ? { text: note, at: 1 } : null,
            settings: { language, gradeLevel: 3, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'light', keyOptional: true, quickStart: false, sound: false, aiMode: 'cloud' },
          },
          version: 3,
        }),
      )
      window.localStorage.setItem('jessica-disclaimer-v1', '1')
      if (parent) window.sessionStorage.setItem('jessica-parent-ok', '1')
    },
    { language, parent: !!opts.parent, note: opts.note || '', raw: opts.raw },
  )
  await page.goto(path)
}

test('the child cannot reach the note editor without the parent gate', async ({ page }) => {
  await open(page, 'en', './#/kids/parent')
  await expect(page.getByTestId('parent-note-editor')).toHaveCount(0)
})

test('a parent writes a note, the child sees it on home and My day, and the parent can remove it (English)', async ({ page }) => {
  await open(page, 'en', './#/kids/parent', { parent: true })
  await expect(page.getByTestId('parent-note-card')).toHaveCount(0)
  await page.getByTestId('parent-note-input').fill('I am proud of you. Keep going! https://evil.example')
  await page.getByTestId('parent-note-save').click()
  await expect(page.getByTestId('parent-note-current')).toContainText('I am proud of you. Keep going!')
  await expect(page.getByTestId('parent-note-current')).not.toContainText('evil')
  await page.getByTestId('parent-note-editor').screenshot({ path: '/tmp/sh/note-parent-en.png' })
  await page.goto('./#/kids')
  await expect(page.getByTestId('parent-note-card')).toContainText('A note from your grown-up')
  await expect(page.getByTestId('parent-note-card')).toContainText('I am proud of you. Keep going!')
  await page.screenshot({ path: '/tmp/sh/note-home-en.png', fullPage: true })
  await page.goto('./#/kids/today')
  await expect(page.getByTestId('parent-note-card')).toContainText('I am proud of you. Keep going!')
  await page.screenshot({ path: '/tmp/sh/note-today-en.png' })
  // stays after a reload (kept on this device)
  await page.reload()
  await expect(page.getByTestId('parent-note-card')).toBeVisible()
  expect(await page.evaluate(() => (localStorage.getItem('jessica-profile-v1') || '').includes('I am proud of you'))).toBe(true)
  // nothing is sent anywhere
  await page.goto('./#/kids/parent')
  await page.getByTestId('parent-note-clear').click()
  await page.goto('./#/kids')
  await expect(page.getByTestId('parent-note-card')).toHaveCount(0)
})

test('Arabic note shows right-to-left in Egyptian wording and markup is removed', async ({ page }) => {
  await open(page, 'ar', './#/kids', { note: 'فخور بيكي <b>يا بطلة</b>' })
  await expect(page.getByTestId('parent-note-card')).toContainText('رسالة من حد كبير ليك')
  await expect(page.getByTestId('parent-note-card')).toContainText('فخور بيكي يا بطلة')
  await expect(page.getByTestId('parent-note-card')).not.toContainText('<b>')
  expect(await page.getByTestId('parent-note-card').locator('b').count()).toBe(0)
  await page.screenshot({ path: '/tmp/sh/note-home-ar.png', fullPage: true })
})

test('Arabic editor texts', async ({ page }) => {
  await open(page, 'ar', './#/kids/parent', { parent: true })
  await expect(page.getByTestId('parent-note-editor')).toContainText('رسالة لابنك أو بنتك')
  await page.getByTestId('parent-note-editor').screenshot({ path: '/tmp/sh/note-parent-ar.png' })
})

test('a broken saved note never breaks the kids home or the parent area', async ({ page }) => {
  await open(page, 'en', './#/kids', { parent: true, raw: { text: { x: 1 }, at: 'no' } })
  await expect(page.getByText('Jessica').first()).toBeVisible()
  await expect(page.getByTestId('parent-note-card')).toHaveCount(0)
  await page.goto('./#/kids/parent')
  await page.reload()
  await expect(page.getByTestId('parent-note-editor')).toBeVisible()
})
