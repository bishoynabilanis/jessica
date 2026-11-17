import { useState } from 'react'
import { Tag } from 'lucide-react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

export function PercentLab({ onInteract }: { onInteract: () => void }) {
  const [price, setPrice] = useState(400)
  const [discount, setDiscount] = useState(25)
  const saving = (price * discount) / 100
  const finalPrice = price - saving

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
              <p className="label mb-1 text-aurora-300">{tr('Percent lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Work out the sale price')}</h2>
            </div>
            <span className="rounded-full bg-aurora-400/15 px-2.5 py-1 text-[10px] font-extrabold text-aurora-200" data-testid="percent-off">
              −{discount}%
            </span>
          </div>
        }
        visual={
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-card-2 to-ink-950 p-6 text-center">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-aurora-400/10" />
              <Tag className="mx-auto h-6 w-6 text-aurora-300" />
              <p className="mt-2 text-[11px] font-bold text-muted-2">{tr('Original price')}</p>
              <p className="font-display text-xl font-extrabold text-muted line-through" data-testid="percent-original" dir="ltr">
                {price} {tr('EGP')}
              </p>
              <p className="mt-1 font-display text-4xl font-extrabold text-main" data-testid="percent-final" dir="ltr">
                {finalPrice.toFixed(0)} <span className="text-lg">{tr('EGP')}</span>
              </p>
              <p className="mt-1 inline-block rounded-full bg-coral/15 px-2.5 py-1 text-[10px] font-extrabold text-coral" data-testid="percent-saving" dir="ltr">
                {tr('You save {amount} EGP', { amount: saving.toFixed(0) })}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Original')} value={String(price)} />
              <LabStat label={tr('Discount')} value={`${discount}%`} />
              <LabStat label={tr('Saving')} value={saving.toFixed(0)} testid="percent-saving-value" />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('A percent is a fraction of 100. Ten percent means ten out of every hundred.')}</p>
            <LabRange label={tr('Original price')} value={price} min={100} max={1000} step={10} unit={tr('EGP')} onChange={change(setPrice)} testid="percent-price" />
            <LabRange label={tr('Discount')} value={discount} min={0} max={80} step={5} unit="%" onChange={change(setDiscount)} testid="percent-discount" />
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted" data-testid="percent-formula">
              <span dir="ltr" className="font-bold text-main">{price} × {discount} ÷ 100 = {saving.toFixed(0)}</span>
              <br />
              {tr('That saving is taken off the original price.')}
            </div>
            <LabChallenge done={price === 400 && discount === 25}>{tr('Make a 400 EGP item save exactly 100 EGP.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Use percentages for real shopping maths.')}
        question={tr('A 200 EGP book is 15% off. How much do you save?')}
        options={[tr('15 EGP'), tr('30 EGP'), tr('185 EGP')]}
        correct={1}
        explanation={tr('15% of 200 is 200 × 15 ÷ 100 = 30 EGP, so the book costs 170 EGP.')}
      />
    </>
  )
}
