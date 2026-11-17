import { useState } from 'react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const PARTICLES = Array.from({ length: 16 }, (_, index) => index)

export function StatesLab({ onInteract }: { onInteract: () => void }) {
  const [temperature, setTemperature] = useState(25)
  const state = temperature <= 0 ? 'solid' : temperature < 100 ? 'liquid' : 'gas'
  const stateLabel = state === 'solid' ? tr('Solid') : state === 'liquid' ? tr('Liquid') : tr('Gas')

  const change = (value: number) => {
    onInteract()
    setTemperature(value)
  }

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-sky">{tr('States lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Heat the particles')}</h2>
            </div>
            <span className="rounded-full bg-sky/15 px-2.5 py-1 text-[10px] font-extrabold text-sky" data-testid="states-name">
              {stateLabel}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="relative h-[280px] overflow-hidden rounded-2xl border border-line bg-ink-950" data-testid="states-box">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-sky/5" />
              {PARTICLES.map((index) => {
                const column = index % 4
                const row = Math.floor(index / 4)
                const solidLeft = 38 + column * 46
                const solidTop = 190 + row * 14
                const liquidLeft = 30 + ((index * 37) % 190)
                const liquidTop = 210 - (index % 4) * 9
                const gasLeft = 20 + ((index * 53) % 210)
                const gasTop = 20 + ((index * 31) % 190)
                const left = state === 'solid' ? solidLeft : state === 'liquid' ? liquidLeft : gasLeft
                const top = state === 'solid' ? solidTop : state === 'liquid' ? liquidTop : gasTop
                return (
                  <span
                    key={index}
                    className="absolute h-3 w-3 rounded-full"
                    style={{
                      left,
                      top,
                      background: state === 'gas' ? '#6b8cff' : '#21e6c9',
                      boxShadow: `0 0 10px ${state === 'gas' ? '#6b8cff88' : '#21e6c988'}`,
                      transition: 'left .6s ease, top .6s ease, background .3s',
                    }}
                  />
                )
              })}
              <div className="absolute end-2 top-2 h-36 w-3 rounded-full bg-white/10">
                <div
                  className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-coral to-sun"
                  style={{ height: `${Math.max(4, ((temperature + 20) / 140) * 100)}%`, transition: 'height .4s' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <LabStat label={tr('Temperature')} value={`${temperature} °C`} testid="states-temp" />
              <LabStat label={tr('State')} value={stateLabel} />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Heat or cool the water and watch the particles.')}</p>
            <LabRange label={tr('Temperature')} value={temperature} min={-20} max={120} step={5} unit="°C" onChange={change} testid="states-slider" />
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('Solid particles vibrate in place, liquid particles slide, gas particles fly apart.')}
            </div>
            <LabChallenge done={state === 'gas'}>{tr('Heat the water until it becomes a gas.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('See how temperature changes the state of water.')}
        question={tr('At 120 °C, what is water?')}
        options={[tr('Gas (steam)'), tr('Solid (ice)'), tr('Liquid')]}
        correct={0}
        explanation={tr('Above 100 °C water boils and becomes steam — a gas.')}
      />
    </>
  )
}
