import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowLeftRight,
  Atom,
  AudioWaveform,
  BarChart3,
  Beaker,
  BookText,
  Calculator,
  Clock,
  CloudRain,
  Flame,
  FlaskConical,
  Gauge,
  HeartPulse,
  Languages,
  Lightbulb,
  LineChart,
  Magnet,
  Map,
  Orbit,
  Percent,
  PieChart,
  RotateCcw,
  Ruler,
  Scale,
  Search,
  Sparkles,
  Sprout,
  TestTube2,
  Thermometer,
  Waves,
  Wrench,
  Zap,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'
import { FractionsLab } from '@/components/labs/FractionsLab'
import { GeometryLab } from '@/components/labs/GeometryLab'
import { DensityLab } from '@/components/labs/DensityLab'
import { ForcesLab } from '@/components/labs/ForcesLab'
import { AtomLab } from '@/components/labs/AtomLab'
import { DigestionLab } from '@/components/labs/DigestionLab'
import { EgyptMapLab } from '@/components/labs/EgyptMapLab'
import { ParabolaLab } from '@/components/labs/ParabolaLab'
import { EnglishLab } from '@/components/labs/EnglishLab'
import { ReactionLab } from '@/components/labs/ReactionLab'
import { StatesLab } from '@/components/labs/StatesLab'
import { WaterCycleLab } from '@/components/labs/WaterCycleLab'
import { MagnetismLab } from '@/components/labs/MagnetismLab'
import { NumberLineLab } from '@/components/labs/NumberLineLab'
import { BalanceLab } from '@/components/labs/BalanceLab'
import { TimesLab } from '@/components/labs/TimesLab'
import { ClockLab } from '@/components/labs/ClockLab'
import { PlantsLab } from '@/components/labs/PlantsLab'
import { SolarLab } from '@/components/labs/SolarLab'
import { PhLab } from '@/components/labs/PhLab'
import { HeatLab } from '@/components/labs/HeatLab'
import { PercentLab } from '@/components/labs/PercentLab'
import { StatsLab } from '@/components/labs/StatsLab'
import { SoundLab } from '@/components/labs/SoundLab'
import { LeverLab } from '@/components/labs/LeverLab'
import { ArabicLab } from '@/components/labs/ArabicLab'
import { CirculationLab } from '@/components/labs/CirculationLab'
import { LabGuide } from '@/components/labs/LabGuide'

type Lab =
  | 'fractions'
  | 'geometry'
  | 'circuit'
  | 'refraction'
  | 'density'
  | 'forces'
  | 'atom'
  | 'digestion'
  | 'map'
  | 'parabola'
  | 'english'
  | 'reaction'
  | 'states'
  | 'water'
  | 'magnet'
  | 'numberline'
  | 'balance'
  | 'times'
  | 'clock'
  | 'plants'
  | 'solar'
  | 'ph'
  | 'heat'
  | 'percent'
  | 'stats'
  | 'sound'
  | 'lever'
  | 'arabic'
  | 'circulation'

type Stage = 'primary' | 'prep' | 'both'

type LabMeta = {
  id: Lab
  label: string
  hint: string
  icon: LucideIcon
  tint: string
  subject: string
  stage: Stage
  grades: [number, number]
}

const media = [
  { id: 'water', label: 'Water', n: 1.33, color: '#5cc8ff' },
  { id: 'glass', label: 'Glass', n: 1.5, color: '#a78bfa' },
  { id: 'diamond', label: 'Diamond', n: 2.42, color: '#e0f2fe' },
]

const LAB_META: LabMeta[] = [
  { id: 'numberline', label: 'Number line lab', hint: 'Add and subtract by jumping', icon: ArrowLeftRight, tint: 'from-aurora-400/20 to-card-2 text-aurora-200', subject: 'Mathematics', stage: 'primary', grades: [1, 3] },
  { id: 'times', label: 'Times tables lab', hint: 'See multiplication as rows', icon: Calculator, tint: 'from-aurora-400/20 to-card-2 text-aurora-200', subject: 'Mathematics', stage: 'primary', grades: [2, 4] },
  { id: 'clock', label: 'Clock lab', hint: 'Read the time on the hands', icon: Clock, tint: 'from-sun/20 to-card-2 text-sun', subject: 'Mathematics', stage: 'primary', grades: [2, 4] },
  { id: 'fractions', label: 'Fractions lab', hint: 'Equivalent fractions, visually', icon: PieChart, tint: 'from-aurora-400/20 to-card-2 text-aurora-200', subject: 'Mathematics', stage: 'primary', grades: [3, 5] },
  { id: 'geometry', label: 'Geometry lab', hint: 'Area and perimeter, live', icon: Ruler, tint: 'from-violet-neon/20 to-card-2 text-violet-200', subject: 'Mathematics', stage: 'primary', grades: [4, 6] },
  { id: 'magnet', label: 'Magnetism lab', hint: 'Attract and repel', icon: Magnet, tint: 'from-coral/20 to-card-2 text-coral', subject: 'Science', stage: 'primary', grades: [4, 6] },
  { id: 'plants', label: 'Plants lab', hint: 'What a leaf needs to grow', icon: Sprout, tint: 'from-aurora-400/20 to-card-2 text-aurora-200', subject: 'Biology', stage: 'primary', grades: [4, 6] },
  { id: 'solar', label: 'Solar system lab', hint: 'Distance and year length', icon: Orbit, tint: 'from-sun/20 to-card-2 text-sun', subject: 'Science', stage: 'primary', grades: [4, 6] },
  { id: 'english', label: 'English lab', hint: 'Hear the word, pick the meaning', icon: Languages, tint: 'from-sky/20 to-card-2 text-sky', subject: 'English', stage: 'primary', grades: [3, 6] },
  { id: 'arabic', label: 'Arabic lab', hint: 'Dissect the sentence', icon: BookText, tint: 'from-sun/20 to-card-2 text-sun', subject: 'Arabic', stage: 'both', grades: [4, 9] },
  { id: 'percent', label: 'Percent lab', hint: 'Discounts and sale prices', icon: Percent, tint: 'from-aurora-400/20 to-card-2 text-aurora-200', subject: 'Mathematics', stage: 'prep', grades: [6, 8] },
  { id: 'balance', label: 'Balance lab', hint: 'Solve an equation with a scale', icon: Scale, tint: 'from-violet-neon/20 to-card-2 text-violet-200', subject: 'Mathematics', stage: 'prep', grades: [7, 9] },
  { id: 'stats', label: 'Statistics lab', hint: 'Mean, median, mode and range', icon: BarChart3, tint: 'from-violet-neon/20 to-card-2 text-violet-200', subject: 'Mathematics', stage: 'prep', grades: [7, 9] },
  { id: 'parabola', label: 'Parabola lab', hint: 'a, b, c and the curve', icon: LineChart, tint: 'from-aurora-400/20 to-card-2 text-aurora-200', subject: 'Mathematics', stage: 'prep', grades: [8, 9] },
  { id: 'circuit', label: 'Circuit lab', hint: 'Voltage, resistance and brightness', icon: Zap, tint: 'from-sun/20 to-card-2 text-sun', subject: 'Science', stage: 'prep', grades: [7, 9] },
  { id: 'density', label: 'Density lab', hint: 'Float, sink and density', icon: Beaker, tint: 'from-sky/20 to-card-2 text-sky', subject: 'Science', stage: 'prep', grades: [7, 8] },
  { id: 'forces', label: 'Forces lab', hint: 'Force, mass and acceleration', icon: Gauge, tint: 'from-coral/20 to-card-2 text-coral', subject: 'Science', stage: 'prep', grades: [7, 9] },
  { id: 'heat', label: 'Heat lab', hint: 'Which rod conducts fastest', icon: Flame, tint: 'from-coral/20 to-card-2 text-coral', subject: 'Science', stage: 'prep', grades: [7, 9] },
  { id: 'sound', label: 'Sound lab', hint: 'Frequency, pitch and volume', icon: AudioWaveform, tint: 'from-sky/20 to-card-2 text-sky', subject: 'Science', stage: 'prep', grades: [7, 8] },
  { id: 'refraction', label: 'Light lab', hint: 'Snell’s law and refraction', icon: Waves, tint: 'from-sky/20 to-card-2 text-sky', subject: 'Science', stage: 'prep', grades: [8, 9] },
  { id: 'lever', label: 'Lever lab', hint: 'Moments and mechanical advantage', icon: Wrench, tint: 'from-sun/20 to-card-2 text-sun', subject: 'Science', stage: 'prep', grades: [7, 9] },
  { id: 'atom', label: 'Atom lab', hint: 'Protons, neutrons and electrons', icon: Atom, tint: 'from-violet-neon/20 to-card-2 text-violet-200', subject: 'Chemistry', stage: 'prep', grades: [8, 9] },
  { id: 'reaction', label: 'Reaction lab', hint: 'Mix two reagents and observe', icon: FlaskConical, tint: 'from-violet-neon/20 to-card-2 text-violet-200', subject: 'Chemistry', stage: 'prep', grades: [8, 9] },
  { id: 'ph', label: 'Acids and bases lab', hint: 'Measure pH and litmus', icon: TestTube2, tint: 'from-violet-neon/20 to-card-2 text-violet-200', subject: 'Chemistry', stage: 'prep', grades: [8, 9] },
  { id: 'digestion', label: 'Digestion lab', hint: 'Follow the food step by step', icon: HeartPulse, tint: 'from-coral/20 to-card-2 text-coral', subject: 'Biology', stage: 'prep', grades: [7, 8] },
  { id: 'circulation', label: 'Circulation lab', hint: 'Heart rate and oxygen', icon: Activity, tint: 'from-coral/20 to-card-2 text-coral', subject: 'Biology', stage: 'prep', grades: [8, 9] },
  { id: 'map', label: 'Egypt map lab', hint: 'Regions, Nile and Sinai', icon: Map, tint: 'from-sun/20 to-card-2 text-sun', subject: 'Geography', stage: 'both', grades: [4, 9] },
  { id: 'states', label: 'States lab', hint: 'Heat, particles and states', icon: Thermometer, tint: 'from-sky/20 to-card-2 text-sky', subject: 'Science', stage: 'both', grades: [4, 7] },
  { id: 'water', label: 'Water cycle lab', hint: 'Evaporation, clouds and rain', icon: CloudRain, tint: 'from-sky/20 to-card-2 text-sky', subject: 'Science', stage: 'both', grades: [4, 7] },
]

const SUBJECTS = ['all', 'Mathematics', 'Science', 'Chemistry', 'Biology', 'Geography', 'English', 'Arabic']

const gradeLabel = (grades: [number, number]) => `${tr('Grades')} ${num(grades[0])}–${num(grades[1])}`

function filterLabs(stage: 'all' | 'primary' | 'prep', subject: string, query: string) {
  const needle = query.trim().toLowerCase()
  return LAB_META.filter((item) => {
    const stageOk = stage === 'all' || item.stage === 'both' || item.stage === stage
    const subjectOk = subject === 'all' || item.subject === subject
    const textOk = !needle || tr(item.label).toLowerCase().includes(needle) || tr(item.hint).toLowerCase().includes(needle)
    return stageOk && subjectOk && textOk
  })
}

export function Labs() {
  const gradeLevel = useApp.getState().settings.gradeLevel
  const [lab, setLab] = useState<Lab>(() => (gradeLevel <= 6 ? 'fractions' : 'circuit'))
  const [stageFilter, setStageFilter] = useState<'all' | 'primary' | 'prep'>(() => (gradeLevel <= 6 ? 'primary' : 'prep'))
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [query, setQuery] = useState('')
  const addXP = useApp((s) => s.addXP)
  const pushToast = useUI((s) => s.pushToast)
  const awarded = useRef<Record<string, boolean>>({})
  const visible = filterLabs(stageFilter, subjectFilter, query)

  useEffect(() => {
    const list = filterLabs(stageFilter, subjectFilter, query)
    if (list.length && !list.some((item) => item.id === lab)) setLab(list[0].id)
  }, [stageFilter, subjectFilter, query, lab])

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
        subtitle={tr("Twenty-nine simulations across the Egyptian curriculum, from grade 1 to grade 9. Change a variable, watch the result, then explain it back to Jessica.")}
        icon={<FlaskConical className="h-5 w-5" />}
      />

      <div className="space-y-2 rounded-3xl border border-line bg-card p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {([
            ['all', tr('All labs')],
            ['primary', tr('Primary')],
            ['prep', tr('Prep')],
          ] as Array<['all' | 'primary' | 'prep', string]>).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setStageFilter(id)}
              data-testid={`lab-filter-${id}`}
              className={cn(
                'rounded-full border px-3 py-1 text-[11px] font-bold transition',
                stageFilter === id ? 'border-aurora-400/50 bg-aurora-400/10 text-aurora-200' : 'border-line bg-card-2 text-muted hover:text-main',
              )}
            >
              {label}
            </button>
          ))}
          <span className="ms-auto text-[10px] font-bold text-muted-2" data-testid="lab-count">
            {visible.length} {tr('labs')}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {SUBJECTS.map((id) => (
            <button
              key={id}
              onClick={() => setSubjectFilter(id)}
              data-testid={`lab-subject-${id}`}
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition',
                subjectFilter === id ? 'border-violet-neon/50 bg-violet-neon/15 text-violet-200' : 'border-line bg-card-2 text-muted-2 hover:text-main',
              )}
            >
              {id === 'all' ? tr('All subjects') : tr(id)}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-card-2 px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-2" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tr('Search the labs')}
            data-testid="lab-search"
            className="w-full bg-transparent text-[11px] font-bold text-main outline-none placeholder:text-muted-2"
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-3xl border border-line bg-card p-6 text-center text-[11px] font-bold text-muted" data-testid="lab-empty">
          {tr('No lab matches this filter yet.')}
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setLab(item.id)
                reward(item.id)
              }}
              className={cn(
                'flex items-start gap-3 rounded-2xl border bg-gradient-to-br p-4 text-start transition',
                item.tint,
                lab === item.id ? 'border-aurora-400/40 shadow-glow' : 'border-line hover:border-line-strong',
              )}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-main">{tr(item.label)}</span>
                <span className="block text-[10px] text-muted">{tr(item.hint)}</span>
                <span className="mt-1 flex flex-wrap gap-1">
                  <span className="inline-block rounded-full bg-white/5 px-1.5 py-0.5 text-[8px] font-bold text-muted-2">{tr(item.subject)}</span>
                  <span className="inline-block rounded-full bg-white/5 px-1.5 py-0.5 text-[8px] font-bold text-muted-2">
                    {item.stage === 'both' ? tr('All levels') : item.stage === 'primary' ? tr('Primary') : tr('Prep')}
                  </span>
                  <span className="inline-block rounded-full bg-white/5 px-1.5 py-0.5 text-[8px] font-bold text-muted-2">{gradeLabel(item.grades)}</span>
                </span>
              </span>
              <Sparkles className={cn('mt-0.5 h-4 w-4 shrink-0', lab === item.id ? 'text-aurora-300' : 'text-aurora-300/40')} />
            </button>
          ))}
        </div>
      )}

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
      {lab === 'reaction' && <ReactionLab onInteract={() => reward('reaction')} />}
      {lab === 'states' && <StatesLab onInteract={() => reward('states')} />}
      {lab === 'water' && <WaterCycleLab onInteract={() => reward('water')} />}
      {lab === 'magnet' && <MagnetismLab onInteract={() => reward('magnet')} />}
      {lab === 'numberline' && <NumberLineLab onInteract={() => reward('numberline')} />}
      {lab === 'balance' && <BalanceLab onInteract={() => reward('balance')} />}
      {lab === 'times' && <TimesLab onInteract={() => reward('times')} />}
      {lab === 'clock' && <ClockLab onInteract={() => reward('clock')} />}
      {lab === 'plants' && <PlantsLab onInteract={() => reward('plants')} />}
      {lab === 'solar' && <SolarLab onInteract={() => reward('solar')} />}
      {lab === 'ph' && <PhLab onInteract={() => reward('ph')} />}
      {lab === 'heat' && <HeatLab onInteract={() => reward('heat')} />}
      {lab === 'percent' && <PercentLab onInteract={() => reward('percent')} />}
      {lab === 'stats' && <StatsLab onInteract={() => reward('stats')} />}
      {lab === 'sound' && <SoundLab onInteract={() => reward('sound')} />}
      {lab === 'lever' && <LeverLab onInteract={() => reward('lever')} />}
      {lab === 'arabic' && <ArabicLab onInteract={() => reward('arabic')} />}
      {lab === 'circulation' && <CirculationLab onInteract={() => reward('circulation')} />}
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
    <>
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
      <LabGuide
        goal={tr('Discover Ohm’s law by changing voltage and resistance.')}
        question={tr('You double the resistance and keep the voltage. What happens to the current?')}
        options={[tr('It doubles'), tr('It halves'), tr('It stays the same')]}
        correct={1}
        explanation={tr('I = V ÷ R, so doubling R halves the current.')}
      />
    </>
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
    <>
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
      <LabGuide
        goal={tr('See why a straw looks bent in a glass of water.')}
        question={tr('Light moves from air into water. Which way does it bend?')}
        options={[tr('Toward the normal'), tr('Away from the normal'), tr('It does not bend')]}
        correct={0}
        explanation={tr('Water is denser than air, so light slows down and bends toward the normal.')}
      />
    </>
  )
}
