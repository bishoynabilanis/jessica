import { test, expect } from '@playwright/test'

const seed = () => {
  if (window.localStorage.getItem('jessica-profile-v1')) return
  const book = { id: 'b1', title: 'Maths', subject: 'Mathematics', grade: 7, term: 'Term 1', pageCount: 30, custom: true, units: [] }
  window.localStorage.setItem(
    'jessica-profile-v1',
    JSON.stringify({
      state: {
        onboarded: true,
        acceptedTerms: 1,
        name: 'Mina',
        apiKey: '',
        model: 'gemini-1.5-flash',
        xp: 480,
        streak: 4,
        coins: 12,
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
        },
      },
      version: 3,
    }),
  )
  window.localStorage.setItem('jessica-disclaimer-v1', '1')
}

const readState = () => {
  const raw = window.localStorage.getItem('jessica-profile-v1')
  return raw ? JSON.parse(raw).state : null
}

test('a second child gets a separate progress and comes back untouched', async ({ page }) => {
  await page.addInitScript(seed)
  await page.goto('/#/profiles')

  await expect(page.getByText('More than one child on the same device')).toBeVisible()
  await expect(page.getByTestId('profile-row')).toHaveCount(1)

  await page.getByTestId('profile-add-toggle').click()
  await page.getByLabel('The child’s name').fill('Adam')
  await page.getByTestId('profile-add-save').click()

  await expect(page.getByTestId('profile-row')).toHaveCount(2)

  // switch to the new child: the app reloads with his own blank progress
  await page.getByTestId('profile-switch').click()
  await page.waitForFunction(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    return !!raw && JSON.parse(raw).state?.name === 'Adam'
  })
  let state = await page.evaluate(readState)
  expect(state.name).toBe('Adam')
  expect(state.xp).toBeLessThan(60) // a fresh profile only gets the daily bonus, not 480

  // give him some points, then switch back
  await page.evaluate(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    const blob = JSON.parse(raw)
    blob.state.xp = 90
    window.localStorage.setItem('jessica-profile-v1', JSON.stringify(blob))
  })
  await page.goto('/#/profiles')
  await expect(page.getByTestId('profile-row')).toHaveCount(2)
  await page.getByTestId('profile-switch').first().click()
  await page.waitForFunction(() => {
    const raw = window.localStorage.getItem('jessica-profile-v1')
    return !!raw && JSON.parse(raw).state?.name === 'Mina'
  })

  state = await page.evaluate(readState)
  expect(state.name).toBe('Mina')
  expect(state.xp).toBeGreaterThanOrEqual(480)

  // and the second child kept his own points
  const slots = await page.evaluate(() => {
    const registry = JSON.parse(window.localStorage.getItem('jessica-profiles-v1') || '{}')
    const other = registry.slots.find((slot: { name: string }) => slot.name === 'Adam')
    const blob = JSON.parse(window.localStorage.getItem(`jessica-slot-${other.id}`) || '{}')
    return blob.state?.xp
  })
  expect(slots).toBeGreaterThanOrEqual(90)
})
