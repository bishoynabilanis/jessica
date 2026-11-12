import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Copy, ExternalLink, MessageCircle, Phone, Send } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useApp, levelInfo, weekLog } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { buildWhatsAppScheme, buildWhatsAppUrl } from '@/lib/battle'
import { formatDuration, todayKey } from '@/lib/utils'
import { tr } from '@/i18n'

export function ParentReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const state = useApp()
  const navigate = useNavigate()
  const pushToast = useUI((s) => s.pushToast)
  const [phone, setPhone] = useState(state.settings.parentPhone)
  const [message, setMessage] = useState('')
  const { level } = levelInfo(state.xp)
  const week = weekLog(state)
  const weekXp = week.reduce((sum, d) => sum + d.xp, 0)
  const weekSeconds = week.reduce((sum, d) => sum + d.seconds, 0)
  const today = state.dailyLog[todayKey()] || { xp: 0, seconds: 0 }
  const todayTopics = state.topicLog.filter((t) => t.date === todayKey())
  const completedQuests = state.quests.filter((q) => q.claimed).length
  const latestExam = state.exams[0]

  const report = useMemo(() => {
    const lines = [
      `🌟 *Jessica Daily Report* — ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      ``,
      `👤 *${state.name || 'My child'}* — ${state.settings.grade}`,
      `⚡ Level ${level} · ${state.xp} total XP`,
      `🔥 ${state.streak}-day learning streak`,
      `⏱️ Today: ${formatDuration(today.seconds)} · +${today.xp} XP`,
      `🎯 Quests: ${completedQuests}/${state.quests.length} completed`,
      ``,
      `📚 *Topics studied today:*`,
      todayTopics.length
        ? todayTopics.map((t) => `• ${t.title} (${t.subject})`).join('\n')
        : '• Continued reading and AI tutoring',
      ``,
      `📈 This week: +${weekXp} XP across ${formatDuration(weekSeconds)} of focus`,
    ]
    if (latestExam) {
      lines.push(
        ``,
        `🧪 Latest mock exam: ${latestExam.subject} — ${latestExam.score}/${latestExam.total}`,
        latestExam.weakTopics.length ? `🔍 Needs practice: ${latestExam.weakTopics.slice(0, 3).join(', ')}` : '',
      )
    }
    lines.push(
      ``,
      `🧠 Vocabulary in the vault: ${state.vault.length} saved notes`,
      `✨ Keep encouraging ${state.name || 'your child'} — consistency beats cramming!`,
    )
    return lines.filter(Boolean).join('\n')
  }, [state, level, today, completedQuests, weekXp, weekSeconds, latestExam])

  const finalMessage = message || report

  const sendWhatsApp = () => {
    if (phone.trim()) state.updateSettings({ parentPhone: phone.trim() })
    const url = buildWhatsAppUrl(finalMessage, phone || undefined)
    window.open(url, '_blank', 'noopener,noreferrer')
    pushToast({ title: tr("WhatsApp opened"), description: tr("Review the message and press send."), type: 'success' })
  }

  const sendScheme = () => {
    if (phone.trim()) state.updateSettings({ parentPhone: phone.trim() })
    window.location.href = buildWhatsAppScheme(finalMessage)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Parent WhatsApp report")}
      subtitle={tr("A warm, honest snapshot of this week — no data leaves your device until you send it.")}
      icon={<MessageCircle className="h-4.5 w-4.5" />}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] text-muted-2">{tr("Generated locally ·")} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(finalMessage)
                pushToast({ title: tr("Report copied"), type: 'success' })
              }}
            >
              <Copy className="h-3.5 w-3.5" /> {tr("Copy")}
            </Button>
            <Button variant="secondary" size="sm" onClick={sendScheme}>
              <Phone className="h-3.5 w-3.5" /> {tr("WhatsApp app")}
            </Button>
            <Button size="sm" onClick={sendWhatsApp}>
              <Send className="h-3.5 w-3.5" /> {tr("Send on WhatsApp")}
            </Button>
            <Button
              size="sm"
              variant="violet"
              onClick={() => {
                onClose()
                navigate('/report')
              }}
            >
              <BarChart3 className="h-3.5 w-3.5" /> {tr("Full week page")}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="label mb-1.5 block">{tr("Parent phone (optional)")}</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+20 10 1234 5678"
              className="field"
              inputMode="tel"
            />
          </label>
          <div className="rounded-2xl border border-line bg-card-2 p-3">
            <p className="label mb-1">{tr("Quick facts")}</p>
            <p className="text-[11px] leading-relaxed text-muted">
              {tr("Level")} {level} · {tr('{n}-day streak ·', { n: state.streak })} {formatDuration(weekSeconds)} {tr("focus this week ·")} {completedQuests}/{state.quests.length} {tr("quests")}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="label">{tr("Message preview (editable)")}</span>
            <span className="text-[10px] text-muted-2">{finalMessage.length} {tr("chars")}</span>
          </div>
          <textarea
            value={message || report}
            onChange={(e) => setMessage(e.target.value)}
            rows={16}
            className="field font-mono text-[11px] leading-relaxed"
            dir="auto"
          />
        </div>

        <p className="flex items-start gap-2 rounded-xl border border-line bg-card-2 p-2.5 text-[10px] leading-relaxed text-muted">
          <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-aurora-300" />
          <span>
            {tr("Uses the official")} <code className="text-aurora-300">{tr("whatsapp://")}</code> {tr("and")}{' '}
            <code className="text-aurora-300">{tr("wa.me")}</code> {tr("links. Your study data is stored only in this browser.")}
          </span>
        </p>
      </div>
    </Modal>
  )
}
