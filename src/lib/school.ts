import type { SchoolType, Subject } from '@/types'
import { tr } from '@/i18n'

export interface SchoolOption {
  id: SchoolType
  label: string
  hint: string
  emoji: string
}

export const SCHOOL_TYPES: SchoolOption[] = [
  { id: 'government', label: 'Government school', hint: 'Ministry books, Arabic medium', emoji: '🏫' },
  { id: 'languages', label: 'Language school', hint: 'French or German + English medium', emoji: '🌍' },
  { id: 'private', label: 'Private school', hint: 'National private curriculum', emoji: '🎓' },
  { id: 'azhar', label: 'Al-Azhar', hint: 'Azhar curriculum with religion', emoji: '🕌' },
]

const CORE: Subject[] = ['English', 'Arabic', 'Mathematics', 'Science', 'Social Studies', 'Religion']
const LANGUAGE_SUBJECTS: Subject[] = ['French', 'German']

/** Subjects a school type actually studies; language schools add French/German. */
export function subjectsForSchool(type: SchoolType): Subject[] {
  return type === 'languages' ? [...CORE, ...LANGUAGE_SUBJECTS] : CORE
}

export function schoolLabel(type: SchoolType): string {
  return tr(SCHOOL_TYPES.find((item) => item.id === type)?.label || 'Government school')
}
