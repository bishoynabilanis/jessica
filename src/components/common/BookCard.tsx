import { Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen, CheckCircle2 } from 'lucide-react'
import type { Book } from '@/types'
import { subjectMeta } from '@/data/books'
import { useApp } from '@/store/useApp'
import { cn, pct } from '@/lib/utils'
import { tr } from '@/i18n'

export function BookCard({ book, compact, to }: { book: Book; compact?: boolean; to?: string }) {
  const progress = useApp((s) => s.bookProgress[book.id])
  const meta = subjectMeta[book.subject] || { emoji: '📚', color: '#21e6c9' }
  const percent = progress ? pct(progress.lastPage, book.pageCount) : 0
  const done = percent >= 100

  return (
    <Link
      to={to || `/reader/${book.id}`}
      className={cn(
        'card-hover group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-card',
        compact ? 'p-4' : 'p-5',
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40"
        style={{ background: meta.color }}
      />
      <div className="flex items-start justify-between gap-2">
        <div
          className="grid h-12 w-12 place-items-center rounded-2xl text-2xl ring-1 ring-inset ring-white/10"
          style={{ background: `${meta.color}1c` }}
        >
          {book.emoji}
        </div>
        <div className="flex items-center gap-1.5">
          {done && <CheckCircle2 className="h-4 w-4 text-aurora-400" />}
          <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition group-hover:opacity-100" />
        </div>
      </div>

      <div className="mt-3">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{ background: `${meta.color}18`, color: meta.color }}
        >
          {tr(book.subject)} · {tr(book.term)}
        </span>
        <h3 className="mt-2 line-clamp-2 font-display text-sm font-extrabold leading-snug text-main">{book.title}</h3>
        {!compact && <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted">{tr(book.description)}</p>}
      </div>

      <div className="mt-auto pt-4">
        <div className="mb-1.5 flex items-center justify-between text-[9px] font-bold text-muted">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> {book.pageCount} {tr('pages')}
          </span>
          <span>{done ? tr('Completed') : progress ? `${percent}% ${tr('read')}` : tr('Start reading')}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.max(percent, 2)}%`, background: meta.color }}
          />
        </div>
      </div>
    </Link>
  )
}
