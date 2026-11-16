import type { BankQuestion } from './questionBank'

/**
 * Step-by-step working for the skills we generate ourselves. Every line is an
 * equation (digits and symbols only) so it reads the same in all seven
 * languages; the UI adds a numbered label.
 *
 * Nothing here is guessed: the numbers are read from the question prompt, and
 * a skill we have no derivation for simply returns no steps.
 */

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/** Arabic-Indic digits → plain digits so the maths can be done. */
function plain(value: string): string {
  return value.replace(/[٠-٩]/g, (digit) => String(AR_DIGITS.indexOf(digit)))
}

/** Arabic-Indic digits back again, for the lines we show. */
export function arabic(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => AR_DIGITS[Number(digit)])
}

function numbersIn(text: string): number[] {
  return (plain(text).match(/-?\d+(?:\.\d+)?/g) || []).map(Number)
}

const tidy = (value: number) => (Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100))

function withArabic(lines: string[]): string[] {
  return lines.map((line) => arabic(line))
}

export function solutionSteps(question: BankQuestion): string[] {
  const nums = numbersIn(question.prompt)
  const [a, b] = nums
  const skill = question.skill

  switch (skill) {
    case 'Addition':
      if (nums.length < 2) break
      return withArabic([`${tidy(a)} + ${tidy(b)} = ${tidy(a + b)}`])

    case 'Subtraction':
      if (nums.length < 2) break
      return withArabic([`${tidy(a)} - ${tidy(b)} = ${tidy(a - b)}`])

    case 'Times tables':
      if (nums.length < 2) break
      return withArabic([`${tidy(a)} × ${tidy(b)} = ${tidy(a * b)}`])

    case 'Division':
      if (nums.length < 2) break
      return withArabic([`${tidy(b)} × ${tidy(a / b)} = ${tidy(a)}`, `${tidy(a)} ÷ ${tidy(b)} = ${tidy(a / b)}`])

    case 'Fractions': {
      if (nums.length < 3) break
      const [n1, den, n2] = nums
      const sum = n1 + n2
      return withArabic([`(${tidy(n1)} + ${tidy(n2)}) / ${tidy(den)}`, `${tidy(sum)} / ${tidy(den)}`])
    }

    case 'Integers':
      if (nums.length < 2) break
      return withArabic([`-${tidy(a)} + ${tidy(b)} = ${tidy(b - a)}`])

    case 'Equations': {
      if (nums.length < 3) break
      const [coef, added, total] = nums
      const moved = total - added
      return withArabic([
        `${tidy(coef)}x + ${tidy(added)} = ${tidy(total)}`,
        `${tidy(coef)}x = ${tidy(moved)}`,
        `x = ${tidy(moved / coef)}`,
      ])
    }

    case 'Ratio & proportion': {
      if (nums.length < 2) break
      const [total, ratio] = nums
      return withArabic([`${tidy(total)} ÷ (1 + ${tidy(ratio)}) = ${tidy(total / (ratio + 1))}`])
    }

    case 'Area':
    case 'Geometry': {
      if (nums.length < 2) break
      return withArabic([`${tidy(a)} × ${tidy(b)} = ${tidy(a * b)}`])
    }

    case 'Perimeter': {
      if (nums.length < 2) break
      return withArabic([`2 × (${tidy(a)} + ${tidy(b)})`, `2 × ${tidy(a + b)} = ${tidy(2 * (a + b))}`])
    }

    case 'Speed': {
      if (nums.length < 2) break
      return withArabic([`${tidy(a)} ÷ ${tidy(b)} = ${tidy(a / b)}`])
    }

    case 'Pressure': {
      if (nums.length < 2) break
      return withArabic([`${tidy(a)} ÷ ${tidy(b)} = ${tidy(a / b)}`])
    }

    case 'Density': {
      if (nums.length < 2) break
      return withArabic([`${tidy(a)} ÷ ${tidy(b)} = ${tidy(a / b)}`])
    }

    case 'Force': {
      if (nums.length < 2) break
      return withArabic([`${tidy(a)} × ${tidy(b)} = ${tidy(a * b)}`])
    }

    case "Ohm’s law": {
      if (nums.length < 2) break
      return withArabic([`${tidy(a)} × ${tidy(b)} = ${tidy(a * b)}`])
    }

    case 'Work':
    case 'Energy': {
      if (nums.length < 2) break
      return withArabic([`${tidy(a)} × ${tidy(b)} = ${tidy(a * b)}`])
    }

    case 'Weight': {
      if (nums.length < 2) break
      return withArabic([`${tidy(a)} × ${tidy(b)} = ${tidy(a * b)}`])
    }

    case 'Temperature': {
      if (nums.length < 1) break
      return withArabic([`${tidy(a)} + 273 = ${tidy(a + 273)}`])
    }

    case 'Units': {
      if (nums.length < 1) break
      return withArabic([`${tidy(a)} × 1000 = ${tidy(a * 1000)}`])
    }

    case 'Counting': {
      if (nums.length < 1) break
      return withArabic([`${tidy(a)} + 3 = ${tidy(a + 3)}`])
    }

    case 'Statistics': {
      if (nums.length < 4) break
      const sum = nums.slice(0, 4).reduce((total, value) => total + value, 0)
      return withArabic([`(${nums.slice(0, 4).map(tidy).join(' + ')}) ÷ 4`, `${tidy(sum)} ÷ 4 = ${tidy(sum / 4)}`])
    }

    case 'Powers & roots': {
      if (nums.length < 2) break
      return withArabic([`${tidy(a)} + ${tidy(b)} = ${tidy(a + b)}`])
    }

    default:
      break
  }

  // No derivation for this skill: fall back to the one-line explanation only.
  return []
}
