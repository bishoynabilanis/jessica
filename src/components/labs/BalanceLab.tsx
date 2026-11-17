import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

export function BalanceLab({ onInteract }: { onInteract: () => void }) {
  const [step, setStep] = useState(0)
  const equation = step === 0 ? '2x + 3 = 11' : step === 1 ? '2x = 8' : 'x = 4'

  const subtract = () => {
    onInteract()
    if (step === 0) setStep(1)
  }

  const divide = () => {
    onInteract()
    if (step === 1) setStep(2)
  }

  const reset = () => {
    onInteract()
    setStep(0)
  }

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-violet-200">{tr('Balance lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Keep the scale balanced')}</h2>
            </div>
            <span className="rounded-full bg-violet-neon/15 px-2.5 py-1 text-[10px] font-extrabold text-violet-200" data-testid="balance-step">
              {step + 1} / 3
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-line bg-ink-950 p-3">
              <svg viewBox="0 0 460 240" className="w-full" role="img" aria-label={tr('Balance scale')}>
                <rect x="220" y="120" width="20" height="90" rx="4" fill="#556080" />
                <rect x="170" y="206" width="120" height="10" rx="5" fill="#556080" />
                <line x1="80" y1="110" x2="380" y2="110" stroke="#8fa3c8" strokeWidth="5" strokeLinecap="round" />
                <circle cx="230" cy="110" r="7" fill="#ffd166" />
                <line x1="110" y1="110" x2="110" y2="145" stroke="#8fa3c8" strokeWidth="2" />
                <line x1="350" y1="110" x2="350" y2="145" stroke="#8fa3c8" strokeWidth="2" />
                <path d="M70 145 H150 Q150 175 110 175 Q70 175 70 145 Z" fill="#21e6c9" opacity="0.25" stroke="#21e6c9" strokeWidth="2" />
                <path d="M310 145 H390 Q390 175 350 175 Q310 175 310 145 Z" fill="#6b8cff" opacity="0.25" stroke="#6b8cff" strokeWidth="2" />
                <text x="110" y="165" textAnchor="middle" fill="#dbe7ff" fontSize="11" fontWeight="700">
                  {step === 0 ? '2x + 3' : step === 1 ? '2x' : 'x'}
                </text>
                <text x="350" y="165" textAnchor="middle" fill="#dbe7ff" fontSize="11" fontWeight="700">
                  {step === 0 ? '11' : step === 1 ? '8' : '4'}
                </text>
              </svg>
            </div>
            <p className="rounded-xl border border-line bg-card-2 px-3 py-2 text-center font-display text-2xl font-extrabold text-main" data-testid="balance-equation">
              {equation}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <LabStat label={tr('Step')} value={`${step + 1}/3`} />
              <LabStat label={tr('x')} value={step === 2 ? '4' : '?'} testid="balance-x" />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Do the same operation on both sides.')}</p>
            {step === 0 && (
              <button onClick={subtract} data-testid="balance-subtract" className="w-full rounded-xl border border-aurora-400/40 bg-aurora-400/10 px-3 py-2 text-[11px] font-extrabold text-aurora-200">
                {tr('Subtract 3 from both sides')}
              </button>
            )}
            {step === 1 && (
              <button onClick={divide} data-testid="balance-divide" className="w-full rounded-xl border border-aurora-400/40 bg-aurora-400/10 px-3 py-2 text-[11px] font-extrabold text-aurora-200">
                {tr('Divide both sides by 2')}
              </button>
            )}
            {step === 2 && (
              <p className="rounded-xl border border-aurora-400/40 bg-aurora-400/10 px-3 py-2 text-center text-[11px] font-extrabold text-aurora-200" data-testid="balance-solved">
                {tr('Solved: x = 4')}
              </p>
            )}
            <button onClick={reset} data-testid="balance-reset" className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-card-2 px-3 py-2 text-[11px] font-extrabold text-muted">
              <RotateCcw className="h-3.5 w-3.5" /> {tr('Reset')}
            </button>
            <LabChallenge done={step === 2}>{tr('Solve the equation for x.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Solve a linear equation without breaking the balance.')}
        question={tr('What is x in 2x + 3 = 11?')}
        options={['3', '4', '5']}
        correct={1}
        explanation={tr('Subtract 3 from both sides to get 2x = 8, then divide by 2: x = 4.')}
      />
    </>
  )
}
