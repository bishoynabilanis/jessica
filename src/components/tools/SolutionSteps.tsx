import { useMemo } from 'react'
import type { BankQuestion } from '@/lib/questionBank'
import { solutionSteps } from '@/lib/solutionSteps'
import { num, tr } from '@/i18n'

/**
 * The working behind the answer, as numbered equations. Hidden behind a
 * summary so it never competes with the answer itself.
 */
export function SolutionSteps({ question, className }: { question: BankQuestion; className?: string }) {
  const steps = useMemo(() => solutionSteps(question), [question])
  if (!steps.length) return null

  return (
    <details className={`mt-2 rounded-xl border border-line bg-card-2/60 px-3 py-2 ${className || ''}`} data-testid="solution-steps">
      <summary className="cursor-pointer text-[10px] font-extrabold text-aurora-200">{tr('Step by step')}</summary>
      <ol className="mt-1.5 space-y-1">
        {steps.map((step, index) => (
          <li key={`${step}-${index}`} className="flex items-center gap-2">
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white/10 text-[9px] font-bold text-muted">
              {num(index + 1)}
            </span>
            <span className="text-[11px] font-bold tabular-nums text-main" dir="ltr">
              {step}
            </span>
          </li>
        ))}
      </ol>
    </details>
  )
}
