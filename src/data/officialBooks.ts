import type { LanguageCode, Subject } from '@/types'

/**
 * Official Egyptian Ministry of Education books for the preparatory stage,
 * hosted on the ministry's public content blob storage.
 *
 * The files are downloaded by the student, then imported into the app so the
 * text extraction and the AI tutor stay 100% local. The ministry portal itself
 * blocks access from outside Egypt, but the PDF blobs are public.
 */
export interface OfficialBook {
  id: string
  grade: 1 | 2 | 3 | 4
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
  /* ------------------------------ Grade 1 ------------------------------ */
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
    sizeMb: 18.2,
    language: 'ar',
  },
  {
    id: 'off-p4-math-t1',
    grade: 4,
    subject: 'Mathematics',
    term: 'Term 1',
    title: 'Mathematics — Primary 4',
    url: file('2026/Primary/Primary4/Term1/StudentBook/Math_EN_prim4_TR1.pdf'),
    sizeMb: 24.6,
    language: 'en',
  },
  {
    id: 'off-p4-science-t1',
    grade: 4,
    subject: 'Science',
    term: 'Term 1',
    title: 'Science — Primary 4',
    url: file('2026/Primary/Primary4/Term1/StudentBook/Science_prim4_TR1.pdf'),
    sizeMb: 5.9,
    language: 'en',
  },
  {
    id: 'off-p4-social-t1',
    grade: 4,
    subject: 'Social Studies',
    term: 'Term 1',
    title: 'Social Studies — Primary 4',
    url: file('2026_2027/Primary/Primary4/Term1/StudentBook/Social_studies_prim4_t1.pdf'),
    sizeMb: 64.3,
    language: 'en',
  },

  {
    id: 'off-g1-english-t1',
    grade: 1,
    subject: 'English',
    term: 'Term 1',
    title: 'English — First Preparatory',
    url: file('2026/Prepratory/Prepratory1/Term1/StudentBook/English_Prp1_Tr1.pdf'),
    sizeMb: 5.7,
    language: 'en',
  },
  {
    id: 'off-g1-arabic-t1',
    grade: 1,
    subject: 'Arabic',
    term: 'Term 1',
    title: 'اللغة العربية — الصف الأول الإعدادي',
    url: file('2026/Prepratory/Prepratory1/Term1/StudentBook/Arabic_Prp1_Tr1.pdf'),
    sizeMb: 53.9,
    language: 'ar',
  },
  {
    id: 'off-g1-math-t1',
    grade: 1,
    subject: 'Mathematics',
    term: 'Term 1',
    title: 'Mathematics — First Preparatory',
    url: file('2026/Prepratory/Prepratory1/Term1/StudentBook/Mtah_E_Prp1_TR1.pdf'),
    sizeMb: 16,
    language: 'en',
  },
  {
    id: 'off-g1-science-t1',
    grade: 1,
    subject: 'Science',
    term: 'Term 1',
    title: 'Science — First Preparatory',
    url: file('2026_2027/Prepratory/Prepratory1/Term1/StudentBook/Science_Prep1_T1.pdf'),
    sizeMb: 69,
    language: 'en',
  },
  {
    id: 'off-g1-social-t1',
    grade: 1,
    subject: 'Social Studies',
    term: 'Term 1',
    title: 'Social Studies — First Preparatory',
    url: file('2026_2027/Prepratory/Prepratory1/Term1/StudentBook/Social_Studies_Prep1_T1.pdf'),
    sizeMb: 85.2,
    language: 'en',
  },
  {
    id: 'off-g1-french-t1',
    grade: 1,
    subject: 'French',
    term: 'Term 1',
    title: 'Français — Première Préparatoire',
    url: file('2026/Prepratory/Prepratory1/Term1/StudentBook/French_Prp1_TR1.pdf'),
    sizeMb: 12.3,
    language: 'fr',
  },

  /* ------------------------------ Grade 2 ------------------------------ */
  {
    id: 'off-g2-english-t1',
    grade: 2,
    subject: 'English',
    term: 'Term 1',
    title: 'English — Second Preparatory',
    url: file('2026/Prepratory/Prepratory2/Term1/StudentBook/English_Prp2_Tr1.pdf'),
    sizeMb: 38.3,
    language: 'en',
  },
  {
    id: 'off-g2-arabic-t1',
    grade: 2,
    subject: 'Arabic',
    term: 'Term 1',
    title: 'اللغة العربية — الصف الثاني الإعدادي',
    url: file('2026_2027/Prepratory/Prepratory2/Term1/StudentBook/Arabic_language_prep2_t1.pdf'),
    sizeMb: 106.5,
    language: 'ar',
  },
  {
    id: 'off-g2-math-t1',
    grade: 2,
    subject: 'Mathematics',
    term: 'Term 1',
    title: 'Mathematics — Second Preparatory',
    url: file('2026/Prepratory/Prepratory2/Term1/StudentBook/Math_En_PE2_SB_T1.pdf'),
    sizeMb: 11.9,
    language: 'en',
  },
  {
    id: 'off-g2-science-t1',
    grade: 2,
    subject: 'Science',
    term: 'Term 1',
    title: 'Science — Second Preparatory',
    url: file('2026/Prepratory/Prepratory2/Term1/StudentBook/Sci_En_PE2_SB_T1.pdf'),
    sizeMb: 28.4,
    language: 'en',
  },
  {
    id: 'off-g2-social-t1',
    grade: 2,
    subject: 'Social Studies',
    term: 'Term 1',
    title: 'Social Studies — Second Preparatory',
    url: file('2026/Prepratory/Prepratory2/Term1/StudentBook/Social_Prp2_Tr1.pdf'),
    sizeMb: 24.5,
    language: 'en',
  },
  {
    id: 'off-g2-french-t1',
    grade: 2,
    subject: 'French',
    term: 'Term 1',
    title: 'Français — Deuxième Préparatoire',
    url: file('2026/Prepratory/Prepratory2/Term1/StudentBook/French_Prp2_TR1.pdf'),
    sizeMb: 18.9,
    language: 'fr',
  },

  /* ------------------------------ Grade 3 ------------------------------ */
  {
    id: 'off-g3-english-t1',
    grade: 3,
    subject: 'English',
    term: 'Term 1',
    title: 'English — Third Preparatory',
    url: file('2026/Prepratory/Prepratory3/Term1/StudentBook/English_Prp3_Tr1.pdf'),
    sizeMb: 15.1,
    language: 'en',
  },
  {
    id: 'off-g3-arabic-t1',
    grade: 3,
    subject: 'Arabic',
    term: 'Term 1',
    title: 'اللغة العربية — الصف الثالث الإعدادي',
    url: file('2026_2027/Prepratory/Prepratory3/Term1/StudentBook/Arabic_language_prep3_t1.pdf'),
    sizeMb: 136.1,
    language: 'ar',
  },
  {
    id: 'off-g3-math-t1',
    grade: 3,
    subject: 'Mathematics',
    term: 'Term 1',
    title: 'Mathematics — Third Preparatory',
    url: file('2026_2027/Prepratory/Prepratory3/Term1/StudentBook/Math_EN_prep3_t1.pdf'),
    sizeMb: 46.2,
    language: 'en',
  },
  {
    id: 'off-g3-science-t1',
    grade: 3,
    subject: 'Science',
    term: 'Term 1',
    title: 'Science — Third Preparatory',
    url: file('2026/Prepratory/Prepratory3/Term1/StudentBook/Science_EN_Prp3_Tr1.pdf'),
    sizeMb: 19.4,
    language: 'en',
  },
  {
    id: 'off-g3-social-t1',
    grade: 3,
    subject: 'Social Studies',
    term: 'Term 1',
    title: 'Social Studies — Third Preparatory',
    url: file('2026_2027/Prepratory/Prepratory3/Term1/StudentBook/Social_studies_prep3_t1.pdf'),
    sizeMb: 28.8,
    language: 'en',
  },
  {
    id: 'off-g3-french-t1',
    grade: 3,
    subject: 'French',
    term: 'Term 1',
    title: 'Français — Troisième Préparatoire',
    url: file('2026/Prepratory/Prepratory3/Term1/StudentBook/French_Prp3_TR1.pdf'),
    sizeMb: 32,
    language: 'fr',
  },
]

export function officialFor(grade: 1 | 2 | 3 | 4, term: 'Term 1' | 'Term 2', subject: Subject | 'All') {
  return officialBooks.filter(
    (book) => book.grade === grade && book.term === term && (subject === 'All' || book.subject === subject),
  )
}

export function gradeLabel(grade: 1 | 2 | 3 | 4) {
  return grade === 4
    ? 'Fourth Primary'
    : grade === 1
      ? 'First Preparatory'
      : grade === 2
        ? 'Second Preparatory'
        : 'Third Preparatory'
}
