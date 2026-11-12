import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  GraduationCap,
  KeyRound,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react'
import { Mascot } from '@/components/Mascot'
import { Button } from '@/components/ui/Button'
import { Segmented } from '@/components/ui/Toggle'
import { useApp } from '@/store/useApp'
import { cn } from '@/lib/utils'
import { tr } from '@/i18n'
import { defaultGradeForStage, stageForGrade, type SchoolStage } from '@/lib/stage'

const features = [
  { icon: BookOpen, label: 'Read any PDF', hint: 'Highlight a sentence → instant explanation' },
  { icon: Sparkles, label: 'AI study tools', hint: 'Quizzes, flashcards, podcast, mind maps' },
  { icon: Zap, label: 'XP & evolutions', hint: 'Grow a companion while you learn' },
  { icon: ShieldCheck, label: 'Private by design', hint: 'Everything stays on this device' },
]

export function Onboarding() {
  const { name, setName, setOnboarded, updateSettings, settings, apiKey, setApiKey } = useApp()
  const [step, setStep] = useState(0)
  const [draftName, setDraftName] = useState(name)
  const [draftKey, setDraftKey] = useState(apiKey)

  const finish = () => {
    if (draftName.trim()) setName(draftName.trim())
    if (draftKey.trim()) setApiKey(draftKey.trim())
    setOnboarded()
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8">
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
                    <p className="text-[10px] font-bold text-main">{tr(f.label)}</p>
                    <p className="truncate text-[9px] text-muted">{tr(f.hint)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div className="lg:hidden">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-aurora-400 to-violet-neon text-sm font-black text-ink-950">
                  J
                </span>
              </div>
              <button
                onClick={() => updateSettings({ language: settings.language === 'ar' ? 'en' : 'ar' })}
                className="chip border-aurora-400/30 bg-aurora-400/10 text-[10px] font-bold text-aurora-200"
                title={tr('Switch language')}
              >
                {settings.language === 'ar' ? 'English' : 'العربية'}
              </button>
              <div className="ml-auto flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      step === i ? 'w-6 bg-aurora-400' : step > i ? 'w-3 bg-aurora-400/50' : 'w-3 bg-white/15',
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1">
              {step === 0 && (
                <div className="animate-slide-up">
                  <span className="chip border-aurora-400/30 bg-aurora-400/10 text-aurora-200">
                    <GraduationCap className="h-3 w-3" /> {tr("Primary & Preparatory · Language Schools")}
                  </span>
                  <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-main sm:text-4xl">
                    {tr("Your whole school year,")}
                    <br />
                    <span className="text-gradient">{tr("one smart app.")}</span>
                  </h1>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                    {tr("English, Arabic, German, French, Science and Maths — with an AI tutor that actually knows your\n                    textbook page. No accounts, no subscriptions, no data leaving your device.")}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {[
                      { label: tr("70+ features"), hint: tr("Everything unlocked") },
                      { label: tr("100% local"), hint: tr("Your data stays here") },
                      { label: tr("BYOK free"), hint: tr("Your own Gemini key") },
                      { label: tr("Works offline"), hint: tr("Books & cards") },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-line bg-card-2 px-3 py-2">
                        <p className="text-[11px] font-extrabold text-main">{item.label}</p>
                        <p className="text-[9px] text-muted">{item.hint}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[10px] leading-relaxed text-muted-2">
                    {tr("Official Ministry books for primary and preparatory grades are catalogued in the Library. Download one, import it once, and Jessica teaches from its real pages at the right level.")}
                  </p>
                </div>
              )}

              {step === 1 && (
                <div className="animate-slide-up">
                  <p className="label text-aurora-300">{tr("About you")}</p>
                  <h1 className="mt-2 font-display text-2xl font-extrabold text-main sm:text-3xl">
                    {tr("What should I call you?")}
                  </h1>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    {tr("A name makes the tutor feel like yours. You can change it later in Settings.")}
                  </p>
                  <label className="mt-5 block">
                    <span className="label mb-1.5 block">{tr("Your first name")}</span>
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value.slice(0, 40))}
                      onKeyDown={(e) => e.key === 'Enter' && setStep(2)}
                      placeholder={tr("e.g. Yassin, Malak, Omar…")}
                      autoFocus
                      className="field text-base"
                    />
                  </label>
                  <div className="mt-4 rounded-2xl border border-line bg-card-2 p-3">
                    <p className="text-[10px] font-bold text-main">{tr("A quick promise")}</p>
                    <ul className="mt-1.5 space-y-1 text-[10px] leading-relaxed text-muted">
                      <li className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-aurora-400" /> {tr("No sign-up, no email, no password.")}</li>
                      <li className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-aurora-400" /> {tr("Your key and your work never leave this browser.")}</li>
                      <li className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-aurora-400" /> {tr("You can export or erase everything from Settings.")}</li>
                    </ul>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-slide-up">
                  <p className="label text-aurora-300">{tr("Almost there")}</p>
                  <h1 className="mt-2 font-display text-2xl font-extrabold text-main sm:text-3xl">{tr("Make it comfortable.")}</h1>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    {tr("Choose how Jessica looks. The AI tutor needs a free Gemini key — you'll connect it on the next screen to unlock the app.")}
                  </p>

                  <div className="mt-4">
                    <span className="label mb-1.5 block">{tr('Stage')}</span>
                    <Segmented
                      options={[
                        { value: 'primary', label: 'Primary stage' },
                        { value: 'prep', label: 'Preparatory stage' },
                      ]}
                      value={stageForGrade(settings.gradeLevel)}
                      onChange={(value) => updateSettings({ gradeLevel: defaultGradeForStage(value as SchoolStage) })}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateSettings({ theme: 'dark' })}
                      className={cn(
                        'rounded-2xl border p-3 text-left transition',
                        settings.theme === 'dark' ? 'border-aurora-400/50 bg-aurora-400/10' : 'border-line bg-card-2',
                      )}
                    >
                      <MoonStar className="mb-2 h-4 w-4 text-violet-glow" />
                      <p className="text-xs font-bold text-main">{tr("Midnight")}</p>
                      <p className="text-[10px] text-muted">{tr("Focus after sunset")}</p>
                    </button>
                    <button
                      onClick={() => updateSettings({ theme: 'light' })}
                      className={cn(
                        'rounded-2xl border p-3 text-left transition',
                        settings.theme === 'light' ? 'border-aurora-400/50 bg-aurora-400/10' : 'border-line bg-card-2',
                      )}
                    >
                      <Sun className="mb-2 h-4 w-4 text-sun" />
                      <p className="text-xs font-bold text-main">{tr("Daylight")}</p>
                      <p className="text-[10px] text-muted">{tr("Soft and bright")}</p>
                    </button>
                  </div>

                  <label className="mt-3 block">
                    <span className="label mb-1.5 flex items-center gap-1.5">
                      <KeyRound className="h-3 w-3" /> {tr("Gemini API key")} <span className="normal-case tracking-normal text-muted-2">{tr("(required)")}</span>
                    </span>
                    <input
                      value={draftKey}
                      onChange={(e) => setDraftKey(e.target.value)}
                      type="password"
                      placeholder={tr("AIza…")}
                      spellCheck={false}
                      autoComplete="off"
                      className="field font-mono text-xs"
                    />
                  </label>
                  <p className="mt-1.5 text-[9px] leading-relaxed text-muted-2">
                    {tr("Free from Google AI Studio. Stored only in this browser. Add or test it later in Settings.")}
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-aurora-400/30 bg-aurora-400/10 px-3 py-2 text-[11px] font-bold text-aurora-200 transition hover:bg-aurora-400/15"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    {tr('Get a free API key from Google AI Studio')}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>

                  <div className="mt-3 rounded-2xl border border-aurora-400/20 bg-aurora-400/5 p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold text-aurora-200">
                      <Sparkles className="h-3 w-3" /> {tr("You’re all set")}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                      {tr("Next: connect your key and add one book. The app opens as soon as both are ready.")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-2">
              <button
                onClick={() => (step === 0 ? setStep(1) : setStep((s) => s - 1))}
                className="flex items-center gap-1 text-[11px] font-bold text-muted transition hover:text-main"
              >
                {step === 0 ? tr('Skip intro') : <><ChevronLeft className="h-3.5 w-3.5 rtl-flip" /> {tr('Back')}</>}
              </button>
              <Button
                onClick={() => {
                  if (step === 2) finish()
                  else setStep((s) => s + 1)
                }}
                disabled={step === 1 && !draftName.trim()}
              >
                {step === 2 ? tr('Finish setup') : tr('Continue')}
                <ArrowRight className="h-4 w-4 rtl-flip" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
