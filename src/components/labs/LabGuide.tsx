import { useState } from 'react'
import { Check, HelpCircle, Lightbulb, Target } from 'lucide-react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'

/**
 * The part that turns a toy into a lesson: a goal, a prediction the student
 * commits to before touching the controls, and the explanation revealed after.
 */
export function LabGuide({
  goal,
  question,
  options,
  correct,
  explanation,
}: {
  goal: string
  question: string
  options: string[]
  correct: number
  explanation: string
}) {
  const [picked, setPicked] = useState<number | null>(null)

  return (
    <div className="mt-4 space-y-3 rounded-3xl border border-violet-neon/25 bg-gradient-to-br from-violet-neon/10 via-card-2 to-aurora-400/5 p-4">
      <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted">
        <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-200" />
        <span>
          <b className="text-main">{tr('Goal')}:</b> {goal}
        </span>
      </p>
      <div>
        <p className="flex items-start gap-2 text-[11px] font-bold text-main">
          <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sun" />
          {question}
        </p>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {options.map((option, index) => {
            const isPicked = picked === index
            const isCorrect = index === correct
            return (
              <button
                key={option}
                onClick={() => setPicked(index)}
                disabled={picked !== null}
                data-testid={`lab-guide-option-${index}`}
                className={cn(
                  'rounded-xl border px-3 py-2 text-start text-[11px] font-bold transition',
                  picked === null && 'border-line bg-white/5 text-muted hover:border-violet-neon/40 hover:text-main',
                  picked !== null && isCorrect && 'border-aurora-400/50 bg-aurora-400/10 text-aurora-200',
                  picked !== null && isPicked && !isCorrect && 'border-coral/40 bg-coral/10 text-coral',
                  picked !== null && !isCorrect && !isPicked && 'border-line bg-white/5 text-muted opacity-60',
                )}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>
      {picked !== null && (
        <p
          className={cn(
            'flex items-start gap-2 rounded-xl border px-3 py-2 text-[11px] leading-relaxed',
            picked === correct ? 'border-aurora-400/30 bg-aurora-400/5 text-aurora-200' : 'border-sun/30 bg-sun/5 text-sun',
          )}
          data-testid="lab-guide-feedback"
        >
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {picked === correct ? `${tr('Correct')} — ` : `${tr('Think again')} — `}
            {explanation}
          </span>
        </p>
      )}
      {picked === correct && <Check className="hidden" />}
    </div>
  )
}
