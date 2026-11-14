import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { subjectMeta } from '@/data/books'
import { useApp } from '@/store/useApp'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, ProgressBar } from '@/components/ui/Card'
import { buildCourse, lessonLink } from '@/lib/course'
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
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const curriculum = useApp((s) => s.settings.curriculum)

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
        </div>
      </Card>

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
