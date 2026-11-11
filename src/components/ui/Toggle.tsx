import { cn } from '@/lib/utils'
import { tr } from '@/i18n'

export function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
  disabled,
  className,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
}) {
  if (!label) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
          checked ? 'border-aurora-400/40 bg-aurora-400' : 'border-line-strong bg-white/10',
          disabled && 'opacity-40',
          className,
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-all',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </button>
    )
  }

  return (
    <div className={cn('flex items-center justify-between gap-4 py-2', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {icon && <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-muted">{icon}</div>}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-main">{tr(label)}</p>
          {description && <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{tr(description)}</p>}
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[]
  value: T
  onChange: (v: T) => void
  className?: string
  size?: 'sm' | 'md'
}) {
  return (
    <div className={cn('flex gap-1 rounded-2xl border border-line bg-card-2 p-1', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-xl font-semibold transition-all',
            size === 'sm' ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2 text-xs',
            value === opt.value
              ? 'bg-aurora-400 text-ink-950 shadow'
              : 'text-muted hover:bg-white/5 hover:text-main',
          )}
        >
          {opt.icon}
          <span className="truncate">{tr(opt.label)}</span>
        </button>
      ))}
    </div>
  )
}
