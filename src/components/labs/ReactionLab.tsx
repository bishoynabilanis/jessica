import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame } from './LabControls'

const REAGENTS = [
  { id: 'vinegar', ar: 'خل', en: 'Vinegar', color: '#d9f99d' },
  { id: 'baking', ar: 'صودا الخبز', en: 'Baking soda', color: '#f8fafc' },
  { id: 'iron', ar: 'مسمار حديد', en: 'Iron nail', color: '#94a3b8' },
  { id: 'copper', ar: 'كبريتات النحاس', en: 'Copper sulfate', color: '#38bdf8' },
  { id: 'silver', ar: 'نترات الفضة', en: 'Silver nitrate', color: '#e2e8f0' },
  { id: 'salt', ar: 'كلوريد الصوديوم', en: 'Sodium chloride', color: '#f1f5f9' },
]

type Result = {
  type: 'gas' | 'displacement' | 'precipitate'
  observation: string
  equation: string
  color: string
  bubbles?: boolean
  precipitate?: boolean
}

const REACTIONS: Record<string, Result> = {
  'baking|vinegar': {
    type: 'gas',
    observation: 'فقاعات كثيفة من غاز ثاني أكسيد الكربون، والرغوة بتملأ الكأس. الغاز ده هو اللي بينفخ العجين.',
    equation: 'CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑',
    color: '#fef3c7',
    bubbles: true,
  },
  'copper|iron': {
    type: 'displacement',
    observation: 'لون المحلول الأزرق بيبهت، وطبقة بنية من النحاس بتترسب على المسمار. الحديد حل محل النحاس.',
    equation: 'Fe + CuSO₄ → FeSO₄ + Cu',
    color: '#b45309',
  },
  'salt|silver': {
    type: 'precipitate',
    observation: 'راسب أبيض من كلوريد الفضة بيكوّن سحابة في الكأس. ده تفاعل ترسيب.',
    equation: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃',
    color: '#e2e8f0',
    precipitate: true,
  },
}

const keyFor = (a: string, b: string) => [a, b].sort().join('|')

export function ReactionLab({ onInteract }: { onInteract: () => void }) {
  const [first, setFirst] = useState('baking')
  const [second, setSecond] = useState('vinegar')
  const result = REACTIONS[keyFor(first, second)]

  const pick = (which: 'first' | 'second', id: string) => {
    onInteract()
    if (which === 'first') setFirst(id)
    else setSecond(id)
  }

  return (
    <LabFrame
      header={
        <div>
          <p className="label mb-1 text-violet-200">{tr('Reaction lab')}</p>
          <h2 className="font-display text-lg font-extrabold text-main">{tr('Mix two reagents and watch')}</h2>
        </div>
      }
      visual={
        <div className="space-y-3">
          <div className="flex justify-center overflow-hidden rounded-2xl border border-line bg-ink-950 p-3">
            <svg viewBox="0 0 220 230" className="h-[240px]" role="img" aria-label={tr('Reaction beaker')} data-testid="reaction-svg">
              <rect x="55" y="20" width="110" height="190" rx="14" fill="none" stroke="#556080" strokeWidth="3" />
              <rect x="58" y="92" width="104" height="115" rx="8" fill={result?.color || '#1e293b'} opacity="0.75" />
              <rect x="58" y="92" width="104" height="6" fill="#dbe7ff" opacity="0.35" />
              {result?.bubbles &&
                Array.from({ length: 9 }).map((_, index) => (
                  <circle key={`b${index}`} cx={70 + (index * 13) % 80} cy={170 - (index % 4) * 18} r={2 + (index % 3)} fill="#fff" opacity="0.7">
                    <animate attributeName="cy" dur={`${1.4 + index * 0.13}s`} repeatCount="indefinite" values="185;100" />
                  </circle>
                ))}
              {result?.precipitate && <rect x="58" y="185" width="104" height="22" rx="5" fill="#f8fafc" opacity="0.85" />}
            </svg>
          </div>
          <div className="rounded-2xl border border-line bg-card-2 p-3" data-testid="reaction-info">
            {result ? (
              <>
                <p className="text-sm font-extrabold text-main">
                  {result.type === 'gas' ? tr('Gas') : result.type === 'precipitate' ? tr('Precipitate') : tr('Displacement')}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">{result.observation}</p>
                <p className="mt-2 rounded-xl bg-black/30 px-2 py-1 text-center text-[11px] font-bold text-aurora-200" dir="ltr">
                  {result.equation}
                </p>
              </>
            ) : (
              <p className="text-[11px] font-bold text-muted">{tr('No visible reaction with this pair.')}</p>
            )}
          </div>
        </div>
      }
      controls={
        <>
          <p className="text-[11px] font-bold text-muted-2">{tr('Pick one reagent for each beaker.')}</p>
          <div>
            <p className="mb-1 text-[10px] font-bold text-muted-2">{tr('First reagent')}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {REAGENTS.map((item) => (
                <button
                  key={`a-${item.id}`}
                  onClick={() => pick('first', item.id)}
                  data-testid={`reaction-a-${item.id}`}
                  className={cn(
                    'rounded-xl border px-2 py-1 text-[10px] font-bold transition',
                    first === item.id ? 'border-violet-neon/50 bg-violet-neon/15 text-violet-200' : 'border-line bg-card-2 text-muted hover:text-main',
                  )}
                >
                  {item.ar}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold text-muted-2">{tr('Second reagent')}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {REAGENTS.map((item) => (
                <button
                  key={`b-${item.id}`}
                  onClick={() => pick('second', item.id)}
                  data-testid={`reaction-b-${item.id}`}
                  className={cn(
                    'rounded-xl border px-2 py-1 text-[10px] font-bold transition',
                    second === item.id ? 'border-violet-neon/50 bg-violet-neon/15 text-violet-200' : 'border-line bg-card-2 text-muted hover:text-main',
                  )}
                >
                  {item.ar}
                </button>
              ))}
            </div>
          </div>
          <LabChallenge done={result?.type === 'precipitate'}>{tr('Make a precipitate.')}</LabChallenge>
        </>
      }
    />
  )
}
