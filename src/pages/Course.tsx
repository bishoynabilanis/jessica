import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  Trophy,
  X,
} from 'lucide-react'
import { subjectMeta } from '@/data/books'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, ProgressBar } from '@/components/ui/Card'
import type { BookUnit } from '@/types'
import { buildCourse, lessonLink } from '@/lib/course'
import { openChapter } from '@/lib/library'
import { detectUnits } from '@/lib/units'
import { levelLabel } from '@/lib/curriculum'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

export function Course() {
  const { bookId = '' } = useParams()
  const navigate = useNavigate()

  const book = useApp((s) => s.customBooks.find((item) => item.id === bookId))
  const unitMastery = useApp((s) => s.unitMastery)
  const completedTopics = useApp((s) => s.completedTopics)
  const lessonProgress = useApp((s) => s.lessonProgress)
  const addCustomBook = useApp((s) => s.addCustomBook)
  const updateBookUnits = useApp((s) => s.updateBookUnits)
  const pushToast = useUI((s) => s.pushToast)
  const [rescanning, setRescanning] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<BookUnit[]>([])
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const curriculum = useApp((s) => s.settings.curriculum)

  const startUnitEdit = () => {
    if (!book) return
    const existing = (book.units || []).map((unit) => ({ ...unit }))
    setDraft(
      existing.length
        ? existing
        : [{ id: 'unit-1', title: '', startPage: 1, endPage: Math.min(book.pageCount || 20, 20) }],
    )
    setEditing(true)
  }

  const patchUnit = (id: string, patch: Partial<BookUnit>) =>
    setDraft((units) => units.map((unit) => (unit.id === id ? { ...unit, ...patch } : unit)))

  const addDraftUnit = () =>
    setDraft((units) => {
      const last = units[units.length - 1]
      const start = last ? Math.min(last.endPage + 1, (book?.pageCount || 100)) : 1
      return [
        ...units,
        { id: `unit-${Date.now().toString(36)}`, title: '', startPage: start, endPage: Math.min(start + 9, book?.pageCount || start + 9) },
      ]
    })

  const removeDraftUnit = (id: string) => setDraft((units) => units.filter((unit) => unit.id !== id))

  const saveUnits = () => {
    if (!book) return
    const max = book.pageCount || 100
    const clean = draft
      .filter((unit) => unit.title.trim())
      .map((unit) => {
        const start = Math.max(1, Math.min(unit.startPage || 1, max))
        const end = Math.max(start, Math.min(unit.endPage || start, max))
        return { ...unit, title: unit.title.trim(), startPage: start, endPage: end }
      })
    if (!clean.length) {
      pushToast({ title: tr('Keep at least one unit with a title.'), type: 'info' })
      return
    }
    updateBookUnits(book.id, clean)
    setEditing(false)
    pushToast({ title: tr('Units saved'), description: tr('The course and the unit review follow this list now.'), type: 'success' })
  }

  const course = useMemo(
    () => (book ? buildCourse(book, { unitMastery, completedTopics, lessonProgress }) : undefined),
    [book, unitMastery, completedTopics, lessonProgress],
  )

  if (!book || !course) {
    return (
      <Card className="p-5">
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title={tr('This course is not in your library')}
          description={tr('Open the book from the library first, then it appears here as a course.')}
          action={
            <Button size="sm" onClick={() => navigate('/library')}>
              {tr('Open library')}
            </Button>
          }
        />
      </Card>
    )
  }

  const genericUnits = course.lessons.length > 0 && course.lessons.every((lesson) =>
    /^(القسم|Part)\s+[\d٠-٩]+$/.test(lesson.unit.title.trim()),
  )

  const rescan = async () => {
    setRescanning(true)
    try {
      const chapter = await openChapter(book)
      if (!chapter?.pages?.length) {
        pushToast({ title: tr('No text to analyse yet'), description: tr('Open the book once so Jessica can read it.'), type: 'info' })
        return
      }
      const units = detectUnits(chapter.pages, book.pageCount)
      const better = units.length >= 2 && !units.every((unit) => /^(القسم|Part)\s+[\d٠-٩]+$/.test(unit.title.trim()))
      addCustomBook({ ...book, units: better ? units : book.units })
      pushToast({
        title: better ? tr('Chapters re-scanned: {n}', { n: num(units.length) }) : tr('No chapter headings found'),
        description: better ? tr('The course now follows the real units in your book.') : tr('The book keeps its current sections.'),
        type: better ? 'success' : 'info',
      })
    } catch {
      pushToast({ title: tr('Could not read this book'), type: 'error' })
    } finally {
      setRescanning(false)
    }
  }

  const meta = subjectMeta[book.subject] || { emoji: '📚', color: '#21e6c9' }
  const complete = course.total > 0 && course.percent >= 100
  const grade = levelLabel(book.grade || gradeLevel, curriculum)

  return (
    <div className="space-y-4">
      <PageHeader
        back
        eyebrow={tr('Course')}
        title={book.title}
        subtitle={`${tr(book.subject)} · ${tr(book.term)} · ${grade}`}
        icon={<GraduationCap className="h-5 w-5" />}
      />

      <Card className="relative overflow-hidden p-4 sm:p-5">
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: meta.color }}
        />
        <div className="flex flex-wrap items-start gap-4">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl ring-1 ring-inset ring-white/10"
            style={{ background: `${meta.color}1c` }}
          >
            {book.emoji || meta.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-extrabold text-main">
                {tr('{mastered} of {total} lessons', { mastered: num(course.mastered), total: num(course.total) })}
              </p>
              <p className={cn('font-display text-2xl font-extrabold', complete ? 'text-aurora-300' : 'text-main')}>
                {num(course.percent)}%
              </p>
            </div>
            <ProgressBar value={course.percent} max={100} height="h-2" className="mt-1.5" />
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-semibold text-muted">
              <span className="inline-flex items-center gap-1">
                <Layers className="h-3 w-3" /> {tr('{n} lessons', { n: num(course.total) })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3 w-3" /> {num(course.minutes)} {tr('min')}
              </span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> {tr('50 XP per lesson')}
              </span>
            </div>
          </div>
        </div>

        {complete && (
          <p className="mt-3 rounded-xl border border-aurora-400/25 bg-aurora-400/10 px-3 py-2 text-[10px] font-bold text-aurora-200">
            {tr('Course complete — your certificate is ready.')}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {complete ? (
            <Link to="/certificate">
              <Button size="md">
                <Trophy className="h-4 w-4" /> {tr('Open my certificate')}
              </Button>
            </Link>
          ) : course.next ? (
            <Link to={lessonLink(book.id, course.next)}>
              <Button size="md">
                <Play className="h-4 w-4" />
                {course.mastered > 0 ? tr('Continue the course') : tr('Start the course')}
              </Button>
            </Link>
          ) : null}
          <Link to={`/reader/${book.id}`}>
            <Button size="md" variant="secondary">
              <BookOpen className="h-4 w-4" /> {tr('Open the book')}
            </Button>
          </Link>
          {genericUnits && (
            <Button size="md" variant="ghost" onClick={rescan} loading={rescanning}>
              <RefreshCw className="h-4 w-4" /> {tr('Re-scan chapters')}
            </Button>
          )}
          <Button size="md" variant="ghost" onClick={startUnitEdit} data-testid="units-edit">
            <Pencil className="h-4 w-4" /> {tr('Edit the units')}
          </Button>
        </div>
      </Card>

      {editing && (
        <Card className="p-4" data-testid="units-editor">
          <p className="label text-aurora-300">{tr('Edit the units')}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-muted">
            {tr('Rename a unit, fix its page range, or add your own. The course and the unit review follow this list.')}
          </p>
          <div className="mt-3 space-y-2">
            {draft.map((unit, unitIndex) => (
              <div key={unit.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-card-2 p-2">
                <span className="w-5 shrink-0 text-[10px] font-bold text-muted-2">{num(unitIndex + 1)}</span>
                <input
                  value={unit.title}
                  onChange={(event) => patchUnit(unit.id, { title: event.target.value })}
                  placeholder={tr('Unit title')}
                  aria-label={tr('Unit title')}
                  className="min-w-0 flex-1 rounded-lg border border-line bg-white/5 px-2 py-1 text-[11px] font-bold text-main outline-none focus:border-aurora-400/50"
                />
                <input
                  type="number"
                  min={1}
                  value={unit.startPage}
                  onChange={(event) => patchUnit(unit.id, { startPage: Number(event.target.value) })}
                  aria-label={tr('First page')}
                  className="w-16 rounded-lg border border-line bg-white/5 px-2 py-1 text-[11px] font-bold text-main outline-none focus:border-aurora-400/50"
                />
                <span className="text-[10px] text-muted-2">→</span>
                <input
                  type="number"
                  min={1}
                  value={unit.endPage}
                  onChange={(event) => patchUnit(unit.id, { endPage: Number(event.target.value) })}
                  aria-label={tr('Last page')}
                  className="w-16 rounded-lg border border-line bg-white/5 px-2 py-1 text-[11px] font-bold text-main outline-none focus:border-aurora-400/50"
                />
                <button
                  onClick={() => removeDraftUnit(unit.id)}
                  aria-label={tr('Delete')}
                  className="rounded-lg border border-line p-1.5 text-muted-2 transition hover:border-red-400/40 hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={addDraftUnit}>
              <Plus className="h-3.5 w-3.5" /> {tr('Add a unit')}
            </Button>
            <Button size="sm" onClick={saveUnits} data-testid="units-save">
              <Check className="h-3.5 w-3.5" /> {tr('Save the units')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              <X className="h-3.5 w-3.5" /> {tr('Cancel')}
            </Button>
          </div>
        </Card>
      )}

      {course.total === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<Layers className="h-6 w-6" />}
            title={tr('No lessons yet')}
            description={tr('This book has no detected units yet. Open it once and Jessica will split it into lessons.')}
            action={
              <Link to={`/reader/${book.id}`}>
                <Button size="sm">{tr('Open the book')}</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="label text-aurora-300">{tr('Lessons')}</p>
            <Link to="/study" className="text-[10px] font-bold text-muted hover:text-main">
              {tr('More practice')} <ArrowRight className="inline h-3 w-3 rtl:rotate-180" />
            </Link>
          </div>

          {course.lessons.map((lesson) => {
            const done = lesson.state === 'mastered'
            const started = lesson.state === 'started'
            return (
              <Card key={lesson.unit.id} data-testid="course-lesson" className="flex flex-wrap items-center gap-3 p-3.5">
                <span
                  className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-black',
                    done
                      ? 'bg-aurora-400 text-ink-950'
                      : started
                        ? 'bg-violet-neon/20 text-violet-glow'
                        : 'bg-white/5 text-muted',
                  )}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : num(lesson.index + 1)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-xs font-extrabold text-main">{lesson.unit.title}</p>
                    <span
                      className={cn(
                        'chip text-[8px]',
                        done
                          ? 'border-aurora-400/30 bg-aurora-400/10 text-aurora-200'
                          : started
                            ? 'border-violet-neon/25 bg-violet-neon/10 text-violet-glow'
                            : 'border-line bg-white/5 text-muted',
                      )}
                    >
                      {done ? tr('Completed') : started ? tr('In progress') : tr('Not started')}
                    </span>
                    {lesson.best > 0 && (
                      <span className="chip border-line bg-white/5 text-[8px] text-muted">
                        {tr('Best {n}%', { n: num(lesson.best) })}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[9px] text-muted">
                    {tr('Pages {from}–{to}', { from: num(lesson.unit.startPage), to: num(lesson.unit.endPage) })} ·{' '}
                    {num(lesson.minutes)} {tr('min')} · {tr('50 XP')}
                  </p>
                  {started && lesson.step > 0 && (
                    <p className="mt-0.5 text-[9px] font-bold text-violet-glow">
                      {tr('Stopped at step {n} of 4', { n: num(lesson.step + 1) })}
                    </p>
                  )}
                  <ProgressBar value={done ? 100 : lesson.best} height="h-1" className="mt-1.5 max-w-[220px]" />
                </div>

                <Link to={lessonLink(book.id, lesson)}>
                  <Button size="sm" variant={done ? 'ghost' : started ? 'secondary' : 'primary'}>
                    {done ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" /> {tr('Review')}
                      </>
                    ) : started ? (
                      <>
                        <Play className="h-3.5 w-3.5" /> {tr('Continue')}
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" /> {tr('Start')}
                      </>
                    )}
                  </Button>
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
