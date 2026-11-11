import { useEffect, useState } from 'react'
import { Gamepad2, RefreshCw, Sparkles } from 'lucide-react'
import type { Book, ChapterText, QuizQuestion } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Card'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateJSON } from '@/lib/gemini'
import { quizPrompt } from '@/lib/prompts'
import { getQuizzes, saveQuiz } from '@/lib/db'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { QuizGame } from './QuizGame'
import { tr } from '@/i18n'

export function QuizModal({
  open,
  onClose,
  book,
  chapter,
  unitKey,
}: {
  open: boolean
  onClose: () => void
  book: Book
  chapter?: ChapterText
  /** Cache key for a unit question bank, e.g. `${bookId}:${unitId}`. */
  unitKey?: string
}) {
  const requireKey = useRequireKey()
  const { apiKey, model, recordUnitScore } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [error, setError] = useState('')
  const [fromBank, setFromBank] = useState(false)

  useEffect(() => {
    if (!open) return
    setQuestions([])
    setError('')
    setFromBank(false)
    let alive = true
    if (unitKey) {
      getQuizzes()
        .then((list) => {
          const hit = list.find((quiz) => quiz.id === unitKey)
          if (alive && hit?.questions?.length) {
            setQuestions(hit.questions)
            setFromBank(true)
          }
        })
        .catch(() => undefined)
    }
    return () => {
      alive = false
    }
  }, [open, unitKey])

  const generate = async () => {
    if (!requireKey()) return
    if (!chapter) {
      pushToast({ title: tr("Book still indexing"), description: tr("The PDF text is loading. Try again in a moment."), type: 'info' })
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await generateJSON<{ questions: QuizQuestion[] }>({
        apiKey,
        model,
        system: 'You write fair, curriculum-aligned quizzes for Egyptian First Preparatory students. Return only JSON.',
        parts: [{ text: quizPrompt(book, chapter, 5) }],
        temperature: 0.6,
        maxOutputTokens: 1800,
      })
      const clean = (data.questions || [])
        .filter(
          (q) =>
            q.question?.trim() &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            Number.isInteger(q.answer) &&
            q.answer >= 0 &&
            q.answer < 4,
        )
        .slice(0, 5)
        .map((q) => ({
          question: q.question.trim(),
          options: q.options.map((o) => String(o).trim()),
          answer: q.answer,
          explanation: q.explanation || 'Review the relevant page in your book.',
          topic: q.topic?.trim() || undefined,
        }))
      if (!clean.length) throw new Error('The AI did not return a usable quiz. Try again.')
      if (unitKey) {
        await saveQuiz({
          id: unitKey,
          bookId: book.id,
          subject: book.subject,
          questions: clean,
          createdAt: Date.now(),
        }).catch(() => undefined)
      }
      setFromBank(false)
      setQuestions(clean)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Quiz generation failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Gamified quiz")}
      subtitle={`5 AI questions from ${book.title} · instant feedback · XP for every correct answer.`}
      icon={<Gamepad2 className="h-4.5 w-4.5" />}
      size="lg"
    >
      {!questions.length ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-gradient-to-br from-violet-neon/10 via-card-2 to-aurora-400/10 p-8 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-violet-neon/15 text-violet-glow">
            <Gamepad2 className="h-8 w-8" />
          </span>
          <div>
            <p className="font-display text-lg font-extrabold text-main">{tr("Five questions. One quick win.")}</p>
            <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-muted">
              {tr("Jessica reads this chapter and builds a quiz with explanations, so every wrong answer teaches you something.")}
            </p>
          </div>
          <Button onClick={generate} loading={loading}>
            <Sparkles className="h-4 w-4" /> {tr("Generate my quiz")}
          </Button>
          {error && <p className="text-[11px] text-coral">{error}</p>}
        </div>
      ) : (
        <div>
          {fromBank && (
            <p className="mb-3 rounded-xl border border-aurora-400/25 bg-aurora-400/5 p-2 text-center text-[10px] font-semibold text-aurora-200">
              {tr('Ready from your saved question bank · works offline')}
            </p>
          )}
          <QuizGame
            questions={questions}
            subject={book.subject}
            title={book.title}
            bookId={book.id}
            unitKey={unitKey}
            onFinish={(score, total, wrong) => {
              if (!unitKey) return
              const weakTopics = [...new Set(wrong.map((item) => item.topic).filter(Boolean) as string[])]
              recordUnitScore(unitKey, score, total, weakTopics)
              saveQuiz({
                id: unitKey,
                bookId: book.id,
                subject: book.subject,
                questions,
                score,
                createdAt: Date.now(),
              }).catch(() => undefined)
            }}
          />
          <div className="mt-4 flex justify-center border-t border-line pt-3">
            <Button variant="ghost" size="sm" onClick={generate} loading={loading}>
              <RefreshCw className="h-3.5 w-3.5" /> {tr("New questions")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
