import type { QuizQuestion } from '@/types'

export interface AssignmentPayload {
  v: 1
  id: string
  grade?: number
  subject: string
  bookTitle: string
  unitTitle: string
  unitKey: string
  questions: QuizQuestion[]
  createdAt: number
}

export interface AssignmentResult {
  v: 1
  id: string
  name: string
  score: number
  total: number
  date: number
  answers?: (number | null)[]
}

function encodeBase64Url(str: string) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeBase64Url(str: string) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '==='.slice((padded.length + 3) % 4))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeAssignment(payload: AssignmentPayload) {
  return encodeBase64Url(JSON.stringify(payload))
}

export function decodeAssignment(code: string): AssignmentPayload | null {
  try {
    const parsed = JSON.parse(decodeBase64Url(code)) as AssignmentPayload
    if (!parsed?.questions?.length) return null
    return parsed
  } catch {
    return null
  }
}

export function encodeResult(result: AssignmentResult) {
  return encodeBase64Url(JSON.stringify(result))
}

export function decodeResult(code: string): AssignmentResult | null {
  try {
    const parsed = JSON.parse(decodeBase64Url(code)) as AssignmentResult
    if (!parsed || typeof parsed.score !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function assignmentUrl(payload: AssignmentPayload) {
  return `${window.location.origin}${window.location.pathname}#/assign?d=${encodeAssignment(payload)}`
}

export function resultUrl(result: AssignmentResult) {
  return `${window.location.origin}${window.location.pathname}#/assign?r=${encodeResult(result)}`
}
