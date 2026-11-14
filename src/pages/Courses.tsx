import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock3, GraduationCap, Layers, Plus, Sparkles, Trophy } from 'lucide-react'
import { subjectMeta } from '@/data/books'
import { useApp } from '@/store/useApp'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, ProgressBar } from '@/components/ui/Card'
import { buildCourse, lessonLink } from '@/lib/course'
import { cn } from '@/lib/utils'
import { num, tr } from '@/i18n'

export function Courses() {
  const customBooks = useApp((s) => s.customBooks)
  const unitMastery = useApp((s) => s.unitMastery)
  const completedTopics = useApp((s) => s.completedTopics)
  const lessonProgress = useApp((s) => s.lessonProgress)

  const courses = useMemo(() => {
    const list = customBooks.map((book) => buildCourse(book, { unitMastery, completedTopics, lessonProgress }))
    const rank = (course: (typeof list)[number]) => {
      if (course.total === 0) return 3
      if (course.percent >= 100) return 2
      if (course.percent > 0) return 0
      return 1
    }
    return list.sort((a, b) => rank(a) - rank(b) || a.book.title.localeCompare(b.book.title))
  }, [customBooks, unitMastery, completedTopics, lessonProgress])

  const totalLessons = courses.reduce((sum, course) => sum + course.total, 0)
  const doneLessons = courses.reduce((sum, course) => sum + course.mastered, 0)
  const overall = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Courses')}
        title={tr('My courses')}
        subtitle={tr('Your books, turned into a path: every unit is a four-step lesson with a check at the end.')}
        icon={<GraduationCap className="h-5 w-5" />}
        actions={
          <Link to="/library">
            <Button size="md" variant="secondary">
              <Plus className="h-4 w-4" /> {tr('Add a book')}
            </Button>
          </Link>
        }
      />

      {courses.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title={tr('No courses yet')}
            description={tr('Import one book and Jessica turns its units into lessons, a progress path and a certificate.')}
            action={
              <Link to="/library">
                <Button size="sm">{tr('Open library')}</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Layers, label: tr('Courses'), value: num(courses.length) },
              { icon: GraduationCap, label: tr('Lessons done'), value: num(doneLessons) },
              { icon: Trophy, label: tr('Progress'), value: `${num(overall)}%` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-line bg-card px-3 py-2.5">
                <stat.icon className="h-4 w-4 text-aurora-300" />
                <p className="mt-1 font-display text-lg font-extrabold text-main">{stat.value}</p>
                <p className="text-[9px] font-semibold text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const meta = subjectMeta[course.book.subject] || { emoji: '📚', color: '#21e6c9' }
              const complete = course.total > 0 && course.percent >= 100
              const empty = course.total === 0
              return (
                <Card
                  key={course.book.id}
                  data-testid="course-card"
                  className={cn(
                    'relative flex flex-col overflow-hidden p-4',
                    courses.length === 1 && 'sm:col-span-2 xl:col-span-3',
                  )}
                >
                  <div
                    className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full opacity-20 blur-2xl"
                    style={{ background: meta.color }}
                  />
                  <div className="flex items-start gap-3">
                    <span
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl ring-1 ring-inset ring-white/10"
                      style={{ background: `${meta.color}1c` }}
                    >
                      {course.book.emoji || meta.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                        style={{ background: `${meta.color}18`, color: meta.color }}
                      >
                        {tr(course.book.subject)} · {tr(course.book.term)}
                      </span>
                      <Link to={`/course/${course.book.id}`}>
                        <h2 className="mt-1.5 line-clamp-2 font-display text-sm font-extrabold leading-snug text-main hover:text-aurora-200">
                          {course.book.title}
                        </h2>
                      </Link>
                    </div>
                    <span className={cn('font-display text-lg font-extrabold', complete ? 'text-aurora-300' : 'text-main')}>
                      {num(course.percent)}%
                    </span>
                  </div>

                  <ProgressBar
                    value={course.percent}
                    max={100}
                    height="h-1.5"
                    className="mt-3"
                    barClassName={complete ? 'from-aurora-400 to-aurora-400' : undefined}
                  />

                  <div className="mt-1.5 flex items-center justify-between gap-2 text-[9.5px] font-semibold text-muted">
                    <span>{tr('{mastered} of {total} lessons', { mastered: num(course.mastered), total: num(course.total) })}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3 w-3" /> {num(course.minutes)} {tr('min')}
                    </span>
                  </div>

                  <p className="mt-2 min-h-[2.5rem] text-[10px] leading-relaxed text-muted">
                    {empty
                      ? tr('Open the book once so Jessica can split it into lessons.')
                      : complete
                        ? tr('Course complete — your certificate is ready.')
                        : tr('Next: {lesson}', { lesson: course.next?.unit.title || '' })}
                  </p>

                  <div className="mt-auto flex items-center gap-2 pt-2">
                    {empty ? (
                      <Link to={`/reader/${course.book.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <BookOpen className="h-3.5 w-3.5" /> {tr('Open book')}
                        </Button>
                      </Link>
                    ) : complete ? (
                      <Link to="/certificate" className="flex-1">
                        <Button size="sm" className="w-full">
                          <Trophy className="h-3.5 w-3.5" /> {tr('Open my certificate')}
                        </Button>
                      </Link>
                    ) : (
                      <Link
                        to={course.next ? lessonLink(course.book.id, course.next) : `/course/${course.book.id}`}
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full">
                          <Sparkles className="h-3.5 w-3.5" />
                          {course.mastered > 0 ? tr('Continue') : tr('Start course')}
                        </Button>
                      </Link>
                    )}
                    <Link to={`/course/${course.book.id}`}>
                      <Button size="sm" variant="secondary">
                        {tr('Course')} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
