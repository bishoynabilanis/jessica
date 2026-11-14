import { BookOpen, Check, ChevronLeft, Sparkles, Target, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/store/useApp'
import { num, tr } from '@/i18n'
import { cn } from '@/lib/utils'

/**
 * First-run checklist. It disappears on its own once the learner has opened a
 * book, answered a drill and planned a day — or when they hide it.
 */
export function QuickStart() {
  const bookProgress = useApp((s) => s.bookProgress)
  const unitMastery = useApp((s) => s.unitMastery)
  const skillStats = useApp((s) => s.skillStats)
  const exams = useApp((s) => s.exams)
  const planner = useApp((s) => s.planner)
  const settings = useApp((s) => s.settings)
  const updateSettings = useApp((s) => s.updateSettings)

  const openedBook = Object.keys(bookProgress).length > 0
  const solved = Object.keys(unitMastery).length > 0 || Object.keys(skillStats).length > 0 || exams.length > 0
  const planned = planner.length > 0

  const steps = [
    {
      icon: BookOpen,
      title: 'Open your book',
      hint: 'Any page works — tap a sentence for an explanation.',
      to: '/library',
      done: openedBook,
    },
    {
      icon: Target,
      title: 'Know your level',
      hint: 'Twelve questions, two minutes, then a plan built on your real gaps.',
      to: '/diagnostic',
      done: solved,
    },
    {
      icon: Sparkles,
      title: 'Plan your day',
      hint: 'Jessica turns your progress into three small missions.',
      to: '/plan',
      done: planned,
    },
  ]

  const done = steps.filter((step) => step.done).length
  if (settings.quickStart === false || done === steps.length) return null

  return (
    <Card className="border-violet-neon/25 bg-gradient-to-br from-violet-neon/10 via-card to-aurora-400/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-neon/20 text-lg">🚀</span>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-main">{tr('Your first five minutes')}</p>
            <p className="text-[10px] leading-relaxed text-muted">
              {tr('Three small steps, then Jessica starts working for you.')}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="chip border-aurora-400/25 bg-aurora-400/10 text-[10px] font-bold text-aurora-200">
            {tr('{n} of 3 done', { n: num(done) })}
          </span>
          <button
            onClick={() => updateSettings({ quickStart: false })}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-main"
            aria-label={tr('Hide for now')}
            title={tr('Hide for now')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {steps.map((step) => (
          <Link
            key={step.title}
            to={step.to}
            className={cn(
              'flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition hover:border-aurora-400/40 hover:bg-white/5',
              step.done ? 'border-aurora-400/25 bg-aurora-400/5' : 'border-line bg-card-2',
            )}
          >
            <span
              className={cn(
                'grid h-8 w-8 shrink-0 place-items-center rounded-xl',
                step.done ? 'bg-aurora-400 text-ink-950' : 'bg-white/5 text-muted',
              )}
            >
              {step.done ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn('block truncate text-xs font-bold', step.done ? 'text-muted line-through' : 'text-main')}>
                {tr(step.title)}
              </span>
              <span className="block truncate text-[10px] text-muted">{tr(step.hint)}</span>
            </span>
            <ChevronLeft className="h-4 w-4 shrink-0 text-muted-2 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        ))}
      </div>
    </Card>
  )
}
