import { languageRule } from '@/lib/prompts'

/**
 * An explanatory board for one science question the child typed. The AI
 * (the child's own key) fills a small fixed shape; the page draws it as a
 * board with numbered boxes and arrows. Nothing is stored or uploaded to us.
 */
export interface BoardStep {
  title: string
  detail: string
}

export interface ScienceBoard {
  title: string
  steps: BoardStep[]
  keyWords: string[]
  remember: string
}

export function boardPrompt(question: string): string {
  return `You are a patient science teacher for an Egyptian preparatory student. The student asked ONE question. Explain it as a simple board: a short title, 3 to 5 numbered boxes that follow each other (cause to effect, or step by step), a few key words, and one sentence to remember.

Rules:
- Keep every box detail under 160 characters and use words a 12 year old knows.
- Only explain what the question asks. If the question is not a school science or maths idea, return {"title":"","steps":[],"keyWords":[],"remember":""}.
- If you are not sure of a fact, leave it out. Never invent numbers or names.
- ${languageRule('tutor')}

Return ONLY JSON:
{"title":"...","steps":[{"title":"2 to 4 words","detail":"..."}],"keyWords":["..."],"remember":"..."}

QUESTION:
"""${question.trim().slice(0, 400)}"""`
}

const clean = (value: unknown, max: number) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '')

/** Turn whatever the model returned into a safe board, or null when it is not usable. */
export function normalizeBoard(raw: unknown): ScienceBoard | null {
  const data = raw as { title?: unknown; steps?: unknown; keyWords?: unknown; remember?: unknown } | null
  if (!data || !Array.isArray(data.steps)) return null
  const steps = (data.steps as { title?: unknown; detail?: unknown }[])
    .map((item) => ({ title: clean(item?.title, 40), detail: clean(item?.detail, 200) }))
    .filter((item) => item.detail)
    .slice(0, 5)
  if (steps.length < 2) return null
  const keyWords = Array.isArray(data.keyWords)
    ? (data.keyWords as unknown[]).map((word) => clean(word, 30)).filter(Boolean).slice(0, 6)
    : []
  return { title: clean(data.title, 80), steps, keyWords, remember: clean(data.remember, 200) }
}

/** The board as plain sentences, for the Listen button. */
export function boardSpeech(board: ScienceBoard): string {
  return [
    board.title,
    ...board.steps.map((step, index) => `${index + 1}. ${step.title}. ${step.detail}`),
    board.remember,
  ]
    .filter(Boolean)
    .join('. ')
}
