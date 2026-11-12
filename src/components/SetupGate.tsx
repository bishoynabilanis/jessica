import { useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  Download,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react'
import { Mascot } from '@/components/Mascot'
import { Button } from '@/components/ui/Button'
import { AddBookModal } from '@/components/library/AddBookModal'
import { KeyTutorial } from '@/components/KeyTutorial'
import { useApp } from '@/store/useApp'
import { validateKey } from '@/lib/gemini'
import { PROVIDERS, providerFor } from '@/lib/providers'
import { officialFor, type OfficialBook } from '@/data/officialBooks'
import { hasOfficialLibrary, levelLabel } from '@/lib/curriculum'
import { subjectMeta } from '@/data/books'
import { tr, UI_LANGUAGES, nextLanguage } from '@/i18n'
import { cn } from '@/lib/utils'

type KeyStatus = 'idle' | 'checking' | 'ok' | 'error'

/**
 * Hard gate: the app only opens after the learner connects a Gemini key and
 * imports at least one book.
 */
export function SetupGate() {
  const apiKey = useApp((s) => s.apiKey)
  const setApiKey = useApp((s) => s.setApiKey)
  const setProvider = useApp((s) => s.setProvider)
  const settings = useApp((s) => s.settings)
  const customBooks = useApp((s) => s.customBooks)
  const updateSettings = useApp((s) => s.updateSettings)

  const [draftKey, setDraftKey] = useState(apiKey)
  const [status, setStatus] = useState<KeyStatus>(apiKey ? 'ok' : 'idle')
  const [message, setMessage] = useState(apiKey ? tr('Key saved on this device.') : '')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [catalog, setCatalog] = useState<OfficialBook | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const provider = providerFor(settings.aiProvider)
  const grade = settings.gradeLevel
  const isEgypt = hasOfficialLibrary(settings.curriculum)
  const books = useMemo(() => officialFor(grade, 'Term 1', 'All').slice(0, 6), [grade])
  const keyDone = Boolean(apiKey.trim())
  const bookDone = customBooks.length > 0
  const done = keyDone && bookDone

  const saveKey = async (skipCheck = false) => {
    const key = draftKey.trim()
    if (!key) {
      setStatus('error')
      setMessage(tr('Paste your API key first.'))
      return
    }
    if (skipCheck) {
      setApiKey(key)
      setStatus('ok')
      setMessage(tr('Key saved. If answers fail, verify it again.'))
      return
    }
    setStatus('checking')
    setMessage(tr('Talking to Google…'))
    const result = await validateKey(key)
    if (result.ok) {
      setApiKey(key)
      setStatus('ok')
      setMessage(result.message)
    } else {
      setStatus('error')
      setMessage(result.message)
    }
  }

  const openPicker = (entry: OfficialBook | null) => {
    setCatalog(entry)
    fileInput.current?.click()
  }

  return (
    <div role="main" className="relative min-h-dvh overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-neon/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-aurora-400/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_0%,rgba(139,92,246,.14),transparent_60%)]" />
      </div>

      <div className="glass relative mx-auto w-full max-w-3xl overflow-hidden rounded-[32px] border border-line p-5 shadow-card sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Mascot xp={0} size={64} mood="curious" animate={false} />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted-2">{tr('Final setup')}</p>
              <h1 className="font-display text-xl font-extrabold text-main sm:text-2xl">{tr('Two steps and the app opens')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSettings({ language: nextLanguage(settings.language) })}
              className="chip border-aurora-400/30 bg-aurora-400/10 text-[10px] font-bold text-aurora-200"
              title={tr('Switch language')}
            >
              {UI_LANGUAGES.find((item) => item.id === nextLanguage(settings.language))?.short}
            </button>
            <span
              className={cn(
                'chip',
                done ? 'border-aurora-400/40 bg-aurora-400/10 text-aurora-200' : 'border-sun/25 bg-sun/10 text-sun',
              )}
            >
              {done ? <Check className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
              {done ? tr('Ready') : tr('{n} of 2 done', { n: (keyDone ? 1 : 0) + (bookDone ? 1 : 0) })}
            </span>
          </div>
        </div>

        <p className="mt-3 max-w-xl text-[11px] leading-relaxed text-muted">
          {tr('Jessica only opens when the AI tutor is connected and at least one book is in your library. Everything stays on this device.')}
        </p>

        <div className="mt-5 space-y-3">
          <section
            className={cn(
              'rounded-3xl border p-4 transition',
              keyDone ? 'border-aurora-400/30 bg-aurora-400/5' : 'border-line bg-card-2',
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-2xl',
                  keyDone ? 'bg-aurora-400/15 text-aurora-300' : 'bg-white/5 text-muted',
                )}
              >
                {keyDone ? <Check className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-main">{tr('1. Connect your AI key')}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                  {tr('Free from Google AI Studio. It is stored in this browser only and never sent anywhere else.')}
                </p>

                {keyDone ? (
                  <p className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-aurora-200">
                    <Check className="h-3 w-3" /> {tr('Key connected.')}
                  </p>
                ) : (
                  <div className="mt-2.5 space-y-2">
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                      {PROVIDERS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setProvider(option.id)
                            setDraftKey('')
                            setStatus('idle')
                            setMessage('')
                          }}
                          className={cn(
                            'rounded-xl border px-2 py-1.5 text-start text-[10px] font-bold transition',
                            settings.aiProvider === option.id
                              ? 'border-aurora-400/50 bg-aurora-400/10 text-aurora-200'
                              : 'border-line bg-card-2 text-muted hover:text-main',
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        value={draftKey}
                        onChange={(e) => {
                          setDraftKey(e.target.value)
                          setStatus('idle')
                        }}
                        type="password"
                        placeholder={provider.keyHint}
                        spellCheck={false}
                        autoComplete="off"
                        className="field flex-1 font-mono text-xs"
                      />
                      <Button size="sm" onClick={() => saveKey(false)} disabled={status === 'checking'} className="shrink-0">
                        {status === 'checking' ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        {tr('Verify and connect')}
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {provider.docsUrl && (
                        <a
                          href={provider.docsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-aurora-400/30 bg-aurora-400/10 px-2.5 py-1.5 text-[10px] font-bold text-aurora-200 transition hover:bg-aurora-400/15"
                        >
                          <KeyRound className="h-3 w-3" />
                          {tr('Get a key from {provider}', { provider: provider.label })}
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      )}
                      {status === 'error' && (
                        <button
                          onClick={() => saveKey(true)}
                          className="text-[9px] font-semibold text-muted underline decoration-dotted underline-offset-2 hover:text-main"
                        >
                          {tr('Save without checking')}
                        </button>
                      )}
                    </div>
                    {message && (
                      <p
                        className={cn(
                          'flex items-start gap-1.5 text-[10px] leading-relaxed',
                          status === 'error' ? 'text-coral' : status === 'ok' ? 'text-aurora-200' : 'text-muted',
                        )}
                      >
                        {status === 'error' && <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />}
                        {message}
                      </p>
                    )}
                    {settings.aiProvider === 'gemini' && <KeyTutorial />}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section
            className={cn(
              'rounded-3xl border p-4 transition',
              bookDone ? 'border-aurora-400/30 bg-aurora-400/5' : 'border-line bg-card-2',
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-2xl',
                  bookDone ? 'bg-aurora-400/15 text-aurora-300' : 'bg-white/5 text-muted',
                )}
              >
                {bookDone ? <Check className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-main">{tr('2. Add at least one book')}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                  {tr('Download a Ministry book or pick a PDF from your device. {grade} · {n} in your library', {
                    grade: levelLabel(grade, settings.curriculum),
                    n: customBooks.length,
                  })}
                </p>

                {bookDone ? (
                  <p className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-aurora-200">
                    <Check className="h-3 w-3" /> {tr('Book ready: {title}', { title: customBooks[0].title })}
                  </p>
                ) : (
                  <>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => openPicker(null)}>
                        <Upload className="h-3.5 w-3.5" /> {tr('Import a PDF from my device')}
                      </Button>
                    </div>

                    <div className={cn('mt-3 space-y-1.5', !isEgypt && 'hidden')}>
                      {books.map((entry) => {
                        const meta = subjectMeta[entry.subject] || { emoji: '📚', color: '#21e6c9' }
                        return (
                          <div
                            key={entry.id}
                            className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-card px-2.5 py-2"
                          >
                            <span className="text-base">{meta.emoji}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[11px] font-bold text-main" dir="auto">
                                {entry.title}
                              </span>
                              <span className="text-[9px] text-muted">
                                {tr(entry.subject)} · {entry.sizeMb} MB
                              </span>
                            </span>
                            <a
                              href={entry.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-[9px] font-bold text-muted transition hover:text-main"
                            >
                              <Download className="h-3 w-3" /> {tr('Download')}
                            </a>
                            <button
                              onClick={() => openPicker(entry)}
                              className="inline-flex items-center gap-1 rounded-lg border border-aurora-400/30 bg-aurora-400/10 px-2 py-1 text-[9px] font-bold text-aurora-200 transition hover:bg-aurora-400/15"
                            >
                              <Upload className="h-3 w-3" /> {tr('Import')}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    <p className="mt-2 text-[9px] leading-relaxed text-muted-2">
                      {isEgypt
                        ? tr('Tip: download the PDF first, then tap Import and choose the file you just saved.')
                        : tr('Your curriculum has no official catalog yet — import any textbook PDF and Jessica will read it.')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <p className="text-[10px] text-muted-2">
            {done
              ? tr('Everything is ready — opening your dashboard…')
              : tr('Both steps unlock the app. It takes about two minutes.')}
          </p>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-extrabold',
              done ? 'bg-aurora-400 text-ink-950' : 'bg-white/5 text-muted-2',
            )}
          >
            {done ? <Check className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            {tr('App unlocked')}
          </span>
        </div>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          e.target.value = ''
          if (file) setPendingFile(file)
        }}
      />

      <AddBookModal
        file={pendingFile}
        catalog={catalog}
        onClose={() => {
          setPendingFile(null)
          setCatalog(null)
        }}
      />
    </div>
  )
}
