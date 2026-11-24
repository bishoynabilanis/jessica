import type { Book, BookUnit } from '@/types'

/**
 * Picks the lab that matches a lesson, from the unit's own title in the
 * Ministry book. No match means no button: nothing is guessed.
 */

const RULES: Array<{ lab: string; re: RegExp }> = [
  { lab: 'fractions', re: /كسر|كسور|fraction/ },
  { lab: 'geometry', re: /مساحه|محيط|area|perimeter/ },
  { lab: 'states', re: /حالات الماده|حاله الماده|states of matter/ },
  { lab: 'water', re: /دوره الماء|دوره المياه|water cycle/ },
  { lab: 'plants', re: /النبات|plant|photosynthesis|البناء الضوئي/ },
  { lab: 'magnet', re: /مغناطيس|magnet/ },
  { lab: 'clock', re: /الساعه|قراءه الوقت|clock|telling time/ },
  { lab: 'money', re: /النقود|العمله|money/ },
  { lab: 'symmetry', re: /تماثل|symmetr/ },
  { lab: 'shapes3d', re: /مجسم|solid shapes|3d shape/ },
  { lab: 'solar', re: /المجموعه الشمسيه|الكواكب|solar system|planets/ },
  { lab: 'shadow', re: /الظل|shadow/ },
  { lab: 'circuit', re: /دائره كهربي|الكهرباء|كهربي|electric|circuit/ },
  { lab: 'density', re: /كثافه|density/ },
  { lab: 'forces', re: /القوه|القوي|force/ },
  { lab: 'heat', re: /الحراره|heat/ },
  { lab: 'sound', re: /الصوت|sound/ },
  { lab: 'refraction', re: /انكسار|الضوء|refraction|light/ },
  { lab: 'lever', re: /رافعه|الروافع|lever/ },
  { lab: 'mixtures', re: /خلائط|مخاليط|mixture/ },
  { lab: 'atom', re: /الذره|ذرات|atom/ },
  { lab: 'ph', re: /الاحماض|القواعد|acids|bases/ },
  { lab: 'periodic', re: /الجدول الدوري|periodic table/ },
  { lab: 'genetics', re: /الوراثه|genetic/ },
  { lab: 'digestion', re: /الهضم|digest/ },
  { lab: 'circulation', re: /الدوره الدمويه|القلب|circulat/ },
  { lab: 'pressure', re: /الضغط|pressure/ },
  { lab: 'percent', re: /النسبه المئويه|percent/ },
  { lab: 'balance', re: /المعادله|المعادلات|equation/ },
  { lab: 'stats', re: /الاحصاء|المتوسط|statistic/ },
  { lab: 'parabola', re: /القطع المكافئ|parabola|quadratic/ },
  { lab: 'binary', re: /النظام الثنائي|binary/ },
  { lab: 'numberline', re: /خط الاعداد|number line/ },
  { lab: 'placevalue', re: /القيمه المكانيه|place value/ },
  { lab: 'times', re: /جدول الضرب|الضرب|multiplication|times table/ },
]

export const KIDS_LAB_IDS = ['fractions', 'states', 'water', 'plants']

function flat(text: string) {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
}

export function labForUnit(unit: Pick<BookUnit, 'title'> | undefined): string | null {
  if (!unit?.title) return null
  const title = flat(unit.title)
  return RULES.find((rule) => rule.re.test(title))?.lab ?? null
}

export function labLink(base: '/labs' | '/kids/labs', book: Pick<Book, 'id' | 'title'>, unit: BookUnit, lab: string) {
  const q = new URLSearchParams({ lab, book: book.id, unit: unit.id, page: String(unit.startPage) })
  return `${base}?${q.toString()}`
}
