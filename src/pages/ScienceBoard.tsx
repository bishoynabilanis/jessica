import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, Lightbulb, Presentation } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { KeyNotice, useRequireKey } from '@/components/common/KeyNotice'
import { ListenEgyptian } from '@/components/common/ListenEgyptian'
import { generateJSON } from '@/lib/gemini'
import { boardPrompt, boardSpeech, normalizeBoard, type ScienceBoard as Board } from '@/lib/scienceBoard'
import { useApp } from '@/store/useApp'
import { friendlyError } from '@/lib/utils'
import { getLanguage, num, tr } from '@/i18n'

export function ScienceBoard() {
  const requireKey = useRequireKey()
  const { apiKey, model } = useApp()
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [board, setBoard] = useState<Board | null>(null)

  const make = async () => {
    if (question.trim().length < 4 || !requireKey()) return
    setLoading(true)
    setError('')
    setBoard(null)
    try {
      const raw = await generateJSON<unknown>({
        apiKey,
        model,
        temperature: 0.3,
        system: 'You are a careful, kind science teacher who draws simple explanation boards. Return only JSON.',
        parts: [{ text: boardPrompt(question) }],
      })
      const parsed = normalizeBoard(raw)
      if (!parsed) throw new Error(tr('Could not make a board for this question. Try a school science question.'))
      setBoard(parsed)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        back
        eyebrow={tr('Explain it on a board')}
        title={tr('Science board')}
        subtitle={tr('Type a science question. Jessica draws the idea as a few boxes that follow each other.')}
        icon={<Presentation className="h-5 w-5" />}
        actions={
          <Link to="/ask">
            <Button variant="secondary" size="sm">{tr('Ask all your books')}</Button>
          </Link>
        }
      />

      <KeyNotice />

      <Card className="space-y-3 p-4 sm:p-5">
        <label className="block">
          <span className="label mb-1 block">{tr('Your question')}</span>
          <textarea
            data-testid="board-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={2}
            className="field w-full text-sm"
            placeholder={tr('Example: How does a plant make food?')}
          />
        </label>
        <Button data-testid="board-make" onClick={make} loading={loading} disabled={question.trim().length < 4}>
          <Presentation className="h-4 w-4" /> {tr('Draw the board')}
        </Button>
        <p className="text-[10px] text-muted-2">
          {tr('Your question goes only to your AI provider. Nothing is uploaded to us.')}
        </p>
        {error && <p className="text-[11px] text-coral">{error}</p>}
      </Card>

      {board && (
        <Card data-testid="board-result" className="space-y-3 p-4 sm:p-5">
          {board.title && <p className="font-display text-lg font-extrabold text-main">{board.title}</p>}
          <div className="mx-auto max-w-md">
            {board.steps.map((step, index) => (
              <div key={index} data-testid="board-step">
                <div className="flex gap-3 rounded-2xl border border-aurora-400/30 bg-aurora-400/10 p-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-aurora-400 text-xs font-extrabold text-ink-950">
                    {num(index + 1)}
                  </span>
                  <div className="min-w-0">
                    {step.title && <p className="text-xs font-extrabold text-main">{step.title}</p>}
                    <p className="text-[12px] leading-relaxed text-muted">{step.detail}</p>
                  </div>
                </div>
                {index < board.steps.length - 1 && (
                  <ArrowDown className="mx-auto my-1 h-4 w-4 text-aurora-300" aria-hidden />
                )}
              </div>
            ))}
          </div>
          {board.keyWords.length > 0 && (
            <div className="flex flex-wrap gap-1.5" data-testid="board-keywords">
              {board.keyWords.map((word) => (
                <span key={word} className="rounded-full border border-line bg-card-2 px-2.5 py-1 text-[11px] font-bold text-main">
                  {word}
                </span>
              ))}
            </div>
          )}
          {board.remember && (
            <p className="flex gap-2 rounded-2xl border border-sun/30 bg-sun/10 p-3 text-xs font-bold text-main">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-sun" /> {board.remember}
            </p>
          )}
          <ListenEgyptian text={boardSpeech(board)} lang={getLanguage()} />
          <p className="text-[10px] text-muted-2" data-testid="board-honesty">
            {tr('Made by AI from your question, not from your textbook. It can be wrong. Check it against your book or ask your teacher.')}
          </p>
        </Card>
      )}
    </div>
  )
}
