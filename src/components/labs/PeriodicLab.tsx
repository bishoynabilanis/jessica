import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const ELEMENTS = [
  { z: 1, symbol: 'H', name: 'Hydrogen', family: 'Nonmetal', kind: 'nonmetal', state: 'gas' },
  { z: 2, symbol: 'He', name: 'Helium', family: 'Noble gas', kind: 'nonmetal', state: 'gas' },
  { z: 3, symbol: 'Li', name: 'Lithium', family: 'Alkali metal', kind: 'metal', state: 'solid' },
  { z: 4, symbol: 'Be', name: 'Beryllium', family: 'Alkaline earth metal', kind: 'metal', state: 'solid' },
  { z: 5, symbol: 'B', name: 'Boron', family: 'Metalloid', kind: 'metalloid', state: 'solid' },
  { z: 6, symbol: 'C', name: 'Carbon', family: 'Nonmetal', kind: 'nonmetal', state: 'solid' },
  { z: 7, symbol: 'N', name: 'Nitrogen', family: 'Nonmetal', kind: 'nonmetal', state: 'gas' },
  { z: 8, symbol: 'O', name: 'Oxygen', family: 'Nonmetal', kind: 'nonmetal', state: 'gas' },
  { z: 9, symbol: 'F', name: 'Fluorine', family: 'Halogen', kind: 'nonmetal', state: 'gas' },
  { z: 10, symbol: 'Ne', name: 'Neon', family: 'Noble gas', kind: 'nonmetal', state: 'gas' },
  { z: 11, symbol: 'Na', name: 'Sodium', family: 'Alkali metal', kind: 'metal', state: 'solid' },
  { z: 12, symbol: 'Mg', name: 'Magnesium', family: 'Alkaline earth metal', kind: 'metal', state: 'solid' },
  { z: 13, symbol: 'Al', name: 'Aluminium', family: 'Metal', kind: 'metal', state: 'solid' },
  { z: 14, symbol: 'Si', name: 'Silicon', family: 'Metalloid', kind: 'metalloid', state: 'solid' },
  { z: 15, symbol: 'P', name: 'Phosphorus', family: 'Nonmetal', kind: 'nonmetal', state: 'solid' },
  { z: 16, symbol: 'S', name: 'Sulfur', family: 'Nonmetal', kind: 'nonmetal', state: 'solid' },
  { z: 17, symbol: 'Cl', name: 'Chlorine', family: 'Halogen', kind: 'nonmetal', state: 'gas' },
  { z: 18, symbol: 'Ar', name: 'Argon', family: 'Noble gas', kind: 'nonmetal', state: 'gas' },
  { z: 19, symbol: 'K', name: 'Potassium', family: 'Alkali metal', kind: 'metal', state: 'solid' },
  { z: 20, symbol: 'Ca', name: 'Calcium', family: 'Alkaline earth metal', kind: 'metal', state: 'solid' },
]

const TONES: Record<string, string> = {
  metal: '#6b8cff',
  nonmetal: '#21e6c9',
  metalloid: '#ffd166',
}

export function PeriodicLab({ onInteract }: { onInteract: () => void }) {
  const [selected, setSelected] = useState(6)
  const element = ELEMENTS.find((item) => item.z === selected) || ELEMENTS[5]

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-aurora-300">{tr('Periodic table lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Read an element card')}</h2>
            </div>
            <span className="rounded-full bg-aurora-400/15 px-2.5 py-1 font-display text-sm font-extrabold text-aurora-200" data-testid="periodic-symbol">
              {element.symbol}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-ink-950 p-3">
              <div className="grid grid-cols-5 gap-1.5" data-testid="periodic-grid">
                {ELEMENTS.map((item) => {
                  const active = item.z === selected
                  return (
                    <button
                      key={item.z}
                      onClick={() => { setSelected(item.z); onInteract() }}
                      data-testid={`periodic-${item.symbol}`}
                      className={cn(
                        'rounded-lg border px-1 py-1.5 text-center transition',
                        active ? 'border-white/60 bg-white/10' : 'border-line bg-card-2 hover:border-white/30',
                      )}
                      style={{ borderColor: active ? TONES[item.kind] : undefined }}
                    >
                      <span className="block text-[7px] font-bold text-muted-2">{item.z}</span>
                      <span className="block font-display text-[12px] font-extrabold" style={{ color: TONES[item.kind] }}>
                        {item.symbol}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[8px] font-bold text-muted-2">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky" /> {tr('Metal')}</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-aurora-400" /> {tr('Nonmetal')}</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sun" /> {tr('Metalloid')}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-card-2 p-3">
              <p className="font-display text-lg font-extrabold text-main">
                {tr(element.name)} <span className="text-muted-2">({element.symbol})</span>
              </p>
              <p className="mt-1 text-[10px] text-muted">{tr(element.family)}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Atomic number')} value={String(element.z)} testid="periodic-z" />
              <LabStat label={tr('Type')} value={element.kind === 'metal' ? tr('Metal') : element.kind === 'metalloid' ? tr('Metalloid') : tr('Nonmetal')} testid="periodic-kind" />
              <LabStat label={tr('State')} value={element.state === 'gas' ? tr('Gas') : tr('Solid')} />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Tap an element to read its card. The atomic number is the number of protons.')}</p>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('Elements in the same column share a family and behave alike. Noble gases sit in the last column and barely react at all.')}
            </div>
            <LabChallenge done={element.symbol === 'Ar'}>{tr('Find a noble gas after neon.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Read an element by its symbol, number and family.')}
        question={tr('What does the atomic number of an element tell you?')}
        options={[tr('Its protons'), tr('Its neutrons'), tr('Its electrons in the outer shell')]}
        correct={0}
        explanation={tr('The atomic number counts protons. In a neutral atom it also equals the electrons.')}
      />
    </>
  )
}
