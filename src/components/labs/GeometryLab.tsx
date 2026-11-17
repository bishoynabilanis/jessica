import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'

type Shape = 'rectangle' | 'triangle' | 'circle'

const SCALE = 14

export function GeometryLab({ onInteract }: { onInteract: () => void }) {
  const [shape, setShape] = useState<Shape>('rectangle')
  const [width, setWidth] = useState(6)
  const [height, setHeight] = useState(4)
  const [radius, setRadius] = useState(4)

  const area = shape === 'rectangle' ? width * height : shape === 'triangle' ? (width * height) / 2 : Math.PI * radius * radius
  const perimeter =
    shape === 'rectangle' ? 2 * (width + height) : shape === 'circle' ? 2 * Math.PI * radius : null

  const change = (setter: (value: number) => void) => (value: number) => {
    onInteract()
    setter(value)
  }

  const pick = (next: Shape) => {
    onInteract()
    setShape(next)
  }

  return (
    <LabFrame
      header={
        <div>
          <p className="label mb-1 text-violet-200">{tr('Geometry lab')}</p>
          <h2 className="font-display text-lg font-extrabold text-main">{tr('Draw it, then measure it')}</h2>
        </div>
      }
      visual={
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {([
              ['rectangle', tr('Rectangle')],
              ['triangle', tr('Triangle')],
              ['circle', tr('Circle')],
            ] as Array<[Shape, string]>).map(([id, label]) => (
              <button
                key={id}
                onClick={() => pick(id)}
                data-testid={`geometry-${id}`}
                className={cn(
                  'rounded-full border px-3 py-1 text-[11px] font-bold transition',
                  shape === id
                    ? 'border-violet-neon/60 bg-violet-neon/15 text-violet-200'
                    : 'border-line bg-card-2 text-muted hover:text-main',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-ink-950 p-3">
            <svg viewBox="0 0 360 240" className="w-full" role="img" aria-label={tr('Geometry shape')} data-testid="geometry-svg">
              <defs>
                <linearGradient id="shapeFill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6b8cff" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#21e6c9" stopOpacity="0.25" />
                </linearGradient>
              </defs>
              {shape === 'rectangle' && (
                <rect
                  x={180 - (width * SCALE) / 2}
                  y={120 - (height * SCALE) / 2}
                  width={width * SCALE}
                  height={height * SCALE}
                  rx="4"
                  fill="url(#shapeFill)"
                  stroke="#8fb0ff"
                  strokeWidth="2"
                />
              )}
              {shape === 'triangle' && (
                <polygon
                  points={`180,${120 - (height * SCALE) / 2} ${180 + (width * SCALE) / 2},${120 + (height * SCALE) / 2} ${180 - (width * SCALE) / 2},${120 + (height * SCALE) / 2}`}
                  fill="url(#shapeFill)"
                  stroke="#8fb0ff"
                  strokeWidth="2"
                />
              )}
              {shape === 'circle' && (
                <circle cx="180" cy="120" r={radius * SCALE} fill="url(#shapeFill)" stroke="#8fb0ff" strokeWidth="2" />
              )}
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <LabStat label={tr('Area')} value={area.toFixed(1)} testid="geometry-area" />
            <LabStat
              label={tr('Perimeter')}
              value={perimeter === null ? '—' : perimeter.toFixed(1)}
              hint={perimeter === null ? tr('A triangle needs all three sides.') : undefined}
              testid="geometry-perimeter"
            />
          </div>
        </div>
      }
      controls={
        <>
          <p className="text-[11px] font-bold text-muted-2">{tr('Change a dimension and watch the formula follow.')}</p>
          {(shape === 'rectangle' || shape === 'triangle') && (
            <LabRange label={shape === 'rectangle' ? tr('Width') : tr('Base')} value={width} min={1} max={12} onChange={change(setWidth)} testid="geometry-width" />
          )}
          {(shape === 'rectangle' || shape === 'triangle') && (
            <LabRange label={tr('Height')} value={height} min={1} max={12} onChange={change(setHeight)} testid="geometry-height" />
          )}
          {shape === 'circle' && (
            <LabRange label={tr('Radius')} value={radius} min={1} max={10} onChange={change(setRadius)} testid="geometry-radius" />
          )}
          <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
            {shape === 'rectangle' && <span dir="ltr">A = w × h · P = 2(w + h)</span>}
            {shape === 'triangle' && <span dir="ltr">A = ½ × b × h</span>}
            {shape === 'circle' && <span dir="ltr">A = πr² · C = 2πr</span>}
          </div>
          <LabChallenge done={area >= 24}>{tr('Make the area at least 24.')}</LabChallenge>
        </>
      }
    />
  )
}
