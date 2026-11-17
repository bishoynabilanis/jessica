import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

export function MagnetismLab({ onInteract }: { onInteract: () => void }) {
  const [distance, setDistance] = useState(3)
  const [flipped, setFlipped] = useState(false)
  const attract = !flipped
  const force = 100 / (distance * distance)

  const change = (value: number) => {
    onInteract()
    setDistance(value)
  }

  const flip = () => {
    onInteract()
    setFlipped((value) => !value)
  }

  const rightX = 250 + distance * 9

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-coral">{tr('Magnetism lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Attract or repel')}</h2>
            </div>
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-extrabold',
                attract ? 'bg-aurora-400/15 text-aurora-200' : 'bg-coral/15 text-coral',
              )}
              data-testid="magnet-state"
            >
              {attract ? tr('Attract') : tr('Repel')}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-line bg-ink-950 p-3">
              <svg viewBox="0 0 460 220" className="w-full" role="img" aria-label={tr('Two magnets')}>
                <rect x="70" y="82" width="90" height="46" rx="6" fill="#21e6c9" opacity="0.85" />
                <rect x="70" y="82" width="32" height="46" rx="6" fill="#6b8cff" />
                <text x="86" y="111" textAnchor="middle" fill="#071018" fontSize="12" fontWeight="800">
                  N
                </text>
                <text x="140" y="111" textAnchor="middle" fill="#071018" fontSize="12" fontWeight="800">
                  S
                </text>
                <g transform={`translate(${rightX},0)`}>
                  <rect x="0" y="82" width="90" height="46" rx="6" fill="#21e6c9" opacity="0.85" />
                  <rect x={flipped ? 0 : 58} y="82" width="32" height="46" rx="6" fill="#6b8cff" />
                  <text x="18" y="111" textAnchor="middle" fill="#071018" fontSize="12" fontWeight="800">
                    {flipped ? 'S' : 'N'}
                  </text>
                  <text x="74" y="111" textAnchor="middle" fill="#071018" fontSize="12" fontWeight="800">
                    {flipped ? 'N' : 'S'}
                  </text>
                </g>
                {attract ? (
                  <g stroke="#21e6c9" strokeWidth="2" fill="none" opacity="0.7">
                    <path d={`M160 105 Q${(160 + rightX) / 2} 60 ${rightX} 105`} />
                    <path d={`M160 105 Q${(160 + rightX) / 2} 150 ${rightX} 105`} />
                  </g>
                ) : (
                  <g stroke="#ff7a7a" strokeWidth="2" fill="none" opacity="0.7">
                    <path d="M160 105 Q150 70 130 60" />
                    <path d={`M${rightX} 105 Q${rightX + 10} 70 ${rightX + 30} 60`} />
                  </g>
                )}
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <LabStat label={tr('Force')} value={`${force.toFixed(1)} N`} testid="magnet-force" />
              <LabStat label={tr('Distance')} value={`${distance} cm`} />
            </div>
          </div>
        }
        controls={
          <>
            <LabRange label={tr('Distance')} value={distance} min={1} max={10} unit="cm" onChange={change} testid="magnet-distance" />
            <button
              onClick={flip}
              data-testid="magnet-flip"
              className="w-full rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-[11px] font-extrabold text-coral"
            >
              {tr('Flip the second magnet')}
            </button>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('Like poles repel, opposite poles attract. The force gets weaker as the distance grows.')}
            </div>
            <LabChallenge done={attract}>{tr('Make the two magnets attract.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Discover the rule of magnetic poles.')}
        question={tr('When do two magnets attract?')}
        options={[tr('Opposite poles (N and S)'), tr('Like poles (N and N)'), tr('Always')]}
        correct={0}
        explanation={tr('Opposite poles attract, while like poles push each other away.')}
      />
    </>
  )
}
