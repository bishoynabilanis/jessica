import { test, expect } from '@playwright/test'

// Crash reports must not leave the device when the person turned them off.
async function boot(page: import('@playwright/test').Page, shareErrors: boolean) {
  await page.addInitScript((share) => {
    localStorage.setItem('jessica-profile-v1', JSON.stringify({ state: { onboarded: true, acceptedTerms: 1, name: 'T', apiKey: '', aiKeys: {}, customBooks: [{ id: 'b1', title: 'Science', subject: 'Science', grade: 9, term: 'Term 1', pageCount: 40, custom: true, units: [] }], completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {}, settings: { language: 'en', gradeLevel: 9, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false, sound: false, aiMode: 'cloud', shareErrors: share, shareCounts: false } }, version: 3 }))
    localStorage.setItem('jessica-disclaimer-v1', '1')
  }, shareErrors)
}

for (const share of [false, true]) {
  test(`crash reports are ${share ? 'sent' : 'not sent'} when the setting is ${share ? 'on' : 'off'}`, async ({ page }) => {
    let sent = 0
    await page.route('https://ntfy.sh/**', (route) => { sent += 1; return route.fulfill({ status: 200, body: '{}' }) })
    await boot(page, share)
    await page.goto('/')
    await page.waitForTimeout(500)
    await page.evaluate(() => { setTimeout(() => { throw new Error('test crash ' + Math.random()) }, 0) })
    await page.waitForTimeout(1200)
    expect(sent).toBe(share ? 1 : 0)
  })
}
