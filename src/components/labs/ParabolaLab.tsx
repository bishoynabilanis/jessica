import { useState } from 'react'
import { tr } from '@/i18n'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const W = 360
const H = 300
const X_RANGE = 6
const Y_RANGE = 8

const sx = (x: number) => ((x + X_RANGE) / (X_RANGE * 2)) * W
const sy = (y: number) => H - ((y + Y_RANGE) / (Y_RANGE * 2)) * H

export function ParabolaLab({ onInteract }: { onInteract: () => void }) {
  const [a, setA] = useState(1)
  const [b, setB] = useState(-4)
  const [c, setC] = useState(3)

  const aa = a === 0 ? 0.5 : a
  const vertexX = -b / (2 * aa)
  const vertexY = aa * vertexX * vertexX + b * vertexX + c
  const disc = b * b - 4 * aa * c
  const roots = disc < 0 ? [] : disc === 0 ? [-b / (2 * aa)] : [(-b - Math.sqrt(disc)) / (2 * aa), (-b + Math.sqrt(disc)) / (2 * aa)]

  const points: string[] = []
  for (let x = -X_RANGE; x <= X_RANGE + 0.01; x += 0.15) {
    const y = aa * x * x + b * x + c
    if (y < -Y_RANGE || y > Y_RANGE) continue
    points.push(`${points.length ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`)
  }

  const change = (setter: (value: number) => void) => (value: number) => {
    onInteract()
    setter(value)
  }

  const equation = `y = ${aa}x² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x ${c >= 0 ? '+' : '−'} ${Math.abs(c)}`

  return (
    <>
    <LabFrame
      header={
        <div>
          <p className="label mb-1 text-violet-200">{tr('Parabola lab')}</p>
          <h2 className="font-display text-lg font-extrabold text-main">{tr('Change a, b, c and watch the curve')}</h2>
        </div>
      }
      visual={
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-line bg-ink-950">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={tr('Parabola graph')} data-testid="parabola-svg">
              {Array.from({ length: 13 }).map((_, index) => (
                <line key={`v${index}`} x1={(index / 12) * W} y1="0" x2={(index / 12) * W} y2={H} stroke="#1b2438" strokeWidth="1" />
              ))}
              {Array.from({ length: 9 }).map((_, index) => (
                <line key={`h${index}`} x1="0" y1={(index / 8) * H} x2={W} y2={(index / 8) * H} stroke="#1b2438" strokeWidth="1" />
              ))}
              <line x1={sx(0)} y1="0" x2={sx(0)} y2={H} stroke="#556080" strokeWidth="1.5" />
              <line x1="0" y1={sy(0)} x2={W} y2={sy(0)} stroke="#556080" strokeWidth="1.5" />
              <path d={points.join(' ')} fill="none" stroke="#21e6c9" strokeWidth="3" strokeLinecap="round" />
              <circle cx={sx(vertexX)} cy={sy(vertexY)} r="5" fill="#ffd166" />
              {roots.map((root, index) => (
                <circle key={`r${index}`} cx={sx(root)} cy={sy(0)} r="4" fill="#6b8cff" />
              ))}
              <text x={W - 12} y={sy(0) - 6} textAnchor="end" fill="#8fb0ff" fontSize="10">
                x
              </text>
              <text x={sx(0) + 6} y="12" fill="#8fb0ff" fontSize="10">
                y
              </text>
            </svg>
          </div>
          <p className="rounded-xl border border-line bg-card-2 px-3 py-2 text-center font-display text-lg font-extrabold text-main" dir="ltr" data-testid="parabola-equation">
            {equation}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <LabStat label={tr('Vertex')} value={`(${vertexX.toFixed(1)}, ${vertexY.toFixed(1)})`} testid="parabola-vertex" />
            <LabStat
              label={tr('Roots')}
              value={roots.length === 0 ? tr('No real roots') : roots.map((root) => root.toFixed(1)).join(' · ')}
              testid="parabola-roots"
            />
          </div>
        </div>
      }
      controls={
        <>
          <p className="text-[11px] font-bold text-muted-2">{tr('The sign of a decides the opening direction.')}</p>
          <LabRange label={tr('a')} value={a} min={-3} max={3} step={0.5} onChange={(value) => change(setA)(value === 0 ? 0.5 : value)} testid="parabola-a" />
          <LabRange label={tr('b')} value={b} min={-6} max={6} step={1} onChange={change(setB)} testid="parabola-b" />
          <LabRange label={tr('c')} value={c} min={-6} max={6} step={1} onChange={change(setC)} testid="parabola-c" />
          <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
            {aa > 0 ? tr('Opens upward') : tr('Opens downward')} · {tr('Vertex')} = (−b/2a, f(−b/2a))
          </div>
          <LabChallenge done={aa < 0}>{tr('Make the parabola open downward.')}</LabChallenge>
        </>
      }
    />
      <LabGuide
        goal={tr('See how a, b and c shape the curve.')}
        question={tr('In y = x², which way does the parabola open?')}
        options={[tr('Upward'), tr('Downward'), tr('Sideways')]}
        correct={0}
        explanation={tr('Here a = 1, a positive number, so the arms open upward.')}
      />
    </>
  )
}
