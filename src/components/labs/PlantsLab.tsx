import { useState } from 'react'
import { Droplets, Sun, Wind } from 'lucide-react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

export function PlantsLab({ onInteract }: { onInteract: () => void }) {
  const [light, setLight] = useState(70)
  const [water, setWater] = useState(60)
  const [co2, setCo2] = useState(55)
  const rate = Math.min(light, water, co2) / 100
  const oxygen = Math.round(rate * 8)
  const height = 40 + rate * 95

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
              <p className="label mb-1 text-aurora-300">{tr('Plants lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Feed the leaf')}</h2>
            </div>
            <span className="rounded-full bg-aurora-400/15 px-2.5 py-1 text-[10px] font-extrabold text-aurora-200" data-testid="plants-rate">
              {Math.round(rate * 100)}%
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="relative h-[290px] overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-[#102444] to-[#0b1220]" data-testid="plants-scene">
              <div className="absolute right-5 top-5" aria-hidden>
                <Sun className="h-10 w-10 text-sun" style={{ opacity: 0.25 + light / 140 }} />
                {Array.from({ length: 8 }).map((_, index) => (
                  <span
                    key={index}
                    className="absolute left-1/2 top-1/2 h-px w-14 origin-left bg-sun"
                    style={{
                      opacity: light / 260,
                      transform: `rotate(${index * 45}deg) translateX(26px)`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-16 bg-[#123322]" />
              <div className="absolute bottom-14 left-1/2 h-10 w-24 -translate-x-1/2 rounded-full bg-[#1b4a33]" />
              <div
                className="absolute bottom-[68px] left-1/2 w-2 -translate-x-1/2 rounded-full bg-gradient-to-t from-[#2f9e6a] to-[#7ef2b8]"
                style={{ height, transition: 'height .5s ease' }}
              />
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className="absolute left-1/2 h-8 w-14 rounded-full bg-[#33c98a]/80"
                  style={{
                    bottom: 70 + height * (0.35 + index * 0.22),
                    transform: `translateX(-50%) translateX(${index % 2 === 0 ? -22 : 22}px) rotate(${index % 2 === 0 ? -24 : 24}deg) scaleX(${0.5 + rate * 0.6})`,
                    transition: 'all .5s ease',
                  }}
                />
              ))}
              {Array.from({ length: oxygen }).map((_, index) => (
                <span
                  key={`o-${index}`}
                  className="absolute h-2.5 w-2.5 rounded-full border border-sky/70 bg-sky/20"
                  style={{ left: `calc(50% + ${(index - oxygen / 2) * 16}px)`, bottom: 120, animation: `floatUp ${2 + index * 0.2}s linear infinite` }}
                />
              ))}
              <span className="absolute bottom-2 left-3 text-[10px] font-bold text-aurora-200">O₂</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Oxygen')} value={`${oxygen}`} testid="plants-oxygen" />
              <LabStat label={tr('Glucose')} value={`${(rate * 6).toFixed(1)} g`} />
              <LabStat label={tr('Growth')} value={`${Math.round(rate * 100)}%`} />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('A leaf needs three inputs. Remove one and it slows down.')}</p>
            <LabRange label={tr('Sunlight')} value={light} min={0} max={100} unit="%" onChange={change(setLight)} testid="plants-light" />
            <LabRange label={tr('Water')} value={water} min={0} max={100} unit="%" onChange={change(setWater)} testid="plants-water" />
            <LabRange label={tr('Carbon dioxide')} value={co2} min={0} max={100} unit="%" onChange={change(setCo2)} testid="plants-co2" />
            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-muted">
              <span className="inline-flex items-center gap-1 rounded-full bg-sun/10 px-2 py-1 text-sun"><Sun className="h-3 w-3" /> {tr('Light')}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky/10 px-2 py-1 text-sky"><Droplets className="h-3 w-3" /> {tr('Water')}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-aurora-400/10 px-2 py-1 text-aurora-200"><Wind className="h-3 w-3" /> {tr('CO₂')}</span>
            </div>
            <LabChallenge done={rate >= 0.9}>{tr('Give the leaf everything it needs.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Find what a plant needs to make its own food.')}
        question={tr('Which gas does the leaf release during photosynthesis?')}
        options={[tr('Oxygen'), tr('Carbon dioxide'), tr('Nitrogen')]}
        correct={0}
        explanation={tr('Water and carbon dioxide become glucose, and oxygen leaves through the leaf.')}
      />
    </>
  )
}
