import { cn } from '@/lib/utils'
import { tr } from '@/i18n'

export function Card({
  className,
  children,
  hover,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn('glass rounded-3xl', hover && 'card-hover', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  height = 'h-2',
}: {
  value: number
  max?: number
  className?: string
  barClassName?: string
  height?: string
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-white/10', height, className)}>
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-aurora-400 to-violet-neon transition-all duration-700',
          barClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function Spinner({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-10 text-muted', className)}>
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-aurora-400/20 border-t-aurora-400" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-violet-neon/20" />
      </div>
      {label && <p className="text-xs font-semibold">{tr(label)}</p>}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-line px-6 py-12 text-center', className)}>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-aurora-300">{icon}</div>
      <h3 className="text-sm font-bold text-main">{tr(title)}</h3>
      {description && <p className="max-w-sm text-xs leading-relaxed text-muted">{tr(description)}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-xs leading-relaxed text-coral', className)}>
      {children}
    </div>
  )
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="label mb-1 text-aurora-300">{tr(eyebrow)}</p>}
        <h2 className="font-display text-lg font-extrabold tracking-tight text-main sm:text-xl">{tr(title)}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted">{tr(subtitle)}</p>}
      </div>
      {action}
    </div>
  )
}
