import { useState } from 'react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const gridStyle = {
  backgroundColor: '#21e6c9',
  backgroundImage: 'linear-gradient(#071018 1px, transparent 1px), linear-gradient(90deg, #071018 1px, transparent 1px)',
  backgroundSize: '6px 6px',
}

export function PlaceValueLab({ onInteract }: { onInteract: () => void }) {
  const [hundreds, setHundreds] = useState(3)
  const [tens, setTens] = useState(4)
  const [ones, setOnes] = useState(5)
  const number = hundreds * 100 + tens * 10 + ones

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
              <p className="label mb-1 text-aurora-300">{tr('Place value lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Build the number')}</h2>
            </div>
            <span className="rounded-full bg-aurora-400/15 px-2.5 py-1 font-display text-lg font-extrabold tabular-nums text-aurora-200" dir="ltr" data-testid="place-number">
              {number}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="flex min-h-[190px] flex-wrap items-end justify-center gap-4 rounded-2xl border border-line bg-ink-950 p-4" data-testid="place-blocks">
              {hundreds > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5" style={{ maxWidth: 200 }}>
                  {Array.from({ length: hundreds }).map((_, index) => (
                    <div key={`h-${index}`} className="h-[60px] w-[60px] rounded-sm border border-aurora-300/70" style={gridStyle} />
                  ))}
                </div>
              )}
              {tens > 0 && (
                <div className="flex gap-1.5">
                  {Array.from({ length: tens }).map((_, index) => (
                    <div key={`t-${index}`} className="h-[60px] w-[12px] rounded-sm border border-sky/70" style={{ ...gridStyle, backgroundColor: '#5cc8ff' }} />
                  ))}
                </div>
              )}
              {ones > 0 && (
                <div className="flex flex-wrap gap-1" style={{ maxWidth: 90 }}>
                  {Array.from({ length: ones }).map((_, index) => (
                    <div key={`o-${index}`} className="h-3 w-3 rounded-sm border border-sun/70" style={{ ...gridStyle, backgroundColor: '#ffd166', backgroundSize: '3px 3px' }} />
                  ))}
                </div>
              )}
              {number === 0 && <p className="text-[11px] font-bold text-muted-2">{tr('Zero — no blocks at all.')}</p>}
            </div>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-center font-display text-base font-extrabold text-main" dir="ltr" data-testid="place-expanded">
              {hundreds * 100} + {tens * 10} + {ones} = {number}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Hundreds')} value={String(hundreds)} testid="place-hundreds" />
              <LabStat label={tr('Tens')} value={String(tens)} testid="place-tens" />
              <LabStat label={tr('Ones')} value={String(ones)} testid="place-ones" />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Each hundred is a flat of 100, each rod is 10, each cube is 1.')}</p>
            <LabRange label={tr('Hundreds')} value={hundreds} min={0} max={9} onChange={change(setHundreds)} testid="place-hundreds-slider" />
            <LabRange label={tr('Tens')} value={tens} min={0} max={9} onChange={change(setTens)} testid="place-tens-slider" />
            <LabRange label={tr('Ones')} value={ones} min={0} max={9} onChange={change(setOnes)} testid="place-ones-slider" />
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('0 ones is written 0, and it still holds the place. 4 hundreds and 7 ones make 407, not 47.')}
            </div>
            <LabChallenge done={hundreds === 4 && tens === 0 && ones === 7}>{tr('Build 407 with a zero in the tens.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Read a three-digit number by its hundreds, tens and ones.')}
        question={tr('In 523, what does the 5 stand for?')}
        options={[tr('5 ones'), tr('5 tens'), tr('5 hundreds')]}
        correct={2}
        explanation={tr('The 5 sits in the hundreds place, so it means 500.')}
      />
    </>
  )
}
