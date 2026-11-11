export type SchoolStage = 'primary' | 'prep'

export type GradeLevel = 1 | 2 | 3 | 4

export function stageForGrade(grade: GradeLevel): SchoolStage {
  return grade === 4 ? 'primary' : 'prep'
}

export function gradesForStage(stage: SchoolStage): GradeLevel[] {
  return stage === 'primary' ? [4] : [1, 2, 3]
}

export function defaultGradeForStage(stage: SchoolStage): GradeLevel {
  return stage === 'primary' ? 4 : 1
}
