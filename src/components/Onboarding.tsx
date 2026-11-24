import { useState } from 'react'
import { BookOpen, Check, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { Mascot } from '@/components/Mascot'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/store/useApp'
import { cn } from '@/lib/utils'
import { tr } from '@/i18n'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { TERMS_VERSION } from '@/data/terms'

const arabicFeatures: Record<string, string> = {
  'Read any PDF': 'اقرأ أي PDF',
  'Highlight a sentence → instant explanation': 'حدّد جملة ← شرح فوري',
  'AI study tools': 'أدوات مذاكرة ذكية',
  'Quizzes, flashcards, podcast, mind maps': 'اختبارات، بطاقات مراجعة، بودكاست، وخرائط ذهنية',
  'XP & evolutions': 'نقاط وتطوّر',
  'Grow a companion while you learn': 'كبّر صاحبك وإنت بتتعلّم',
  'Private by design': 'خصوصيتك من الأساس',
  'Everything stays on this device': 'كل حاجة بتفضل على الجهاز ده',
}

const features = [
  { icon: BookOpen, label: 'Read any PDF', hint: 'Highlight a sentence → instant explanation' },
  { icon: Sparkles, label: 'AI study tools', hint: 'Quizzes, flashcards, podcast, mind maps' },
  { icon: Zap, label: 'XP & evolutions', hint: 'Grow a companion while you learn' },
  { icon: ShieldCheck, label: 'Private by design', hint: 'Everything stays on this device' },
]

export function Onboarding() {
  const { name, setName, setOnboarded, acceptTerms, settings } = useApp()
  const [draftName, setDraftName] = useState(name)
  const [checked, setChecked] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const canStart = Boolean(draftName.trim()) && checked

  const start = () => {
    if (!canStart) return
    setName(draftName.trim())
    acceptTerms(TERMS_VERSION)
    setOnboarded()
  }

  return (
    <div role="main" className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-neon/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-aurora-400/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_0%,rgba(139,92,246,.14),transparent_60%)]" />
      </div>

      <div className="glass relative w-full max-w-4xl overflow-hidden rounded-[32px] border border-line shadow-card">
        <div className="grid lg:grid-cols-[1fr_1.1fr]">
          <div className="relative hidden flex-col justify-between border-e border-line bg-gradient-to-br from-violet-neon/15 via-card-2 to-aurora-400/10 p-7 lg:flex">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-aurora-400 to-violet-neon text-lg font-black text-ink-950">
                J
              </span>
              <div>
                <p className="font-display text-lg font-extrabold leading-none text-main">
                  {tr("jessica")}<span className="text-aurora-400">.</span>
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-muted-2">{tr("AI learning universe")}</p>
              </div>
            </div>

            <div className="flex flex-col items-center py-4 text-center">
              <Mascot xp={0} size={190} mood="curious" />
              <p className="mt-2 font-display text-xl font-extrabold text-main">{tr("Hi, I’m Jessica.")}</p>
              <p className="mt-1 max-w-[260px] text-[11px] leading-relaxed text-muted">
                {tr("I read your textbooks with you, explain the tricky bits, and turn revision into a game.")}
              </p>
            </div>

            <div className="space-y-1.5">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-2 rounded-xl border border-line bg-white/5 px-2.5 py-2">
                  <f.icon className="h-3.5 w-3.5 shrink-0 text-aurora-300" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-main">{settings.language === 'ar' ? arabicFeatures[f.label] : tr(f.label)}</p>
                    <p className="truncate text-[9px] text-muted">{settings.language === 'ar' ? arabicFeatures[f.hint] : tr(f.hint)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="lg:hidden">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-aurora-400 to-violet-neon text-sm font-black text-ink-950">
                  J
                </span>
              </div>
              <LanguageSwitch />
            </div>

            <div className="flex-1 animate-slide-up">
              <h1 className="font-display text-2xl font-extrabold leading-tight text-main sm:text-3xl">
                {tr('Welcome to Jessica')}
              </h1>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                {tr('Your study helper for school books. Free, no account, and everything stays on this device.')}
              </p>

              <label className="mt-5 block">
                <span className="label mb-1.5 block">{tr('Your first name')}</span>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value.slice(0, 40))}
                  onKeyDown={(e) => e.key === 'Enter' && canStart && start()}
                  placeholder={tr('e.g. Yassin, Malak, Omar…')}
                  className="field text-base"
                />
              </label>

              <div className="mt-4 rounded-2xl border border-line bg-card-2 p-3">
                <ul className="space-y-1 text-[10px] leading-relaxed text-muted">
                  <li className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-aurora-400" /> {tr('Ministry books belong to the Ministry. Use them for your own study only.')}</li>
                  <li className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-aurora-400" /> {tr('AI answers can be wrong. Always check the original page.')}</li>
                  <li className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-aurora-400" /> {tr('Your data stays on your device. You can erase everything from Settings.')}</li>
                </ul>
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="mt-2 text-[10px] font-bold text-aurora-300 hover:underline"
                >
                  {expanded ? tr('Hide the full text') : tr('Read the full disclaimer')}
                </button>
                {expanded && (
                  <div className="mt-2 space-y-2 text-[10px] leading-relaxed text-muted">
                    <p>{tr('The Egyptian Ministry of Education owns the copyright of its textbooks. Jessica does not host, sell or redistribute these files. The Library only points to links published on the Ministry’s own public servers.')}</p>
                    <p>{tr('If you own the rights to a file and want a link removed, contact us and we will remove it promptly.')}</p>
                    <p>{tr('Jessica is an independent study tool and is not affiliated with or endorsed by the Ministry of Education.')}</p>
                    <p>{tr('Your books, key and progress are stored in this browser only. The app sends requests only to your AI provider, the Ministry file host, the anonymous usage counter and anonymous crash reports — both can be turned off.')}</p>
                  </div>
                )}
              </div>

              <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-2xl border border-aurora-400/25 bg-aurora-400/5 p-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => setChecked((value) => !value)}
                  className={cn(
                    'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition',
                    checked ? 'border-aurora-400 bg-aurora-400 text-ink-950' : 'border-line-strong bg-white/5 text-transparent',
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] leading-relaxed text-main">
                  {tr('I have read and accept the disclaimer and terms of use. I understand that I am responsible for how I use official books and for checking AI answers.')}
                </span>
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <Button onClick={start} disabled={!canStart}>
                <Sparkles className="h-4 w-4" />
                {tr('Start')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
