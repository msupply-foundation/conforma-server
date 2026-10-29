import { checkAnswers } from './checkAnswers'
import { PrefillElement } from './types'

const elements: PrefillElement[] = [
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

  test('returns nothing for output without an answers array', () => {
    expect(checkAnswers(elements, null)).toEqual({})
    expect(checkAnswers(elements, { answers: 'x' })).toEqual({})
  })
})
