import { useState } from 'react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'

function FractionBar({
  numerator,
  denominator,
  tone,
  testid,
}: {
  numerator: number
  denominator: number
  tone: string
  testid: string
}) {
  return (
    <div className="flex h-8 gap-1" data-testid={testid} dir="ltr">
      {Array.from({ length: denominator }).map((_, index) => (
        <span
          key={index}
          className="flex-1 rounded-md border border-line transition-colors"
          style={{ background: index < numerator ? tone : 'rgba(255,255,255,.05)' }}
        />
      ))}
    </div>
  )
}

export function FractionsLab({ onInteract }: { onInteract: () => void }) {
  const [first, setFirst] = useState({ n: 1, d: 2 })
  const [second, setSecond] = useState({ n: 2, d: 4 })

  const a = first.n / first.d
  const b = second.n / second.d
  const equal = Math.abs(a - b) < 1e-9
  const compare = equal ? '=' : a > b ? '>' : '<'

  const change = (which: 'first' | 'second', key: 'n' | 'd', value: number) => {
    onInteract()
    if (which === 'first') setFirst((current) => ({ ...current, [key]: value }))
    else setSecond((current) => ({ ...current, [key]: value }))
  }

  const firstSafe = { n: Math.min(first.n, first.d), d: first.d }
  const secondSafe = { n: Math.min(second.n, second.d), d: second.d }

  return (
    <LabFrame
      header={
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="label mb-1 text-aurora-300">{tr('Fractions lab')}</p>
            <h2 className="font-display text-lg font-extrabold text-main">{tr('Same value, different pieces')}</h2>
          </div>
          <span className="rounded-xl border border-aurora-400/30 bg-aurora-400/10 px-2.5 py-1 font-display text-lg font-extrabold text-aurora-200">
            {compare}
          </span>
        </div>
      }
      visual={
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-[11px] font-bold text-muted" data-testid="fraction-label-one">
              {tr('First fraction')}: <b className="text-main">{firstSafe.n}/{firstSafe.d}</b> = {a.toFixed(2)}
            </p>
            <FractionBar numerator={firstSafe.n} denominator={firstSafe.d} tone="#21e6c9" testid="fraction-one" />
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold text-muted" data-testid="fraction-label-two">
              {tr('Second fraction')}: <b className="text-main">{secondSafe.n}/{secondSafe.d}</b> = {b.toFixed(2)}
            </p>
            <FractionBar numerator={secondSafe.n} denominator={secondSafe.d} tone="#6b8cff" testid="fraction-two" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <LabStat label={tr('First value')} value={a.toFixed(2)} />
            <LabStat label={tr('Second value')} value={b.toFixed(2)} />
          </div>
        </div>
      }
      controls={
        <>
          <p className="text-[11px] font-bold text-muted-2">{tr('Move the sliders and watch the shaded area.')}</p>
          <LabRange label={tr('First numerator')} value={first.n} min={0} max={first.d} onChange={(value) => change('first', 'n', value)} testid="fraction-n1" />
          <LabRange label={tr('First denominator')} value={first.d} min={1} max={12} onChange={(value) => change('first', 'd', value)} testid="fraction-d1" />
          <LabRange label={tr('Second numerator')} value={second.n} min={0} max={second.d} onChange={(value) => change('second', 'n', value)} testid="fraction-n2" />
          <LabRange label={tr('Second denominator')} value={second.d} min={1} max={12} onChange={(value) => change('second', 'd', value)} testid="fraction-d2" />
          <LabChallenge done={equal}>{tr('Make the two bars cover the same amount.')}</LabChallenge>
        </>
      }
    />
  )
}
