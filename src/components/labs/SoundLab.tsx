import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

export function SoundLab({ onInteract }: { onInteract: () => void }) {
  const [frequency, setFrequency] = useState(440)
  const [amplitude, setAmplitude] = useState(60)
  const pitch = frequency < 300 ? 'low' : frequency < 700 ? 'mid' : 'high'
  const decibels = Math.round(35 + amplitude * 0.6)
  const points = Array.from({ length: 161 }, (_, index) => {
    const x = (index / 160) * 420
    const y = 70 - Math.sin((index / 160) * Math.PI * 2 * (frequency / 110)) * (amplitude / 2.6)
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')

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
              <p className="label mb-1 text-sky">{tr('Sound lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Shape the wave')}</h2>
            </div>
            <span className="rounded-full bg-sky/15 px-2.5 py-1 text-[10px] font-extrabold text-sky" data-testid="sound-pitch">
              {pitch === 'low' ? tr('Low pitch') : pitch === 'mid' ? tr('Medium pitch') : tr('High pitch')}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl border border-line bg-ink-950 p-3">
              <svg viewBox="0 0 440 150" className="h-[160px] w-full" role="img" aria-label={tr('Sound wave')} data-testid="sound-wave">
                <line x1="0" y1="70" x2="440" y2="70" stroke="#2b3550" strokeWidth="1" strokeDasharray="3 4" />
                <path d={points} fill="none" stroke="#5cc8ff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <div className="absolute bottom-2 right-2 flex items-end gap-1">
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className="w-1.5 rounded-full bg-sky"
                    style={{
                      height: `${8 + amplitude * 0.22 + index * 4}px`,
                      opacity: 0.4 + index * 0.2,
                      animation: `soundPulse ${1.1 - frequency / 1600}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Frequency')} value={`${frequency} Hz`} testid="sound-frequency" />
              <LabStat label={tr('Loudness')} value={`${decibels} dB`} />
              <LabStat label={tr('Pitch')} value={pitch === 'low' ? tr('Low') : pitch === 'mid' ? tr('Medium') : tr('High')} />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Frequency changes the pitch, amplitude changes the volume.')}</p>
            <LabRange label={tr('Frequency')} value={frequency} min={100} max={1000} step={10} unit="Hz" onChange={change(setFrequency)} testid="sound-freq" />
            <LabRange label={tr('Amplitude')} value={amplitude} min={0} max={100} unit="%" onChange={change(setAmplitude)} testid="sound-amp" />
            <div className="flex items-center gap-2 rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              <Volume2 className="h-4 w-4 shrink-0 text-sky" />
              {tr('A tight, fast wave sounds high. A tall wave sounds loud. Human hearing starts around 20 Hz and stops near 20,000 Hz.')}
            </div>
            <LabChallenge done={frequency >= 800 && amplitude >= 70}>{tr('Make a loud, high sound.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Link the shape of a wave to what your ear hears.')}
        question={tr('A guitar string vibrates faster. What changes?')}
        options={[tr('The pitch gets higher'), tr('The sound gets quieter'), tr('Nothing changes')]}
        correct={0}
        explanation={tr('Faster vibration means a higher frequency, and a higher frequency is a higher pitch.')}
      />
    </>
  )
}
