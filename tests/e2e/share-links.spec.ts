import { test, expect } from '@playwright/test'
import { deflateSync, strToU8 } from 'fflate'

const questions = [
  { id: 'q1', subject: 'Social Studies', skill: 'Social Studies', prompt: 'Capital of Egypt?', options: ['Cairo', 'Aswan', 'Tanta', 'Giza'], answer: 0, explanation: '' },
  { id: 'q2', subject: 'Social Studies', skill: 'Social Studies', prompt: 'Longest river?', options: ['Nile', 'Amazon', 'Danube', 'Tigris'], answer: 0, explanation: '' },
]

const code = Buffer.from(
  deflateSync(strToU8(JSON.stringify({ title: 'Shared paper', subject: 'Social Studies', minutes: 10, questions }))),
).toString('base64url')

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem('jessica-profile-v1')) return
    const book = { id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }
    window.localStorage.setItem(
      'jessica-profile-v1',
      JSON.stringify({
        state: {
          onboarded: true,
          acceptedTerms: 1,
          name: 'Tester',
          apiKey: '',
          model: 'gemini-1.5-flash',
          xp: 100,
          streak: 1,
          coins: 0,
          customBooks: [book],
          completedTopics: [],
          skillStats: {},
          mistakes: [],
          dailyLog: {},
          settings: {
            language: 'en',
            gradeLevel: 7,
            curriculum: 'egypt',
            schoolType: 'government',
            primaryUi: 'auto',
            aiProvider: 'gemini',
            theme: 'dark',
            keyOptional: true,
            quickStart: false,
            sound: false,
            aiMode: 'cloud',
          },
        },
        version: 3,
      }),
    )
    window.localStorage.setItem('jessica-disclaimer-v1', '1')
  })
})

test('a paper can arrive through a link, with no server in between', async ({ page }) => {
  await page.goto(`/#/school-exam?share=${code}`)
  await expect(page.getByTestId('school-row')).toHaveCount(1)
  await expect(page.getByTestId('school-row')).toContainText('Shared paper')
})

test('the printed sheet carries a QR that opens its marking page', async ({ page }) => {
  await page.goto('/#/bank')
  await page.getByTestId('bank-print').click()
  await expect(page.getByTestId('sheet-qr')).toHaveCount(1)
  await expect(page.getByTestId('sheet-qr')).toHaveAttribute('src', /^data:image\/png;base64,/)
})

test('a sheet code in the URL opens its marking page straight away', async ({ page }) => {
  await page.addInitScript((qs) => {
    window.localStorage.setItem(
      'jessica-printed-papers-v1',
      JSON.stringify([{ id: 'paper_1', code: 'JP-TEST1', subject: 'Mathematics', at: Date.now(), questions: qs }]),
    )
  }, questions)

  await page.goto('/#/grade?code=JP-TEST1')
  await expect(page.getByTestId('grade-mark')).toBeVisible()
  await expect(page.getByText('JP-TEST1')).toBeVisible()
})
