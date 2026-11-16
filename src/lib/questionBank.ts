import type { GradeLevel } from '@/types'
import { placementTest } from '@/lib/placement'

/**
 * The question bank: every question is generated on the device from a safe
 * template, so it can never be wrong, never repeats a fixed paper and needs no
 * network or AI key. This is the app's answer to a printed question book.
 */

export type BankSubject = 'Mathematics' | 'Science' | 'English' | 'Arabic' | 'Social Studies' | 'ICT'

export interface BankQuestion {
  id: string
  subject: BankSubject
  skill: string
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

interface Raw {
  skill: string
  prompt: string
  value: string
  why: string
}

const AR = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
const ar = (value: number | string) => String(value).replace(/[0-9]/g, (d) => AR[Number(d)])
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = <T,>(list: readonly T[]): T => list[rnd(0, list.length - 1)]

/* ------------------------------- Science ------------------------------- */

const SCIENCE: Array<{ skill: string; make: () => Raw }> = [
  {
    skill: 'Speed',
    make() {
      const d = rnd(20, 200)
      const t = rnd(2, 10)
      return {
        skill: 'Speed',
        prompt: `قطعت سيارة ${ar(d)} كم في ${ar(t)} ساعات. سرعتها المتوسطة = ؟ كم/س`,
        value: String(d / t),
        why: `السرعة = المسافة ÷ الزمن = ${ar(d)} ÷ ${ar(t)} = ${ar(d / t)} كم/س`,
      }
    },
  },
  {
    skill: 'Pressure',
    make() {
      const f = rnd(10, 100)
      const a = pick([2, 4, 5, 10])
      return {
        skill: 'Pressure',
        prompt: `قوة ${ar(f)} نيوتن تؤثر على مساحة ${ar(a)} م². الضغط = ؟ باسكال`,
        value: String(f / a),
        why: `الضغط = القوة ÷ المساحة = ${ar(f)} ÷ ${ar(a)} = ${ar(f / a)} باسكال`,
      }
    },
  },
  {
    skill: 'Density',
    make() {
      const m = rnd(20, 200)
      const v = pick([2, 4, 5, 10])
      return {
        skill: 'Density',
        prompt: `كتلة جسم ${ar(m)} جم وحجمه ${ar(v)} سم³. كثافته = ؟ جم/سم³`,
        value: String(m / v),
        why: `الكثافة = الكتلة ÷ الحجم = ${ar(m)} ÷ ${ar(v)} = ${ar(m / v)} جم/سم³`,
      }
    },
  },
  {
    skill: 'Force',
    make() {
      const m = rnd(2, 20)
      const a = rnd(2, 10)
      return {
        skill: 'Force',
        prompt: `كتلة ${ar(m)} كجم تتحرك بعجلة ${ar(a)} م/ث². القوة = ؟ نيوتن`,
        value: String(m * a),
        why: `القوة = الكتلة × العجلة = ${ar(m)} × ${ar(a)} = ${ar(m * a)} نيوتن`,
      }
    },
  },
  {
    skill: 'Ohm’s law',
    make() {
      const i = pick([2, 3, 4, 5])
      const r = pick([5, 10, 20])
      return {
        skill: 'Ohm’s law',
        prompt: `مقاومة ${ar(r)} أوم ويمر بها تيار ${ar(i)} أمبير. فرق الجهد = ؟ فولت`,
        value: String(i * r),
        why: `فرق الجهد = التيار × المقاومة = ${ar(i)} × ${ar(r)} = ${ar(i * r)} فولت`,
      }
    },
  },
  {
    skill: 'Work',
    make() {
      const f = rnd(10, 100)
      const d = rnd(2, 20)
      return {
        skill: 'Work',
        prompt: `قوة ${ar(f)} نيوتن تحرّك جسمًا ${ar(d)} متر. الشغل = ؟ جول`,
        value: String(f * d),
        why: `الشغل = القوة × المسافة = ${ar(f)} × ${ar(d)} = ${ar(f * d)} جول`,
      }
    },
  },
  {
    skill: 'Units',
    make() {
      const km = rnd(2, 9)
      return {
        skill: 'Units',
        prompt: `${ar(km)} كم = ؟ متر`,
        value: String(km * 1000),
        why: `الكيلومتر = ١٠٠٠ متر، إذن ${ar(km)} × ١٠٠٠ = ${ar(km * 1000)} متر`,
      }
    },
  },
  {
    skill: 'Energy',
    make() {
      const m = rnd(1, 10)
      const v = pick([2, 3, 4, 5])
      return {
        skill: 'Energy',
        prompt: `طاقة حركة جسم كتلته ${ar(m)} كجم وسرعته ${ar(v)} م/ث = ؟ جول`,
        value: String(Math.round(0.5 * m * v * v)),
        why: `طاقة الحركة = ½ × الكتلة × مربع السرعة = ½ × ${ar(m)} × ${ar(v * v)} = ${ar(Math.round(0.5 * m * v * v))} جول`,
      }
    },
  },
  {
    skill: 'Weight',
    make() {
      const m = rnd(2, 20)
      return {
        skill: 'Weight',
        prompt: `وزن جسم كتلته ${ar(m)} كجم على سطح الأرض (ج = ${ar(10)}) = ؟ نيوتن`,
        value: String(m * 10),
        why: `الوزن = الكتلة × عجلة الجذب = ${ar(m)} × ${ar(10)} = ${ar(m * 10)} نيوتن`,
      }
    },
  },
  {
    skill: 'Temperature',
    make() {
      const c = pick([0, 10, 25, 37, 50, 100])
      return {
        skill: 'Temperature',
        prompt: `درجة حرارة ${ar(c)}° مئوية = ؟ كلفن`,
        value: String(c + 273),
        why: `الكلفن = المئوية + ٢٧٣ = ${ar(c)} + ${ar(273)} = ${ar(c + 273)} كلفن`,
      }
    },
  },
  {
    skill: 'Units',
    make() {
      const kg = rnd(2, 9)
      return {
        skill: 'Units',
        prompt: `${ar(kg)} كجم = ؟ جرام`,
        value: String(kg * 1000),
        why: `الكيلوجرام = ١٠٠٠ جرام، إذن ${ar(kg)} × ١٠٠٠ = ${ar(kg * 1000)} جرام`,
      }
    },
  },
]

/* -------------------------------- English ------------------------------- */

const PLURALS: Array<[string, string]> = [
  ['book', 'books'], ['box', 'boxes'], ['city', 'cities'], ['child', 'children'],
  ['man', 'men'], ['woman', 'women'], ['mouse', 'mice'], ['foot', 'feet'],
  ['tooth', 'teeth'], ['leaf', 'leaves'], ['knife', 'knives'], ['bus', 'buses'],
  ['watch', 'watches'], ['baby', 'babies'], ['person', 'people'], ['fish', 'fish'],
]

const IRREGULAR_PAST: Array<[string, string]> = [
  ['go', 'went'], ['eat', 'ate'], ['see', 'saw'], ['write', 'wrote'], ['take', 'took'],
  ['make', 'made'], ['come', 'came'], ['drink', 'drank'], ['run', 'ran'], ['buy', 'bought'],
  ['think', 'thought'], ['teach', 'taught'], ['catch', 'caught'], ['sleep', 'slept'],
  ['speak', 'spoke'], ['break', 'broke'],
]

const COMPARATIVES: Array<[string, string]> = [
  ['big', 'bigger'], ['happy', 'happier'], ['good', 'better'], ['bad', 'worse'],
  ['fast', 'faster'], ['easy', 'easier'], ['hot', 'hotter'], ['far', 'farther'],
  ['small', 'smaller'], ['beautiful', 'more beautiful'], ['difficult', 'more difficult'],
]

const ENGLISH: Array<{ skill: string; make: () => Raw }> = [
  {
    skill: 'Plurals',
    make() {
      const [word, plural] = pick(PLURALS)
      return { skill: 'Plurals', prompt: `What is the plural of “${word}”?`, value: plural, why: `“${word}” → “${plural}”.` }
    },
  },
  {
    skill: 'Articles',
    make() {
      const vowel = pick(['apple', 'orange', 'egg', 'umbrella', 'island', 'hour'])
      const consonant = pick(['book', 'car', 'house', 'pen', 'table', 'university'])
      const useVowel = Math.random() < 0.5
      const word = useVowel ? vowel : consonant
      return {
        skill: 'Articles',
        prompt: `Choose the right article: “I saw ___ ${word}.”`,
        value: useVowel ? 'an' : 'a',
        why: useVowel ? `“${word}” starts with a vowel sound, so we use “an”.` : `“${word}” starts with a consonant sound, so we use “a”.`,
      }
    },
  },
  {
    skill: 'Past simple',
    make() {
      const [base, past] = pick(IRREGULAR_PAST)
      return {
        skill: 'Past simple',
        prompt: `Choose the past simple: “Yesterday I ___ to school.” (verb: ${base})`,
        value: past,
        why: `“${base}” is irregular: ${base} → ${past}.`,
      }
    },
  },
  {
    skill: 'Comparatives',
    make() {
      const [base, comparative] = pick(COMPARATIVES)
      return {
        skill: 'Comparatives',
        prompt: `Choose the comparative of “${base}”.`,
        value: comparative,
        why: `The comparative of “${base}” is “${comparative}”.`,
      }
    },
  },
  {
    skill: 'Prepositions',
    make() {
      const options: Array<[string, string]> = [
        ['The book is ___ the table.', 'on'],
        ['We meet ___ Monday.', 'on'],
        ['She was born ___ 2010.', 'in'],
        ['He arrives ___ 7 o’clock.', 'at'],
        ['The cat is ___ the box.', 'in'],
        ['We go ___ school every day.', 'to'],
      ]
      const [prompt, value] = pick(options)
      return { skill: 'Prepositions', prompt, value, why: `The correct preposition here is “${value}”.` }
    },
  },
  {
    skill: 'Present simple',
    make() {
      const verb = pick(['play', 'study', 'watch', 'go', 'like', 'read'])
      const third = verb.endsWith('y') ? `${verb.slice(0, -1)}ies` : verb.endsWith('ch') || verb.endsWith('sh') ? `${verb}es` : verb.endsWith('o') ? `${verb}es` : `${verb}s`
      return {
        skill: 'Present simple',
        prompt: `Choose the correct form: “She ___ every day.” (verb: ${verb})`,
        value: third,
        why: `With he/she/it we add -s/-es: ${verb} → ${third}.`,
      }
    },
  },
]

/* -------------------------------- Arabic -------------------------------- */

const AR_PLURALS: Array<[string, string]> = [
  ['كتاب', 'كتب'], ['قلم', 'أقلام'], ['باب', 'أبواب'], ['ولد', 'أولاد'], ['بيت', 'بيوت'],
  ['شجرة', 'أشجار'], ['طالب', 'طلاب'], ['مدرسة', 'مدارس'], ['مدينة', 'مدن'], ['نهر', 'أنهار'],
  ['عين', 'عيون'], ['يد', 'أيدٍ'], ['رجل', 'رجال'], ['امرأة', 'نساء'], ['طفل', 'أطفال'],
]

const AR_OPPOSITES: Array<[string, string]> = [
  ['كبير', 'صغير'], ['طويل', 'قصير'], ['سريع', 'بطيء'], ['قوي', 'ضعيف'], ['نظيف', 'متسخ'],
  ['سهل', 'صعب'], ['قريب', 'بعيد'], ['كثير', 'قليل'], ['فرح', 'حزين'], ['فاتح', 'غامق'],
  ['ساخن', 'بارد'], ['قديم', 'جديد'], ['أمام', 'خلف'], ['فوق', 'تحت'], ['ليل', 'نهار'],
]

const AR_HAMZA: Array<[string, string, string]> = [
  ['أحمد', 'أ', 'تبدأ بهمزة قطع مكتوبة على الألف: أ.'],
  ['إبراهيم', 'إ', 'تبدأ بهمزة قطع مكسورة: إ.'],
  ['اسم', 'ا', 'همزة وصل، تُكتب ألف بدون همزة.'],
  ['ابن', 'ا', 'همزة وصل، تُكتب ألف بدون همزة.'],
  ['أكل', 'أ', 'همزة قطع مفتوحة: أ.'],
  ['اجتهد', 'ا', 'فعل أمر بهمزة وصل: ا.'],
]

const ARABIC: Array<{ skill: string; make: () => Raw }> = [
  {
    skill: 'الجمع',
    make() {
      const [single, plural] = pick(AR_PLURALS)
      return { skill: 'الجمع', prompt: `جمع كلمة «${single}» هو؟`, value: plural, why: `جمع «${single}» هو «${plural}».` }
    },
  },
  {
    skill: 'الأضداد',
    make() {
      const [word, opposite] = pick(AR_OPPOSITES)
      return { skill: 'الأضداد', prompt: `ما عكس كلمة «${word}»؟`, value: opposite, why: `عكس «${word}» هو «${opposite}».` }
    },
  },
  {
    skill: 'الهمزة',
    make() {
      const [word, letter, why] = pick(AR_HAMZA)
      return { skill: 'الهمزة', prompt: `كلمة «${word}» تبدأ بحرف؟`, value: letter, why }
    },
  },
  {
    skill: 'نوع الجملة',
    make() {
      const nominal = Math.random() < 0.5
      const sentences: Array<[string, string]> = nominal
        ? [['الطالب مجتهد.', 'اسمية'], ['الجو جميل.', 'اسمية'], ['المدرسة كبيرة.', 'اسمية'], ['الكتاب جديد.', 'اسمية']]
        : [['يذاكر الطالب.', 'فعلية'], ['لعب الأطفال.', 'فعلية'], ['كتب المعلم الدرس.', 'فعلية'], ['ذهبنا إلى المدرسة.', 'فعلية']]
      const [prompt, value] = pick(sentences)
      return {
        skill: 'نوع الجملة',
        prompt: `«${prompt}» جملة؟`,
        value,
        why: value === 'اسمية' ? 'بدأت باسم، فهي جملة اسمية.' : 'بدأت بفعل، فهي جملة فعلية.',
      }
    },
  },
  {
    skill: 'المفرد والجمع',
    make() {
      const [single, plural] = pick(AR_PLURALS)
      return { skill: 'المفرد والجمع', prompt: `مفرد كلمة «${plural}» هو؟`, value: single, why: `مفرد «${plural}» هو «${single}».` }
    },
  },
]

/* ------------------------------- Assembly ------------------------------- */

function seededShuffle<T>(list: T[], seed: string) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % 2147483647
  const out = [...list]
  for (let i = out.length - 1; i > 0; i -= 1) {
    hash = (hash * 1103515245 + 12345) % 2147483647
    const j = hash % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function distractors(value: string, pool: string[]) {
  const options = new Set<string>([value])
  for (const item of pool) {
    if (options.size >= 4) break
    if (item !== value) options.add(item)
  }
  let step = 1
  while (options.size < 4 && step < 20) {
    const numeric = Number(value)
    if (Number.isFinite(numeric)) {
      const candidate = String(numeric + step)
      if (candidate !== value) options.add(candidate)
    } else {
      options.add(`${value}${'؟'.repeat(step)}`)
    }
    step += 1
  }
  return [...options]
}

function toQuestion(raw: Raw, subject: BankSubject, index: number): BankQuestion {
  const pool = Object.values(poolsFor(subject)).flat()
  const numbers = pool.filter((item) => Number.isFinite(Number(item)) && Number.isFinite(Number(raw.value)))
  const candidates = seededShuffle(raw.value && Number.isFinite(Number(raw.value)) ? numbers.map(String) : pool, raw.prompt)
  const options = seededShuffle(distractors(raw.value, candidates), `${raw.prompt}${index}`)
  return {
    id: `${subject}-${index}-${raw.prompt.slice(0, 12)}`,
    subject,
    skill: raw.skill,
    prompt: raw.prompt,
    options,
    answer: options.indexOf(raw.value),
    explanation: raw.why,
  }
}

/** Static answer pools per subject, used to build believable distractors. */
function poolsFor(subject: BankSubject): Record<string, string[]> {
  if (subject === 'English') {
    return {
      plurals: PLURALS.map(([, plural]) => plural),
      past: IRREGULAR_PAST.map(([, past]) => past),
      comparative: COMPARATIVES.map(([, comparative]) => comparative),
      articles: ['a', 'an', 'the', '—'],
      prepositions: ['in', 'on', 'at', 'to', 'for', 'with'],
      present: ['plays', 'play', 'playing', 'played', 'studies', 'study', 'watches', 'goes', 'reads', 'likes'],
    }
  }
  if (subject === 'Arabic') {
    return {
      plural: AR_PLURALS.map(([, plural]) => plural).concat(AR_PLURALS.map(([single]) => single)),
      opposites: AR_OPPOSITES.map(([, opposite]) => opposite).concat(AR_OPPOSITES.map(([word]) => word)),
      hamza: ['أ', 'إ', 'ا', 'آ'],
      sentence: ['اسمية', 'فعلية'],
    }
  }
  return {
    numbers: ['1', '2', '3', '4', '5', '6', '8', '10', '12', '15', '20', '25', '30', '40', '50', '60', '100'],
  }
}

function rawFor(subject: BankSubject): Raw[] {
  const generators = subject === 'Science' ? SCIENCE : subject === 'English' ? ENGLISH : ARABIC
  return generators.map((generator) => generator.make())
}

/** Build a drill: no duplicate prompts, four options each, answers explained. */

/* ---------------------- Concept subjects (text options) ------------------- */

interface TextItem {
  skill: string
  prompt: string
  correct: string
  wrongs: [string, string, string]
  why: string
  /** 'all' shows everywhere, otherwise only for that stage. */
  band?: 'primary' | 'prep' | 'all'
}

const SOCIAL_STUDIES: TextItem[] = [
  {
    skill: 'جغرافيا مصر',
    prompt: 'عاصمة مصر هي؟',
    correct: 'القاهرة',
    wrongs: ['الإسكندرية', 'أسوان', 'طنطا'],
    why: 'القاهرة هي العاصمة وأكبر مدينة في مصر.',
    band: 'all',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'النيل بيصب في أي بحر؟',
    correct: 'البحر المتوسط',
    wrongs: ['البحر الأحمر', 'البحر العربي', 'خليج السويس'],
    why: 'فرعا النيل (دمياط ورشيد) بيصبو في البحر المتوسط شمال مصر.',
    band: 'all',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'أطول نهر في مصر؟',
    correct: 'النيل',
    wrongs: ['الفرات', 'دجلة', 'الأمازون'],
    why: 'النيل أطول نهر بيمر في مصر، والزراعة والشرب بيعتمدوا عليه.',
    band: 'all',
  },
  {
    skill: 'خرائط',
    prompt: 'الاتجاه اللي بتشرق منه الشمس؟',
    correct: 'الشرق',
    wrongs: ['الغرب', 'الشمال', 'الجنوب'],
    why: 'الشمس بتشرق من الشرق وتغرب في الغرب.',
    band: 'primary',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'قناة السويس بتربط بين أي بحرين؟',
    correct: 'المتوسط والأحمر',
    wrongs: ['الأحمر والعربي', 'المتوسط والأسود', 'الأسود وقزوين'],
    why: 'قناة السويس بتوصل المتوسط بالبحر الأحمر وبتقصّر طريق الملاحة.',
    band: 'all',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'الصحراء اللي فيها واحة سيوة؟',
    correct: 'الصحراء الغربية',
    wrongs: ['الصحراء الشرقية', 'سيناء', 'الدلتا'],
    why: 'سيوة في الصحراء الغربية، وغربها ليبيا.',
    band: 'all',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'شبه الجزيرة اللي في شرق مصر؟',
    correct: 'سيناء',
    wrongs: ['الدلتا', 'الفيوم', 'الواحات'],
    why: 'سيناء شبه جزيرة بين خليجي السويس والعقبة.',
    band: 'all',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'البلد اللي على غرب مصر؟',
    correct: 'ليبيا',
    wrongs: ['السودان', 'فلسطين', 'الأردن'],
    why: 'ليبيا على الغرب، والسودان على الجنوب.',
    band: 'primary',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'البلد اللي على جنوب مصر؟',
    correct: 'السودان',
    wrongs: ['ليبيا', 'تشاد', 'إثيوبيا'],
    why: 'السودان جنوب مصر، والنيل بيجي منها.',
    band: 'primary',
  },
  {
    skill: 'اقتصاد',
    prompt: 'أشهر محصول زراعي مصري اشتهر عالميًا؟',
    correct: 'القطن',
    wrongs: ['البن', 'الكاكاو', 'الشاي'],
    why: 'القطن المصري طويل التيلة وكان أهم الصادرات.',
    band: 'all',
  },
  {
    skill: 'تاريخ مصر',
    prompt: 'الأهرامات موجودة في محافظة؟',
    correct: 'الجيزة',
    wrongs: ['الإسكندرية', 'أسوان', 'الأقصر'],
    why: 'أهرامات الجيزة على هضبة الجيزة غرب النيل.',
    band: 'primary',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'السد العالي موجود في؟',
    correct: 'أسوان',
    wrongs: ['القاهرة', 'الإسكندرية', 'المنصورة'],
    why: 'السد العالي في أسوان، وبحيرة السد اسمها ناصر.',
    band: 'primary',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'بحيرة السد العالي اسمها؟',
    correct: 'بحيرة ناصر',
    wrongs: ['بحيرة قارون', 'المنزلة', 'البرلس'],
    why: 'السد العالي عمل بحيرة ناصر جنوب أسوان.',
    band: 'primary',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'الدلتا بتقع في أي جزء من مصر؟',
    correct: 'شمال مصر',
    wrongs: ['جنوب مصر', 'شرق مصر', 'غرب مصر'],
    why: 'الدلتا في الشمال، ما بين فرعي النيل والبحر المتوسط.',
    band: 'primary',
  },
  {
    skill: 'محافظات',
    prompt: 'عدد محافظات مصر؟',
    correct: '٢٧',
    wrongs: ['٢٠', '٢٣', '٣٠'],
    why: 'مصر فيها ٢٧ محافظة.',
    band: 'primary',
  },
  {
    skill: 'محافظات',
    prompt: 'عاصمة محافظة الإسكندرية؟',
    correct: 'الإسكندرية',
    wrongs: ['دمنهور', 'طنطا', 'كفر الشيخ'],
    why: 'الإسكندرية عاصمة المحافظة، ودمنهور للبحيرة وطنطا للغربية.',
    band: 'all',
  },
  {
    skill: 'مواطنة',
    prompt: 'نشيد مصر الوطني اسمه؟',
    correct: 'بلادي بلادي',
    wrongs: ['موطني', 'الله معك', 'عاشت مصر'],
    why: '«بلادي بلادي» كلمات يونس القاضي وألحان سيد درويش.',
    band: 'primary',
  },
  {
    skill: 'تاريخ مصر',
    prompt: 'عيد تحرير سيناء في؟',
    correct: '٢٥ أبريل',
    wrongs: ['٦ أكتوبر', '١ يوليو', '١٠ يونيو'],
    why: '٢٥ أبريل هو عيد تحرير سيناء.',
    band: 'primary',
  },
  {
    skill: 'تاريخ مصر',
    prompt: 'مين اللي بنى الهرم الأكبر؟',
    correct: 'خوفو',
    wrongs: ['خفرع', 'منقرع', 'سنفرو'],
    why: 'الهرم الأكبر بناه الملك خوفو من الأسرة الرابعة.',
    band: 'all',
  },
  {
    skill: 'تاريخ مصر',
    prompt: 'الكتابة المصرية القديمة اسمها؟',
    correct: 'الهيروغليفية',
    wrongs: ['اللاتينية', 'العربية', 'الآرامية'],
    why: 'المصري القديم كتب بالهيروغليفية على المعابد والبردي.',
    band: 'all',
  },
  {
    skill: 'تاريخ مصر',
    prompt: 'الحضارة المصرية القديمة قامت على؟',
    correct: 'نهر النيل',
    wrongs: ['البحر الأحمر', 'سيناء', 'الصحراء الغربية'],
    why: 'النيل والفيضان هما اللي ساعدوا على الزراعة والاستقرار.',
    band: 'all',
  },
  {
    skill: 'تاريخ مصر',
    prompt: 'الملكة المصرية القديمة اللي اشتُهرت بالحكم؟',
    correct: 'حتشبسوت',
    wrongs: ['كليوباترا', 'نفرتيتي', 'تي'],
    why: 'حتشبسوت حكمت مصر في الأسرة الـ١٨.',
    band: 'prep',
  },
  {
    skill: 'جغرافيا العالم',
    prompt: 'مصر موجودة في قارة؟',
    correct: 'أفريقيا',
    wrongs: ['آسيا', 'أوروبا', 'أستراليا'],
    why: 'مصر في شمال أفريقيا وبتربطها بآسيا سيناء.',
    band: 'all',
  },
  {
    skill: 'جغرافيا العالم',
    prompt: 'أكبر قارة في المساحة؟',
    correct: 'آسيا',
    wrongs: ['أفريقيا', 'أوروبا', 'أمريكا الشمالية'],
    why: 'آسيا أكبر قارة مساحة وسكانًا.',
    band: 'prep',
  },
  {
    skill: 'جغرافيا العالم',
    prompt: 'أكبر محيط في العالم؟',
    correct: 'المحيط الهادي',
    wrongs: ['الأطلنطي', 'الهندي', 'المتجمد'],
    why: 'الهادي أكبر وأعمق محيط.',
    band: 'prep',
  },
  {
    skill: 'خرائط',
    prompt: 'خط الطول الرئيسي بيمر في؟',
    correct: 'جرينتش',
    wrongs: ['القاهرة', 'باريس', 'نيويورك'],
    why: 'خط جرينتش هو خط الطول صفر.',
    band: 'prep',
  },
  {
    skill: 'خرائط',
    prompt: 'خط الاستواء بيقسم الأرض لـ؟',
    correct: 'نصفين شمال وجنوب',
    wrongs: ['شرق وغرب', 'شرق وشمال', 'جنوب وغرب'],
    why: 'الاستواء بيقسّم الأرض نص شمالي ونص جنوبي.',
    band: 'prep',
  },
  {
    skill: 'جغرافيا العالم',
    prompt: 'عدد قارات العالم؟',
    correct: '٧',
    wrongs: ['٥', '٦', '٨'],
    why: 'القارات سبعة: آسيا وأفريقيا وأوروبا وأمريكا الشمالية والجنوبية وأستراليا والقارة المتجمدة الجنوبية.',
    band: 'prep',
  },
  {
    skill: 'مناخ',
    prompt: 'مناخ مصر في الأغلب؟',
    correct: 'صحراوي',
    wrongs: ['استوائي', 'ممطر طول السنة', 'قطبي'],
    why: 'مصر صحراوية، أمطارها قليلة على السواحل.',
    band: 'prep',
  },
  {
    skill: 'مناخ',
    prompt: 'أمطار مصر معظمها في؟',
    correct: 'الشتاء',
    wrongs: ['الصيف', 'الربيع', 'الخريف'],
    why: 'الشتاء هو موسم الأمطار القليلة على السواحل.',
    band: 'prep',
  },
  {
    skill: 'مواطنة',
    prompt: 'السلطة اللي بتسن القوانين؟',
    correct: 'مجلس النواب',
    wrongs: ['مجلس الوزراء', 'المحكمة الدستورية', 'مجلس الشيوخ'],
    why: 'مجلس النواب بيوافق على القوانين، والحكومة بتنفّذ والقضاء بيراقب.',
    band: 'prep',
  },
  {
    skill: 'مواطنة',
    prompt: 'الدستور هو؟',
    correct: 'القانون الأعلى في الدولة',
    wrongs: ['قانون المرور', 'قرار وزاري', 'لائحة مدرسة'],
    why: 'كل القوانين لازم تتوافق مع الدستور.',
    band: 'prep',
  },
  {
    skill: 'مواطنة',
    prompt: 'اللي بيرأس الحكومة في مصر؟',
    correct: 'رئيس الوزراء',
    wrongs: ['رئيس الجمهورية', 'وزير الداخلية', 'محافظ القاهرة'],
    why: 'رئيس الوزراء بيرأس مجلس الوزراء.',
    band: 'prep',
  },
  {
    skill: 'محافظات',
    prompt: 'الوحدة الإدارية اللي بيحكمها محافظ؟',
    correct: 'المحافظة',
    wrongs: ['المركز', 'الحي', 'القرية'],
    why: 'مصر مقسمة محافظات، وكل واحدة بيحكمها محافظ.',
    band: 'prep',
  },
  {
    skill: 'اقتصاد',
    prompt: 'الزراعة في مصر بتعتمد بشكل أساسي على؟',
    correct: 'مياه النيل',
    wrongs: ['الأمطار', 'الآبار', 'تحلية البحر'],
    why: 'أغلب الزراعة في الوادي والدلتا معتمدة على النيل.',
    band: 'all',
  },
  {
    skill: 'اقتصاد',
    prompt: 'السياحة المصرية مشهورة بـ؟',
    correct: 'الآثار والمناطق الأثرية',
    wrongs: ['الغابات', 'الثلوج', 'البراكين'],
    why: 'الأهرامات والمعابد والمتاحف أهم عوامل الجذب السياحي.',
    band: 'all',
  },
  {
    skill: 'اقتصاد',
    prompt: 'أهم ممر مائي صناعي في مصر؟',
    correct: 'قناة السويس',
    wrongs: ['ترعة الإسماعيلية', 'الرياح التوفيقي', 'قناة السويس الجديدة فقط'],
    why: 'قناة السويس أهم ممر ملاحي صناعي في مصر.',
    band: 'all',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'مصر بتطل على بحرين هما؟',
    correct: 'المتوسط والأحمر',
    wrongs: ['المتوسط والأسود', 'الأحمر والعربي', 'الأسود وقزوين'],
    why: 'سواحل مصر على المتوسط شمالًا والأحمر شرقًا.',
    band: 'all',
  },
  {
    skill: 'جغرافيا العالم',
    prompt: 'أكبر صحراء حارة في العالم؟',
    correct: 'الصحراء الكبرى',
    wrongs: ['الربع الخالي', 'صحراء جوبي', 'صحراء أتاكاما'],
    why: 'الصحراء الكبرى في شمال أفريقيا.',
    band: 'prep',
  },
  {
    skill: 'تاريخ مصر',
    prompt: 'الفيضان عند المصري القديم كان بيعمل إيه؟',
    correct: 'بيخصّب الأرض بالطمي',
    wrongs: ['بيغرق المدن دائمًا', 'بيمنع الزراعة', 'بينقل الصخور'],
    why: 'طمي الفيضان كان بيجدّد خصوبة الأرض كل سنة.',
    band: 'all',
  },
]

const ICT: TextItem[] = [
  {
    skill: 'مكونات الكمبيوتر',
    prompt: 'الذاكرة المؤقتة اللي بتضيع لما نقفل الجهاز؟',
    correct: 'RAM',
    wrongs: ['ROM', 'SSD', 'CPU'],
    why: 'RAM ذاكرة عشوائية مؤقتة، وROM دائمة.',
    band: 'all',
  },
  {
    skill: 'مكونات الكمبيوتر',
    prompt: 'العقل اللي بينفّذ الأوامر في الكمبيوتر؟',
    correct: 'المعالج (CPU)',
    wrongs: ['الذاكرة (RAM)', 'الشاشة', 'الهارد'],
    why: 'المعالج بينفّذ التعليمات والعمليات الحسابية والمنطقية.',
    band: 'all',
  },
  {
    skill: 'ملفات',
    prompt: 'امتداد ملف صورة شفاف الخلفية؟',
    correct: '.png',
    wrongs: ['.docx', '.mp3', '.exe'],
    why: 'PNG بيدعم الشفافية، DOCX مستند وMP3 صوت وEXE برنامج.',
    band: 'all',
  },
  {
    skill: 'إنترنت',
    prompt: 'علامة لازم تكون في أي بريد إلكتروني صحيح؟',
    correct: '@',
    wrongs: ['#', '&', '*'],
    why: 'الإيميل: اسم المستخدم ثم @ ثم اسم النطاق.',
    band: 'all',
  },
  {
    skill: 'أمان',
    prompt: 'كلمة السر القوية لازم تكون؟',
    correct: 'طويلة وفيها حروف وأرقام ورموز',
    wrongs: ['اسمك وتاريخ ميلادك', 'كلمة سهلة واحدة', 'نفس الكلمة في كل المواقع'],
    why: 'الطول والتنوع بيصعّبوا التخمين.',
    band: 'all',
  },
  {
    skill: 'برامج',
    prompt: 'البرنامج اللي بيفتح صفحات الويب؟',
    correct: 'متصفح (Browser)',
    wrongs: ['محرر نصوص', 'مشغل فيديو', 'برنامج ضغط'],
    why: 'Chrome وEdge متصفحات.',
    band: 'all',
  },
  {
    skill: 'ملفات',
    prompt: 'عشان نحفظ نسخة باسم جديد؟',
    correct: 'Save As',
    wrongs: ['Print', 'Undo', 'Close'],
    why: 'Save As بيحفظ نسخة من غير ما يغيّر الأصل.',
    band: 'all',
  },
  {
    skill: 'أمان',
    prompt: 'الفيروس برنامج؟',
    correct: 'ضار بيضر الجهاز والملفات',
    wrongs: ['بيسرّع الجهاز', 'بينضّف الملفات', 'بيزوّد المساحة'],
    why: 'الفيروس خبيث وبيكرر نفسه، وبنحمي بمكافح فيروسات.',
    band: 'all',
  },
  {
    skill: 'مكونات الكمبيوتر',
    prompt: 'الهارد ديسك بيستخدم في؟',
    correct: 'تخزين الملفات بشكل دائم',
    wrongs: ['تشغيل الألعاب فقط', 'طباعة الورق', 'تسريع الإنترنت'],
    why: 'الهارد بيحتفظ بالملفات بعد إغلاق الجهاز.',
    band: 'all',
  },
  {
    skill: 'مكونات الكمبيوتر',
    prompt: 'الشاشة وحدة؟',
    correct: 'إخراج',
    wrongs: ['إدخال', 'تخزين', 'معالجة'],
    why: 'الشاشة بتعرض النتائج، فهي إخراج.',
    band: 'primary',
  },
  {
    skill: 'مكونات الكمبيوتر',
    prompt: 'الكيبورد وحدة؟',
    correct: 'إدخال',
    wrongs: ['إخراج', 'تخزين', 'اتصال'],
    why: 'الكيبورد بيدخل بيانات للجهاز.',
    band: 'primary',
  },
  {
    skill: 'مكونات الكمبيوتر',
    prompt: 'الماوس وحدة؟',
    correct: 'إدخال',
    wrongs: ['إخراج', 'تخزين', 'طباعة'],
    why: 'الماوس بيدخل أوامر وتحديد.',
    band: 'primary',
  },
  {
    skill: 'مكونات الكمبيوتر',
    prompt: 'الطابعة وحدة؟',
    correct: 'إخراج',
    wrongs: ['إدخال', 'تخزين', 'معالجة'],
    why: 'الطابعة بتطلع النتيجة على ورق.',
    band: 'primary',
  },
  {
    skill: 'ملفات',
    prompt: 'امتداد ملف الصوت؟',
    correct: '.mp3',
    wrongs: ['.png', '.docx', '.exe'],
    why: 'MP3 صوت مضغوط.',
    band: 'all',
  },
  {
    skill: 'ملفات',
    prompt: 'امتداد ملف مستند Word؟',
    correct: '.docx',
    wrongs: ['.mp3', '.png', '.exe'],
    why: 'DOCX مستند نصي من Word.',
    band: 'all',
  },
  {
    skill: 'ملفات',
    prompt: 'الملف اللي بيشغّل برنامج على ويندوز؟',
    correct: '.exe',
    wrongs: ['.docx', '.png', '.mp3'],
    why: 'EXE ملف تنفيذي.',
    band: 'all',
  },
  {
    skill: 'إنترنت',
    prompt: 'الإنترنت هو؟',
    correct: 'شبكة عالمية بتوصل أجهزة ببعضها',
    wrongs: ['برنامج واحد', 'نوع من الهارد', 'موقع واحد'],
    why: 'الإنترنت شبكة شبكات عالمية.',
    band: 'all',
  },
  {
    skill: 'إنترنت',
    prompt: 'الواي فاي بيوفر اتصال؟',
    correct: 'لاسلكي',
    wrongs: ['بسلك', 'بالبلوتوث فقط', 'بالطابعة'],
    why: 'Wi-Fi اتصال لاسلكي بالشبكة.',
    band: 'all',
  },
  {
    skill: 'إنترنت',
    prompt: 'البلوتوث بيستخدم في؟',
    correct: 'الاتصال القصير المدى بين الأجهزة',
    wrongs: ['الاتصال بالإنترنت البعيد', 'تخزين الملفات', 'طباعة الألوان'],
    why: 'البلوتوث للمسافات القصيرة زي السماعة.',
    band: 'all',
  },
  {
    skill: 'أمان',
    prompt: 'النسخ الاحتياطي معناه؟',
    correct: 'نسخة إضافية من الملفات للأمان',
    wrongs: ['حذف الملفات', 'ضغط الملفات', 'تغيير الاسم'],
    why: 'النسخة الاحتياطية بتحميك من فقدان البيانات.',
    band: 'all',
  },
  {
    skill: 'برامج',
    prompt: 'نظام التشغيل من الأمثلة؟',
    correct: 'Windows',
    wrongs: ['Word', 'Chrome', 'Excel'],
    why: 'Windows نظام تشغيل، والباقي برامج.',
    band: 'all',
  },
  {
    skill: 'برمجة',
    prompt: 'الخوارزمية هي؟',
    correct: 'خطوات منظمة لحل مشكلة',
    wrongs: ['نوع من الشاشات', 'برنامج مكافح فيروسات', 'ملف صوت'],
    why: 'الخوارزمية تسلسل خطوات واضح لحل مشكلة.',
    band: 'prep',
  },
  {
    skill: 'برمجة',
    prompt: 'البرمجة هي؟',
    correct: 'كتابة تعليمات للكمبيوتر بلغة يفهمها',
    wrongs: ['تصليح الهارد', 'تنظيف الشاشة', 'طباعة الملفات'],
    why: 'البرمجة بتحوّل الفكرة لتعليمات ينفّذها الجهاز.',
    band: 'prep',
  },
  {
    skill: 'ذكاء اصطناعي',
    prompt: 'الذكاء الاصطناعي معناه؟',
    correct: 'برامج بتتعلم من البيانات وتاخد قرارات',
    wrongs: ['جهاز أسرع', 'شبكة إنترنت', 'برنامج طباعة'],
    why: 'الذكاء الاصطناعي بيعتمد على البيانات والتدريب.',
    band: 'prep',
  },
  {
    skill: 'أمان',
    prompt: 'التصيد (Phishing) هو؟',
    correct: 'رسالة مزيفة بتحاول تسرق بياناتك',
    wrongs: ['لعبة إنترنت', 'برنامج ضغط', 'نوع من الواي فاي'],
    why: 'متفتحش لينك مش موثوق، ومتكتبش كلمة السر.',
    band: 'prep',
  },
  {
    skill: 'أمان',
    prompt: 'تحديث البرامج بيساعد في؟',
    correct: 'سد ثغرات الأمان وإصلاح الأخطاء',
    wrongs: ['زيادة سعر الجهاز', 'حذف الملفات', 'إبطاء الإنترنت'],
    why: 'التحديثات بتصلّح أخطاء وثغرات.',
    band: 'all',
  },
  {
    skill: 'ملفات',
    prompt: 'الملف اللي بتحذفه بيروح فين أول؟',
    correct: 'سلة المحذوفات (Recycle Bin)',
    wrongs: ['الإنترنت', 'الطابعة', 'المعالج'],
    why: 'سلة المحذوفات بتسمح بالاسترجاع.',
    band: 'primary',
  },
  {
    skill: 'إنترنت',
    prompt: 'الشبكة المحلية (LAN) هي؟',
    correct: 'أجهزة متوصلة في مكان واحد',
    wrongs: ['شبكة عالمية', 'موقع ويب', 'برنامج'],
    why: 'LAN شبكة داخل مكان واحد زي المدرسة.',
    band: 'prep',
  },
  {
    skill: 'مكونات الكمبيوتر',
    prompt: 'الفلاشة USB تستخدم في؟',
    correct: 'نقل وتخزين الملفات',
    wrongs: ['تشغيل الشاشة', 'زيادة سرعة الإنترنت', 'طباعة الصور'],
    why: 'الفلاشة وحدة تخزين متنقلة.',
    band: 'all',
  },
  {
    skill: 'أمان',
    prompt: 'لحماية حسابك بتحتاج؟',
    correct: 'كلمة سر قوية + عدم مشاركتها',
    wrongs: ['كتابة كلمة السر في كومنت', 'نفس الكلمة لكل حاجة', 'إرسال الكود لأي حد'],
    why: 'سرية كلمة السر أهم من تعقيدها.',
    band: 'all',
  },
]

const TEXT_BANKS: Partial<Record<BankSubject, TextItem[]>> = {
  'Social Studies': SOCIAL_STUDIES,
  ICT,
}

function buildTextDrill(subject: BankSubject, grade: GradeLevel, count: number): BankQuestion[] {
  const all = TEXT_BANKS[subject] || []
  if (!all.length) return []
  const stage = grade <= 6 ? 'primary' : 'prep'
  const suited = all.filter((item) => !item.band || item.band === 'all' || item.band === stage)
  const pool = suited.length >= Math.min(count, 6) ? suited : all
  const wanted = Math.min(count, pool.length)
  const picks = seededShuffle([...pool], `${subject}-${Date.now()}`).slice(0, wanted)
  return picks.map((item, index) => {
    const options = seededShuffle([item.correct, ...item.wrongs], `${item.prompt}-${index}`)
    return {
      id: `${subject}-${index}`,
      subject,
      skill: item.skill,
      prompt: item.prompt,
      options,
      answer: options.indexOf(item.correct),
      explanation: item.why,
    }
  })
}

export function buildDrill(subject: BankSubject, grade: GradeLevel, count = 10): BankQuestion[] {
  // Math questions already ship four options with an explanation.
  if (subject === 'Mathematics') {
    return placementTest(grade, count).map((question, index) => ({
      id: `Mathematics-${index}`,
      subject,
      skill: question.skill,
      prompt: question.prompt,
      options: question.options,
      answer: question.answer,
      explanation: question.why,
    }))
  }

  if (subject === 'Social Studies' || subject === 'ICT') return buildTextDrill(subject, grade, count)

  const seen = new Set<string>()
  const questions: BankQuestion[] = []
  let guard = 0
  while (questions.length < count && guard < count * 12) {
    guard += 1
    const raws = rawFor(subject)
    const usable = raws.filter((raw) => !seen.has(raw.prompt))
    if (!usable.length) break
    const raw = pick(usable)
    seen.add(raw.prompt)
    questions.push(toQuestion(raw, subject, questions.length))
  }
  return questions
}

export const BANK_SUBJECTS: BankSubject[] = ['Mathematics', 'Science', 'English', 'Arabic', 'Social Studies', 'ICT']

/* ------------------------------- Skill focus ------------------------------ */

const SUBJECT_PATTERNS: Array<[RegExp, BankSubject]> = [
  [/math|رياض/i, 'Mathematics'],
  [/science|علوم/i, 'Science'],
  [/english|إنجليز|انجليز/i, 'English'],
  [/arabic|عربي|عربى/i, 'Arabic'],
  [/social|دراسات|اجتماع/i, 'Social Studies'],
  [/ict|كمبيوتر|حاسب|computer/i, 'ICT'],
]

/** The four bank subjects are the app's subjects, spelled several ways elsewhere. */
export function toBankSubject(subject: string | undefined): BankSubject {
  if (!subject) return 'Mathematics'
  for (const [pattern, name] of SUBJECT_PATTERNS) if (pattern.test(subject)) return name
  return 'Mathematics'
}

export interface WeakSkill {
  subject: BankSubject
  skill: string
  correct: number
  total: number
  ratio: number
}

/** The skills the learner gets wrong most, ignoring one-off answers. */
export function weakestSkills(
  stats: Record<string, { correct: number; total: number }>,
  limit = 4,
): WeakSkill[] {
  return Object.entries(stats)
    .map(([key, stat]) => {
      const [subject, ...rest] = key.split('|')
      const skill = rest.join('|')
      return {
        subject: toBankSubject(subject),
        skill,
        correct: stat.correct,
        total: stat.total,
        ratio: stat.total ? stat.correct / stat.total : 0,
      }
    })
    .filter((item) => item.skill && item.total >= 2)
    .sort((a, b) => a.ratio - b.ratio || b.total - a.total)
    .slice(0, limit)
}

/** A drill that aims at named skills first, then fills with the same subject. */
export function buildSkillDrill(skills: string[], grade: GradeLevel, count = 10): BankQuestion[] {
  const wanted = new Set(skills)
  const out: BankQuestion[] = []
  const seen = new Set<string>()
  const push = (question: BankQuestion) => {
    if (!question.prompt || seen.has(question.prompt) || out.length >= count) return
    seen.add(question.prompt)
    out.push(question)
  }

  for (const question of placementTest(grade, 80)) {
    if (!wanted.has(question.skill)) continue
    push({
      id: `focus-${out.length}`,
      subject: 'Mathematics',
      skill: question.skill,
      prompt: question.prompt,
      options: question.options,
      answer: question.answer,
      explanation: question.why,
    })
  }

  const groups: Array<[BankSubject, Array<{ skill: string; make: () => Raw }>]> = [
    ['Science', SCIENCE],
    ['English', ENGLISH],
    ['Arabic', ARABIC],
  ]
  for (const [subject, generators] of groups) {
    for (const generator of generators) {
      if (!wanted.has(generator.skill)) continue
      push(toQuestion(generator.make(), subject, out.length))
    }
  }

  if (out.length < count) {
    const subject = out[0]?.subject || 'Mathematics'
    for (const question of buildDrill(subject, grade, count - out.length)) push(question)
  }

  return out.slice(0, count)
}
