import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

type Shape = {
  id: string
  label: string
  points: string
  axes: number[]
}

const SHAPES: Shape[] = [
  { id: 'square', label: 'Square', points: '30,30 170,30 170,170 30,170', axes: [0, 45, 90, 135] },
  { id: 'rectangle', label: 'Rectangle', points: '15,55 185,55 185,145 15,145', axes: [0, 90] },
  { id: 'hexagon', label: 'Hexagon', points: '100,25 165,62 165,138 100,175 35,138 35,62', axes: [0, 30, 60, 90, 120, 150] },
  { id: 'triangle', label: 'Equilateral triangle', points: '100,30 178,165 22,165', axes: [30, 90, 150] },
  { id: 'isosceles', label: 'Isosceles triangle', points: '100,28 150,172 50,172', axes: [90] },
]

const angleName = (angle: number) => (angle === 0 ? '—' : `${angle}°`)

export function SymmetryLab({ onInteract }: { onInteract: () => void }) {
  const [shapeId, setShapeId] = useState('square')
  const [angle, setAngle] = useState(0)
  const [found, setFound] = useState<number[]>([])
  const shape = SHAPES.find((item) => item.id === shapeId) || SHAPES[0]
  const isAxis = shape.axes.includes(angle)

  const rotate = (value: number) => {
    onInteract()
    setAngle(value)
    if (shape.axes.includes(value)) {
      setFound((current) => (current.includes(value) ? current : [...current, value]))
    }
  }

  const swap = (id: string) => {
    onInteract()
    setShapeId(id)
    setAngle(0)
    setFound([])
  }

  const rad = (angle * Math.PI) / 180
  const line = {
    x1: 100 - Math.sin(rad) * 88,
    y1: 100 - Math.cos(rad) * 88,
    x2: 100 + Math.sin(rad) * 88,
    y2: 100 + Math.cos(rad) * 88,
  }

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-violet-200">{tr('Symmetry lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Find the mirror lines')}</h2>
            </div>
            <span className="rounded-full bg-violet-neon/15 px-2.5 py-1 text-[10px] font-extrabold text-violet-200" data-testid="symmetry-found">
              {found.length} / {shape.axes.length}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="grid place-items-center rounded-2xl border border-line bg-ink-950 p-3">
              <svg viewBox="0 0 200 200" className="h-[260px] w-[260px]" role="img" aria-label={tr('Shape and mirror line')} data-testid="symmetry-svg">
                {Array.from({ length: 9 }).map((_, index) => (
                  <line key={`g${index}`} x1={10 + index * 22} y1="10" x2={10 + index * 22} y2="190" stroke="#1c2540" strokeWidth="1" />
                ))}
                {Array.from({ length: 9 }).map((_, index) => (
                  <line key={`h${index}`} x1="10" y1={10 + index * 22} x2="190" y2={10 + index * 22} stroke="#1c2540" strokeWidth="1" />
                ))}
                {found.map((item) => {
                  const r = (item * Math.PI) / 180
                  return (
                    <line
                      key={item}
                      x1={100 - Math.sin(r) * 92}
                      y1={100 - Math.cos(r) * 92}
                      x2={100 + Math.sin(r) * 92}
                      y2={100 + Math.cos(r) * 92}
                      stroke="#21e6c9"
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                      opacity="0.75"
                    />
                  )
                })}
                <polygon points={shape.points} fill="#6b8cff" fillOpacity="0.25" stroke="#8fa3c8" strokeWidth="2.5" />
                <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={isAxis ? '#21e6c9' : '#c4b5fd'} strokeWidth={isAxis ? 3 : 2} />
                {isAxis && <circle cx="100" cy="100" r="4" fill="#21e6c9" />}
              </svg>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Shape')} value={tr(shape.label)} />
              <LabStat label={tr('Axis angle')} value={angleName(angle)} testid="symmetry-angle" />
              <LabStat label={tr('Lines found')} value={`${found.length}/${shape.axes.length}`} />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('A mirror line splits the shape into two matching halves. Turn the line until it fits.')}</p>
            <LabRange label={tr('Mirror line')} value={angle} min={0} max={150} step={15} onChange={rotate} testid="symmetry-angle-slider" />
            <div className="grid grid-cols-2 gap-1.5">
              {SHAPES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => swap(item.id)}
                  data-testid={`symmetry-${item.id}`}
                  className={cn(
                    'rounded-xl border px-2 py-1.5 text-[10px] font-bold transition',
                    item.id === shapeId ? 'border-violet-neon/50 bg-violet-neon/15 text-violet-200' : 'border-line bg-card-2 text-muted hover:text-main',
                  )}
                >
                  {tr(item.label)}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted" data-testid="symmetry-hint">
              {isAxis ? tr('That line works — it is one of the lines of symmetry.') : tr('Not yet. Keep turning until the two halves match.')}
            </div>
            <LabChallenge done={shapeId === 'square' && found.length === 4}>{tr('Find all four lines of a square.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Count the lines of symmetry of flat shapes.')}
        question={tr('How many lines of symmetry does a rectangle have?')}
        options={['1', '2', '4']}
        correct={1}
        explanation={tr('A rectangle folds in half two ways — across and down — but its diagonals do not match.')}
      />
    </>
  )
}
