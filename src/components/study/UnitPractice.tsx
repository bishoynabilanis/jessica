import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  CalendarCheck,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  FileText,
  Layers,
  Loader2,
  Play,
  Target,
  Trophy,
  Sparkles,
  X,
} from 'lucide-react'
import type { BookUnit, ChapterText, QuizQuestion } from '@/types'
import { useApp } from '@/store/useApp'
import { getQuizzes } from '@/lib/db'
import { useUI } from '@/store/useUI'
import { openChapter } from '@/lib/library'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, ProgressBar, Spinner } from '@/components/ui/Card'
import { QuizModal } from '@/components/tools/QuizModal'
import { QuizGame } from '@/components/tools/QuizGame'
import { ExamSimulator } from '@/components/tools/ExamSimulator'
import { PlannerModal } from '@/components/tools/PlannerModal'
import { FlashcardsModal } from '@/components/tools/FlashcardsModal'
import { UnitSummaryModal } from '@/components/study/UnitSummaryModal'
import { cn, pct, shuffle } from '@/lib/utils'
import { tr } from '@/i18n'
import { stageForGrade } from '@/lib/stage'
import { Modal } from '@/components/ui/Modal'

export function UnitPractice() {
  const navigate = useNavigate()
  const customBooks = useApp((s) => s.customBooks)
  const gradeLevel = useApp((s) => s.settings.gradeLevel)
  const bookProgress = useApp((s) => s.bookProgress)
  const completedTopics = useApp((s) => s.completedTopics)
  const unitMastery = useApp((s) => s.unitMastery)
  const pushToast = useUI((s) => s.pushToast)

  const books = useMemo(
    () => customBooks.filter((b) => (b.grade ?? gradeLevel) === gradeLevel),
    [customBooks, gradeLevel],
  )
  const [bookId, setBookId] = useState(books[0]?.id || '')
  const [chapter, setChapter] = useState<ChapterText | undefined>()
  const [loading, setLoading] = useState(false)
  const [quizUnit, setQuizUnit] = useState<BookUnit | null>(null)
  const [examUnit, setExamUnit] = useState<BookUnit | null>(null)
  const [planUnit, setPlanUnit] = useState<BookUnit | null>(null)
  const [summaryUnit, setSummaryUnit] = useState<BookUnit | null>(null)
  const [flashUnit, setFlashUnit] = useState<BookUnit | null>(null)
  const [reviewDeck, setReviewDeck] = useState<QuizQuestion[] | null>(null)
  const [reviewBusy, setReviewBusy] = useState(false)

  useEffect(() => {
    if (!books.length) {
      setBookId('')
      return
    }
    if (!books.some((b) => b.id === bookId)) setBookId(books[0].id)
  }, [books, bookId])

  const book = books.find((b) => b.id === bookId)

  useEffect(() => {
    if (!book) {
      setChapter(undefined)
      return
    }
    let alive = true
    setLoading(true)
    setChapter(undefined)
    openChapter(book)
      .then((text) => {
        if (alive) setChapter(text)
      })
      .catch(() => undefined)
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [book?.id])

  const chapterFor = (unit: BookUnit): ChapterText | undefined => {
    if (!book || !chapter) return undefined
    const pages = chapter.pages.filter((p) => p.page >= unit.startPage && p.page <= unit.endPage)
    return {
      bookId: `${book.id}:${unit.id}`,
      pages,
      text: pages.map((p) => `[Page ${p.page}]\n${p.text}`).join('\n\n'),
      extractedAt: Date.now(),
    }
  }

  const kids = stageForGrade(gradeLevel) === 'primary'

  const stats = useMemo(() => {
    if (!book) return { mastered: 0, total: 0, avg: 0 }
    const units = book.units || []
    const values = units.map((unit) => {
      const stat = unitMastery[`${book.id}:${unit.id}`]
      return stat ? stat.best / stat.total : 0
    })
    const mastered = units.filter((unit) => {
      const key = `${book.id}:${unit.id}`
      const stat = unitMastery[key]
      return completedTopics.includes(key) || (stat ? stat.best / stat.total >= 0.8 : false)
    }).length
    const avg = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) : 0
    return { mastered, total: units.length, avg }
  }, [book, unitMastery, completedTopics])

  const recommendations = useMemo(() => {
    if (!book) return []
    return (book.units || [])
      .map((unit) => {
        const stat = unitMastery[`${book.id}:${unit.id}`]
        const ratio = stat ? stat.best / stat.total : 0
        return { unit, ratio, stat }
      })
      .filter(({ unit, ratio }) => {
        const stat = unitMastery[`${book.id}:${unit.id}`]
        return !(completedTopics.includes(`${book.id}:${unit.id}`) || (stat ? ratio >= 0.8 : false))
      })
      .sort((a, b) => a.ratio - b.ratio)
  }, [book, unitMastery, completedTopics])

  const focusUnit = recommendations[0]

  const startSmartReview = async () => {
    if (!book) return
    setReviewBusy(true)
    try {
      const banks = await getQuizzes()
      const unitKeys = new Set((book.units || []).map((unit) => `${book.id}:${unit.id}`))
      const weakKeys = new Set(recommendations.map(({ unit }) => `${book.id}:${unit.id}`))
      const picked: QuizQuestion[] = []
      for (const bank of banks) {
        if (!unitKeys.has(bank.id)) continue
        const take = weakKeys.has(bank.id) ? 2 : 1
        picked.push(...bank.questions.slice(0, take))
      }
      if (!picked.length) {
        setReviewDeck(null)
        pushToast({
          title: tr('No saved questions yet'),
          description: tr('Take a unit quiz first so the smart review can reuse its questions.'),
          type: 'info',
        })
        return
      }
      setReviewDeck(shuffle(picked).slice(0, 10))
    } finally {
      setReviewBusy(false)
    }
  }

  if (!books.length) {
    return (
      <Card className="p-4 sm:p-5">
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title={tr('No books to practise yet')}
          description={tr('Import an official book from the Library, then come back to train unit by unit.')}
          action={
            <Button size="sm" onClick={() => navigate('/library')}>
              {tr('Open library')}
            </Button>
          }
        />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label mb-1 text-aurora-300">{tr('Unit practice')}</p>
            <h2 className="font-display text-lg font-extrabold text-main">{tr('One unit at a time')}</h2>
            <p className="mt-0.5 text-[10px] text-muted">
              {tr('Quiz, mock exam and a study plan built from the exact unit pages.')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="field max-w-xs text-xs"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
            <Button size="sm" variant="secondary" onClick={startSmartReview} loading={reviewBusy} disabled={recommendations.length === 0}>
              <Sparkles className="h-3.5 w-3.5" /> {tr('Smart review')}
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: tr('Units'), value: stats.total, icon: Layers },
            { label: tr('Mastered'), value: stats.mastered, icon: Trophy },
            { label: tr('Average score'), value: `${stats.avg}%`, icon: Target },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-card-2 px-2.5 py-2">
              <s.icon className="h-3.5 w-3.5 text-aurora-300" />
              <p className="mt-1 font-display text-base font-extrabold text-main">{s.value}</p>
              <p className="text-[9px] font-semibold text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {focusUnit && (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-sun/25 bg-sun/10 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sun/20 text-sun">
              <Target className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold text-main">
                {tr('Focus next: {name}', { name: focusUnit.unit.title })}
              </p>
              <p className="text-[9px] text-muted">
                {focusUnit.stat
                  ? tr('Best {n}% · {count} attempts', {
                      n: pct(focusUnit.stat.best, focusUnit.stat.total),
                      count: focusUnit.stat.attempts,
                    })
                  : tr('Not practised yet · start with a 5-question quiz')}
              </p>
            </div>
            <Button size="sm" onClick={() => navigate(`/lesson/${book!.id}/${focusUnit.unit.id}`)}>
              <Play className="h-3.5 w-3.5" /> {tr('Start lesson')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setQuizUnit(focusUnit.unit)}
              disabled={!chapterFor(focusUnit.unit)}
            >
              {tr('Quiz now')}
            </Button>
          </div>
        )}

        {(book?.units?.length || 0) > 0 && (
          <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {(book?.units || []).map((unit, index) => {
              const key = `${book!.id}:${unit.id}`
              const stat = unitMastery[key]
              const ratio = stat ? stat.best / stat.total : 0
              const mastered = completedTopics.includes(key) || ratio >= 0.8
              const practised = !!stat
              return (
                <button
                  key={unit.id}
                  onClick={() => setQuizUnit(unit)}
                  title={unit.title}
                  className={cn(
                    'grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[9px] font-black transition',
                    mastered
                      ? 'border-aurora-400 bg-aurora-400 text-ink-950'
                      : practised
                        ? 'border-violet-neon/50 bg-violet-neon/15 text-violet-glow'
                        : 'border-line bg-card-2 text-muted',
                  )}
                >
                  {mastered ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                </button>
              )
            })}
            <span className="ml-2 shrink-0 text-[9px] font-semibold text-muted">
              {tr('{n} of {total} mastered', { n: stats.mastered, total: stats.total })}
            </span>
          </div>
        )}
      </Card>

      {loading ? (
        <Spinner label={tr('Opening your book…')} />
      ) : !book?.units?.length ? (
        <Card className="p-5 text-center">
          <p className="text-xs font-bold text-main">{tr('No units detected in this book')}</p>
          <p className="mx-auto mt-1 max-w-sm text-[10px] leading-relaxed text-muted">
            {tr('Open the book once so Jessica can index it, then the units will appear here.')}
          </p>
          <Button size="sm" variant="secondary" className="mt-3" onClick={() => navigate(`/reader/${book?.id || ''}`)}>
            {tr('Open book')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-2.5">
          {book.units.map((unit, index) => {
            const key = `${book.id}:${unit.id}`
            const stat = unitMastery[key]
            const bestPct = stat ? pct(stat.best, stat.total) : 0
            const read = (bookProgress[book.id]?.lastPage || 0) >= unit.startPage
            const done = completedTopics.includes(key)
            const mastered = done || bestPct >= 80
            const unitChapter = chapterFor(unit)
            return (
              <Card key={unit.id} className="p-3.5">
                <div className="flex flex-wrap items-start gap-3">
                  <span
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-black',
                      mastered ? 'bg-aurora-400 text-ink-950' : 'bg-white/5 text-muted',
                    )}
                  >
                    {mastered ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-xs font-extrabold text-main">{unit.title}</p>
                      {read && <span className="chip border-sky/25 bg-sky/10 text-[8px] text-sky">{tr('Read')}</span>}
                      {stat && (
                        <span className="chip border-violet-neon/25 bg-violet-neon/10 text-[8px] text-violet-glow">
                          {tr('Best {n}%', { n: bestPct })}
                        </span>
                      )}
                      {mastered && <span className="chip border-aurora-400/30 text-[8px] text-aurora-200">{tr('Mastered')}</span>}
                      {stat?.weak &&
                        Object.entries(stat.weak)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 2)
                          .map(([topic]) => (
                            <span key={topic} className="chip border-coral/25 bg-coral/10 text-[8px] text-coral">
                              {topic}
                            </span>
                          ))}
                    </div>
                    <p className="mt-0.5 text-[9px] text-muted">
                      {tr('Pages {from}–{to}', { from: unit.startPage, to: unit.endPage })} ·{' '}
                      {stat ? tr('{n} attempts', { n: stat.attempts }) : tr('Not practised yet')}
                    </p>
                    <ProgressBar value={mastered ? 100 : bestPct} height="h-1" className="mt-2 max-w-xs" />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/reader/${book.id}?page=${unit.startPage}`)}>
                      <BookOpen className="h-3.5 w-3.5" /> {tr('Open')}
                    </Button>
                    <Button size="sm" onClick={() => navigate(`/lesson/${book.id}/${unit.id}`)}>
                      <Play className="h-3.5 w-3.5" /> {tr('Lesson')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setQuizUnit(unit)} disabled={!unitChapter}>
                      {tr('Quiz')}
                    </Button>
                    {!kids && (
                      <Button size="sm" variant="secondary" onClick={() => setExamUnit(unit)} disabled={!unitChapter}>
                        <GraduationCap className="h-3.5 w-3.5" /> {tr('Exam')}
                      </Button>
                    )}
                    {!kids && (
                      <Button size="sm" variant="ghost" onClick={() => setPlanUnit(unit)} disabled={!unitChapter}>
                        <CalendarCheck className="h-3.5 w-3.5" /> {tr('Plan')}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setSummaryUnit(unit)} disabled={!unitChapter}>
                      <FileText className="h-3.5 w-3.5" /> {tr('Summary')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setFlashUnit(unit)} disabled={!unitChapter}>
                      <Layers className="h-3.5 w-3.5" /> {tr('Cards')}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {quizUnit && book && (
        <QuizModal
          open
          onClose={() => setQuizUnit(null)}
          book={book}
          chapter={chapterFor(quizUnit)}
          unitKey={`${book.id}:${quizUnit.id}`}
        />
      )}
      {examUnit && book && (
        <ExamSimulator
          open
          onClose={() => setExamUnit(null)}
          book={book}
          chapter={chapterFor(examUnit)}
          unitKey={`${book.id}:${examUnit.id}`}
        />
      )}
      {planUnit && book && (
        <PlannerModal open onClose={() => setPlanUnit(null)} book={book} chapter={chapterFor(planUnit)} />
      )}
      {summaryUnit && book && (
        <UnitSummaryModal
          open
          onClose={() => setSummaryUnit(null)}
          book={book}
          chapter={chapterFor(summaryUnit)}
          unitKey={`${book.id}:${summaryUnit.id}`}
          unitTitle={summaryUnit.title}
        />
      )}
      {flashUnit && book && (
        <FlashcardsModal open onClose={() => setFlashUnit(null)} book={book} chapter={chapterFor(flashUnit)} />
      )}

      <Modal
        open={!!reviewDeck}
        onClose={() => setReviewDeck(null)}
        title={tr('Smart review')}
        subtitle={tr('A mixed set from the units you scored lowest on.')}
        size="lg"
      >
        {reviewDeck && (
          <div>
            <QuizGame questions={reviewDeck} subject={book?.subject || 'Review'} title={book?.title} />
            <div className="mt-4 flex justify-end border-t border-line pt-3">
              <Button size="sm" variant="secondary" onClick={() => setReviewDeck(null)}>
                <X className="h-3.5 w-3.5" /> {tr('Close')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
