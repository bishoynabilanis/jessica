import { useEffect, useState } from 'react'
import { Bookmark, Palette, RefreshCw, Sparkles } from 'lucide-react'
import type { Book, ChapterText, ComicScript } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Card'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateJSON } from '@/lib/gemini'
import { comicPrompt } from '@/lib/prompts'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { tr } from '@/i18n'

const emojiMap: [RegExp, string][] = [
  [/sea|ocean|nile|river|water|بحر|نهر/i, '🌊'],
  [/king|queen|pharaoh|cleopatra|ملك|ملكة|فرعون/i, '👑'],
  [/school|classroom|class|مدرسة|فصل/i, '🏫'],
  [/lab|experiment|science|microscope|مختبر|تجربة/i, '🧪'],
  [/football|match|stadium|كورة|ملعب/i, '⚽'],
  [/food|bread|eat|kitchen|طعام|أكل/i, '🥘'],
  [/cat|animal|قطة|حيوان/i, '🐈'],
  [/book|read|library|كتاب|مكتبة/i, '📚'],
  [/sun|light|شمس|ضوء/i, '☀️'],
  [/pyramid|temple|هرم|معبد/i, '🔺'],
  [/market|shop|سوق|متجر/i, '🛍️'],
  [/computer|phone|laptop|كمبيوتر|هاتف/i, '💻'],
  [/friend|together|صديق|معا/i, '🤝'],
  [/garden|plant|tree|حديقة|شجرة/i, '🌳'],
]

const palettes = [
  ['#ffd166', '#ff9a76'],
  ['#5cc8ff', '#a78bfa'],
  ['#21e6c9', '#5cc8ff'],
  ['#ff7a8a', '#ffd166'],
]

function emojiFor(scene: string) {
  return emojiMap.find(([re]) => re.test(scene))?.[1] || '✨'
}

export function ComicModal({
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
  const [topic, setTopic] = useState('')
  const [comic, setComic] = useState<ComicScript | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setComic(null)
    setError('')
    setTopic(book.subject === 'Arabic' ? 'رحلة في درس اليوم' : `${book.subject}: the big idea of this chapter`)
  }, [open, book.subject])

  const generate = async () => {
    if (!requireKey()) return
    if (!chapter) {
      pushToast({ title: tr("Book still indexing"), description: tr("Wait for the PDF text, then try again."), type: 'info' })
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await generateJSON<ComicScript>({
        apiKey,
        model,
        system: 'You are a comic writer and illustrator-director for curious 13-year-olds. Return only JSON.',
        parts: [{ text: comicPrompt(topic || book.title, chapter, book) }],
        temperature: 0.9,
        maxOutputTokens: 1600,
      })
      const panels = (data.panels || []).slice(0, 4)
      if (panels.length < 4) throw new Error('The AI returned fewer than 4 panels. Try again.')
      setComic({ title: data.title || topic || book.title, panels })
      addXP(12, true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the comic.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("AI comic strip")}
      subtitle={tr("History and literature become a 4-panel story — dialogue, scenes and a memorable moral.")}
      icon={<Palette className="h-4.5 w-4.5" />}
      size="xl"
      footer={
        comic ? (
          <div className={"flex flex-wrap items-center justify-between gap-2"}>
            <p className={"text-[10px] text-muted-2"}>{tr("Art direction: emoji storyboarding, zero image API needed.")}</p>
            <Button
              size={"sm"}
              variant={"secondary"}
              onClick={() => {
                addVault({
                  title: `Comic · ${comic.title}`,
                  content: comic.panels
                    .map((p, i) => `Panel ${i + 1}\nScene: ${p.scene}\nDialogue: ${p.dialogue}\nCaption: ${p.caption}`)
                    .join('\n\n'),
                  tag: tr("Comic strip"),
                  bookId: book.id,
                })
              }}
            >
              <Bookmark className={"h-3.5 w-3.5"} /> {tr("Save to vault")}
            </Button>
          </div>
        ) : undefined
      }
    >
      {!comic ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-gradient-to-br from-sun/10 via-card-2 to-coral/10 p-8 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-sun/15 text-sun">
            <Palette className="h-8 w-8" />
          </span>
          <div>
            <p className="font-display text-lg font-extrabold text-main">{tr("Learn it like a story")}</p>
            <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted">
              {tr("Type any historical event, grammar rule or literature scene. Jessica writes four illustrated panels with dialogue and captions.")}
            </p>
          </div>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="field max-w-md text-center"
            placeholder={tr("e.g. The opening of the Suez Canal")}
          />
          <Button onClick={generate} loading={loading}>
            <Sparkles className="h-4 w-4" /> {tr("Draw the comic")}
          </Button>
          {loading && <Spinner label={tr("Inking the panels…")} className="py-2" />}
          {error && <p className="text-[11px] text-coral">{error}</p>}
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-sun">{tr("Jessica Comics · issue 01")}</p>
              <h3 className="font-display text-xl font-extrabold text-main" dir="auto">{comic.title}</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={generate} loading={loading}>
              <RefreshCw className="h-3.5 w-3.5" /> {tr("New strip")}
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {comic.panels.map((panel, i) => (
              <div key={i} className="comic-panel" style={{ background: `linear-gradient(150deg, ${palettes[i % palettes.length][0]}22, #fffdf5 45%, ${palettes[i % palettes.length][1]}33)` }}>
                <div className="absolute left-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-md border-2 border-ink-900 bg-white text-[10px] font-black text-ink-900">
                  {i + 1}
                </div>
                <div className="flex h-full min-h-[200px] flex-col p-4 pt-8">
                  <div className="flex flex-1 items-center justify-center">
                    <span className="text-6xl drop-shadow-sm" aria-hidden>{emojiFor(panel.scene)}</span>
                  </div>
                  <div className="relative mt-2">
                    <div className="relative ml-2 rounded-2xl rounded-bl-sm border-2 border-ink-900 bg-white px-3 py-2 text-[11px] font-semibold leading-relaxed text-ink-900 shadow-[3px_3px_0_rgba(11,18,32,.85)]" dir="auto">
                      <span className="absolute -left-2 bottom-2 h-3 w-3 rotate-45 border-b-2 border-l-2 border-ink-900 bg-white" />
                      “{panel.dialogue}”
                    </div>
                  </div>
                  {panel.caption && (
                    <p className="mt-2 rounded border border-ink-900/80 bg-sun/80 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-ink-900" dir="auto">
                      {panel.caption}
                    </p>
                  )}
                  <p className="mt-1.5 line-clamp-2 text-[8px] italic leading-relaxed text-ink-700/70" dir="auto">
                    {tr("Scene:")} {panel.scene}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
