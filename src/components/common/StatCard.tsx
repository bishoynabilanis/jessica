import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { tr } from '@/i18n'

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = 'text-aurora-300',
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  icon?: React.ReactNode
  accent?: string
  className?: string
}) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{tr(label)}</p>
        {icon && <span className={cn('grid h-8 w-8 place-items-center rounded-xl bg-white/5', accent)}>{icon}</span>}
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-main">{value}</p>
      {hint && <p className="mt-1 text-[10px] font-medium leading-relaxed text-muted">{tr(hint)}</p>}
    </Card>
  )
}
