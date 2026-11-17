import { test, expect } from '@playwright/test'

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
            language: 'ar',
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

async function openAllLabs(page: import('@playwright/test').Page) {
  await page.goto('/#/labs')
  await page.getByTestId('lab-filter-all').click()
}

test('the lab hub covers maths, science, biology, geography and English', async ({ page }) => {
  await openAllLabs(page)
  for (const name of ['معمل الكسور', 'معمل الهندسة', 'معمل خط الأعداد', 'معمل جدول الضرب', 'معمل الساعة', 'معمل الميزان', 'معمل النسبة المئوية', 'معمل الإحصاء', 'معمل القطع المكافئ', 'معمل الكثافة', 'معمل القوى', 'معمل الحرارة', 'معمل الصوت', 'معمل الرافعة', 'معمل الذرة', 'معمل التفاعلات', 'معمل الأحماض والقواعد', 'معمل الهضم', 'معمل الدورة الدموية', 'معمل النبات', 'معمل المجموعة الشمسية', 'خريطة مصر', 'معمل الإنجليزي', 'معمل العربي', 'معمل حالات المادة', 'معمل دورة المية', 'معمل المغناطيس']) {
    await expect(page.getByRole('button', { name: new RegExp(name) })).toBeVisible()
  }
})

test('fractions, density and atom respond to their controls', async ({ page }) => {
  await openAllLabs(page)

  await page.getByRole('button', { name: /معمل الكسور/ }).click()
  await page.getByTestId('fraction-d1').fill('4')
  await page.getByTestId('fraction-n1').fill('2')
  await expect(page.getByTestId('fraction-label-one')).toContainText('2/4')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل الكثافة/ }).click()
  await expect(page.getByTestId('density-result')).toContainText('بيطفو')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل الذرة/ }).click()
  await expect(page.getByTestId('atom-element')).toHaveText('C')
  await page.getByTestId('atom-electrons').fill('5')
  await expect(page.getByTestId('atom-charge')).toContainText('+1')
})

test('the map, parabola and English quiz work', async ({ page }) => {
  await openAllLabs(page)

  await page.getByRole('button', { name: /خريطة مصر/ }).click()
  await page.getByTestId('map-btn-sinai').click()
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل القطع المكافئ/ }).click()
  await expect(page.getByTestId('parabola-equation')).toContainText('x²')
  await page.getByTestId('parabola-a').fill('-1')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل الإنجليزي/ }).click()
  await expect(page.getByTestId('english-word')).toHaveText('Hello')
  await page.getByTestId('english-option').filter({ hasText: 'مرحبًا' }).click()
  await expect(page.getByTestId('english-feedback')).toBeVisible()
  await expect(page.getByTestId('english-score')).toContainText('1/6')
})

test('the reaction lab shows a precipitate and its equation', async ({ page }) => {
  await openAllLabs(page)
  await page.getByRole('button', { name: /معمل التفاعلات/ }).click()
  await page.getByTestId('reaction-a-silver').click()
  await page.getByTestId('reaction-b-salt').click()
  await expect(page.getByTestId('reaction-info')).toContainText('AgCl')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')
})


test('the stage filter narrows the labs to the right school stage', async ({ page }) => {
  await page.goto('/#/labs')
  // grade 7 is preparatory: primary labs are hidden by default
  await expect(page.getByRole('button', { name: /معمل الكسور/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /معمل الذرة/ })).toHaveCount(1)
  await page.getByTestId('lab-filter-primary').click()
  await expect(page.getByRole('button', { name: /معمل الكسور/ })).toHaveCount(1)
  await expect(page.getByRole('button', { name: /معمل الذرة/ })).toHaveCount(0)
  await page.getByTestId('lab-filter-all').click()
  await expect(page.getByRole('button', { name: /معمل الكسور/ })).toHaveCount(1)
  await expect(page.getByRole('button', { name: /معمل الذرة/ })).toHaveCount(1)
})

test('states, magnetism, number line and balance respond', async ({ page }) => {
  await openAllLabs(page)

  await page.getByRole('button', { name: /معمل حالات المادة/ }).click()
  await page.getByTestId('states-slider').fill('120')
  await expect(page.getByTestId('states-name')).toHaveText('غاز')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل المغناطيس/ }).click()
  await expect(page.getByTestId('magnet-state')).toHaveText('جذب')
  await page.getByTestId('magnet-flip').click()
  await expect(page.getByTestId('magnet-state')).toHaveText('تنافر')

  await page.getByRole('button', { name: /معمل خط الأعداد/ }).click()
  await page.getByTestId('number-start').fill('2')
  await page.getByTestId('number-step').fill('3')
  await expect(page.getByTestId('number-value')).toContainText('5')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل الميزان/ }).click()
  await page.getByTestId('balance-subtract').click()
  await page.getByTestId('balance-divide').click()
  await expect(page.getByTestId('balance-x')).toContainText('4')
})

test('the water cycle rains when the cloud fills', async ({ page }) => {
  await openAllLabs(page)
  await page.getByRole('button', { name: /معمل دورة المية/ }).click()
  await page.getByTestId('cycle-heat').fill('100')
  await expect(page.getByTestId('cycle-state')).toHaveText('بتمطر', { timeout: 15000 })
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')
})

test('the lab hub has 29 labs with subject filters and search', async ({ page }) => {
  await openAllLabs(page)
  await expect(page.getByTestId('lab-count')).toContainText('29')
  await page.getByTestId('lab-subject-Chemistry').click()
  await expect(page.getByTestId('lab-count')).toContainText('3')
  await expect(page.getByRole('button', { name: /معمل الكسور/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /معمل الذرة/ })).toHaveCount(1)
  await page.getByTestId('lab-subject-all').click()
  await page.getByTestId('lab-search').fill('الساعة')
  await expect(page.getByTestId('lab-count')).toContainText('1')
  await expect(page.getByRole('button', { name: /معمل الساعة/ })).toBeVisible()
  await page.getByTestId('lab-search').fill('')
  await expect(page.getByTestId('lab-count')).toContainText('29')
})

test('the primary labs build arrays, tell time, grow a plant and tour the planets', async ({ page }) => {
  await openAllLabs(page)

  await page.getByRole('button', { name: /معمل جدول الضرب/ }).click()
  await page.getByTestId('times-rows').fill('6')
  await page.getByTestId('times-cols').fill('4')
  await expect(page.getByTestId('times-product')).toHaveText('24')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل الساعة/ }).click()
  await page.getByTestId('clock-forward').click()
  await page.getByTestId('clock-forward').click()
  await expect(page.getByTestId('clock-digital')).toHaveText('9:30')

  await page.getByRole('button', { name: /معمل النبات/ }).click()
  await page.getByTestId('plants-light').fill('100')
  await page.getByTestId('plants-water').fill('100')
  await page.getByTestId('plants-co2').fill('100')
  await expect(page.getByTestId('plants-oxygen')).toContainText('8')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل المجموعة الشمسية/ }).click()
  await page.getByTestId('solar-neptune').click()
  await expect(page.getByTestId('solar-name')).toHaveText('نبتون')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')
})

test('the prep labs handle percentages, pH, heat, sound and statistics', async ({ page }) => {
  await openAllLabs(page)

  await page.getByRole('button', { name: /معمل النسبة المئوية/ }).click()
  await expect(page.getByTestId('percent-saving-value')).toContainText('100')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل الأحماض والقواعد/ }).click()
  await page.getByTestId('ph-bleach').click()
  await expect(page.getByTestId('ph-kind')).toContainText('قاعدة')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل الحرارة/ }).click()
  await page.getByTestId('heat-copper').click()
  await page.getByTestId('heat-time').fill('60')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل الصوت/ }).click()
  await page.getByTestId('sound-freq').fill('900')
  await page.getByTestId('sound-amp').fill('80')
  await expect(page.getByTestId('sound-pitch')).toHaveText('حدة عالية')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل الإحصاء/ }).click()
  for (let index = 0; index < 5; index += 1) {
    await page.getByTestId(`stats-value-${index}`).fill('6')
  }
  await expect(page.getByTestId('stats-mean-value')).toContainText('6.0')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')
})

test('the lever, Arabic grammar and circulation labs respond', async ({ page }) => {
  await openAllLabs(page)

  await page.getByRole('button', { name: /معمل الرافعة/ }).click()
  await expect(page.getByTestId('lever-state')).toHaveText('متوازن')
  await page.getByTestId('lever-effort-distance').fill('1')
  await expect(page.getByTestId('lever-state')).not.toHaveText('متوازن')

  await page.getByRole('button', { name: /معمل العربي/ }).click()
  await page.getByTestId('arabic-nominal').click()
  await expect(page.getByTestId('arabic-feedback')).toBeVisible()
  await page.getByTestId('arabic-sentence-1').click()
  await page.getByTestId('arabic-verbal').click()
  await page.getByTestId('arabic-sentence-2').click()
  await page.getByTestId('arabic-nominal').click()
  await expect(page.getByTestId('arabic-progress')).toHaveText('3 / 3')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')

  await page.getByRole('button', { name: /معمل الدورة الدموية/ }).click()
  await page.getByTestId('circulation-run').click()
  await expect(page.getByTestId('circulation-bpm')).toHaveText('150 bpm')
  await expect(page.getByTestId('lab-challenge')).toHaveAttribute('data-done', '1')
})
