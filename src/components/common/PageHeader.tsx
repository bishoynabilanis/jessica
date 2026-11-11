import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tr } from '@/i18n'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  actions,
  back,
  className,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  back?: boolean
  className?: string
}) {
  const navigate = useNavigate()
  return (
    <div className={cn('mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-card-2 text-muted transition hover:text-main"
            aria-label={tr('Go back')}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        {icon && (
          <div className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl border border-line bg-gradient-to-br from-aurora-400/15 to-violet-neon/10 text-aurora-300 sm:grid">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && <p className="label mb-1 text-aurora-300">{tr(eyebrow)}</p>}
          <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-main sm:text-3xl">
            {tr(title)}
          </h1>
          {subtitle && <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted sm:text-sm">{tr(subtitle)}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
