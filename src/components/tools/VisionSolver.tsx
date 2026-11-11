import { useEffect, useRef, useState } from 'react'
import {
  Bookmark,
  Camera,
  CameraOff,
  Image as ImageIcon,
  RefreshCw,
  ScanLine,
  Sparkles,
  Upload,
  Volume2,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Card'
import { Markdown } from '@/components/Markdown'
import { useRequireKey } from '@/components/common/KeyNotice'
import { generateText } from '@/lib/gemini'
import { visionInstruction } from '@/lib/prompts'
import { useApp } from '@/store/useApp'
import { useUI } from '@/store/useUI'
import { useSpeech, speakable } from '@/lib/speech'
import { cn, friendlyError } from '@/lib/utils'
import { tr } from '@/i18n'

export function VisionSolverModal({
  open,
  onClose,
  bookTitle,
}: {
  open: boolean
  onClose: () => void
  bookTitle?: string
}) {
  const requireKey = useRequireKey()
  const { apiKey, model, addXP, addVault, settings } = useApp()
  const pushToast = useUI((s) => s.pushToast)
  const { speak } = useSpeech()
  const [mode, setMode] = useState<'camera' | 'upload'>('camera')
  const [cameraOn, setCameraOn] = useState(false)
  const [image, setImage] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraOn(false)
  }

  useEffect(() => {
    if (!open) {
      stopCamera()
      setImage('')
      setAnswer('')
      setError('')
      setNote('')
      setMode('camera')
    }
    return () => stopCamera()
  }, [open])

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
    } catch (err) {
      setError('Camera access was blocked. You can upload a photo instead.')
      setMode('upload')
    }
  }

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 960
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.86)
    setImage(dataUrl)
    stopCamera()
  }

  const onFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  const solve = async () => {
    if (!requireKey()) return
    if (!image) {
      pushToast({ title: tr("Take a photo first"), type: 'info' })
      return
    }
    setLoading(true)
    setError('')
    setAnswer('')
    try {
      const base64 = image.split(',')[1] || ''
      const text = await generateText({
        apiKey,
        model,
        system: 'You are Jessica Vision, a patient step-by-step solver for Egyptian First Preparatory students. Use LaTeX for all math. Never guess unreadable text.',
        parts: [
          { text: `${visionInstruction()}\n\n${note ? `Student note: ${note}` : ''}\n${bookTitle ? `The student is currently studying: ${bookTitle}.` : ''}` },
          { inlineData: { mimeType: image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg', data: base64 } },
        ],
        temperature: 0.35,
        maxOutputTokens: 2200,
      })
      setAnswer(text)
      addXP(15, true)
      if (settings.autoSpeak) speak(speakable(text), 'en', { rate: settings.ttsRate })
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tr("Vision AI solver")}
      subtitle={tr("Photograph any textbook question — even El-Moasser — and get a step-by-step solution.")}
      icon={<ScanLine className="h-4.5 w-4.5" />}
      size="lg"
      footer={
        answer ? (
          <div className={"flex flex-wrap items-center justify-between gap-2"}>
            <p className={"text-[10px] text-muted-2"}>{tr("Photo processed with Gemini 1.5 Flash Vision · nothing stored")}</p>
            <div className={"flex gap-2"}>
              <Button
                size={"sm"}
                variant={"secondary"}
                onClick={() =>
                  addVault({ title: tr("Vision solution"), content: answer, tag: tr("Vision solution"), bookId: undefined })
                }
              >
                <Bookmark className={"h-3.5 w-3.5"} /> {tr("Save")}
              </Button>
              <Button size={"sm"} onClick={() => speak(speakable(answer), 'en')}>
                <Volume2 className={"h-3.5 w-3.5"} /> {tr("Read aloud")}
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setMode('camera'); stopCamera() }}
            className={cn('flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition', mode === 'camera' ? 'border-aurora-400/40 bg-aurora-400/10 text-aurora-200' : 'border-line bg-card-2 text-muted')}
          >
            <Camera className="h-4 w-4" /> {tr("Camera")}
          </button>
          <button
            onClick={() => { setMode('upload'); stopCamera() }}
            className={cn('flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition', mode === 'upload' ? 'border-aurora-400/40 bg-aurora-400/10 text-aurora-200' : 'border-line bg-card-2 text-muted')}
          >
            <Upload className="h-4 w-4" /> {tr("Upload photo")}
          </button>
        </div>

        {!image && mode === 'camera' && (
          <div className="relative overflow-hidden rounded-2xl border border-line bg-ink-950">
            <video ref={videoRef} playsInline muted className={cn('aspect-[4/3] w-full object-cover', !cameraOn && 'opacity-30')} />
            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-white">
                  <Camera className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{tr("Point at the question")}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{tr("Good light · keep the full question in frame")}</p>
                </div>
                <Button size="sm" onClick={startCamera}>
                  <Camera className="h-3.5 w-3.5" /> {tr("Start camera")}
                </Button>
              </div>
            )}
            {cameraOn && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-ink-950/90 to-transparent p-3">
                <Button size="sm" onClick={capture}>
                  <Camera className="h-3.5 w-3.5" /> {tr("Capture question")}
                </Button>
                <Button size="sm" variant="secondary" onClick={stopCamera}>
                  <CameraOff className="h-3.5 w-3.5" /> {tr("Stop")}
                </Button>
              </div>
            )}
          </div>
        )}

        {!image && mode === 'upload' && (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong bg-card-2 px-4 py-12 text-center transition hover:bg-white/5"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-aurora-400/10 text-aurora-300">
              <ImageIcon className="h-7 w-7" />
            </span>
            <p className="text-sm font-bold text-main">{tr("Choose a photo of the question")}</p>
            <p className="text-[10px] text-muted">{tr("JPG or PNG · your image never leaves this request")}</p>
          </button>
        )}

        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />

        {image && (
          <div className="relative overflow-hidden rounded-2xl border border-line bg-ink-950">
            <img src={image} alt={tr("Question preview")} className="max-h-72 w-full object-contain" />
            <div className="absolute right-2 top-2 flex gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => { setImage(''); setAnswer(''); }}>
                <RefreshCw className="h-3.5 w-3.5" /> {tr("Retake")}
              </Button>
            </div>
          </div>
        )}

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={tr("Optional: what exactly do you need? (e.g. solve question 3 only)")}
          className="field text-xs"
        />

        <div className="flex justify-end">
          <Button onClick={solve} loading={loading} disabled={!image}>
            <Sparkles className="h-4 w-4" /> {tr("Solve step by step")}
          </Button>
        </div>

        {loading && <Spinner label={tr("Reading the question with vision…")} />}
        {error && <p className="rounded-xl border border-coral/30 bg-coral/10 p-2.5 text-[11px] text-coral">{error}</p>}

        {answer && (
          <div className="rounded-2xl border border-line bg-card-2 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-aurora-400/15 text-aurora-300">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <p className="text-xs font-extrabold text-main">{tr("Step-by-step solution")}</p>
            </div>
            <Markdown>{answer}</Markdown>
          </div>
        )}
      </div>
    </Modal>
  )
}
