import type { ReactNode } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'

export function LabRange({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  testid,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  testid?: string
}) {
  return (
    <label className="block" data-testid={testid}>
      <span className="flex items-center justify-between text-[11px] font-bold text-muted">
        <span>{label}</span>
        <span className="tabular-nums text-main">
          {value}
          {unit ? ` ${unit}` : ''}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-aurora-400"
      />
    </label>
  )
}

export function LabStat({
  label,
  value,
  hint,
  testid,
}: {
  label: string
  value: string
  hint?: string
  testid?: string
}) {
  return (
    <div className="rounded-2xl border border-line bg-card-2 px-3 py-2" data-testid={testid}>
      <p className="text-[9px] font-bold text-muted-2">{label}</p>
      <p className="mt-0.5 font-display text-lg font-extrabold tabular-nums text-main">{value}</p>
      {hint && <p className="text-[9px] text-muted">{hint}</p>}
    </div>
  )
}

export function LabChallenge({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-2xl border px-3 py-2 text-[11px] font-semibold leading-relaxed',
        done ? 'border-aurora-400/40 bg-aurora-400/10 text-aurora-200' : 'border-line bg-white/5 text-muted',
      )}
      data-testid="lab-challenge"
      data-done={done ? '1' : '0'}
    >
      <span
        className={cn(
          'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full',
          done ? 'bg-aurora-400 text-ink-950' : 'bg-white/10 text-muted',
        )}
      >
        {done ? <Check className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
      </span>
      <span>
        <b className="text-main">{tr('Challenge')}:</b> {children}
      </span>
    </div>
  )
}

export function LabFrame({
  visual,
  controls,
  header,
}: {
  visual: ReactNode
  controls: ReactNode
  header: ReactNode
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
      <div className="rounded-3xl border border-line bg-card p-4 sm:p-5">
        {header}
        <div className="mt-3">{visual}</div>
      </div>
      <div className="space-y-3 rounded-3xl border border-line bg-card p-4 sm:p-5">{controls}</div>
    </div>
  )
}
