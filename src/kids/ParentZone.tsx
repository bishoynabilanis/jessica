import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  Copy,
  Flame,
  GraduationCap,
  KeyRound,
  Lock,
  Plus,
  Printer,
  Settings,
  ShieldCheck,
  Star,
  Timer,
  Trash2,
  Trophy,
} from 'lucide-react'
import { useApp, levelInfo } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ParentGate } from '@/kids/ParentGate'
import { hashPin, validPin } from '@/lib/pin'
import { requestNotificationPermission, sendLocalNotification } from '@/hooks/usePlatform'
import { gradeLabel } from '@/data/officialBooks'
import { cn, dayKeyOffset, pct, todayKey } from '@/lib/utils'
import { tr } from '@/i18n'

const LIMITS = [0, 15, 20, 30, 45]

export function ParentZone() {
  return (
    <ParentGate>
      <ParentDashboard />
    </ParentGate>
  )
}

function ParentDashboard() {
  const navigate = useNavigate()
  const pushToast = useUI((s) => s.pushToast)
  const {
    name,
    xp,
    streak,
    settings,
    updateSettings,
    kidsUsage,
    lessonProgress,
    unitMastery,
    completedTopics,
    customBooks,
    bookProgress,
    parentTasks,
    addParentTask,
    removeParentTask,
  } = useApp()
  const { level } = levelInfo(xp)
  const [report, setReport] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskReward, setTaskReward] = useState(10)
  const [pinNew, setPinNew] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinError, setPinError] = useState('')
  const books = customBooks.filter((b) => b.grade === 4)
  const bookIds = new Set(books.map((book) => book.id))
  const today = todayKey()

  const usageToday = Math.round((kidsUsage[today] || 0) / 60)
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = dayKeyOffset(index - 6)
        return { date, minutes: Math.round((kidsUsage[date] || 0) / 60) }
      }),
    [kidsUsage],
  )
  const weekMinutes = weekDays.reduce((sum, day) => sum + day.minutes, 0)
  const maxMinutes = Math.max(10, ...weekDays.map((day) => day.minutes))

  const lessons = Object.values(lessonProgress).filter((item) => item.done).length
  const unitsMastered = [...bookIds].reduce((sum, id) => {
    const units = customBooks.find((book) => book.id === id)?.units || []
    return (
      sum +
      units.filter((unit) => {
        const key = `${id}:${unit.id}`
        const stat = unitMastery[key]
        return completedTopics.includes(key) || (stat ? stat.best / stat.total >= 0.8 : false)
      }).length
    )
  }, 0)
  const masteryValues = Object.entries(unitMastery)
    .filter(([key]) => bookIds.has(key.split(':')[0]))
    .map(([, value]) => value.best / value.total)
  const avgQuiz = masteryValues.length
    ? Math.round((masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length) * 100)
    : 0
  const started = books.filter((book) => (bookProgress[book.id]?.lastPage || 0) > 0).length

  const now = Date.now()
  const weekAgo = now - 7 * 864e5
  const twoWeeksAgo = now - 14 * 864e5
  const lessonsThis = Object.values(lessonProgress).filter((item) => item.done && item.updatedAt >= weekAgo).length
  const lessonsPrev = Object.values(lessonProgress).filter((item) => item.done && item.updatedAt >= twoWeeksAgo && item.updatedAt < weekAgo).length
  const quizThis = Object.values(unitMastery).filter((item) => item.lastAt >= weekAgo).length
  const quizPrev = Object.values(unitMastery).filter((item) => item.lastAt >= twoWeeksAgo && item.lastAt < weekAgo).length
  const usagePrev = Array.from({ length: 7 }, (_, index) => Math.round((kidsUsage[dayKeyOffset(index - 13)] || 0) / 60)).reduce((a, b) => a + b, 0)
  const change = (current: number, previous: number) => {
    if (!previous) return current ? { label: tr('New'), up: true } : { label: '—', up: true }
    const percent = Math.round(((current - previous) / previous) * 100)
    return { label: `${percent > 0 ? '+' : ''}${percent}%`, up: percent >= 0 }
  }
  const compare = [
    { label: tr('Study time'), current: weekMinutes, previous: usagePrev, unit: tr('min'), change: change(weekMinutes, usagePrev) },
    { label: tr('Lessons'), current: lessonsThis, previous: lessonsPrev, unit: '', change: change(lessonsThis, lessonsPrev) },
    { label: tr('Quiz activity'), current: quizThis, previous: quizPrev, unit: '', change: change(quizThis, quizPrev) },
  ]

  const buildReport = () => {
    const date = new Date().toLocaleDateString(settings.language === 'ar' ? 'ar-EG' : 'en-GB')
    if (settings.language === 'ar') {
      return [
        `تقرير Jessica — ${date}`,
        `الطالب: ${name || '—'} · ${tr(gradeLabel(4))}`,
        `وقت الاستخدام هذا الأسبوع: ${weekMinutes} دقيقة (النهارده ${usageToday} دقيقة)`,
        `الدروس المكتملة: ${lessons}`,
        `الوحدات المتقنة: ${unitsMastered} من ${books.reduce((sum, book) => sum + (book.units?.length || 0), 0)}`,
        `متوسط الاختبارات: ${avgQuiz}%`,
        `الكتب: ${books.length} · بدأ ${started}`,
        `السلسلة: ${streak} يوم · المستوى ${level}`,
        `مهام من الكبار: ${
          parentTasks.length
            ? parentTasks.slice(0, 4).map((task) => `${task.title} (${task.done ? 'تم' : 'لسه'})`).join(' · ')
            : 'مفيش'
        }`,
        avgQuiz >= 70
          ? 'أداء ممتاز — كمّل بنفس الحماس!'
          : lessons > 0
            ? 'خطوة حلوة — درس صغير كل يوم بيصنع فرق.'
            : 'لسه البداية — جرّب درس ٥ دقايق معاه.',
      ].join('\n')
    }
    return [
      `Jessica report — ${date}`,
      `Student: ${name || '—'} · ${gradeLabel(4)}`,
      `This week: ${weekMinutes} minutes (today ${usageToday})`,
      `Lessons completed: ${lessons}`,
      `Units mastered: ${unitsMastered}`,
      `Average quiz: ${avgQuiz}%`,
      `Books: ${books.length} · started ${started}`,
      `Streak: ${streak} days · Level ${level}`,
      `Grown-up tasks: ${
        parentTasks.length
          ? parentTasks.slice(0, 4).map((task) => `${task.title} (${task.done ? 'done' : 'pending'})`).join(' · ')
          : 'none'
      }`,
      avgQuiz >= 70 ? 'Excellent — keep it up!' : lessons > 0 ? 'Nice progress — one small lesson a day.' : 'A good start: try a 5-minute lesson.',
    ].join('\n')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-amber-700">{tr('Parent zone')}</p>
          <h1 className="font-display text-2xl font-extrabold text-ink-950 sm:text-3xl">👨‍👩‍👧 {tr('Parent dashboard')}</h1>
          <p className="mt-1 text-xs font-semibold text-ink-600">
            {name ? tr('Everything {name} did, at a glance.', { name: name.split(' ')[0] }) : tr(gradeLabel(4))}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/kids')}>
          {tr('Back to the kids world')} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: tr('Today'), value: `${usageToday} ${tr('min')}`, icon: Clock, color: 'text-sky' },
          { label: tr('This week'), value: `${weekMinutes} ${tr('min')}`, icon: Timer, color: 'text-violet-neon' },
          { label: tr('Lessons'), value: lessons, icon: CheckCircle2, color: 'text-aurora-600' },
          { label: tr('Units mastered'), value: unitsMastered, icon: Trophy, color: 'text-sun' },
          { label: tr('Average quiz'), value: `${avgQuiz}%`, icon: GraduationCap, color: 'text-coral' },
          { label: tr('Streak'), value: tr('{n} days', { n: streak }), icon: Flame, color: 'text-coral' },
        ].map((item) => (
          <Card key={item.label} className="border-2 border-white p-3">
            <item.icon className={`h-4 w-4 ${item.color}`} />
            <p className="mt-1 font-display text-lg font-extrabold text-ink-950">{item.value}</p>
            <p className="text-[9px] font-bold text-ink-500">{item.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-2 border-white p-4">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
            <Clock className="h-4 w-4 text-sky" /> {tr('Daily time limit')}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-600">
            {tr('When the time is up, the kids area pauses with a gentle screen until a grown-up changes it.')}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {LIMITS.map((minutes) => (
              <button
                key={minutes}
                onClick={() => updateSettings({ kidsDailyLimit: minutes })}
                className={cn(
                  'rounded-xl border px-3 py-1.5 text-[11px] font-extrabold transition',
                  settings.kidsDailyLimit === minutes
                    ? 'border-sun/60 bg-sun/20 text-amber-800'
                    : 'border-line bg-white text-ink-600 hover:bg-black/5',
                )}
              >
                {minutes === 0 ? tr('No limit') : `${minutes} ${tr('min')}`}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] font-semibold text-ink-600">
            {tr('Used today: {n} min', { n: usageToday })}
            {settings.kidsDailyLimit > 0
              ? ` · ${tr('limit {n} min', { n: settings.kidsDailyLimit })}`
              : ` · ${tr('no limit set')}`}
          </p>

          <div className="mt-4">
            <p className="label mb-1.5">{tr('Last 7 days')}</p>
            <div className="flex h-24 items-end gap-1.5">
              {weekDays.map((day) => (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-16 w-full items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-sky to-aurora-400"
                      style={{ height: `${Math.max(4, (day.minutes / maxMinutes) * 100)}%` }}
                      title={`${day.minutes} ${tr('min')}`}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-ink-500">{new Date(day.date).toLocaleDateString('en-GB', { weekday: 'narrow' })}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border-2 border-white p-4">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
            <ShieldCheck className="h-4 w-4 text-aurora-600" /> {tr('Weekly report')}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-600">
            {tr('Generate a short message you can send to a parent or keep for yourself.')}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setReport(buildReport())}>
              {tr('Generate report')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!report}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(report)
                  pushToast({ title: tr('Report copied'), type: 'success' })
                } catch {
                  pushToast({ title: tr('Copy failed'), type: 'error' })
                }
              }}
            >
              <Copy className="h-3.5 w-3.5" /> {tr('Copy')}
            </Button>
            <a
              href={report ? `https://wa.me/?text=${encodeURIComponent(report)}` : undefined}
              target="_blank"
              rel="noreferrer"
              className={cn(!report && 'pointer-events-none opacity-40')}
            >
              <Button size="sm" variant="secondary">{tr('Send on WhatsApp')}</Button>
            </a>
          </div>
          <textarea
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder={tr('Tap Generate report to see the weekly summary.')}
            className="field mt-3 min-h-40 text-[11px] leading-relaxed"
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-2 border-white p-4">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
            <Bell className="h-4 w-4 text-coral" /> {tr('Daily reminder')}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-600">
            {tr('Pick a time after school. The reminder appears while Jessica is open — a static app cannot wake up in the background.')}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="time"
              value={settings.kidsReminder || '16:00'}
              onChange={(e) => updateSettings({ kidsReminder: e.target.value })}
              className="rounded-xl border border-line bg-white px-2.5 py-1.5 text-xs font-bold text-main outline-none"
            />
            <Button
              size="sm"
              variant={settings.kidsReminder ? 'secondary' : 'primary'}
              onClick={() => updateSettings({ kidsReminder: settings.kidsReminder ? '' : '16:00' })}
            >
              {settings.kidsReminder ? tr('Turn reminder off') : tr('Turn reminder on')}
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                const permission = await requestNotificationPermission()
                if (permission === 'granted') {
                  pushToast({ title: tr('Notifications are on'), type: 'success' })
                  sendLocalNotification(tr('Jessica is ready 📚'), tr('A little lesson is waiting for you.')).catch(() => undefined)
                } else {
                  pushToast({ title: tr('Notifications are blocked'), description: tr('Allow them in your browser settings.'), type: 'info' })
                }
              }}
            >
              {tr('Allow notifications')}
            </Button>
            <span className="text-[9px] font-semibold text-ink-500">
              {settings.kidsReminder ? tr('On at {time}', { time: settings.kidsReminder }) : tr('Off')}
            </span>
          </div>
        </Card>

        <Card className="border-2 border-white p-4">
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
            <Plus className="h-4 w-4 text-aurora-600" /> {tr('Tasks from a grown-up')}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-ink-600">
            {tr('Give a small task and a star reward. It appears on the child’s home page.')}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value.slice(0, 80))}
              placeholder={tr('e.g. Read 2 pages')}
              className="field min-w-[140px] flex-1 py-1.5 text-xs"
            />
            <select
              value={taskReward}
              onChange={(e) => setTaskReward(Number(e.target.value))}
              className="rounded-xl border border-line bg-white px-2 py-1.5 text-[11px] font-bold text-main outline-none"
            >
              {[5, 10, 15, 20].map((reward) => (
                <option key={reward} value={reward}>
                  ⭐ {reward}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={() => {
                if (!taskTitle.trim()) return
                addParentTask(taskTitle, taskReward)
                setTaskTitle('')
              }}
            >
              {tr('Add')}
            </Button>
          </div>
          <div className="mt-2 space-y-1.5">
            {parentTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-2 rounded-xl border border-line bg-white px-2.5 py-1.5">
                <span className={`grid h-6 w-6 place-items-center rounded-lg ${task.done ? 'bg-aurora-400/15 text-aurora-600' : 'bg-sun/15 text-amber-700'}`}>
                  {task.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                </span>
                <span className={`min-w-0 flex-1 truncate text-[11px] font-bold ${task.done ? 'text-ink-400 line-through' : 'text-ink-950'}`}>
                  {task.title}
                </span>
                <span className="shrink-0 text-[9px] font-extrabold text-amber-700">+{task.reward}</span>
                <button onClick={() => removeParentTask(task.id)} className="shrink-0 text-ink-400 hover:text-coral" aria-label={tr('Delete')}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {parentTasks.length === 0 && <p className="text-[10px] text-ink-500">{tr('No tasks yet.')}</p>}
          </div>
        </Card>
      </div>

      <Card className="border-2 border-white p-4">
        <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
          <KeyRound className="h-4 w-4 text-violet-neon" /> {tr('Parent PIN')}
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-ink-600">
          {tr('Protect the parent area with a 4–6 digit PIN. The math question stays as a backup.')}
        </p>
        <p className="mt-2 text-[11px] font-bold text-main">
          {settings.parentPinHash ? `🔒 ${tr('PIN is on')}` : `🔓 ${tr('PIN is off')}`}
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input
            value={pinNew}
            onChange={(e) => {
              setPinNew(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))
              setPinError('')
            }}
            type="password"
            inputMode="numeric"
            placeholder={tr('New PIN (4–6 digits)')}
            className="field py-1.5 text-center text-sm tracking-[0.35em]"
          />
          <input
            value={pinConfirm}
            onChange={(e) => {
              setPinConfirm(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))
              setPinError('')
            }}
            type="password"
            inputMode="numeric"
            placeholder={tr('Confirm PIN')}
            className="field py-1.5 text-center text-sm tracking-[0.35em]"
          />
        </div>
        {pinError && <p className="mt-1 text-[10px] font-semibold text-coral">{pinError}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={async () => {
              if (!validPin(pinNew)) {
                setPinError(tr('PIN must be 4–6 digits.'))
                return
              }
              if (pinNew !== pinConfirm) {
                setPinError(tr('PINs do not match.'))
                return
              }
              updateSettings({ parentPinHash: await hashPin(pinNew) })
              setPinNew('')
              setPinConfirm('')
              pushToast({ title: tr('PIN saved'), type: 'success' })
            }}
          >
            {tr('Save PIN')}
          </Button>
          {settings.parentPinHash && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (!window.confirm(tr('Remove the parent PIN?'))) return
                updateSettings({ parentPinHash: '' })
                pushToast({ title: tr('PIN removed'), type: 'info' })
              }}
            >
              {tr('Remove PIN')}
            </Button>
          )}
        </div>
      </Card>

      <Card className="border-2 border-white p-4">
        <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
          <Trophy className="h-4 w-4 text-sun" /> {tr('This week vs last week')}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {compare.map((item) => (
            <div key={item.label} className="rounded-2xl border border-line bg-white p-3">
              <p className="text-[9px] font-bold text-ink-500">{item.label}</p>
              <p className="mt-1 font-display text-xl font-extrabold text-ink-950">
                {item.current}
                {item.unit ? ` ${item.unit}` : ''}
              </p>
              <p className={`text-[10px] font-extrabold ${item.change.up ? 'text-aurora-600' : 'text-coral'}`}>
                {item.change.up ? '↑' : '↓'} {item.change.label}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-2.5 sm:grid-cols-3">
        <Button variant="secondary" onClick={() => navigate('/kids/library')}>
          <BookOpen className="h-4 w-4" /> {tr('Manage books')}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/kids/settings')}>
          <Settings className="h-4 w-4" /> {tr('Full settings')}
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> {tr('Print / save PDF')}
        </Button>
        <Button variant="ghost" onClick={() => navigate('/kids')}>
          <Star className="h-4 w-4" /> {tr('Back to the kids world')}
        </Button>
      </div>

      <p className="flex items-center gap-1.5 text-center text-[9px] font-semibold text-ink-500">
        <Lock className="h-3 w-3" /> {tr('This area is separate from the child’s screens and stays on this device.')}
      </p>

      <div className="print-report" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Jessica — {tr('Weekly report')}</h1>
        <p style={{ margin: '4px 0 16px', fontSize: 12, color: '#555' }}>
          {new Date().toLocaleDateString(settings.language === 'ar' ? 'ar-EG' : 'en-GB')}
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <tbody>
            <tr><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{tr('Student')}</td><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{name || '—'}</td></tr>
            <tr><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{tr('Grade')}</td><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{tr(gradeLabel(4))}</td></tr>
            <tr><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{tr('This week')}</td><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{weekMinutes} {tr('min')}</td></tr>
            <tr><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{tr('Lessons')}</td><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{lessons}</td></tr>
            <tr><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{tr('Units mastered')}</td><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{unitsMastered}</td></tr>
            <tr><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{tr('Average quiz')}</td><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{avgQuiz}%</td></tr>
            <tr><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{tr('Streak')}</td><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{streak}</td></tr>
          </tbody>
        </table>
        <h2 style={{ fontSize: 15, margin: '18px 0 6px' }}>{tr('Last 7 days')}</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'start', padding: 4, borderBottom: '1px solid #ddd' }}>{tr('Day')}</th>
              <th style={{ textAlign: 'start', padding: 4, borderBottom: '1px solid #ddd' }}>{tr('Minutes')}</th>
            </tr>
          </thead>
          <tbody>
            {weekDays.map((day) => (
              <tr key={day.date}>
                <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{new Date(day.date).toLocaleDateString(settings.language === 'ar' ? 'ar-EG' : 'en-GB')}</td>
                <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{day.minutes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {parentTasks.length > 0 && (
          <>
            <h2 style={{ fontSize: 15, margin: '18px 0 6px' }}>{tr('Tasks')}</h2>
            <ul style={{ fontSize: 12, paddingInlineStart: 18 }}>
              {parentTasks.slice(0, 10).map((task) => (
                <li key={task.id}>
                  {task.title} — {task.done ? tr('Done') : tr('Pending')} (+{task.reward})
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
