/**
 * Small models sometimes wrap JSON in markdown or leave a trailing comma.
 * This keeps the parser honest instead of throwing away a usable reply.
 */
export function extractJson<T>(raw: string): T | null {
  if (!raw) return null
  const stripped = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()

  const candidates: string[] = [stripped]
  const firstBrace = stripped.search(/[[{]/)
  if (firstBrace > 0) candidates.push(stripped.slice(firstBrace))

  const lastBrace = Math.max(stripped.lastIndexOf('}'), stripped.lastIndexOf(']'))
  if (firstBrace >= 0 && lastBrace > firstBrace) candidates.push(stripped.slice(firstBrace, lastBrace + 1))

  for (const candidate of candidates) {
    for (const attempt of [candidate, candidate.replace(/,\s*([}\]])/g, '$1')]) {
      try {
        return JSON.parse(attempt) as T
      } catch {
        /* try the next shape */
      }
    }
  }
  return null
}
