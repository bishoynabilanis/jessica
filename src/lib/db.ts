import { openDB, type IDBPDatabase } from 'idb'
import type { ChapterText, ChatMessage, SRSCard, QuizQuestion, ExamResult } from '@/types'

const DB_NAME = 'jessica-db'
const DB_VERSION = 1
let dbPromise: Promise<IDBPDatabase> | null = null

function db() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('cards')) {
          const store = database.createObjectStore('cards', { keyPath: 'id' })
          store.createIndex('due', 'due')
          store.createIndex('bookId', 'bookId')
          store.createIndex('subject', 'subject')
        }
        if (!database.objectStoreNames.contains('kv')) {
          database.createObjectStore('kv')
        }
        if (!database.objectStoreNames.contains('quizzes')) {
          const store = database.createObjectStore('quizzes', { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt')
        }
        if (!database.objectStoreNames.contains('exams')) {
          database.createObjectStore('exams', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

/* ---------- Key/value store: chapter text, chat threads, settings cache ---------- */

export async function kvSet(key: string, value: unknown) {
  ;(await db()).put('kv', value, key)
}

export async function kvGet<T>(key: string): Promise<T | undefined> {
  return (await db()).get('kv', key) as Promise<T | undefined>
}

export async function kvDel(key: string) {
  ;(await db()).delete('kv', key)
}

export async function chapterCacheGet(bookId: string) {
  return kvGet<ChapterText>(`chapter:${bookId}`)
}

export async function chapterCacheSet(chapter: ChapterText) {
  return kvSet(`chapter:${chapter.bookId}`, chapter)
}

export async function savePdfBytes(id: string, bytes: Uint8Array) {
  return kvSet(`pdf:${id}`, bytes)
}

export async function getPdfBytes(id: string) {
  return kvGet<Uint8Array>(`pdf:${id}`)
}

export async function deletePdfBytes(id: string) {
  return kvDel(`pdf:${id}`)
}

export async function deleteChapterCache(bookId: string) {
  return kvDel(`chapter:${bookId}`)
}

export async function getChat(bookId: string) {
  return (await kvGet<ChatMessage[]>(`chat:${bookId}`)) || []
}

export async function saveChat(bookId: string, messages: ChatMessage[]) {
  // Keep the thread bounded so IndexedDB never bloats.
  const trimmed = messages.slice(-120)
  return kvSet(`chat:${bookId}`, trimmed)
}

export async function clearChat(bookId: string) {
  return kvDel(`chat:${bookId}`)
}

/* ---------- Flashcards & SRS ---------- */

export async function allCards(): Promise<SRSCard[]> {
  return (await db()).getAll('cards') as Promise<SRSCard[]>
}

export async function dueCards(now = Date.now()): Promise<SRSCard[]> {
  const cards = (await allCards()).filter((c) => c.due <= now)
  return cards.sort((a, b) => a.due - b.due)
}

export async function cardsByBook(bookId: string): Promise<SRSCard[]> {
  return (await db()).getAllFromIndex('cards', 'bookId', bookId) as Promise<SRSCard[]>
}

export async function putCard(card: SRSCard) {
  ;(await db()).put('cards', card)
}

export async function putCards(cards: SRSCard[]) {
  const database = await db()
  const tx = database.transaction('cards', 'readwrite')
  await Promise.all(cards.map((card) => tx.store.put(card)))
  await tx.done
}

export async function deleteCard(id: string) {
  ;(await db()).delete('cards', id)
}

export async function clearCards() {
  ;(await db()).clear('cards')
}

export async function countCards() {
  return (await db()).count('cards')
}

/* ---------- Quiz / exam history ---------- */

export interface StoredQuiz {
  id: string
  bookId?: string
  subject: string
  questions: QuizQuestion[]
  score?: number
  createdAt: number
}

export async function saveQuiz(quiz: StoredQuiz) {
  ;(await db()).put('quizzes', quiz)
}

export async function getQuizzes(): Promise<StoredQuiz[]> {
  const all = (await (await db()).getAll('quizzes')) as StoredQuiz[]
  return all.sort((a, b) => b.createdAt - a.createdAt).slice(0, 30)
}

export async function getExamHistory(): Promise<ExamResult[]> {
  const all = (await (await db()).getAll('exams')) as ExamResult[]
  return all.sort((a, b) => b.date - a.date)
}

export async function saveExam(result: ExamResult) {
  ;(await db()).put('exams', result)
}

export async function wipeDatabase() {
  dbPromise = null
  const { deleteDB } = await import('idb')
  await deleteDB(DB_NAME)
}
