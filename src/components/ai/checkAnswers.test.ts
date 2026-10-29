import { checkAnswers } from './checkAnswers'
import { ExtractionElement } from './types'

const elements: ExtractionElement[] = [
  { code: 'name', pluginCode: 'shortText', title: 'Name' },
  { code: 'count', pluginCode: 'number', title: 'Count' },
  { code: 'date', pluginCode: 'datePicker', title: 'Date' },
  { code: 'colour', pluginCode: 'radioChoice', title: 'Colour', options: ['Red', 'Blue'] },
  { code: 'ticks', pluginCode: 'checkbox', title: 'Ticks', options: ['A', 'B', 'C'] },
]

const answer = (code: string, text: string, selectedOptions: string[] = [], confidence = 0.9) => ({
  code,
  evidence: 'quote',
  text,
  selectedOptions,
  confidence,
})

describe('checkAnswers', () => {
  test('keeps valid answers', () => {
    const answers = checkAnswers(elements, {
      answers: [
        answer('name', '  Acme Ltd '),
        answer('count', '12'),
        answer('date', '2025-03-04'),
        answer('colour', '', ['Blue']),
        answer('ticks', '', ['C', 'A']),
      ],
    })
    expect(answers).toEqual({
      name: { value: 'Acme Ltd', confidence: 0.9, evidence: 'quote' },
      count: { value: 12, confidence: 0.9, evidence: 'quote' },
      date: { value: '2025-03-04', confidence: 0.9, evidence: 'quote' },
      colour: { value: 'Blue', confidence: 0.9, evidence: 'quote' },
      // In option order
      ticks: { value: ['A', 'C'], confidence: 0.9, evidence: 'quote' },
    })
  })

  test('drops empty and invalid answers, and unknown codes', () => {
    const answers = checkAnswers(elements, {
      answers: [
        answer('name', '   '),
        answer('count', '12 tablets'),
        answer('date', '2025-02-30'),
        answer('colour', 'Blue', ['Green']),
        answer('ticks', '', ['X']),
        answer('other', 'anything'),
      ],
    })
    expect(answers).toEqual({})
  })

  test('drops a single choice with more than one option selected', () => {
    expect(checkAnswers(elements, { answers: [answer('colour', '', ['Red', 'Blue'])] })).toEqual({})
  })

  test('keeps the more confident of two answers to the same question', () => {
    const answers = checkAnswers(elements, {
      answers: [answer('name', 'First', [], 0.5), answer('name', 'Second', [], 0.8)],
    })
    expect(answers.name.value).toBe('Second')
  })

  test('clamps confidence to 0-1', () => {
    const answers = checkAnswers(elements, {
      answers: [answer('name', 'x', [], 7), answer('count', '1', [], -1)],
    })
    expect(answers.name.confidence).toBe(1)
    expect(answers.count.confidence).toBe(0)
  })

  describe('lists', () => {
    const sites: ExtractionElement = {
      code: 'sites',
      pluginCode: 'listBuilder',
      title: 'Sites',
      maxItems: 2,
      fields: [
        { code: 'address', pluginCode: 'longText', title: 'Address' },
        { code: 'staff', pluginCode: 'number', title: 'Staff' },
        { code: 'colour', pluginCode: 'radioChoice', title: 'Colour', options: ['Red', 'Blue'] },
      ],
    }
    const field = (code: string, text: string, selectedOptions: string[] = []) => ({
      code,
      text,
      selectedOptions,
    })
    const listAnswer = (rows: unknown) => ({ ...answer('sites', ''), rows })

    test("keeps each row's usable fields", () => {
      const answers = checkAnswers([sites], {
        answers: [
          listAnswer([
            [field('address', 'Plot 14'), field('staff', '120'), field('colour', '', ['Blue'])],
            [field('address', 'Plot 15'), field('staff', 'many'), field('other', 'x')],
          ]),
        ],
      })
      expect(answers.sites.value).toEqual([
        { address: 'Plot 14', staff: 120, colour: 'Blue' },
        { address: 'Plot 15' },
      ])
    })

    test('drops empty rows and rows beyond maxItems', () => {
      const answers = checkAnswers([sites], {
        answers: [
          listAnswer([
            [field('address', '  ')],
            [field('address', 'A')],
            [field('address', 'B')],
            [field('address', 'C')],
          ]),
        ],
      })
      expect(answers.sites.value).toEqual([{ address: 'A' }, { address: 'B' }])
    })

    test('drops a list with no usable rows', () => {
      expect(checkAnswers([sites], { answers: [listAnswer([[field('staff', 'x')]])] })).toEqual({})
      expect(checkAnswers([sites], { answers: [listAnswer('x')] })).toEqual({})
    })
  })

  test('returns nothing for output without an answers array', () => {
    expect(checkAnswers(elements, null)).toEqual({})
    expect(checkAnswers(elements, { answers: 'x' })).toEqual({})
  })
})
