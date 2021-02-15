import { deepEquality } from './deepCompare'

test('deepEquality: two numbers match', () => {
  expect(deepEquality(2, 2)).toBe(true)
})

test("deepEquality: two numbers don't match", () => {
  expect(deepEquality(2, 3)).toBe(false)
})

test('deepEquality: two different sized arrays', () => {
  expect(deepEquality([1, 2, 3], [1, 2, 3, 4])).toBe(false)
})

test('deepEquality: one primitive, one object', () => {
  expect(deepEquality('a string', { one: 1, two: 2 })).toBe(false)
})

test('deepEquality: simple arrays match', () => {
  expect(deepEquality([1, 2, 3, 4], [1, 2, 3, 4])).toBe(true)
})

test('deepEquality: simple arrays different values', () => {
  expect(deepEquality([1, 2, 3, 4], [1, 2, 3, 5])).toBe(false)
})

test('deepEquality: nested arrays match', () => {
  expect(deepEquality([1, 2, ['A', 'B'], ['C', 'D']], [1, 2, ['A', 'B'], ['C', 'D']])).toBe(true)
})

test("deepEquality: nested arrays don't match", () => {
  expect(deepEquality([1, 2, ['A', 'X'], ['C', 'D']], [1, 2, ['A', 'B'], ['C', 'D']])).toBe(false)
})

test('deepEquality: one array, one object', () => {
  expect(
    deepEquality({ first: 'three', second: 'another value' }, [1, 2, ['A', 'B'], ['C', 'D']])
  ).toBe(false)
})

test('deepEquality: simple objects match', () => {
  expect(
    deepEquality(
      { first: 'three', second: 'another value' },
      { first: 'three', second: 'another value' }
    )
  ).toBe(true)
})

test("deepEquality: simple objects values don't match", () => {
  expect(
    deepEquality({ first: 'three', second: 'another value' }, { first: 'three', second: 'oops' })
  ).toBe(false)
})

test("deepEquality: simple objects keys don't match", () => {
  expect(
    deepEquality(
      { first: 'three', second: 'another value' },
      { first: 'three', notSecond: 'another value' }
    )
  ).toBe(false)
})

test('deepEquality: complex nested objects match', () => {
  expect(
    deepEquality(
      {
        first: 'three',
        second: 'another value',
        three: { A: [1, 2, 3], B: null },
        four: [{ animal: 'Monkey', age: 10 }],
      },
      {
        first: 'three',
        second: 'another value',
        three: { A: [1, 2, 3], B: null },
        four: [{ animal: 'Monkey', age: 10 }],
      }
    )
  ).toBe(true)
})

test("deepEquality: complex nested objects don't match", () => {
  expect(
    deepEquality(
      {
        first: 'three',
        second: 'another value',
        three: { A: [1, 2, 3], B: null },
        four: [{ animal: 'Monkey', age: 9 }],
      },
      {
        first: 'three',
        second: 'another value',
        three: { A: [1, 2, 3], B: null },
        four: [{ animal: 'Monkey', age: 10 }],
      }
    )
  ).toBe(false)
})
