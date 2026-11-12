import { create } from 'zustand'
import { getLanguage, dateLocale } from '@/i18n'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  AiProvider,
  Book,
  DailyLogEntry,
  ParentTask,
  MistakeEntry,
  PageHighlight,
  ExamResult,
  PlanTask,
  Quest,
  Riddle,
  Settings,
  VaultEntry,
} from '@/types'
import { dayKeyOffset, todayKey, uid } from '@/lib/utils'
import { riddleForDate } from '@/data/riddles'
import { giftStickers } from '@/data/kids'
import { useUI } from './useUI'
import { providerFor } from '@/lib/providers'
import type { OfficialBook } from '@/data/officialBooks'

export const XP_PER_LEVEL = 300

export function levelInfo(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const into = xp % XP_PER_LEVEL
  return {
    level,
    into,
    needed: XP_PER_LEVEL,
    progress: Math.round((into / XP_PER_LEVEL) * 100),
    totalForNext: level * XP_PER_LEVEL,
  }
}

const defaultSettings: Settings = {
  theme: 'dark',
  language:
    typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en',
  textScale: 100,
  dyslexiaFont: false,
  reduceMotion: false,
  ttsRate: 0.95,
  autoSpeak: false,
  pdfDark: false,
  kidsDailyLimit: 0,
  kidsReminder: '',
  parentPinHash: '',
  notifications: false,
  parentPhone: '',
  studentName: '',
  gradeLevel: 1,
  curriculum: 'egypt',
  primaryUi: 'auto',
  voiceLocale: '',
  shareCounts: true,
  schoolType: 'government',
  aiProvider: 'gemini',
  aiBaseUrl: 'https://api.openai.com/v1',
  grade: 'First Preparatory',
  school: '',
}

function questTemplates(dateKey: string): Quest[] {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) hash = (hash * 33 + dateKey.charCodeAt(i)) >>> 0
  const pool = [
    { title: 'Warm-up quiz', description: 'Score at least 3/5 in any quiz.', kind: 'quiz' as const, target: 1, xp: 40 },
    { title: 'Page turner', description: 'Read 5 pages in any textbook.', kind: 'pages' as const, target: 5, xp: 35 },
    { title: 'Memory reps', description: 'Review 10 flashcards.', kind: 'cards' as const, target: 10, xp: 45 },
    { title: 'Curious mind', description: 'Ask Jessica 3 questions.', kind: 'chat' as const, target: 3, xp: 30 },
    { title: 'Focus sprint', description: 'Study for 20 focused minutes.', kind: 'study' as const, target: 20, xp: 50 },
    { title: 'Riddle hunter', description: 'Solve the daily riddle.', kind: 'riddle' as const, target: 1, xp: 25 },
    { title: 'Write it out', description: 'Submit one paragraph to the essay grader.', kind: 'essay' as const, target: 1, xp: 45 },
    { title: 'Speak up', description: 'Record a pronunciation practice.', kind: 'voice' as const, target: 1, xp: 40 },
  ]
  const picked: Quest[] = []
  for (let i = 0; i < 4; i++) {
    const item = pool[(hash + i * 3) % pool.length]
    if (picked.some((q) => q.kind === item.kind)) {
      const alt = pool[(hash + i * 5 + 1) % pool.length]
      if (picked.some((q) => q.kind === alt.kind)) continue
      picked.push({ ...alt, id: `q_${dateKey}_${i}`, progress: 0, claimed: false })
    } else {
      picked.push({ ...item, id: `q_${dateKey}_${i}`, progress: 0, claimed: false })
    }
  }
  return picked
}

interface RiddleState extends Riddle {
  date: string
  solved: boolean
  attempted: boolean
  selected?: number
}

export interface TopicLogEntry {
  id: string
  title: string
  subject: string
  date: string
}

export interface AppState {
  name: string
  xp: number
  coins: number
  streak: number
  longestStreak: number
  lastLogin: string
  lastStudy: string
  studySeconds: number
  dailyLog: Record<string, DailyLogEntry>
  dailyDate: string
  dailyXP: number
  studyXpBuffer: number
  quests: Quest[]
  questsSource: 'local' | 'ai'
  completedTopics: string[]
  topicLog: TopicLogEntry[]
  bookProgress: Record<string, { lastPage: number; total: number; updatedAt: number }>
  customBooks: Book[]
  communityBooks: OfficialBook[]
  bookmarks: Record<string, number[]>
  pageNotes: Record<string, Record<string, string>>
  unitMastery: Record<string, { best: number; total: number; attempts: number; lastAt: number; weak?: Record<string, number> }>
  examDates: Record<string, string>
  kidsGift: string
  kidsStickers: string[]
  lessonProgress: Record<string, { step: number; done: boolean; updatedAt: number }>
  lessonChest: Record<string, boolean>
  kidsUsage: Record<string, number>
  kidsReminderDate: string
  parentTasks: ParentTask[]
  mistakes: MistakeEntry[]
  highlights: Record<string, PageHighlight[]>
  skillStats: Record<string, { correct: number; total: number; lastAt: number }>
  vault: VaultEntry[]
  planner: PlanTask[]
  exams: ExamResult[]
  settings: Settings
  apiKey: string
  aiKeys: Record<AiProvider, string>
  model: string
  mascotName: string
  mascotLook: string
  riddle: RiddleState
  onboarded: boolean
  installDismissed: boolean
  lastSeen: number
  notificationsDate: string

  bootstrap: () => void
  addXP: (amount: number, silent?: boolean) => void
  spendCoins: (amount: number) => boolean
  recordStudy: (seconds: number) => void
  track: (kind: Quest['kind'], amount?: number) => void
  claimQuest: (id: string) => void
  setQuests: (quests: Quest[], source: 'local' | 'ai') => void
  completeTopic: (id: string, title: string, subject: string) => void
  setBookProgress: (bookId: string, page: number, total: number) => void
  addCustomBook: (book: Book) => void
  addCommunityBooks: (books: OfficialBook[]) => void
  clearCommunityBooks: () => void
  removeCustomBook: (id: string) => void
  toggleBookmark: (bookId: string, page: number) => void
  setPageNote: (bookId: string, page: number, note: string) => void
  recordUnitScore: (key: string, score: number, total: number, weakTopics?: string[]) => void
  setExamDate: (subject: string, date: string) => void
  claimKidsGift: () => string | null
  setLessonStep: (key: string, step: number) => void
  completeLesson: (key: string) => void
  openLessonChest: (key: string) => { stars: number; sticker?: string } | null
  addKidsUsage: (seconds: number) => void
  setKidsReminderDate: (date: string) => void
  addParentTask: (title: string, reward: number) => void
  completeParentTask: (id: string) => number | null
  removeParentTask: (id: string) => void
  addMistake: (entry: Omit<MistakeEntry, 'id' | 'createdAt'>) => void
  removeMistake: (id: string) => void
  clearMistakes: () => void
  setMistakeExplanation: (id: string, text: string) => void
  addHighlight: (bookId: string, page: number, text: string, color?: string) => void
  removeHighlight: (bookId: string, id: string) => void
  recordSkill: (subject: string, topic: string, correct: boolean) => void
  addVault: (entry: Omit<VaultEntry, 'id' | 'createdAt'>) => string
  removeVault: (id: string) => void
  setPlanner: (tasks: PlanTask[]) => void
  togglePlannerTask: (id: string) => void
  addPlannerTask: (task: Omit<PlanTask, 'id' | 'done'>) => void
  addExam: (exam: ExamResult) => void
  updateSettings: (patch: Partial<Settings>) => void
  setName: (name: string) => void
  setApiKey: (key: string) => void
  setProvider: (provider: AiProvider) => void
  setModel: (model: string) => void
  setMascot: (patch: { name?: string; look?: string }) => void
  answerRiddle: (selected: number) => boolean
  markNotifications: (date: string) => void
  setOnboarded: () => void
  dismissInstall: () => void
  importState: (data: Partial<AppState>) => void
  resetAll: () => void
}

function freshRiddle(date = todayKey()): RiddleState {
  const r = riddleForDate(date)
  return { ...r, date, solved: false, attempted: false }
}

const initial = (): Omit<AppState, keyof AppState> | any => ({
  name: '',
  xp: 0,
  coins: 0,
  streak: 0,
  longestStreak: 0,
  lastLogin: '',
  lastStudy: '',
  studySeconds: 0,
  dailyLog: {},
  dailyDate: todayKey(),
  dailyXP: 0,
  studyXpBuffer: 0,
  quests: questTemplates(todayKey()),
  questsSource: 'local',
  completedTopics: [],
  topicLog: [],
  bookProgress: {},
  customBooks: [],
  communityBooks: [],
  bookmarks: {},
  pageNotes: {},
  unitMastery: {},
  examDates: {},
  kidsGift: '',
  kidsStickers: [],
  lessonProgress: {},
  lessonChest: {},
  kidsUsage: {},
  kidsReminderDate: '',
  parentTasks: [],
  mistakes: [],
  highlights: {},
  skillStats: {},
  vault: [],
  planner: [],
  exams: [],
  settings: defaultSettings,
  apiKey: '',
  aiKeys: { gemini: '', openai: '', anthropic: '', openrouter: '', custom: '' },
  model: 'gemini-1.5-flash',
  mascotName: 'Jessling',
  mascotLook: 'classic',
  riddle: freshRiddle(),
  onboarded: false,
  installDismissed: false,
  lastSeen: Date.now(),
  notificationsDate: '',
})

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial(),

      bootstrap: () => {
        const state = get()
        const today = todayKey()
        if (state.dailyDate === today && state.lastLogin === today) {
          set({ lastSeen: Date.now() })
          return
        }

        // Daily rollover + streaks.
        const yesterday = dayKeyOffset(-1)
        let streak = state.streak
        if (state.lastLogin === yesterday) streak += 1
        else if (state.lastLogin !== today) streak = 1
        if (streak < 1) streak = 1

        const loginXP = state.lastLogin === today ? 0 : 15
        const entry = { ...(state.dailyLog[today] || { xp: 0, seconds: 0 }) }

        set({
          dailyDate: today,
          dailyXP: loginXP,
          dailyLog: {
            ...state.dailyLog,
            [today]: { ...entry, xp: entry.xp + loginXP },
          },
          lastLogin: today,
          streak,
          longestStreak: Math.max(state.longestStreak, streak),
          quests: questTemplates(today),
          questsSource: 'local',
          riddle: freshRiddle(today),
          xp: state.xp + loginXP,
          coins: state.coins + (loginXP ? 3 : 0),
          lastSeen: Date.now(),
        })

        if (loginXP) {
          useUI.getState().pushToast({
            title: `Day ${streak} streak!`,
            description: 'Welcome back. +15 XP daily login bonus.',
            type: 'success',
            xp: loginXP,
          })
        }
      },

      addXP: (amount, silent) => {
        if (!Number.isFinite(amount) || amount === 0) return
        const state = get()
        const today = todayKey()
        const before = levelInfo(state.xp).level
        const entry = state.dailyLog[today] || { xp: 0, seconds: 0 }
        const nextXp = Math.max(0, state.xp + amount)
        const after = levelInfo(nextXp).level

        set({
          xp: nextXp,
          dailyXP: state.dailyXP + amount,
          coins: state.coins + Math.max(0, Math.ceil(amount / 5)),
          dailyLog: {
            ...state.dailyLog,
            [today]: { ...entry, xp: entry.xp + amount },
          },
          lastSeen: Date.now(),
        })

        if (after > before && !silent) {
          useUI.getState().pushToast({
            title: `Level ${after} unlocked!`,
            description: 'Your mastery bar is rising. Keep going.',
            type: 'levelup',
          })
        }
      },

      spendCoins: (amount) => {
        const state = get()
        if (state.coins < amount) return false
        set({ coins: state.coins - amount })
        return true
      },

      recordStudy: (seconds) => {
        if (seconds <= 0) return
        const state = get()
        const today = todayKey()
        const entry = state.dailyLog[today] || { xp: 0, seconds: 0 }
        const buffer = state.studyXpBuffer + seconds
        const gained = Math.floor(buffer / 60)
        set({
          studySeconds: state.studySeconds + seconds,
          studyXpBuffer: buffer % 60,
          lastStudy: today,
          dailyLog: {
            ...state.dailyLog,
            [today]: { ...entry, seconds: entry.seconds + seconds },
          },
        })
        if (gained > 0) get().addXP(gained, true)
        get().track('study', seconds / 60)
      },

      track: (kind, amount = 1) => {
        set((state) => ({
          quests: state.quests.map((q) =>
            q.kind === kind && !q.claimed
              ? { ...q, progress: Math.min(q.target, q.progress + amount) }
              : q,
          ),
        }))
      },

      claimQuest: (id) => {
        const state = get()
        const quest = state.quests.find((q) => q.id === id)
        if (!quest || quest.claimed || quest.progress < quest.target) return
        set({
          quests: state.quests.map((q) => (q.id === id ? { ...q, claimed: true } : q)),
        })
        get().addXP(quest.xp, true)
        useUI.getState().pushToast({
          title: 'Quest complete!',
          description: quest.title,
          type: 'xp',
          xp: quest.xp,
        })
      },

      setQuests: (quests, source) => {
        set((state) => ({
          quests: quests.map((q, i) => {
            const previous = state.quests.find((old) => old.kind === q.kind)
            return { ...q, id: `q_${state.dailyDate}_${source}_${i}`, progress: previous?.progress || 0, claimed: false }
          }),
          questsSource: source,
        }))
      },

      completeTopic: (id, title, subject) => {
        const state = get()
        if (state.completedTopics.includes(id)) return
        set({
          completedTopics: [...state.completedTopics, id],
          topicLog: [
            { id, title, subject, date: todayKey() },
            ...state.topicLog.filter((t) => t.id !== id),
          ].slice(0, 80),
        })
        get().addXP(50, true)
        useUI.getState().pushToast({
          title: 'Chapter mastered!',
          description: `${title} marked complete.`,
          type: 'xp',
          xp: 50,
        })
      },

      setBookProgress: (bookId, page, total) => {
        set((state) => ({
          bookProgress: {
            ...state.bookProgress,
            [bookId]: { lastPage: page, total, updatedAt: Date.now() },
          },
        }))
      },

      addCommunityBooks: (books) =>
        set((state) => ({
          communityBooks: [...books, ...state.communityBooks.filter((item) => !books.some((book) => book.url === item.url))].slice(0, 300),
        })),
      clearCommunityBooks: () => set({ communityBooks: [] }),
      addCustomBook: (book) => {
        set((state) => ({
          customBooks: [book, ...state.customBooks.filter((b) => b.id !== book.id)],
        }))
      },

      removeCustomBook: (id) => {
        set((state) => {
          const bookProgress = { ...state.bookProgress }
          delete bookProgress[id]
          return {
            customBooks: state.customBooks.filter((b) => b.id !== id),
            bookProgress,
          }
        })
      },

      toggleBookmark: (bookId, page) => {
        set((state) => {
          const list = state.bookmarks[bookId] || []
          const next = list.includes(page) ? list.filter((p) => p !== page) : [...list, page].sort((a, b) => a - b)
          return { bookmarks: { ...state.bookmarks, [bookId]: next } }
        })
      },

      setPageNote: (bookId, page, note) => {
        set((state) => {
          const pages = { ...(state.pageNotes[bookId] || {}) }
          if (note.trim()) pages[String(page)] = note.trim().slice(0, 1200)
          else delete pages[String(page)]
          return { pageNotes: { ...state.pageNotes, [bookId]: pages } }
        })
      },

      recordUnitScore: (key, score, total, weakTopics) => {
        if (!key || !total) return
        set((state) => {
          const previous = state.unitMastery[key]
          const previousRatio = previous ? previous.best / previous.total : 0
          const ratio = score / total
          const next = ratio >= previousRatio ? { best: score, total } : { best: previous?.best || 0, total: previous?.total || total }
          const weak = { ...(previous?.weak || {}) }
          for (const topic of weakTopics || []) {
            const clean = topic.trim().slice(0, 60)
            if (clean) weak[clean] = (weak[clean] || 0) + 1
          }
          return {
            unitMastery: {
              ...state.unitMastery,
              [key]: {
                ...next,
                attempts: (previous?.attempts || 0) + 1,
                lastAt: Date.now(),
                weak,
              },
            },
          }
        })
      },

      setExamDate: (subject, date) => {
        set((state) => {
          const examDates = { ...state.examDates }
          if (date) examDates[subject] = date
          else delete examDates[subject]
          return { examDates }
        })
      },

      setLessonStep: (key, step) => {
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [key]: { step, done: state.lessonProgress[key]?.done || false, updatedAt: Date.now() },
          },
        }))
      },

      openLessonChest: (key) => {
        const state = get()
        if (state.lessonChest[key]) return null
        const roll = Math.random()
        const stars = roll < 0.6 ? 5 : 10
        const owned = new Set(state.kidsStickers)
        const pool = giftStickers.filter((sticker) => !owned.has(sticker.id))
        const sticker = roll > 0.75 && pool.length ? pool[Math.floor(Math.random() * pool.length)] : undefined
        set({
          lessonChest: { ...state.lessonChest, [key]: true },
          kidsStickers: sticker ? [...owned, sticker.id] : state.kidsStickers,
        })
        state.addXP(stars, true)
        return { stars, sticker: sticker?.id }
      },

      addKidsUsage: (seconds) => {
        if (seconds <= 0) return
        set((state) => {
          const today = todayKey()
          return {
            kidsUsage: { ...state.kidsUsage, [today]: (state.kidsUsage[today] || 0) + seconds },
          }
        })
      },

      setKidsReminderDate: (date) => set({ kidsReminderDate: date }),

      addParentTask: (title, reward) => {
        const clean = title.trim().slice(0, 80)
        if (!clean) return
        set((state) => ({
          parentTasks: [
            { id: uid('pt_'), title: clean, reward: Math.max(5, Math.min(30, reward)), createdAt: Date.now(), done: false },
            ...state.parentTasks,
          ].slice(0, 40),
        }))
      },

      completeParentTask: (id) => {
        const task = get().parentTasks.find((item) => item.id === id)
        if (!task || task.done) return null
        set((state) => ({
          parentTasks: state.parentTasks.map((item) =>
            item.id === id ? { ...item, done: true, doneAt: Date.now() } : item,
          ),
        }))
        get().addXP(task.reward, true)
        return task.reward
      },

      addMistake: (entry) => {
        set((state) => {
          const duplicate = state.mistakes.find(
            (item) =>
              item.question === entry.question &&
              item.unitKey === entry.unitKey &&
              item.chosen === entry.chosen,
          )
          if (duplicate) return state
          return {
            mistakes: [
              { ...entry, id: uid('m_'), createdAt: Date.now() },
              ...state.mistakes,
            ].slice(0, 300),
          }
        })
      },

      addHighlight: (bookId, page, text, color = '#ffd166') => {
        const clean = text.trim().slice(0, 1200)
        if (!clean) return
        set((state) => ({
          highlights: {
            ...state.highlights,
            [bookId]: [
              { id: uid('h_'), page, text: clean, color, createdAt: Date.now() },
              ...(state.highlights[bookId] || []),
            ].slice(0, 500),
          },
        }))
      },

      recordSkill: (subject, topic, correct) => {
        const clean = topic.trim().slice(0, 60)
        if (!clean) return
        set((state) => {
          const key = `${subject}|${clean}`
          const previous = state.skillStats[key] || { correct: 0, total: 0, lastAt: 0 }
          return {
            skillStats: {
              ...state.skillStats,
              [key]: {
                correct: previous.correct + (correct ? 1 : 0),
                total: previous.total + 1,
                lastAt: Date.now(),
              },
            },
          }
        })
      },

      removeHighlight: (bookId, id) => {
        set((state) => ({
          highlights: {
            ...state.highlights,
            [bookId]: (state.highlights[bookId] || []).filter((item) => item.id !== id),
          },
        }))
      },

      removeMistake: (id) => set((state) => ({ mistakes: state.mistakes.filter((item) => item.id !== id) })),

      clearMistakes: () => set({ mistakes: [] }),

      setMistakeExplanation: (id, text) => {
        set((state) => ({
          mistakes: state.mistakes.map((item) => (item.id === id ? { ...item, aiExplanation: text } : item)),
        }))
      },

      removeParentTask: (id) => {
        set((state) => ({ parentTasks: state.parentTasks.filter((item) => item.id !== id) }))
      },

      completeLesson: (key) => {
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [key]: { step: 3, done: true, updatedAt: Date.now() },
          },
        }))
      },

      claimKidsGift: () => {
        const state = get()
        const today = todayKey()
        if (state.kidsGift === today) return null
        const owned = new Set(state.kidsStickers)
        const pool = giftStickers.filter((sticker) => !owned.has(sticker.id))
        const sticker = (pool.length ? pool : giftStickers)[Math.floor(Math.random() * (pool.length || giftStickers.length))]
        set({
          kidsGift: today,
          kidsStickers: [...new Set([...state.kidsStickers, sticker.id])],
        })
        state.addXP(10, true)
        useUI.getState().pushToast({ title: 'Daily gift opened 🎁', description: 'You earned 10 stars and a new sticker.', type: 'xp', xp: 10 })
        return sticker.id
      },

      addVault: (entry) => {
        const id = uid('v_')
        set((state) => ({
          vault: [{ ...entry, id, createdAt: Date.now() }, ...state.vault].slice(0, 300),
        }))
        useUI.getState().pushToast({ title: 'Saved to Knowledge Vault', type: 'success' })
        return id
      },

      removeVault: (id) => set((state) => ({ vault: state.vault.filter((v) => v.id !== id) })),

      setPlanner: (tasks) => {
        const withIds = tasks.map((t) => ({ ...t, id: t.id || uid('p_'), done: t.done ?? false }))
        set((state) => ({
          planner: [...withIds, ...state.planner.filter((p) => p.done)],
        }))
        useUI.getState().pushToast({
          title: 'Study plan ready',
          description: `${withIds.length} missions added to your planner.`,
          type: 'success',
        })
      },

      togglePlannerTask: (id) => {
        const state = get()
        const task = state.planner.find((p) => p.id === id)
        if (!task) return
        set({
          planner: state.planner.map((p) => (p.id === id ? { ...p, done: !p.done } : p)),
        })
        if (!task.done) {
          get().addXP(task.xp || 20, true)
          useUI.getState().pushToast({
            title: 'Task complete',
            description: task.title,
            type: 'xp',
            xp: task.xp || 20,
          })
        }
      },

      addPlannerTask: (task) => {
        set((state) => ({
          planner: [{ ...task, id: uid('p_'), done: false }, ...state.planner],
        }))
      },

      addExam: (exam) => {
        set((state) => ({ exams: [exam, ...state.exams].slice(0, 30) }))
        get().addXP(30, true)
      },

      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
      setName: (name) => set({ name: name.slice(0, 40) }),
      setApiKey: (apiKey) =>
        set((state) => ({
          apiKey: apiKey.trim(),
          aiKeys: { ...state.aiKeys, [state.settings.aiProvider]: apiKey.trim() },
        })),
      setProvider: (provider) =>
        set((state) => ({
          settings: { ...state.settings, aiProvider: provider },
          apiKey: state.aiKeys[provider] || '',
          model: providerFor(provider).defaultModel,
        })),
      setModel: (model) => set({ model }),

      setMascot: (patch) =>
        set((state) => ({
          mascotName: patch.name !== undefined ? patch.name.slice(0, 24) : state.mascotName,
          mascotLook: patch.look !== undefined ? patch.look : state.mascotLook,
        })),

      answerRiddle: (selected) => {
        const state = get()
        if (state.riddle.solved) return true
        const correct = selected === state.riddle.answer
        set({
          riddle: {
            ...state.riddle,
            attempted: true,
            selected,
            solved: correct ? true : state.riddle.solved,
          },
        })
        if (correct) {
          const bonus = state.riddle.xp || 30
          get().addXP(bonus, true)
          get().track('riddle', 1)
          useUI.getState().pushToast({
            title: 'Riddle solved!',
            description: state.riddle.explanation,
            type: 'xp',
            xp: bonus,
          })
        }
        return correct
      },

      markNotifications: (date) => set({ notificationsDate: date }),
      setOnboarded: () => set({ onboarded: true }),
      dismissInstall: () => set({ installDismissed: true }),

      importState: (data) => {
        const safe = { ...data }
        delete (safe as any).apiKey
        set((state) => ({ ...state, ...safe, settings: { ...state.settings, ...(data.settings || {}) } }))
      },

      resetAll: () => {
        set({ ...initial(), apiKey: get().apiKey })
      },
    }),
    {
      name: 'jessica-profile-v1',
      version: 3,
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted || {}) as Record<string, unknown>
        if (version < 3) {
          const settings = state.settings as { gradeLevel?: number } | undefined
          if (settings && typeof settings.gradeLevel === 'number') {
            const grade = settings.gradeLevel
            settings.gradeLevel = grade >= 1 && grade <= 3 ? grade + 6 : 4
          }
          const books = state.customBooks as { grade?: number }[] | undefined
          if (Array.isArray(books)) {
            state.customBooks = books.map((book) => {
              if (!book || typeof book.grade !== 'number') return book
              return { ...book, grade: book.grade >= 1 && book.grade <= 3 ? book.grade + 6 : 4 }
            })
          }
        }
        return state
      },
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const saved = (persisted || {}) as Partial<AppState>
        return {
          ...current,
          ...saved,
          settings: { ...current.settings, ...(saved.settings || {}) },
        } as AppState
      },
      partialize: (state) => {
        const { ...rest } = state
        const clean = { ...rest } as Record<string, unknown>
        for (const key of Object.keys(clean)) {
          if (typeof clean[key] === 'function') delete clean[key]
        }
        return clean
      },
    },
  ),
)

export function todayLog(state: AppState = useApp.getState()) {
  return state.dailyLog[todayKey()] || { xp: 0, seconds: 0 }
}

export function weekLog(state: AppState = useApp.getState()) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = dayKeyOffset(i - 6)
    return {
      date,
      xp: state.dailyLog[date]?.xp || 0,
      seconds: state.dailyLog[date]?.seconds || 0,
      label: new Date(date).toLocaleDateString(dateLocale(), { weekday: 'narrow' }),
      day: Number(date.slice(-2)),
    }
  })
}
