import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronRight,
  CloudOff,
  Database,
  Download,
  Eye,
  EyeOff,
  Fingerprint,
  GraduationCap,
  KeyRound,
  Languages,
  Laptop,
  Loader2,
  Lock,
  MoonStar,
  Save,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Type,
  Upload,
  User,
  Volume2,
  Wand2,
  Zap,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { KeyTutorial } from '@/components/KeyTutorial'
import { Button } from '@/components/ui/Button'
import { Card, ProgressBar } from '@/components/ui/Card'
import { Toggle, Segmented } from '@/components/ui/Toggle'
import { useApp, levelInfo } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { validateKey } from '@/lib/gemini'
import { PROVIDERS, providerFor } from '@/lib/providers'
import {
  requestNotificationPermission,
  sendLocalNotification,
  useInstallPrompt,
} from '@/hooks/usePlatform'
import { countCards, wipeDatabase } from '@/lib/db'
import { exportFullBackup, restoreFullBackup } from '@/lib/backup'
import { riddleForDate } from '@/data/riddles'
import { cn, todayKey } from '@/lib/utils'
import { defaultGradeForStage, gradesForStage, stageForGrade, type SchoolStage } from '@/lib/stage'
import { CURRICULA, GLOBAL_LEVELS, hasOfficialLibrary } from '@/lib/curriculum'
import { gradeLabel } from '@/data/officialBooks'
import { tr, UI_LANGUAGES } from '@/i18n'

type KeyStatus = 'idle' | 'checking' | 'valid' | 'invalid'

export function Settings() {
  const state = useApp()
  const {
    name,
    xp,
    apiKey,
    model,
    settings,
    setName,
    setApiKey,
    setProvider,
    setModel,
    updateSettings,
    importState,
    resetAll,
    vault,
    planner,
    exams,
    completedTopics,
    bookProgress,
    onboarded,
  } = state
  const pushToast = useUI((s) => s.pushToast)
  const { canInstall, installed, install } = useInstallPrompt()
  const { level } = levelInfo(xp)

  const [draftKey, setDraftKey] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  const [keyStatus, setKeyStatus] = useState<KeyStatus>(apiKey ? 'valid' : 'idle')
  const [keyMessage, setKeyMessage] = useState(apiKey ? tr('Saved on this device.') : '')
  const provider = providerFor(settings.aiProvider)
  const [profile, setProfile] = useState({
    name,
    studentName: settings.studentName,
    school: settings.school,
    grade: settings.grade,
    parentPhone: settings.parentPhone,
  })
  const [cardCount, setCardCount] = useState<number | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const zipRef = useRef<HTMLInputElement>(null)
  const [fullBusy, setFullBusy] = useState(false)

  useEffect(() => {
    countCards()
      .then(setCardCount)
      .catch(() => setCardCount(null))
  }, [])

  const saveProfile = () => {
    setName(profile.name.trim())
    updateSettings({
      studentName: profile.studentName.trim(),
      school: profile.school.trim(),
      grade: profile.grade.trim() || tr('First Preparatory'),
      parentPhone: profile.parentPhone.trim(),
    })
    pushToast({ title: tr("Profile saved"), description: tr("Your details stay on this device."), type: 'success' })
  }

  const checkKey = async () => {
    const key = draftKey.trim()
    if (!key) {
      setKeyStatus('invalid')
      setKeyMessage(tr('Paste a Gemini API key first.'))
      return
    }
    setKeyStatus('checking')
    setKeyMessage(tr('Talking to Google…'))
    const result = await validateKey(key)
    if (result.ok) {
      setApiKey(key)
      setKeyStatus('valid')
      setKeyMessage(result.message)
      pushToast({ title: tr("Gemini connected"), description: tr("Your AI tutor is ready."), type: 'success' })
    } else {
      setKeyStatus('invalid')
      setKeyMessage(result.message)
      pushToast({ title: tr("Key not accepted"), description: result.message, type: 'error' })
    }
  }

  const exportData = () => {
    const data = useApp.getState()
    const payload: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'function' && key !== 'apiKey') payload[key] = value
    }
    const blob = new Blob([JSON.stringify({ app: 'jessica', version: 2, exportedAt: Date.now(), data: payload }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `jessica-backup-${todayKey()}.json`
    link.click()
    URL.revokeObjectURL(url)
    pushToast({ title: tr("Backup downloaded"), description: tr("Keep this file safe — it has your XP and notes."), type: 'success' })
  }

  const importData = async (file: File) => {
    setBusy(true)
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const data = parsed?.data || parsed
      if (!data || typeof data !== 'object') throw new Error('This file does not look like a Jessica backup.')
      importState(data)
      pushToast({
        title: tr("Backup restored"),
        description: tr("Your progress is back. The API key was not imported for safety."),
        type: 'success',
      })
      const next = useApp.getState()
      setProfile({
        name: next.name,
        studentName: next.settings.studentName,
        school: next.settings.school,
        grade: next.settings.grade,
        parentPhone: next.settings.parentPhone,
      })
    } catch (err) {
      pushToast({
        title: tr("Could not restore backup"),
        description: err instanceof Error ? err.message : 'Check the JSON file and try again.',
        type: 'error',
      })
    } finally {
      setBusy(false)
    }
  }

  const doReset = async () => {
    setBusy(true)
    try {
      resetAll()
      await wipeDatabase()
      pushToast({
        title: tr("Fresh start"),
        description: tr("Progress, messages and flashcards were cleared. Your API key was kept."),
        type: 'info',
      })
      setConfirmReset(false)
    } catch {
      pushToast({ title: tr("Reset partially completed"), description: tr("Reload the app to finish clearing data."), type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const enableNotifications = async () => {
    const permission = await requestNotificationPermission()
    updateSettings({ notifications: permission === 'granted' })
    if (permission === 'granted') {
      const riddle = riddleForDate(todayKey())
      await sendLocalNotification(tr('Your daily riddle is ready'), riddle.question)
      pushToast({ title: tr("Daily reminders on"), description: tr("A riddle will greet you at 4 PM while Jessica is open."), type: 'success' })
    } else {
      pushToast({
        title: tr("Notifications not enabled"),
        description: tr("Your browser blocked them. Allow notifications in site settings."),
        type: 'info',
      })
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr("Settings")}
        title={tr("Make Jessica feel like yours")}
        subtitle={tr("Your key, your comfort settings and your data — all stored locally on this device.")}
        icon={<Fingerprint className="h-5 w-5" />}
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <div className="space-y-4">
          {/* API KEY */}
          <Card className="p-4 sm:p-5">
            <div className="mb-3 flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-aurora-400/10 text-aurora-300">
                <KeyRound className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base font-extrabold text-main">{tr("AI provider & key")}</h2>
                <p className="text-[11px] leading-relaxed text-muted">
                  {tr("Bring your own key from Gemini, OpenAI, Claude or any compatible endpoint. It is stored in this browser only.")}
                </p>
              </div>
              <span
                className={cn(
                  'chip shrink-0',
                  apiKey ? 'border-aurora-400/30 text-aurora-200' : 'border-coral/30 text-coral',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', apiKey ? 'animate-pulse bg-aurora-400' : 'bg-coral')} />
                {apiKey ? tr('Connected') : tr('Missing')}
              </span>
            </div>

            <div className="mb-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {PROVIDERS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setProvider(option.id)
                    setDraftKey('')
                    setKeyStatus('idle')
                    setKeyMessage('')
                  }}
                  className={cn(
                    'rounded-xl border px-2.5 py-2 text-start transition',
                    settings.aiProvider === option.id
                      ? 'border-aurora-400/50 bg-aurora-400/10'
                      : 'border-line bg-card-2 hover:bg-white/5',
                  )}
                >
                  <span className="block text-[10px] font-extrabold text-main">{option.label}</span>
                  <span className="block text-[8px] leading-snug text-muted">{tr(option.tagline)}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <input
                  value={draftKey}
                  onChange={(e) => {
                    setDraftKey(e.target.value)
                    setKeyStatus('idle')
                  }}
                  type={showKey ? 'text' : 'password'}
                  placeholder={provider.keyHint}
                  spellCheck={false}
                  autoComplete="off"
                  className="field pr-10 font-mono text-xs"
                />
                <button
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-main"
                  aria-label={showKey ? tr('Hide key') : tr('Show key')}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={checkKey} loading={keyStatus === 'checking'} className="shrink-0">
                {keyStatus === 'valid' ? <Check className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                {keyStatus === 'valid' ? tr('Re-check key') : tr('Save & test')}
              </Button>
            </div>

            {provider.docsUrl && (
              <a
                href={provider.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-aurora-400/30 bg-aurora-400/10 px-3 py-2 text-[11px] font-bold text-aurora-200 transition hover:bg-aurora-400/15"
              >
                <KeyRound className="h-3.5 w-3.5" />
                {tr('Get a key from {provider}', { provider: provider.label })}
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            )}

            {!apiKey && settings.aiProvider === 'gemini' && <KeyTutorial />}

            {keyMessage && (
              <p
                className={cn(
                  'mt-2 rounded-xl border px-3 py-2 text-[10px] leading-relaxed',
                  keyStatus === 'invalid'
                    ? 'border-coral/30 bg-coral/10 text-coral'
                    : keyStatus === 'valid'
                      ? 'border-aurora-400/25 bg-aurora-400/10 text-aurora-200'
                      : 'border-line bg-card-2 text-muted',
                )}
              >
                {keyStatus === 'checking' && <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />}
                {keyMessage}
              </p>
            )}

            {settings.aiProvider === 'custom' && (
              <label className="mt-3 block">
                <span className="label mb-1 block">{tr('Endpoint base URL')}</span>
                <input
                  value={settings.aiBaseUrl}
                  onChange={(e) => updateSettings({ aiBaseUrl: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  dir="ltr"
                  spellCheck={false}
                  className="field font-mono text-[11px]"
                />
              </label>
            )}

            <div className="mt-3">
              <span className="label mb-1.5 block">{tr("Model")}</span>
              {settings.aiProvider === 'custom' ? (
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="model-name"
                  dir="ltr"
                  spellCheck={false}
                  className="field font-mono text-[11px]"
                />
              ) : (
              <div className="grid gap-1.5 sm:grid-cols-2">
                {provider.models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setModel(m.id)
                      pushToast({ title: tr('{name} selected', { name: m.label }), type: 'info' })
                    }}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition',
                      model === m.id ? 'border-aurora-400/40 bg-aurora-400/10' : 'border-line bg-card-2 hover:bg-white/5',
                    )}
                  >
                    <span className={cn('grid h-7 w-7 place-items-center rounded-lg', model === m.id ? 'bg-aurora-400 text-ink-950' : 'bg-white/5 text-muted')}>
                      <Zap className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-extrabold text-main">{m.label}</span>
                      <span className="block truncate text-[9px] text-muted">{m.hint ? tr(m.hint) : ''}</span>
                    </span>
                    {model === m.id && <Check className="h-3.5 w-3.5 shrink-0 text-aurora-300" />}
                  </button>
                ))}
              </div>
              )}
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-xl border border-sun/20 bg-sun/10 p-2.5">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sun" />
              <p className="text-[10px] leading-relaxed text-sun/90">
                {tr("Requests go straight from your browser to Google. No middle server ever sees your key. Never share it\n                publicly or commit it to a repository.")}
              </p>
            </div>
          </Card>

          {/* PROFILE */}
          <Card className="p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-aurora-300" />
              <h2 className="text-sm font-extrabold text-main">{tr("Student profile")}</h2>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <label className="block">
                <span className="label mb-1 block">{tr("Display name")}</span>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder={tr("Your first name")}
                  className="field text-xs"
                />
              </label>
              <label className="block">
                <span className="label mb-1 block">{tr("Full name (certificates)")}</span>
                <input
                  value={profile.studentName}
                  onChange={(e) => setProfile({ ...profile, studentName: e.target.value })}
                  placeholder={tr("Student full name")}
                  className="field text-xs"
                />
              </label>
              <label className="block">
                <span className="label mb-1 block">{tr("Grade")}</span>
                <input
                  value={profile.grade}
                  onChange={(e) => setProfile({ ...profile, grade: e.target.value })}
                  className="field text-xs"
                />
              </label>
              <label className="block">
                <span className="label mb-1 block">{tr("School")}</span>
                <input
                  value={profile.school}
                  onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                  placeholder={tr("School name")}
                  className="field text-xs"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="label mb-1 block">{tr("Parent WhatsApp number")}</span>
                <input
                  value={profile.parentPhone}
                  onChange={(e) => setProfile({ ...profile, parentPhone: e.target.value })}
                  placeholder={tr("+20 1X XXX XXXX")}
                  inputMode="tel"
                  className="field text-xs"
                />
                <span className="mt-1 block text-[9px] leading-relaxed text-muted-2">
                  {tr("Used only to build the weekly parent report message on your device. Nothing is sent automatically.")}
                </span>
              </label>
            </div>
            <Button className="mt-3" size="sm" onClick={saveProfile}>
              <Save className="h-3.5 w-3.5" /> {tr("Save profile")}
            </Button>
          </Card>

          {/* ACCESSIBILITY */}
          <Card className="p-4 sm:p-5">
            <div className="mb-1 flex items-center gap-2">
              <Type className="h-4 w-4 text-violet-glow" />
              <h2 className="text-sm font-extrabold text-main">{tr("Comfort & accessibility")}</h2>
            </div>
            <p className="mb-2 text-[10px] text-muted">{tr("Small adjustments that make reading and focus easier.")}</p>

            <div className="mb-3">
              <span className="label mb-1.5 block">{tr('Where do you study?')}</span>
              <div className="grid grid-cols-2 gap-1.5">
                {CURRICULA.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => updateSettings({ curriculum: option.id })}
                    className={cn(
                      'rounded-xl border px-2.5 py-2 text-start transition',
                      settings.curriculum === option.id
                        ? 'border-aurora-400/50 bg-aurora-400/10'
                        : 'border-line bg-card-2 hover:bg-white/5',
                    )}
                  >
                    <span className="text-sm">{option.emoji}</span>
                    <span className="ms-1.5 text-[11px] font-extrabold text-main">{tr(option.label)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <span className="label mb-1.5 block">
                {hasOfficialLibrary(settings.curriculum) ? tr('Stage') : tr('Learner level')}
              </span>
              {hasOfficialLibrary(settings.curriculum) ? (
                <>
                  <Segmented
                    options={[
                      { value: 'primary', label: 'Primary stage' },
                      { value: 'prep', label: 'Preparatory stage' },
                    ]}
                    value={stageForGrade(settings.gradeLevel)}
                    onChange={(value) => updateSettings({ gradeLevel: defaultGradeForStage(value as SchoolStage) })}
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {gradesForStage(stageForGrade(settings.gradeLevel)).map((value) => (
                      <button
                        key={value}
                        onClick={() => updateSettings({ gradeLevel: value })}
                        className={cn(
                          'rounded-xl border px-2.5 py-1.5 text-[10px] font-bold transition',
                          settings.gradeLevel === value
                            ? 'border-aurora-400/50 bg-aurora-400/15 text-aurora-200'
                            : 'border-line bg-card-2 text-muted hover:text-main',
                        )}
                      >
                        {tr(gradeLabel(value))}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid gap-1.5">
                  {GLOBAL_LEVELS.map((level) => (
                    <button
                      key={level.grade}
                      onClick={() => updateSettings({ gradeLevel: level.grade })}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-start text-[11px] font-bold transition',
                        settings.gradeLevel === level.grade
                          ? 'border-aurora-400/50 bg-aurora-400/10 text-aurora-200'
                          : 'border-line bg-card-2 text-muted hover:text-main',
                      )}
                    >
                      {tr(level.label)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-3">
              <span className="label mb-1.5 flex items-center gap-1.5">
                <Languages className="h-3 w-3" /> {tr('Language')}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {UI_LANGUAGES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateSettings({ language: item.id })}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-start text-[11px] font-bold transition',
                      settings.language === item.id
                        ? 'border-aurora-400/50 bg-aurora-400/10 text-aurora-200'
                        : 'border-line bg-card-2 text-muted hover:text-main',
                    )}
                  >
                    {item.label}
                    {item.id !== 'en' && item.id !== 'ar' ? (
                      <span className="ms-1 text-[8px] font-semibold uppercase text-muted-2">beta</span>
                    ) : null}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-muted-2">{tr('You can switch any time from the top bar.')}</p>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
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

            <div className="mb-2">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="label">{tr("Text size")}</span>
                <span className="text-[11px] font-bold text-aurora-300">{settings.textScale}%</span>
              </div>
              <input
                type="range"
                min={90}
                max={135}
                step={5}
                value={settings.textScale}
                onChange={(e) => updateSettings({ textScale: Number(e.target.value) })}
                className="range-jessica w-full"
              />
            </div>

            <div className="mb-2">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="label flex items-center gap-1.5">
                  <Volume2 className="h-3 w-3" /> {tr("Speaking speed")}
                </span>
                <span className="text-[11px] font-bold text-aurora-300">{settings.ttsRate.toFixed(2)}×</span>
              </div>
              <input
                type="range"
                min={0.6}
                max={1.4}
                step={0.05}
                value={settings.ttsRate}
                onChange={(e) => updateSettings({ ttsRate: Number(e.target.value) })}
                className="range-jessica w-full"
              />
            </div>

            <div className="space-y-1 border-t border-line pt-2">
              <Toggle
                checked={settings.dyslexiaFont}
                onChange={(v) => updateSettings({ dyslexiaFont: v })}
                label={tr("Dyslexia-friendly font")}
                description={tr("Atkinson Hyperlegible across the whole app.")}
                icon={<Type className="h-4 w-4" />}
              />
              <Toggle
                checked={settings.reduceMotion}
                onChange={(v) => updateSettings({ reduceMotion: v })}
                label={tr("Reduce motion")}
                description={tr("Calmer transitions for focus or sensitivity.")}
                icon={<Sparkles className="h-4 w-4" />}
              />
              <Toggle
                checked={settings.autoSpeak}
                onChange={(v) => updateSettings({ autoSpeak: v })}
                label={tr("Read tutor answers aloud")}
                description={tr("Hands-free study while you follow along.")}
                icon={<Volume2 className="h-4 w-4" />}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {/* LEVEL CARD */}
          <Card className="relative overflow-hidden p-4 sm:p-5">
            <div className="absolute inset-0 bg-[radial-gradient(400px_200px_at_20%_0%,rgba(139,92,246,.2),transparent_65%)]" />
            <div className="relative flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-aurora-400 to-violet-neon text-lg font-black text-ink-950">
                {level}
              </span>
              <div>
                <p className="font-display text-lg font-extrabold text-main">{tr("Level")} {level}</p>
                <p className="text-[11px] text-muted">{xp.toLocaleString()} {tr("total XP ·")} {completedTopics.length} {tr("chapters mastered")}</p>
              </div>
            </div>
            <ProgressBar value={xp % 300} max={300} className="relative mt-3" />
            <p className="relative mt-1 text-[10px] font-semibold text-muted">
              {300 - (xp % 300)} {tr("XP to level")} {level + 1}
            </p>
          </Card>

          {/* NOTIFICATIONS */}
          <Card className="p-4 sm:p-5">
            <div className="mb-2 flex items-center gap-2">
              <Bell className="h-4 w-4 text-sun" />
              <h2 className="text-sm font-extrabold text-main">{tr("Daily riddle reminder")}</h2>
            </div>
            <p className="text-[10px] leading-relaxed text-muted">
              {tr("At 4 PM Jessica can nudge you with the daily riddle. Because this app is fully static, reminders only fire\n              while the app is open — no background push server is involved.")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant={settings.notifications ? 'secondary' : 'primary'} onClick={enableNotifications}>
                <Bell className="h-3.5 w-3.5" />
                {settings.notifications ? tr('Reminders are on') : tr('Enable reminders')}
              </Button>
              {settings.notifications && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const riddle = riddleForDate(todayKey())
                    sendLocalNotification(tr('Daily riddle'), riddle.question).then((ok) =>
                      pushToast({
                        title: ok ? tr('Test notification sent') : tr('Notification blocked'),
                        description: ok ? tr('Check your notification centre.') : tr('Allow notifications in browser settings.'),
                        type: ok ? 'success' : 'error',
                      }),
                    )
                  }}
                >
                  {tr("Send a test")}
                </Button>
              )}
            </div>
          </Card>

          {/* INSTALL */}
          <Card className="p-4 sm:p-5">
            <div className="mb-2 flex items-center gap-2">
              {installed ? <Smartphone className="h-4 w-4 text-aurora-300" /> : <Laptop className="h-4 w-4 text-sky" />}
              <h2 className="text-sm font-extrabold text-main">{tr("Install & offline")}</h2>
            </div>
            <p className="text-[10px] leading-relaxed text-muted">
              {tr("Install Jessica for a full-screen app with an offline shell. Your books, flashcards, vault and progress are\n              stored on this device, so they keep working without a connection. AI features need internet.")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={canInstall && !installed ? 'primary' : 'secondary'}
                onClick={async () => {
                  const ok = await install()
                  if (!ok && !canInstall) {
                    pushToast({
                      title: tr("Install from your browser menu"),
                      description: tr("Use “Add to Home Screen” or the install icon in the address bar."),
                      type: 'info',
                    })
                  }
                }}
              >
                <Smartphone className="h-3.5 w-3.5" />
                {installed ? tr('Already installed') : canInstall ? tr('Install Jessica') : tr('How to install')}
              </Button>
              <span className="chip border-aurora-400/25 text-aurora-200">
                <CloudOff className="h-3 w-3" /> {tr("Offline shell")}
              </span>
            </div>
          </Card>

          {/* DATA */}
          <Card className="p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-violet-glow" />
              <h2 className="text-sm font-extrabold text-main">{tr("Your data")}</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: tr("Vault notes"), value: vault.length },
                { label: tr("Planner tasks"), value: planner.length },
                { label: tr("Flashcards"), value: cardCount === null ? '—' : cardCount },
                { label: tr("Mock exams"), value: exams.length },
                { label: tr("Books started"), value: Object.keys(bookProgress).length },
                { label: tr("Chapters mastered"), value: completedTopics.length },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-line bg-card-2 p-2.5">
                  <p className="font-display text-base font-extrabold text-main">{s.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-2">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={exportData}>
                <Download className="h-3.5 w-3.5" /> {tr("Export backup")}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} loading={busy}>
                <Upload className="h-3.5 w-3.5" /> {tr("Import backup")}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) importData(file)
                  e.target.value = ''
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                loading={fullBusy}
                onClick={async () => {
                  setFullBusy(true)
                  try {
                    const { blob, name, size } = await exportFullBackup()
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = name
                    link.click()
                    URL.revokeObjectURL(url)
                    pushToast({
                      title: tr('Full backup downloaded'),
                      description: `${(size / (1024 * 1024)).toFixed(1)} MB`,
                      type: 'success',
                    })
                  } catch (err) {
                    pushToast({
                      title: tr('Could not create the full backup'),
                      description: err instanceof Error ? err.message : tr('Try again.'),
                      type: 'error',
                    })
                  } finally {
                    setFullBusy(false)
                  }
                }}
              >
                <Download className="h-3.5 w-3.5" /> {tr('Full backup (with books)')}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => zipRef.current?.click()} loading={fullBusy}>
                <Upload className="h-3.5 w-3.5" /> {tr('Restore full backup')}
              </Button>
              <input
                ref={zipRef}
                type="file"
                accept="application/zip,.zip"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  if (!window.confirm(tr('Restore this full backup? It replaces your current data on this device.'))) return
                  setFullBusy(true)
                  try {
                    const result = await restoreFullBackup(file)
                    pushToast({
                      title: tr('Full backup restored'),
                      description: tr('{books} books and {cards} flashcards are back.', { books: result.books, cards: result.cards }),
                      type: 'success',
                    })
                    setTimeout(() => window.location.reload(), 900)
                  } catch (err) {
                    pushToast({
                      title: tr('Could not restore the full backup'),
                      description: err instanceof Error ? err.message : tr('Check the ZIP file and try again.'),
                      type: 'error',
                    })
                  } finally {
                    setFullBusy(false)
                  }
                }}
              />
            </div>
            <p className="mt-2 text-[9px] leading-relaxed text-muted-2">
              {tr("Backups include XP, streaks, notes, planner, exams and settings — never your API key. Flashcards and chat\n              history live in IndexedDB and are not part of the JSON backup.")}
            </p>
          </Card>

          {/* ABOUT */}
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-aurora-400 to-violet-neon text-sm font-black text-ink-950">
                J
              </span>
              <div>
                <p className="text-sm font-extrabold text-main">{tr("Jessica")}</p>
                <p className="text-[10px] text-muted">{tr("Version 1.0 · fully client-side PWA")}</p>
              </div>
            </div>
            <div className="mt-2 space-y-1 text-[10px] leading-relaxed text-muted">
              <p className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-aurora-300" /> {tr("BYOK — bring your own Gemini key.")}</p>
              <p className="flex items-center gap-1.5"><Lock className="h-3 w-3 text-aurora-300" /> {tr("No accounts, no tracking, no server.")}</p>
              <p className="flex items-center gap-1.5"><GraduationCap className="h-3 w-3 text-aurora-300" /> {tr("Built for Egyptian First Preparatory students.")}</p>
              {!onboarded && <p className="text-sun">{tr("Onboarding is still available from the home page.")}</p>}
            </div>
          </Card>

          {/* DANGER */}
          <Card className="border-coral/20 p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-coral" />
              <h2 className="text-sm font-extrabold text-main">{tr("Danger zone")}</h2>
            </div>
            <p className="text-[10px] leading-relaxed text-muted">
              {tr("Resetting clears XP, streaks, notes, planner, exam history, flashcards and chat threads. Your API key is\n              kept. Export a backup first if you want to return to this progress later.")}
            </p>
            {!confirmReset ? (
              <Button size="sm" variant="danger" className="mt-2" onClick={() => setConfirmReset(true)}>
                <Trash2 className="h-3.5 w-3.5" /> {tr("Reset all progress")}
              </Button>
            ) : (
              <div className="mt-2 rounded-xl border border-coral/25 bg-coral/5 p-2.5">
                <p className="text-[10px] font-bold text-coral">{tr("This cannot be undone. Are you sure?")}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="danger" onClick={doReset} loading={busy}>
                    {tr("Yes, reset everything")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                    {tr("Cancel")}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-aurora-300" />
          <div>
            <p className="text-[11px] font-bold text-main">{tr("Need a hand?")}</p>
            <p className="text-[10px] leading-relaxed text-muted">
              {tr("Open the Library to download and import official Ministry PDFs — everything is indexed on this device.")}
            </p>
          </div>
        </div>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-aurora-300 hover:underline"
        >
          {tr("Get a Gemini key")} <ChevronRight className="h-3.5 w-3.5" />
        </a>
      </Card>
    </div>
  )
}
