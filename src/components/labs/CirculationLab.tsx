import { useState } from 'react'
import { Activity, Heart } from 'lucide-react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const STATES = [
  { id: 'rest', name: 'Resting', bpm: 70 },
  { id: 'walk', name: 'Walking', bpm: 100 },
  { id: 'run', name: 'Running', bpm: 150 },
  { id: 'sprint', name: 'Sprinting', bpm: 185 },
]

export function CirculationLab({ onInteract }: { onInteract: () => void }) {
  const [bpm, setBpm] = useState(70)
  const output = (bpm * 70) / 1000
  const zone = bpm < 90 ? 'rest' : bpm < 130 ? 'light' : bpm < 165 ? 'cardio' : 'peak'

  const set = (value: number) => {
    onInteract()
    setBpm(value)
  }

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-coral">{tr('Circulation lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('How fast is your heart?')}</h2>
            </div>
            <span className="rounded-full bg-coral/15 px-2.5 py-1 font-display text-sm font-extrabold tabular-nums text-coral" dir="ltr" data-testid="circulation-bpm">
              {bpm} bpm
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="relative grid h-[250px] place-items-center overflow-hidden rounded-2xl border border-line bg-ink-950">
              <svg viewBox="0 0 220 200" className="h-[230px]" role="img" aria-label={tr('Heart pumping blood')}>
                <path
                  d="M110 176 C 40 132 26 96 44 70 C 60 46 92 48 110 72 C 128 48 160 46 176 70 C 194 96 180 132 110 176 Z"
                  fill="#ef4444"
                  opacity="0.9"
                  style={{ transformOrigin: '110px 110px', animation: `heartBeat ${60 / bpm}s ease-in-out infinite` }}
                />
                <path d="M110 72 L110 176" stroke="#7f1d1d" strokeWidth="2" opacity="0.4" />
                <circle cx="110" cy="110" r="76" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.25" strokeDasharray="4 8" />
                {Array.from({ length: 7 }).map((_, index) => (
                  <circle key={index} r="2.5" fill="#fca5a5">
                    <animateMotion dur={`${2.6 - bpm / 140}s`} repeatCount="indefinite" path="M110 150 C 60 150 40 110 60 80 C 80 50 140 50 160 80 C 180 110 160 150 110 150" />
                  </circle>
                ))}
              </svg>
              <span className="absolute bottom-2 left-3 flex items-center gap-1 text-[9px] font-bold text-muted-2">
                <Activity className="h-3 w-3 text-coral" /> {tr('Stroke volume ≈ 70 ml')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Heart rate')} value={`${bpm}`} testid="circulation-rate" />
              <LabStat label={tr('Blood per minute')} value={`${output.toFixed(1)} L`} testid="circulation-output" />
              <LabStat label={tr('Zone')} value={zone === 'rest' ? tr('Resting') : zone === 'light' ? tr('Light') : zone === 'cardio' ? tr('Cardio') : tr('Peak')} />
            </div>
          </div>
        }
        controls={
          <>
            <LabRange label={tr('Heart rate')} value={bpm} min={50} max={200} unit="bpm" onChange={set} testid="circulation-slider" />
            <div className="grid grid-cols-2 gap-1.5">
              {STATES.map((state) => (
                <button
                  key={state.id}
                  onClick={() => set(state.bpm)}
                  data-testid={`circulation-${state.id}`}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-[10px] font-bold transition',
                    bpm === state.bpm ? 'border-coral/50 bg-coral/10 text-coral' : 'border-line bg-card-2 text-muted hover:text-main',
                  )}
                >
                  <Heart className="h-3 w-3" /> {tr(state.name)}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('Muscles need more oxygen during exercise, so the heart pumps faster and pushes more blood every minute.')}
            </div>
            <LabChallenge done={bpm >= 150}>{tr('Reach the cardio zone above 150 bpm.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Link exercise, heart rate and oxygen delivery.')}
        question={tr('Why does your heart beat faster when you run?')}
        options={[tr('To cool the body'), tr('To send more oxygen to muscles'), tr('To make more bones')]}
        correct={1}
        explanation={tr('Working muscles burn oxygen faster, so the heart pumps more blood each minute to deliver it.')}
      />
    </>
  )
}
