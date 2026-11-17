import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame } from './LabControls'
import { LabGuide } from './LabGuide'

const ORGANS = [
  {
    id: 'mouth',
    name: 'الفم',
    en: 'Mouth',
    fn: 'الأسنان بتقطع الأكل واللعاب بيبدأ تكسير النشويات. أول محطة في الرحلة.',
    x: 110,
    y: 38,
  },
  {
    id: 'esophagus',
    name: 'المريء',
    en: 'Esophagus',
    fn: 'أنبوب عضلي بيوصّل الأكل من الفم للمعدة بحركة دودية.',
    x: 110,
    y: 78,
  },
  {
    id: 'stomach',
    name: 'المعدة',
    en: 'Stomach',
    fn: 'بتخلط الأكل مع الحمض والإنزيمات وتحوّله لعصارة شبه سائلة.',
    x: 132,
    y: 116,
  },
  {
    id: 'small',
    name: 'الأمعاء الدقيقة',
    en: 'Small intestine',
    fn: 'أطول جزء، وفيه بيتم امتصاص معظم الغذاء للم الدم.',
    x: 112,
    y: 172,
  },
  {
    id: 'large',
    name: 'الأمعاء الغليظة',
    en: 'Large intestine',
    fn: 'بتمتص الماء والأملاح وتجهّز الفضلات للخروج.',
    x: 150,
    y: 196,
  },
]

export function DigestionLab({ onInteract }: { onInteract: () => void }) {
  const [active, setActive] = useState(0)
  const [visited, setVisited] = useState<number[]>([0])
  const organ = ORGANS[active]

  const pick = (index: number) => {
    onInteract()
    setActive(index)
    setVisited((current) => (current.includes(index) ? current : [...current, index]))
  }

  const next = () => {
    onInteract()
    pick((active + 1) % ORGANS.length)
  }

  return (
    <>
    <LabFrame
      header={
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="label mb-1 text-aurora-300">{tr('Digestion lab')}</p>
            <h2 className="font-display text-lg font-extrabold text-main">{tr('Follow the food')}</h2>
          </div>
          <span className="rounded-full bg-aurora-400/15 px-2.5 py-1 text-[10px] font-extrabold text-aurora-200" data-testid="digestion-step">
            {active + 1} / {ORGANS.length}
          </span>
        </div>
      }
      visual={
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-line bg-ink-950 p-2">
            <svg viewBox="0 0 260 240" className="mx-auto h-[300px]" role="img" aria-label={tr('Digestive system')}>
              <ellipse cx="110" cy="30" rx="26" ry="24" fill="none" stroke="#2c3550" strokeWidth="2" />
              <path d="M84 48 Q60 110 84 200" fill="none" stroke="#2c3550" strokeWidth="2" />
              <path d="M136 48 Q170 110 146 200" fill="none" stroke="#2c3550" strokeWidth="2" />
              <path d="M84 200 Q110 230 146 200" fill="none" stroke="#2c3550" strokeWidth="2" />

              <circle cx="110" cy="38" r="9" fill={active === 0 ? '#21e6c9' : '#31506a'} />
              <rect x="107" y="55" width="7" height="34" rx="3" fill={active === 1 ? '#21e6c9' : '#31506a'} />
              <path
                d="M104 88 Q84 96 88 120 Q92 146 122 140 Q150 134 146 108 Q142 88 120 92 Z"
                fill={active === 2 ? '#21e6c9' : '#31506a'}
                opacity="0.9"
              />
              <path
                d="M100 145 Q130 135 150 150 Q170 165 148 180 Q126 192 104 178 Q84 164 100 145 Z"
                fill="none"
                stroke={active === 3 ? '#21e6c9' : '#31506a'}
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M176 140 H206 V198 H176"
                fill="none"
                stroke={active === 4 ? '#6b8cff' : '#31506a'}
                strokeWidth="10"
                strokeLinecap="round"
              />
              <circle cx={organ.x} cy={organ.y} r="4" fill="#ffd166" style={{ transition: 'cx .35s ease, cy .35s ease' }} />
              {ORGANS.map((item, index) => (
                <circle
                  key={item.id}
                  cx={item.x}
                  cy={item.y}
                  r="16"
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => pick(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={item.name}
                  data-testid={`digestion-${item.id}`}
                />
              ))}
            </svg>
          </div>
          <div className="rounded-2xl border border-line bg-card-2 p-3" data-testid="digestion-info">
            <p className="text-sm font-extrabold text-main">
              {organ.name} <span className="text-[10px] text-muted-2">{organ.en}</span>
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">{organ.fn}</p>
          </div>
        </div>
      }
      controls={
        <>
          <p className="text-[11px] font-bold text-muted-2">{tr('Click an organ on the body.')}</p>
          <div className="grid gap-1.5">
            {ORGANS.map((item, index) => (
              <button
                key={item.id}
                onClick={() => pick(index)}
                data-testid={`digestion-btn-${item.id}`}
                className={cn(
                  'flex items-center justify-between rounded-xl border px-3 py-1.5 text-[11px] font-bold transition',
                  active === index
                    ? 'border-aurora-400/50 bg-aurora-400/10 text-aurora-200'
                    : 'border-line bg-card-2 text-muted hover:text-main',
                )}
              >
                <span>{item.name}</span>
                <span className="text-[9px] text-muted-2">{index + 1}</span>
              </button>
            ))}
          </div>
          <button
            onClick={next}
            data-testid="digestion-next"
            className="w-full rounded-xl border border-aurora-400/40 bg-aurora-400/10 px-3 py-2 text-[11px] font-extrabold text-aurora-200"
          >
            {tr('Next step')} ←
          </button>
          <LabChallenge done={visited.length === ORGANS.length && active === ORGANS.length - 1}>
            {tr('Visit all five organs in order.')}
          </LabChallenge>
        </>
      }
    />
      <LabGuide
        goal={tr('Follow food through the digestive system.')}
        question={tr('Where does most nutrient absorption happen?')}
        options={[tr('The stomach'), tr('The small intestine'), tr('The large intestine')]}
        correct={1}
        explanation={tr('Villi in the small intestine absorb most of the nutrients.')}
      />
    </>
  )
}
