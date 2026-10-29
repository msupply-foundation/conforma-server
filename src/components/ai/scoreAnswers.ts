// Scores an extraction result against a fixture's expected answers, for the
// CLI. See ai-extraction-tests/medicine-registration/INVENTORY.md for the
// format of expected.json.
import { ExtractionElement, ExtractionResult, ExtractionRow, ExtractionValue } from './types'

// A string, number or list must match the answer (lists in any order);
// `anyOf` accepts any of its values; `includes` is for long text, each item a
// term the answer must contain or a list of alternatives; null means the
// question should be left blank. A list question's answer is rows, each
// matching a different answered row (in any order), field by field.
export type Expectation =
  | null
  | string
  | number
  | string[]
  | { anyOf: Expectation[] }
  | { includes: (string | string[])[] }
  | ExpectedRow[]

interface ExpectedRow {
  [field: string]: Expectation
}

export type Verdict = 'correct' | 'wrong' | 'missed' | 'invented' | 'blank'

export interface Score {
  // Expected questions that were sent and supported, in the elements' order
  scored: { code: string; verdict: Verdict; expected: Expectation; value?: ExtractionValue }[]
  notSupported: string[]
  notSent: string[]
  // Answered questions with no expected answer
  unexpected: string[]
}

// Letters and digits only, so "Pvt Ltd" matches "Pvt. Ltd." and
// "NMLO MA 2019" matches "NMLO/MA/2019"
const normaliseExact = (text: string) =>
  text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')

const normaliseText = (text: string) =>
  text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[‐-―−]/g, '-')
    .replace(/\s+/g, ' ')

const asText = (value: ExtractionValue) =>
  Array.isArray(value) ? value.map((item) => JSON.stringify(item)).join(', ') : String(value)

const isRows = (expected: Expectation): expected is ExpectedRow[] =>
  Array.isArray(expected) && expected.some((item) => typeof item === 'object' && item !== null)

const isStrings = (value: ExtractionValue): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const isRowValues = (value: ExtractionValue): value is ExtractionRow[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null)

const matchesRow = (expected: ExpectedRow, row: ExtractionRow) =>
  Object.entries(expected).every(([field, expectation]) =>
    expectation === null ? !(field in row) : field in row && matches(expectation, row[field])
  )

// Each expected row matches a different answered row, and there are no
// others
const matchesRows = (expected: ExpectedRow[], value: ExtractionValue) => {
  if (!isRowValues(value) || value.length !== expected.length) return false
  const unmatched = [...value]
  return expected.every((expectedRow) => {
    const index = unmatched.findIndex((row) => matchesRow(expectedRow, row))
    if (index < 0) return false
    unmatched.splice(index, 1)
    return true
  })
}

export const matches = (expected: Expectation, value: ExtractionValue): boolean => {
  if (expected === null) return false

  if (isRows(expected)) return matchesRows(expected, value)

  if (typeof expected === 'number') return Number(value) === expected

  if (typeof expected === 'string') {
    const text = isStrings(value) && value.length === 1 ? value[0] : value
    return typeof text !== 'object' && normaliseExact(String(text)) === normaliseExact(expected)
  }

  if (Array.isArray(expected)) {
    if (!isStrings(value) || value.length !== expected.length) return false
    const answered = value.map(normaliseExact).sort()
    return expected
      .map(normaliseExact)
      .sort()
      .every((item, index) => item === answered[index])
  }

  if ('anyOf' in expected) return expected.anyOf.some((option) => matches(option, value))

  const text = normaliseText(asText(value))
  return expected.includes.every((term) =>
    (Array.isArray(term) ? term : [term]).some((option) => text.includes(normaliseText(option)))
  )
}

const getVerdict = (expected: Expectation, value: ExtractionValue | undefined): Verdict => {
  if (value === undefined) return expected === null ? 'blank' : 'missed'
  if (expected === null) return 'invented'
  return matches(expected, value) ? 'correct' : 'wrong'
}

export const scoreAnswers = (
  elements: ExtractionElement[],
  result: Pick<ExtractionResult, 'answers' | 'skipped'>,
  expected: Record<string, Expectation>
): Score => {
  const sentCodes = new Set(elements.map(({ code }) => code))
  const isScored = (code: string) => code in expected && !result.skipped.includes(code)

  return {
    scored: elements
      .filter(({ code }) => isScored(code))
      .map(({ code }) => {
        const value = result.answers[code]?.value
        return { code, verdict: getVerdict(expected[code], value), expected: expected[code], value }
      }),
    notSupported: elements
      .filter(({ code }) => code in expected && result.skipped.includes(code))
      .map(({ code }) => code),
    notSent: Object.keys(expected).filter((code) => !sentCodes.has(code)),
    unexpected: Object.keys(result.answers).filter((code) => !(code in expected)),
  }
}
