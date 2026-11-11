import { useMemo, useState } from 'react'
import {
  Bookmark,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState } from '@/components/ui/Card'
import { Markdown } from '@/components/Markdown'
import { cn } from '@/lib/utils'
import { tr } from '@/i18n'

export function Vault() {
  const vault = useApp((s) => s.vault)
  const removeVault = useApp((s) => s.removeVault)
  const addVault = useApp((s) => s.addVault)
  const pushToast = useUI((s) => s.pushToast)
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('All')
  const [openId, setOpenId] = useState<string | null>(null)
  const [composing, setComposing] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const tags = useMemo(() => ['All', ...new Set(vault.map((v) => v.tag))], [vault])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return vault.filter((v) => {
      const matchTag = tag === 'All' || v.tag === tag
      const matchQuery = !q || `${v.title} ${v.content} ${v.tag}`.toLowerCase().includes(q)
      return matchTag && matchQuery
    })
  }, [vault, query, tag])

  const downloadAll = () => {
    const text = vault
      .map((v) => `# ${v.title}\n\n*${v.tag} · ${new Date(v.createdAt).toLocaleDateString()}*\n\n${v.content}`)
      .join('\n\n---\n\n')
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jessica-knowledge-vault-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
    pushToast({ title: tr("Vault exported"), description: tr("Markdown file downloaded."), type: 'success' })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr("Knowledge vault")}
        title={tr("Everything you saved")}
        subtitle={tr("Explanations, cheat sheets, writing feedback and tiny sparks of understanding — all searchable, all local.")}
        icon={<Bookmark className="h-5 w-5" />}
        actions={
          <>
            <Button variant="secondary" onClick={() => setComposing((v) => !v)}>
              <Plus className="h-4 w-4" /> {tr("New note")}
            </Button>
            {vault.length > 0 && (
              <Button variant="secondary" onClick={downloadAll}>
                <Download className="h-4 w-4" /> {tr("Export")}
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: tr("Saved notes"), value: vault.length, icon: Bookmark },
          { label: tr("Collections"), value: Math.max(0, tags.length - 1), icon: FileText },
          { label: tr("This week"), value: vault.filter((v) => Date.now() - v.createdAt < 7 * 864e5).length, icon: Sparkles },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-aurora-400/10 text-aurora-300">
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-xl font-extrabold text-main">{s.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {composing && (
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-extrabold text-main">{tr("New vault note")}</p>
            <button onClick={() => setComposing(false)} className="text-muted hover:text-main"><X className="h-4 w-4" /></button>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tr("Title")} className="field mb-2 text-sm font-semibold" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder={tr("Write a rule, a formula, a quote…")} className="field font-mono text-[11px]" />
          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                if (!title.trim() && !body.trim()) return
                addVault({ title: title.trim() || tr('Quick note'), content: body, tag: tr('My note') })
                setTitle('')
                setBody('')
                setComposing(false)
              }}
            >
              {tr("Save note")}
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr("Search your saved knowledge…")} className="field pl-9" />
        </div>
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={cn(
                'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold transition',
                tag === t ? 'border-aurora-400/40 bg-aurora-400/10 text-aurora-200' : 'border-line text-muted hover:text-main',
              )}
            >
              {tr(t)}
            </button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-6 w-6" />}
          title={vault.length ? tr("Nothing matches that search") : tr("Your vault is waiting")}
          description={
            vault.length
              ? tr("Try another keyword or tag.")
              : tr("Tap Save under any AI answer, cheat sheet or essay feedback and it lands here, safe on your device.")
          }
          action={vault.length ? <Button size="sm" variant="secondary" onClick={() => { setQuery(''); setTag('All') }}>{tr("Clear filters")}</Button> : undefined}
        />
      ) : (
        <div className="grid gap-2.5 xl:grid-cols-2">
          {filtered.map((entry) => {
            const open = openId === entry.id
            return (
              <Card key={entry.id} className="overflow-hidden">
                <button onClick={() => setOpenId(open ? null : entry.id)} className="flex w-full items-start gap-3 p-3.5 text-left">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-neon/10 text-violet-glow">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="chip border-aurora-400/20 text-aurora-300">{entry.tag}</span>
                      <span className="text-[9px] text-muted-2">{new Date(entry.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <p className="mt-1 truncate text-[13px] font-extrabold text-main">{entry.title}</p>
                    {!open && <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-muted">{entry.content.replace(/[#*`>]/g, '').slice(0, 180)}</p>}
                  </div>
                  <ChevronDown className={cn('mt-1 h-4 w-4 shrink-0 text-muted-2 transition', open && 'rotate-180')} />
                </button>
                {open && (
                  <div className="border-t border-line px-4 pb-3 pt-1">
                    <div className="max-h-72 overflow-y-auto">
                      <Markdown className="text-[12px]">{entry.content}</Markdown>
                    </div>
                    <div className="mt-2 flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await navigator.clipboard.writeText(entry.content)
                          pushToast({ title: tr("Copied"), type: 'success' })
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" /> {tr("Copy")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          removeVault(entry.id)
                          pushToast({ title: tr("Note deleted"), type: 'info' })
                        }}
                        className="text-coral"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> {tr("Delete")}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
