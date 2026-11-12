import { lazy } from 'react'

/**
 * Route-level code splitting: each screen is a separate chunk, loaded on
 * demand. Keeps the first paint small on slow 3G connections.
 */
function page<T extends Record<string, unknown>>(loader: () => Promise<T>, name: keyof T) {
  return lazy(() => loader().then((module) => ({ default: module[name] as React.ComponentType })))
}

export const LazyKidsApp = page(() => import('@/kids/KidsApp'), 'KidsApp')
export const LazyLibrary = page(() => import('@/pages/Library'), 'Library')
export const LazyReader = page(() => import('@/pages/Reader'), 'Reader')
export const LazyStudyHub = page(() => import('@/pages/StudyHub'), 'StudyHub')
export const LazyGames = page(() => import('@/pages/Games'), 'Games')
export const LazyLabs = page(() => import('@/pages/Labs'), 'Labs')
export const LazyConstellation = page(() => import('@/pages/Constellation'), 'Constellation')
export const LazyVault = page(() => import('@/pages/Vault'), 'Vault')
export const LazyMascotPage = page(() => import('@/pages/MascotPage'), 'MascotPage')
export const LazySettings = page(() => import('@/pages/Settings'), 'Settings')
export const LazyBattle = page(() => import('@/pages/Battle'), 'Battle')
export const LazyWorksheets = page(() => import('@/pages/Worksheets'), 'Worksheets')
export const LazyReadingCoach = page(() => import('@/pages/ReadingCoach'), 'ReadingCoach')
export const LazyTeacher = page(() => import('@/pages/Teacher'), 'Teacher')
export const LazyAssignment = page(() => import('@/pages/Assignment'), 'Assignment')
export const LazyMistakes = page(() => import('@/pages/Mistakes'), 'Mistakes')
export const LazySkills = page(() => import('@/pages/Skills'), 'Skills')
export const LazyDailyPlan = page(() => import('@/pages/DailyPlan'), 'DailyPlan')
export const LazyAsk = page(() => import('@/pages/Ask'), 'Ask')
export const LazyPractice = page(() => import('@/pages/Practice'), 'Practice')
export const LazyHelp = page(() => import('@/pages/Help'), 'Help')
export const LazyFeedback = page(() => import('@/pages/Feedback'), 'Feedback')
export const LazyInstall = page(() => import('@/pages/Install'), 'Install')
export const LazyBubbleSheet = page(() => import('@/pages/BubbleSheet'), 'BubbleSheet')
export const LazyDisclaimer = page(() => import('@/pages/Disclaimer'), 'Disclaimer')
export const LazyExamCalendar = page(() => import('@/pages/ExamCalendar'), 'ExamCalendar')
