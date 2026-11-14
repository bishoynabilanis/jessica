import type { GradeLevel } from '@/types'

/**
 * Procedural placement test — no network, no AI key, and every answer is
 * generated on the device, so it can never be wrong or out of date.
 */
export interface PlacementQuestion {
  id: string
  prompt: string
  options: string[]
  answer: number
  skill: string
  why: string
}

interface Raw {
  skill: string
  prompt: string
  value: number
  why: string
}

const DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

function ar(value: number | string) {
  return String(value).replace(/[0-9]/g, (digit) => DIGITS[Number(digit)])
}

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(list: readonly T[]): T {
  return list[rnd(0, list.length - 1)]
}

const ADD = {
  skill: 'Addition',
  make(): Raw {
    const a = rnd(2, 9)
    const b = rnd(2, 9)
    return { skill: ADD.skill, prompt: `${ar(a)} + ${ar(b)} = ؟`, value: a + b, why: `${ar(a)} + ${ar(b)} = ${ar(a + b)}` }
  },
}

const SUB = {
  skill: 'Subtraction',
  make(): Raw {
    const a = rnd(5, 15)
    const b = rnd(1, a - 1)
    return { skill: SUB.skill, prompt: `${ar(a)} − ${ar(b)} = ؟`, value: a - b, why: `${ar(a)} − ${ar(b)} = ${ar(a - b)}` }
  },
}

const COUNT = {
  skill: 'Counting',
  make(): Raw {
    const start = rnd(2, 9)
    return {
      skill: COUNT.skill,
      prompt: `${ar(start)}، ${ar(start + 1)}، ${ar(start + 2)}، ؟`,
      value: start + 3,
      why: `الترتيب بيزيد واحد كل مرة، فالباقي ${ar(start + 3)}`,
    }
  },
}

const TIMES = {
  skill: 'Times tables',
  make(): Raw {
    const a = rnd(2, 9)
    const b = rnd(2, 9)
    return { skill: TIMES.skill, prompt: `${ar(a)} × ${ar(b)} = ؟`, value: a * b, why: `${ar(a)} × ${ar(b)} = ${ar(a * b)}` }
  },
}

const DIVIDE = {
  skill: 'Division',
  make(): Raw {
    const b = rnd(2, 9)
    const q = rnd(2, 9)
    return { skill: DIVIDE.skill, prompt: `${ar(b * q)} ÷ ${ar(b)} = ؟`, value: q, why: `${ar(b)} × ${ar(q)} = ${ar(b * q)}، إذن الناتج ${ar(q)}` }
  },
}

const FRACTION_OF = {
  skill: 'Fractions',
  make(): Raw {
    const denominators: ReadonlyArray<readonly [number, string]> = [
      [2, 'نصف'],
      [3, 'تُلت'],
      [4, 'ربع'],
      [5, 'خُمس'],
    ]
    const [d, word] = pick(denominators)
    const answer = rnd(2, 9)
    const total = d * answer
    return {
      skill: FRACTION_OF.skill,
      prompt: `${word} ${ar(total)} = ؟`,
      value: answer,
      why: `${ar(total)} ÷ ${ar(d)} = ${ar(answer)}`,
    }
  },
}

const RATIO = {
  skill: 'Ratio & proportion',
  make(): Raw {
    const unit = rnd(2, 7)
    const first = rnd(2, 5)
    const second = first + rnd(1, 4)
    return {
      skill: RATIO.skill,
      prompt: `لو ${ar(first)} أقلام بـ ${ar(first * unit)} جنيه، ${ar(second)} أقلام بـ ؟`,
      value: second * unit,
      why: `سعر القلم ${ar(unit)} جنيه، و${ar(second)} × ${ar(unit)} = ${ar(second * unit)}`,
    }
  },
}

const AREA = {
  skill: 'Area',
  make(): Raw {
    const w = rnd(3, 12)
    const h = rnd(3, 9)
    return {
      skill: AREA.skill,
      prompt: `مستطيل طوله ${ar(w)} وعرضه ${ar(h)}، مساحته = ؟`,
      value: w * h,
      why: `المساحة = الطول × العرض = ${ar(w)} × ${ar(h)} = ${ar(w * h)}`,
    }
  },
}

const PERIMETER = {
  skill: 'Perimeter',
  make(): Raw {
    const w = rnd(3, 12)
    const h = rnd(2, 8)
    return {
      skill: PERIMETER.skill,
      prompt: `مستطيل طوله ${ar(w)} وعرضه ${ar(h)}، محيطه = ؟`,
      value: 2 * (w + h),
      why: `المحيط = ٢ × (${ar(w)} + ${ar(h)}) = ${ar(2 * (w + h))}`,
    }
  },
}

const INTEGERS = {
  skill: 'Integers',
  make(): Raw {
    const a = rnd(3, 15)
    const b = rnd(2, 12)
    return { skill: INTEGERS.skill, prompt: `(−${ar(a)}) + ${ar(b)} = ؟`, value: b - a, why: `أكبر رقم بإشارته: ${ar(b)} − ${ar(a)} = ${ar(b - a)}` }
  },
}

const EQUATION = {
  skill: 'Equations',
  make(): Raw {
    const x = rnd(2, 9)
    const a = rnd(2, 6)
    const b = rnd(1, 15)
    return {
      skill: EQUATION.skill,
      prompt: `${ar(a)}س + ${ar(b)} = ${ar(a * x + b)}، س = ؟`,
      value: x,
      why: `${ar(a * x + b)} − ${ar(b)} = ${ar(a * x)}، و${ar(a * x)} ÷ ${ar(a)} = ${ar(x)}`,
    }
  },
}

const POWER = {
  skill: 'Powers & roots',
  make(): Raw {
    const base = pick([2, 3, 4])
    const exp = pick([2, 3])
    const power = base ** exp
    const root = pick([4, 9, 16, 25, 36])
    return {
      skill: POWER.skill,
      prompt: `${ar(base)}^${ar(exp)} + √${ar(root)} = ؟`,
      value: power + Math.sqrt(root),
      why: `${ar(base)}^${ar(exp)} = ${ar(power)} و√${ar(root)} = ${ar(Math.sqrt(root))}، والمجموع ${ar(power + Math.sqrt(root))}`,
    }
  },
}

const TRIANGLE = {
  skill: 'Geometry',
  make(): Raw {
    const base = pick([4, 6, 8, 10])
    const height = pick([5, 7, 9])
    return {
      skill: TRIANGLE.skill,
      prompt: `مثلث قاعدته ${ar(base)} وارتفاعه ${ar(height)}، مساحته = ؟`,
      value: (base * height) / 2,
      why: `مساحة المثلث = ½ × القاعدة × الارتفاع = ${ar((base * height) / 2)}`,
    }
  },
}

const AVERAGE = {
  skill: 'Statistics',
  make(): Raw {
    const mean = rnd(4, 12)
    const spread: number[] = pick([
      [-3, -1, 1, 3],
      [-4, -2, 2, 4],
      [-2, -1, 1, 2],
    ])
    const values = spread.map((delta) => mean + delta)
    return {
      skill: AVERAGE.skill,
      prompt: `متوسط الأعداد ${values.map(ar).join('، ')} = ؟`,
      value: mean,
      why: `المجموع ${ar(mean * 4)} ÷ ${ar(4)} = ${ar(mean)}`,
    }
  },
}

function generatorsFor(grade: GradeLevel) {
  if (grade <= 2) return [ADD, SUB, COUNT]
  if (grade <= 4) return [TIMES, DIVIDE, FRACTION_OF]
  if (grade <= 6) return [FRACTION_OF, RATIO, AREA, PERIMETER]
  if (grade <= 8) return [INTEGERS, EQUATION, RATIO]
  return [POWER, EQUATION, TRIANGLE, AVERAGE]
}

/** A placement paper: every skill appears at least twice, no duplicate prompts. */
export function placementTest(grade: GradeLevel, count = 12): PlacementQuestion[] {
  const gens = generatorsFor(grade)
  const raw: Raw[] = []
  const seen = new Set<string>()
  let guard = 0

  // Round-robin over the skills so the report is balanced.
  for (let round = 0; raw.length < count && round < 40; round += 1) {
    for (const gen of gens) {
      if (raw.length >= count) break
      let item = gen.make()
      let tries = 0
      while (seen.has(item.prompt) && tries < 12) {
        item = gen.make()
        tries += 1
      }
      if (seen.has(item.prompt)) continue
      seen.add(item.prompt)
      raw.push(item)
    }
    if (guard++ > 20) break
  }

  // Negative choices only make sense from prep 1 upwards.
  const allowNegative = grade >= 7
  return raw.map((item, index) => {
    const options = new Set<number>([item.value])
    for (let step = 1; step <= 40 && options.size < 4; step += 1) {
      const above = item.value + step
      if (!options.has(above)) options.add(above)
      if (options.size >= 4) break
      const below = item.value - step
      if ((allowNegative || below >= 0) && !options.has(below)) options.add(below)
    }
    const values = [...options]
    for (let i = values.length - 1; i > 0; i -= 1) {
      const j = rnd(0, i)
      ;[values[i], values[j]] = [values[j], values[i]]
    }
    return {
      id: `q${index + 1}`,
      prompt: item.prompt,
      options: values.map(ar),
      answer: values.indexOf(item.value),
      skill: item.skill,
      why: item.why,
    }
  })
}

export interface SkillScore {
  skill: string
  correct: number
  total: number
}

export function scoreBySkill(
  questions: PlacementQuestion[],
  answers: Record<string, number>,
): SkillScore[] {
  const map = new Map<string, SkillScore>()
  for (const question of questions) {
    const entry = map.get(question.skill) || { skill: question.skill, correct: 0, total: 0 }
    entry.total += 1
    if (answers[question.id] === question.answer) entry.correct += 1
    map.set(question.skill, entry)
  }
  return [...map.values()].sort((a, b) => a.correct / a.total - b.correct / b.total)
}

/** 0–2: needs work, 3: on track, 4: strong. */
export function levelBand(score: number, total: number) {
  const ratio = total ? score / total : 0
  if (ratio >= 0.85) return 4
  if (ratio >= 0.6) return 3
  if (ratio >= 0.35) return 2
  return 1
}
