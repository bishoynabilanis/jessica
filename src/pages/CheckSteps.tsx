import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, CircleHelp, ListChecks, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { KeyNotice, useRequireKey } from '@/components/common/KeyNotice'
import { generateJSON } from '@/lib/gemini'
import { normalizeStepCheck, splitSteps, stepCheckPrompt, type StepCheck } from '@/lib/stepCheck'
import { useApp } from '@/store/useApp'
import { cn, friendlyError } from '@/lib/utils'
import { num, tr } from '@/i18n'

const ICON = { ok: CheckCircle2, mistake: XCircle, unclear: CircleHelp }
const TONE = {
  ok: 'border-aurora-400/30 bg-aurora-400/10 text-aurora-200',
  mistake: 'border-coral/30 bg-coral/10 text-coral',
  unclear: 'border-sun/30 bg-sun/10 text-sun',
}

export function CheckSteps() {
  const requireKey = useRequireKey()
  const { apiKey, model } = useApp()
  const [question, setQuestion] = useState('')
  const [working, setWorking] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<StepCheck | null>(null)

  const steps = splitSteps(working)
  const canCheck = question.trim().length > 2 && steps.length > 0

  const check = async () => {
    if (!canCheck || !requireKey()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const raw = await generateJSON<unknown>({
        apiKey,
        model,
        temperature: 0.2,
        system: 'You are a careful, kind teacher who marks a student\'s own working step by step. Return only JSON.',
        parts: [{ text: stepCheckPrompt(question, steps) }],
      })
      const parsed = normalizeStepCheck(raw, steps)
      if (!parsed) throw new Error(tr('Could not check this working. Try again.'))
      setResult(parsed)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Check my working')}
        title={tr('Did I solve it right?')}
        subtitle={tr('Write the question and your own steps, one per line. Jessica marks each step and gives a hint on the wrong one, without giving the answer away.')}
        icon={<ListChecks className="h-5 w-5" />}
        actions={
          <Link to="/solve">
            <Button variant="secondary" size="sm">{tr('Photo solver')}</Button>
          </Link>
        }
      />

      <KeyNotice />

      <Card className="space-y-3 p-4 sm:p-5">
        <label className="block">
          <span className="label mb-1 block">{tr('The question')}</span>
          <textarea
            data-testid="steps-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={2}
            className="field w-full text-sm"
            placeholder={tr('Example: Solve 3x + 5 = 20')}
          />
        </label>
        <label className="block">
          <span className="label mb-1 block">{tr('My steps (one per line)')}</span>
          <textarea
            data-testid="steps-working"
            value={working}
            onChange={(event) => setWorking(event.target.value)}
            rows={5}
            className="field w-full text-sm"
            placeholder={tr('Example: 3x = 20 - 5')}
          />
        </label>
        <Button data-testid="steps-check" onClick={check} loading={loading} disabled={!canCheck}>
          <ListChecks className="h-4 w-4" /> {tr('Check my working')}
        </Button>
        <p className="text-[10px] text-muted-2">
          {tr('Your working goes only to your AI provider so it can be marked. Nothing is uploaded to us.')}
        </p>
        {error && <p className="text-[11px] text-coral">{error}</p>}
      </Card>

      {result && (
        <Card data-testid="steps-result" className="space-y-2.5 p-4 sm:p-5">
          {result.summary && <p className="text-sm font-semibold text-main">{result.summary}</p>}
          {result.steps.map((item, index) => {
            const Icon = ICON[item.verdict]
            return (
              <div key={index} data-verdict={item.verdict} className={cn('flex gap-2.5 rounded-2xl border p-3', TONE[item.verdict])}>
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="break-words text-xs font-bold text-main">
                    {tr('Step {n}', { n: num(index + 1) })}: {item.step}
                  </p>
                  {item.hint && <p className="mt-0.5 text-[11px] leading-relaxed">{item.hint}</p>}
                </div>
              </div>
            )
          })}
          {result.firstMistake > 0 ? (
            <p className="text-[11px] font-bold text-coral">
              {tr('Start by fixing step {n}.', { n: num(result.firstMistake) })}
            </p>
          ) : (
            <p className="text-[11px] font-bold text-aurora-200">{tr('No wrong steps found. Nice work.')}</p>
          )}
        </Card>
      )}
    </div>
  )
}
