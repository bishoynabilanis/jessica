import { useEffect, useState } from 'react'
import { Bookmark, Copy, Download, FileText, RefreshCw, Sparkles } from 'lucide-react'
import type { Book, ChapterText } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Card'
import { Markdown } from '@/components/Markdown'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateText } from '@/lib/gemini'
import { cheatSheetPrompt } from '@/lib/prompts'
import { exportStudySheetPdf } from '@/lib/pdfExport'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { tr } from '@/i18n'

export function CheatSheetModal({
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
  const { apiKey, model, addXP, addVault } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [sheet, setSheet] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setSheet('')
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
      const text = await generateText({
        apiKey,
        model,
        system: 'You are an expert Egyptian curriculum summariser. Produce precise, exam-focused study sheets in Markdown.',
        parts: [{ text: cheatSheetPrompt(book, chapter) }],
        temperature: 0.5,
        maxOutputTokens: 2400,
      })
      setSheet(text.replace(/^```markdown\s*/i, '').replace(/```\s*$/i, ''))
      addXP(12, true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the cheat sheet.')
    } finally {
      setLoading(false)
    }
  }

  const download = async () => {
    if (!sheet) return
    setExporting(true)
    try {
      await exportStudySheetPdf({
        title: `${book.subject} · Exam Cheat Sheet`,
        subtitle: book.title,
        markdown: sheet,
        accent: book.accent,
        footer: `Made with Jessica · ${book.title}`,
      })
      pushToast({ title: tr("Cheat sheet downloaded"), description: tr("A clean one-pager, ready for exam night."), type: 'success' })
    } catch (err) {
      pushToast({ title: tr("Export failed"), description: err instanceof Error ? err.message : 'Try again.', type: 'error' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Auto cheat sheet")}
      subtitle={tr("The whole chapter compressed into one beautiful, exam-ready page.")}
      icon={<FileText className="h-4.5 w-4.5" />}
      size="xl"
      footer={
        sheet ? (
          <div className={"flex flex-wrap items-center justify-between gap-2"}>
            <p className={"text-[10px] text-muted-2"}>{tr("Generated from your book · export uses jsPDF")}</p>
            <div className={"flex gap-2"}>
              <Button
                variant={"secondary"}
                size={"sm"}
                onClick={async () => {
                  await navigator.clipboard.writeText(sheet)
                  pushToast({ title: tr("Markdown copied"), type: 'success' })
                }}
              >
                <Copy className={"h-3.5 w-3.5"} /> {tr("Copy")}
              </Button>
              <Button
                variant={"secondary"}
                size={"sm"}
                onClick={() =>
                  addVault({
                    title: `Cheat sheet · ${book.title}`,
                    content: sheet,
                    tag: tr("Cheat sheet"),
                    bookId: book.id,
                  })
                }
              >
                <Bookmark className={"h-3.5 w-3.5"} /> {tr("Save")}
              </Button>
              <Button size={"sm"} onClick={download} loading={exporting}>
                <Download className={"h-3.5 w-3.5"} /> {tr("Download PDF")}
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {!sheet ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-gradient-to-br from-sun/10 via-card-2 to-aurora-400/10 p-8 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-sun/15 text-sun">
            <FileText className="h-8 w-8" />
          </span>
          <div>
            <p className="font-display text-lg font-extrabold text-main">{tr("One page. Zero panic.")}</p>
            <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted">
              {tr("Key concepts, formulas, vocabulary, common mistakes and a 60-second recap — pulled from this exact chapter and exported as a polished PDF.")}
            </p>
          </div>
          <Button onClick={generate} loading={loading}>
            <Sparkles className="h-4 w-4" /> {tr("Build my cheat sheet")}
          </Button>
          {loading && <Spinner label={tr("Condensing the chapter…")} className="py-2" />}
          {error && <p className="text-[11px] text-coral">{error}</p>}
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="chip border-aurora-400/25 text-aurora-200">{book.subject} · {chapter?.pages.length} {tr("pages")}</span>
            <Button variant="ghost" size="sm" onClick={generate} loading={loading}>
              <RefreshCw className="h-3.5 w-3.5" /> {tr("Regenerate")}
            </Button>
          </div>
          <div className="rounded-2xl border border-line bg-card-2 p-4 sm:p-5">
            <Markdown>{sheet}</Markdown>
          </div>
        </div>
      )}
    </Modal>
  )
}
