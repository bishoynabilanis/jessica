import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Gift,
  Loader2,
  Mic,
  Sparkles,
  Star,
  Volume2,
  X,
  XCircle,
} from 'lucide-react'
import type { ChapterText, QuizQuestion } from '@/types'
import { useApp, levelInfo } from '@/store/useApp'
import { openChapter } from '@/lib/library'
import { getQuizzes, saveQuiz } from '@/lib/db'
import { generateJSON } from '@/lib/gemini'
import { quizPrompt } from '@/lib/prompts'
import { Mascot } from '@/components/Mascot'
import { WordHelper } from '@/components/study/WordHelper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { giftStickers } from '@/data/kids'
import { useDictation, speakable, useSpeech } from '@/lib/speech'
import { cn, shuffle } from '@/lib/utils'
import { tr } from '@/i18n'

const STEP_LABELS = ['Read', 'Play', 'Reward'] as const

function localQuestions(text: string): QuizQuestion[] {
  const words = [...new Set((text.match(/[A-Za-z\u0600-\u06FF]{4,12}/g) || []).map((word) => word.trim()))].slice(0, 40)
  const pool = /[\u0600-\u06FF]/.test(text)
    ? ['مدرسة', 'حديقة', 'قمر', 'تفاحة', 'شمس', 'كتاب', 'مطر', 'طائر']
    : ['elephant', 'rocket', 'kitchen', 'ocean', 'garden', 'pencil', 'window', 'rabbit']
  const present = new Set(words.map((word) => word.toLowerCase()))
  const distractors = pool.filter((word) => !present.has(word.toLowerCase()))
  const picks = words.filter((word) => !pool.map((p) => p.toLowerCase()).includes(word.toLowerCase())).slice(0, 2)
  return picks.map((word) => {
    const options = shuffle([word, ...shuffle(distractors).slice(0, 3)])
    return {
      question: tr('Which word did you see in the lesson?'),
      options,
      answer: options.indexOf(word),
      explanation: tr('This word appears in the pages you just read.'),
      topic: tr('Reading'),
    }
  })
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function KidsLesson() {
  const { bookId = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const customBooks = useApp((s) => s.customBooks)
  const apiKey = useApp((s) => s.apiKey)
  const model = useApp((s) => s.model)
  const settings = useApp((s) => s.settings)
  const addXP = useApp((s) => s.addXP)
  const recordSkill = useApp((s) => s.recordSkill)
  const lessonProgress = useApp((s) => s.lessonProgress)
  const setLessonStep = useApp((s) => s.setLessonStep)
  const completeLesson = useApp((s) => s.completeLesson)
  const lessonChest = useApp((s) => s.lessonChest)
  const openLessonChest = useApp((s) => s.openLessonChest)
  const xp = useApp((s) => s.xp)
  const { speak } = useSpeech()
  const { level } = levelInfo(xp)

  const book = customBooks.find((item) => item.id === bookId)
  const units = book?.units || []
  const requested = params.get('unit')
  const unit = units.find((item) => item.id === requested) || units[0]
  const unitKey = book ? `${book.id}:${unit?.id || 'all'}` : ''
  const progress = lessonProgress[unitKey]
  const alreadyDone = !!progress?.done
  const chestOpened = !!lessonChest[unitKey]

  const [chapter, setChapter] = useState<ChapterText | undefined>()
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [preparing, setPreparing] = useState(false)
  const [rewarded, setRewarded] = useState(false)
  const [helper, setHelper] = useState<{ word: string; sentence: string } | null>(null)
  const [heard, setHeard] = useState('')
  const [activeSentence, setActiveSentence] = useState(-1)
  const [reading, setReading] = useState(false)
  const [chestResult, setChestResult] = useState<{ stars: number; sticker?: string } | null>(null)
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)

  const dictation = useDictation(book?.language || 'en', (text) => {
    setHeard(text)
    const current = questions[qIndex]
    if (!current || picked !== null) return
    const spoken = normalize(text)
    let best = -1
    let bestScore = 0
    current.options.forEach((option, index) => {
      const candidate = normalize(option)
      const overlap = candidate.split(' ').filter((token) => spoken.includes(token)).length
      if (overlap > bestScore) {
        bestScore = overlap
        best = index
      }
    })
    if (best >= 0 && bestScore > 0) {
      setPicked(best)
      if (best === current.answer) setScore((value) => value + 1)
    }
  })

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
    if (progress) setStep(Math.min(progress.step, 2))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitKey])

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  const unitChapter = useMemo(() => {
    if (!book || !chapter) return undefined
    if (!unit) return chapter
    const pages = chapter.pages.filter((page) => page.page >= unit.startPage && page.page <= unit.endPage)
    return {
      bookId: `${book.id}:${unit.id}`,
      pages,
      text: pages.map((page) => `[Page ${page.page}]\n${page.text}`).join('\n\n'),
      extractedAt: Date.now(),
    } as ChapterText
  }, [book, chapter, unit])

  const readingText = useMemo(() => {
    if (!unitChapter) return ''
    return unitChapter.pages
      .slice(0, 2)
      .map((page) => page.text)
      .join('\n\n')
      .replace(/\[Page \d+\]/g, '')
      .slice(0, 1100)
  }, [unitChapter])

  const sentences = useMemo(() => {
    const parts = readingText.split(/(?<=[.!?؟])\s+|\n+/).map((part) => part.trim()).filter(Boolean)
    let cursor = 0
    return parts.map((text) => {
      const start = readingText.indexOf(text, cursor)
      const at = start >= 0 ? start : cursor
      cursor = at + text.length
      return { text, start: at, end: at + text.length }
    })
  }, [readingText])

  const stopReading = () => {
    window.speechSynthesis?.cancel()
    setReading(false)
    setActiveSentence(-1)
  }

  const readAloud = () => {
    if (reading) {
      stopReading()
      return
    }
    if (!readingText || typeof window === 'undefined' || !window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(readingText)
    const lang = book?.language === 'ar' ? 'ar-EG' : book?.language === 'fr' ? 'fr-FR' : book?.language === 'de' ? 'de-DE' : 'en-US'
    utter.lang = lang
    utter.rate = settings.ttsRate || 0.95
    utter.onboundary = (event) => {
      if (typeof event.charIndex !== 'number') return
      const index = sentences.findIndex((sentence) => event.charIndex >= sentence.start && event.charIndex < sentence.end)
      if (index >= 0) setActiveSentence(index)
    }
    utter.onend = () => {
      setReading(false)
      setActiveSentence(-1)
    }
    utter.onerror = () => {
      setReading(false)
      setActiveSentence(-1)
    }
    utterance.current = utter
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
    setReading(true)
  }

  const prepareQuestions = async () => {
    if (!book || !unitChapter) return
    setPreparing(true)
    try {
      const bank = (await getQuizzes()).find((quiz) => quiz.id === unitKey)
      if (bank?.questions?.length) {
        setQuestions(bank.questions.slice(0, 2))
        return
      }
      if (apiKey) {
        const data = await generateJSON<{ questions: QuizQuestion[] }>({
          apiKey,
          model,
          system: 'You write very simple, playful quizzes for a 9-year-old. Return only JSON.',
          parts: [{ text: quizPrompt(book, unitChapter, 3) }],
          temperature: 0.5,
          maxOutputTokens: 1200,
        })
        const clean = (data.questions || []).filter(
          (q) => q.question && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer),
        )
        if (clean.length) {
          await saveQuiz({ id: unitKey, bookId: book.id, subject: book.subject, questions: clean, createdAt: Date.now() }).catch(() => undefined)
          setQuestions(clean.slice(0, 2))
          return
        }
      }
      setQuestions(localQuestions(readingText).slice(0, 2))
    } catch {
      setQuestions(localQuestions(readingText).slice(0, 2))
    } finally {
      setPreparing(false)
    }
  }

  const goToStep = (next: number) => {
    setStep(next)
    if (unitKey) setLessonStep(unitKey, next)
    if (next === 1 && questions.length === 0) void prepareQuestions()
    if (next === 2) {
      stopReading()
      if (!alreadyDone && !rewarded) {
        setRewarded(true)
        addXP(15, true)
        completeLesson(unitKey)
      }
    }
  }

  const answer = (index: number) => {
    if (picked !== null || !questions[qIndex]) return
    dictation.stop()
    setPicked(index)
    recordSkill(book?.subject || 'General', questions[qIndex].topic || tr('General'), index === questions[qIndex].answer)
    if (index === questions[qIndex].answer) setScore((value) => value + 1)
  }

  const nextQuestion = () => {
    if (picked === null) return
    if (qIndex + 1 < questions.length) {
      setQIndex((index) => index + 1)
      setPicked(null)
      setHeard('')
    } else {
      goToStep(2)
    }
  }

  const openChest = () => {
    const result = openLessonChest(unitKey)
    if (result) setChestResult(result)
  }

  if (!book) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm font-extrabold text-main">{tr('Book not found')}</p>
        <Button className="mt-3" onClick={() => navigate('/kids/library')}>
          {tr('Open my books')}
        </Button>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="flex items-center justify-center gap-2 p-8 text-sm font-bold text-muted">
        <Loader2 className="h-5 w-5 animate-spin text-sun" /> {tr('Opening your book…')}
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/kids')}
          className="grid h-9 w-9 place-items-center rounded-xl border-2 border-white bg-white text-ink-700"
          aria-label={tr('Back')}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-ink-950">{unit?.title || book.title}</p>
          <p className="text-[10px] font-semibold text-ink-600">{tr('A 5-minute lesson')}</p>
        </div>
        <div className="flex items-center gap-1">
          {STEP_LABELS.map((label, index) => (
            <span
              key={label}
              className={cn(
                'grid h-7 w-7 place-items-center rounded-full text-[10px] font-black',
                index <= step ? 'bg-sun text-ink-950' : 'bg-black/10 text-ink-600',
              )}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>

      {step === 0 && (
        <Card className="border-2 border-white p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-amber-700">{tr('Step 1 · Read')}</p>
          <h1 className="mt-1 font-display text-xl font-extrabold text-ink-950">{unit?.title || book.title}</h1>

          <div className="mt-3 max-h-[50vh] overflow-y-auto rounded-2xl border border-sun/20 bg-sun/5 p-4">
            {readingText ? (
              <p className="text-[16px] font-medium leading-9 text-ink-900">
                {sentences.map((sentence, index) => (
                  <span
                    key={`${sentence.start}-${index}`}
                    className={cn('rounded-md transition-colors', activeSentence === index && 'bg-sun/40')}
                  >
                    {sentence.text.split(/(\s+)/).map((token, tokenIndex) => {
                      const clean = token.replace(/[^\p{L}\p{N}'-]/gu, '')
                      if (!clean) return <span key={tokenIndex}>{token}</span>
                      return (
                        <button
                          key={tokenIndex}
                          onClick={() => setHelper({ word: clean, sentence: sentence.text })}
                          className="rounded px-0.5 align-baseline hover:bg-sun/30"
                        >
                          {token}
                        </button>
                      )
                    })}{' '}
                  </span>
                ))}
              </p>
            ) : (
              <p className="text-xs font-semibold text-ink-600">{tr('This unit has no readable text. Try another book.')}</p>
            )}
          </div>

          <p className="mt-2 text-center text-[9px] font-semibold text-ink-500">
            {tr('Tap any word to hear it and see its meaning.')}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={readAloud} disabled={!readingText}>
              <Volume2 className="h-4 w-4" /> {reading ? tr('Stop') : tr('Read to me')}
            </Button>
            <Button className="ms-auto" onClick={() => goToStep(1)}>
              {tr('I read it')} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {alreadyDone && (
            <p className="mt-2 text-center text-[10px] font-bold text-aurora-600">
              {tr('You finished this lesson before. Repeating it makes it stick!')}
            </p>
          )}
        </Card>
      )}

      {step === 1 && (
        <Card className="border-2 border-white p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-amber-700">{tr('Step 2 · Play')}</p>
          {preparing ? (
            <div className="flex flex-col items-center gap-2 py-10 text-xs font-bold text-ink-600">
              <Loader2 className="h-6 w-6 animate-spin text-sun" />
              {tr('Getting your questions ready…')}
            </div>
          ) : questions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm font-extrabold text-ink-950">{tr('No questions for this unit yet')}</p>
              <Button className="mt-3" onClick={() => goToStep(2)}>
                {tr('Skip to my reward')}
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-ink-600">
                <span>{tr('Question {n} of {m}', { n: qIndex + 1, m: questions.length })}</span>
                <span>⭐ {score}</span>
              </div>
              <h2 className="mt-2 text-lg font-extrabold leading-relaxed text-ink-950">{questions[qIndex].question}</h2>

              <div className="mt-3 grid gap-2">
                {questions[qIndex].options.map((option, index) => {
                  const correct = index === questions[qIndex].answer
                  const chosen = picked === index
                  return (
                    <button
                      key={`${option}-${index}`}
                      onClick={() => answer(index)}
                      disabled={picked !== null}
                      className={cn(
                        'flex items-center gap-2 rounded-2xl border-2 p-3 text-start text-sm font-bold transition',
                        picked === null
                          ? 'border-white bg-white hover:border-sun/50'
                          : correct
                            ? 'border-aurora-400 bg-aurora-400/15 text-ink-950'
                            : chosen
                              ? 'border-coral bg-coral/10 text-ink-950'
                              : 'border-line bg-white/60 text-ink-600',
                      )}
                    >
                      {picked !== null && correct && <CheckCircle2 className="h-4 w-4 shrink-0 text-aurora-600" />}
                      {picked !== null && chosen && !correct && <XCircle className="h-4 w-4 shrink-0 text-coral" />}
                      {option}
                    </button>
                  )
                })}
              </div>

              {picked === null && dictation.supported && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-white/70 p-2.5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-ink-700">{tr('You can say the answer out loud')}</p>
                    <p className="truncate text-[9px] text-ink-500">{heard || dictation.interim || tr('Tap the mic and speak')}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={dictation.listening ? 'primary' : 'secondary'}
                    onClick={() => (dictation.listening ? dictation.stop() : dictation.start())}
                  >
                    <Mic className="h-3.5 w-3.5" /> {dictation.listening ? tr('Listening…') : tr('Speak')}
                  </Button>
                </div>
              )}

              {picked !== null && (
                <div className="mt-3 rounded-2xl border border-sun/30 bg-sun/10 p-3">
                  <p className="text-[11px] font-semibold text-ink-800">{questions[qIndex].explanation}</p>
                  <Button className="mt-2 w-full" onClick={nextQuestion}>
                    {qIndex + 1 < questions.length ? tr('Next question') : tr('Get my reward')} <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {step === 2 && (
        <Card className="relative overflow-hidden border-2 border-sun/40 bg-gradient-to-b from-sun/20 via-white to-aurora-400/15 p-6 text-center">
          <div className="flex justify-center gap-1 text-2xl">
            <span className="kids-bob">🎉</span>
            <span className="kids-bob">⭐</span>
            <span className="kids-bob">🎈</span>
          </div>
          <div className="mx-auto mt-2 w-fit">
            <Mascot xp={xp} size={150} mood="celebrate" />
          </div>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-ink-950">{tr('You finished the lesson!')}</h2>
          <p className="mt-1 text-sm font-semibold text-ink-700">{tr('15 stars for you · Level {n}', { n: level })}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="chip border-sun/40 bg-white text-amber-700">
              <Star className="h-3 w-3" /> +15 {tr('stars')}
            </span>
            <span className="chip border-violet-neon/25 bg-white text-violet-neon">
              <Sparkles className="h-3 w-3" /> {tr('Lesson complete')}
            </span>
          </div>

          <div className="mt-4 rounded-3xl border-2 border-dashed border-sun/50 bg-white/70 p-4">
            {chestOpened || chestResult ? (
              chestResult ? (
              <div className="text-center">
                <p className="text-4xl">{chestResult.sticker ? '🎁' : '⭐'}</p>
                <p className="mt-1 text-sm font-extrabold text-ink-950">
                  {chestResult.sticker
                    ? tr('You found a new sticker inside!')
                    : tr('+{n} bonus stars inside!', { n: chestResult.stars })}
                </p>
                {chestResult.sticker && (
                  <p className="mt-1 text-2xl">
                    {giftStickers.find((sticker) => sticker.id === chestResult?.sticker)?.emoji}
                  </p>
                )}
              </div>
              ) : (
                <p className="py-2 text-xs font-bold text-ink-600">{tr('You already opened this box')}</p>
              )
            ) : (
              <button onClick={openChest} className="kids-bob mx-auto flex flex-col items-center gap-1">
                <span className="text-5xl">🎁</span>
                <span className="text-xs font-extrabold text-amber-700">{tr('Open the mystery box')}</span>
              </button>
            )}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={() => navigate('/kids')}>
              <BookOpen className="h-4 w-4" /> {tr('Back home')}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/kids/play')}>
              {tr('Play a game')} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setStep(0)
                setPicked(null)
                setQIndex(0)
                setScore(0)
                goToStep(0)
              }}
            >
              {tr('Do it again')}
            </Button>
          </div>
        </Card>
      )}

      {helper && (
        <WordHelper
          word={helper.word}
          sentence={helper.sentence}
          language={book.language}
          onClose={() => setHelper(null)}
        />
      )}
    </div>
  )
}
