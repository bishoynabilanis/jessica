import { useEffect, useId, useRef, useState } from 'react'
import { Copy, GitBranch, RefreshCw, Sparkles } from 'lucide-react'
import type { Book, ChapterText } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Card'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateText } from '@/lib/gemini'
import { mindmapPrompt } from '@/lib/prompts'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { tr } from '@/i18n'

export function MindMapModal({
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
  const { apiKey, model, settings } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '')

  useEffect(() => {
    if (!open) return
    setCode('')
    setError('')
    if (containerRef.current) containerRef.current.innerHTML = ''
  }, [open])

  useEffect(() => {
    if (!code || !open) return
    let alive = true
    ;(async () => {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: settings.theme === 'dark' ? 'dark' : 'default',
          fontFamily: 'Plus Jakarta Sans, Cairo, sans-serif',
          themeVariables: {
            primaryColor: '#0c1122',
            primaryTextColor: '#eef2ff',
            primaryBorderColor: '#21e6c9',
            lineColor: '#8b5cf6',
            secondaryColor: '#1a2340',
            tertiaryColor: '#11172c',
            fontSize: '14px',
          },
        })
        const { svg } = await mermaid.render(`mindmap-${rawId}-${Date.now().toString(36)}`, code)
        if (alive && containerRef.current) containerRef.current.innerHTML = svg
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : 'Mermaid could not parse this map.')
      }
    })()
    return () => {
      alive = false
    }
  }, [code, open, rawId, settings.theme])

  const generate = async () => {
    if (!requireKey()) return
    if (!chapter) {
      pushToast({ title: tr("Book still indexing"), description: tr("Wait for the PDF text, then try again."), type: 'info' })
      return
    }
    setLoading(true)
    setError('')
    try {
      let text = await generateText({
        apiKey,
        model,
        system: 'You are a curriculum visualiser. Return ONLY valid Mermaid mindmap code, no markdown fences.',
        parts: [{ text: mindmapPrompt(book, chapter) }],
        temperature: 0.5,
        maxOutputTokens: 1600,
      })
      text = text.replace(/^```mermaid\s*/i, '').replace(/```\s*$/i, '').trim()
      if (!/^mindmap/i.test(text)) text = `mindmap\n  root((${book.subject}))\n${text.split('\n').map((l) => `    ${l.replace(/^\s+/, '')}`).join('\n')}`
      setCode(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not build the mind map.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Interactive mind map")}
      subtitle={tr("Mermaid.js turns this chapter into a visual concept tree you can actually remember.")}
      icon={<GitBranch className="h-4.5 w-4.5" />}
      size="xl"
      footer={
        code ? (
          <div className={"flex items-center justify-between gap-2"}>
            <p className={"text-[10px] text-muted-2"}>{tr("Rendered with Mermaid · pan by scrolling")}</p>
            <div className={"flex gap-2"}>
              <Button
                variant={"secondary"}
                size={"sm"}
                onClick={async () => {
                  await navigator.clipboard.writeText(code)
                  pushToast({ title: tr("Mermaid code copied"), type: 'success' })
                }}
              >
                <Copy className={"h-3.5 w-3.5"} /> {tr("Copy code")}
              </Button>
              <Button variant={"secondary"} size={"sm"} onClick={generate} loading={loading}>
                <RefreshCw className={"h-3.5 w-3.5"} /> {tr("Regenerate")}
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {!code ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-gradient-to-br from-aurora-400/10 via-card-2 to-violet-neon/10 p-8 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-aurora-400/15 text-aurora-300">
            <GitBranch className="h-8 w-8" />
          </span>
          <div>
            <p className="font-display text-lg font-extrabold text-main">{tr("See the whole chapter at a glance")}</p>
            <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted">
              {tr("Jessica organises ideas into a branching map — perfect for revising relationships, causes and vocabulary families.")}
            </p>
          </div>
          <Button onClick={generate} loading={loading}>
            <Sparkles className="h-4 w-4" /> {tr("Generate mind map")}
          </Button>
          {loading && <Spinner label={tr("Growing the branches…")} className="py-2" />}
          {error && <p className="max-w-lg text-[11px] leading-relaxed text-coral">{error}</p>}
        </div>
      ) : (
        <div>
          <div className="mermaid-wrap min-h-[380px] overflow-auto rounded-2xl border border-line bg-card-2 p-4">
            <div ref={containerRef} className="flex min-w-[600px] justify-center" />
          </div>
          {error && (
            <div className="mt-2 rounded-xl border border-coral/30 bg-coral/10 p-2 text-[10px] text-coral">
              {error}
              <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap">{code}</pre>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
