import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame } from './LabControls'
import { LabGuide } from './LabGuide'

const PLANETS = [
  { id: 'mercury', name: 'Mercury', size: 8, distance: 58, au: 0.39, year: 88, moons: 0, color: '#c9b8a6', temp: '167 °C' },
  { id: 'venus', name: 'Venus', size: 12, distance: 88, au: 0.72, year: 225, moons: 0, color: '#e8b96b', temp: '464 °C' },
  { id: 'earth', name: 'Earth', size: 13, distance: 120, au: 1, year: 365, moons: 1, color: '#4f9dff', temp: '15 °C' },
  { id: 'mars', name: 'Mars', size: 10, distance: 152, au: 1.52, year: 687, moons: 2, color: '#e06b4a', temp: '−65 °C' },
  { id: 'jupiter', name: 'Jupiter', size: 22, distance: 196, au: 5.2, year: 4333, moons: 95, color: '#d9a066', temp: '−110 °C' },
  { id: 'saturn', name: 'Saturn', size: 19, distance: 240, au: 9.58, year: 10759, moons: 146, color: '#e3cf9a', temp: '−140 °C' },
  { id: 'uranus', name: 'Uranus', size: 15, distance: 282, au: 19.2, year: 30687, moons: 28, color: '#8fe3e8', temp: '−195 °C' },
  { id: 'neptune', name: 'Neptune', size: 15, distance: 324, au: 30.1, year: 60190, moons: 16, color: '#5b7fe8', temp: '−200 °C' },
]

export function SolarLab({ onInteract }: { onInteract: () => void }) {
  const [selected, setSelected] = useState('earth')
  const planet = PLANETS.find((item) => item.id === selected) || PLANETS[2]

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-sun">{tr('Solar system lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Tour the planets')}</h2>
            </div>
            <span className="rounded-full bg-sun/15 px-2.5 py-1 text-[10px] font-extrabold text-sun" data-testid="solar-name">
              {tr(planet.name)}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-2xl border border-line bg-ink-950 p-3">
              <svg viewBox="0 0 380 210" className="h-[220px] w-full min-w-[420px]" role="img" aria-label={tr('Planets orbiting the sun')}>
                <defs>
                  <radialGradient id="sunGlow">
                    <stop offset="0%" stopColor="#ffd166" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ffd166" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="26" cy="105" r="54" fill="url(#sunGlow)" opacity="0.55" />
                <circle cx="26" cy="105" r="20" fill="#ffd166" />
                <line x1="26" y1="105" x2="360" y2="105" stroke="#2b3550" strokeWidth="1" strokeDasharray="3 4" />
                {PLANETS.map((item) => {
                  const active = item.id === selected
                  return (
                    <g key={item.id} onClick={() => { setSelected(item.id); onInteract() }} style={{ cursor: 'pointer' }}>
                      <circle cx={item.distance} cy="105" r={item.size / 2 + (active ? 6 : 3)} fill={item.color} opacity={active ? 0.95 : 0.55} />
                      {active && <circle cx={item.distance} cy="105" r={item.size / 2 + 10} fill="none" stroke={item.color} strokeWidth="1.5" opacity="0.6" />}
                      {item.id === 'saturn' && (
                        <ellipse cx={item.distance} cy="105" rx={item.size / 2 + 8} ry="3" fill="none" stroke={item.color} strokeWidth="2" opacity="0.7" />
                      )}
                      <text x={item.distance} y={150} textAnchor="middle" fill={active ? '#dbe7ff' : '#7f8db0'} fontSize="7.5" fontWeight="700">
                        {tr(item.name)}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                [tr('Distance from the sun'), `${planet.au} AU`],
                [tr('Year length'), `${planet.year.toLocaleString('en-US')} ${tr('days')}`],
                [tr('Moons'), String(planet.moons)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-line bg-card-2 px-2.5 py-2">
                  <p className="text-[9px] font-bold text-muted-2">{label}</p>
                  <p className="mt-0.5 font-display text-sm font-extrabold tabular-nums text-main" dir="ltr">{value}</p>
                </div>
              ))}
            </div>
            <p className="rounded-xl border border-line bg-card-2 px-3 py-2 text-[10px] leading-relaxed text-muted" data-testid="solar-fact">
              {tr('Average temperature on {planet}: {temp}.', { planet: tr(planet.name), temp: planet.temp })}
            </p>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Pick a planet to travel there.')}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {PLANETS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setSelected(item.id); onInteract() }}
                  data-testid={`solar-${item.id}`}
                  className={cn(
                    'rounded-xl border px-2 py-1.5 text-[10px] font-bold transition',
                    item.id === selected ? 'border-sun/50 bg-sun/10 text-sun' : 'border-line bg-card-2 text-muted hover:text-main',
                  )}
                  style={{ borderColor: item.id === selected ? item.color : undefined }}
                >
                  {tr(item.name)}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('The inner four planets are rocky. The outer four are giant balls of gas and ice, and they take much longer to orbit the sun.')}
            </div>
            <LabChallenge done={planet.id === 'neptune'}>{tr('Find the planet with the longest year.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('See that the farther a planet is, the longer its year.')}
        question={tr('Why is a year on Neptune so long?')}
        options={[tr('It spins faster'), tr('It is farther from the sun'), tr('It has more moons')]}
        correct={1}
        explanation={tr('A year is one full orbit. Neptune is about 30 times farther from the sun than Earth, so its orbit is far longer.')}
      />
    </>
  )
}
