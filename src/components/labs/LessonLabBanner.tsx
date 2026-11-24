import { ArrowLeft, BookOpen, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '@/store/useApp'
import { num, tr } from '@/i18n'

/** Shown on top of a lab opened from a lesson: the goal and the book page it comes from. */
export function LessonLabBanner({ bookId, unitId, page, kids }: { bookId: string; unitId: string; page: number; kids?: boolean }) {
  const book = useApp((s) => s.customBooks.find((item) => item.id === bookId))
  const unit = book?.units?.find((item) => item.id === unitId)
  if (!book || !unit) return null
  const lessonPath = kids ? `/kids/lesson/${book.id}?unit=${unit.id}` : `/lesson/${book.id}/${unit.id}`
  const readerPath = `/reader/${book.id}?page=${page}`
  return (
    <div data-testid="lesson-lab-banner" className="rounded-3xl border border-aurora-400/30 bg-aurora-400/10 p-4">
      <p className="flex items-start gap-2 text-sm font-extrabold text-main">
        <Target className="mt-0.5 h-4 w-4 shrink-0 text-aurora-300" />
        <span>{tr('Your goal: play with the lab, then explain what changed in “{unit}”.', { unit: unit.title })}</span>
      </p>
      <p className="mt-1 text-[11px] font-semibold text-muted">
        {tr('From page {page} of {book}', { page: num(page), book: book.title })}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to={lessonPath} data-testid="lesson-lab-back" className="inline-flex items-center gap-1 rounded-full border border-line bg-white/5 px-3 py-1.5 text-[11px] font-extrabold text-main">
          <ArrowLeft className="h-3 w-3 rtl:rotate-180" /> {tr('Back to the lesson')}
        </Link>
        {!kids && (
          <Link to={readerPath} data-testid="lesson-lab-page" className="inline-flex items-center gap-1 rounded-full border border-line bg-white/5 px-3 py-1.5 text-[11px] font-extrabold text-main">
            <BookOpen className="h-3 w-3" /> {tr('Open page {page}', { page: num(page) })}
          </Link>
        )}
      </div>
    </div>
  )
}
