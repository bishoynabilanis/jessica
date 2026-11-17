import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'

const G = 9.8

export function ForcesLab({ onInteract }: { onInteract: () => void }) {
  const [mass, setMass] = useState(5)
  const [force, setForce] = useState(40)
  const [friction, setFriction] = useState(0.3)

  const frictionForce = friction * mass * G
  const moving = force > frictionForce
  const net = moving ? force - frictionForce : 0
  const acceleration = net / mass
  const offset = Math.min(64, acceleration * 10)

  const change = (setter: (value: number) => void) => (value: number) => {
    onInteract()
    setter(value)
  }

  return (
    <LabFrame
      header={
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="label mb-1 text-sun">{tr('Forces lab')}</p>
            <h2 className="font-display text-lg font-extrabold text-main">{tr('Push it and see')}</h2>
          </div>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[10px] font-extrabold',
              moving ? 'bg-aurora-400/15 text-aurora-200' : 'bg-coral/15 text-coral',
            )}
            data-testid="forces-state"
          >
            {moving ? tr('Moving') : tr('Static')}
          </span>
        </div>
      }
      visual={
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-line bg-ink-950 p-4">
            <svg viewBox="0 0 520 220" className="w-full" role="img" aria-label={tr('A box on a track')}>
              <line x1="30" y1="170" x2="490" y2="170" stroke="#556080" strokeWidth="4" strokeLinecap="round" />
              <g style={{ transform: `translateX(${offset}px)`, transition: 'transform .45s ease' }}>
                <rect x="120" y="112" width="86" height="58" rx="8" fill="#21e6c9" opacity="0.22" stroke="#21e6c9" strokeWidth="2" />
                <text x="163" y="147" textAnchor="middle" fill="#dbe7ff" fontSize="12" fontWeight="700">
                  {mass} kg
                </text>
              </g>
              <line x1="206" y1="140" x2={206 + Math.min(140, force * 0.7)} y2="140" stroke="#21e6c9" strokeWidth="4" strokeLinecap="round" />
              <polygon
                points={`${206 + Math.min(140, force * 0.7)},134 ${206 + Math.min(140, force * 0.7)},146 ${216 + Math.min(140, force * 0.7)},140`}
                fill="#21e6c9"
              />
              <line x1="120" y1="184" x2={120 - Math.min(70, frictionForce * 0.7)} y2="184" stroke="#ff7a7a" strokeWidth="4" strokeLinecap="round" />
              <text x="250" y="135" fill="#8fb0ff" fontSize="10">
                F
              </text>
              <text x="92" y="198" fill="#ff9d9d" fontSize="10">
                {tr('Friction')}
              </text>
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <LabStat label={tr('Net force')} value={`${net.toFixed(1)} N`} testid="forces-net" />
            <LabStat label={tr('Acceleration')} value={`${acceleration.toFixed(1)} m/s²`} testid="forces-acceleration" />
          </div>
        </div>
      }
      controls={
        <>
          <p className="text-[11px] font-bold text-muted-2">{tr('Force, mass and friction decide the acceleration.')}</p>
          <LabRange label={tr('Mass')} value={mass} min={1} max={20} unit="kg" onChange={change(setMass)} testid="forces-mass" />
          <LabRange label={tr('Applied force')} value={force} min={0} max={200} step={5} unit="N" onChange={change(setForce)} testid="forces-force" />
          <LabRange label={tr('Friction')} value={friction} min={0} max={1} step={0.05} onChange={change(setFriction)} testid="forces-friction" />
          <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
            <span dir="ltr">F = m × a · friction = μ × m × g</span>
          </div>
          <LabChallenge done={acceleration >= 3}>{tr('Reach an acceleration of at least 3 m/s².')}</LabChallenge>
        </>
      }
    />
  )
}
