import { useEffect, useState } from 'react'
import { CalendarCheck, RefreshCw, Sparkles, Wand2 } from 'lucide-react'
import type { Book, ChapterText, PlanTask } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Card'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateJSON } from '@/lib/gemini'
import { plannerPrompt } from '@/lib/prompts'
import { dayKeyOffset, uid } from '@/lib/utils'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { useNavigate } from 'react-router-dom'
import { tr } from '@/i18n'

export function PlannerModal({
  open,
  onClose,
  book,
  chapter,
}: {
  open: boolean
  onClose: () => void
  book: Book
  chapter?: ChapterText
}) {
  const requireKey = useRequireKey()
  const navigate = useNavigate()
  const { apiKey, model, setPlanner } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<PlanTask[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setTasks([])
    setError('')
  }, [open])

  const generate = async () => {
    if (!requireKey()) return
    if (!chapter) {
      pushToast({ title: tr("Book still indexing"), description: tr("Wait for the PDF text, then try again."), type: 'info' })
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await generateJSON<{ tasks: { day: string; title: string; detail?: string; minutes?: number; subject?: string }[] }>({
        apiKey,
        model,
        system: 'You are a realistic study coach for Egyptian First Preparatory students. Return only JSON.',
        parts: [{ text: plannerPrompt(book, chapter, 5) }],
        temperature: 0.7,
        maxOutputTokens: 2200,
      })
      const clean = (data.tasks || [])
        .filter((t) => t.title?.trim())
        .slice(0, 20)
        .map((t, i) => ({
          id: uid('p_'),
          title: t.title.trim().slice(0, 70),
          detail: (t.detail || '').slice(0, 140),
          day: /^\d{4}-\d{2}-\d{2}$/.test(t.day || '') ? t.day : dayKeyOffset(Math.floor(i / 4)),
          minutes: Math.max(10, Math.min(60, Number(t.minutes) || 25)),
          subject: t.subject || book.subject,
          done: false,
          xp: Math.max(10, Math.min(40, Math.round((Number(t.minutes) || 25) * 0.8))),
        }))
      if (!clean.length) throw new Error('The AI did not return a plan. Try again.')
      setTasks(clean)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not build the plan.')
    } finally {
      setLoading(false)
    }
  }

  const adopt = () => {
    if (!tasks.length) return
    setPlanner(tasks)
    onClose()
    navigate('/study?tab=planner')
  }

  const groups = tasks.reduce<Record<string, PlanTask[]>>((acc, t) => {
    ;(acc[t.day] = acc[t.day] || []).push(t)
    return acc
  }, {})

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("AI study planner")}
      subtitle={tr("A realistic 5-day plan, sized to your chapter — not to fantasy.")}
      icon={<CalendarCheck className="h-4.5 w-4.5" />}
      size="lg"
      footer={
        tasks.length ? (
          <div className={"flex items-center justify-between gap-2"}>
            <p className={"text-[10px] text-muted-2"}>{tasks.length} {tr("missions ·")} {tasks.reduce((s, t) => s + t.minutes, 0)} {tr("minutes total")}</p>
            <Button size={"sm"} onClick={adopt}>
              <CalendarCheck className={"h-3.5 w-3.5"} /> {tr("Add to my planner")}
            </Button>
          </div>
        ) : undefined
      }
    >
      {!tasks.length ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-gradient-to-br from-aurora-400/10 via-card-2 to-violet-neon/10 p-8 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-aurora-400/15 text-aurora-300">
            <Wand2 className="h-8 w-8" />
          </span>
          <div>
            <p className="font-display text-lg font-extrabold text-main">{tr("Beat the last-minute panic")}</p>
            <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted">
              {tr("Jessica splits this chapter into small daily missions with active recall, practice and a lighter rest day. Completing each task earns XP.")}
            </p>
          </div>
          <Button onClick={generate} loading={loading}>
            <Sparkles className="h-4 w-4" /> {tr("Plan my next 5 days")}
          </Button>
          {loading && <Spinner label={tr("Designing a plan you can actually follow…")} className="py-2" />}
          {error && <p className="text-[11px] text-coral">{error}</p>}
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="chip border-aurora-400/25 text-aurora-200">
              {book.subject} · {tasks.length} {tr("tasks")}
            </span>
            <Button variant="ghost" size="sm" onClick={generate} loading={loading}>
              <RefreshCw className="h-3.5 w-3.5" /> {tr("Re-plan")}
            </Button>
          </div>
          <div className="max-h-[52vh] space-y-4 overflow-y-auto pr-1">
            {Object.entries(groups).map(([day, list]) => (
              <div key={day}>
                <p className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-main">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-neon/15 text-[9px] font-black text-violet-glow">
                    {new Date(day).getDate()}
                  </span>
                  {new Date(day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                  <span className="text-[9px] font-semibold text-muted">· {list.reduce((s, t) => s + t.minutes, 0)} {tr("min")}</span>
                </p>
                <div className="space-y-1.5 border-l border-line pl-3">
                  {list.map((task) => (
                    <div key={task.id} className="rounded-xl border border-line bg-card-2 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] font-semibold text-main">{task.title}</p>
                        <span className="chip shrink-0 border-sun/20 text-sun">+{task.xp}</span>
                      </div>
                      {task.detail && <p className="mt-0.5 text-[10px] leading-relaxed text-muted">{task.detail}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
