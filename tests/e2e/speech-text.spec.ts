import { test, expect } from '@playwright/test'
import { detectSpeechLang, normalizeForSpeech } from '../../src/lib/speechText'

test('Arabic text forces an Arabic voice even when the caller asked for English', () => {
  expect(detectSpeechLang('اقرأ الدرس ده بصوت عالي', 'en')).toBe('ar')
  expect(detectSpeechLang('Read this page out loud', 'en')).toBe('en')
})

test('the Arabic language is kept when the caller was right', () => {
  expect(detectSpeechLang('مرحبا بيك', 'ar')).toBe('ar')
  expect(detectSpeechLang('Bonjour', 'fr')).toBe('fr')
})

test('maths is spoken as words in Arabic, untouched elsewhere', () => {
  expect(normalizeForSpeech('٢ + ٢ = ٤')).toContain('يساوي')
  expect(normalizeForSpeech('٢ + ٢ = ٤')).toContain('زائد')
  expect(normalizeForSpeech('1 + 1 = 2')).toBe('1 + 1 = 2')
})
