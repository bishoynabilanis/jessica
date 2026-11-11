import { useEffect, useMemo, useState } from 'react'
import { Loader2, Mic, RotateCcw, Square, Volume2 } from 'lucide-react'
import type { ChapterText } from '@/types'
import { useApp } from '@/store/useApp'
import { openChapter } from '@/lib/library'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useDictation, useSpeech } from '@/lib/speech'
import { cn, pct } from '@/lib/utils'
import { tr } from '@/i18n'

function normalizeWords(text: string) {
  return text
    .normalize('NFKC')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1)
}

export function ReadingCoach() {
  const customBooks = useApp((s) => s.customBooks)
  const [bookId, setBookId] = useState(customBooks[0]?.id || '')
  const [unitId, setUnitId] = useState('')
  const [chapter, setChapter] = useState<ChapterText | undefined>()
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [startedAt, setStartedAt] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<{ wpm: number; accuracy: number; missed: string[]; heard: string } | null>(null)
  const { speak } = useSpeech()
  const book = customBooks.find((item) => item.id === bookId)
  const units = book?.units || []
  const unit = units.find((item) => item.id === unitId) || units[0]

  const dictation = useDictation(book?.language || 'en', (text) => {
    setTranscript((prev) => `${prev} ${text}`.trim())
  })

  useEffect(() => {
    if (!customBooks.some((item) => item.id === bookId)) setBookId(customBooks[0]?.id || '')
  }, [customBooks, bookId])
  useEffect(() => {
    if (!units.some((item) => item.id === unitId)) setUnitId(units[0]?.id || '')
  }, [units, unitId])

  useEffect(() => {
    if (!book) return
    let alive = true
    setLoading(true)
    openChapter(book)
      .then((text) => alive && setChapter(text))
      .catch(() => undefined)
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [book?.id])

  useEffect(() => {
    if (!recording) return
    const timer = window.setInterval(() => setElapsed(Math.round((Date.now() - startedAt) / 1000)), 500)
    return () => window.clearInterval(timer)
  }, [recording, startedAt])

  const passage = useMemo(() => {
    if (!chapter || !unit) return ''
    const pages = chapter.pages.filter((page) => page.page >= unit.startPage && page.page <= unit.endPage)
    return pages
      .slice(0, 2)
      .map((page) => page.text)
      .join(' ')
      .replace(/\[Page \d+\]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 900)
  }, [chapter, unit])

  const start = () => {
    setTranscript('')
    setResult(null)
    setStartedAt(Date.now())
    setElapsed(0)
    setRecording(true)
    if (!dictation.start()) {
      setRecording(false)
      setResult({ wpm: 0, accuracy: 0, missed: [], heard: tr('Speech recognition is not available in this browser.') })
    }
  }

  const stop = () => {
    dictation.stop()
    setRecording(false)
    const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    const target = normalizeWords(passage)
    const heardWords = normalizeWords(transcript)
    const heardSet = new Set(heardWords)
    const matched = target.filter((word) => heardSet.has(word))
    const missed = [...new Set(target.filter((word) => !heardSet.has(word)))].slice(0, 24)
    setResult({
      wpm: Math.round((heardWords.length / seconds) * 60),
      accuracy: target.length ? pct(matched.length, target.length) : 0,
      missed,
      heard: transcript,
    })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Fluency coach')}
        title={tr('Read out loud, get a score')}
        subtitle={tr('Read the passage aloud. Jessica measures speed, accuracy and the words you missed — all in your browser.')}
        icon={<Mic className="h-5 w-5" />}
      />

      {!customBooks.length ? (
        <Card className="p-6 text-center text-xs font-bold text-main">{tr('Import a book first.')}</Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Card className="p-4 sm:p-5">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <label className="block">
                <span className="label mb-1 block">{tr('Book')}</span>
                <select value={bookId} onChange={(e) => setBookId(e.target.value)} className="field text-xs">
                  {customBooks.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label mb-1 block">{tr('Unit')}</span>
                <select value={unit?.id || ''} onChange={(e) => setUnitId(e.target.value)} className="field text-xs">
                  {units.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3 rounded-2xl border border-line bg-card-2 p-4">
              {loading ? (
                <p className="flex items-center gap-2 text-xs font-bold text-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-aurora-300" /> {tr('Opening the page…')}
                </p>
              ) : passage ? (
                <p className="text-[15px] font-medium leading-8 text-main" dir="auto">
                  {passage}
                </p>
              ) : (
                <p className="text-xs text-muted">{tr('No readable text for this unit.')}</p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => speak(passage)} disabled={!passage}>
                <Volume2 className="h-4 w-4" /> {tr('Hear it first')}
              </Button>
              {!recording ? (
                <Button onClick={start} disabled={!passage || !dictation.supported}>
                  <Mic className="h-4 w-4" /> {tr('Start reading')}
                </Button>
              ) : (
                <Button variant="secondary" onClick={stop}>
                  <Square className="h-4 w-4" /> {tr('Stop and score')}
                </Button>
              )}
              {recording && (
                <span className="chip border-coral/30 bg-coral/10 text-coral">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-coral" /> {elapsed}s
                </span>
              )}
              {!dictation.supported && <span className="text-[10px] text-coral">{tr('Speech recognition is not available in this browser.')}</span>}
            </div>

            {(dictation.interim || transcript) && (
              <p className="mt-2 max-h-20 overflow-y-auto rounded-xl border border-line bg-card-2 p-2 text-[10px] text-muted" dir="auto">
                {transcript} {dictation.interim}
              </p>
            )}
          </Card>

          <Card className="p-4 sm:p-5">
            <p className="text-sm font-extrabold text-main">{tr('Your score')}</p>
            {!result ? (
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                {tr('Tap Start reading, read the passage out loud, then stop to see your speed and accuracy.')}
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-line bg-card-2 p-3 text-center">
                    <p className="font-display text-2xl font-extrabold text-main">{result.wpm}</p>
                    <p className="text-[9px] font-bold text-muted">{tr('words / minute')}</p>
                  </div>
                  <div className="rounded-2xl border border-line bg-card-2 p-3 text-center">
                    <p className={cn('font-display text-2xl font-extrabold', result.accuracy >= 80 ? 'text-aurora-300' : result.accuracy >= 50 ? 'text-sun' : 'text-coral')}>
                      {result.accuracy}%
                    </p>
                    <p className="text-[9px] font-bold text-muted">{tr('accuracy')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-main">{tr('Words to practise')}</p>
                  {result.missed.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {result.missed.map((word) => (
                        <button
                          key={word}
                          onClick={() => speak(word, book?.language || 'en')}
                          className="rounded-lg border border-coral/25 bg-coral/10 px-1.5 py-0.5 text-[10px] font-semibold text-coral"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-[11px] text-aurora-300">{tr('No missed words — excellent!')}</p>
                  )}
                </div>

                {result.heard && (
                  <p className="rounded-xl border border-line bg-card-2 p-2 text-[10px] text-muted" dir="auto">
                    {tr('Jessica heard')}: {result.heard.slice(0, 240)}
                  </p>
                )}

                <Button variant="secondary" size="sm" onClick={() => setResult(null)}>
                  <RotateCcw className="h-3.5 w-3.5" /> {tr('Try again')}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
