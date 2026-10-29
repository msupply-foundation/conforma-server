import { ExtractionElement } from './types'

type JsonSchema = Record<string, unknown>

const SUPPORTED_PLUGINS = [
  'shortText',
  'longText',
  'number',
  'datePicker',
  'dropdownChoice',
  'radioChoice',
  'checkbox',
]

const CHOICE_PLUGINS = ['dropdownChoice', 'radioChoice', 'checkbox']

export const isChoiceElement = (element: ExtractionElement) =>
  CHOICE_PLUGINS.includes(element.pluginCode)

export const isMultipleChoice = (element: ExtractionElement) =>
  element.pluginCode === 'checkbox' || (element.pluginCode === 'dropdownChoice' && !!element.multiSelect)

const isSupported = (element: ExtractionElement) =>
  SUPPORTED_PLUGINS.includes(element.pluginCode) &&
  (!isChoiceElement(element) || !!element.options?.length)

export const splitSupported = (elements: ExtractionElement[]) => {
  const supported = elements.filter(isSupported)
  const skipped = elements.filter((element) => !isSupported(element)).map(({ code }) => code)
  return { supported, skipped }
}

// One generic answer shape for every question, listing only the questions
// the documents answer. A schema with a property per question compiles to a
// grammar the API rejects as too large, even for a 24-question form. Types
// and options are checked afterwards, in checkAnswers.
export const buildOutputSchema = (elements: ExtractionElement[]): JsonSchema => {
  const codes = elements.map(({ code }) => code)
  const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index)
  if (duplicates.length > 0)
    throw new Error(`Duplicate element codes: ${Array.from(new Set(duplicates))}`)

  return {
    type: 'object',
    properties: {
      answers: {
        type: 'array',
        items: {
          type: 'object',
          // `evidence` comes before the answer so the model locates the
          // supporting text before committing to a value
          properties: {
            code: { type: 'string', enum: codes },
            evidence: { type: 'string' },
            text: { type: 'string' },
            selectedOptions: { type: 'array', items: { type: 'string' } },
            confidence: { type: 'number' },
          },
          required: ['code', 'evidence', 'text', 'selectedOptions', 'confidence'],
          additionalProperties: false,
        },
      },
    },
    required: ['answers'],
    additionalProperties: false,
  }
}
