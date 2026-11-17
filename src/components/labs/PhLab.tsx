import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const LIQUIDS = [
  { id: 'stomach', name: 'Stomach acid', ph: 1.5, color: '#f59e0b' },
  { id: 'lemon', name: 'Lemon juice', ph: 2.2, color: '#facc15' },
  { id: 'vinegar', name: 'Vinegar', ph: 3, color: '#fde68a' },
  { id: 'coffee', name: 'Coffee', ph: 5, color: '#92400e' },
  { id: 'milk', name: 'Milk', ph: 6.5, color: '#f8fafc' },
  { id: 'water', name: 'Pure water', ph: 7, color: '#bae6fd' },
  { id: 'soap', name: 'Soap', ph: 9.5, color: '#a5f3fc' },
  { id: 'baking', name: 'Baking soda', ph: 8.5, color: '#e2e8f0' },
  { id: 'bleach', name: 'Bleach', ph: 12.5, color: '#d9f99d' },
]

export function PhLab({ onInteract }: { onInteract: () => void }) {
  const [selected, setSelected] = useState('lemon')
  const liquid = LIQUIDS.find((item) => item.id === selected) || LIQUIDS[1]
  const kind = liquid.ph < 6.8 ? 'acid' : liquid.ph > 7.2 ? 'base' : 'neutral'
  const litmus = kind === 'acid' ? '#ef4444' : kind === 'base' ? '#3b82f6' : '#a855f7'

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-violet-200">{tr('Acids and bases lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Measure the pH')}</h2>
            </div>
            <span className="rounded-full bg-violet-neon/15 px-2.5 py-1 font-display text-sm font-extrabold tabular-nums text-violet-200" dir="ltr" data-testid="ph-value">
              pH {liquid.ph}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4 rounded-2xl border border-line bg-ink-950 p-4">
              <div className="relative grid h-[150px] w-[92px] place-items-end" data-testid="ph-beaker">
                <div
                  className="absolute inset-x-1 bottom-1 h-[110px] rounded-b-2xl rounded-t-md border-2 border-white/20"
                  style={{ background: `linear-gradient(180deg, ${liquid.color}22, ${liquid.color}cc)`, transition: 'background .4s' }}
                />
                <div className="absolute inset-x-0 top-0 mx-auto h-3 w-16 rounded-t-md border-x-2 border-t-2 border-white/20" />
                <span className="relative z-10 mb-3 w-full text-center text-[10px] font-extrabold text-ink-950">{tr(liquid.name)}</span>
              </div>
              <div className="flex-1">
                <div className="relative h-5 overflow-hidden rounded-full" style={{ background: 'linear-gradient(90deg,#ef4444,#f59e0b,#facc15,#22c55e,#3b82f6,#6366f1,#7c3aed)' }}>
                  <span
                    className="absolute top-1/2 h-7 w-2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,.9)]"
                    style={{ left: `calc(${(liquid.ph / 14) * 100}% - 4px)`, transition: 'left .4s' }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[8px] font-bold text-muted-2" dir="ltr">
                  {[0, 2, 4, 6, 8, 10, 12, 14].map((value) => <span key={value}>{value}</span>)}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-8 w-4 rounded-sm border border-white/20" style={{ background: litmus }} />
                  <div>
                    <p className="text-[10px] font-bold text-muted">{tr('Litmus paper')}</p>
                    <p className="text-[11px] font-extrabold" style={{ color: litmus }}>
                      {kind === 'acid' ? tr('Turns red — acid') : kind === 'base' ? tr('Turns blue — base') : tr('Stays purple — neutral')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Type')} value={kind === 'acid' ? tr('Acid') : kind === 'base' ? tr('Base') : tr('Neutral')} testid="ph-kind" />
              <LabStat label={tr('pH')} value={String(liquid.ph)} />
              <LabStat label={tr('Strength')} value={liquid.ph <= 3 || liquid.ph >= 11 ? tr('Strong') : tr('Weak')} />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Dip the meter into a liquid from your kitchen or lab.')}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {LIQUIDS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setSelected(item.id); onInteract() }}
                  data-testid={`ph-${item.id}`}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-[10px] font-bold transition',
                    item.id === selected ? 'border-violet-neon/50 bg-violet-neon/15 text-violet-200' : 'border-line bg-card-2 text-muted hover:text-main',
                  )}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                  {tr(item.name)}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('Below 7 is acidic, 7 is neutral, above 7 is basic. The farther from 7, the stronger it is.')}
            </div>
            <LabChallenge done={liquid.ph >= 11}>{tr('Find a strong base.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Sort everyday liquids by how acidic they are.')}
        question={tr('Pure water has a pH of 7. What does that mean?')}
        options={[tr('Strong acid'), tr('Neutral'), tr('Strong base')]}
        correct={1}
        explanation={tr('A pH of 7 sits exactly in the middle: neither acidic nor basic.')}
      />
    </>
  )
}
