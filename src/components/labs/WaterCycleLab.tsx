import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

export function WaterCycleLab({ onInteract }: { onInteract: () => void }) {
  const [heat, setHeat] = useState(60)
  const [running, setRunning] = useState(true)
  const [cloud, setCloud] = useState(0)
  const [raining, setRaining] = useState(false)

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setCloud((current) => {
        if (raining) {
          const next = current - 14
          if (next <= 0) {
            setRaining(false)
            return 0
          }
          return next
        }
        const next = current + heat / 18
        if (next >= 100) {
          setRaining(true)
          return 100
        }
        return next
      })
    }, 360)
    return () => window.clearInterval(timer)
  }, [running, heat, raining])

  const reset = () => {
    onInteract()
    setCloud(0)
    setRaining(false)
    setRunning(true)
  }

  const toggle = () => {
    onInteract()
    setRunning((value) => !value)
  }

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-sky">{tr('Water cycle lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Make it rain')}</h2>
            </div>
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-extrabold',
                raining ? 'bg-sky/20 text-sky' : 'bg-sun/15 text-sun',
              )}
              data-testid="cycle-state"
            >
              {raining ? tr('Raining') : tr('Evaporating')}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="relative h-[300px] overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-[#102444] via-[#0c1a33] to-[#0b1220]" data-testid="cycle-sky">
              <svg viewBox="0 0 420 300" className="h-full w-full" role="img" aria-label={tr('Water cycle')}>
                <circle cx="340" cy="56" r="30" fill="#ffd166" opacity={0.4 + heat / 200} />
                {Array.from({ length: 8 }).map((_, index) => (
                  <line
                    key={`ray-${index}`}
                    x1="340"
                    y1="56"
                    x2={340 + Math.cos((index / 8) * Math.PI * 2) * 52}
                    y2={56 + Math.sin((index / 8) * Math.PI * 2) * 52}
                    stroke="#ffd166"
                    strokeWidth="2"
                    opacity={heat / 180}
                  />
                ))}
                <path d="M0 232 Q90 218 180 232 T420 232 V300 H0 Z" fill="#0e3a5c" />
                <path d="M0 246 Q120 236 240 246 T420 246" stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.5" />
                <path d="M0 270 Q140 258 280 270 T420 270" stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.35" />
                <ellipse cx="250" cy="90" rx={30 + cloud * 0.7} ry={12 + cloud * 0.2} fill="#cbd5e1" opacity={0.25 + cloud / 160} />
                <ellipse cx="285" cy="82" rx={24 + cloud * 0.5} ry={10 + cloud * 0.16} fill="#e2e8f0" opacity={0.2 + cloud / 170} />
                {running && heat > 0 && !raining &&
                  Array.from({ length: 5 }).map((_, index) => (
                    <circle key={`up-${index}`} cx={120 + index * 26} cy="220" r="3" fill="#8fd3ff" opacity="0.8">
                      <animate attributeName="cy" dur={`${2 + index * 0.3}s`} repeatCount="indefinite" values="230;120" />
                      <animate attributeName="opacity" dur={`${2 + index * 0.3}s`} repeatCount="indefinite" values="0.8;0" />
                    </circle>
                  ))}
                {raining &&
                  Array.from({ length: 10 }).map((_, index) => (
                    <line key={`rain-${index}`} x1={220 + index * 12} y1="110" x2={214 + index * 12} y2="140" stroke="#7dd3fc" strokeWidth="2" opacity="0.85">
                      <animate attributeName="y1" dur="0.7s" repeatCount="indefinite" values="100;220" />
                      <animate attributeName="y2" dur="0.7s" repeatCount="indefinite" values="130;250" />
                    </line>
                  ))}
                <path d="M0 232 L70 190 L140 232" fill="#1f5c3a" opacity="0.8" />
                <text x="210" y="286" textAnchor="middle" fill="#8fd3ff" fontSize="10">
                  {tr('Sea')}
                </text>
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <LabStat label={tr('Cloud')} value={`${Math.round(cloud)}%`} testid="cycle-cloud" />
              <LabStat label={tr('Sun heat')} value={`${heat}%`} />
            </div>
          </div>
        }
        controls={
          <>
            <LabRange label={tr('Sun heat')} value={heat} min={0} max={100} unit="%" onChange={(value) => { onInteract(); setHeat(value) }} testid="cycle-heat" />
            <div className="flex gap-2">
              <button
                onClick={toggle}
                data-testid="cycle-toggle"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-sky/40 bg-sky/10 px-3 py-2 text-[11px] font-extrabold text-sky"
              >
                {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {running ? tr('Pause') : tr('Start')}
              </button>
              <button
                onClick={reset}
                data-testid="cycle-reset"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-card-2 px-3 py-2 text-[11px] font-extrabold text-muted"
              >
                <RotateCcw className="h-3.5 w-3.5" /> {tr('Reset')}
              </button>
            </div>
            <p className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('Heat evaporates the sea, vapor rises, cools into a cloud, and the cloud rains when it is full.')}
            </p>
            <LabChallenge done={raining}>{tr('Let the cloud fill until it rains.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Follow water from the sea to the cloud and back.')}
        question={tr('What makes the vapor turn into a cloud?')}
        options={[tr('Cooling'), tr('Heating'), tr('Gravity')]}
        correct={0}
        explanation={tr('High vapor cools as it rises, condenses into tiny drops, and forms a cloud.')}
      />
    </>
  )
}
