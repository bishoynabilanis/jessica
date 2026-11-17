import { useState } from 'react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const TONES = ['#21e6c9', '#6b8cff', '#ffd166', '#ff7a8a', '#a78bfa', '#5cc8ff', '#34d399', '#f472b6', '#fb923c', '#facc15']

export function TimesLab({ onInteract }: { onInteract: () => void }) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(4)
  const total = rows * cols

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
              <p className="label mb-1 text-aurora-300">{tr('Times tables lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Build the array')}</h2>
            </div>
            <span className="rounded-full bg-aurora-400/15 px-2.5 py-1 text-[10px] font-extrabold text-aurora-200" data-testid="times-product">
              {total}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-2xl border border-line bg-ink-950 p-4">
              <div className="mx-auto flex w-max flex-col gap-1.5" data-testid="times-grid" dir="ltr">
                {Array.from({ length: rows }).map((_, row) => (
                  <div key={row} className="flex gap-1.5">
                    {Array.from({ length: cols }).map((__, col) => (
                      <span
                        key={col}
                        className="h-5 w-5 rounded-full transition-colors sm:h-6 sm:w-6"
                        style={{ background: TONES[row % TONES.length], opacity: 0.9 }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center font-display text-xl font-extrabold tabular-nums text-main" dir="ltr" data-testid="times-sentence">
              {rows} × {cols} = {total}
            </p>
            <p className="text-center text-[10px] font-bold text-muted-2">
              {tr('{rows} rows, {cols} dots in each row', { rows, cols })}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <LabStat label={tr('Rows')} value={String(rows)} />
              <LabStat label={tr('Columns')} value={String(cols)} />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Change the two numbers and count the dots.')}</p>
            <LabRange label={tr('Rows')} value={rows} min={1} max={10} onChange={change(setRows)} testid="times-rows" />
            <LabRange label={tr('Columns')} value={cols} min={1} max={10} onChange={change(setCols)} testid="times-cols" />
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('Multiplication is repeated addition: 3 × 4 means three rows of four, the same as 4 + 4 + 4.')}
            </div>
            <LabChallenge done={total === 24}>{tr('Make exactly 24 dots.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('See multiplication as rows and columns, not memorised words.')}
        question={tr('A tray has 4 rows with 6 eggs in each row. How many eggs?')}
        options={['10', '24', '46']}
        correct={1}
        explanation={tr('4 × 6 = 24: four rows, six eggs in every row.')}
      />
    </>
  )
}
