import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const LIQUIDS = [
  { id: 'water', label: 'Water', density: 1.0, color: '#38bdf8' },
  { id: 'oil', label: 'Oil', density: 0.92, color: '#facc15' },
  { id: 'honey', label: 'Honey', density: 1.42, color: '#f59e0b' },
]

export function DensityLab({ onInteract }: { onInteract: () => void }) {
  const [liquidId, setLiquidId] = useState('water')
  const [mass, setMass] = useState(120)
  const [volume, setVolume] = useState(150)

  const liquid = LIQUIDS.find((item) => item.id === liquidId) || LIQUIDS[0]
  const density = mass / volume
  const diff = density - liquid.density
  const state = Math.abs(diff) < 0.02 ? 'neutral' : diff < 0 ? 'float' : 'sink'

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
            <p className="label mb-1 text-sky">{tr('Density lab')}</p>
            <h2 className="font-display text-lg font-extrabold text-main">{tr('Float or sink?')}</h2>
          </div>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[10px] font-extrabold',
              state === 'float'
                ? 'bg-aurora-400/15 text-aurora-200'
                : state === 'sink'
                  ? 'bg-coral/15 text-coral'
                  : 'bg-sun/15 text-sun',
            )}
            data-testid="density-result"
          >
            {state === 'float' ? tr('Floats') : state === 'sink' ? tr('Sinks') : tr('Hovers')}
          </span>
        </div>
      }
      visual={
        <div className="space-y-3">
          <div className="flex justify-center overflow-hidden rounded-2xl border border-line bg-ink-950 p-3">
            <svg viewBox="0 0 220 230" className="h-[230px]" role="img" aria-label={tr('Beaker with a liquid')}>
              <rect x="52" y="20" width="116" height="190" rx="12" fill="none" stroke="#556080" strokeWidth="3" />
              <rect x="55" y="95" width="110" height="112" rx="8" fill={liquid.color} opacity="0.55" />
              <rect x="55" y="95" width="110" height="6" fill={liquid.color} opacity="0.9" />
              <rect
                x={state === 'float' ? 88 : 88}
                y={state === 'sink' ? 168 : 70}
                width="44"
                height="34"
                rx="6"
                fill={state === 'sink' ? '#f472b6' : '#21e6c9'}
                opacity="0.9"
                style={{ transition: 'y .35s ease' }}
              />
              <text x="110" y="192" textAnchor="middle" fill="#dbe7ff" fontSize="10" fontWeight="700">
                {liquid.label}
              </text>
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <LabStat label={tr('Object density')} value={`${density.toFixed(2)} g/cm³`} testid="density-value" />
            <LabStat label={tr('Liquid density')} value={`${liquid.density.toFixed(2)} g/cm³`} />
          </div>
        </div>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-1.5">
            {LIQUIDS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onInteract()
                  setLiquidId(item.id)
                }}
                data-testid={`density-liquid-${item.id}`}
                className={cn(
                  'rounded-full border px-3 py-1 text-[11px] font-bold transition',
                  liquidId === item.id ? 'border-sky/60 bg-sky/15 text-sky' : 'border-line bg-card-2 text-muted hover:text-main',
                )}
              >
                {tr(item.label)}
              </button>
            ))}
          </div>
          <LabRange label={tr('Mass')} value={mass} min={10} max={500} step={10} unit="g" onChange={change(setMass)} testid="density-mass" />
          <LabRange label={tr('Volume')} value={volume} min={10} max={500} step={10} unit="cm³" onChange={change(setVolume)} testid="density-volume" />
          <p className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
            {tr('Density = mass ÷ volume. If it is lower than the liquid, the object floats.')}
          </p>
          <LabChallenge done={state === 'float'}>{tr('Adjust mass and volume so the object floats.')}</LabChallenge>
        </>
      }
    />
      <LabGuide
        goal={tr('Predict floating and sinking from density.')}
        question={tr('An object of 200 g has a volume of 100 cm³. What is its density?')}
        options={[tr('2 g/cm³'), tr('0.5 g/cm³'), tr('200 g/cm³')]}
        correct={0}
        explanation={tr('Density = mass ÷ volume = 200 ÷ 100 = 2 g/cm³.')}
      />
    </>
  )
}
