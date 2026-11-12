import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Play,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import type { QuizQuestion } from '@/types'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { generateJSON, generateText } from '@/lib/gemini'
import { putCard } from '@/lib/db'
import { newCard } from '@/lib/srs'
import { PageHeader } from '@/components/common/PageHeader'
import { QuizGame } from '@/components/tools/QuizGame'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { tr } from '@/i18n'

export function Mistakes() {
  const { mistakes, apiKey, model, removeMistake, clearMistakes, setMistakeExplanation } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const [subject, setSubject] = useState('All')
  const [explaining, setExplaining] = useState<string | null>(null)
  const [practice, setPractice] = useState<QuizQuestion[] | null>(null)
  const [similar, setSimilar] = useState<Record<string, { question: string; options: string[]; answer: number; explanation: string } | undefined>>({})
  const [similarBusy, setSimilarBusy] = useState<string | null>(null)
  const [similarPick, setSimilarPick] = useState<Record<string, number>>({})

  const subjects = useMemo(() => ['All', ...new Set(mistakes.map((item) => item.subject))], [mistakes])
  const filtered = subject === 'All' ? mistakes : mistakes.filter((item) => item.subject === subject)

  const explain = async (id: string) => {
    const entry = mistakes.find((item) => item.id === id)
    if (!entry) return
    if (!apiKey) {
      pushToast({ title: tr('Add your Gemini key first'), type: 'info' })
      return
    }
    setExplaining(id)
    try {
      const text = await generateText({
        apiKey,
        model,
        system: 'You are Jessica, a patient tutor for Egyptian students. Explain mistakes simply and kindly.',
        parts: [
          {
            text: `A student answered this multiple-choice question incorrectly.
Question: ${entry.question}
Options: ${entry.options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join(' | ')}
Correct answer: ${String.fromCharCode(65 + entry.answer)}. ${entry.options[entry.answer]}
The student chose: ${String.fromCharCode(65 + entry.chosen)}. ${entry.options[entry.chosen]}
Write in the app language: (1) why the chosen answer is wrong, (2) the correct idea in two short sentences, (3) one tiny tip to remember it. Max 90 words. No markdown headings.`,
          },
        ],
        temperature: 0.4,
        maxOutputTokens: 320,
      })
      setMistakeExplanation(id, text.trim())
    } catch (err) {
      pushToast({ title: tr('Could not explain this mistake'), description: err instanceof Error ? err.message : tr('Try again.'), type: 'error' })
    } finally {
      setExplaining(null)
    }
  }

  const makeSimilar = async (id: string) => {
    const entry = mistakes.find((item) => item.id === id)
    if (!entry) return
    if (!apiKey) {
      pushToast({ title: tr('Add your Gemini key first'), type: 'info' })
      return
    }
    setSimilarBusy(id)
    try {
      const data = await generateJSON<{ question: string; options: string[]; answer: number; explanation: string }>({
        apiKey,
        model,
        temperature: 0.6,
        maxOutputTokens: 500,
        system: 'You are Jessica, a patient tutor. Write one new multiple-choice question that practises the same skill as the student\'s mistake.',
        parts: [
          {
            text: `Original question: ${entry.question}
Options: ${entry.options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join(' | ')}
Correct answer: ${entry.options[entry.answer]}
Topic: ${entry.topic || entry.subject}
Create ONE new question on the same skill but with different wording and numbers/context. Return ONLY JSON:
{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."}
Exactly 4 options. Explanation max 30 words. ${tr('Use the app language.')}`,
          },
        ],
      })
      setSimilar((current) => ({ ...current, [id]: data }))
    } catch (err) {
      pushToast({ title: tr('Could not create a similar question'), description: err instanceof Error ? err.message : tr('Try again.'), type: 'error' })
    } finally {
      setSimilarBusy(null)
    }
  }

  const makeCard = async (id: string) => {
    const entry = mistakes.find((item) => item.id === id)
    if (!entry) return
    try {
      await putCard(
        newCard({
          bookId: entry.bookId || 'mistakes',
          subject: entry.subject,
          front: entry.question,
          back: `${String.fromCharCode(65 + entry.answer)}. ${entry.options[entry.answer]} — ${entry.explanation}`,
          source: tr('From my mistakes'),
        }),
      )
      pushToast({ title: tr('Card added to your deck'), description: tr('Review it with spaced repetition.'), type: 'success' })
    } catch {
      pushToast({ title: tr('Could not add the card'), type: 'error' })
    }
  }

  const startPractice = () => {
    if (!filtered.length) return
    setPractice(
      filtered.slice(0, 20).map((item) => ({
        question: item.question,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
        topic: item.topic,
      })),
    )
  }

  if (practice) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-lg font-extrabold text-main">{tr('Mistake drill')}</h1>
          <Button size="sm" variant="ghost" onClick={() => setPractice(null)}>
            <X className="h-3.5 w-3.5" /> {tr('Close')}
          </Button>
        </div>
        <Card className="p-4">
          <QuizGame questions={practice} subject={filtered[0]?.subject || 'Review'} title={tr('Mistake drill')} />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Learn from mistakes')}
        title={tr('My mistakes')}
        subtitle={tr('Every wrong answer is saved here with the correct idea. Explain it, turn it into a card, or drill it again.')}
        icon={<AlertTriangle className="h-5 w-5" />}
        actions={
          <>
            <Button size="sm" variant="secondary" onClick={startPractice} disabled={!filtered.length}>
              <Play className="h-3.5 w-3.5" /> {tr('Drill mistakes')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (window.confirm(tr('Clear all saved mistakes?'))) clearMistakes()
              }}
              disabled={!mistakes.length}
            >
              <Trash2 className="h-3.5 w-3.5" /> {tr('Clear all')}
            </Button>
          </>
        }
      />

      {!mistakes.length ? (
        <EmptyState
          icon={<CheckCircle2 className="h-6 w-6" />}
          title={tr('No mistakes saved yet')}
          description={tr('When you answer a quiz or exam question wrong, it lands here automatically.')}
          action={
            <Link to="/games">
              <Button size="sm">{tr('Start a quiz')}</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {subjects.map((item) => (
              <button
                key={item}
                onClick={() => setSubject(item)}
                className={cn(
                  'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold transition',
                  subject === item ? 'border-aurora-400/50 bg-aurora-400/15 text-aurora-200' : 'border-line bg-card-2 text-muted hover:text-main',
                )}
              >
                {tr(item)}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {filtered.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold leading-relaxed text-main" dir="auto">
                      {item.question}
                    </p>
                    <p className="mt-1 text-[9px] font-semibold text-muted">
                      {tr(item.subject)} · {new Date(item.createdAt).toLocaleDateString()}
                      {item.topic ? ` · ${item.topic}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMistake(item.id)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-muted transition hover:text-coral"
                    aria-label={tr('Delete')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2 grid gap-1 sm:grid-cols-2">
                  {item.options.map((option, index) => (
                    <p
                      key={index}
                      className={cn(
                        'rounded-lg border px-2 py-1 text-[11px]',
                        index === item.answer
                          ? 'border-aurora-400/40 bg-aurora-400/10 font-bold text-aurora-200'
                          : index === item.chosen
                            ? 'border-coral/35 bg-coral/10 text-coral line-through'
                            : 'border-line bg-card-2 text-muted',
                      )}
                    >
                      <span className="font-bold">{String.fromCharCode(65 + index)}.</span> {option}
                    </p>
                  ))}
                </div>

                {item.explanation && (
                  <p className="mt-2 rounded-xl border border-line bg-card-2 p-2 text-[11px] leading-relaxed text-muted" dir="auto">
                    {item.explanation}
                  </p>
                )}

                {item.aiExplanation && (
                  <p className="mt-2 rounded-xl border border-violet-neon/25 bg-violet-neon/10 p-2.5 text-[11px] leading-relaxed text-main">
                    {item.aiExplanation}
                  </p>
                )}

                {similar[item.id] && (
                  <div className="mt-2 rounded-xl border border-aurora-400/25 bg-aurora-400/5 p-2.5">
                    <p className="text-[10px] font-bold text-aurora-200">{tr('Try a similar question')}</p>
                    <p className="mt-1 text-[11px] font-semibold text-main" dir="auto">{similar[item.id]?.question}</p>
                    <div className="mt-1.5 grid gap-1">
                      {similar[item.id]?.options.map((option, index) => {
                        const picked = similarPick[item.id] === index
                        const correct = similar[item.id]?.answer === index
                        const revealed = similarPick[item.id] !== undefined
                        return (
                          <button
                            key={index}
                            onClick={() => setSimilarPick((current) => ({ ...current, [item.id]: index }))}
                            className={cn(
                              'rounded-lg border px-2 py-1.5 text-start text-[10px] font-semibold transition',
                              revealed && correct
                                ? 'border-aurora-400/50 bg-aurora-400/15 text-aurora-200'
                                : picked
                                  ? 'border-coral/40 bg-coral/10 text-coral'
                                  : 'border-line bg-card-2 text-main hover:bg-white/5',
                            )}
                          >
                            {String.fromCharCode(65 + index)}. {option}
                          </button>
                        )
                      })}
                    </div>
                    {similarPick[item.id] !== undefined && (
                      <p className="mt-1.5 text-[10px] leading-relaxed text-muted" dir="auto">{similar[item.id]?.explanation}</p>
                    )}
                  </div>
                )}

                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => explain(item.id)} loading={explaining === item.id}>
                    {explaining === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {tr('Explain my mistake')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => makeSimilar(item.id)} loading={similarBusy === item.id}>
                    <Sparkles className="h-3.5 w-3.5" /> {tr('Similar question')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => makeCard(item.id)}>
                    <Brain className="h-3.5 w-3.5" /> {tr('Make a card')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeMistake(item.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> {tr('I get it now')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
