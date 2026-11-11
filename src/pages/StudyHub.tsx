import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  Brain,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock,
  Layers,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react'
import type { Book, ChapterText, SRSCard } from '@/types'
import { allCards, deleteCard, dueCards } from '@/lib/db'
import { dueLabel, retentionLabel } from '@/lib/srs'
import { openChapter } from '@/lib/library'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { cn, todayKey } from '@/lib/utils'
import { PageHeader } from '@/components/common/PageHeader'
import { UnitPractice } from '@/components/study/UnitPractice'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, ProgressBar, Spinner } from '@/components/ui/Card'
import { SrsReview } from '@/components/study/SrsReview'
import { PlannerModal } from '@/components/tools/PlannerModal'
import { tr } from '@/i18n'

type Tab = 'review' | 'cards' | 'planner' | 'units'

export function StudyHub() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'review'
  const pushToast = useUI((s) => s.pushToast)
  const { planner, togglePlannerTask, addPlannerTask, studySeconds, dailyLog, xp, customBooks, settings, examDates, setExamDate } = useApp()

  const [cards, setCards] = useState<SRSCard[]>([])
  const [due, setDue] = useState<SRSCard[]>([])
  const [loading, setLoading] = useState(true)
  const [cardFilter, setCardFilter] = useState('All')
  const [plannerBook, setPlannerBook] = useState<Book | null>(null)
  const [plannerChapter, setPlannerChapter] = useState<ChapterText | undefined>()
  const [plannerOpen, setPlannerOpen] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const [manual, setManual] = useState('')
  const [session, setSession] = useState(0)

  const reload = async () => {
    setLoading(true)
    const [all, dueNow] = await Promise.all([allCards(), dueCards()])
    setCards(all)
    setDue(dueNow)
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [session])

  const books = useMemo(
    () => customBooks.filter((b) => (b.grade ?? settings.gradeLevel) === settings.gradeLevel),
    [customBooks, settings.gradeLevel],
  )

  const setTab = (next: Tab) => {
    const copy = new URLSearchParams(params)
    copy.set('tab', next)
    setParams(copy)
  }

  const subjects = useMemo(() => ['All', ...new Set(cards.map((c) => c.subject))], [cards])
  const filteredCards = useMemo(
    () => (cardFilter === 'All' ? cards : cards.filter((c) => c.subject === cardFilter)),
    [cards, cardFilter],
  )

  const today = todayKey()
  const plannerGroups = useMemo(() => {
    const groups = new Map<string, typeof planner>()
    ;[...planner]
      .sort((a, b) => a.day.localeCompare(b.day))
      .forEach((task) => {
        const list = groups.get(task.day) || []
        list.push(task)
        groups.set(task.day, list)
      })
    return [...groups.entries()]
  }, [planner])
  const todayTasks = planner.filter((t) => t.day === today)
  const doneToday = todayTasks.filter((t) => t.done).length
  const todayLog = dailyLog[today] || { xp: 0, seconds: 0 }

  const preparePlanner = async (book: Book) => {
    setPlannerBook(book)
    setPreparing(true)
    try {
      const chapter = await openChapter(book)
      if (!chapter) throw new Error('missing')
      setPlannerChapter(chapter)
      setPlannerOpen(true)
    } catch {
      pushToast({ title: tr("Could not read the book"), description: tr("Try another textbook or check the PDF."), type: 'error' })
    } finally {
      setPreparing(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr("Study hub")}
        title={tr("Train your memory")}
        subtitle={tr("Spaced repetition, a living planner and the flashcards that make revision actually stick.")}
        icon={<Brain className="h-5 w-5" />}
        actions={
          <Button variant="secondary" onClick={() => reload()} loading={loading}>
            <RefreshCw className="h-4 w-4" /> {tr("Refresh deck")}
          </Button>
        }
      />

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { id: 'review' as Tab, label: tr("Daily review"), hint: tr('{n} cards due', { n: due.length }), icon: Layers },
          { id: 'cards' as Tab, label: tr("All flashcards"), hint: tr('{n} cards', { n: cards.length }), icon: Brain },
          { id: 'planner' as Tab, label: tr("Study planner"), hint: tr('{n} tasks today', { n: todayTasks.filter((t) => !t.done).length }), icon: CalendarCheck },
          { id: 'units' as Tab, label: tr("Unit practice"), hint: tr('Quiz, exam and plan per unit'), icon: BookOpen },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-3 rounded-2xl border p-3 text-left transition',
              tab === t.id ? 'border-aurora-400/40 bg-aurora-400/10' : 'border-line bg-card hover:bg-white/5',
            )}
          >
            <span className={cn('grid h-10 w-10 place-items-center rounded-xl', tab === t.id ? 'bg-aurora-400 text-ink-950' : 'bg-white/5 text-muted')}>
              <t.icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-xs font-extrabold text-main">{t.label}</p>
              <p className="text-[10px] text-muted">{t.hint}</p>
            </div>
            <ChevronRight className="ml-auto h-4 w-4 text-muted-2" />
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-4">
          {tab === 'review' && (
            <Card className="p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="label mb-1 text-aurora-300">{tr("Spaced repetition")}</p>
                  <h2 className="font-display text-lg font-extrabold text-main">{tr("Today’s memory loop")}</h2>
                </div>
                <span className="chip border-aurora-400/25 text-aurora-200">
                  <Clock className="h-3 w-3" /> {due.length} {tr("due")}
                </span>
              </div>
              {loading ? (
                <Spinner label={tr("Checking your deck…")} />
              ) : (
                <SrsReview
                  key={`due-${session}-${due.length}`}
                  onDone={() => {
                    setTimeout(reload, 400)
                    setSession((s) => s + 1)
                  }}
                />
              )}
            </Card>
          )}

          {tab === 'units' && <UnitPractice />}

          {tab === 'cards' && (
            <Card className="p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="label mb-1 text-violet-glow">{tr("Your deck")}</p>
                  <h2 className="font-display text-lg font-extrabold text-main">{cards.length} {tr("flashcards")}</h2>
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {subjects.map((s) => (
                    <button
                      key={s}
                      onClick={() => setCardFilter(s)}
                      className={cn(
                        'shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold',
                        cardFilter === s ? 'border-aurora-400/40 bg-aurora-400/10 text-aurora-200' : 'border-line text-muted',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <Spinner label={tr("Loading cards…")} />
              ) : filteredCards.length === 0 ? (
                <EmptyState
                  icon={<Layers className="h-6 w-6" />}
                  title={tr("No cards here yet")}
                  description={tr("Open a book and use Flashcards in Jessica Studio. Eight AI cards take about 20 seconds to make.")}
                  action={<Button size="sm" variant="secondary" onClick={() => pushToast({ title: tr("Open a textbook"), description: tr("Library → choose a book → Studio → Flashcards."), type: 'info' })}>{tr("How to add cards")}</Button>}
                />
              ) : (
                <div className="max-h-[62vh] space-y-1.5 overflow-y-auto pr-1">
                  {filteredCards.map((card) => (
                    <div key={card.id} className="group flex items-start gap-2.5 rounded-xl border border-line bg-card-2 p-2.5">
                      <span
                        className={cn(
                          'mt-0.5 rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide',
                          card.due <= Date.now() ? 'bg-sun/20 text-sun' : 'bg-aurora-400/15 text-aurora-300',
                        )}
                      >
                        {dueLabel(card.due)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold leading-relaxed text-main">{card.front}</p>
                        <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-muted">{card.back.replace(/[*_`]/g, '')}</p>
                        <p className="mt-1 text-[9px] text-muted-2">
                          {card.subject} · {retentionLabel(card)} {tr("· reps")} {card.reps}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          await deleteCard(card.id)
                          pushToast({ title: tr("Card deleted"), type: 'info' })
                          reload()
                        }}
                        className="rounded-lg p-1.5 text-muted-2 opacity-0 transition hover:bg-coral/10 hover:text-coral group-hover:opacity-100"
                        aria-label={tr("Delete card")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === 'planner' && (
            <Card className="p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="label mb-1 text-sky">{tr("Study planner")}</p>
                  <h2 className="font-display text-lg font-extrabold text-main">{tr("Your missions")}</h2>
                  <p className="text-[10px] text-muted">
                    {doneToday}/{todayTasks.length || 0} {tr("done today ·")} {todayLog.xp} {tr("XP earned today")}
                  </p>
                </div>
                <span className="chip border-sky/25 text-sky">
                  <Clock className="h-3 w-3" /> {Math.round(studySeconds / 60)} {tr("min focus")}
                </span>
              </div>

              {todayTasks.length > 0 && (
                <div className="mb-3 rounded-2xl border border-aurora-400/25 bg-aurora-400/10 p-3">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-aurora-200">
                    <span>{tr("Today’s progress")}</span>
                    <span>{doneToday}/{todayTasks.length}</span>
                  </div>
                  <ProgressBar value={doneToday} max={todayTasks.length} height="h-1.5" />
                </div>
              )}

              <div className="space-y-3">
                {plannerGroups.length === 0 && (
                  <EmptyState
                    icon={<CalendarCheck className="h-6 w-6" />}
                    title={tr("Your planner is empty")}
                    description={tr("Ask Jessica for a 5-day plan from any chapter, or add a quick task manually below.")}
                  />
                )}
                {plannerGroups.map(([day, tasks]) => (
                  <div key={day}>
                    <p className="mb-1.5 flex items-center gap-2 text-[11px] font-extrabold text-main">
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-violet-neon/15 text-[9px] font-black text-violet-glow">
                        {new Date(day).getDate()}
                      </span>
                      {new Date(day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                      {day === today && <span className="chip border-aurora-400/30 text-aurora-200">{tr("Today")}</span>}
                    </p>
                    <div className="space-y-1.5 border-l border-line pl-3">
                      {tasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => togglePlannerTask(task.id)}
                          className={cn(
                            'flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition',
                            task.done ? 'border-aurora-400/25 bg-aurora-400/5' : 'border-line bg-card-2 hover:bg-white/5',
                          )}
                        >
                          <span
                            className={cn(
                              'grid h-5 w-5 shrink-0 place-items-center rounded-md border',
                              task.done ? 'border-aurora-400 bg-aurora-400 text-ink-950' : 'border-line-strong',
                            )}
                          >
                            {task.done && <Check className="h-3 w-3" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={cn('block truncate text-[11px] font-semibold', task.done ? 'text-muted line-through' : 'text-main')}>{task.title}</span>
                            <span className="text-[9px] text-muted">{task.subject} · {task.minutes} {tr("min · +")}{task.xp} {tr("XP")}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-1.5">
                <input
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manual.trim()) {
                      addPlannerTask({ title: manual.trim().slice(0, 70), day: today, minutes: 20, subject: tr('Revision'), xp: 16 })
                      setManual('')
                    }
                  }}
                  placeholder={tr("Add a quick task for today…")}
                  className="field flex-1 text-xs"
                />
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => {
                    if (!manual.trim()) return
                    addPlannerTask({ title: manual.trim().slice(0, 70), day: today, minutes: 20, subject: tr('Revision'), xp: 16 })
                    setManual('')
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <Card className="p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-neon/15 text-violet-glow">
                <Wand2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-main">{tr("AI study plan")}</p>
                <p className="text-[10px] text-muted">{tr("5 realistic days, built from a chapter.")}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {books.slice(0, 4).map((b) => (
                <button
                  key={b.id}
                  onClick={() => preparePlanner(b)}
                  disabled={preparing}
                  className="flex w-full items-center gap-2 rounded-xl border border-line bg-card-2 px-2.5 py-2 text-left transition hover:bg-white/5 disabled:opacity-50"
                >
                  <span className="text-base">{b.emoji}</span>
                  <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-main">{b.title}</span>
                  {preparing && plannerBook?.id === b.id ? <Spinner className="py-0" /> : <ChevronRight className="h-3 w-3 text-muted-2" />}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[9px] leading-relaxed text-muted-2">
              {tr("Jessica reads the chapter locally first, then asks Gemini for a plan you can actually follow.")}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sun/15 text-sun">
                <CalendarCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-main">{tr('Exam countdown')}</p>
                <p className="text-[10px] text-muted">{tr('Set the date and Jessica keeps it in view.')}</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {[...new Set(books.map((b) => b.subject))].slice(0, 5).map((subject) => {
                const value = examDates[subject] || ''
                const days = value ? Math.ceil((new Date(`${value}T00:00:00`).getTime() - Date.now()) / 86400000) : null
                return (
                  <div key={subject} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-main">{tr(subject)}</span>
                    <input
                      type="date"
                      value={value}
                      onChange={(e) => setExamDate(subject, e.target.value)}
                      className="rounded-lg border border-line bg-card-2 px-1.5 py-1 text-[9px] font-semibold text-main outline-none"
                    />
                    {days !== null && (
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold',
                          days < 0 ? 'bg-white/5 text-muted-2' : days <= 7 ? 'bg-coral/15 text-coral' : 'bg-aurora-400/15 text-aurora-200',
                        )}
                      >
                        {days < 0 ? tr('Passed') : tr('{n} days', { n: days })}
                      </span>
                    )}
                  </div>
                )
              })}
              {books.length === 0 && <p className="text-[10px] text-muted">{tr('Import a book first to plan for its exam.')}</p>}
            </div>
          </Card>

          <Card className="p-4">
            <p className="label mb-2">{tr("Today at a glance")}</p>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-muted">{tr("Cards due")}</span>
                <span className="font-bold text-main">{due.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{tr("Planner tasks")}</span>
                <span className="font-bold text-main">{todayTasks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{tr("Focus today")}</span>
                <span className="font-bold text-main">{Math.round((todayLog.seconds || 0) / 60)} {tr("min")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{tr("Total XP")}</span>
                <span className="font-bold text-sun">{xp.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-sun/20 bg-sun/10 p-2 text-[10px] leading-relaxed text-sun">
              <Sparkles className="mr-1 inline h-3 w-3" />
              {tr("Two minutes of recall beats twenty minutes of re-reading.")}
            </div>
          </Card>
        </div>
      </div>

      {plannerBook && (
        <PlannerModal
          open={plannerOpen}
          onClose={() => setPlannerOpen(false)}
          book={plannerBook}
          chapter={plannerChapter}
        />
      )}
    </div>
  )
}
