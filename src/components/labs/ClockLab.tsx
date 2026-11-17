import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const pad = (value: number) => String(value).padStart(2, '0')

export function ClockLab({ onInteract }: { onInteract: () => void }) {
  const [hour, setHour] = useState(9)
  const [minute, setMinute] = useState(0)

  const nudge = (delta: number) => {
    onInteract()
    const total = (hour % 12) * 60 + minute + delta
    const normal = ((total % 720) + 720) % 720
    const nextHour = Math.floor(normal / 60)
    setHour(nextHour === 0 ? 12 : nextHour)
    setMinute(normal % 60)
  }

  const minuteAngle = minute * 6
  const hourAngle = (hour % 12) * 30 + minute * 0.5

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-sun">{tr('Clock lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Read the time')}</h2>
            </div>
            <span className="rounded-full bg-sun/15 px-2.5 py-1 font-display text-sm font-extrabold tabular-nums text-sun" dir="ltr" data-testid="clock-digital">
              {hour}:{pad(minute)}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="grid place-items-center rounded-2xl border border-line bg-ink-950 p-3">
              <svg viewBox="0 0 220 220" className="h-[240px] w-[240px]" role="img" aria-label={tr('Analogue clock')} data-testid="clock-face">
                <circle cx="110" cy="110" r="96" fill="#0d1424" stroke="#3a4560" strokeWidth="4" />
                {Array.from({ length: 60 }).map((_, index) => {
                  const angle = (index * 6 * Math.PI) / 180
                  const long = index % 5 === 0
                  const r1 = long ? 78 : 85
                  return (
                    <line
                      key={index}
                      x1={110 + Math.sin(angle) * r1}
                      y1={110 - Math.cos(angle) * r1}
                      x2={110 + Math.sin(angle) * 90}
                      y2={110 - Math.cos(angle) * 90}
                      stroke={long ? '#8fa3c8' : '#33405c'}
                      strokeWidth={long ? 3 : 1.5}
                      strokeLinecap="round"
                    />
                  )
                })}
                {Array.from({ length: 12 }).map((_, index) => {
                  const value = index + 1
                  const angle = (value * 30 * Math.PI) / 180
                  return (
                    <text
                      key={value}
                      x={110 + Math.sin(angle) * 66}
                      y={110 - Math.cos(angle) * 66 + 5}
                      textAnchor="middle"
                      fill="#dbe7ff"
                      fontSize="14"
                      fontWeight="700"
                    >
                      {value}
                    </text>
                  )
                })}
                <line
                  x1="110"
                  y1="110"
                  x2={110 + Math.sin((hourAngle * Math.PI) / 180) * 46}
                  y2={110 - Math.cos((hourAngle * Math.PI) / 180) * 46}
                  stroke="#21e6c9"
                  strokeWidth="7"
                  strokeLinecap="round"
                  style={{ transition: 'all .3s' }}
                />
                <line
                  x1="110"
                  y1="110"
                  x2={110 + Math.sin((minuteAngle * Math.PI) / 180) * 72}
                  y2={110 - Math.cos((minuteAngle * Math.PI) / 180) * 72}
                  stroke="#6b8cff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  style={{ transition: 'all .3s' }}
                />
                <circle cx="110" cy="110" r="6" fill="#ffd166" />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <LabStat label={tr('Hour hand')} value={String(hour)} />
              <LabStat label={tr('Minute hand')} value={pad(minute)} />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Move the hands and read the digital time.')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => nudge(-15)}
                data-testid="clock-back"
                className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-line bg-card-2 px-3 py-2 text-[11px] font-extrabold text-muted"
              >
                <Minus className="h-3.5 w-3.5" /> {tr('15 minutes')}
              </button>
              <button
                onClick={() => nudge(15)}
                data-testid="clock-forward"
                className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-sun/40 bg-sun/10 px-3 py-2 text-[11px] font-extrabold text-sun"
              >
                <Plus className="h-3.5 w-3.5" /> {tr('15 minutes')}
              </button>
            </div>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('The minute hand goes all the way round in 60 minutes. A quarter of the face is 15 minutes.')}
            </div>
            <LabChallenge done={hour === 3 && minute === 45}>{tr('Set the clock to 3:45.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Connect the position of the hands with the time we say.')}
        question={tr('The minute hand points at 6. How many minutes is that?')}
        options={['15', '30', '60']}
        correct={1}
        explanation={tr('Each number is 5 minutes, so 6 × 5 = 30 minutes — half past.')}
      />
    </>
  )
}
