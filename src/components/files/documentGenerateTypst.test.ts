import { mergeWithDefaults } from './documentGenerateTypst'

// mergeWithDefaults fills gaps in live action data from a template bundle's
// defaults.json. The rules it encodes are deliberate (see implementation
// comments) -- in particular it is NOT equivalent to lodash defaultsDeep,
// which blends default array entries into real array rows item-by-item.

test('mergeWithDefaults: missing top-level keys are filled from defaults', () => {
  expect(mergeWithDefaults({ a: 1 }, { a: 0, b: 'default' })).toEqual({ a: 1, b: 'default' })
})

test('mergeWithDefaults: nested gaps are filled without clobbering siblings', () => {
  const data = { responses: { other: { text: 'keep me' } } }
  const defaults = { responses: { other: { text: '' }, billLadingNum: { text: '' } } }
  expect(mergeWithDefaults(data, defaults)).toEqual({
    responses: { other: { text: 'keep me' }, billLadingNum: { text: '' } },
  })
})

test('mergeWithDefaults: null in data counts as missing', () => {
  expect(mergeWithDefaults({ a: null }, { a: 'default' })).toEqual({ a: 'default' })
})

test('mergeWithDefaults: falsy-but-present data values are kept', () => {
  const data = { zero: 0, empty: '', no: false }
  const defaults = { zero: 5, empty: 'x', no: true }
  expect(mergeWithDefaults(data, defaults)).toEqual(data)
})

test('mergeWithDefaults: arrays in data are used wholesale, never blended', () => {
  // A naive deep merge would fill row 0's missing "batch" from the default
  // template row -- real rows must pass through untouched
  const data = { rows: [{ name: 'Real item' }, { name: 'Another', batch: 'B2' }] }
  const defaults = { rows: [{ name: '', batch: '', expiry: '' }] }
  expect(mergeWithDefaults(data, defaults)).toEqual(data)
})

test('mergeWithDefaults: empty array in data wins over default array', () => {
  expect(mergeWithDefaults({ rows: [] }, { rows: [{ name: '' }] })).toEqual({ rows: [] })
})

test('mergeWithDefaults: data keys not covered by defaults are preserved', () => {
  expect(mergeWithDefaults({ extra: 42 }, { a: '' })).toEqual({ extra: 42, a: '' })
})

test('mergeWithDefaults: data value wins even when its type differs from the default', () => {
  expect(mergeWithDefaults({ a: 5000 }, { a: '' })).toEqual({ a: 5000 })
  expect(mergeWithDefaults({ a: 'scalar' }, { a: { nested: '' } })).toEqual({ a: 'scalar' })
})

test('mergeWithDefaults: null/undefined data at root returns the defaults', () => {
  expect(mergeWithDefaults(null, { a: 1 })).toEqual({ a: 1 })
  expect(mergeWithDefaults(undefined, { a: 1 })).toEqual({ a: 1 })
})

test('mergeWithDefaults: missing value with no default stays as-is', () => {
  expect(mergeWithDefaults(null, undefined)).toBe(null)
})

test('mergeWithDefaults: records the dotted path of every substitution', () => {
  const data = {
    orgName: 'Org',
    responses: { other: { text: 'x' }, billLadingNum: null },
    additionalData: { tableData: [{ name: 'row' }] },
  }
  const defaults = {
    orgName: '',
    generatedText: '',
    responses: { other: { text: '' }, billLadingNum: { text: '' } },
    reviewData: { reviewer: { firstName: '', lastName: '' } },
    additionalData: { tableData: [], approvalDate: '' },
  }
  const missing: string[] = []
  mergeWithDefaults(data, defaults, '', missing)
  // Only the highest missing node is recorded (reviewData, not its leaves),
  // and arrays present in data are not considered missing
  expect(missing.sort()).toEqual([
    'additionalData.approvalDate',
    'generatedText',
    'responses.billLadingNum',
    'reviewData',
  ])
})

test('mergeWithDefaults: records "(root)" when the entire data object is missing', () => {
  const missing: string[] = []
  mergeWithDefaults(undefined, { a: 1 }, '', missing)
  expect(missing).toEqual(['(root)'])
})
