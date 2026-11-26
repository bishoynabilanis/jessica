import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { exportablePayload, sanitizeImport } from '../../src/lib/backupSafe'

const state = { xp: 10, name: 'A', aiKeys: { openai: 'sk-secret' }, apiKey: 'sk-secret', streak: 2, customBooks: [], settings: { language: 'en', gradeLevel: 3, theme: 'dark' }, save: () => 1 }

test('export drops both AI key fields and functions', () => {
  const out = exportablePayload(state)
  expect(out).not.toHaveProperty('apiKey')
  expect(out).not.toHaveProperty('aiKeys')
  expect(out).not.toHaveProperty('save')
  expect(out).toMatchObject({ xp: 10, name: 'A' })
})

test('import keeps only known fields with the same type, and never keys', () => {
  const out = sanitizeImport(
    {
      xp: 99,
      streak: 'lots',
      name: 7,
      unknownField: 1,
      aiKeys: { openai: 'evil' },
      apiKey: 'evil',
      customBooks: [{ id: 'x' }],
      settings: { language: 'ar', gradeLevel: 'high', brandNew: true, theme: 'light' },
      ['__proto__']: { polluted: true },
    },
    state,
  )
  expect(out).toEqual({ xp: 99, customBooks: [{ id: 'x' }], settings: { language: 'ar', theme: 'light' } })
  expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  expect(sanitizeImport('nope', state)).toEqual({})
  expect(sanitizeImport([1, 2], state)).toEqual({})
  expect(sanitizeImport({ xp: Infinity }, state)).toEqual({})
})

async function open(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    window.localStorage.setItem(
      'jessica-profile-v1',
      JSON.stringify({
        state: {
          onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: 'sk-live-secret', aiKeys: { gemini: 'sk-live-secret', openai: 'sk-other-secret', anthropic: '', openrouter: '', custom: '' },
          model: 'gemini-1.5-flash', xp: 120, streak: 3, customBooks: [{ id: 'b1', title: 'Science', subject: 'Science', grade: 9, term: 'Term 1', pageCount: 40, custom: true, units: [] }], completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {},
          settings: { language: 'en', gradeLevel: 9, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false, sound: false, aiMode: 'cloud' },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  })
  await page.goto('./#/settings')
}

test('in the app: the exported file has no AI keys, and a hostile file cannot set them or break the profile', async ({ page }) => {
  await open(page)
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export backup' }).click()])
  const text = readFileSync((await download.path()) as string, 'utf8')
  expect(text).not.toContain('sk-live-secret')
  expect(text).not.toContain('sk-other-secret')
  expect(text).not.toContain('aiKeys')
  expect(JSON.parse(text).data.xp).toBeGreaterThanOrEqual(120)

  const hostile = { app: 'jessica', data: { xp: 500, streak: 'many', aiKeys: { gemini: 'attacker-key' }, apiKey: 'attacker-key', settings: { language: 'ar', gradeLevel: { a: 1 } } } }
  await page.locator('input[type=file][accept*="json"]').nth(1).setInputFiles({ name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(hostile)) })
  await expect.poll(async () => (await page.evaluate(() => JSON.parse(localStorage.getItem('jessica-profile-v1') || '{}').state)).xp).toBe(500)
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('jessica-profile-v1') || '{}').state)
  expect(saved.streak).toBe(3)
  expect(saved.apiKey).toBe('sk-live-secret')
  expect(JSON.stringify(saved.aiKeys)).not.toContain('attacker-key')
  expect(saved.settings.language).toBe('ar')
  expect(saved.settings.gradeLevel).toBe(9)
})
