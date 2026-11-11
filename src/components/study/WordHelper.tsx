import { useEffect, useState } from 'react'
import { Loader2, Sparkles, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/store/useApp'
import { generateText } from '@/lib/gemini'
import { kvGet, kvSet } from '@/lib/db'
import { lookupWord } from '@/data/wordbank'
import { useSpeech } from '@/lib/speech'
import { tr } from '@/i18n'

interface WordHelp {
  word: string
  sentence: string
  language: string
  onClose: () => void
}

export function WordHelper({ word, sentence, language, onClose }: WordHelp) {
  const { apiKey, model } = useApp()
  const { speak } = useSpeech()
  const local = lookupWord(word)
  const [meaning, setMeaning] = useState(local)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const arabicWord = /[\u0600-\u06FF]/.test(word)
  const speechLang = arabicWord ? 'ar' : language || 'en'

  useEffect(() => {
    setMeaning(local)
    setFailed(false)
    if (local || !apiKey || arabicWord) return
    let alive = true
    const cacheKey = `word:${word.toLowerCase()}`
    setLoading(true)
    kvGet<{ meaning: string }>(cacheKey)
      .then((hit) => {
        if (hit?.meaning) {
          if (alive) setMeaning(hit.meaning)
          return
        }
        return generateText({
          apiKey,
          model,
          system: 'You explain single words to a 9-year-old Egyptian child. Reply in Arabic only, very simply.',
          parts: [
            {
              text: `Explain the word "${word}" in one short Arabic sentence for a 9-year-old, then a tiny example. Context: "${sentence.slice(0, 500)}". Max 25 words. No markdown.`,
            },
          ],
          temperature: 0.3,
          maxOutputTokens: 120,
        }).then((text) => {
          const clean = text.trim()
          if (alive && clean) {
            setMeaning(clean)
            kvSet(cacheKey, { meaning: clean }).catch(() => undefined)
          }
        })
      })
      .catch(() => {
        if (alive) setFailed(true)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word, apiKey, model])

  return (
    <Modal
      open
      onClose={onClose}
      title={tr('Word helper')}
      subtitle={tr('Tap play, then use it in the sentence.')}
      icon={<Sparkles className="h-4.5 w-4.5" />}
      size="sm"
    >
      <div className="text-center">
        <p className="font-display text-3xl font-extrabold text-main" dir="auto">
          {word}
        </p>
        <Button
          size="sm"
          className="mt-3"
          onClick={() => speak(word, speechLang)}
        >
          <Volume2 className="h-4 w-4" /> {tr('Say the word')}
        </Button>

        <div className="mt-4 rounded-2xl border border-line bg-card-2 p-3 text-start">
          {loading ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-aurora-300" /> {tr('Looking up the meaning…')}
            </p>
          ) : meaning ? (
            <p className="text-sm font-semibold leading-relaxed text-main">
              {arabicWord ? tr('In English: {meaning}', { meaning }) : tr('In Arabic: {meaning}', { meaning })}
            </p>
          ) : (
            <p className="text-[11px] leading-relaxed text-muted">
              {failed || !apiKey
                ? tr('No ready meaning for this word yet. Ask a grown-up or Jessica in the reader.')
                : tr('No ready meaning for this word yet.')}
            </p>
          )}
        </div>

        <div className="mt-3 rounded-2xl border border-sun/25 bg-sun/10 p-3 text-start">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">{tr('In the story')}</p>
          <p className="mt-1 line-clamp-3 text-[11px] font-medium leading-relaxed text-main" dir="auto">
            {sentence}
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-2"
            onClick={() => speak(sentence, speechLang)}
          >
            <Volume2 className="h-3.5 w-3.5" /> {tr('Hear the sentence')}
          </Button>
        </div>

        <Button variant="ghost" className="mt-3 w-full" onClick={onClose}>
          {tr('Close')}
        </Button>
      </div>
    </Modal>
  )
}
