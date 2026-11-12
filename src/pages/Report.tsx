import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarRange,
  Clock,
  Copy,
  Flame,
  Send,
  Share2,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, ProgressBar } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useApp, levelInfo, weekLog } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { buildWhatsAppUrl } from '@/lib/battle'
import { shareStory } from '@/lib/shareCard'
import { formatDuration } from '@/lib/utils'
import { levelLabel } from '@/lib/curriculum'
import { tr } from '@/i18n'

export function Report() {
  const state = useApp()
  const navigate = useNavigate()
  const pushToast = useUI((s) => s.pushToast)

  const week = weekLog(state)
  const weekXp = week.reduce((sum, day) => sum + day.xp, 0)
  const weekSeconds = week.reduce((sum, day) => sum + day.seconds, 0)
  const activeDays = week.filter((day) => day.xp > 0 || day.seconds > 0).length
  const maxXp = Math.max(20, ...week.map((day) => day.xp))
  const { level } = levelInfo(state.xp)
  const dates = new Set(week.map((day) => day.date))

  const subjects = useMemo(() => {
    const map = new Map<string, number>()
    for (const topic of state.topicLog) {
      if (!dates.has(topic.date)) continue
      map.set(topic.subject, (map.get(topic.subject) || 0) + 1)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [state.topicLog, dates])

  const weakTopics = useMemo(() => {
    const map = new Map<string, { subject: string; count: number }>()
    for (const mistake of state.mistakes) {
      const key = (mistake.topic || mistake.subject || tr('General')).trim()
      const current = map.get(key)
      if (current) current.count += 1
      else map.set(key, { subject: mistake.subject, count: 1 })
    }
    return [...map.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 5)
  }, [state.mistakes])

  const strongUnits = useMemo(
    () =>
      Object.values(state.unitMastery)
        .filter((item) => item.attempts > 0 && item.total > 0 && item.best / item.total >= 0.85)
        .length,
    [state.unitMastery],
  )

  const weekExams = state.exams.filter((exam) => exam.date >= Date.now() - 7 * 24 * 60 * 60 * 1000)

  const summary = useMemo(() => {
    const lines = [
      `🌟 *Jessica — ${tr('Weekly report')}*`,
      `👤 ${state.name || tr('My child')} · ${levelLabel(state.settings.gradeLevel, state.settings.curriculum)}`,
      '',
      `⏱️ ${tr('Focus this week')}: ${formatDuration(weekSeconds)}`,
      `⚡ ${tr('XP this week')}: +${weekXp}`,
      `📅 ${tr('Active days')}: ${activeDays}/7`,
      `🔥 ${state.streak === 1 ? tr('1-day streak') : tr('{n}-day streak', { n: state.streak })}`,
      `🏅 ${tr('Level')} ${level} · ${state.xp} XP`,
      '',
      subjects.length ? `📚 ${tr('Subjects studied')}:` : '',
      ...subjects.map(([subject, count]) => `• ${subject} — ${tr('{n} topics', { n: count })}`),
      '',
      weakTopics.length ? `🎯 ${tr('Needs practice')}:` : '',
      ...weakTopics.map(([topic, item]) => `• ${topic} (${item.count})`),
      '',
      weekExams.length
        ? `🧪 ${tr('Mock exams this week')}: ${weekExams.map((exam) => `${exam.subject} ${exam.score}/${exam.total}`).join(' · ')}`
        : '',
      '',
      tr('Generated on this device. Nothing was uploaded.'),
    ]
    return lines.filter((line) => line !== '').join('\n')
  }, [activeDays, level, state.name, state.settings.curriculum, state.settings.gradeLevel, state.streak, state.xp, subjects, weekExams, weekSeconds, weekXp, weakTopics])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      pushToast({ title: tr('Report copied'), description: tr('Paste it in WhatsApp or anywhere.'), type: 'success' })
    } catch {
      pushToast({ title: tr('Could not copy'), type: 'error' })
    }
  }

  const share = async () => {
    const outcome = await shareStory({
      title: state.name ? tr('{name}’s week', { name: state.name }) : tr('My learning week'),
      subtitle: tr('A week of learning, in one card'),
      emoji: activeDays >= 5 ? '🔥' : '📚',
      stats: [
        { value: formatDuration(weekSeconds), label: tr('Focus time') },
        { value: `${activeDays}/7`, label: tr('Active days') },
        { value: String(state.streak), label: tr('Day streak') },
      ],
      line: subjects.length ? `${tr('Top subject')}: ${subjects[0][0]}` : tr('Every small step counts.'),
      footer: levelLabel(state.settings.gradeLevel, state.settings.curriculum),
    })
    if (outcome === 'downloaded') pushToast({ title: tr('Card saved as an image'), type: 'success' })
    if (outcome === 'cancelled') pushToast({ title: tr('Sharing cancelled'), type: 'info' })
  }

  const whatsapp = () => {
    window.open(buildWhatsAppUrl(summary, state.settings.parentPhone || undefined), '_blank', 'noopener,noreferrer')
    pushToast({ title: tr('WhatsApp opened'), description: tr('Review the message and press send.'), type: 'success' })
  }

  const stats = [
    { label: tr('Focus this week'), value: formatDuration(weekSeconds), icon: <Clock className="h-4 w-4" />, tone: 'text-aurora-300' },
    { label: tr('XP this week'), value: `+${weekXp}`, icon: <Zap className="h-4 w-4" />, tone: 'text-sun' },
    { label: tr('Active days'), value: `${activeDays}/7`, icon: <CalendarRange className="h-4 w-4" />, tone: 'text-violet-300' },
    { label: tr('Current streak'), value: String(state.streak), icon: <Flame className="h-4 w-4" />, tone: 'text-coral' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Parent report')}
        title={tr('This week, in one page')}
        subtitle={tr('Real minutes, real subjects and the topics that need practice — built from what happened on this device, not from guesses.')}
        icon={<BarChart3 className="h-5 w-5" />}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={copy}>
              <Copy className="h-3.5 w-3.5" /> {tr('Copy')}
            </Button>
            <Button variant="secondary" size="sm" onClick={share}>
              <Share2 className="h-3.5 w-3.5" /> {tr('Story card')}
            </Button>
            <Button size="sm" onClick={whatsapp}>
              <Send className="h-3.5 w-3.5" /> {tr('WhatsApp')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-3.5">
            <span className={stat.tone}>{stat.icon}</span>
            <p className="mt-2 font-display text-2xl font-extrabold text-main">{stat.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-2">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-extrabold text-main">{tr('Last 7 days')}</p>
            <p className="text-[11px] text-muted">
              {tr('Level')} {level} · {state.xp} XP · {strongUnits ? tr('{n} units mastered', { n: strongUnits }) : tr('Building the habit')}
            </p>
          </div>
          <span className="chip border-aurora-400/30 bg-aurora-400/10 text-aurora-200">
            <Trophy className="me-1 h-3 w-3" /> {levelLabel(state.settings.gradeLevel, state.settings.curriculum)}
          </span>
        </div>
        <div className="flex h-40 items-end gap-2">
          {week.map((day) => (
            <div key={day.date} className="flex h-full flex-1 flex-col items-center gap-1.5">
              <span className="text-[9px] font-bold text-muted-2">{day.xp || ''}</span>
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className="w-full max-w-[38px] rounded-t-xl bg-gradient-to-t from-aurora-500/40 to-aurora-300 transition-all"
                  style={{ height: `${Math.max(4, (day.xp / maxXp) * 100)}%` }}
                  title={`${day.xp} XP · ${formatDuration(day.seconds)}`}
                />
              </div>
              <span className="text-[10px] font-bold text-muted">{day.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-4 sm:p-5">
          <p className="flex items-center gap-2 text-sm font-extrabold text-main">
            <BookOpen className="h-4 w-4 text-aurora-300" /> {tr('Subjects studied')}
          </p>
          {subjects.length ? (
            <div className="space-y-2.5">
              {subjects.map(([subject, count]) => (
                <div key={subject}>
                  <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-main">{subject}</span>
                    <span className="text-muted-2">{tr('{n} topics', { n: count })}</span>
                  </div>
                  <ProgressBar value={count} max={subjects[0][1]} height="h-1.5" />
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-line bg-card-2 p-3 text-[11px] leading-relaxed text-muted">
              {tr('No topics logged this week yet. Open a book and read one page — it will show up here instantly.')}
            </p>
          )}
        </Card>

        <Card className="space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-extrabold text-main">
              <AlertTriangle className="h-4 w-4 text-coral" /> {tr('Needs practice')}
            </p>
            {weakTopics.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/mistakes')}>
                {tr('Open mistakes')}
              </Button>
            )}
          </div>
          {weakTopics.length ? (
            <ul className="space-y-2">
              {weakTopics.map(([topic, item]) => (
                <li key={topic} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card-2 px-3 py-2">
                  <span className="min-w-0 truncate text-[11px] font-bold text-main">{topic}</span>
                  <span className="shrink-0 text-[10px] font-bold text-coral">
                    {tr('{n} mistakes', { n: item.count })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-line bg-card-2 p-3 text-[11px] leading-relaxed text-muted">
              {tr('No mistakes saved this week. Practice a few questions to keep the map honest.')}
            </p>
          )}
        </Card>
      </div>

      <Card className="space-y-3 p-4 sm:p-5">
        <p className="flex items-center gap-2 text-sm font-extrabold text-main">
          <Sparkles className="h-4 w-4 text-violet-300" /> {tr('Mock exams this week')}
        </p>
        {weekExams.length ? (
          <div className="space-y-2">
            {weekExams.map((exam) => (
              <div key={exam.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-card-2 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-extrabold text-main">{exam.subject}</p>
                  <p className="text-[10px] text-muted-2">
                    {new Date(exam.date).toLocaleDateString()} · {formatDuration(exam.durationSeconds)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="chip border-aurora-400/30 bg-aurora-400/10 text-aurora-200">
                    {exam.score}/{exam.total}
                  </span>
                  <span className="text-[11px] font-bold text-muted">
                    {Math.round((exam.score / Math.max(1, exam.total)) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-line bg-card-2 p-3 text-[11px] leading-relaxed text-muted">
            {tr('No mock exams this week. A 10-question run takes about 8 minutes and shows up here.')}
          </p>
        )}
      </Card>

      <p className="text-center text-[10px] leading-relaxed text-muted-2">
        {tr('Everything on this page was calculated on this device from your own study log. Nothing was sent anywhere.')}
      </p>
    </div>
  )
}
