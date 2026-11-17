import { useState } from 'react'
import { RotateCcw, Wallet } from 'lucide-react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const NOTES = [1, 5, 10, 20, 50, 100]

export function MoneyLab({ onInteract }: { onInteract: () => void }) {
  const [price, setPrice] = useState(35)
  const [paid, setPaid] = useState(0)
  const change = paid - price
  const notes = paid > 0 ? NOTES : []

  const add = (value: number) => {
    onInteract()
    setPaid((current) => current + value)
  }

  const reset = () => {
    onInteract()
    setPaid(0)
  }

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-sun">{tr('Money lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Pay and count the change')}</h2>
            </div>
            <span className="rounded-full bg-sun/15 px-2.5 py-1 text-[10px] font-extrabold text-sun" data-testid="money-state">
              {change > 0 ? tr('Change ready') : change === 0 ? tr('Paid exactly') : tr('Not enough yet')}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-card-2 to-ink-950 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sun/15">
                  <Wallet className="h-5 w-5 text-sun" />
                </span>
                <div className="text-end">
                  <p className="text-[10px] font-bold text-muted-2">{tr('Item price')}</p>
                  <p className="font-display text-2xl font-extrabold text-main" dir="ltr" data-testid="money-price">
                    {price} {tr('EGP')}
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-line bg-ink-950/60 p-3">
                <p className="text-[10px] font-bold text-muted-2">{tr('You paid')}</p>
                <p className="font-display text-xl font-extrabold text-aurora-300" dir="ltr" data-testid="money-paid">
                  {paid} {tr('EGP')}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {notes.map((value) => (
                    <span key={value} className="rounded-md border border-aurora-400/40 bg-aurora-400/10 px-2 py-0.5 text-[9px] font-bold text-aurora-200">
                      {value}
                    </span>
                  ))}
                  {paid === 0 && <span className="text-[10px] text-muted-2">{tr('No money on the counter yet.')}</span>}
                </div>
              </div>
              <p
                className="mt-3 rounded-xl px-3 py-2 text-center text-[11px] font-extrabold"
                style={{ color: change > 0 ? '#21e6c9' : change === 0 ? '#ffd166' : '#ff7a8a', background: 'rgba(255,255,255,.04)' }}
                data-testid="money-change"
              >
                {change >= 0 ? `${tr('Change')}: ${change} ${tr('EGP')}` : `${tr('Still needed')}: ${-change} ${tr('EGP')}`}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Price')} value={`${price}`} />
              <LabStat label={tr('Paid')} value={`${paid}`} testid="money-paid-value" />
              <LabStat label={tr('Change')} value={change >= 0 ? `${change}` : `−${-change}`} testid="money-change-value" />
            </div>
          </div>
        }
        controls={
          <>
            <LabRange label={tr('Item price')} value={price} min={5} max={200} step={5} unit={tr('EGP')} onChange={(value) => { onInteract(); setPrice(value) }} testid="money-price-slider" />
            <p className="text-[11px] font-bold text-muted-2">{tr('Hand over notes until you reach or pass the price.')}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {NOTES.map((value) => (
                <button
                  key={value}
                  onClick={() => add(value)}
                  data-testid={`money-note-${value}`}
                  className="rounded-xl border border-sun/40 bg-sun/10 px-2 py-2 text-[11px] font-extrabold text-sun transition hover:bg-sun/20"
                >
                  +{value}
                </button>
              ))}
            </div>
            <button onClick={reset} data-testid="money-reset" className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-card-2 px-3 py-2 text-[11px] font-extrabold text-muted">
              <RotateCcw className="h-3.5 w-3.5" /> {tr('Reset')}
            </button>
            <LabChallenge done={price === 35 && paid === 50}>{tr('Buy a 35 EGP item and pay with 50.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Pay with notes and work out the change.')}
        question={tr('An item costs 28 EGP and you pay 50. How much change?')}
        options={['12 EGP', '22 EGP', '78 EGP']}
        correct={1}
        explanation={tr('50 − 28 = 22 EGP back in your hand.')}
      />
    </>
  )
}
