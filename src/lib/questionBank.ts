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
}

const SOCIAL_STUDIES: TextItem[] = [
  {
    skill: 'جغرافيا مصر',
    prompt: 'النيل بيصب في أي بحر؟',
    correct: 'البحر المتوسط',
    wrongs: ['البحر الأحمر', 'البحر العربي', 'خليج السويس'],
    why: 'فرعا النيل (دمياط ورشيد) بيصبو في البحر المتوسط شمال مصر.',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'أطول نهر في مصر والعالم القديم؟',
    correct: 'النيل',
    wrongs: ['الفرات', 'دجلة', 'الأمازون'],
    why: 'النيل أطول نهر بيمر في مصر، وبيعتمد عليه أكثر من ٩٠٪ من مية الشرب والزراعة.',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'قناة السويس بتربط بين أي بحرين؟',
    correct: 'المتوسط والأحمر',
    wrongs: ['الأحمر والعربي', 'المتوسط والأسود', 'الأسود وقزوين'],
    why: 'قناة السويس بتوصل البحر المتوسط بالبحر الأحمر، وبتقصّر طريق الملاحة بين أوروبا وآسيا.',
  },
  {
    skill: 'محافظات',
    prompt: 'عاصمة محافظة الإسكندرية هي؟',
    correct: 'الإسكندرية',
    wrongs: ['دمنهور', 'طنطا', 'كفر الشيخ'],
    why: 'الإسكندرية هي العاصمة، ودمنهور عاصمة البحيرة وطنطا عاصمة الغربية.',
  },
  {
    skill: 'تاريخ مصر',
    prompt: 'مين اللي بنى الهرم الأكبر في الجيزة؟',
    correct: 'خوفو',
    wrongs: ['خفرع', 'منقرع', 'سنفرو'],
    why: 'الهرم الأكبر بناه الملك خوفو من الأسرة الرابعة، وده اللي بنسميه الهرم الأكبر.',
  },
  {
    skill: 'تاريخ مصر',
    prompt: 'الحضارة اللي قامت على ضفاف النيل في الجنوب هي؟',
    correct: 'الحضارة المصرية القديمة',
    wrongs: ['الحضارة الرومانية', 'الحضارة الفينيقية', 'الحضارة الفارسية'],
    why: 'الحضارة المصرية القديمة قامت على النيل، واعتمدت على الفيضان في الزراعة.',
  },
  {
    skill: 'اقتصاد',
    prompt: 'أشهر محصول زراعي مصري بيتبني عليه الاقتصاد زمان؟',
    correct: 'القطن',
    wrongs: ['البن', 'الكاكاو', 'الشاي'],
    why: 'القطن المصري طويل التيلة واشتهر عالميًا، وكان أهم صادرات مصر لفترة طويلة.',
  },
  {
    skill: 'مناخ',
    prompt: 'أمطار مصر معظمها بتيجي في أي فصل؟',
    correct: 'الشتاء',
    wrongs: ['الصيف', 'الربيع', 'الخريف'],
    why: 'مصر مناخها صحراوي، وأمطارها قليلة وبتتركز على السواحل في الشتاء.',
  },
  {
    skill: 'مواطنة',
    prompt: 'السلطة اللي بتسن القوانين في مصر هي؟',
    correct: 'مجلس النواب',
    wrongs: ['مجلس الوزراء', 'المحكمة الدستورية', 'مجلس الشيوخ'],
    why: 'مجلس النواب هو اللي بيوافق على القوانين، والحكومة بتنفّذها والقضاء بيتحقق منها.',
  },
  {
    skill: 'جغرافيا العالم',
    prompt: 'أكبر قارة في المساحة هي؟',
    correct: 'آسيا',
    wrongs: ['أفريقيا', 'أوروبا', 'أمريكا الشمالية'],
    why: 'آسيا أكبر قارة مساحة وسكانًا، وأفريقيا التانية مساحة.',
  },
  {
    skill: 'جغرافيا مصر',
    prompt: 'الصحراء اللي فيها واحة سيوة هي؟',
    correct: 'الصحراء الغربية',
    wrongs: ['الصحراء الشرقية', 'سيناء', 'الدلتا'],
    why: 'سيوة في الصحراء الغربية، وغربها ليبيا.',
  },
  {
    skill: 'خرائط',
    prompt: 'الاتجاه اللي بتشرق منه الشمس على مصر هو؟',
    correct: 'الشرق',
    wrongs: ['الغرب', 'الشمال', 'الجنوب'],
    why: 'الشمس بتشرق من الشرق وتغرب في الغرب، وعشان كده سيناء شرق مصر.',
  },
]

const ICT: TextItem[] = [
  {
    skill: 'مكونات الكمبيوتر',
    prompt: 'الذاكرة المؤقتة اللي بتضيع لما نقفل الجهاز اسمها؟',
    correct: 'RAM',
    wrongs: ['ROM', 'SSD', 'CPU'],
    why: 'RAM ذاكرة عشوائية مؤقتة، بتتمسح مع إغلاق الجهاز، وROM دائمة.',
  },
  {
    skill: 'مكونات الكمبيوتر',
    prompt: 'العقل اللي بينفّذ الأوامر في الكمبيوتر هو؟',
    correct: 'المعالج (CPU)',
    wrongs: ['الذاكرة (RAM)', 'الشاشة', 'الهارد'],
    why: 'المعالج بينفّذ التعليمات ويعمل العمليات الحسابية والمنطقية.',
  },
  {
    skill: 'ملفات',
    prompt: 'امتداد ملف صورة شفاف الخلفية هو؟',
    correct: '.png',
    wrongs: ['.docx', '.mp3', '.exe'],
    why: 'PNG بيدعم الشفافية، أما DOCX مستند نصي وMP3 صوت وEXE برنامج.',
  },
  {
    skill: 'إنترنت',
    prompt: 'علامة لازم تكون في أي بريد إلكتروني صحيح؟',
    correct: '@',
    wrongs: ['#', '&', '*'],
    why: 'الإيميل بيتكتب باسم المستخدم ثم @ ثم اسم النطاق، زي name@site.com.',
  },
  {
    skill: 'أمان',
    prompt: 'كلمة السر القوية لازم تكون؟',
    correct: 'طويلة وفيها حروف وأرقام ورموز',
    wrongs: ['اسمك وتاريخ ميلادك', 'كلمة واحدة سهلة', 'نفس كلمة السر في كل حاجة'],
    why: 'الطول والتنويع بيصعّبوا التخمين، وتكرار نفس الكلمة خطر لو موقع اتخترق.',
  },
  {
    skill: 'برامج',
    prompt: 'البرنامج اللي بيفتح صفحات الويب اسمه؟',
    correct: 'متصفح (Browser)',
    wrongs: ['محرر نصوص', 'مشغل فيديو', 'برنامج ضغط'],
    why: 'المتصفح زي Chrome وEdge بيفتح صفحات الويب ويعرضها.',
  },
  {
    skill: 'ملفات',
    prompt: 'عشان نحفظ نسخة من ملف باسم تاني بنستخدم؟',
    correct: 'Save As',
    wrongs: ['Print', 'Undo', 'Close'],
    why: 'Save As بيحفظ نسخة باسم أو مكان جديد من غير ما نغيّر الأصل.',
  },
  {
    skill: 'أمان',
    prompt: 'الفيروس برنامج؟',
    correct: 'ضار بيضر الجهاز والملفات',
    wrongs: ['بيسرّع الجهاز', 'بينضّف الملفات', 'بيزوّد مساحة الهارد'],
    why: 'الفيروس برنامج خبيث بيكرر نفسه ويضر الملفات، وبنحمي الجهاز بمكافح فيروسات.',
  },
]

const TEXT_BANKS: Partial<Record<BankSubject, TextItem[]>> = {
  'Social Studies': SOCIAL_STUDIES,
  ICT,
}

function buildTextDrill(subject: BankSubject, count: number): BankQuestion[] {
  const pool = TEXT_BANKS[subject] || []
  if (!pool.length) return []
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

  if (subject === 'Social Studies' || subject === 'ICT') return buildTextDrill(subject, count)

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
