import type { Curriculum } from '@/types'
import type { GradeLevel } from '@/lib/stage'
import { gradeLabel } from '@/data/officialBooks'
import { tr } from '@/i18n'

export interface CurriculumOption {
  id: Curriculum
  label: string
  hint: string
  emoji: string
}

export const CURRICULA: CurriculumOption[] = [
  { id: 'egypt', label: 'Egypt', hint: 'Ministry of Education books', emoji: '🇪🇬' },
  { id: 'gulf', label: 'Gulf', hint: 'Saudi Arabia, UAE, Kuwait…', emoji: '🌍' },
  { id: 'international', label: 'International', hint: 'IGCSE · IB · American', emoji: '🌐' },
  { id: 'other', label: 'Other', hint: 'My own curriculum', emoji: '📚' },
]

export interface LevelOption {
  grade: GradeLevel
  label: string
  hint: string
}

export const GLOBAL_LEVELS: LevelOption[] = [
  { grade: 1, label: 'Primary (ages 6–10)', hint: 'Playful kids world' },
  { grade: 7, label: 'Middle school (ages 11–14)', hint: 'Grades 6–8' },
  { grade: 9, label: 'High school (ages 15–18)', hint: 'Grades 9–12' },
]

/** Only Egypt ships an official Ministry catalog; everyone else imports their own PDFs. */
export function hasOfficialLibrary(curriculum: Curriculum) {
  return curriculum === 'egypt'
}

/** Human label for the learner's band, used in every header and report. */
export function levelLabel(gradeLevel: GradeLevel, curriculum: Curriculum): string {
  if (curriculum === 'egypt') return tr(gradeLabel(gradeLevel))
  if (gradeLevel <= 6) return tr(GLOBAL_LEVELS[0].label)
  if (gradeLevel <= 8) return tr(GLOBAL_LEVELS[1].label)
  return tr(GLOBAL_LEVELS[2].label)
}

export function curriculumName(curriculum: Curriculum): string {
  return tr(CURRICULA.find((item) => item.id === curriculum)?.label || 'Other')
}
