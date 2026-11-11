export type Subject =
  | 'English'
  | 'Arabic'
  | 'German'
  | 'French'
  | 'Science'
  | 'Mathematics'
  | 'Social Studies'

export type LanguageCode = 'en' | 'ar' | 'de' | 'fr'

export interface BookUnit {
  id: string
  title: string
  startPage: number
  endPage: number
}

export interface Book {
  id: string
  title: string
  subject: Subject
  language: LanguageCode
  emoji: string
  accent: string
  term: string
  description: string
  file: string
  pageCount: number
  /** 1, 2 or 3 for the Egyptian preparatory grade. */
  grade?: 1 | 2 | 3 | 4
  /** True when the student added this PDF from their own device. */
  custom?: boolean
  /** Official catalog entry this file was imported from. */
  catalogId?: string
  /** Public ministry URL the PDF came from. */
  sourceUrl?: string
  /** File size in megabytes, when known. */
  sizeMb?: number
  /** Units/lessons detected from the PDF text. */
  units?: BookUnit[]
}

export interface BookManifest {
  version: number
  updatedAt: string
  note?: string
  books: Book[]
}

export interface PageText {
  page: number
  text: string
}

export interface ChapterText {
  bookId: string
  pages: PageText[]
  text: string
  extractedAt: number
}

export type ChatRole = 'user' | 'model'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  ts: number
  kind?: 'chat' | 'system' | 'proactive'
  sourceLabel?: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  answer: number
  explanation: string
  topic?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface PageHighlight {
  id: string
  page: number
  text: string
  color: string
  createdAt: number
}

export interface MistakeEntry {
  id: string
  question: string
  options: string[]
  answer: number
  chosen: number
  explanation: string
  topic?: string
  subject: string
  bookId?: string
  unitKey?: string
  aiExplanation?: string
  createdAt: number
}

export interface ParentTask {
  id: string
  title: string
  reward: number
  createdAt: number
  done: boolean
  doneAt?: number
}

export interface FlashcardSeed {
  front: string
  back: string
}

export interface PlanTask {
  id: string
  title: string
  detail?: string
  day: string
  minutes: number
  subject: string
  done: boolean
  xp: number
}

export interface VaultEntry {
  id: string
  title: string
  content: string
  tag: string
  bookId?: string
  createdAt: number
}

export interface ExamQuestion {
  question: string
  options: string[]
  answer: number
  explanation: string
  topic: string
}

export interface ExamResult {
  id: string
  subject: string
  score: number
  total: number
  date: number
  weakTopics: string[]
  durationSeconds: number
}

export interface PodcastLine {
  speaker: 'Nour' | 'Ziad'
  text: string
}

export interface PodcastScript {
  title: string
  lines: PodcastLine[]
}

export interface ComicPanel {
  scene: string
  dialogue: string
  caption: string
}

export interface ComicScript {
  title: string
  panels: ComicPanel[]
}

export interface RoleplayPersona {
  id: string
  name: string
  emoji: string
  tagline: string
  prompt: string
}

export interface Quest {
  id: string
  title: string
  description: string
  kind: 'quiz' | 'pages' | 'cards' | 'chat' | 'riddle' | 'study' | 'essay' | 'voice'
  target: number
  progress: number
  xp: number
  claimed: boolean
}

export interface SRSCard {
  id: string
  bookId: string
  subject: string
  front: string
  back: string
  source: string
  createdAt: number
  due: number
  interval: number
  ease: number
  reps: number
  lapses: number
  lastReviewed?: number
}

export interface DailyLogEntry {
  xp: number
  seconds: number
}

export interface Settings {
  theme: 'dark' | 'light'
  language: 'en' | 'ar'
  textScale: number
  dyslexiaFont: boolean
  reduceMotion: boolean
  ttsRate: number
  autoSpeak: boolean
  pdfDark: boolean
  kidsDailyLimit: number
  kidsReminder: string
  parentPinHash: string
  notifications: boolean
  parentPhone: string
  studentName: string
  gradeLevel: 1 | 2 | 3 | 4
  grade: string
  school: string
}

export interface BattlePayload {
  v: 1
  id: string
  subject: string
  bookId?: string
  challenger: string
  target: number
  questions: QuizQuestion[]
}

export interface Riddle {
  id: string
  subject: string
  question: string
  options: string[]
  answer: number
  explanation: string
  xp: number
}
