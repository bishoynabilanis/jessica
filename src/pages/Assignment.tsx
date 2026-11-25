import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, ChevronLeft, ClipboardCheck, Copy, Send, Users } from 'lucide-react'
import type { AssignmentResult } from '@/lib/assignments'
import { decodeAnyAssignment, decodeResult, encodeResult, resultUrl } from '@/lib/assignments'
import { QuizGame } from '@/components/tools/QuizGame'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { num, tr } from '@/i18n'

export function Assignment() {
  const [params] = useSearchParams()
  const code = params.get('d') || ''
  const resultCode = params.get('r') || ''
  const packCode = params.get('p') || ''
  const assignment = useMemo(() => decodeAnyAssignment(packCode, code), [packCode, code])
  const sharedResult = useMemo<AssignmentResult | null>(() => (resultCode ? decodeResult(resultCode) : null), [resultCode])
  const [name, setName] = useState('')
  const [started, setStarted] = useState(false)
  const [studying, setStudying] = useState(false)
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [result, setResult] = useState<AssignmentResult | null>(null)
  const [copied, setCopied] = useState(false)

  if (sharedResult) {
    return (
      <div className="mx-auto mt-8 max-w-lg">
        <Card className="p-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-aurora-400/15 text-aurora-300">
            <ClipboardCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-3 font-display text-xl font-extrabold text-main">{tr('Assignment result')}</h1>
          <p className="mt-1 text-sm font-bold text-muted">{sharedResult.name || tr('Student')}</p>
          <p className="mt-2 font-display text-4xl font-extrabold text-main">
            {sharedResult.score}/{sharedResult.total}
          </p>
          <p className="text-[11px] text-muted">{Math.round((sharedResult.score / sharedResult.total) * 100)}%</p>
          <Link to="/" className="mt-4 inline-block">
            <Button variant="secondary">{tr('Back to home')}</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="mx-auto mt-8 max-w-lg">
        <Card className="p-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-coral/15 text-coral">
            <Users className="h-7 w-7" />
          </span>
          <h1 className="mt-3 font-display text-xl font-extrabold text-main">{tr('This assignment link is incomplete')}</h1>
          <p className="mt-1 text-[11px] text-muted">{tr('Ask your teacher to send the full link or scan the QR code again.')}</p>
          <Link to="/" className="mt-4 inline-block">
            <Button variant="secondary">{tr('Back to home')}</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (result) {
    const codeOut = encodeResult(result)
    const link = resultUrl(result)
    return (
      <div className="mx-auto mt-6 max-w-lg space-y-3">
        <Card className="p-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-aurora-400/15 text-aurora-300">
            <Check className="h-7 w-7" />
          </span>
          <h1 className="mt-3 font-display text-xl font-extrabold text-main">{tr('Well done!')}</h1>
          <p className="mt-1 text-sm font-bold text-muted">{assignment.unitTitle}</p>
          <p className="mt-2 font-display text-4xl font-extrabold text-main">
            {result.score}/{result.total}
          </p>
          <p className="text-[11px] text-muted">{Math.round((result.score / result.total) * 100)}%</p>
          <p className="mt-3 text-[10px] leading-relaxed text-muted">
            {tr('Send this result code to your teacher.')}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(codeOut)
                setCopied(true)
              }}
            >
              <Copy className="h-3.5 w-3.5" /> {copied ? tr('Copied') : tr('Copy result code')}
            </Button>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${assignment.unitTitle}: ${link}`)}`} target="_blank" rel="noreferrer">
              <Button size="sm" variant="secondary">
                <Send className="h-3.5 w-3.5" /> {tr('Send on WhatsApp')}
              </Button>
            </a>
          </div>
          <input readOnly value={codeOut} className="field mt-3 text-[9px]" dir="ltr" onFocus={(e) => e.target.select()} />
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-6 max-w-2xl space-y-3">
      <Card className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-aurora-300">{tr('Class assignment')}</p>
        <h1 className="mt-1 font-display text-xl font-extrabold text-main">{assignment.unitTitle}</h1>
        <p className="text-[10px] text-muted">
          {assignment.bookTitle} · {assignment.questions.length} {tr('questions')}
        </p>
        {!started && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 50))}
              placeholder={tr('Your name')}
              className="field max-w-xs text-xs"
            />
            <Button
              data-testid="pack-start"
              onClick={() => {
                if (assignment.cards?.length) setStudying(true)
                else setStarted(true)
              }}
            >
              {assignment.cards?.length ? tr('Study the cards first') : tr('Start assignment')}
            </Button>
          </div>
        )}
      </Card>

      {studying && !started && assignment.cards && (
        <Card className="p-4" data-testid="pack-cards">
          <p className="text-[10px] font-bold text-muted">
            {tr('Card {n} of {total}', { n: num(cardIndex + 1), total: num(assignment.cards.length) })}
          </p>
          <button
            type="button"
            data-testid="pack-card"
            onClick={() => setFlipped((value) => !value)}
            className="mt-2 grid min-h-[9rem] w-full place-items-center rounded-2xl border border-aurora-400/30 bg-aurora-400/10 p-4 text-center"
          >
            <span className="text-sm font-bold leading-relaxed text-main">
              {flipped ? assignment.cards[cardIndex].back : assignment.cards[cardIndex].front}
            </span>
          </button>
          <p className="mt-1 text-center text-[10px] text-muted">{flipped ? tr('Tap to see the question') : tr('Tap to see the answer')}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Button size="sm" variant="secondary" disabled={cardIndex === 0} onClick={() => { setCardIndex(cardIndex - 1); setFlipped(false) }} aria-label={tr('Previous card')}>
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
            {cardIndex < assignment.cards.length - 1 ? (
              <Button size="sm" data-testid="pack-next" onClick={() => { setCardIndex(cardIndex + 1); setFlipped(false) }}>
                {tr('Next card')}
              </Button>
            ) : (
              <Button size="sm" data-testid="pack-begin-quiz" onClick={() => setStarted(true)}>
                {tr('Start the quiz')}
              </Button>
            )}
          </div>
          <button type="button" className="mt-2 text-[10px] font-bold text-aurora-300 underline" onClick={() => setStarted(true)}>
            {tr('Skip to the quiz')}
          </button>
          <p className="mt-2 text-[10px] text-muted-2">{tr('These cards come from the unit pages in the textbook. Nothing about you is saved or sent.')}</p>
        </Card>
      )}

      {started && (
        <Card className="p-4">
          <QuizGame
            questions={assignment.questions}
            subject={assignment.subject}
            title={assignment.unitTitle}
            bookId={assignment.unitKey.split(':')[0]}
            unitKey={assignment.unitKey}
            onFinish={(score, total, wrong) => {
              setResult({
                v: 1,
                id: assignment.id,
                name: name.trim() || tr('Student'),
                score,
                total,
                date: Date.now(),
                answers: undefined,
              })
              void wrong
            }}
          />
        </Card>
      )}
    </div>
  )
}
