import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

export function NumberLineLab({ onInteract }: { onInteract: () => void }) {
  const [start, setStart] = useState(0)
  const [step, setStep] = useState(3)
  const [operation, setOperation] = useState<'add' | 'subtract'>('add')
  const result = operation === 'add' ? start + step : start - step
  const x = (value: number) => 40 + ((value + 10) / 20) * 380

  const change = (setter: (value: number) => void) => (value: number) => {
    onInteract()
    setter(value)
  }

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-aurora-300">{tr('Number line lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Jump along the line')}</h2>
            </div>
            <span className="rounded-full bg-aurora-400/15 px-2.5 py-1 text-[10px] font-extrabold text-aurora-200" data-testid="number-result">
              {start} {operation === 'add' ? '+' : '−'} {step} = {result}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-line bg-ink-950 p-3">
              <svg viewBox="0 0 460 170" className="w-full" role="img" aria-label={tr('Number line')}>
                <line x1="40" y1="95" x2="420" y2="95" stroke="#556080" strokeWidth="2" />
                {Array.from({ length: 21 }).map((_, index) => {
                  const value = index - 10
                  return (
                    <g key={value}>
                      <line x1={x(value)} y1="88" x2={x(value)} y2="102" stroke="#556080" strokeWidth="1.5" />
                      <text x={x(value)} y="120" textAnchor="middle" fill="#8fa3c8" fontSize="8">
                        {value}
                      </text>
                    </g>
                  )
                })}
                <circle cx={x(start)} cy="95" r="5" fill="#8fa3c8" />
                <circle cx={x(result)} cy="95" r="7" fill="#21e6c9" data-testid="number-marker" />
                <path
                  d={`M${x(start)} 70 Q${(x(start) + x(result)) / 2} 35 ${x(result)} 70`}
                  fill="none"
                  stroke="#6b8cff"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow)"
                />
                <defs>
                  <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0 0 L6 3 L0 6 Z" fill="#6b8cff" />
                  </marker>
                </defs>
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <LabStat label={tr('Start')} value={String(start)} />
              <LabStat label={tr('Result')} value={String(result)} testid="number-value" />
            </div>
          </div>
        }
        controls={
          <>
            <LabRange label={tr('Start')} value={start} min={-10} max={10} onChange={change(setStart)} testid="number-start" />
            <LabRange label={tr('Jump')} value={step} min={0} max={10} onChange={change(setStep)} testid="number-step" />
            <div className="flex gap-2">
              <button
                onClick={() => { onInteract(); setOperation('add') }}
                data-testid="number-add"
                className={cn('flex-1 rounded-xl border px-3 py-2 text-[11px] font-extrabold', operation === 'add' ? 'border-aurora-400/50 bg-aurora-400/10 text-aurora-200' : 'border-line bg-card-2 text-muted')}
              >
                {tr('Add')}
              </button>
              <button
                onClick={() => { onInteract(); setOperation('subtract') }}
                data-testid="number-subtract"
                className={cn('flex-1 rounded-xl border px-3 py-2 text-[11px] font-extrabold', operation === 'subtract' ? 'border-coral/50 bg-coral/10 text-coral' : 'border-line bg-card-2 text-muted')}
              >
                {tr('Subtract')}
              </button>
            </div>
            <LabChallenge done={result === 5}>{tr('Make the marker land on 5.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Practise addition and subtraction on a number line.')}
        question={tr('Start at 2 and add 3. Where do you land?')}
        options={['4', '5', '6']}
        correct={1}
        explanation={tr('Start at 2 and jump 3 steps to the right: 2 → 3 → 4 → 5.')}
      />
    </>
  )
}
