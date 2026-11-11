import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowUp,
  Bookmark,
  Camera,
  Check,
  Copy,
  Languages,
  Mic,
  MicOff,
  RotateCcw,
  Settings2,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  Wand2,
  X,
} from 'lucide-react'
import type { Book, ChapterText, ChatMessage, RoleplayPersona } from '@/types'
import { streamText } from '@/lib/gemini'
import { buildChatParts, historyToContents, tutorSystem } from '@/lib/prompts'
import { getChat, saveChat, clearChat } from '@/lib/db'
import { speakable, useDictation, useSpeech } from '@/lib/speech'
import { cn, uid } from '@/lib/utils'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { personas } from '@/data/personas'
import { Markdown } from '@/components/Markdown'
import { Mascot, moodFromText } from '@/components/Mascot'
import { VoiceButton, useRequireKey } from '@/components/common/KeyNotice'
import { Button } from '@/components/ui/Button'
import { tr } from '@/i18n'

export interface PendingAsk {
  id: string
  text: string
  label?: string
}

export function ReaderChat({
  book,
  chapter,
  page,
  pendingAsk,
  onConsumed,
  onOpenVision,
}: {
  book: Book
  chapter?: ChapterText
  page: number
  pendingAsk?: PendingAsk | null
  onConsumed?: () => void
  onOpenVision?: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [socratic, setSocratic] = useState(false)
  const [roleplayOpen, setRoleplayOpen] = useState(false)
  const [persona, setPersona] = useState<RoleplayPersona | null>(null)
  const lastAsk = useRef('')
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const requireKey = useRequireKey()
  const { apiKey, model, settings, addVault, addXP, track, xp, mascotLook } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const { speak, stop, speaking } = useSpeech()
  const dictation = useDictation(book.language, (text) => setInput((prev) => `${prev}${prev ? ' ' : ''}${text}`))

  useEffect(() => {
    let alive = true
    setLoading(true)
    getChat(book.id)
      .then((saved) => alive && setMessages(saved))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [book.id])

  useEffect(() => {
    if (!loading && !busy) {
      const timer = window.setTimeout(() => saveChat(book.id, messages), 500)
      return () => window.clearTimeout(timer)
    }
  }, [messages, busy, book.id, loading])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: settings.reduceMotion ? 'auto' : 'smooth' })
  }, [messages, busy, settings.reduceMotion])

  const send = useCallback(
    async (raw: string, label?: string) => {
      const text = raw.trim()
      if (!text || busy) return
      if (!apiKey.trim()) {
        requireKey()
        return
      }
      if (!chapter) {
        pushToast({
          title: tr("Still indexing your book"),
          description: tr("The PDF is being read locally. Give it a second, then ask again."),
          type: 'info',
        })
        return
      }
      setError('')
      const userMessage: ChatMessage = {
        id: uid('m_'),
        role: 'user',
        content: text,
        ts: Date.now(),
        kind: 'chat',
        sourceLabel: label,
      }
      const assistantId = uid('m_')
      const history = messages.filter((m) => m.content.trim())
      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: 'model', content: '', ts: Date.now(), kind: 'chat' },
      ])
      setInput('')
      setBusy(true)
      addXP(2, true)
      track('chat', 1)

      const controller = new AbortController()
      abortRef.current = controller
      let streamed = ''
      let full = ''
      try {
        full = await streamText({
          apiKey,
          model,
          system: tutorSystem({ book, chapter, socratic, persona }),
          parts: [{ text: buildChatParts(text, chapter) }],
          history: historyToContents(history),
          temperature: 0.55,
          maxOutputTokens: 1600,
          signal: controller.signal,
          onChunk: (chunk) => {
            streamed += chunk
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: streamed } : m)))
          },
        })
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: full, ts: Date.now() } : m)))
        if (settings.autoSpeak) speak(speakable(full), book.language, { rate: settings.ttsRate })
      } catch (err) {
        if (controller.signal.aborted) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: full || '_Stopped._', ts: Date.now() }
                : m,
            ),
          )
        } else {
          const message = err instanceof Error ? err.message : 'The tutor could not reply.'
          setError(message)
          setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content.trim()))
        }
      } finally {
        setBusy(false)
        abortRef.current = null
      }
    },
    [apiKey, model, busy, chapter, messages, socratic, persona, book, settings.autoSpeak, settings.ttsRate, addXP, track, speak, pushToast, requireKey],
  )

  useEffect(() => {
    if (!pendingAsk || pendingAsk.id === lastAsk.current) return
    lastAsk.current = pendingAsk.id
    send(pendingAsk.text, pendingAsk.label)
    onConsumed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAsk])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(140, el.scrollHeight)}px`
  }, [input])

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'model' && m.content.trim())

  const eli5 = () => {
    track('chat', 0)
    send(
      lastAssistant
        ? "Explain your last answer like I'm 5 years old. Use one playful everyday analogy from football, gaming or food. Keep it under 120 words and end with a tiny quiz question."
        : `Explain page ${page} of my book like I'm 5, using a fun football or gaming analogy. Keep it short.`,
      'ELI5',
    )
  }

  const arabic = () => {
    send(
      lastAssistant
        ? 'Explain your last answer again in friendly Egyptian Arabic. Keep the important English/German/French terms in their original language with a short Arabic meaning. Use a simple example.'
        : `اشرح لي صفحة ${page} من الكتاب بالعامية المصرية وبساطة، مع الحفاظ على المصطلحات الأجنبية.`,
      'Arabic support',
    )
  }

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    pushToast({ title: tr("Copied to clipboard"), type: 'success' })
  }

  const save = (m: ChatMessage) => {
    const firstLine = m.content.replace(/[#*`>]/g, '').split('\n').find((l) => l.trim()) || tr('AI explanation')
    addVault({
      title: firstLine.slice(0, 70),
      content: m.content,
      tag: tr('AI explanation'),
      bookId: book.id,
    })
  }

  const newChat = async () => {
    if (messages.length && !window.confirm(tr('Clear this conversation? Saved vault notes stay safe.'))) return
    stop()
    setMessages([])
    setError('')
    await clearChat(book.id)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* header */}
      <div className="border-b border-line px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <Mascot xp={xp} size={42} mood={busy ? 'thinking' : 'happy'} animate={false} showAura={false} look={mascotLook} />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-900 bg-aurora-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-main">{tr("Jessica · your tutor")}</p>
            <p className="truncate text-[10px] text-muted">
              {chapter ? `Grounded in ${chapter.pages.length} book pages` : 'Reading your PDF locally…'}
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={eli5} className="rounded-lg px-2 py-1.5 text-[10px] font-bold text-sun transition hover:bg-white/5" title={tr("Explain like I'm 5")}>
              {tr("ELI5")}
            </button>
            <button onClick={arabic} className="rounded-lg p-1.5 text-muted transition hover:bg-white/5 hover:text-main" title={tr("Explain in Arabic")}>
              <Languages className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setRoleplayOpen((v) => !v)}
              className={cn('rounded-lg p-1.5 transition hover:bg-white/5', persona ? 'text-violet-glow' : 'text-muted hover:text-main')}
              title={tr("Roleplay mode")}
            >
              <Wand2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={newChat} className="rounded-lg p-1.5 text-muted transition hover:bg-white/5 hover:text-main" title={tr("New conversation")}>
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSocratic((v) => !v)}
            className={cn(
              'chip transition',
              socratic ? 'border-violet-neon/40 bg-violet-neon/15 text-violet-glow' : 'text-muted hover:text-main',
            )}
            title={tr("Socratic mode: Jessica guides with questions instead of giving answers")}
          >
            <Sparkles className="h-3 w-3" /> {tr("Socratic")} {socratic ? 'on' : 'off'}
          </button>
          <button
            onClick={() => setRoleplayOpen((v) => !v)}
            className={cn(
              'chip max-w-[160px] transition',
              persona ? 'border-sun/40 bg-sun/10 text-sun' : 'text-muted hover:text-main',
            )}
          >
            {persona ? `${persona.emoji} ${persona.name}` : tr('🎭 Roleplay')}
          </button>
          <span className="ml-auto flex items-center gap-1 text-[9px] font-semibold text-muted-2">
            <span className={cn('h-1.5 w-1.5 rounded-full', apiKey ? 'bg-aurora-400' : 'bg-coral')} />
            {apiKey ? tr('BYOK connected') : tr('Add key')}
          </span>
        </div>

        {roleplayOpen && (
          <div className="mt-2 rounded-xl border border-line bg-card-2 p-2">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="label">{tr("Choose a persona")}</p>
              <button onClick={() => setRoleplayOpen(false)} className="text-muted hover:text-main">
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setPersona(null)}
                className={cn('shrink-0 rounded-lg border px-2 py-1 text-[10px] font-semibold', !persona ? 'border-aurora-400/40 bg-aurora-400/10 text-aurora-200' : 'border-line text-muted')}
              >
                {tr("Off")}
              </button>
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPersona(p)
                    setRoleplayOpen(false)
                    pushToast({ title: `${p.name} joined the chat`, description: p.tagline, type: 'info' })
                  }}
                  className={cn(
                    'shrink-0 rounded-lg border px-2 py-1 text-[10px] font-semibold transition',
                    persona?.id === p.id ? 'border-sun/40 bg-sun/10 text-sun' : 'border-line text-muted hover:text-main',
                  )}
                  title={p.tagline}
                >
                  {p.emoji} {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {loading && <p className="py-6 text-center text-[11px] text-muted">{tr("Loading your conversation…")}</p>}

        {!loading && messages.length === 0 && (
          <div className="rounded-2xl border border-line bg-gradient-to-br from-aurora-400/10 via-card-2 to-violet-neon/10 p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">👋</span>
              <p className="text-sm font-extrabold text-main">{tr("Ask me anything about")} {book.subject}</p>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              {tr("I read your actual textbook locally, so my answers stay grounded. Stuck on a sentence? Select it in the PDF and tap Explain.")}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                `Summarise page ${page} simply`,
                'Explain the hardest idea on this page',
                'Give me 3 exam questions',
                'Translate the key terms to Arabic',
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => send(s, 'Quick ask')}
                  className="rounded-lg border border-line bg-card-2 px-2 py-1 text-[10px] font-semibold text-muted transition hover:border-aurora-400/30 hover:text-main"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          if (!m.content && m.role === 'model') {
            return (
              <div key={m.id} className="flex items-start gap-2">
                <Mascot xp={xp} size={34} mood="thinking" animate={false} showAura={false} look={mascotLook} />
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-line bg-card-2 px-3 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-aurora-400 [animation-delay:-.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-aurora-400 [animation-delay:-.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-aurora-400" />
                  <span className="ml-1 text-[10px] font-semibold text-muted">{tr("thinking…")}</span>
                </div>
              </div>
            )
          }

          return m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[88%]">
                {m.sourceLabel && <p className="mb-1 text-right text-[9px] font-bold uppercase tracking-wider text-muted-2">{m.sourceLabel}</p>}
                <div className="rounded-2xl rounded-tr-md bg-aurora-400 px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-ink-950">
                  {m.content}
                </div>
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex items-start gap-2">
              <Mascot xp={xp} size={34} mood={moodFromText(m.content)} animate={false} showAura={false} look={mascotLook} />
              <div className="min-w-0 flex-1">
                <div className="rounded-2xl rounded-tl-md border border-line bg-card p-3">
                  <Markdown className="text-[13px] leading-6">{m.content}</Markdown>
                </div>
                <div className="mt-1 flex items-center gap-0.5">
                  <VoiceButton text={speakable(m.content)} lang={book.language} />
                  <button onClick={() => copy(m.content)} className="rounded-lg p-1.5 text-muted transition hover:bg-white/5 hover:text-main" title={tr("Copy")}>
                    <Copy className="h-3 w-3" />
                  </button>
                  <button onClick={() => save(m)} className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-[9px] font-semibold text-muted transition hover:bg-white/5 hover:text-aurora-300" title={tr("Save to Knowledge Vault")}>
                    <Bookmark className="h-3 w-3" /> {tr("Save")}
                  </button>
                  <button onClick={eli5} className="rounded-lg px-1.5 py-1 text-[9px] font-semibold text-muted transition hover:bg-white/5 hover:text-sun">
                    {tr("ELI5")}
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {error && (
          <div className="rounded-xl border border-coral/30 bg-coral/10 p-2.5 text-[11px] leading-relaxed text-coral">
            {error}
          </div>
        )}
      </div>

      {/* composer */}
      <div className="border-t border-line p-2.5">
        {!chapter && (
          <p className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-sun/10 px-2 py-1 text-[9px] font-semibold text-sun">
            <Sparkles className="h-3 w-3" /> {tr("Reading the PDF locally — the tutor unlocks in a moment.")}
          </p>
        )}
        {dictation.listening && dictation.interim && (
          <p className="mb-1.5 rounded-lg bg-violet-neon/10 px-2 py-1 text-[10px] text-violet-glow">
            🎙️ {dictation.interim}
          </p>
        )}
        <div className="flex items-end gap-1.5 rounded-2xl border border-line bg-card-2 p-1.5 focus-within:border-aurora-400/40">
          <button
            onClick={onOpenVision}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-main"
            title={tr("Photo a question")}
          >
            <Camera className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (dictation.listening) dictation.stop()
              else if (!dictation.start()) pushToast({ title: tr("Dictation unavailable"), description: tr("Try Chrome or Edge on this device."), type: 'error' })
            }}
            className={cn(
              'grid h-8 w-8 shrink-0 place-items-center rounded-xl transition',
              dictation.listening ? 'bg-coral/20 text-coral animate-pulse' : 'text-muted hover:bg-white/5 hover:text-main',
            )}
            title={tr("Speak your question")}
          >
            {dictation.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            rows={1}
            placeholder={chapter ? tr("Ask about this page…") : tr("Waiting for the PDF…")}
            className="max-h-32 min-h-8 flex-1 resize-none bg-transparent px-1 py-1.5 text-[13px] text-main outline-none placeholder:text-muted-2"
          />
          {busy ? (
            <button
              onClick={() => abortRef.current?.abort()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-coral/20 text-coral transition hover:bg-coral/30"
              title={tr("Stop")}
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-aurora-400 text-ink-950 transition hover:bg-aurora-300 disabled:opacity-30"
              title={tr("Send")}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between px-1">
          <p className="text-[9px] text-muted-2">{tr("Jessica can make mistakes. Verify with your textbook.")}</p>
          {speaking && (
            <button onClick={stop} className="flex items-center gap-1 text-[9px] font-bold text-aurora-300">
              <Volume2 className="h-3 w-3" /> {tr("Stop reading")}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
