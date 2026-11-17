import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

type Solid = {
  id: string
  label: string
  faces: number
  edges: number
  vertices: number
  rolls: boolean
  note: string
}

const SOLIDS: Solid[] = [
  { id: 'cube', label: 'Cube', faces: 6, edges: 12, vertices: 8, rolls: false, note: 'Six equal squares.' },
  { id: 'cuboid', label: 'Cuboid', faces: 6, edges: 12, vertices: 8, rolls: false, note: 'Six rectangles, opposite ones equal.' },
  { id: 'cylinder', label: 'Cylinder', faces: 3, edges: 2, vertices: 0, rolls: true, note: 'Two circles and one curved side.' },
  { id: 'pyramid', label: 'Square pyramid', faces: 5, edges: 8, vertices: 5, rolls: false, note: 'One square base and four triangles.' },
  { id: 'cone', label: 'Cone', faces: 2, edges: 1, vertices: 1, rolls: true, note: 'One circle, one curved side, one point.' },
  { id: 'sphere', label: 'Sphere', faces: 1, edges: 0, vertices: 0, rolls: true, note: 'One curved surface, no edges at all.' },
]

function SolidArt({ id }: { id: string }) {
  if (id === 'cube' || id === 'cuboid') {
    const wide = id === 'cuboid'
    const right = wide ? 178 : 165
    const top = wide ? 30 : 25
    return (
      <g>
        <polygon points={`100,${top} ${right},60 100,95 35,60`} fill="#21e6c9" opacity="0.55" />
        <polygon points={`35,60 100,95 100,165 35,130`} fill="#6b8cff" opacity="0.5" />
        <polygon points={`100,95 ${right},60 ${right},130 100,165`} fill="#8fa3c8" opacity="0.35" />
      </g>
    )
  }
  if (id === 'cylinder') {
    return (
      <g>
        <rect x="50" y="50" width="100" height="105" fill="#6b8cff" opacity="0.4" />
        <ellipse cx="100" cy="155" rx="50" ry="16" fill="#6b8cff" opacity="0.55" />
        <ellipse cx="100" cy="50" rx="50" ry="16" fill="#21e6c9" opacity="0.7" />
        <line x1="50" y1="50" x2="50" y2="155" stroke="#8fa3c8" strokeWidth="2" />
        <line x1="150" y1="50" x2="150" y2="155" stroke="#8fa3c8" strokeWidth="2" />
      </g>
    )
  }
  if (id === 'pyramid') {
    return (
      <g>
        <polygon points="100,30 48,132 100,158" fill="#6b8cff" opacity="0.45" />
        <polygon points="100,30 152,132 100,158" fill="#21e6c9" opacity="0.4" />
        <polygon points="48,132 100,112 152,132 100,158" fill="#8fa3c8" opacity="0.3" />
        <line x1="100" y1="30" x2="100" y2="112" stroke="#8fa3c8" strokeWidth="1.5" strokeDasharray="4 3" />
      </g>
    )
  }
  if (id === 'cone') {
    return (
      <g>
        <ellipse cx="100" cy="150" rx="50" ry="15" fill="#6b8cff" opacity="0.5" />
        <polygon points="100,28 50,150 150,150" fill="#21e6c9" opacity="0.35" />
        <line x1="100" y1="28" x2="100" y2="150" stroke="#8fa3c8" strokeWidth="1.5" strokeDasharray="4 3" />
      </g>
    )
  }
  return (
    <g>
      <defs>
        <radialGradient id="sphereFill" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#21e6c9" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#6b8cff" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="62" fill="url(#sphereFill)" />
      <ellipse cx="100" cy="100" rx="62" ry="18" fill="none" stroke="#8fa3c8" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.6" />
    </g>
  )
}

export function Shapes3DLab({ onInteract }: { onInteract: () => void }) {
  const [selected, setSelected] = useState('cube')
  const solid = SOLIDS.find((item) => item.id === selected) || SOLIDS[0]
  const euler = solid.faces + solid.vertices - solid.edges

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-sky">{tr('3D shapes lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Count faces, edges and corners')}</h2>
            </div>
            <span className="rounded-full bg-sky/15 px-2.5 py-1 text-[10px] font-extrabold text-sky" data-testid="shapes3d-name">
              {tr(solid.label)}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="grid place-items-center rounded-2xl border border-line bg-ink-950 p-3">
              <svg viewBox="0 0 200 200" className="h-[240px] w-[240px]" role="img" aria-label={tr(solid.label)} data-testid="shapes3d-svg">
                <SolidArt id={solid.id} />
              </svg>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Faces')} value={String(solid.faces)} testid="shapes3d-faces" />
              <LabStat label={tr('Edges')} value={String(solid.edges)} testid="shapes3d-edges" />
              <LabStat label={tr('Vertices')} value={String(solid.vertices)} testid="shapes3d-vertices" />
            </div>
            <p className="rounded-xl border border-line bg-card-2 px-3 py-2 text-[10px] leading-relaxed text-muted" data-testid="shapes3d-note">
              {tr(solid.note)}{' '}
              {(solid.id === 'cube' || solid.id === 'cuboid' || solid.id === 'pyramid') &&
                tr('Euler: faces + vertices − edges = {value}.', { value: euler })}
            </p>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Pick a solid and count before you look.')}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {SOLIDS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setSelected(item.id); onInteract() }}
                  data-testid={`shapes3d-${item.id}`}
                  className={cn(
                    'rounded-xl border px-2 py-1.5 text-[10px] font-bold transition',
                    item.id === selected ? 'border-sky/50 bg-sky/10 text-sky' : 'border-line bg-card-2 text-muted hover:text-main',
                  )}
                >
                  {tr(item.label)}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('A face is a flat or curved surface. An edge is where two faces meet. A vertex is a corner.')} {tr('Does it roll?')}{' '}
              <b className="text-main">{solid.rolls ? tr('Yes') : tr('No')}</b>
            </div>
            <LabChallenge done={solid.id === 'sphere'}>{tr('Find the solid with no edges and no corners.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Describe solids by faces, edges and vertices.')}
        question={tr('How many faces does a cube have?')}
        options={['4', '6', '8']}
        correct={1}
        explanation={tr('A cube has 6 square faces, 12 edges and 8 corners.')}
      />
    </>
  )
}
