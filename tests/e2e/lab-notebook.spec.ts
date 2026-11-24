import { test, expect } from '@playwright/test'

function seed(units: Array<{ id: string; title: string; startPage: number; endPage: number }>) {
  return `(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = { id: 'b1', title: 'العلوم', subject: 'Science', grade: 3, term: 'Term 1', pageCount: 40, custom: true, units: ${JSON.stringify(units)} }
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify({
      state: { onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: '', model: 'gemini-1.5-flash', xp: 100, streak: 1, coins: 0,
        customBooks: [book], completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {},
        settings: { language: 'ar', gradeLevel: 3, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false, sound: false, aiMode: 'cloud' } },
      version: 3 }))
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  })()`
}

test('predict, try, change one thing, compare, explain and save in the notebook (kids lab)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(seed([{ id: 'u1', title: 'دورة الماء في الطبيعة', startPage: 12, endPage: 18 }]))
  await page.goto('/#/kids/labs?lab=water&book=b1&unit=u1&page=12')
  const nb = page.getByTestId('lab-notebook')
  await expect(nb).toBeVisible()

  // next is locked until the child commits a prediction
  await expect(page.getByTestId('notebook-next')).toBeDisabled()
  await page.getByTestId('notebook-watching').fill('المطر')
  await page.getByTestId('notebook-predict-up').click()
  await page.getByTestId('notebook-next').click()

  await page.getByTestId('notebook-try1-down').click()
  await page.getByTestId('notebook-next').click()

  await page.getByTestId('notebook-changed').fill('الحرارة')
  await page.getByTestId('notebook-try2-up').click()
  await page.getByTestId('notebook-next').click()

  await expect(page.getByTestId('notebook-compare')).toBeVisible()
  await expect(page.getByTestId('notebook-verdict')).toContainText('مختلفة')
  await expect(page.getByTestId('notebook-save')).toBeDisabled()
  await page.getByTestId('notebook-explain').fill('لما الحرارة زادت المياه بخّرت أكتر')
  await nb.scrollIntoViewIfNeeded()
  await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/notebook-kids-mobile.png` : undefined })
  await page.getByTestId('notebook-save').click()
  await expect(page.getByTestId('notebook-saved')).toBeVisible()
  await expect(page.getByTestId('notebook-entry')).toContainText('المطر')
  await expect(page.getByTestId('notebook-entry')).toContainText('١٢')

  // it stays after a reload, on this device
  await page.reload()
  await expect(page.getByTestId('notebook-entry')).toHaveCount(1)
})

test('no notebook without a book unit', async ({ page }) => {
  await page.addInitScript(seed([{ id: 'u1', title: 'دورة الماء', startPage: 12, endPage: 18 }]))
  await page.goto('/#/kids/labs')
  await expect(page.getByTestId('lab-notebook')).toHaveCount(0)
})
