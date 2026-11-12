import type { GradeLevel } from '@/types'

export type { GradeLevel }

export type SchoolStage = 'primary' | 'prep'

/** Grades 1–6 are primary; 7–9 are preparatory. No secondary stage yet. */
export function stageForGrade(grade: GradeLevel): SchoolStage {
  return grade >= 7 ? 'prep' : 'primary'
}

export function gradesForStage(stage: SchoolStage): GradeLevel[] {
  return stage === 'primary' ? [1, 2, 3, 4, 5, 6] : [7, 8, 9]
}

export function defaultGradeForStage(stage: SchoolStage): GradeLevel {
  return stage === 'primary' ? 1 : 7
}

/**
 * Primary grades use the playful kids world by default (1–4). Grades 5–6 get
 * the full study shell, and the learner can override this in Settings.
 */
export function useKidsWorld(grade: GradeLevel, primaryUi: 'auto' | 'kids' | 'study' = 'auto'): boolean {
  if (grade >= 7) return false
  if (primaryUi === 'kids') return true
  if (primaryUi === 'study') return false
  return grade <= 4
}
