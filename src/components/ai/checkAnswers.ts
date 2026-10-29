import { isChoiceElement, isListElement, isMultipleChoice } from './elementSchema'
import { isRecord } from './parseInput'
import { ExtractionAnswer, ExtractionElement, ExtractionRow, ExtractionValue } from './types'

const isIsoDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

// Returns the answer's value if it's usable for this element, otherwise
// undefined
const checkValue = (
  element: ExtractionElement,
  answer: Record<string, unknown>
): ExtractionValue | undefined => {
  if (isListElement(element)) return checkRows(element, answer.rows)

  if (isChoiceElement(element)) {
    const chosen = Array.isArray(answer.selectedOptions) ? answer.selectedOptions : []
    // In option order, ignoring anything that isn't an option
    const selected = (element.options ?? []).filter((option) => chosen.includes(option))
    if (isMultipleChoice(element)) return selected.length > 0 ? selected : undefined
    return selected.length === 1 ? selected[0] : undefined
  }

  const text = typeof answer.text === 'string' ? answer.text.trim() : ''
  if (text === '') return undefined

  switch (element.pluginCode) {
    case 'number': {
      const number = Number(text)
      return isFinite(number) ? number : undefined
    }
    case 'datePicker':
      return isIsoDate(text) ? text : undefined
    default:
      return text
  }
}

// Each row keeps the fields that are this list's and usable (the first
// answer to a field wins); empty rows are dropped, and rows beyond maxItems
const checkRows = (list: ExtractionElement, rows: unknown): ExtractionRow[] | undefined => {
  const fieldsByCode = new Map((list.fields ?? []).map((field) => [field.code, field]))
  const checked: ExtractionRow[] = []
  for (const row of Array.isArray(rows) ? rows : []) {
    const values: ExtractionRow = {}
    for (const item of Array.isArray(row) ? row : []) {
      if (!isRecord(item) || typeof item.code !== 'string' || item.code in values) continue
      const field = fieldsByCode.get(item.code)
      const value = field && checkValue(field, item)
      // Fields aren't lists, so their values are never rows
      if (value !== undefined) values[item.code] = value as ExtractionRow[string]
    }
    if (Object.keys(values).length > 0) checked.push(values)
  }
  const limited = list.maxItems ? checked.slice(0, list.maxItems) : checked
  return limited.length > 0 ? limited : undefined
}

/**
 * Turns the model's output into answers for the web-app, keyed by element
 * code. Structured outputs guarantee the shape, but this still drops unknown
 * codes, choices that aren't options, and invalid numbers and dates. If a
 * question is answered twice, the more confident answer wins.
 */
export const checkAnswers = (
  elements: ExtractionElement[],
  output: unknown
): Record<string, ExtractionAnswer> => {
  const items = isRecord(output) && Array.isArray(output.answers) ? output.answers : []
  const elementsByCode = new Map(elements.map((element) => [element.code, element]))

  const answers: Record<string, ExtractionAnswer> = {}
  for (const item of items) {
    if (!isRecord(item) || typeof item.code !== 'string') continue
    const element = elementsByCode.get(item.code)
    if (!element) continue

    const value = checkValue(element, item)
    if (value === undefined) continue

    const confidence = Math.min(Math.max(Number(item.confidence) || 0, 0), 1)
    if (answers[item.code] && answers[item.code].confidence >= confidence) continue

    answers[item.code] = {
      value,
      confidence,
      evidence: typeof item.evidence === 'string' ? item.evidence : '',
    }
  }
  return answers
}
