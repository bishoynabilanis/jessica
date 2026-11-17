import { useState } from 'react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame } from './LabControls'

const REGIONS = [
  {
    id: 'delta',
    name: 'الدلتا',
    en: 'Nile Delta',
    fact: 'أخصب أرض في مصر، بين فرعي دمياط ورشيد، وفيها أغلب الزراعة والسكان.',
    x: 200,
    y: 66,
  },
  {
    id: 'valley',
    name: 'وادي النيل',
    en: 'Nile Valley',
    fact: 'شريط ضيق من أسوان للقاهرة، الزراعة فيه على ضفتي النيل.',
    x: 198,
    y: 160,
  },
  {
    id: 'western',
    name: 'الصحراء الغربية',
    en: 'Western Desert',
    fact: 'أكبر جزء من مصر، فيها واحات زي سيوة والفرافرة، ومناخها صحراوي جاف.',
    x: 90,
    y: 150,
  },
  {
    id: 'eastern',
    name: 'الصحراء الشرقية',
    en: 'Eastern Desert',
    fact: 'بين النيل والبحر الأحمر، فيها جبال ومعادن زي الذهب والفوسفات.',
    x: 310,
    y: 150,
  },
  {
    id: 'sinai',
    name: 'سيناء',
    en: 'Sinai',
    fact: 'شبه جزيرة بين خليجي السويس والعقبة، وفيها جبل موسى وسواحل سياحية.',
    x: 345,
    y: 70,
  },
]

const CITIES = [
  { name: 'الإسكندرية', x: 175, y: 45 },
  { name: 'القاهرة', x: 205, y: 95 },
  { name: 'أسوان', x: 190, y: 245 },
]

export function EgyptMapLab({ onInteract }: { onInteract: () => void }) {
  const [active, setActive] = useState('delta')
  const region = REGIONS.find((item) => item.id === active) || REGIONS[0]

  const pick = (id: string) => {
    onInteract()
    setActive(id)
  }

  return (
    <LabFrame
      header={
        <div>
          <p className="label mb-1 text-sun">{tr('Egypt map lab')}</p>
          <h2 className="font-display text-lg font-extrabold text-main">{tr('Find the region')}</h2>
        </div>
      }
      visual={
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-line bg-ink-950">
            <svg viewBox="0 0 400 280" className="w-full" role="img" aria-label={tr('Map of Egypt')}>
              <rect x="0" y="0" width="400" height="42" fill="#0e3a5c" />
              <text x="200" y="26" textAnchor="middle" fill="#8fd3ff" fontSize="10" fontWeight="700">
                البحر المتوسط
              </text>
              <rect x="30" y="42" width="340" height="228" fill="#2b2416" />
              <polygon points="140,80 260,80 210,42" fill="#1f5c3a" opacity="0.9" />
              <polygon points="320,42 380,42 380,120 340,105" fill="#5c3b1f" opacity="0.9" />
              <path d="M200 270 L200 100 L160 60 M200 100 L240 60" stroke="#38bdf8" strokeWidth="4" fill="none" strokeLinecap="round" />
              <rect x="30" y="42" width="110" height="228" fill="#3a2e1a" opacity="0.55" />
              <rect x="260" y="120" width="110" height="150" fill="#3a2e1a" opacity="0.55" />
              {REGIONS.map((item) => (
                <g key={item.id} onClick={() => pick(item.id)} className="cursor-pointer" role="button" tabIndex={0} aria-label={item.name} data-testid={`map-${item.id}`}>
                  <circle cx={item.x} cy={item.y} r="17" fill={active === item.id ? '#21e6c9' : '#0b1220'} opacity={active === item.id ? 0.9 : 0.55} />
                  <circle cx={item.x} cy={item.y} r="4" fill={active === item.id ? '#071018' : '#ffd166'} />
                </g>
              ))}
              {CITIES.map((city) => (
                <g key={city.name}>
                  <circle cx={city.x} cy={city.y} r="2.5" fill="#fff" />
                  <text x={city.x + 5} y={city.y + 3} fill="#dbe7ff" fontSize="7">
                    {city.name}
                  </text>
                </g>
              ))}
              <text x="360" y="220" textAnchor="middle" fill="#8fd3ff" fontSize="8" transform="rotate(-90 360 220)">
                البحر الأحمر
              </text>
            </svg>
          </div>
          <div className="rounded-2xl border border-line bg-card-2 p-3" data-testid="map-info">
            <p className="text-sm font-extrabold text-main">
              {region.name} <span className="text-[10px] text-muted-2">{region.en}</span>
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">{region.fact}</p>
          </div>
        </div>
      }
      controls={
        <>
          <p className="text-[11px] font-bold text-muted-2">{tr('Click a region on the map.')}</p>
          <div className="grid gap-1.5">
            {REGIONS.map((item) => (
              <button
                key={item.id}
                onClick={() => pick(item.id)}
                data-testid={`map-btn-${item.id}`}
                className={cn(
                  'rounded-xl border px-3 py-1.5 text-start text-[11px] font-bold transition',
                  active === item.id ? 'border-sun/50 bg-sun/10 text-sun' : 'border-line bg-card-2 text-muted hover:text-main',
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
          <LabChallenge done={active === 'sinai'}>{tr('Find Sinai on the map.')}</LabChallenge>
        </>
      }
    />
  )
}
