import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brain, Loader2, Play, Target, TrendingUp } from 'lucide-react'
import type { QuizQuestion } from '@/types'
import { chapterCacheGet, getQuizzes, saveQuiz } from '@/lib/db'
import { useApp } from '@/store/useApp'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { QuizGame } from '@/components/tools/QuizGame'
import { generateJSON } from '@/lib/gemini'
import { quizPrompt } from '@/lib/prompts'
import { useUI } from '@/store/useUI'
import { tr } from '@/i18n'
import { cn, shuffle } from '@/lib/utils'

interface Candidate {
  question: QuizQuestion
  subject: string
  topic: string
  weight: number
}

export function Practice() {
  const skillStats = useApp((s) => s.skillStats)
  const mistakes = useApp((s) => s.mistakes)
  const customBooks = useApp((s) => s.customBooks)
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const apiKey = useApp((s) => s.apiKey)
  const model = useApp((s) => s.model)
  const pushToast = useUI((s) => s.pushToast)
  const [banks, setBanks] = useState<Awaited<ReturnType<typeof getQuizzes>>>([])
  const [preparing, setPreparing] = useState(false)
  const [pool, setPool] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Candidate[] | null>(null)
  const [done, setDone] = useState<{ score: number; total: number } | null>(null)

  useEffect(() => {
    getQuizzes()
      .then((banks) => {
        setBanks(banks)
        const candidates: Candidate[] = []
        for (const bank of banks) {
          for (const question of bank.questions) {
            candidates.push({
              question,
              subject: bank.subject,
              topic: (question.topic || bank.subject).trim(),
              weight: 1,
            })
          }
        }
        setPool(candidates)
      })
      .catch(() => setPool([]))
      .finally(() => setLoading(false))
  }, [])

  const prepareBank = async () => {
    if (!apiKey.trim()) {
      pushToast({ title: tr('Add your AI key first'), type: 'info' })
      return
    }
    const book = customBooks.find((item) => item.grade === gradeLevel && item.units?.length)
    if (!book) {
      pushToast({ title: tr('Add a book with units first'), type: 'info' })
      return
    }
    const existing = new Set(banks.map((bank) => bank.id))
    const unit = book.units?.find((item) => !existing.has(`${book.id}:${item.id}`))
    if (!unit) {
      pushToast({ title: tr('Every unit already has a bank'), type: 'success' })
      return
    }
    setPreparing(true)
    try {
      const chapter = await chapterCacheGet(book.id)
      if (!chapter) {
        pushToast({ title: tr('Open this book once so it can be indexed'), type: 'info' })
        return
      }
      const slice = {
        ...chapter,
        pages: chapter.pages.filter((page) => page.page >= unit.startPage && page.page <= unit.endPage),
      }
      const data = await generateJSON<{ questions: { question: string; options: string[]; answer: number; explanation: string; topic?: string }[] }>({
        apiKey,
        model,
        temperature: 0.5,
        maxOutputTokens: 1600,
        system: 'You write accurate school quizzes from the textbook context. Return only valid JSON.',
        parts: [{ text: quizPrompt(book, slice, 8) }],
      })
      const questions = data.questions
        .filter((question) => Array.isArray(question.options) && question.options.length === 4)
        .map((question) => ({
          question: question.question,
          options: question.options,
          answer: Math.max(0, Math.min(3, question.answer)),
          explanation: question.explanation || '',
          topic: question.topic || unit.title,
        }))
      if (!questions.length) throw new Error(tr('No usable questions returned.'))
      await saveQuiz({
        id: `${book.id}:${unit.id}`,
        bookId: book.id,
        subject: book.subject,
        questions,
        createdAt: Date.now(),
      })
      const refreshed = await getQuizzes()
      setBanks(refreshed)
      setPool(
        refreshed.flatMap((bank) =>
          bank.questions.map((question) => ({
            question,
            subject: bank.subject,
            topic: (question.topic || bank.subject).trim(),
            weight: 1,
          })),
        ),
      )
      pushToast({ title: tr('Bank ready: {n} questions', { n: questions.length }), type: 'success' })
    } catch (err) {
      pushToast({ title: tr('Could not prepare the bank'), description: err instanceof Error ? err.message : tr('Try again.'), type: 'error' })
    } finally {
      setPreparing(false)
    }
  }

  const weak = useMemo(() => {
    return Object.entries(skillStats)
      .map(([key, value]) => {
        const [subject, topic] = key.split('|')
        const accuracy = value.total ? value.correct / value.total : 0
        return { subject, topic, accuracy, total: value.total }
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 6)
  }, [skillStats])

  const weakKeys = useMemo(
    () => new Set(weak.filter((item) => item.accuracy < 0.8).map((item) => `${item.subject}|${item.topic}`.toLowerCase())),
    [weak],
  )

  const built = useMemo(() => {
    const scored = pool.map((candidate) => {
      const key = `${candidate.subject}|${candidate.topic}`.toLowerCase()
      const stat = skillStats[`${candidate.subject}|${candidate.topic}`]
      const accuracy = stat && stat.total ? stat.correct / stat.total : null
      let weight = 2
      if (weakKeys.has(key)) weight = 4
      else if (accuracy !== null && accuracy < 0.9) weight = 3

      // Adaptive difficulty: easier questions when accuracy is low, harder when high.
      const wanted = accuracy === null ? 'medium' : accuracy < 0.5 ? 'easy' : accuracy > 0.8 ? 'hard' : 'medium'
      if (candidate.question.difficulty) {
        if (candidate.question.difficulty === wanted) weight += 3
      } else {
        weight += 1
      }
      return { ...candidate, weight }
    })
    const sorted = shuffle(scored).sort((a, b) => b.weight - a.weight)
    return sorted.slice(0, 10)
  }, [pool, skillStats, weakKeys])

  const start = () => {
    setDone(null)
    setSession(built)
  }

  const topics = useMemo(() => {
    const set = new Set(built.map((item) => item.topic))
    return [...set].slice(0, 6)
  }, [built])

  if (session) {
    return (
      <div className="space-y-4">
        <PageHeader
          back
          eyebrow={tr('Adaptive practice')}
          title={tr('Smart session')}
          subtitle={tr('Questions picked from your saved banks, weighted towards your weakest topics.')}
          icon={<Brain className="h-5 w-5" />}
        />
        <QuizGame
          questions={session.map((item) => item.question)}
          subject={session[0]?.subject || 'Review'}
          title={tr('Adaptive practice')}
          onFinish={(score, total) => setDone({ score, total })}
          onRetry={start}
        />
        {done && (
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-[11px] font-bold text-main">
              {tr('Session score: {score}/{total}', { score: done.score, total: done.total })}
            </p>
            <Button size="sm" variant="secondary" onClick={() => setSession(null)}>
              {tr('Back to practice')}
            </Button>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Adaptive practice')}
        title={tr('Practise what you actually need')}
        subtitle={tr('A smart session from your saved question banks, weighted towards weak and untested skills.')}
        icon={<Brain className="h-5 w-5" />}
        actions={
          built.length ? (
            <Button onClick={start}>
              <Play className="h-4 w-4" /> {tr('Start session')}
            </Button>
          ) : undefined
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-[12px] font-extrabold text-main">
            {tr('Question banks: {q} questions in {u} units', { q: pool.length, u: banks.length })}
          </p>
          <p className="text-[10px] text-muted">
            {tr('Prepare one unit with AI, then practise it offline as many times as you want.')}
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={prepareBank} loading={preparing}>
          {tr('Prepare next unit')}
        </Button>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-[11px] font-bold text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> {tr('Reading your question banks…')}
        </div>
      ) : built.length ? (
        <>
          <Card className="flex flex-wrap items-center justify-between gap-3 border-aurora-400/25 bg-aurora-400/5 p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-aurora-400/15 text-aurora-300">
                <Target className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-main">
                  {tr('{n} questions ready', { n: built.length })}
                </p>
                <p className="text-[10px] text-muted">{tr('From {n} saved questions in your banks.', { n: pool.length })}</p>
              </div>
            </div>
            <span className="flex flex-wrap gap-1.5">
              <span className="chip border-sun/25 bg-sun/10 text-sun">
                <TrendingUp className="h-3 w-3" /> {tr('Weak-first')}
              </span>
              <span className="chip border-aurora-400/25 bg-aurora-400/10 text-aurora-200">
                {tr('Adaptive difficulty')}
              </span>
            </span>
          </Card>

          {weak.length > 0 && (
            <div>
              <p className="label mb-1.5">{tr('Weakest skills')}</p>
              <div className="flex flex-wrap gap-1.5">
                {weak.map((item) => (
                  <span
                    key={`${item.subject}-${item.topic}`}
                    className={cn(
                      'chip',
                      item.accuracy < 0.5
                        ? 'border-coral/30 bg-coral/10 text-coral'
                        : 'border-sun/30 bg-sun/10 text-sun',
                    )}
                  >
                    {item.topic} · {Math.round(item.accuracy * 100)}%
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="label mb-1.5">{tr('Topics in this session')}</p>
            <div className="flex flex-wrap gap-1.5">
              {topics.map((topic) => (
                <span key={topic} className="chip border-line text-muted">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <Button onClick={start} className="w-full">
            <Play className="h-4 w-4" /> {tr('Start adaptive session')}
          </Button>
        </>
      ) : (
        <Card className="p-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sun/10 text-sun">
            <Brain className="h-6 w-6" />
          </span>
          <h2 className="mt-3 font-display text-lg font-extrabold text-main">{tr('No question bank yet')}</h2>
          <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted">
            {tr('Open any unit and generate a quiz once — it is saved on your device, then adaptive practice can reuse it offline.')}
          </p>
          <Link to="/study" className="mt-4 inline-block">
            <Button>{tr('Open study hub')}</Button>
          </Link>
        </Card>
      )}

      {mistakes.length > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-[12px] font-extrabold text-main">{tr('Prefer drilling your mistakes?')}</p>
            <p className="text-[10px] text-muted">{tr('{n} saved mistakes with explanations.', { n: mistakes.length })}</p>
          </div>
          <Link to="/mistakes">
            <Button variant="secondary" size="sm">{tr('Open mistakes')}</Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
