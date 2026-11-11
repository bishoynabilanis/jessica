import { useEffect, useRef, useState } from 'react'
import { Bookmark, Headphones, Mic2, Pause, Play, RefreshCw, Sparkles } from 'lucide-react'
import type { Book, ChapterText, PodcastScript } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Card'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateJSON } from '@/lib/gemini'
import { podcastPrompt } from '@/lib/prompts'
import { useSpeech } from '@/lib/speech'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { cn } from '@/lib/utils'
import { tr } from '@/i18n'

export function PodcastModal({
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
  const { apiKey, model, settings, addXP, addVault } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const { speak, stop } = useSpeech()
  const [loading, setLoading] = useState(false)
  const [script, setScript] = useState<PodcastScript | null>(null)
  const [current, setCurrent] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const playingRef = useRef(false)

  useEffect(() => {
    if (!open) {
      playingRef.current = false
      setPlaying(false)
      stop()
      setCurrent(-1)
      setScript(null)
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    return () => {
      playingRef.current = false
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const playAt = (index: number) => {
    if (!script || index >= script.lines.length) {
      playingRef.current = false
      setPlaying(false)
      setCurrent(-1)
      return
    }
    const line = script.lines[index]
    setCurrent(index)
    speak(line.text, book.language, {
      rate: settings.ttsRate * (line.speaker === 'Nour' ? 1.04 : 0.96),
      pitch: line.speaker === 'Nour' ? 1.18 : 0.88,
      onEnd: () => {
        if (playingRef.current) playAt(index + 1)
      },
    })
  }

  const play = (from = 0) => {
    if (!script) return
    stop()
    playingRef.current = true
    setPlaying(true)
    playAt(from)
  }

  const pause = () => {
    playingRef.current = false
    setPlaying(false)
    stop()
  }

  const generate = async () => {
    if (!requireKey()) return
    if (!chapter) {
      pushToast({ title: tr("Book still indexing"), description: tr("Wait for the PDF text, then try again."), type: 'info' })
      return
    }
    setLoading(true)
    setError('')
    stop()
    try {
      const data = await generateJSON<PodcastScript>({
        apiKey,
        model,
        system: 'You produce warm, funny, curriculum-accurate educational podcasts for 13-year-olds. Return only JSON.',
        parts: [{ text: podcastPrompt(book, chapter) }],
        temperature: 0.85,
        maxOutputTokens: 2600,
      })
      const lines = (data.lines || [])
        .filter((l) => l.text?.trim())
        .slice(0, 18)
        .map((l) => ({ speaker: l.speaker === 'Ziad' ? ('Ziad' as const) : ('Nour' as const), text: l.text.trim() }))
      if (!lines.length) throw new Error('The AI did not return a podcast script. Try again.')
      setScript({ title: data.title || `${book.subject} in 3 minutes`, lines })
      addXP(12, true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate the podcast.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Podcast mode")}
      subtitle={tr("A two-voice mini episode that turns this chapter into a story you can listen to.")}
      icon={<Headphones className="h-4.5 w-4.5" />}
      size="lg"
      footer={
        script ? (
          <div className={"flex flex-wrap items-center justify-between gap-2"}>
            <p className={"text-[10px] text-muted-2"}>{tr("Read aloud with the Web Speech API ·")} {script.lines.length} {tr("lines")}</p>
            <div className={"flex gap-2"}>
              <Button
                size={"sm"}
                variant={"secondary"}
                onClick={() => {
                  addVault({
                    title: `Podcast · ${book.title}`,
                    content: `${script.title}\n\n${script.lines.map((l) => `${l.speaker}: ${l.text}`).join('\n\n')}`,
                    tag: tr("Podcast script"),
                    bookId: book.id,
                  })
                }}
              >
                <Bookmark className={"h-3.5 w-3.5"} /> {tr("Save script")}
              </Button>
              <Button size={"sm"} onClick={() => (playing ? pause() : play(0))}>
                {playing ? <Pause className={"h-3.5 w-3.5"} /> : <Play className={"h-3.5 w-3.5"} />}
                {playing ? tr("Pause") : tr("Play podcast")}
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {!script ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-gradient-to-br from-violet-neon/10 via-card-2 to-aurora-400/10 p-8 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-violet-neon/15 text-violet-glow">
            <Headphones className="h-8 w-8" />
          </span>
          <div>
            <p className="font-display text-lg font-extrabold text-main">{tr("Study while you walk")}</p>
            <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted">
              {tr("Nour (curious student) and Ziad (friendly expert) unpack the chapter with analogies, a common mistake and a memorable ending.")}
            </p>
          </div>
          <Button onClick={generate} loading={loading}>
            <Sparkles className="h-4 w-4" /> {tr("Generate episode")}
          </Button>
          {loading && <Spinner label={tr("Recording the studio…")} className="py-2" />}
          {error && <p className="text-[11px] text-coral">{error}</p>}
        </div>
      ) : (
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-violet-neon/20 via-ink-850 to-aurora-400/20 p-4">
            <div className="relative flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-950/60 text-violet-glow">
                <Mic2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-aurora-300">{tr("Jessica FM · episode 01")}</p>
                <p className="truncate font-display text-base font-extrabold text-white">{script.title}</p>
                <p className="text-[10px] text-slate-300">{book.subject} · {Math.max(1, Math.round(script.lines.length * 7))} {tr("sec")}</p>
              </div>
              <button
                onClick={() => (playing ? pause() : play(0))}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-aurora-400 text-ink-950 shadow-glow transition hover:bg-aurora-300"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
              </button>
            </div>
            <div className="mt-3 flex h-8 items-end gap-0.5">
              {Array.from({ length: 42 }).map((_, i) => (
                <span
                  key={i}
                  className={cn('flex-1 rounded-sm bg-white/25 transition-all', playing && i === current % 42 && 'bg-aurora-400')}
                  style={{
                    height: `${20 + ((i * 13) % 70)}%`,
                    animation: playing ? `pulse 1s ease-in-out ${i * 0.03}s infinite` : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="mt-3 max-h-[38vh] space-y-2 overflow-y-auto pr-1">
            {script.lines.map((line, i) => (
              <button
                key={i}
                onClick={() => play(i)}
                className={cn(
                  'flex w-full gap-2.5 rounded-xl border p-2.5 text-left transition',
                  current === i ? 'border-aurora-400/40 bg-aurora-400/10' : 'border-line bg-card-2 hover:bg-white/5',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-black',
                    line.speaker === 'Nour' ? 'bg-violet-neon/20 text-violet-glow' : 'bg-aurora-400/20 text-aurora-200',
                  )}
                >
                  {line.speaker === 'Nour' ? 'N' : 'Z'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-muted">{line.speaker}</span>
                  <span className="text-[11px] leading-relaxed text-main">{line.text}</span>
                </span>
                {current === i && playing && <span className="mt-2 h-2 w-2 animate-pulse rounded-full bg-aurora-400" />}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[10px] text-muted-2">{tr("Tap any line to jump there.")}</p>
            <Button size="sm" variant="ghost" onClick={generate} loading={loading}>
              <RefreshCw className="h-3.5 w-3.5" /> {tr("New episode")}
            </Button>
          </div>
          {error && <p className="mt-2 text-[11px] text-coral">{error}</p>}
        </div>
      )}
    </Modal>
  )
}
