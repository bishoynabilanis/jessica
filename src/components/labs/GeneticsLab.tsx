import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame, LabStat } from './LabControls'
import { LabGuide } from './LabGuide'

const GENOTYPES = ['BB', 'Bb', 'bb'] as const
type Genotype = (typeof GENOTYPES)[number]

const phenotype = (genotype: string) => (genotype.includes('B') ? 'brown' : 'blue')

export function GeneticsLab({ onInteract }: { onInteract: () => void }) {
  const [first, setFirst] = useState<Genotype>('Bb')
  const [second, setSecond] = useState<Genotype>('Bb')
  const squares = [0, 1].flatMap((row) =>
    [0, 1].map((col) => `${first[row]}${second[col]}`),
  )
  const brown = squares.filter((item) => phenotype(item) === 'brown').length
  const blue = squares.length - brown

  const set = (which: 'first' | 'second', value: Genotype) => {
    onInteract()
    if (which === 'first') setFirst(value)
    else setSecond(value)
  }

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-coral">{tr('Genetics lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Cross two parents')}</h2>
            </div>
            <span className="rounded-full bg-coral/15 px-2.5 py-1 text-[10px] font-extrabold text-coral" data-testid="genetics-ratio">
              {brown} : {blue}
            </span>
          </div>
        }
        visual={
          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-ink-950 p-4">
              <div className="grid grid-cols-[44px_1fr_1fr] gap-1.5" data-testid="genetics-grid" dir="ltr">
                <span />
                {[0, 1].map((index) => (
                  <span key={`h${index}`} className="grid h-9 place-items-center rounded-lg bg-white/5 font-display text-sm font-extrabold text-sky">
                    {second[index]}
                  </span>
                ))}
                {[0, 1].map((row) => (
                  <div key={`row${row}`} className="contents">
                    <span className="grid h-14 place-items-center rounded-lg bg-white/5 font-display text-sm font-extrabold text-violet-200">
                      {first[row]}
                    </span>
                    {[0, 1].map((col) => {
                      const genotype = `${first[row]}${second[col]}`
                      const isBrown = phenotype(genotype) === 'brown'
                      return (
                        <span
                          key={`c${row}${col}`}
                          className={cn(
                            'grid h-14 place-items-center rounded-lg border font-display text-base font-extrabold',
                            isBrown ? 'border-[#8b5e3c]/60 bg-[#8b5e3c]/25 text-[#f3c99a]' : 'border-sky/50 bg-sky/15 text-sky',
                          )}
                        >
                          {genotype}
                        </span>
                      )
                    })}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-[10px] font-bold text-muted-2">
                {tr('B = brown eyes (dominant) · b = blue eyes (recessive)')}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <LabStat label={tr('Brown')} value={`${brown}/4`} testid="genetics-brown" />
              <LabStat label={tr('Blue')} value={`${blue}/4`} testid="genetics-blue" />
              <LabStat label={tr('Ratio')} value={`${brown}:${blue}`} />
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('Choose a genotype for each parent and read the four possible children.')}</p>
            <div>
              <p className="mb-1 text-[10px] font-bold text-muted-2">{tr('First parent')}</p>
              <div className="grid grid-cols-3 gap-1.5">
                {GENOTYPES.map((item) => (
                  <button
                    key={`a-${item}`}
                    onClick={() => set('first', item)}
                    data-testid={`genetics-a-${item}`}
                    className={cn(
                      'rounded-xl border px-2 py-1.5 font-display text-sm font-extrabold transition',
                      first === item ? 'border-violet-neon/50 bg-violet-neon/15 text-violet-200' : 'border-line bg-card-2 text-muted',
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold text-muted-2">{tr('Second parent')}</p>
              <div className="grid grid-cols-3 gap-1.5">
                {GENOTYPES.map((item) => (
                  <button
                    key={`b-${item}`}
                    onClick={() => set('second', item)}
                    data-testid={`genetics-b-${item}`}
                    className={cn(
                      'rounded-xl border px-2 py-1.5 font-display text-sm font-extrabold transition',
                      second === item ? 'border-coral/50 bg-coral/10 text-coral' : 'border-line bg-card-2 text-muted',
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('A capital letter is dominant. One B is enough for brown eyes; blue needs two lowercase b.')}
            </div>
            <LabChallenge done={first === 'Bb' && second === 'Bb'}>{tr('Cross two carriers and get 3 : 1.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Predict inherited traits with a Punnett square.')}
        question={tr('Two Bb parents have a child. What is the chance of blue eyes?')}
        options={['1 in 4', '2 in 4', '3 in 4']}
        correct={0}
        explanation={tr('Only bb gives blue eyes, and that is one square out of four.')}
      />
    </>
  )
}
