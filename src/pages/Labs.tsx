import { useEffect, useRef, useState } from 'react'
import {
  Atom,
  Beaker,
  FlaskConical,
  Gauge,
  HeartPulse,
  Languages,
  Lightbulb,
  LineChart,
  Map,
  PieChart,
  RotateCcw,
  Ruler,
  Sparkles,
  Waves,
  Zap,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { cn } from '@/lib/utils'
import { tr } from '@/i18n'
import { FractionsLab } from '@/components/labs/FractionsLab'
import { GeometryLab } from '@/components/labs/GeometryLab'
import { DensityLab } from '@/components/labs/DensityLab'
import { ForcesLab } from '@/components/labs/ForcesLab'
import { AtomLab } from '@/components/labs/AtomLab'
import { DigestionLab } from '@/components/labs/DigestionLab'
import { EgyptMapLab } from '@/components/labs/EgyptMapLab'
import { ParabolaLab } from '@/components/labs/ParabolaLab'
import { EnglishLab } from '@/components/labs/EnglishLab'

type Lab = 'fractions' | 'geometry' | 'circuit' | 'refraction' | 'density' | 'forces' | 'atom' | 'digestion' | 'map' | 'parabola' | 'english'

const media = [
  { id: 'water', label: 'Water', n: 1.33, color: '#5cc8ff' },
  { id: 'glass', label: 'Glass', n: 1.5, color: '#a78bfa' },
  { id: 'diamond', label: 'Diamond', n: 2.42, color: '#e0f2fe' },
]

export function Labs() {
  const [lab, setLab] = useState<Lab>('circuit')
  const addXP = useApp((s) => s.addXP)
  const pushToast = useUI((s) => s.pushToast)
  const awarded = useRef<Record<string, boolean>>({})

  const reward = (key: string) => {
    if (awarded.current[key]) return
    awarded.current[key] = true
    addXP(10, true)
    pushToast({ title: tr("Lab discovered"), description: tr("Hands-on science earns XP. Try changing a variable."), type: 'xp', xp: 10 })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr("Virtual labs")}
        title={tr("Touch the science")}
        subtitle={tr("Change a variable, watch the result, then explain it back to Jessica. Maths, physics and chemistry, running in your browser.")}
        icon={<FlaskConical className="h-5 w-5" />}
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { id: 'fractions' as Lab, label: tr('Fractions lab'), hint: tr('Equivalent fractions, visually'), icon: PieChart, tint: 'from-aurora-400/20 to-card-2 text-aurora-200', subject: tr('Mathematics') },
          { id: 'geometry' as Lab, label: tr('Geometry lab'), hint: tr('Area and perimeter, live'), icon: Ruler, tint: 'from-violet-neon/20 to-card-2 text-violet-200', subject: tr('Mathematics') },
          { id: 'circuit' as Lab, label: tr("Circuit lab"), hint: tr("Voltage, resistance and brightness"), icon: Zap, tint: 'from-sun/20 to-card-2 text-sun', subject: tr('Science') },
          { id: 'refraction' as Lab, label: tr("Light lab"), hint: tr("Snell’s law and refraction"), icon: Waves, tint: 'from-sky/20 to-card-2 text-sky', subject: tr('Science') },
          { id: 'density' as Lab, label: tr('Density lab'), hint: tr('Float, sink and density'), icon: Beaker, tint: 'from-sky/20 to-card-2 text-sky', subject: tr('Science') },
          { id: 'forces' as Lab, label: tr('Forces lab'), hint: tr('Force, mass and acceleration'), icon: Gauge, tint: 'from-coral/20 to-card-2 text-coral', subject: tr('Science') },
          { id: 'atom' as Lab, label: tr('Atom lab'), hint: tr('Protons, neutrons and electrons'), icon: Atom, tint: 'from-violet-neon/20 to-card-2 text-violet-200', subject: tr('Chemistry') },
          { id: 'digestion' as Lab, label: tr('Digestion lab'), hint: tr('Follow the food step by step'), icon: HeartPulse, tint: 'from-coral/20 to-card-2 text-coral', subject: tr('Biology') },
          { id: 'map' as Lab, label: tr('Egypt map lab'), hint: tr('Regions, Nile and Sinai'), icon: Map, tint: 'from-sun/20 to-card-2 text-sun', subject: tr('Geography') },
          { id: 'parabola' as Lab, label: tr('Parabola lab'), hint: tr('a, b, c and the curve'), icon: LineChart, tint: 'from-aurora-400/20 to-card-2 text-aurora-200', subject: tr('Mathematics') },
          { id: 'english' as Lab, label: tr('English lab'), hint: tr('Hear the word, pick the meaning'), icon: Languages, tint: 'from-sky/20 to-card-2 text-sky', subject: tr('English') },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setLab(item.id)
              reward(item.id)
            }}
            className={cn(
              'flex items-center gap-3 rounded-2xl border bg-gradient-to-br p-4 text-left transition',
              item.tint,
              lab === item.id ? 'border-aurora-400/40 shadow-glow' : 'border-line hover:border-line-strong',
            )}
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-main">{tr(item.label)}</p>
              <p className="text-[10px] text-muted">{item.hint}</p>
              <span className="mt-0.5 inline-block rounded-full bg-white/5 px-1.5 py-0.5 text-[8px] font-bold text-muted-2">
                {item.subject}
              </span>
            </div>
            <Sparkles className="ml-auto h-4 w-4 text-aurora-300/60" />
          </button>
        ))}
      </div>

      {lab === 'fractions' && <FractionsLab onInteract={() => reward('fractions')} />}
      {lab === 'geometry' && <GeometryLab onInteract={() => reward('geometry')} />}
      {lab === 'circuit' && <CircuitLab onInteract={() => reward('circuit')} />}
      {lab === 'refraction' && <RefractionLab onInteract={() => reward('refraction')} />}
      {lab === 'density' && <DensityLab onInteract={() => reward('density')} />}
      {lab === 'forces' && <ForcesLab onInteract={() => reward('forces')} />}
      {lab === 'atom' && <AtomLab onInteract={() => reward('atom')} />}
      {lab === 'digestion' && <DigestionLab onInteract={() => reward('digestion')} />}
      {lab === 'map' && <EgyptMapLab onInteract={() => reward('map')} />}
      {lab === 'parabola' && <ParabolaLab onInteract={() => reward('parabola')} />}
      {lab === 'english' && <EnglishLab onInteract={() => reward('english')} />}
    </div>
  )
}

function CircuitLab({ onInteract }: { onInteract: () => void }) {
  const [voltage, setVoltage] = useState(6)
  const [resistance, setResistance] = useState(6)
  const [closed, setClosed] = useState(true)
  const current = closed ? voltage / resistance : 0
  const power = current * current * resistance
  const brightness = Math.min(1, power / 12)
  const glow = Math.round(28 + brightness * 70)

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="label mb-1 text-sun">{tr("Circuit bench")}</p>
            <h2 className="font-display text-lg font-extrabold text-main">{tr("Build the current")}</h2>
          </div>
          <span className={cn('chip', closed ? 'border-aurora-400/25 text-aurora-200' : 'border-line text-muted')}>
            <Zap className="h-3 w-3" /> {current.toFixed(2)} A
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-line bg-ink-950 p-4">
          <svg viewBox="0 0 520 280" className="w-full" role="img" aria-label={tr("Simple series circuit")}>
            <defs>
              <radialGradient id="bulbGlow">
                <stop offset="0%" stopColor="#ffe08a" stopOpacity={brightness * 0.9} />
                <stop offset="100%" stopColor="#ffd166" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="380" cy="86" r={glow} fill="url(#bulbGlow)" opacity={brightness} />
            {/* wires */}
            <path d="M90 70 H300" stroke={closed ? '#ffd166' : '#3a4560'} strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M380 70 H430 V210 H90 V70" stroke={closed ? '#ffd166' : '#3a4560'} strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M90 70 V210" stroke={closed ? '#ffd166' : '#3a4560'} strokeWidth="5" />
            {closed && (
              <circle r="5" fill="#fff2b8">
                <animateMotion dur="2s" repeatCount="indefinite" path="M90 70 H300 M340 70 H430 V210 H90 V70" />
              </circle>
            )}

            {/* battery */}
            <g>
              <rect x="52" y="120" width="38" height="62" rx="8" fill="#11172c" stroke="#5cc8ff" strokeWidth="3" />
              <text x="71" y="158" textAnchor="middle" fill="#5cc8ff" fontSize="16" fontWeight="800">V</text>
              <text x="100" y="152" fill="#93a4c8" fontSize="11" fontWeight="700">{voltage} V</text>
            </g>

            {/* switch */}
            <g transform="translate(230 42)">
              <circle cx="-24" cy="28" r="5" fill="#93a4c8" />
              <circle cx="24" cy="28" r="5" fill="#93a4c8" />
              <line x1="-20" y1="26" x2={closed ? '20' : '16'} y2={closed ? '26' : '-2'} stroke={closed ? '#21e6c9' : '#ff7a8a'} strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* resistor */}
            <g transform="translate(120 176)">
              <rect x="0" y="0" width="76" height="22" rx="5" fill="#1a2340" stroke="#a78bfa" strokeWidth="2.5" />
              <text x="38" y="15" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="800">{resistance} Ω</text>
            </g>

            {/* bulb */}
            <g transform="translate(340 70)">
              <circle cx="0" cy="0" r="30" fill={brightness > 0.05 ? '#ffd166' : '#1a2340'} opacity={brightness > 0.05 ? 0.85 : 1} stroke="#ffd166" strokeWidth="3" />
              <path d="M-8 -6 Q0 -18 8 -6 M-9 4 L9 4" stroke="#0b1220" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <rect x="-10" y="26" width="20" height="12" rx="3" fill="#93a4c8" />
            </g>
          </svg>

          <button
            onClick={() => {
              setClosed((c) => !c)
              onInteract()
            }}
            className={cn(
              'absolute bottom-3 right-3 rounded-xl px-2.5 py-1.5 text-[10px] font-bold transition',
              closed ? 'bg-aurora-400/15 text-aurora-200' : 'bg-coral/15 text-coral',
            )}
          >
            {closed ? tr('Switch: closed') : tr('Switch: open')}
          </button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="rounded-2xl border border-line bg-card-2 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label">{tr("Battery voltage")}</span>
              <span className="text-[11px] font-bold text-sky">{voltage} V</span>
            </div>
            <input type="range" min={3} max={12} step={1} value={voltage} onChange={(e) => { setVoltage(Number(e.target.value)); onInteract() }} className="range-jessica w-full" />
          </label>
          <label className="rounded-2xl border border-line bg-card-2 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label">{tr("Resistance")}</span>
              <span className="text-[11px] font-bold text-violet-glow">{resistance} Ω</span>
            </div>
            <input type="range" min={2} max={20} step={1} value={resistance} onChange={(e) => { setResistance(Number(e.target.value)); onInteract() }} className="range-jessica w-full" />
          </label>
        </div>
      </Card>

      <div className="space-y-3">
        <Card className="p-4">
          <p className="label mb-2">{tr("Live readings")}</p>
          <div className="space-y-2">
            {[
              { label: tr("Current (I = V / R)"), value: `${current.toFixed(2)} A`, color: 'text-sky' },
              { label: tr("Power (P = I² × R)"), value: `${power.toFixed(1)} W`, color: 'text-sun' },
              { label: tr("Bulb brightness"), value: brightness > 0.65 ? tr('Blazing') : brightness > 0.25 ? tr('Bright') : brightness > 0.02 ? tr('Dim') : tr('Off'), color: 'text-aurora-300' },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-xl border border-line bg-card-2 px-3 py-2">
                <span className="text-[10px] text-muted">{r.label}</span>
                <span className={cn('text-[11px] font-extrabold', r.color)}>{r.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => { setVoltage(6); setResistance(6); setClosed(true) }}>
              <RotateCcw className="h-3.5 w-3.5" /> {tr("Reset")}
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-main">
            <Lightbulb className="h-3.5 w-3.5 text-sun" /> {tr("Investigate")}
          </p>
          <ul className="mt-2 space-y-1.5 text-[10px] leading-relaxed text-muted">
            <li>{tr("• Double the voltage. What happens to the current?")}</li>
            <li>{tr("• Double the resistance. Why does the bulb dim?")}</li>
            <li>{tr("• Open the switch. Is there still a current? Why not?")}</li>
          </ul>
          <p className="mt-2 rounded-lg bg-aurora-400/10 px-2 py-1.5 text-[10px] font-semibold text-aurora-200">
            {tr("Ohm’s law: V = I × R. Everything on this bench follows it.")}
          </p>
        </Card>
      </div>
    </div>
  )
}

function RefractionLab({ onInteract }: { onInteract: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [angle, setAngle] = useState(40)
  const [mediumId, setMediumId] = useState('water')
  const medium = media.find((m) => m.id === mediumId) || media[0]
  const n1 = 1
  const n2 = medium.n
  const sin2 = (n1 * Math.sin((angle * Math.PI) / 180)) / n2
  const refracted = Math.asin(Math.min(1, sin2)) * (180 / Math.PI)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const width = canvas.clientWidth || 520
    const height = 300
    canvas.width = width * dpr
    canvas.height = height * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const cx = width / 2
    const cy = height / 2

    // lower medium
    ctx.fillStyle = `${medium.color}22`
    ctx.fillRect(0, cy, width, height - cy)
    ctx.strokeStyle = `${medium.color}55`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, cy)
    ctx.lineTo(width, cy)
    ctx.stroke()

    // normal
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = 'rgba(255,255,255,.22)'
    ctx.beginPath()
    ctx.moveTo(cx, 20)
    ctx.lineTo(cx, height - 20)
    ctx.stroke()
    ctx.setLineDash([])

    // incident ray
    const incRad = (angle * Math.PI) / 180
    const len = Math.min(200, cy - 24)
    const startX = cx - Math.sin(incRad) * len
    const startY = cy - Math.cos(incRad) * len
    ctx.strokeStyle = '#ffd166'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(cx, cy)
    ctx.stroke()

    // arrow
    const arrowAngle = Math.atan2(cy - startY, cx - startX)
    ctx.save()
    ctx.translate(cx - Math.cos(arrowAngle) * 10, cy - Math.sin(arrowAngle) * 10)
    ctx.rotate(arrowAngle)
    ctx.fillStyle = '#ffd166'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-9, 5)
    ctx.lineTo(-9, -5)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // refracted ray
    const refRad = (refracted * Math.PI) / 180
    const endX = cx + Math.sin(refRad) * len
    const endY = cy + Math.cos(refRad) * len
    ctx.strokeStyle = medium.color
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(endX, endY)
    ctx.stroke()

    // labels
    ctx.fillStyle = 'rgba(238,242,255,.8)'
    ctx.font = '600 11px "Plus Jakarta Sans", Arial, sans-serif'
    ctx.fillText(tr('Air · n = 1.00'), 14, 22)
    ctx.fillStyle = medium.color
    ctx.fillText(`${tr(medium.label)} · n = ${medium.n}`, 14, height - 14)
    ctx.fillStyle = '#ffd166'
    ctx.fillText(`${angle}°`, cx - Math.sin(incRad) * len - 34, startY + 4)
    ctx.fillStyle = medium.color
    ctx.fillText(`${refracted.toFixed(1)}°`, Math.min(width - 40, endX + 6), Math.min(height - 20, endY - 4))

    // normal label
    ctx.fillStyle = 'rgba(255,255,255,.4)'
    ctx.fillText('normal', cx + 5, 30)
  }, [angle, medium, refracted])

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="label mb-1 text-sky">{tr("Light bench")}</p>
            <h2 className="font-display text-lg font-extrabold text-main">{tr("Bend the beam")}</h2>
          </div>
          <span className="chip border-sky/25 text-sky">
            <Waves className="h-3 w-3" /> θ₂ = {refracted.toFixed(1)}°
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-ink-950">
          <canvas ref={canvasRef} className="h-[300px] w-full" />
        </div>

        <div className="mt-3 space-y-2">
          <label className="block rounded-2xl border border-line bg-card-2 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label">{tr("Angle of incidence")}</span>
              <span className="text-[11px] font-bold text-sun">{angle}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              step={1}
              value={angle}
              onChange={(e) => {
                setAngle(Number(e.target.value))
                onInteract()
              }}
              className="range-jessica w-full"
            />
          </label>
          <div className="flex gap-1.5">
            {media.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMediumId(m.id)
                  onInteract()
                }}
                className={cn(
                  'flex-1 rounded-xl border px-2 py-1.5 text-[10px] font-bold transition',
                  mediumId === m.id ? 'border-aurora-400/40 bg-aurora-400/10 text-aurora-200' : 'border-line bg-card-2 text-muted',
                )}
              >
                {tr(m.label)} {tr("(n=")}{m.n})
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <Card className="p-4">
          <p className="label mb-2">{tr("Snell’s law")}</p>
          <div className="rounded-xl border border-line bg-card-2 p-3 text-center">
            <p className="font-mono text-sm font-bold text-main">{tr("n₁ sin θ₁ = n₂ sin θ₂")}</p>
            <p className="mt-2 text-[11px] text-muted">
              {tr("1.00 × sin")} {angle}° = {medium.n} {tr("× sin θ₂")}
            </p>
            <p className="mt-1 font-display text-lg font-extrabold text-aurora-300">θ₂ = {refracted.toFixed(1)}°</p>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-muted">
            {refracted < angle
              ? tr('The ray bends toward the normal — it is entering a denser medium and slowing down.')
              : tr('The ray bends away from the normal — it is entering a less dense medium.')}
          </p>
        </Card>

        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-main">
            <Atom className="h-3.5 w-3.5 text-violet-glow" /> {tr("Investigate")}
          </p>
          <ul className="mt-2 space-y-1.5 text-[10px] leading-relaxed text-muted">
            <li>{tr("• At 0°, does the light bend at all?")}</li>
            <li>{tr("• Which material bends light the most?")}</li>
            <li>{tr("• Why do swimming pools look shallower than they are?")}</li>
          </ul>
          <p className="mt-2 rounded-lg bg-sky/10 px-2 py-1.5 text-[10px] font-semibold text-sky">
            {tr("Denser medium → slower light → bigger bend. That is refraction.")}
          </p>
        </Card>
      </div>
    </div>
  )
}
