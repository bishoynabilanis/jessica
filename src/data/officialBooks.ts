import type { GradeLevel, LanguageCode, Subject } from '@/types'

/**
 * Official Egyptian Ministry of Education books on the ministry's public blob.
 * Primary 1–6 and preparatory 1–3 (internal grades 7–9).
 */
export interface OfficialBook {
  id: string
  grade: GradeLevel
  subject: Subject
  term: 'Term 1' | 'Term 2'
  title: string
  url: string
  sizeMb: number
  language: LanguageCode
}

const BLOB = 'https://elearnningcontent.blob.core.windows.net/elearnningcontent'

const file = (path: string) => `${BLOB}/${path}`

export const officialBooks: OfficialBook[] = [
  /* ------------------------------ Primary 1 ------------------------------ */
  {
    id: 'off-p1-english-t1',
    grade: 1,
    subject: 'English',
    term: 'Term 1',
    title: 'English — Primary 1',
    url: file('2026/Primary/Primary1/Term1/StudentBook/English_Prim1_Tr1.pdf'),
    sizeMb: 59.7,
    language: 'en',
  },
  {
    id: 'off-p1-arabic-t1',
    grade: 1,
    subject: 'Arabic',
    term: 'Term 1',
    title: 'اللغة العربية — الصف الأول الابتدائي',
    url: file('2026/Primary/Primary1/Term1/StudentBook/Arabic_prim1_T1.pdf'),
    sizeMb: 16.7,
    language: 'ar',
  },

  /* ------------------------------ Primary 2 ------------------------------ */
  {
    id: 'off-p2-english-t1',
    grade: 2,
    subject: 'English',
    term: 'Term 1',
    title: 'English — Primary 2',
    url: file('2026/Primary/Primary2/Term1/StudentBook/English_Prim2_Tr1.pdf'),
    sizeMb: 26.3,
    language: 'en',
  },
  {
    id: 'off-p2-arabic-t1',
    grade: 2,
    subject: 'Arabic',
    term: 'Term 1',
    title: 'اللغة العربية — الصف الثاني الابتدائي',
    url: file('2026/Primary/Primary2/Term1/StudentBook/Arabic_Prim2_T1.pdf'),
    sizeMb: 27.8,
    language: 'ar',
  },

  /* ------------------------------ Primary 3 ------------------------------ */
  {
    id: 'off-p3-english-t1',
    grade: 3,
    subject: 'English',
    term: 'Term 1',
    title: 'English — Primary 3',
    url: file('2026/Primary/Primary3/Term1/StudentBook/English_Prim3_Tr1.pdf'),
    sizeMb: 11.9,
    language: 'en',
  },
  {
    id: 'off-p3-math-t1',
    grade: 3,
    subject: 'Mathematics',
    term: 'Term 1',
    title: 'Mathematics — Primary 3',
    url: file('2026/Primary/Primary3/Term1/StudentBook/Math_EN_prim3_TR1.pdf'),
    sizeMb: 5.7,
    language: 'en',
  },

  /* ------------------------------ Primary 4 ------------------------------ */
  {
    id: 'off-p4-english-t1',
    grade: 4,
    subject: 'English',
    term: 'Term 1',
    title: 'English — Primary 4',
    url: file('2026/Primary/Primary4/Term1/StudentBook/English_Prim4_Tr1.pdf'),
    sizeMb: 24.5,
    language: 'en',
  },
  {
    id: 'off-p4-arabic-t1',
    grade: 4,
    subject: 'Arabic',
    term: 'Term 1',
    title: 'اللغة العربية — الصف الرابع الابتدائي',
    url: file('2026/Primary/Primary4/Term1/StudentBook/Arabic_prim4_T1.pdf'),
    sizeMb: 17.3,
    language: 'ar',
  },
  {
    id: 'off-p4-math-t1',
    grade: 4,
    subject: 'Mathematics',
    term: 'Term 1',
    title: 'Mathematics — Primary 4',
    url: file('2026/Primary/Primary4/Term1/StudentBook/Math_EN_prim4_TR1.pdf'),
    sizeMb: 23.4,
    language: 'en',
  },
  {
    id: 'off-p4-science-t1',
    grade: 4,
    subject: 'Science',
    term: 'Term 1',
    title: 'Science — Primary 4',
    url: file('2026/Primary/Primary4/Term1/StudentBook/Science_prim4_TR1.pdf'),
    sizeMb: 5.7,
    language: 'en',
  },
  {
    id: 'off-p4-social-t1',
    grade: 4,
    subject: 'Social Studies',
    term: 'Term 1',
    title: 'Social Studies — Primary 4',
    url: file('2026_2027/Primary/Primary4/Term1/StudentBook/Social_studies_prim4_t1.pdf'),
    sizeMb: 61.4,
    language: 'en',
  },

  /* ------------------------------ Primary 5 ------------------------------ */
  {
    id: 'off-p5-english-t1',
    grade: 5,
    subject: 'English',
    term: 'Term 1',
    title: 'English — Primary 5',
    url: file('2026/Primary/Primary5/Term1/StudentBook/English_Prim5_Tr1.pdf'),
    sizeMb: 16.7,
    language: 'en',
  },
  {
    id: 'off-p5-arabic-t1',
    grade: 5,
    subject: 'Arabic',
    term: 'Term 1',
    title: 'اللغة العربية — الصف الخامس الابتدائي',
    url: file('2026/Primary/Primary5/Term1/StudentBook/Arabic_prim5_T1.pdf'),
    sizeMb: 21.8,
    language: 'ar',
  },
  {
    id: 'off-p5-math-t1',
    grade: 5,
    subject: 'Mathematics',
    term: 'Term 1',
    title: 'Mathematics — Primary 5',
    url: file('2026_2027/Primary/Primary5/Term1/StudentBook/Math_EN_prim5_t1.pdf'),
    sizeMb: 35.5,
    language: 'en',
  },
  {
    id: 'off-p5-science-t1',
    grade: 5,
    subject: 'Science',
    term: 'Term 1',
    title: 'Science — Primary 5',
    url: file('2026/Primary/Primary5/Term1/StudentBook/Science_EN_prim5_TR1.pdf'),
    sizeMb: 56.8,
    language: 'en',
  },
  {
    id: 'off-p5-social-t1',
    grade: 5,
    subject: 'Social Studies',
    term: 'Term 1',
    title: 'Social Studies — Primary 5',
    url: file('2026_2027/Primary/Primary5/Term1/StudentBook/Social_studies_prim5_t1.pdf'),
    sizeMb: 14.3,
    language: 'en',
  },

  /* ------------------------------ Primary 6 ------------------------------ */
  {
    id: 'off-p6-english-t1',
    grade: 6,
    subject: 'English',
    term: 'Term 1',
    title: 'English — Primary 6',
    url: file('2026/Primary/Primary6/Term1/StudentBook/English_Prim6_Tr1.pdf'),
    sizeMb: 15.2,
    language: 'en',
  },
  {
    id: 'off-p6-arabic-t1',
    grade: 6,
    subject: 'Arabic',
    term: 'Term 1',
    title: 'اللغة العربية — الصف السادس الابتدائي',
    url: file('2026/Primary/Primary6/Term1/StudentBook/Arabic_prim6_T1.pdf'),
    sizeMb: 18.1,
    language: 'ar',
  },
  {
    id: 'off-p6-math-t1',
    grade: 6,
    subject: 'Mathematics',
    term: 'Term 1',
    title: 'Mathematics — Primary 6',
    url: file('2026/Primary/Primary6/Term1/StudentBook/Math_EN_Prim6_TR1.pdf'),
    sizeMb: 6.4,
    language: 'en',
  },
  {
    id: 'off-p6-science-t1',
    grade: 6,
    subject: 'Science',
    term: 'Term 1',
    title: 'Science — Primary 6',
    url: file('2026_2027/Primary/Primary6/Term1/StudentBook/Science_EN_prim6_TR1.pdf'),
    sizeMb: 25.3,
    language: 'en',
  },

  /* ------------------------------ Preparatory 1 (grade 7) ------------------------------ */
  {
    id: 'off-g1-english-t1',
    grade: 7,
    subject: 'English',
    term: 'Term 1',
    title: 'English — First Preparatory',
    url: file('2026/Prepratory/Prepratory1/Term1/StudentBook/English_Prp1_Tr1.pdf'),
    sizeMb: 5.7,
    language: 'en',
  },
  {
    id: 'off-g1-arabic-t1',
    grade: 7,
    subject: 'Arabic',
    term: 'Term 1',
    title: 'اللغة العربية — الصف الأول الإعدادي',
    url: file('2026/Prepratory/Prepratory1/Term1/StudentBook/Arabic_Prp1_Tr1.pdf'),
    sizeMb: 53.9,
    language: 'ar',
  },
  {
    id: 'off-g1-math-t1',
    grade: 7,
    subject: 'Mathematics',
    term: 'Term 1',
    title: 'Mathematics — First Preparatory',
    url: file('2026/Prepratory/Prepratory1/Term1/StudentBook/Mtah_E_Prp1_TR1.pdf'),
    sizeMb: 16,
    language: 'en',
  },
  {
    id: 'off-g1-science-t1',
    grade: 7,
    subject: 'Science',
    term: 'Term 1',
    title: 'Science — First Preparatory',
    url: file('2026_2027/Prepratory/Prepratory1/Term1/StudentBook/Science_Prep1_T1.pdf'),
    sizeMb: 69,
    language: 'en',
  },
  {
    id: 'off-g1-social-t1',
    grade: 7,
    subject: 'Social Studies',
    term: 'Term 1',
    title: 'Social Studies — First Preparatory',
    url: file('2026_2027/Prepratory/Prepratory1/Term1/StudentBook/Social_Studies_Prep1_T1.pdf'),
    sizeMb: 85.2,
    language: 'en',
  },
  {
    id: 'off-g1-french-t1',
    grade: 7,
    subject: 'French',
    term: 'Term 1',
    title: 'Français — Première Préparatoire',
    url: file('2026/Prepratory/Prepratory1/Term1/StudentBook/French_Prp1_TR1.pdf'),
    sizeMb: 12.3,
    language: 'fr',
  },

  /* ------------------------------ Preparatory 2 (grade 8) ------------------------------ */
  {
    id: 'off-g2-english-t1',
    grade: 8,
    subject: 'English',
    term: 'Term 1',
    title: 'English — Second Preparatory',
    url: file('2026/Prepratory/Prepratory2/Term1/StudentBook/English_Prp2_Tr1.pdf'),
    sizeMb: 38.3,
    language: 'en',
  },
  {
    id: 'off-g2-arabic-t1',
    grade: 8,
    subject: 'Arabic',
    term: 'Term 1',
    title: 'اللغة العربية — الصف الثاني الإعدادي',
    url: file('2026_2027/Prepratory/Prepratory2/Term1/StudentBook/Arabic_language_prep2_t1.pdf'),
    sizeMb: 106.5,
    language: 'ar',
  },
  {
    id: 'off-g2-math-t1',
    grade: 8,
    subject: 'Mathematics',
    term: 'Term 1',
    title: 'Mathematics — Second Preparatory',
    url: file('2026/Prepratory/Prepratory2/Term1/StudentBook/Math_En_PE2_SB_T1.pdf'),
    sizeMb: 11.9,
    language: 'en',
  },
  {
    id: 'off-g2-science-t1',
    grade: 8,
    subject: 'Science',
    term: 'Term 1',
    title: 'Science — Second Preparatory',
    url: file('2026/Prepratory/Prepratory2/Term1/StudentBook/Sci_En_PE2_SB_T1.pdf'),
    sizeMb: 28.4,
    language: 'en',
  },
  {
    id: 'off-g2-social-t1',
    grade: 8,
    subject: 'Social Studies',
    term: 'Term 1',
    title: 'Social Studies — Second Preparatory',
    url: file('2026/Prepratory/Prepratory2/Term1/StudentBook/Social_Prp2_Tr1.pdf'),
    sizeMb: 24.5,
    language: 'en',
  },
  {
    id: 'off-g2-french-t1',
    grade: 8,
    subject: 'French',
    term: 'Term 1',
    title: 'Français — Deuxième Préparatoire',
    url: file('2026/Prepratory/Prepratory2/Term1/StudentBook/French_Prp2_TR1.pdf'),
    sizeMb: 18.9,
    language: 'fr',
  },

  /* ------------------------------ Preparatory 3 (grade 9) ------------------------------ */
  {
    id: 'off-g3-english-t1',
    grade: 9,
    subject: 'English',
    term: 'Term 1',
    title: 'English — Third Preparatory',
    url: file('2026/Prepratory/Prepratory3/Term1/StudentBook/English_Prp3_Tr1.pdf'),
    sizeMb: 15.1,
    language: 'en',
  },
  {
    id: 'off-g3-arabic-t1',
    grade: 9,
    subject: 'Arabic',
    term: 'Term 1',
    title: 'اللغة العربية — الصف الثالث الإعدادي',
    url: file('2026_2027/Prepratory/Prepratory3/Term1/StudentBook/Arabic_language_prep3_t1.pdf'),
    sizeMb: 136.1,
    language: 'ar',
  },
  {
    id: 'off-g3-math-t1',
    grade: 9,
    subject: 'Mathematics',
    term: 'Term 1',
    title: 'Mathematics — Third Preparatory',
    url: file('2026_2027/Prepratory/Prepratory3/Term1/StudentBook/Math_EN_prep3_t1.pdf'),
    sizeMb: 46.2,
    language: 'en',
  },
  {
    id: 'off-g3-science-t1',
    grade: 9,
    subject: 'Science',
    term: 'Term 1',
    title: 'Science — Third Preparatory',
    url: file('2026/Prepratory/Prepratory3/Term1/StudentBook/Science_EN_Prp3_Tr1.pdf'),
    sizeMb: 19.4,
    language: 'en',
  },
  {
    id: 'off-g3-social-t1',
    grade: 9,
    subject: 'Social Studies',
    term: 'Term 1',
    title: 'Social Studies — Third Preparatory',
    url: file('2026_2027/Prepratory/Prepratory3/Term1/StudentBook/Social_studies_prep3_t1.pdf'),
    sizeMb: 28.8,
    language: 'en',
  },
  {
    id: 'off-g3-french-t1',
    grade: 9,
    subject: 'French',
    term: 'Term 1',
    title: 'Français — Troisième Préparatoire',
    url: file('2026/Prepratory/Prepratory3/Term1/StudentBook/French_Prp3_TR1.pdf'),
    sizeMb: 32,
    language: 'fr',
  },
]

const PRIMARY_LABELS = [
  'First Primary',
  'Second Primary',
  'Third Primary',
  'Fourth Primary',
  'Fifth Primary',
  'Sixth Primary',
]

const PREP_LABELS = ['First Preparatory', 'Second Preparatory', 'Third Preparatory']

export function officialFor(grade: GradeLevel, term: 'Term 1' | 'Term 2', subject: Subject | 'All') {
  return officialBooks.filter(
    (book) => book.grade === grade && book.term === term && (subject === 'All' || book.subject === subject),
  )
}

export function gradeLabel(grade: GradeLevel) {
  if (grade <= 6) return PRIMARY_LABELS[grade - 1]
  return PREP_LABELS[grade - 7] || 'Preparatory'
}
