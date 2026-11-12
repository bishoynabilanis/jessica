import { useEffect, useRef, useState } from 'react'
import {
  BookmarkPlus,
  Camera,
  CheckCircle2,
  ImagePlus,
  Lightbulb,
  Loader2,
  RefreshCw,
  ScanLine,
  Send,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { generateJSON, generateText, type Content } from '@/lib/gemini'
import { useApp, levelInfo } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import type { UiLanguage } from '@/types'

interface SolveResult {
  subject: string
  question: string
  steps: { title: string; detail: string }[]
  answer: string
  tip: string
  confidence: 'high' | 'medium' | 'low'
}

interface SimilarQuestion {
  question: string
  options: string[]
  answer: number
  explanation: string
}

const LANGUAGE_NAMES: Record<UiLanguage, string> = {
  en: 'English',
  ar: 'Egyptian Arabic (simple, friendly classroom Arabic)',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  tr: 'Turkish',
  id: 'Indonesian',
}

const MAX_EDGE = 1280

function shrinkImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve(dataUrl)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    image.onerror = () => resolve(dataUrl)
    image.src = dataUrl
  })
}

export function Solve() {
  const apiKey = useApp((s) => s.apiKey)
  const model = useApp((s) => s.model)
  const settings = useApp((s) => s.settings)
  const addVault = useApp((s) => s.addVault)
  const pushToast = useUI((s) => s.pushToast)

  const [image, setImage] = useState('')
  const [extra, setExtra] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SolveResult | null>(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [simpler, setSimpler] = useState('')
  const [simplerBusy, setSimplerBusy] = useState(false)
  const [similar, setSimilar] = useState<SimilarQuestion | null>(null)
  const [similarBusy, setSimilarBusy] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const [chat, setChat] = useState<{ role: 'user' | 'model'; text: string }[]>([])
  const [draft, setDraft] = useState('')
  const [chatBusy, setChatBusy] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOn(false)
  }

  useEffect(() => () => stopCamera(), [])

  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOn(true)
    } catch {
      setError(tr('Camera was blocked. Upload a photo instead.'))
    }
  }

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 960
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
    void shrinkImage(canvas.toDataURL('image/jpeg', 0.92)).then(setImage)
    stopCamera()
  }

  const onFile = async (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      void shrinkImage(String(reader.result || '')).then(setImage)
    }
    reader.readAsDataURL(file)
  }

  const reset = () => {
    setImage('')
    setResult(null)
    setError('')
    setSimpler('')
    setSimilar(null)
    setPicked(null)
    setChat([])
    setExtra('')
  }

  const analyse = async () => {
    if (!apiKey.trim()) {
      pushToast({ title: tr('Add your AI key first'), type: 'info' })
      return
    }
    if (!image) {
      pushToast({ title: tr('Take a photo first'), type: 'info' })
      return
    }
    setBusy(true)
    setError('')
    setResult(null)
    setSimpler('')
    setSimilar(null)
    setChat([])
    try {
      const base64 = image.split(',')[1] || ''
      const { level } = levelInfo(useApp.getState().xp)
      const data = await generateJSON<SolveResult>({
        apiKey,
        model,
        temperature: 0.2,
        maxOutputTokens: 1800,
        system:
          'You are Jessica, a patient Egyptian school tutor. You read photos of homework and explain them clearly. Return only valid JSON.',
        parts: [
          {
            text: `Read this photo carefully. It may contain a homework question, a maths problem, a diagram, a paragraph to translate, or a page from an Egyptian school book.

Student context: grade ${settings.gradeLevel}, level ${level}, ${LANGUAGE_NAMES[settings.language] || 'English'}.
${extra.trim() ? `The student adds: ${extra.trim()}` : ''}

Return ONLY JSON in this exact shape:
{"subject":"school subject","question":"the question transcribed from the photo","steps":[{"title":"short step name","detail":"what happens in this step"}],"answer":"the final answer","tip":"one short rule or tip to remember","confidence":"high|medium|low"}

Rules:
- Write everything in ${LANGUAGE_NAMES[settings.language] || 'English'}.
- 2 to 6 steps. Every detail under 240 characters.
- Be honest: if the photo is blurry or the question is incomplete, set confidence to "low" and say what is missing inside the question field.
- Never mention that you are an AI model.`,
          },
          { inlineData: { mimeType: image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg', data: base64 } },
        ],
      })
      if (!data || typeof data.answer !== 'string') throw new Error(tr('Could not read the photo. Try a sharper one.'))
      setResult({
        subject: data.subject || '',
        question: data.question || '',
        steps: Array.isArray(data.steps) ? data.steps.filter((step) => step && step.detail).slice(0, 6) : [],
        answer: data.answer,
        tip: data.tip || '',
        confidence: data.confidence === 'low' || data.confidence === 'medium' ? data.confidence : 'high',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('Could not solve this photo. Try again.'))
    } finally {
      setBusy(false)
    }
  }

  const explainSimpler = async () => {
    if (!result || !apiKey.trim()) return
    setSimplerBusy(true)
    try {
      const text = await generateText({
        apiKey,
        model,
        temperature: 0.3,
        maxOutputTokens: 500,
        system: 'You are Jessica, a kind Egyptian tutor. Explain like the student is 11 years old. Never use headings or markdown.',
        parts: [
          {
            text: `The question: ${result.question}
The answer: ${result.answer}
The steps we used: ${result.steps.map((step) => `${step.title}: ${step.detail}`).join(' | ')}

Explain the same answer again in a much simpler way, in ${LANGUAGE_NAMES[settings.language] || 'English'}.
Use 3 short sentences maximum, then one everyday example.`,
          },
        ],
      })
      setSimpler(text.trim())
    } catch (err) {
      pushToast({ title: tr('Could not simplify it'), description: err instanceof Error ? err.message : '', type: 'error' })
    } finally {
      setSimplerBusy(false)
    }
  }

  const makeSimilar = async () => {
    if (!result || !apiKey.trim()) return
    setSimilarBusy(true)
    setPicked(null)
    try {
      const data = await generateJSON<SimilarQuestion>({
        apiKey,
        model,
        temperature: 0.6,
        maxOutputTokens: 700,
        system: 'You write short practice questions for Egyptian school students. Return only valid JSON.',
        parts: [
          {
            text: `Here is a question a student just solved:
${result.question}
Answer: ${result.answer}

Write ONE new practice question that trains the same skill but changes the numbers or the example.
Return ONLY JSON:
{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"why the answer is correct, in 2 sentences"}
Rules: exactly 4 options, "answer" is the index 0-3, language: ${LANGUAGE_NAMES[settings.language] || 'English'}.`,
          },
        ],
      })
      if (!data || !Array.isArray(data.options) || data.options.length !== 4) throw new Error('bad')
      setSimilar({
        question: data.question,
        options: data.options,
        answer: Math.max(0, Math.min(3, Number(data.answer) || 0)),
        explanation: data.explanation || '',
      })
    } catch {
      pushToast({ title: tr('No similar question this time'), description: tr('Try again in a moment.'), type: 'info' })
    } finally {
      setSimilarBusy(false)
    }
  }

  const sendFollowUp = async () => {
    const message = draft.trim()
    if (!message || !result || !apiKey.trim() || chatBusy) return
    const history: Content[] = chat.map((item) => ({ role: item.role, parts: [{ text: item.text }] }))
    const next = [...chat, { role: 'user' as const, text: message }]
    setChat(next)
    setDraft('')
    setChatBusy(true)
    try {
      const reply = await generateText({
        apiKey,
        model,
        temperature: 0.4,
        maxOutputTokens: 700,
        system: `You are Jessica, a patient Egyptian school tutor. Answer in ${LANGUAGE_NAMES[settings.language] || 'English'}. Keep it under 120 words and use plain language.`,
        history,
        parts: [
          {
            text: `Context from the photo we already solved:
Question: ${result.question}
Answer: ${result.answer}

Student asks: ${message}`,
          },
        ],
      })
      setChat((current) => [...current, { role: 'model', text: reply.trim() }])
    } catch (err) {
      setChat((current) => [
        ...current,
        { role: 'model', text: err instanceof Error ? err.message : tr('Something went wrong. Try again.') },
      ])
    } finally {
      setChatBusy(false)
    }
  }

  const saveToVault = () => {
    if (!result) return
    const content = [
      result.question,
      '',
      ...result.steps.map((step, index) => `${index + 1}. ${step.title}\n${step.detail}`),
      '',
      `✅ ${result.answer}`,
      result.tip ? `\n💡 ${result.tip}` : '',
    ].join('\n')
    addVault({
      title: (result.question || result.answer).slice(0, 64),
      content,
      tag: result.subject || tr('Photo solution'),
    })
    pushToast({ title: tr('Saved to your vault'), description: tr('You can revise it any time.'), type: 'success' })
  }

  const confidenceTone =
    result?.confidence === 'high'
      ? 'border-aurora-400/30 bg-aurora-400/10 text-aurora-200'
      : result?.confidence === 'medium'
        ? 'border-sun/30 bg-sun/10 text-sun'
        : 'border-coral/30 bg-coral/10 text-coral'

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Photo solver')}
        title={tr('Snap any question and understand it')}
        subtitle={tr('A photo of a maths problem, a science diagram or a paragraph to translate — Jessica reads it, explains every step and gives you a similar question to practise.')}
        icon={<ScanLine className="h-5 w-5" />}
        actions={
          result ? (
            <Button variant="secondary" size="sm" onClick={reset}>
              <RefreshCw className="h-3.5 w-3.5" /> {tr('New photo')}
            </Button>
          ) : undefined
        }
      />

      <Card className="space-y-3 p-4 sm:p-5">
        <div>
          <p className="label mb-1.5">{tr('The photo')}</p>
          {image ? (
            <div className="relative overflow-hidden rounded-2xl border border-line">
              <img src={image} alt={tr('Your question')} className="max-h-80 w-full bg-black/40 object-contain" />
              <button
                onClick={() => {
                  setImage('')
                  setResult(null)
                }}
                className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-xl bg-app/80 text-muted"
                aria-label={tr('Remove photo')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : cameraOn ? (
            <div className="space-y-2">
              <video ref={videoRef} className="w-full rounded-2xl border border-line" muted playsInline />
              <div className="flex gap-2">
                <Button size="sm" onClick={capture}>
                  <Camera className="h-3.5 w-3.5" /> {tr('Capture')}
                </Button>
                <Button size="sm" variant="ghost" onClick={stopCamera}>
                  {tr('Cancel')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={startCamera}>
                <Camera className="h-3.5 w-3.5" /> {tr('Open camera')}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
                <ImagePlus className="h-3.5 w-3.5" /> {tr('Upload a photo')}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  void onFile(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
            </div>
          )}
        </div>

        <label className="block">
          <span className="label mb-1 block">{tr('Anything we should know? (optional)')}</span>
          <input
            value={extra}
            onChange={(event) => setExtra(event.target.value)}
            placeholder={tr('Example: the teacher wants the full steps, not just the answer')}
            className="field text-sm"
            maxLength={180}
          />
        </label>

        <Button onClick={analyse} loading={busy} disabled={!image}>
          <Sparkles className="h-4 w-4" /> {tr('Explain this photo')}
        </Button>

        {error && <p className="rounded-xl border border-coral/30 bg-coral/10 p-2.5 text-[10px] text-coral">{error}</p>}
        <p className="text-[9px] leading-relaxed text-muted-2">
          {tr('The photo goes only to your AI provider so it can read it. Nothing is uploaded to us, and nothing is stored on a server.')}
        </p>
      </Card>

      {busy && (
        <Card className="flex items-center gap-3 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-aurora-300" />
          <div>
            <p className="text-sm font-extrabold text-main">{tr('Reading your photo…')}</p>
            <p className="text-[11px] text-muted">{tr('Finding the question and building the steps.')}</p>
          </div>
        </Card>
      )}

      {result && (
        <>
          <Card className="space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              {result.subject && <span className="chip border-aurora-400/30 bg-aurora-400/10 text-aurora-200">{result.subject}</span>}
              <span className={cn('chip', confidenceTone)}>
                {result.confidence === 'high'
                  ? tr('Clear photo')
                  : result.confidence === 'medium'
                    ? tr('Partly clear')
                    : tr('Blurry — check the question')}
              </span>
              <Button variant="ghost" size="sm" className="ms-auto" onClick={saveToVault}>
                <BookmarkPlus className="h-3.5 w-3.5" /> {tr('Save')}
              </Button>
            </div>

            {result.question && (
              <div className="rounded-2xl border border-line bg-card-2 p-3">
                <p className="label mb-1">{tr('The question')}</p>
                <p className="text-sm font-bold leading-relaxed text-main" dir="auto">
                  {result.question}
                </p>
              </div>
            )}

            {result.steps.length > 0 && (
              <div className="space-y-2">
                <p className="label">{tr('Step by step')}</p>
                <ol className="space-y-2">
                  {result.steps.map((step, index) => (
                    <li key={index} className="flex gap-3 rounded-2xl border border-line bg-card-2 p-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-aurora-400/15 text-[11px] font-black text-aurora-200">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        {step.title && <p className="text-sm font-extrabold text-main">{step.title}</p>}
                        <p className="mt-0.5 text-xs leading-relaxed text-muted" dir="auto">
                          {step.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="rounded-2xl border border-aurora-400/30 bg-aurora-400/10 p-4">
              <p className="label mb-1 text-aurora-200">{tr('The answer')}</p>
              <p className="text-lg font-extrabold leading-relaxed text-main" dir="auto">
                {result.answer}
              </p>
              {result.tip && (
                <p className="mt-2 flex items-start gap-2 text-[11px] leading-relaxed text-muted" dir="auto">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sun" />
                  <span>{result.tip}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={explainSimpler} loading={simplerBusy}>
                <Wand2 className="h-3.5 w-3.5" /> {tr('Explain it simpler')}
              </Button>
              <Button variant="secondary" size="sm" onClick={makeSimilar} loading={similarBusy}>
                <RefreshCw className="h-3.5 w-3.5" /> {tr('Give me a similar question')}
              </Button>
            </div>

            {simpler && (
              <div className="rounded-2xl border border-violet-400/30 bg-violet-400/10 p-3">
                <p className="label mb-1 text-violet-200">{tr('In simple words')}</p>
                <p className="text-xs leading-relaxed text-main" dir="auto">
                  {simpler}
                </p>
              </div>
            )}
          </Card>

          {similar && (
            <Card className="space-y-3 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-extrabold text-main">{tr('Try one like it')}</p>
                <span className="chip">{tr('Practice')}</span>
              </div>
              <p className="text-sm font-bold leading-relaxed text-main" dir="auto">
                {similar.question}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {similar.options.map((option, index) => {
                  const revealed = picked !== null
                  const correct = index === similar.answer
                  return (
                    <button
                      key={index}
                      onClick={() => setPicked(index)}
                      disabled={revealed}
                      className={cn(
                        'flex items-center gap-2 rounded-2xl border p-3 text-start text-xs font-bold transition',
                        revealed && correct
                          ? 'border-aurora-400/50 bg-aurora-400/10 text-aurora-100'
                          : revealed && index === picked
                            ? 'border-coral/50 bg-coral/10 text-coral'
                            : 'border-line bg-card-2 text-muted hover:text-main',
                      )}
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-[10px]">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span dir="auto">{option}</span>
                      {revealed && correct && <CheckCircle2 className="ms-auto h-4 w-4 shrink-0" />}
                    </button>
                  )
                })}
              </div>
              {picked !== null && (
                <p className="rounded-xl border border-line bg-card-2 p-3 text-[11px] leading-relaxed text-muted" dir="auto">
                  {picked === similar.answer ? `${tr('Correct!')} ` : `${tr('Not quite.')} `}
                  {similar.explanation}
                </p>
              )}
            </Card>
          )}

          <Card className="space-y-3 p-4 sm:p-5">
            <p className="text-sm font-extrabold text-main">{tr('Ask a follow-up')}</p>
            {chat.length === 0 && <p className="text-[11px] text-muted">{tr('Confused about a step? Ask about it in your own words.')}</p>}
            {chat.length > 0 && (
              <div className="space-y-2">
                {chat.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      'max-w-[92%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
                      item.role === 'user'
                        ? 'ms-auto bg-aurora-400/15 text-main'
                        : 'border border-line bg-card-2 text-muted',
                    )}
                    dir="auto"
                  >
                    {item.text}
                  </div>
                ))}
                {chatBusy && <Loader2 className="h-4 w-4 animate-spin text-aurora-300" />}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void sendFollowUp()
                }}
                placeholder={tr('Why did we divide by 2?')}
                className="field flex-1 text-sm"
                maxLength={240}
              />
              <Button size="icon" onClick={sendFollowUp} disabled={!draft.trim() || chatBusy} aria-label={tr('Send')}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
