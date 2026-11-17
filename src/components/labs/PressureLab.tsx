import { useState } from 'react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

export function PressureLab({ onInteract }: { onInteract: () => void }) {
  const [force, setForce] = useState(200)
  const [areaStep, setAreaStep] = useState(50)
  const area = areaStep / 100
  const pressure = force / area
  const sink = Math.min(38, pressure / 1200)
  const blockWidth = 40 + area * 70

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
              <p className="label mb-1 text-coral">{tr('Pressure lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Press down')}</h2>
            </div>
            <span className="rounded-full bg-coral/15 px-2.5 py-1 font-display text-sm font-extrabold tabular-nums text-coral" dir="ltr" data-testid="pressure-value">
              {pressure >= 1000 ? `${(pressure / 1000).toFixed(1)} kPa` : `${Math.round(pressure)} Pa`}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-ink-950 p-3">
              <svg viewBox="0 0 300 200" className="h-[220px] w-full" role="img" aria-label={tr('Block pressing on sand')} data-testid="pressure-svg">
                <rect x="0" y="130" width="300" height="70" fill="#8b5e3c" opacity="0.35" />
                <line x1="0" y1="130" x2="300" y2="130" stroke="#d6a05a" strokeWidth="2" opacity="0.5" />
                {Array.from({ length: 24 }).map((_, index) => (
                  <circle key={index} cx={8 + ((index * 37) % 284)} cy={142 + ((index * 13) % 50)} r="1.5" fill="#d6a05a" opacity="0.5" />
                ))}
                <rect
                  x={150 - blockWidth / 2}
                  y={48 + sink}
                  width={blockWidth}
                  height={82 - sink}
                  rx="4"
                  fill="#6b8cff"
                  opacity="0.8"
                />
                <text x="150" y={92 + sink} textAnchor="middle" fill="#071018" fontSize="12" fontWeight="800">
                  {force} N
                </text>
                <path d={`M150 ${16} l0 26 M142 34 l8 10 l8 -10`} stroke="#21e6c9" strokeWidth="3" fill="none" strokeLinecap="round" />
                <text x="160" y="22" fill="#21e6c9" fontSize="9" fontWeight="700">
                  {tr('Push')}
                </text>
                <path d={`M${150 - blockWidth / 2} 158 h${blockWidth}`} stroke="#ffd166" strokeWidth="2" />
                <text x="150" y="176" textAnchor="middle" fill="#ffd166" fontSize="9" fontWeight="700">
                  {tr('Area')} {area.toFixed(2)} m²
                </text>
              </svg>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Pressure')} value={pressure >= 1000 ? `${(pressure / 1000).toFixed(1)} kPa` : `${Math.round(pressure)} Pa`} testid="pressure-readout" />
              <LabStat label={tr('Force')} value={`${force} N`} />
              <LabStat label={tr('Area')} value={`${area.toFixed(2)} m²`} />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Pressure is force spread over area. Same push, smaller area, deeper sink.')}</p>
            <LabRange label={tr('Force')} value={force} min={10} max={500} step={10} unit="N" onChange={change(setForce)} testid="pressure-force" />
            <LabRange label={tr('Contact area')} value={areaStep} min={1} max={100} unit="%" onChange={change(setAreaStep)} testid="pressure-area" />
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              <span dir="ltr" className="font-bold text-main">P = F ÷ A</span>
              <br />
              {tr('A nail works because the same hammer force lands on a tiny point, so the pressure is huge.')}
            </div>
            <LabChallenge done={pressure >= 10000}>{tr('Reach 10,000 Pa or more.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('See why area changes the effect of the same force.')}
        question={tr('Why does a sharp knife cut better than a blunt one?')}
        options={[tr('It is heavier'), tr('The same force acts on a smaller area'), tr('It is colder')]}
        correct={1}
        explanation={tr('A thin edge concentrates the force on a tiny area, so the pressure is much higher.')}
      />
    </>
  )
}
