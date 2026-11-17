import { useState } from 'react'
import { Flame } from 'lucide-react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const MATERIALS = [
  { id: 'copper', name: 'Copper', k: 400, color: '#f97316' },
  { id: 'aluminium', name: 'Aluminium', k: 235, color: '#cbd5e1' },
  { id: 'iron', name: 'Iron', k: 80, color: '#94a3b8' },
  { id: 'glass', name: 'Glass', k: 1, color: '#93c5fd' },
  { id: 'wood', name: 'Wood', k: 0.15, color: '#a16207' },
]

export function HeatLab({ onInteract }: { onInteract: () => void }) {
  const [material, setMaterial] = useState('copper')
  const [time, setTime] = useState(10)
  const rod = MATERIALS.find((item) => item.id === material) || MATERIALS[0]
  const reached = 25 + 75 * (1 - Math.exp((-rod.k / 400) * (time / 8)))
  const hotEnd = Math.min(1, reached / 100)
  const pins = [40, 60, 80].map((threshold, index) => ({ threshold, index, fallen: reached >= threshold }))

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-coral">{tr('Heat lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Which rod conducts fastest?')}</h2>
            </div>
            <span className="rounded-full bg-coral/15 px-2.5 py-1 font-display text-sm font-extrabold tabular-nums text-coral" dir="ltr" data-testid="heat-temp">
              {reached.toFixed(0)} °C
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-ink-950 p-4">
              <div className="relative h-[150px]">
                <div
                  className="absolute left-0 top-1/2 h-9 w-full -translate-y-1/2 rounded-full border border-white/15"
                  style={{
                    background: `linear-gradient(90deg, #ff6b6b 0%, #f97316 ${hotEnd * 45}%, ${rod.color} ${Math.min(96, 20 + hotEnd * 70)}%, ${rod.color} 100%)`,
                    transition: 'background .4s',
                  }}
                />
                <div className="absolute -left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-coral/20">
                  <Flame className="h-6 w-6 text-coral" />
                </div>
                {pins.map((pin) => (
                  <span
                    key={pin.threshold}
                    className="absolute top-1/2 h-7 w-1.5 rounded-full bg-sun"
                    style={{
                      left: `${28 + pin.index * 22}%`,
                      transform: pin.fallen ? 'translateY(46px) rotate(70deg)' : 'translateY(-38px)',
                      opacity: pin.fallen ? 0.35 : 1,
                      transition: 'all .5s ease',
                    }}
                  />
                ))}
                <span className="absolute bottom-0 left-2 text-[9px] font-bold text-coral">{tr('Heat source')}</span>
                <span className="absolute bottom-0 right-2 text-[9px] font-bold text-muted-2">{tr('Wax pins')}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Temperature')} value={`${reached.toFixed(0)} °C`} testid="heat-readout" />
              <LabStat label={tr('Conductivity')} value={`${rod.k} W/m·K`} />
              <LabStat label={tr('Pins fallen')} value={`${pins.filter((pin) => pin.fallen).length}/3`} testid="heat-pins" />
            </div>
          </div>
        }
        controls={
          <>
            <LabRange label={tr('Time on the flame')} value={time} min={0} max={60} unit="s" onChange={(value) => { onInteract(); setTime(value) }} testid="heat-time" />
            <div>
              <p className="mb-1 text-[10px] font-bold text-muted-2">{tr('Material')}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {MATERIALS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setMaterial(item.id); onInteract() }}
                    data-testid={`heat-${item.id}`}
                    className={cn(
                      'flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-[10px] font-bold transition',
                      item.id === material ? 'border-coral/50 bg-coral/10 text-coral' : 'border-line bg-card-2 text-muted hover:text-main',
                    )}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    {tr(item.name)}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('Heat travels along the rod and melts the wax pins one by one. Metals pass heat quickly; wood and glass barely pass it.')}
            </div>
            <LabChallenge done={material === 'copper' && reached >= 80}>{tr('Melt all three pins with the best conductor.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Compare materials by how fast heat moves through them.')}
        question={tr('Why does a metal spoon feel hotter than a wooden one in the same soup?')}
        options={[tr('Metal is heavier'), tr('Metal conducts heat better'), tr('Wood is colder')]}
        correct={1}
        explanation={tr('Metals have free electrons that carry heat quickly, so the handle warms up fast.')}
      />
    </>
  )
}
