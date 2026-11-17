import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { useSpeech } from '@/lib/speech'
import { LabChallenge, LabFrame, LabStat } from './LabControls'

const WORDS = [
  { word: 'Hello', meaning: 'مرحبًا', emoji: '👋', hint: 'تحية عند اللقاء' },
  { word: 'Book', meaning: 'كتاب', emoji: '📖', hint: 'حاجة بنقرأ منها' },
  { word: 'School', meaning: 'مدرسة', emoji: '🏫', hint: 'مكان التعلم' },
  { word: 'Friend', meaning: 'صديق', emoji: '🤝', hint: 'شخص بتحبه وبتلعب معاه' },
  { word: 'Teacher', meaning: 'مدرس', emoji: '🧑‍🏫', hint: 'اللي بيشرح الدرس' },
  { word: 'Water', meaning: 'ماء', emoji: '💧', hint: 'بنشربه كل يوم' },
]

export function EnglishLab({ onInteract }: { onInteract: () => void }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const { speak } = useSpeech()

  const current = WORDS[index]
  const others = WORDS.filter((_, i) => i !== index).map((item) => item.meaning)
  const options = [others[0], others[2] || others[1]]
  options.splice(index % 3, 0, current.meaning)
  const correct = picked === current.meaning

  const choose = (option: string) => {
    if (picked) return
    onInteract()
    setPicked(option)
    if (option === current.meaning) setScore((value) => value + 1)
  }

  const next = () => {
    if (!picked) return
    onInteract()
    if (index + 1 >= WORDS.length) {
      setDone(true)
      return
    }
    setIndex(index + 1)
    setPicked(null)
  }

  const restart = () => {
    onInteract()
    setIndex(0)
    setPicked(null)
    setScore(0)
    setDone(false)
  }

  const replay = () => {
    speak(current.word, 'en')
  }

  return (
    <LabFrame
      header={
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="label mb-1 text-sky">{tr('English lab')}</p>
            <h2 className="font-display text-lg font-extrabold text-main">{tr('Hear it, then choose the meaning')}</h2>
          </div>
          <span className="rounded-full bg-sky/15 px-2.5 py-1 text-[10px] font-extrabold text-sky" data-testid="english-progress">
            {done ? `${score}/${WORDS.length}` : `${index + 1}/${WORDS.length}`}
          </span>
        </div>
      }
      visual={
        done ? (
          <div className="rounded-2xl border border-aurora-400/30 bg-aurora-400/5 p-6 text-center" data-testid="english-result">
            <p className="text-4xl">{score >= 4 ? '🏆' : '💪'}</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-main">
              {score} / {WORDS.length}
            </p>
            <p className="text-[11px] text-muted">{score >= 4 ? tr('Great job — the words are sticking.') : tr('Try again and say each word out loud.')}</p>
            <button onClick={restart} className="mt-3 rounded-xl border border-line bg-card-2 px-4 py-1.5 text-[11px] font-extrabold text-main">
              {tr('Try again')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-ink-950 p-5 text-center">
              <p className="text-5xl">{current.emoji}</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-main" dir="ltr" data-testid="english-word">
                {current.word}
              </p>
              <button
                onClick={replay}
                className="mx-auto mt-2 flex items-center gap-1.5 rounded-full border border-sky/30 bg-sky/10 px-3 py-1 text-[10px] font-bold text-sky"
                data-testid="english-hear"
              >
                <Volume2 className="h-3 w-3" /> {tr('Hear the word')}
              </button>
            </div>
            <div className="grid gap-2">
              {options.map((option) => {
                const isCorrect = option === current.meaning
                const isPicked = picked === option
                return (
                  <button
                    key={option}
                    onClick={() => choose(option)}
                    data-testid="english-option"
                    className={cn(
                      'rounded-xl border px-4 py-2.5 text-sm font-extrabold transition',
                      !picked && 'border-line bg-card-2 text-main hover:border-sky/40',
                      picked && isCorrect && 'border-aurora-400/50 bg-aurora-400/10 text-aurora-200',
                      picked && isPicked && !isCorrect && 'border-coral/40 bg-coral/10 text-coral',
                      picked && !isCorrect && !isPicked && 'border-line bg-card-2 text-muted opacity-60',
                    )}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            {picked && (
              <p className={cn('text-center text-[11px] font-bold', correct ? 'text-aurora-200' : 'text-coral')} data-testid="english-feedback">
                {correct ? tr('Correct') : `${tr('The answer is')}: ${current.meaning}`} · {current.hint}
              </p>
            )}
          </div>
        )
      }
      controls={
        <>
          <div className="grid grid-cols-2 gap-2">
            <LabStat label={tr('Score')} value={`${score}/${WORDS.length}`} testid="english-score" />
            <LabStat label={tr('Word')} value={`${index + 1}`} />
          </div>
          {!done && (
            <button
              onClick={next}
              disabled={!picked}
              data-testid="english-next"
              className="w-full rounded-xl border border-sky/40 bg-sky/10 px-3 py-2 text-[11px] font-extrabold text-sky disabled:opacity-40"
            >
              {index + 1 >= WORDS.length ? tr('See the score') : tr('Next word')} ←
            </button>
          )}
          <p className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
            {tr('Listen, say the word out loud, then pick the Arabic meaning.')}
          </p>
          <LabChallenge done={done && score >= 4}>{tr('Get at least four words right.')}</LabChallenge>
        </>
      }
    />
  )
}
