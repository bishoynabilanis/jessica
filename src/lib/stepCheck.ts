import { languageRule } from '@/lib/prompts'

export type StepVerdict = 'ok' | 'mistake' | 'unclear'

export interface CheckedStep {
  step: string
  verdict: StepVerdict
  hint: string
}

export interface StepCheck {
  steps: CheckedStep[]
  summary: string
  /** 1-based number of the first wrong step, or 0 when none is wrong. */
  firstMistake: number
  finalAnswerOk: boolean | null
}

/** One working step per non-empty line. Capped so a pasted page cannot flood the prompt. */
export function splitSteps(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:\d+|[٠-٩]+)[.)\-:]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 20)
}

export function stepCheckPrompt(question: string, steps: string[]): string {
  const numbered = steps.map((step, index) => `${index + 1}. ${step}`).join('\n')
  return `You are a patient maths and science teacher for an Egyptian preparatory student. The student wrote their OWN working for a question. Mark each step.

Rules:
- Judge every step on its own: "ok" if it follows correctly from the step before, "mistake" if it does not, "unclear" if you cannot tell.
- For a mistake, give a short hint that points at the error. Do NOT write the corrected step and do NOT reveal the final answer.
- For an ok step, hint is a very short encouragement (3 to 6 words) or empty.
- Never invent a mistake. If every step is right, say so.
- ${languageRule('tutor')}

Return ONLY JSON:
{"steps":[{"verdict":"ok | mistake | unclear","hint":"..."}],"summary":"1 or 2 warm sentences","finalAnswerOk":true}
"steps" must have exactly ${steps.length} items, in the same order. "finalAnswerOk" is null when the student did not reach a final answer.

QUESTION:
"""${question.trim()}"""

STUDENT WORKING:
"""
${numbered}
"""`
}

/** Turn whatever the model returned into a safe result, or null when it is not usable. */
export function normalizeStepCheck(raw: unknown, steps: string[]): StepCheck | null {
  const data = raw as { steps?: unknown; summary?: unknown; finalAnswerOk?: unknown } | null
  if (!data || !Array.isArray(data.steps) || data.steps.length === 0) return null
  const checked: CheckedStep[] = steps.map((step, index) => {
    const item = (data.steps as { verdict?: unknown; hint?: unknown }[])[index]
    const verdict: StepVerdict = item?.verdict === 'ok' || item?.verdict === 'mistake' ? item.verdict : 'unclear'
    const hint = typeof item?.hint === 'string' ? item.hint.trim().slice(0, 300) : ''
    return { step, verdict, hint }
  })
  const first = checked.findIndex((item) => item.verdict === 'mistake')
  return {
    steps: checked,
    summary: typeof data.summary === 'string' ? data.summary.trim().slice(0, 400) : '',
    firstMistake: first + 1,
    finalAnswerOk: typeof data.finalAnswerOk === 'boolean' ? data.finalAnswerOk : null,
  }
}
