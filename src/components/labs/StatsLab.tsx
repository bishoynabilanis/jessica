import { useState } from 'react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const START = [4, 7, 7, 9, 10]

export function StatsLab({ onInteract }: { onInteract: () => void }) {
  const [values, setValues] = useState<number[]>(START)
  const sorted = [...values].sort((a, b) => a - b)
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const median = sorted[Math.floor(sorted.length / 2)]
  const counts = values.reduce<Record<number, number>>((acc, value) => ({ ...acc, [value]: (acc[value] || 0) + 1 }), {})
  const best = Math.max(...Object.values(counts))
  const mode = best > 1 ? Number(Object.keys(counts).find((key) => counts[Number(key)] === best)) : null
  const range = sorted[sorted.length - 1] - sorted[0]

  const update = (index: number, value: number) => {
    onInteract()
    setValues((current) => current.map((item, position) => (position === index ? value : item)))
  }

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-violet-200">{tr('Statistics lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Five quiz scores')}</h2>
            </div>
            <span className="rounded-full bg-violet-neon/15 px-2.5 py-1 text-[10px] font-extrabold text-violet-200" data-testid="stats-mean">
              {tr('Mean')} {mean.toFixed(1)}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-ink-950 p-4">
              <div className="flex h-[170px] items-end justify-center gap-3" data-testid="stats-bars" dir="ltr">
                {values.map((value, index) => (
                  <div key={index} className="flex w-full max-w-[54px] flex-col items-center gap-1">
                    <span className="text-[11px] font-extrabold text-main">{value}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-violet-neon/40 to-aurora-400 transition-all duration-300"
                      style={{ height: `${Math.max(4, value * 12)}px` }}
                    />
                    <span className="text-[9px] font-bold text-muted-2">{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="relative h-px bg-white/10">
                <span className="absolute -top-2 h-1.5 w-full border-t border-dashed border-sun" style={{ bottom: 0 }}>
                  <b className="absolute -top-4 left-0 rounded-full bg-sun/15 px-1.5 text-[8px] font-bold text-sun">{tr('Mean')} {mean.toFixed(1)}</b>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <LabStat label={tr('Mean')} value={mean.toFixed(1)} testid="stats-mean-value" />
              <LabStat label={tr('Median')} value={String(median)} testid="stats-median" />
              <LabStat label={tr('Mode')} value={mode === null ? '—' : String(mode)} testid="stats-mode" />
              <LabStat label={tr('Range')} value={String(range)} />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Drag a score and watch all four numbers change.')}</p>
            {values.map((value, index) => (
              <label key={index} className="block">
                <span className="flex items-center justify-between text-[11px] font-bold text-muted">
                  <span>{tr('Student {n}', { n: index + 1 })}</span>
                  <span className="tabular-nums text-main">{value}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={value}
                  onChange={(event) => update(index, Number(event.target.value))}
                  data-testid={`stats-value-${index}`}
                  className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-aurora-400"
                />
              </label>
            ))}
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('Mean adds everything and divides. Median is the middle after sorting. Mode is the most repeated score.')}
            </div>
            <LabChallenge done={Math.abs(mean - 6) < 1e-9}>{tr('Make the mean exactly 6.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Tell mean, median, mode and range apart.')}
        question={tr('Scores are 2, 9, 9, 10, 10. Which value is the mode?')}
        options={['9 only', '9 and 10', '8']}
        correct={1}
        explanation={tr('Both 9 and 10 appear twice, more than any other score, so both are modes.')}
      />
    </>
  )
}
