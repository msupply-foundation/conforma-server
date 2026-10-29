import { Expectation, matches, scoreAnswers } from './scoreAnswers'
import { ExtractionElement, ExtractionValue } from './types'

describe('matches', () => {
  test('compares strings by letters and digits only', () => {
    expect(matches('Kestrel Pharmaceuticals Pvt. Ltd.', 'kestrel pharmaceuticals pvt ltd')).toBe(
      true
    )
    expect(matches('NMLO/MA/2019/04417', 'NMLO MA 2019 04417')).toBe(true)
    expect(matches('NMLO/MA/2019/04417', 'GMP/KP/2024/118')).toBe(false)
    expect(matches('India', ['India'])).toBe(true)
  })

  test('compares numbers', () => {
    expect(matches(500, 500)).toBe(true)
    expect(matches(500, '500')).toBe(true)
    expect(matches(500, 50)).toBe(false)
  })

  test('compares lists in any order', () => {
    expect(matches(['India', 'Sri Lanka'], ['Sri Lanka', 'India'])).toBe(true)
    expect(matches(['India', 'Sri Lanka'], ['India'])).toBe(false)
    expect(matches(['India'], 'India')).toBe(false)
  })

  test('accepts any of the alternatives', () => {
    const shelfLife: Expectation = { anyOf: ['3 years', '36 months'] }
    expect(matches(shelfLife, '36 Months')).toBe(true)
    expect(matches(shelfLife, '24 months')).toBe(false)
  })

  test('checks long text for every term, any alternative of each', () => {
    const dosage: Expectation = { includes: ['12', ['4 to 6 hours', '4-6 hours']] }
    expect(matches(dosage, 'Over 12: 1–2 tablets every 4–6 hours')).toBe(true)
    expect(matches(dosage, 'Over 12: every 4 to 6 HOURS')).toBe(true)
    expect(matches(dosage, 'Over 12: every 8 hours')).toBe(false)
  })

  test('never matches a blank expectation', () => {
    expect(matches(null, 'anything')).toBe(false)
  })

  test('matches rows in any order, field by field', () => {
    const packs: Expectation = [
      { quantity: 10, unit: 'Tablet' },
      { quantity: 100, unit: 'Tablet' },
    ]
    expect(
      matches(packs, [
        { quantity: 100, unit: 'tablet' },
        { quantity: 10, unit: 'Tablet' },
      ])
    ).toBe(true)
    expect(matches(packs, [{ quantity: 10, unit: 'Tablet' }])).toBe(false)
    expect(
      matches(packs, [
        { quantity: 10, unit: 'Tablet' },
        { quantity: 10, unit: 'Tablet' },
      ])
    ).toBe(false)
    expect(matches(packs, ['10', '100'])).toBe(false)
  })

  test('requires every expected field in a row', () => {
    const site: Expectation = [{ address: { includes: ['Plot 14'] }, country: 'India' }]
    expect(matches(site, [{ address: 'Plot 14, Vadodara', country: 'India', extra: 'x' }])).toBe(
      true
    )
    expect(matches(site, [{ address: 'Plot 14, Vadodara' }])).toBe(false)
  })
})

describe('scoreAnswers', () => {
  const element = (code: string): ExtractionElement => ({
    code,
    pluginCode: 'shortText',
    title: code,
  })
  const answer = (value: ExtractionValue) => ({ value, confidence: 0.9, evidence: '' })

  test('gives each expected question a verdict and lists the rest', () => {
    const elements = ['right', 'wrong', 'missed', 'invented', 'blank', 'file', 'extra'].map(element)
    const score = scoreAnswers(
      elements,
      {
        answers: {
          right: answer('Yes'),
          wrong: answer('No'),
          invented: answer('Class 1'),
          extra: answer('Something'),
        },
        skipped: ['file'],
      },
      {
        right: 'Yes',
        wrong: 'Yes',
        missed: 'Yes',
        invented: null,
        blank: null,
        file: 'document.pdf',
        unsent: 'Yes',
      }
    )
    expect(score.scored.map(({ code, verdict }) => [code, verdict])).toEqual([
      ['right', 'correct'],
      ['wrong', 'wrong'],
      ['missed', 'missed'],
      ['invented', 'invented'],
      ['blank', 'blank'],
    ])
    expect(score.notSupported).toEqual(['file'])
    expect(score.notSent).toEqual(['unsent'])
    expect(score.unexpected).toEqual(['extra'])
  })
})
