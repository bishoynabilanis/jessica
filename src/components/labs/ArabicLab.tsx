import { useState } from 'react'
import { Check } from 'lucide-react'
import { tr } from '@/i18n'
import { cn } from '@/lib/utils'
import { LabChallenge, LabFrame } from './LabControls'
import { LabGuide } from './LabGuide'

type Word = { text: string; role: string }
type Sentence = { words: Word[]; type: 'nominal' | 'verbal' }

const SENTENCES: Sentence[] = [
  {
    type: 'nominal',
    words: [
      { text: 'الطالبُ', role: 'Subject (مبتدأ)' },
      { text: 'يقرأُ', role: 'Verb (فعل)' },
      { text: 'الدرسَ', role: 'Object (مفعول به)' },
    ],
  },
  {
    type: 'verbal',
    words: [
      { text: 'يقرأُ', role: 'Verb (فعل)' },
      { text: 'الطالبُ', role: 'Doer (فاعل)' },
      { text: 'الدرسَ', role: 'Object (مفعول به)' },
    ],
  },
  {
    type: 'nominal',
    words: [
      { text: 'الشمسُ', role: 'Subject (مبتدأ)' },
      { text: 'مشرقةٌ', role: 'Predicate (خبر)' },
    ],
  },
  {
    type: 'verbal',
    words: [
      { text: 'لعبَ', role: 'Verb (فعل)' },
      { text: 'الأطفالُ', role: 'Doer (فاعل)' },
      { text: 'في الحديقةِ', role: 'Prepositional phrase (جار ومجرور)' },
    ],
  },
  {
    type: 'nominal',
    words: [
      { text: 'المعلمةُ', role: 'Subject (مبتدأ)' },
      { text: 'شرحتْ', role: 'Verb (فعل)' },
      { text: 'الدرسَ', role: 'Object (مفعول به)' },
    ],
  },
  {
    type: 'verbal',
    words: [
      { text: 'تفتّحتِ', role: 'Verb (فعل)' },
      { text: 'الأزهارُ', role: 'Doer (فاعل)' },
    ],
  },
]

export function ArabicLab({ onInteract }: { onInteract: () => void }) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState<number | null>(null)
  const [answer, setAnswer] = useState<'nominal' | 'verbal' | null>(null)
  const [solved, setSolved] = useState<string[]>([])
  const sentence = SENTENCES[index]

  const choose = (value: 'nominal' | 'verbal') => {
    onInteract()
    setAnswer(value)
    if (value === sentence.type) {
      setSolved((current) => (current.includes(`${index}`) ? current : [...current, `${index}`]))
    }
  }

  const go = (next: number) => {
    onInteract()
    setIndex(next)
    setAnswer(null)
    setRevealed(null)
  }

  return (
    <>
      <LabFrame
        header={
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label mb-1 text-sun">{tr('Arabic lab')}</p>
              <h2 className="font-display text-lg font-extrabold text-main">{tr('Dissect the sentence')}</h2>
            </div>
            <span className="rounded-full bg-sun/15 px-2.5 py-1 text-[10px] font-extrabold text-sun" data-testid="arabic-progress">
              {solved.length} / 3
            </span>
          </div>
        }
        visual={
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-ink-950 p-4">
              <p className="mb-3 text-center text-[10px] font-bold text-muted-2">{tr('Tap a word to see its job in the sentence.')}</p>
              <div className="flex flex-wrap justify-center gap-2" dir="rtl">
                {sentence.words.map((word, position) => (
                  <button
                    key={`${word.text}-${position}`}
                    onClick={() => { onInteract(); setRevealed(position) }}
                    data-testid={`arabic-word-${position}`}
                    className={cn(
                      'rounded-xl border px-3 py-2 font-display text-lg font-extrabold transition',
                      revealed === position
                        ? 'border-aurora-400/60 bg-aurora-400/15 text-aurora-200'
                        : 'border-line bg-card-2 text-main hover:border-aurora-400/40',
                    )}
                  >
                    {word.text}
                  </button>
                ))}
              </div>
              <p className="mt-3 min-h-[22px] text-center text-[11px] font-bold text-muted" data-testid="arabic-role">
                {revealed === null ? tr('Choose a word') : tr(sentence.words[revealed].role)}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card-2 p-3 text-[10px] leading-relaxed text-muted">
              {tr('A nominal sentence starts with a noun. A verbal sentence starts with a verb.')}
              <br />
              {tr('Click any word above, then decide which type this sentence is.')}
            </div>
          </div>
        }
        controls={
          <>
            <p className="text-[11px] font-bold text-muted-2">{tr('What type is this sentence?')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => choose('nominal')}
                data-testid="arabic-nominal"
                className={cn(
                  'flex-1 rounded-xl border px-3 py-2 text-[11px] font-extrabold transition',
                  answer === 'nominal' ? 'border-aurora-400/50 bg-aurora-400/10 text-aurora-200' : 'border-line bg-card-2 text-muted hover:text-main',
                )}
              >
                {tr('Nominal (اسمية)')}
              </button>
              <button
                onClick={() => choose('verbal')}
                data-testid="arabic-verbal"
                className={cn(
                  'flex-1 rounded-xl border px-3 py-2 text-[11px] font-extrabold transition',
                  answer === 'verbal' ? 'border-aurora-400/50 bg-aurora-400/10 text-aurora-200' : 'border-line bg-card-2 text-muted hover:text-main',
                )}
              >
                {tr('Verbal (فعلية)')}
              </button>
            </div>
            {answer && (
              <p
                className={cn(
                  'rounded-xl border px-3 py-2 text-[11px] font-bold leading-relaxed',
                  answer === sentence.type ? 'border-aurora-400/40 bg-aurora-400/10 text-aurora-200' : 'border-coral/40 bg-coral/10 text-coral',
                )}
                data-testid="arabic-feedback"
              >
                {answer === sentence.type
                  ? tr('Correct — it starts with a {kind}.', { kind: sentence.type === 'nominal' ? tr('noun') : tr('verb') })
                  : tr('Not quite — look at the first word again.')}
              </p>
            )}
            <div className="flex gap-2">
              {SENTENCES.map((item, position) => (
                <button
                  key={position}
                  onClick={() => go(position)}
                  data-testid={`arabic-sentence-${position}`}
                  aria-label={tr('Sentence {n}', { n: position + 1 })}
                  className={cn(
                    'grid h-8 flex-1 place-items-center rounded-lg border text-[10px] font-extrabold',
                    position === index ? 'border-sun/50 bg-sun/15 text-sun' : 'border-line bg-card-2 text-muted',
                  )}
                >
                  {solved.includes(`${position}`) ? <Check className="h-3.5 w-3.5" /> : position + 1}
                </button>
              ))}
            </div>
            <LabChallenge done={solved.length >= 3}>{tr('Classify three sentences correctly.')}</LabChallenge>
          </>
        }
      />
      <LabGuide
        goal={tr('Recognise the two Arabic sentence types and the job of each word.')}
        question={tr('“كتبَ الطالبُ الدرسَ” — what type is it?')}
        options={[tr('Nominal (اسمية)'), tr('Verbal (فعلية)'), tr('Neither')]}
        correct={1}
        explanation={tr('It begins with the verb كتبَ, so it is a verbal sentence: verb, doer, object.')}
      />
    </>
  )
}
