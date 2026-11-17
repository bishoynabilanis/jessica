import { useState } from 'react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

export function LeverLab({ onInteract }: { onInteract: () => void }) {
  const [load, setLoad] = useState(60)
  const [loadDistance, setLoadDistance] = useState(2)
  const [effortDistance, setEffortDistance] = useState(2)
  const [effort, setEffort] = useState(60)
  const loadMoment = load * loadDistance
  const effortMoment = effort * effortDistance
  const difference = effortMoment - loadMoment
  const balanced = Math.abs(difference) < 0.5
  const tilt = Math.max(-9, Math.min(9, difference / 12))

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
              <p className="label mb-1 text-sun">{tr('Lever lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Lift it with a small force')}</h2>
            </div>
            <span className="rounded-full bg-sun/15 px-2.5 py-1 text-[10px] font-extrabold text-sun" data-testid="lever-state">
              {balanced ? tr('Balanced') : difference > 0 ? tr('Effort side drops') : tr('Load side drops')}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-line bg-ink-950 p-3">
              <svg viewBox="0 0 460 220" className="w-full" role="img" aria-label={tr('Lever and fulcrum')}>
                <g transform={`rotate(${tilt} 230 120)`}>
                  <rect x="30" y="112" width="400" height="12" rx="6" fill="#8fa3c8" />
                  <rect x={30 + (loadDistance / 3) * 340} y="70" width="44" height="42" rx="5" fill="#6b8cff" opacity="0.9" />
                  <text x={52 + (loadDistance / 3) * 340} y="96" textAnchor="middle" fill="#071018" fontSize="11" fontWeight="800">
                    {load}N
                  </text>
                  <path d={`M${120 + (effortDistance / 3) * 300} 58 l0 54 M${112 + (effortDistance / 3) * 300} 68 l8 -10 l8 10`} stroke="#21e6c9" strokeWidth="3" fill="none" />
                  <text x={128 + (effortDistance / 3) * 300} y="66" fill="#21e6c9" fontSize="11" fontWeight="800">
                    {effort}N
                  </text>
                </g>
                <path d="M210 210 L230 124 L250 210 Z" fill="#3a4560" />
                <circle cx="230" cy="122" r="5" fill="#ffd166" />
                <text x="230" y="200" textAnchor="middle" fill="#8fa3c8" fontSize="9" fontWeight="700">
                  {tr('Fulcrum')}
                </text>
              </svg>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Load moment')} value={`${loadMoment.toFixed(0)} N·m`} testid="lever-load-moment" />
              <LabStat label={tr('Effort moment')} value={`${effortMoment.toFixed(0)} N·m`} testid="lever-effort-moment" />
              <LabStat label={tr('Status')} value={balanced ? tr('Balanced') : difference > 0 ? tr('Tipped') : tr('Tipped')} />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('A lever multiplies force. The trick is distance from the fulcrum.')}</p>
            <LabRange label={tr('Load')} value={load} min={10} max={100} step={5} unit="N" onChange={change(setLoad)} testid="lever-load" />
            <LabRange label={tr('Load distance')} value={loadDistance} min={0.5} max={3} step={0.5} unit="m" onChange={change(setLoadDistance)} testid="lever-load-distance" />
            <LabRange label={tr('Effort distance')} value={effortDistance} min={0.5} max={3} step={0.5} unit="m" onChange={change(setEffortDistance)} testid="lever-effort-distance" />
            <LabRange label={tr('Effort force')} value={effort} min={0} max={100} step={5} unit="N" onChange={change(setEffort)} testid="lever-effort" />
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('Moment = force × distance. Balance means the two moments are equal.')}
            </div>
            <LabChallenge done={balanced}>{tr('Balance the lever with the load in place.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Discover why a long lever lifts a heavy load easily.')}
        question={tr('Where should you push to lift a heavy rock with the least force?')}
        options={[tr('Close to the fulcrum'), tr('Far from the fulcrum'), tr('Right on the fulcrum')]}
        correct={1}
        explanation={tr('A bigger distance multiplies your force, so pushing far from the fulcrum needs less effort.')}
      />
    </>
  )
}
