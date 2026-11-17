import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabRange, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const SYMBOLS = ['—', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca']
const SHELL_CAPACITY = [2, 8, 8, 2]

function shellDots(electrons: number) {
  const shells: number[] = []
  let left = electrons
  for (const capacity of SHELL_CAPACITY) {
    const count = Math.min(capacity, left)
    shells.push(count)
    left -= count
  }
  return shells
}

export function AtomLab({ onInteract }: { onInteract: () => void }) {
  const [protons, setProtons] = useState(6)
  const [neutrons, setNeutrons] = useState(6)
  const [electrons, setElectrons] = useState(6)

  const symbol = SYMBOLS[protons] || '—'
  const charge = protons - electrons
  const shells = shellDots(electrons)

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
            <p className="label mb-1 text-violet-200">{tr('Atom lab')}</p>
            <h2 className="font-display text-lg font-extrabold text-main">{tr('Build an atom')}</h2>
          </div>
          <span
            className={cn(
              'grid h-14 w-14 place-items-center rounded-2xl border font-display text-2xl font-black',
              charge === 0 ? 'border-aurora-400/40 bg-aurora-400/10 text-aurora-200' : 'border-violet-neon/40 bg-violet-neon/10 text-violet-200',
            )}
            data-testid="atom-element"
          >
            {symbol}
          </span>
        </div>
      }
      visual={
        <div className="space-y-3">
          <div className="flex justify-center overflow-hidden rounded-2xl border border-line bg-ink-950 p-3">
            <svg viewBox="0 0 220 220" className="h-[240px] w-[240px]" role="img" aria-label={tr('Atom model')}>
              {[...SHELL_CAPACITY].map((_, shellIndex) => {
                const radius = 34 + shellIndex * 24
                return <circle key={`shell-${shellIndex}`} cx="110" cy="110" r={radius} fill="none" stroke="#2c3550" strokeWidth="1.5" />
              })}
              {shells.map((count, shellIndex) =>
                Array.from({ length: count }).map((_, electronIndex) => {
                  const radius = 34 + shellIndex * 24
                  const angle = (electronIndex / Math.max(1, count)) * Math.PI * 2 - Math.PI / 2
                  return (
                    <circle
                      key={`e-${shellIndex}-${electronIndex}`}
                      cx={110 + Math.cos(angle) * radius}
                      cy={110 + Math.sin(angle) * radius}
                      r="3.5"
                      fill="#6b8cff"
                    />
                  )
                }),
              )}
              {Array.from({ length: protons }).map((_, index) => {
                const angle = index * 2.4
                const radius = index === 0 ? 0 : 4 + (index % 4) * 3
                return <circle key={`p-${index}`} cx={110 + Math.cos(angle) * radius} cy={110 + Math.sin(angle) * radius} r="3" fill="#21e6c9" />
              })}
              {Array.from({ length: neutrons }).map((_, index) => {
                const angle = index * 2.4 + 1.2
                const radius = index === 0 ? 2 : 5 + (index % 4) * 3
                return <circle key={`n-${index}`} cx={110 + Math.cos(angle) * radius} cy={110 + Math.sin(angle) * radius} r="3" fill="#94a3b8" />
              })}
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <LabStat label={tr('Protons')} value={String(protons)} />
            <LabStat label={tr('Neutrons')} value={String(neutrons)} />
            <LabStat label={tr('Electrons')} value={String(electrons)} />
          </div>
          <LabStat
            label={tr('Charge')}
            value={charge === 0 ? '0' : charge > 0 ? `+${charge}` : String(charge)}
            hint={charge === 0 ? tr('Neutral atom') : charge > 0 ? tr('Positive ion') : tr('Negative ion')}
            testid="atom-charge"
          />
        </div>
      }
      controls={
        <>
          <p className="text-[11px] font-bold text-muted-2">{tr('Protons decide the element. Electrons decide the charge.')}</p>
          <LabRange label={tr('Protons')} value={protons} min={0} max={20} onChange={change(setProtons)} testid="atom-protons" />
          <LabRange label={tr('Neutrons')} value={neutrons} min={0} max={24} onChange={change(setNeutrons)} testid="atom-neutrons" />
          <LabRange label={tr('Electrons')} value={electrons} min={0} max={20} onChange={change(setElectrons)} testid="atom-electrons" />
          <LabChallenge done={charge === 0 && protons > 0}>{tr('Make a neutral atom.')}</LabChallenge>
        </>
      }
    />
      <LabGuide
        goal={tr('Build an atom and read its charge.')}
        question={tr('An atom has 11 protons and 10 electrons. What is it?')}
        options={[tr('A neutral atom'), tr('A positive ion'), tr('A negative ion')]}
        correct={1}
        explanation={tr('One more proton than electrons leaves a charge of +1.')}
      />
    </>
  )
}
