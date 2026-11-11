import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Gamepad2,
  GraduationCap,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import type { Book, ChapterText } from '@/types'
import { openChapter } from '@/lib/library'
import { stageForGrade } from '@/lib/stage'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { cn, pct } from '@/lib/utils'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, Spinner } from '@/components/ui/Card'
import { QuizModal } from '@/components/tools/QuizModal'
import { BattleStudio } from '@/components/tools/BattleStudio'
import { ExamSimulator } from '@/components/tools/ExamSimulator'
import { tr } from '@/i18n'

type Mode = 'quiz' | 'battle' | 'exam'

const modes: { id: Mode; label: string; description: string; icon: React.ComponentType<{ className?: string }>; tint: string }[] = [
  { id: 'quiz', label: "Quiz arena", description: "5 questions · instant feedback · XP", icon: Gamepad2, tint: 'from-violet-neon/25 via-card-2 to-card-2 text-violet-glow' },
  { id: 'battle', label: "Peer battle", description: "Challenge a friend with a QR code", icon: Swords, tint: 'from-coral/20 via-card-2 to-card-2 text-coral' },
  { id: 'exam', label: "Mock exam", description: "Timed · weakness report · certificate", icon: GraduationCap, tint: 'from-sun/20 via-card-2 to-card-2 text-sun' },
]

export function Games() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const kids = stageForGrade(useApp.getState().settings.gradeLevel) === 'primary'
  const initial = (params.get('tab') as Mode) || 'quiz'
  const [mode, setMode] = useState<Mode>(kids ? 'quiz' : modes.some((m) => m.id === initial) ? initial : 'quiz')
  const [selected, setSelected] = useState<Book | null>(null)
  const [chapter, setChapter] = useState<ChapterText | undefined>()
  const [preparing, setPreparing] = useState(false)
  const [open, setOpen] = useState<Mode | null>(null)
  const pushToast = useUI((s) => s.pushToast)
  const { exams, xp, streak, customBooks, settings } = useApp()
  const books = useMemo(
    () => customBooks.filter((b) => (b.grade ?? settings.gradeLevel) === settings.gradeLevel),
    [customBooks, settings.gradeLevel],
  )

  useEffect(() => {
    setSelected((prev) => (prev && books.some((b) => b.id === prev.id) ? prev : books[0] || null))
  }, [books])

  const setTab = (next: Mode) => {
    setMode(next)
    const copy = new URLSearchParams(params)
    copy.set('tab', next)
    setParams(copy)
  }

  const launch = async (book: Book) => {
    setSelected(book)
    setPreparing(true)
    try {
      const text = await openChapter(book)
      if (!text) throw new Error('missing')
      setChapter(text)
      setOpen(mode)
    } catch {
      pushToast({ title: tr("Could not open that book"), description: tr("Check the PDF file and try again."), type: 'error' })
    } finally {
      setPreparing(false)
    }
  }

  const bestExam = exams.reduce((best, exam) => (!best || pct(exam.score, exam.total) > pct(best.score, best.total) ? exam : best), exams[0])

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr("Arcade")}
        title={tr("Study, but make it a game")}
        subtitle={kids ? tr('Play a quick quiz, earn stars and grow your buddy.') : tr("Quizzes, head-to-head battles and realistic timed exams — every attempt feeds your XP and your confidence.")}
        icon={<Gamepad2 className="h-5 w-5" />}
      />

      <div className={kids ? 'grid gap-2' : 'grid gap-2 sm:grid-cols-3'}>
        {(kids ? modes.filter((m) => m.id === 'quiz') : modes).map((m) => (
          <button
            key={m.id}
            onClick={() => setTab(m.id)}
            className={cn(
              'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 text-left transition',
              m.tint,
              mode === m.id ? 'border-aurora-400/40 shadow-glow' : 'border-line hover:border-line-strong',
            )}
          >
            <m.icon className="h-5 w-5" />
            <p className="mt-2 text-sm font-extrabold text-main">{tr(m.label)}</p>
            <p className="text-[10px] text-muted">{tr(m.description)}</p>
            {mode === m.id && <Check className="absolute right-3 top-3 h-4 w-4 text-aurora-300" />}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-aurora-300">{tr("Pick your chapter")}</p>
              <h2 className="font-display text-lg font-extrabold text-main">
                {mode === 'quiz' ? tr('Start a quiz') : mode === 'battle' ? tr('Challenge a classmate') : tr('Sit a mock exam')}
              </h2>
              <p className="text-[10px] text-muted">{tr("Jessica reads the PDF locally, then writes fresh questions.")}</p>
            </div>
            {preparing && <Spinner className="py-0" />}
          </div>

          {books.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 p-5 text-center">
              <p className="text-xs font-bold text-main">{tr('No books imported yet')}</p>
              <p className="text-[10px] text-muted">{tr('Import an official book from the Library first.')}</p>
              <Button size="sm" variant="secondary" onClick={() => navigate('/library')}>{tr('Open library')}</Button>
            </Card>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {books.map((book) => (
                <button
                  key={book.id}
                  onClick={() => launch(book)}
                  disabled={preparing}
                  className={cn(
                    'group flex items-center gap-3 rounded-2xl border p-3 text-left transition disabled:opacity-50',
                    selected?.id === book.id ? 'border-aurora-400/40 bg-aurora-400/10' : 'border-line bg-card-2 hover:bg-white/5',
                  )}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl" style={{ background: `${book.accent}1c` }}>
                    {book.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-extrabold text-main">{book.title}</span>
                    <span className="text-[9px] text-muted">{tr(book.subject)} · {book.pageCount} {tr("pages")}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-2 transition group-hover:text-aurora-300" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 rounded-xl border border-line bg-card-2 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted">
              <Sparkles className="h-3 w-3 text-aurora-300" />
              {mode === 'exam'
                ? tr('The exam is timed and hides explanations until you submit. A certificate unlocks above 50%.')
                : mode === 'battle'
                  ? tr('A QR code and link are generated — your friend needs no account and no server.')
                  : tr('Each correct answer earns XP immediately, and a retry reshuffles the options.')}
            </p>
          </div>
        </Card>

        <div className="space-y-3">
          {!kids && (
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sun/15 text-sun">
                <Trophy className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-main">{tr("Your records")}</p>
                <p className="text-[10px] text-muted">{exams.length} {tr("exams completed")}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: tr("Total XP"), value: xp.toLocaleString(), icon: Zap },
                { label: tr("Streak"), value: `${streak}d`, icon: Clock },
                { label: tr("Best exam"), value: bestExam ? `${pct(bestExam.score, bestExam.total)}%` : '—', icon: Target },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-line bg-card-2 p-2">
                  <s.icon className="mx-auto mb-1 h-3 w-3 text-muted" />
                  <p className="font-display text-sm font-extrabold text-main">{s.value}</p>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-muted-2">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>
          )}

          {!kids && (
          <Card className="p-4">
            <p className="label mb-2">{tr("Recent exams")}</p>
            {exams.length === 0 ? (
              <p className="text-[11px] leading-relaxed text-muted">{tr("No exams yet. Your first timed exam is a great way to find weak spots.")}</p>
            ) : (
              <div className="space-y-1.5">
                {exams.slice(0, 4).map((exam) => (
                  <div key={exam.id} className="flex items-center gap-2 rounded-xl border border-line bg-card-2 px-2.5 py-2">
                    <span
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-black',
                        pct(exam.score, exam.total) >= 80 ? 'bg-aurora-400/15 text-aurora-300' : pct(exam.score, exam.total) >= 50 ? 'bg-sun/15 text-sun' : 'bg-coral/15 text-coral',
                      )}
                    >
                      {pct(exam.score, exam.total)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-bold text-main">{exam.subject}</p>
                      <p className="text-[9px] text-muted">{exam.score}/{exam.total} · {new Date(exam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    {exam.weakTopics[0] && <span className="max-w-[90px] truncate text-[8px] font-semibold text-coral">{exam.weakTopics[0]}</span>}
                  </div>
                ))}
              </div>
            )}
          </Card>
          )}

          <Card className="p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-main">
              <BookOpen className="h-3.5 w-3.5 text-aurora-300" /> {tr("Want a different challenge?")}
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted">
              {tr("Open a textbook and try the comic strip, podcast, mind map, vision solver or pronunciation coach in Jessica Studio.")}
            </p>
          </Card>
        </div>
      </div>

      {selected && chapter && open === 'quiz' && <QuizModal open onClose={() => setOpen(null)} book={selected} chapter={chapter} />}
      {selected && chapter && open === 'battle' && <BattleStudio open onClose={() => setOpen(null)} book={selected} chapter={chapter} />}
      {selected && chapter && open === 'exam' && <ExamSimulator open onClose={() => setOpen(null)} book={selected} chapter={chapter} />}
    </div>
  )
}
