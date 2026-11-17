import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const PLACES = [128, 64, 32, 16, 8, 4, 2, 1]

export function BinaryLab({ onInteract }: { onInteract: () => void }) {
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0])
  const value = bits.reduce((sum, bit, index) => sum + bit * PLACES[index], 0)
  const character = value >= 32 && value <= 126 ? String.fromCharCode(value) : '·'

  const toggle = (index: number) => {
    onInteract()
    setBits((current) => current.map((bit, position) => (position === index ? (bit ? 0 : 1) : bit)))
  }

  const reset = () => {
    onInteract()
    setBits([0, 0, 0, 0, 0, 0, 0, 0])
  }

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-sky">{tr('Binary lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Talk to the computer')}</h2>
            </div>
            <span className="rounded-full bg-sky/15 px-2.5 py-1 font-display text-sm font-extrabold tabular-nums text-sky" dir="ltr" data-testid="binary-value">
              {value}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-ink-950 p-4">
              <div className="grid grid-cols-8 gap-1.5" data-testid="binary-bits" dir="ltr">
                {PLACES.map((place, index) => (
                  <button
                    key={place}
                    onClick={() => toggle(index)}
                    data-testid={`binary-bit-${index}`}
                    className={cn(
                      'rounded-lg border py-2 text-center transition',
                      bits[index]
                        ? 'border-aurora-400/70 bg-aurora-400/20 text-aurora-200 shadow-[0_0_12px_rgba(33,230,201,.25)]'
                        : 'border-line bg-card-2 text-muted-2',
                    )}
                  >
                    <span className="block font-display text-lg font-extrabold">{bits[index]}</span>
                    <span className="block text-[7px] font-bold opacity-70">{place}</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center font-mono text-sm font-bold tracking-[0.3em] text-main" data-testid="binary-string">
                {bits.join('')}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Decimal')} value={String(value)} testid="binary-decimal" />
              <LabStat label={tr('Character')} value={character} testid="binary-char" />
              <LabStat label={tr('Bits on')} value={String(bits.filter(Boolean).length)} />
            </div>
            <p className="rounded-xl border border-line bg-card-2 px-3 py-2 text-center text-[10px] leading-relaxed text-muted">
              {tr('Each switch doubles the value of the one on its right: 128, 64, 32, 16, 8, 4, 2, 1.')}
            </p>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Flip the switches and add the place values where a 1 is showing.')}</p>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted" data-testid="binary-sum">
              <span dir="ltr" className="font-bold text-main">
                {bits.map((bit, index) => (bit ? PLACES[index] : null)).filter(Boolean).join(' + ') || '0'} = {value}
              </span>
            </div>
            <button onClick={reset} data-testid="binary-reset" className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-card-2 px-3 py-2 text-[11px] font-extrabold text-muted">
              <RotateCcw className="h-3.5 w-3.5" /> {tr('Reset')}
            </button>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('Computers store letters as numbers. Capital A is 65, so its code is 01000001.')}
            </div>
            <LabChallenge done={value === 65}>{tr('Make 65 — the code for the letter A.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Read and build binary numbers.')}
        question={tr('What is 00000101 in decimal?')}
        options={['3', '5', '10']}
        correct={1}
        explanation={tr('4 + 1 = 5, so the switches for 4 and 1 are on.')}
      />
    </>
  )
}
