import { useEffect, useState } from 'react'
import {
  Check,
  Copy,
  Link2,
  Play,
  QrCode,
  RefreshCw,
  Send,
  Swords,
  Trophy,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import type { Book, ChapterText, BattlePayload, QuizQuestion } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Card'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateJSON } from '@/lib/gemini'
import { quizPrompt } from '@/lib/prompts'
import { battleShareUrl, buildWhatsAppUrl, encodeBattle } from '@/lib/battle'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { uid } from '@/lib/utils'
import { tr } from '@/i18n'

export function BattleStudio({
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
  const { apiKey, model, name, addXP } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const [loading, setLoading] = useState(false)
  const [payload, setPayload] = useState<BattlePayload | null>(null)
  const [qr, setQr] = useState('')
  const [target, setTarget] = useState(3)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) {
      setPayload(null)
      setQr('')
      setError('')
      setCopied(false)
      setTarget(3)
    }
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
      const data = await generateJSON<{ questions: QuizQuestion[] }>({
        apiKey,
        model,
        system: 'You write fair, fast-paced head-to-head quiz questions for 13-year-olds. Return only JSON.',
        parts: [{ text: quizPrompt(book, chapter, 8) }],
        temperature: 0.7,
        maxOutputTokens: 2400,
      })
      const questions = (data.questions || [])
        .filter(
          (q) =>
            q.question?.trim() &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            Number.isInteger(q.answer) &&
            q.answer >= 0 &&
            q.answer < 4,
        )
        .slice(0, 8)
        .map((q) => ({
          question: q.question.trim(),
          options: q.options.map(String),
          answer: q.answer,
          explanation: q.explanation || '',
        }))
      if (questions.length < 5) throw new Error('The AI did not return enough questions. Try again.')
      const battle: BattlePayload = {
        v: 1,
        id: uid('b_'),
        subject: book.subject,
        bookId: book.id,
        challenger: name || 'A Jessica student',
        target: Math.min(target, questions.length),
        questions,
      }
      setPayload(battle)
      const url = battleShareUrl(battle)
      const dataUrl = await QRCode.toDataURL(url, {
        width: 260,
        margin: 1,
        color: { dark: '#05070f', light: '#ffffff' },
      })
      setQr(dataUrl)
      addXP(8, true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the battle.')
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = payload ? battleShareUrl(payload) : ''
  const code = payload ? encodeBattle(payload) : ''

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    pushToast({ title: tr("Battle link copied"), description: tr("Send it to a classmate and see who wins."), type: 'success' })
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Peer battle + QR")}
      subtitle={tr("Turn revision into a friendly duel. Your classmate scans the code — no accounts, no server.")}
      icon={<Swords className="h-4.5 w-4.5" />}
      size="lg"
      footer={
        payload ? (
          <div className={"flex flex-wrap items-center justify-between gap-2"}>
            <p className={"text-[10px] text-muted-2"}>{tr("Challenge encoded in the link · works offline once loaded")}</p>
            <div className={"flex gap-2"}>
              <Button variant={"secondary"} size={"sm"} onClick={generate} loading={loading}>
                <RefreshCw className={"h-3.5 w-3.5"} /> {tr("New questions")}
              </Button>
              <Button
                size={"sm"}
                onClick={() => {
                  onClose()
                  navigate(`/battle?d=${code}`)
                }}
              >
                <Play className={"h-3.5 w-3.5"} /> {tr("Try my battle")}
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {!payload ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-line bg-gradient-to-br from-coral/10 via-card-2 to-violet-neon/10 p-5 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-coral/15 text-coral">
              <Swords className="h-8 w-8" />
            </span>
            <h3 className="mt-3 font-display text-xl font-extrabold text-main">{tr("Challenge a classmate")}</h3>
            <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted">
              {tr("Jessica builds 8 questions from this chapter. Share the QR or link; whoever scores highest takes the bragging rights.")}
            </p>
          </div>

          <div>
            <span className="label mb-1.5 block">{tr("Target score to win")}</span>
            <div className="flex gap-1 rounded-xl border border-line bg-card-2 p-1">
              {[3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setTarget(n)}
                  className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold ${target === n ? 'bg-aurora-400 text-ink-950' : 'text-muted'}`}
                >
                  {n} / 8
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={generate} loading={loading}>
            <Swords className="h-4 w-4" /> {tr("Generate battle challenge")}
          </Button>
          {loading && <Spinner label={tr("Writing head-to-head questions…")} className="py-2" />}
          {error && <p className="rounded-xl border border-coral/30 bg-coral/10 p-2.5 text-[11px] text-coral">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <div className="rounded-2xl border border-line bg-white p-2">
              {qr && <img src={qr} alt={tr("Battle QR code")} className="h-40 w-40" />}
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <span className="chip border-coral/30 bg-coral/10 text-coral">
                <Swords className="h-3 w-3" /> {payload.subject} · {payload.questions.length} {tr("questions")}
              </span>
              <p className="mt-2 font-display text-lg font-extrabold text-main">{payload.challenger} {tr("challenges you")}</p>
              <p className="text-[11px] leading-relaxed text-muted">
                {tr("Scan the QR or open the link. Score")} {payload.target}/{payload.questions.length} {tr("or more to claim the win.")}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                <Button size="sm" variant="secondary" onClick={copy}>
                  {copied ? <Check className="h-3.5 w-3.5 text-aurora-300" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy link'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    window.open(
                      buildWhatsAppUrl(`⚔️ ${payload.challenger} challenged you to a Jessica ${payload.subject} battle!\n\n${shareUrl}`),
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                >
                  <Send className="h-3.5 w-3.5 text-[#25D366]" /> {tr("WhatsApp")}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card-2 p-3">
            <p className="label mb-1.5 flex items-center gap-1.5"><Link2 className="h-3 w-3" /> {tr("Share link")}</p>
            <p className="break-all rounded-lg bg-ink-950/40 p-2 font-mono text-[9px] leading-relaxed text-muted">{shareUrl}</p>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-sun/20 bg-sun/10 p-2.5">
            <QrCode className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sun" />
            <p className="text-[10px] leading-relaxed text-sun/90">
              {tr("Everyone plays on their own device, so the questions travel inside the link — perfect for the school corridor with no internet.")}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-semibold text-muted">
            <Trophy className="h-3.5 w-3.5 text-sun" /> {tr("Winner earns bonus XP and battle bragging rights.")}
          </div>
        </div>
      )}
    </Modal>
  )
}
