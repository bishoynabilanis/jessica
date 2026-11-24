import { test, expect } from '@playwright/test'

function seed(grade: number) {
  return () => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = {
      id: 'b1', title: 'Science', subject: 'Science', grade: GRADE, term: 'Term 1', pageCount: 40, custom: true,
      units: [
        { id: 'u1', title: 'الكسور المتكافئة', startPage: 12, endPage: 18 },
        { id: 'u2', title: 'درس بدون معمل', startPage: 19, endPage: 22 },
      ],
    }
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify({
      state: {
        onboarded: true, acceptedTerms: 1, name: 'Tester', apiKey: '', model: 'gemini-1.5-flash', xp: 100, streak: 1, coins: 0,
        customBooks: [book], completedTopics: [], skillStats: {}, mistakes: [], dailyLog: {},
        settings: { language: 'ar', gradeLevel: GRADE, curriculum: 'egypt', schoolType: 'government', primaryUi: 'auto', aiProvider: 'gemini', theme: 'dark', keyOptional: true, quickStart: false, sound: false, aiMode: 'cloud' },
      },
      version: 3,
    }))
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  }
}
const init = (grade: number) => `(${seed(grade).toString().replace(/GRADE/g, String(grade))})()`

test('a prep lesson opens the matching lab with the goal and page number', async ({ page }) => {
  await page.addInitScript(init(7))
  await page.goto('/#/lesson/b1/u1')
  await page.getByTestId('lesson-open-lab').click()
  await expect(page).toHaveURL(/#\/labs\?lab=fractions/)
  const banner = page.getByTestId('lesson-lab-banner')
  await expect(banner).toContainText('الكسور المتكافئة')
  await expect(banner).toContainText('١٢')
  await expect(page.getByText('معمل الكسور').first()).toBeVisible()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/lab-desktop.png` : undefined })
  await page.getByTestId('lesson-lab-page').click()
  await expect(page).toHaveURL(/#\/reader\/b1\?page=12/)
  await page.goBack()
  await page.getByTestId('lesson-lab-back').click()
  await expect(page).toHaveURL(/#\/lesson\/b1\/u1/)
})

test('a lesson with no matching lab shows no lab button', async ({ page }) => {
  await page.addInitScript(init(7))
  await page.goto('/#/lesson/b1/u2')
  await expect(page.getByTestId('lesson-video')).toBeVisible()
  await expect(page.getByTestId('lesson-open-lab')).toHaveCount(0)
})

test('kids on a phone get the lab from the lesson and nothing else crowds it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(init(3))
  await page.goto('/#/kids/lesson/b1?unit=u1')
  await page.getByTestId('lesson-open-lab').click()
  await expect(page).toHaveURL(/kids\/labs\?lab=fractions/)
  await expect(page.getByTestId('lesson-lab-banner')).toContainText('الكسور المتكافئة')
  await expect(page.getByText('نص البيتزا').or(page.getByText('كسور البيتزا')).first()).toBeVisible()
  await page.waitForTimeout(500)
  await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/lab-kids-mobile.png` : undefined })
  await page.getByTestId('lesson-lab-back').click()
  await expect(page).toHaveURL(/kids\/lesson\/b1\?unit=u1/)
})
