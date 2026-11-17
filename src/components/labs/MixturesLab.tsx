import { useState } from 'react'
import { Filter, Flame, Magnet } from 'lucide-react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame } from './LabControls'
import { LabGuide } from './LabGuide'

type Step = 'iron' | 'sand' | 'salt'

const STEPS: Array<{ id: Step; label: string; hint: string }> = [
  { id: 'iron', label: 'Use a magnet', hint: 'Iron filings jump to the magnet.' },
  { id: 'sand', label: 'Filter the water', hint: 'Sand stays in the filter paper.' },
  { id: 'salt', label: 'Evaporate the water', hint: 'Water leaves; salt crystals stay.' },
]

export function MixturesLab({ onInteract }: { onInteract: () => void }) {
  const [removed, setRemoved] = useState<Step[]>([])
  const left = STEPS.filter((step) => !removed.includes(step.id))

  const run = (step: Step) => {
    onInteract()
    setRemoved((current) => (current.includes(step) ? current : [...current, step]))
  }

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-violet-200">{tr('Mixtures lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Separate the mixture')}</h2>
            </div>
            <span className="rounded-full bg-violet-neon/15 px-2.5 py-1 text-[10px] font-extrabold text-violet-200" data-testid="mixture-left">
              {left.length} / 3
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-line bg-ink-950 p-4">
              <div className="relative h-[170px] w-[130px]">
                <div className="absolute inset-x-0 top-0 mx-auto h-3 w-24 rounded-t-md border-x-2 border-t-2 border-white/20" />
                <div
                  className="absolute inset-x-0 top-2 bottom-0 overflow-hidden rounded-b-2xl border-2 border-white/20"
                  style={{ background: removed.includes('sand') ? 'linear-gradient(180deg, #38bdf822, #0ea5e9aa)' : 'linear-gradient(180deg, #92400e33, #d97706aa)' }}
                >
                  {!removed.includes('sand') && <div className="absolute inset-x-0 bottom-0 h-16 bg-[#b45309] opacity-80" />}
                  {!removed.includes('iron') &&
                    Array.from({ length: 14 }).map((_, index) => (
                      <span
                        key={index}
                        className="absolute h-1 w-2 rounded-sm bg-[#e2e8f0]"
                        style={{ left: `${8 + ((index * 17) % 80)}%`, bottom: `${6 + ((index * 11) % 40)}px`, transform: `rotate(${index * 27}deg)` }}
                      />
                    ))}
                  {!removed.includes('sand') && (
                    <span className="absolute inset-x-0 bottom-12 text-center text-[8px] font-bold text-amber-100">{tr('Sand')}</span>
                  )}
                  {!removed.includes('iron') && (
                    <span className="absolute inset-x-0 bottom-24 text-center text-[8px] font-bold text-slate-200">{tr('Iron filings')}</span>
                  )}
                </div>
                {removed.includes('salt') && (
                  <div className="absolute inset-x-3 bottom-2 grid grid-cols-4 gap-0.5">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <span key={index} className="h-2 w-2 rounded-[2px] bg-white/90" />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {STEPS.map((step) => (
                <span
                  key={step.id}
                  className={cn(
                    'rounded-full border px-2 py-1 text-[9px] font-bold',
                    removed.includes(step.id) ? 'border-aurora-400/40 bg-aurora-400/10 text-aurora-200 line-through' : 'border-line bg-card-2 text-muted',
                  )}
                >
                  {tr(step.id === 'iron' ? 'Iron' : step.id === 'sand' ? 'Sand' : 'Salt')}
                </span>
              ))}
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Three things are mixed with water: iron filings, sand and salt. Take them out one at a time.')}</p>
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => run(step.id)}
                disabled={removed.includes(step.id)}
                data-testid={`mixture-${step.id}`}
                className={cn(
                  'flex items-start gap-2 rounded-xl border px-3 py-2 text-start text-[11px] font-bold transition',
                  removed.includes(step.id)
                    ? 'border-aurora-400/30 bg-aurora-400/5 text-muted-2'
                    : 'border-line bg-card-2 text-main hover:border-violet-neon/40',
                )}
              >
                <span className="mt-0.5 text-violet-200">
                  {step.id === 'iron' ? <Magnet className="h-4 w-4" /> : step.id === 'sand' ? <Filter className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
                </span>
                <span>
                  {tr(step.label)}
                  <span className="mt-0.5 block text-[9px] font-semibold text-muted-2">{tr(step.hint)}</span>
                </span>
              </button>
            ))}
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('Each material has a property we can use: iron is magnetic, sand is insoluble, salt dissolves and can be recovered by evaporation.')}
            </div>
            <LabChallenge done={removed.length === 3}>{tr('Separate all three materials.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Choose a separation method for each material.')}
        question={tr('How do you get salt back from salt water?')}
        options={[tr('Filter it'), tr('Evaporate the water'), tr('Use a magnet')]}
        correct={1}
        explanation={tr('Salt is dissolved, so a filter lets it through. Heating drives the water off and leaves the crystals.')}
      />
    </>
  )
}
