import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarCheck,
  Check,
  ChevronRight,
  Flame,
  Gamepad2,
  GraduationCap,
  Layers,
  MessageCircle,
  Orbit,
  Play,
  Share2,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Zap,
  Download,
  X,
} from 'lucide-react'
import { BookCard } from '@/components/common/BookCard'
import { KeyNotice, useRequireKey } from '@/components/common/KeyNotice'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Mascot } from '@/components/Mascot'
import { ParentReportModal } from '@/components/tools/ParentReport'
import { RiddleCard } from '@/components/RiddleModal'
import { Button } from '@/components/ui/Button'
import { Card, ProgressBar, SectionTitle, Spinner } from '@/components/ui/Card'
import { useInstallPrompt } from '@/hooks/usePlatform'
import { mascotForXp } from '@/data/mascots'
import { subjectMeta } from '@/data/books'
import { dueCards } from '@/lib/db'
import { buildDailyPlan } from '@/lib/dailyPlan'
import { shareStory } from '@/lib/shareCard'
import { levelLabel } from '@/lib/curriculum'
import type { Book, Quest } from '@/types'
import { generateJSON } from '@/lib/gemini'
import { questsPrompt } from '@/lib/prompts'
import { cn, firstName, formatDuration, pct, todayKey } from '@/lib/utils'
import { useApp, levelInfo, weekLog } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { tr, dateLocale } from '@/i18n'

const questIcons = {
  quiz: Gamepad2,
  pages: BookOpen,
  cards: Layers,
  chat: MessageCircle,
  study: Timer,
  riddle: Sparkles,
  essay: GraduationCap,
  voice: Brain,
}

export function Dashboard() {
  const navigate = useNavigate()
  const requireKey = useRequireKey()
  const [parentOpen, setParentOpen] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [questLoading, setQuestLoading] = useState(false)
  const [dueCount, setDueCount] = useState(0)
  const { canInstall, installed, install } = useInstallPrompt()
  const aiTried = useRef(false)

  const shareWeek = async () => {
    const seconds = week.reduce((sum, day) => sum + day.seconds, 0)
    const active = week.filter((day) => day.xp > 0 || day.seconds > 0).length
    const outcome = await shareStory({
      title: name ? tr('{name}’s week', { name }) : tr('My learning week'),
      subtitle: tr('A week of learning, in one card'),
      emoji: streak >= 5 ? '🔥' : '📚',
      stats: [
        { value: formatDuration(seconds), label: tr('Focus time') },
        { value: `${active}/7`, label: tr('Active days') },
        { value: String(streak), label: tr('Day streak') },
      ],
      line: tr('Every small step counts.'),
      footer: levelLabel(settings.gradeLevel, settings.curriculum),
    })
    if (outcome === 'downloaded') pushToast({ title: tr('Card saved as an image'), type: 'success' })
    if (outcome === 'cancelled') pushToast({ title: tr('Sharing cancelled'), type: 'info' })
  }

  useEffect(() => {
    dueCards()
      .then((cards) => setDueCount(cards.length))
      .catch(() => undefined)
  }, [])

  const state = useApp()
  const {
    name,
    xp,
    streak,
    coins,
    dailyXP,
    studySeconds,
    quests,
    questsSource,
    dailyLog,
    apiKey,
    model,
    settings,
    installDismissed,
    dismissInstall,
    bookProgress,
    completedTopics,
    customBooks,
    topicLog,
    planner,
    exams,
    mascotName,
    mascotLook,
    addXP,
    track,
    claimQuest,
    setQuests,
    completeTopic,
  } = state
  const pushToast = useUI((s) => s.pushToast)
  const { level, progress, into, needed } = levelInfo(xp)
  const mascot = mascotForXp(xp)
  const today = dailyLog[todayKey()] || { xp: 0, seconds: 0 }
  const week = weekLog(state)
  const maxWeekXp = Math.max(40, ...week.map((d) => d.xp))
  const todayTopics = topicLog.filter((t) => t.date === todayKey()).slice(0, 3)
  const openPlanner = planner.filter((p) => !p.done).slice(0, 3)
  const dueNow = quests.filter((q) => q.progress >= q.target && !q.claimed).length


  const inProgress = useMemo(() => {
    return [...customBooks]
      .sort((a, b) => (bookProgress[b.id]?.updatedAt || 0) - (bookProgress[a.id]?.updatedAt || 0))
      .slice(0, 3)
  }, [customBooks, bookProgress])

  const generateQuests = async (force = false) => {
    if (!apiKey && !requireKey()) return
    const flag = `jessica-ai-quests-${todayKey()}`
    if (!force && localStorage.getItem(flag)) return
    if (questLoading) return
    setQuestLoading(true)
    try {
      const data = await generateJSON<{ quests: { title: string; description: string; kind: Quest['kind']; target: number; xp: number }[] }>({
        apiKey,
        model,
        system: 'You are a gamification designer for a 13-year-old Egyptian student. Return only valid JSON.',
        parts: [{ text: questsPrompt(name, completedTopics, exams[0]?.weakTopics || [], settings.gradeLevel) }],
        temperature: 0.85,
        maxOutputTokens: 1200,
      })
      const kinds: Quest['kind'][] = ['quiz', 'pages', 'cards', 'chat', 'riddle', 'study', 'essay', 'voice']
      const valid = data.quests
        ?.filter((q) => q && kinds.includes(q.kind) && q.title)
        .slice(0, 4)
        .map((q) => ({
          title: q.title.slice(0, 60),
          description: (q.description || tr('Daily micro-task')).slice(0, 120),
          kind: q.kind,
          target: Math.max(1, Math.min(20, Number(q.target) || 1)),
          xp: Math.max(20, Math.min(60, Number(q.xp) || 35)),
          progress: 0,
          claimed: false,
          id: '',
        }))
      if (valid?.length) {
        setQuests(valid, 'ai')
        localStorage.setItem(flag, '1')
        pushToast({ title: tr("Fresh AI quests ready"), description: tr("Four new missions designed for today."), type: 'success' })
      }
    } catch (err) {
      if (force) pushToast({ title: tr("Could not refresh quests"), description: err instanceof Error ? err.message : tr('Try again.'), type: 'error' })
    } finally {
      setQuestLoading(false)
    }
  }

  useEffect(() => {
    if (aiTried.current || !apiKey || questsSource === 'ai') return
    aiTried.current = true
    generateQuests(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, questsSource])

  const focusSubjects = useMemo(() => {
    const gradeBooks = customBooks.filter((b) => (b.grade ?? settings.gradeLevel) === settings.gradeLevel)
    const bySubject = new Map<string, typeof gradeBooks>()
    for (const book of gradeBooks) {
      bySubject.set(book.subject, [...(bySubject.get(book.subject) || []), book])
    }
    return [...bySubject.entries()]
      .map(([subject, list]) => {
        const meta = subjectMeta[subject] || { emoji: '📚', color: '#21e6c9' }
        const chapters = list.flatMap((book) =>
          (book.units || []).map((unit) => ({
            id: `${book.id}:${unit.id}`,
            title: unit.title,
            bookId: book.id,
            startPage: unit.startPage,
          })),
        )
        return {
          id: subject,
          label: subject,
          emoji: meta.emoji,
          color: meta.color,
          chapters,
          done: chapters.filter((c) => completedTopics.includes(c.id)).length,
        }
      })
      .filter((s) => s.chapters.length > 0)
      .sort((a, b) => a.done / a.chapters.length - b.done / b.chapters.length)
      .slice(0, 3)
  }, [customBooks, completedTopics, settings.gradeLevel])

  const dailyPlan = buildDailyPlan({
    skillStats: state.skillStats,
    unitMastery: state.unitMastery,
    customBooks: state.customBooks,
    bookProgress: state.bookProgress,
    completedTopics: state.completedTopics,
    examDates: state.examDates,
    mistakes: state.mistakes.length,
    dueCards: dueCount,
    planner: state.planner,
  })

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${new Date().toLocaleDateString(dateLocale(), { weekday: 'long', day: 'numeric', month: 'long' })} · ${levelLabel(settings.gradeLevel, settings.curriculum)}`}
        title={name ? tr('Let’s make today count, {name}.', { name: firstName(name) }) : tr("Welcome to your learning universe.")}
        subtitle={tr("Read a little, recall a lot, and let Jessica turn confusion into “aha!” moments.")}
        actions={
          <>
            <Button variant="secondary" size="md" onClick={() => setParentOpen(true)}>
              <MessageCircle className="h-4 w-4" /> {tr("Parent report")}
            </Button>
            {canInstall && !installed && (
              <Button variant="secondary" size="md" onClick={() => install()}>
                <Sparkles className="h-4 w-4" /> {tr("Install app")}
              </Button>
            )}
            <Button size="md" onClick={() => navigate('/library')}>
              <Play className="h-4 w-4" /> {tr("Continue learning")}
            </Button>
          </>
        }
      />

      {!name && (
        <Card className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sun/15 text-sun">👋</span>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-main">{tr('What’s your name?')}</p>
              <p className="text-[10px] text-muted">{tr('Jessica will greet you by your first name.')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value.slice(0, 40))}
              placeholder={tr('Your first name')}
              className="field h-9 max-w-[180px] py-1 text-xs"
            />
            <Button size="sm" onClick={() => draftName.trim() && state.setName(draftName.trim())} disabled={!draftName.trim()}>
              {tr('Save')}
            </Button>
          </div>
        </Card>
      )}

      <KeyNotice />

      {!installed && !installDismissed && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-aurora-400/20 bg-aurora-400/5 p-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-aurora-400/15 text-aurora-300">
              <Download className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-main">{tr('Install Jessica on your device')}</p>
              <p className="text-[10px] text-muted">{tr('One tap, then it works offline like any app.')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canInstall && (
              <Button size="sm" onClick={() => install()}>
                {tr('Install now')}
              </Button>
            )}
            <Link to="/install">
              <Button size="sm" variant="secondary">{tr('Install guide')}</Button>
            </Link>
            <button
              onClick={() => dismissInstall()}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-main"
              aria-label={tr('Dismiss')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}

      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-aurora-400/15 text-aurora-300">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-main">{tr('Today’s plan')}</p>
              <p className="text-[10px] text-muted">{tr('Three small missions from your own progress.')}</p>
            </div>
          </div>
          <Link to="/plan">
            <Button size="sm" variant="secondary">
              {tr('Open plan')} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {dailyPlan.map((mission) => (
            <Link
              key={mission.id}
              to={mission.to}
              className="flex items-center gap-2 rounded-2xl border border-line bg-card-2 p-2.5 transition hover:bg-white/5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-base">{mission.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-bold text-main">{mission.title}</span>
                <span className="text-[9px] text-muted">{mission.minutes} {tr('min')}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-2" />
            </Link>
          ))}
        </div>
      </Card>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-[28px] border border-line">
        <div className="absolute inset-0 bg-[radial-gradient(700px_300px_at_15%_0%,rgba(139,92,246,.3),transparent_65%),radial-gradient(600px_300px_at_90%_100%,rgba(33,230,201,.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900/90 via-ink-900/80 to-ink-850/90" />
        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.35fr_1fr]">
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip border-aurora-400/30 bg-aurora-400/10 text-aurora-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aurora-400" /> {tr("AI tutor online")}
              </span>
              <span className="chip border-sun/30 bg-sun/10 text-sun">
                <Flame className="h-3 w-3" /> {streak === 1 ? tr('1-day streak') : tr('{n}-day streak', { n: streak })}
              </span>
              <span className="chip border-violet-neon/30 bg-violet-neon/10 text-violet-glow">
                <Trophy className="h-3 w-3" /> {tr("Level")} {level}
              </span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-[42px]">
              {tr("Your brain,")}{' '}
              <span className="text-gradient">{tr("upgraded.")}</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-300">
              {completedTopics.length > 0
                ? tr('You’ve mastered {n} chapters so far. One small mission today keeps the streak alive — and {name} is watching proudly.', { n: completedTopics.length, name: mascotName })
                : tr('Pick a textbook, highlight a tricky sentence, and ask anything. Your first chapter unlock is 30 seconds away.')}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => navigate('/library')}>
                <BookOpen className="h-4 w-4" /> {tr("Open a textbook")}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/study?tab=review')}>
                <Layers className="h-4 w-4" /> {tr("Review due cards")}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/games')}>
                <Gamepad2 className="h-4 w-4" /> {tr("Quick quiz")}
              </Button>
            </div>

            <div className="mt-5 grid max-w-lg grid-cols-3 gap-2">
              {[
                { label: tr("Today"), value: `+${today.xp} XP`, icon: Zap, color: 'text-sun' },
                { label: tr("Focus"), value: formatDuration(today.seconds), icon: Timer, color: 'text-sky' },
                { label: tr("Quests"), value: `${quests.filter((q) => q.claimed).length}/${quests.length}`, icon: Target, color: 'text-aurora-300' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <s.icon className={cn('mb-1 h-3.5 w-3.5', s.color)} />
                  <p className="font-display text-sm font-extrabold text-white" dir="ltr">{s.value}</p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute h-56 w-56 rounded-full bg-aurora-400/10 blur-3xl" />
            <div className="relative">
              <Mascot xp={xp} size={230} look={mascotLook} mood={dueNow ? 'celebrate' : 'proud'} />
              <div className="absolute -bottom-2 left-1/2 w-max -translate-x-1/2 rounded-full border border-white/15 bg-ink-950/80 px-3 py-1 backdrop-blur">
                <p className="text-[10px] font-bold text-white">
                  {tr(mascotName)} · <span className="text-aurora-300">{tr(mascot.current.name)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={tr("Total XP")} value={xp.toLocaleString()} hint={tr('{a} / {b} to next level', { a: into, b: needed })} icon={<Zap className="h-4 w-4" />} accent="text-sun" />
        <StatCard label={tr("Current streak")} value={streak === 1 ? tr('1 day') : tr('{n} days', { n: streak })} hint={state.longestStreak === 1 ? tr('Best: {n} day', { n: state.longestStreak }) : tr('Best: {n} days', { n: state.longestStreak })} icon={<Flame className="h-4 w-4" />} accent="text-coral" />
        <StatCard label={tr("Focus time")} value={formatDuration(studySeconds)} hint={tr("Every minute earns XP")} icon={<Timer className="h-4 w-4" />} accent="text-sky" />
        <StatCard label={tr("Chapters mastered")} value={`${completedTopics.length}`} hint={tr('{n} coins available', { n: coins })} icon={<GraduationCap className="h-4 w-4" />} accent="text-violet-glow" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        {/* QUESTS */}
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="label mb-1 text-sun">{tr("Daily quests")}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr("Four tiny wins")}</h2>
              <p className="mt-0.5 text-[11px] text-muted">{tr("Resets at midnight · bonus XP waiting")}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => generateQuests(true)} loading={questLoading}>
              <Sparkles className="h-3.5 w-3.5" /> {questsSource === 'ai' ? tr('Refresh AI quests') : tr('Make with AI')}
            </Button>
          </div>

          <div className="space-y-2">
            {quests.map((q) => {
              const Icon = questIcons[q.kind] || Target
              const ready = q.progress >= q.target && !q.claimed
              return (
                <div
                  key={q.id}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition',
                    q.claimed ? 'border-aurora-400/25 bg-aurora-400/5' : ready ? 'border-sun/35 bg-sun/10' : 'border-line bg-card-2',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                      q.claimed ? 'bg-aurora-400 text-ink-950' : ready ? 'bg-sun/20 text-sun' : 'bg-white/5 text-muted',
                    )}
                  >
                    {q.claimed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('truncate text-xs font-bold', q.claimed ? 'text-muted line-through' : 'text-main')}>{tr(q.title)}</p>
                      <span className="shrink-0 text-[10px] font-bold text-sun">+{q.xp} {tr("XP")}</span>
                    </div>
                    <p className="truncate text-[10px] text-muted">{tr(q.description)}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={q.progress} max={q.target} height="h-1" className="flex-1" barClassName={q.claimed ? 'from-aurora-400 to-aurora-400' : ready ? 'from-sun to-sun' : undefined} />
                      <span className="text-[9px] font-bold text-muted">{Math.min(q.progress, q.target)}/{q.target}</span>
                    </div>
                  </div>
                  {ready && (
                    <Button size="sm" className="h-8 shrink-0 px-2.5 text-[10px]" onClick={() => claimQuest(q.id)}>
                      {tr("Claim")}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {week.map((d) => (
              <div key={d.date} className="text-center">
                <div
                  className={cn(
                    'relative mx-auto grid h-9 w-9 place-items-center rounded-xl border text-[10px] font-bold',
                    d.seconds > 0 || d.xp > 0
                      ? 'border-aurora-400/30 bg-aurora-400/15 text-aurora-200'
                      : 'border-line bg-card-2 text-muted-2',
                  )}
                >
                  {d.day}
                  {(d.seconds > 0 || d.xp > 0) && (
                    <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-aurora-300" />
                  )}
                </div>
                <p className="mt-1 text-[8px] font-semibold text-muted-2">{d.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <RiddleCard />
          <Card className="p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-aurora-300" />
                <h3 className="text-sm font-extrabold text-main">{tr("Today’s plan")}</h3>
              </div>
              <Link to="/study?tab=planner" className="text-[10px] font-bold text-aurora-300 hover:underline">
                {tr("Open planner")}
              </Link>
            </div>
            {openPlanner.length ? (
              <div className="space-y-1.5">
                {openPlanner.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => state.togglePlannerTask(task.id)}
                    className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-card-2 px-3 py-2 text-left transition hover:bg-white/5"
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-line-strong" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-semibold text-main">{task.title}</span>
                      <span className="text-[9px] text-muted">{task.subject} · {task.minutes} {tr("min · +")}{task.xp} {tr("XP")}</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-2" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] leading-relaxed text-muted">
                {tr("No tasks yet. Ask Jessica to build a 5-day plan from any chapter.")}
              </p>
            )}
            {todayTopics.length > 0 && (
              <div className="mt-3 border-t border-line pt-3">
                <p className="label mb-1.5">{tr("Studied today")}</p>
                {todayTopics.map((t) => (
                  <p key={t.id} className="flex items-center gap-1.5 text-[10px] text-muted">
                    <Check className="h-3 w-3 text-aurora-400" /> {t.title}
                  </p>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div>
        <SectionTitle
          eyebrow={tr("Pick up where you left off")}
          title={tr("Your bookshelf")}
          action={
            <Link to="/library" className="flex items-center gap-1 text-[11px] font-bold text-aurora-300 hover:underline">
              {tr("All books")} <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
        {inProgress.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 p-6 text-center">
            <p className="text-xs font-bold text-main">{tr('No books imported yet')}</p>
            <p className="max-w-sm text-[10px] leading-relaxed text-muted">
              {tr('Open the Library, download an official book and import it once.')}
            </p>
            <Link to="/library">
              <Button variant="secondary" size="sm">{tr('Open library')}</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {inProgress.map((book) => (
              <BookCard key={book.id} book={book} compact />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 sm:p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-violet-glow">{tr("Weekly momentum")}</p>
              <h3 className="font-display text-lg font-extrabold text-main">{tr("XP earned this week")}</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-display text-xl font-extrabold text-main">{week.reduce((s, d) => s + d.xp, 0)}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted">{tr("total XP")}</p>
              </div>
              <div className="flex gap-1.5">
                <Button variant="ghost" size="icon-sm" onClick={shareWeek} aria-label={tr('Share my week')}>
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                <Link
                  to="/report"
                  className="grid h-9 place-items-center rounded-xl border border-line bg-card-2 px-2.5 text-[10px] font-bold text-muted transition hover:text-main"
                >
                  {tr('Weekly report')}
                </Link>
              </div>
            </div>
          </div>
          <div className="flex h-32 items-end gap-2">
            {week.map((d) => (
              <div key={d.date} className="group flex flex-1 flex-col items-center gap-1.5">
                <div className="relative flex h-24 w-full items-end justify-center">
                  <div
                    className={cn(
                      'w-full max-w-[34px] rounded-t-lg bg-gradient-to-t transition-all duration-500',
                      d.xp > 0 ? 'from-violet-neon/40 to-aurora-400' : 'from-white/5 to-white/10',
                    )}
                    style={{ height: `${Math.max(6, (d.xp / maxWeekXp) * 100)}%` }}
                    title={`${d.xp} XP · ${formatDuration(d.seconds)}`}
                  />
                </div>
                <span className="text-[8px] font-bold text-muted-2">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Orbit className="h-4 w-4 text-aurora-300" />
              <h3 className="text-sm font-extrabold text-main">{tr("Focus next")}</h3>
            </div>
            <Link to="/constellation" className="text-[10px] font-bold text-aurora-300 hover:underline">
              {tr("Map")}
            </Link>
          </div>
          <div className="space-y-2.5">
            {focusSubjects.map((s) => {
              const percent = pct(s.done, s.chapters.length)
              const next = s.chapters.find((c) => !completedTopics.includes(c.id))
              return (
                <button
                  key={s.id}
                  onClick={() => next && navigate(`/reader/${next.bookId}`)}
                  className="w-full rounded-xl border border-line bg-card-2 p-2.5 text-left transition hover:bg-white/5"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-main">
                    <span>{s.emoji} {tr(s.label)}</span>
                    <span className="text-[9px] text-muted">{s.done}/{s.chapters.length}</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(3, percent)}%`, background: s.color }} />
                  </div>
                  <p className="mt-1 truncate text-[9px] text-muted">{next ? `${tr('Next:')} ${next.title}` : tr('Subject complete 🎉')}</p>
                </button>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: tr("Ask the AI tutor"), desc: tr('Grounded in your book'), icon: MessageCircle, to: '/library', color: 'from-aurora-400/20 to-aurora-400/5 text-aurora-300' },
          { label: tr("Quiz arena"), desc: tr('5 questions · instant XP'), icon: Gamepad2, to: '/games', color: 'from-violet-neon/20 to-violet-neon/5 text-violet-glow' },
          { label: tr("Spaced repetition"), desc: tr('Beat the forgetting curve'), icon: Brain, to: '/study?tab=review', color: 'from-sky/20 to-sky/5 text-sky' },
          { label: tr("Mock exam"), desc: tr('Timed · certificate'), icon: Trophy, to: '/games?tab=exam', color: 'from-sun/20 to-sun/5 text-sun' },
        ].map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={cn('card-hover relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br p-4', item.color)}
          >
            <item.icon className="mb-3 h-5 w-5" />
            <p className="text-sm font-extrabold text-main">{item.label}</p>
            <p className="mt-0.5 text-[10px] text-muted">{item.desc}</p>
            <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-muted transition group-hover:text-main" />
          </Link>
        ))}
      </div>

      {exams.length > 0 && (
        <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sun/15 text-sun">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-main">{tr("Latest mock exam:")} {tr(exams[0].subject)}</p>
              <p className="text-[11px] text-muted">
                {exams[0].score}/{exams[0].total} · {new Date(exams[0].date).toLocaleDateString(dateLocale())} ·{' '}
                {exams[0].weakTopics.length ? `${tr('Revise')} ${exams[0].weakTopics.slice(0, 2).join(', ')}` : tr('Clean sweep!')}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/games?tab=exam')}>
            {tr("Try another")} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      )}

      <ParentReportModal open={parentOpen} onClose={() => setParentOpen(false)} />
    </div>
  )
}
