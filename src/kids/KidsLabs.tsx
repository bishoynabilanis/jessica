import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Droplets, FlaskConical, Leaf, Pizza } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { tr } from '@/i18n'

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function slicePath(cx: number, cy: number, r: number, start: number, end: number) {
  const a = polar(cx, cy, r, start)
  const b = polar(cx, cy, r, end)
  const large = end - start > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`
}

function Fractions() {
  const [den, setDen] = useState(4)
  const [num, setNum] = useState(1)
  const safeNum = Math.min(num, den)
  const slices = Array.from({ length: den }, (_, index) => {
    const start = (index / den) * 360
    const end = ((index + 1) / den) * 360
    return { index, d: slicePath(90, 90, 76, start, end), filled: index < safeNum }
  })

  return (
    <Card className="border-2 border-white p-4">
      <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
        <Pizza className="h-4 w-4 text-coral" /> {tr('Pizza fractions')}
      </p>
      <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row">
        <svg viewBox="0 0 180 180" className="h-40 w-40 shrink-0">
          <circle cx="90" cy="90" r="80" fill="#fff3d6" stroke="#f0b429" strokeWidth="4" />
          {slices.map((slice) => (
            <path key={slice.index} d={slice.d} fill={slice.filled ? '#ff9f43' : 'transparent'} stroke="#fff" strokeWidth="2" />
          ))}
          <circle cx="90" cy="90" r="80" fill="none" stroke="#e08a00" strokeWidth="4" />
        </svg>
        <div className="w-full space-y-3">
          <p className="text-center font-display text-2xl font-extrabold text-ink-950 sm:text-start">
            {safeNum}/{den}
          </p>
          <label className="block">
            <span className="text-[10px] font-bold text-ink-600">{tr('Slices on the plate')}</span>
            <input type="range" min={2} max={8} value={den} onChange={(e) => setDen(Number(e.target.value))} className="range-jessica w-full" />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-ink-600">{tr('Slices you eat')}</span>
            <input type="range" min={0} max={den} value={safeNum} onChange={(e) => setNum(Number(e.target.value))} className="range-jessica w-full" />
          </label>
          <p className="rounded-xl bg-sun/15 px-2.5 py-1.5 text-center text-[11px] font-bold text-amber-800">
            {tr('You ate {n} of {d} slices.', { n: safeNum, d: den })}
          </p>
        </div>
      </div>
    </Card>
  )
}

function States() {
  const [heat, setHeat] = useState(30)
  const state = heat < 25 ? 'solid' : heat < 70 ? 'liquid' : 'gas'
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => ({
        id: index,
        x: state === 'solid' ? 18 + (index % 5) * 16 : state === 'liquid' ? 12 + ((index * 37) % 76) : 8 + ((index * 53) % 84),
        y: state === 'solid' ? 22 + Math.floor(index / 5) * 16 : state === 'liquid' ? 45 + ((index * 29) % 28) : 15 + ((index * 41) % 70),
      })),
    [state],
  )

  return (
    <Card className="border-2 border-white p-4">
      <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
        <FlaskConical className="h-4 w-4 text-sky" /> {tr('States of matter')}
      </p>
      <div className="mt-3 rounded-2xl border border-line bg-white p-3">
        <div className="relative h-40 overflow-hidden rounded-xl bg-gradient-to-b from-sky/10 to-aurora-400/10">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute h-4 w-4 rounded-full bg-sky shadow transition-all duration-700"
              style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
            />
          ))}
        </div>
        <label className="mt-3 block">
          <span className="text-[10px] font-bold text-ink-600">{tr('Temperature')}: {heat}°</span>
          <input type="range" min={0} max={100} value={heat} onChange={(e) => setHeat(Number(e.target.value))} className="range-jessica w-full" />
        </label>
        <p className="text-center text-sm font-extrabold text-ink-950">
          {state === 'solid' ? `🧊 ${tr('Solid')}` : state === 'liquid' ? `💧 ${tr('Liquid')}` : `💨 ${tr('Gas')}`}
        </p>
        <p className="text-center text-[10px] text-ink-600">
          {state === 'solid'
            ? tr('Particles are packed and only vibrate.')
            : state === 'liquid'
              ? tr('Particles slide past each other.')
              : tr('Particles move fast and spread out.')}
        </p>
      </div>
    </Card>
  )
}

function WaterCycle() {
  return (
    <Card className="border-2 border-white p-4">
      <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
        <Droplets className="h-4 w-4 text-sky" /> {tr('Water cycle')}
      </p>
      <div className="relative mt-3 h-52 overflow-hidden rounded-2xl bg-gradient-to-b from-sky/25 via-white to-aurora-400/20 p-3">
        <span className="kids-float absolute left-4 top-3 text-3xl">☀️</span>
        <span className="kids-float kids-float-slow absolute right-8 top-6 text-3xl">☁️</span>
        <span className="absolute right-10 top-16 text-xl">🌧️</span>
        <span className="absolute bottom-4 left-3 text-3xl">🌊</span>
        <span className="absolute bottom-4 right-4 text-3xl">⛰️</span>
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-2xl">🌱</span>
        <div className="absolute inset-x-8 top-1/2 flex items-center justify-between text-[10px] font-bold text-sky">
          <span>↑ {tr('Evaporation')}</span>
          <span>→ {tr('Condensation')}</span>
        </div>
        <div className="absolute inset-x-8 bottom-16 flex items-center justify-between text-[10px] font-bold text-aurora-600">
          <span>↓ {tr('Rain')}</span>
          <span>← {tr('Collection')}</span>
        </div>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-ink-600">
        {tr('The sun heats water, it rises, cools into clouds, falls as rain, and collects again in rivers and seas.')}
      </p>
    </Card>
  )
}

function Plants() {
  return (
    <Card className="border-2 border-white p-4">
      <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
        <Leaf className="h-4 w-4 text-aurora-600" /> {tr('Plant parts')}
      </p>
      <div className="mt-3 flex items-center gap-4">
        <div className="relative h-40 w-28 shrink-0">
          <span className="absolute left-1/2 top-2 -translate-x-1/2 text-3xl">🌱</span>
          <span className="absolute left-1/2 top-1/2 h-16 w-1 -translate-x-1/2 bg-aurora-600/60" />
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-lg">🪴</span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          {[
            ['🌿', 'Leaves', 'make food using sunlight'],
            ['🌱', 'Stem', 'carries water up the plant'],
            ['🪴', 'Roots', 'hold the plant and drink water'],
            ['🌸', 'Flower', 'makes seeds for new plants'],
          ].map(([emoji, name, hint]) => (
            <p key={name}>
              <span className="me-1">{emoji}</span>
              <span className="font-extrabold text-ink-950">{tr(name)}</span>
              <span className="text-ink-600"> — {tr(hint)}</span>
            </p>
          ))}
        </div>
      </div>
    </Card>
  )
}

export function KidsLabs() {
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-950 sm:text-3xl">🧪 {tr('Little labs')}</h1>
          <p className="mt-1 text-xs font-semibold text-ink-600">{tr('Touch, change and see what happens.')}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/kids/play')}>
          {tr('Play and learn')} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Fractions />
        <States />
        <WaterCycle />
        <Plants />
      </div>
    </div>
  )
}
