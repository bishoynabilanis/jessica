import { useEffect, useRef, useState } from 'react'
import { Camera, Check, ImagePlus, Loader2, ScanLine, Sparkles, X } from 'lucide-react'
import type { QuizQuestion } from '@/types'
import { getQuizzes } from '@/lib/db'
import type { StoredQuiz } from '@/lib/db'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { generateJSON } from '@/lib/gemini'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { tr } from '@/i18n'

type Source = 'bank' | 'manual'

export function BubbleSheet() {
  const apiKey = useApp((s) => s.apiKey)
  const model = useApp((s) => s.model)
  const addMistake = useApp((s) => s.addMistake)
  const pushToast = useUI((s) => s.pushToast)

  const [banks, setBanks] = useState<StoredQuiz[]>([])
  const [bankId, setBankId] = useState('')
  const [source, setSource] = useState<Source>('manual')
  const [manualKey, setManualKey] = useState('')
  const [image, setImage] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ score: number; total: number; wrong: number[]; answers: (string | null)[] } | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getQuizzes()
      .then((list) => {
        setBanks(list)
        if (list[0]) {
          setBankId(list[0].id)
          setSource('bank')
        }
      })
      .catch(() => undefined)
  }, [])

  const bank = banks.find((item) => item.id === bankId)
  const key: string[] = source === 'bank' && bank
    ? bank.questions.map((question) => String.fromCharCode(65 + question.answer))
    : manualKey.toUpperCase().replace(/[^A-D]/g, '').split('')

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
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1600 }, height: { ideal: 1200 } },
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
    setImage(canvas.toDataURL('image/jpeg', 0.88))
    stopCamera()
  }

  const onFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  const check = async () => {
    if (!apiKey.trim()) {
      pushToast({ title: tr('Add your AI key first'), type: 'info' })
      return
    }
    if (!key.length) {
      pushToast({ title: tr('Add the answer key first'), type: 'info' })
      return
    }
    if (!image) {
      pushToast({ title: tr('Take a photo of the sheet first'), type: 'info' })
      return
    }
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const base64 = image.split(',')[1] || ''
      const data = await generateJSON<{ answers: (string | null)[] }>({
        apiKey,
        model,
        temperature: 0,
        maxOutputTokens: 900,
        system: 'You read photographed multiple-choice bubble sheets. Return only JSON. Never guess: use null when a bubble is unclear.',
        parts: [
          {
            text: `This is a bubble sheet with ${key.length} questions. Options are A, B, C and D (or أ ب ج د). Read the filled bubble for each question in order.
Return ONLY JSON: {"answers":["A","B",null,...]}
The array must contain exactly ${key.length} entries.`,
          },
          { inlineData: { mimeType: image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg', data: base64 } },
        ],
      })
      const normalize = (value: unknown) => {
        if (typeof value !== 'string') return null
        const letter = value.trim().toUpperCase()
        const map: Record<string, string> = { أ: 'A', ب: 'B', ج: 'C', د: 'D' }
        const resolved = map[letter] || letter
        return /^[A-D]$/.test(resolved) ? resolved : null
      }
      const answers = Array.from({ length: key.length }, (_, index) => normalize(data.answers?.[index]))
      const wrong: number[] = []
      let score = 0
      answers.forEach((answer, index) => {
        if (answer === key[index]) score += 1
        else wrong.push(index)
      })
      setResult({ score, total: key.length, wrong, answers })

      if (source === 'bank' && bank) {
        wrong.forEach((index) => {
          const question: QuizQuestion | undefined = bank.questions[index]
          if (!question) return
          addMistake({
            question: question.question,
            options: question.options,
            answer: question.answer,
            chosen: answers[index] ? answers[index]!.charCodeAt(0) - 65 : -1,
            explanation: question.explanation || '',
            topic: question.topic,
            subject: bank.subject,
            bookId: bank.bookId,
            unitKey: bank.id,
          })
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('Could not read the sheet. Try a clearer photo.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Bubble sheet scanner')}
        title={tr('Correct a paper answer sheet')}
        subtitle={tr('Photograph the bubble sheet and Jessica marks it instantly, shows every wrong answer and saves them to your mistakes.')}
        icon={<ScanLine className="h-5 w-5" />}
      />

      <Card className="space-y-3 p-4 sm:p-5">
        <div>
          <p className="label mb-1.5">{tr('Answer key from')}</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSource('bank')}
              disabled={!banks.length}
              className={cn(
                'rounded-xl border px-3 py-2 text-[11px] font-bold transition disabled:opacity-40',
                source === 'bank' ? 'border-aurora-400/50 bg-aurora-400/10 text-aurora-200' : 'border-line bg-card-2 text-muted',
              )}
            >
              {tr('Saved quiz bank')}
            </button>
            <button
              onClick={() => setSource('manual')}
              className={cn(
                'rounded-xl border px-3 py-2 text-[11px] font-bold transition',
                source === 'manual' ? 'border-aurora-400/50 bg-aurora-400/10 text-aurora-200' : 'border-line bg-card-2 text-muted',
              )}
            >
              {tr('Type the key')}
            </button>
          </div>
        </div>

        {source === 'bank' ? (
          <label className="block">
            <span className="label mb-1 block">{tr('Question bank')}</span>
            <select value={bankId} onChange={(event) => setBankId(event.target.value)} className="field text-sm">
              {banks.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.subject} — {item.id} ({item.questions.length})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-muted-2">{tr('{n} questions in this bank', { n: key.length })}</p>
          </label>
        ) : (
          <label className="block">
            <span className="label mb-1 block">{tr('Answer key')}</span>
            <input
              value={manualKey}
              onChange={(event) => setManualKey(event.target.value)}
              placeholder="ABCDABCDAB"
              dir="ltr"
              className="field font-mono text-sm"
            />
            <p className="mt-1 text-[10px] text-muted-2">
              {tr('Letters A–D in order. {n} answers detected.', { n: key.length })}
            </p>
          </label>
        )}

        <div>
          <p className="label mb-1.5">{tr('The sheet photo')}</p>
          {image ? (
            <div className="relative overflow-hidden rounded-2xl border border-line">
              <img src={image} alt={tr('Answer sheet')} className="max-h-72 w-full object-contain bg-black/40" />
              <button
                onClick={() => setImage('')}
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
                  onFile(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
            </div>
          )}
        </div>

        <Button onClick={check} loading={busy} disabled={!key.length || !image}>
          <Sparkles className="h-4 w-4" /> {tr('Check the sheet')}
        </Button>

        {error && <p className="rounded-xl border border-coral/30 bg-coral/10 p-2.5 text-[10px] text-coral">{error}</p>}
        <p className="text-[9px] leading-relaxed text-muted-2">
          {tr('The photo is sent only to your AI provider for reading. It is not stored on any server.')}
        </p>
      </Card>

      {result && (
        <Card className="space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-2">{tr('Result')}</p>
              <p className="font-display text-3xl font-extrabold text-main">
                {result.score}/{result.total}
                <span className="ms-2 text-base text-muted">{Math.round((result.score / result.total) * 100)}%</span>
              </p>
            </div>
            <span
              className={cn(
                'chip',
                result.score / result.total >= 0.5
                  ? 'border-aurora-400/30 bg-aurora-400/10 text-aurora-200'
                  : 'border-coral/30 bg-coral/10 text-coral',
              )}
            >
              {result.score / result.total >= 0.5 ? tr('Passed') : tr('Needs revision')}
            </span>
          </div>

          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12">
            {result.answers.map((answer, index) => {
              const correct = answer === key[index]
              return (
                <span
                  key={index}
                  title={`${tr('Question')} ${index + 1}: ${answer ?? '—'} / ${key[index]}`}
                  className={cn(
                    'grid h-8 place-items-center rounded-lg border text-[10px] font-black',
                    correct
                      ? 'border-aurora-400/30 bg-aurora-400/10 text-aurora-200'
                      : 'border-coral/30 bg-coral/10 text-coral',
                  )}
                >
                  {index + 1}
                </span>
              )
            })}
          </div>

          {result.wrong.length > 0 ? (
            <div>
              <p className="mb-1.5 text-[11px] font-bold text-main">{tr('Wrong answers')}</p>
              <div className="space-y-1.5">
                {result.wrong.slice(0, 10).map((index) => (
                  <div key={index} className="rounded-xl border border-coral/20 bg-coral/5 p-2.5 text-[10px] leading-relaxed">
                    <span className="font-bold text-coral">
                      {tr('Q{n}', { n: index + 1 })}
                    </span>{' '}
                    <span className="text-muted">
                      {tr('Your answer: {answer} · Correct: {correct}', {
                        answer: result.answers[index] ?? '—',
                        correct: key[index],
                      })}
                    </span>
                    {source === 'bank' && bank?.questions[index] && (
                      <p className="mt-1 text-[10px] text-main" dir="auto">
                        {bank.questions[index].question}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {source === 'bank' && result.wrong.length > 0 && (
                <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-aurora-200">
                  <Check className="h-3 w-3" /> {tr('Added to your mistake notebook')}
                </p>
              )}
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-aurora-200">
              <Check className="h-4 w-4" /> {tr('Perfect sheet — every answer is correct.')}
            </p>
          )}
        </Card>
      )}

      {busy && (
        <div className="flex items-center justify-center gap-2 py-4 text-[11px] font-bold text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> {tr('Reading your sheet…')}
        </div>
      )}
    </div>
  )
}
