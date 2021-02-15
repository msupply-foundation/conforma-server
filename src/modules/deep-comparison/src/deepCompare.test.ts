import deepCompare from './deepCompare'

test('deepCompare: two numbers match', () => {
  expect(deepCompare(2, 2)).toBe(true)
})

test("deepCompare: two numbers don't match", () => {
  expect(deepCompare(2, 3)).toBe(false)
})

test('deepCompare: two different sized arrays', () => {
  expect(deepCompare([1, 2, 3], [1, 2, 3, 4])).toBe(false)
})

test('deepCompare: one primitive, one object', () => {
  expect(deepCompare('a string', { one: 1, two: 2 })).toBe(false)
})

test('deepCompare: simple arrays match', () => {
  expect(deepCompare([1, 2, 3, 4], [1, 2, 3, 4])).toBe(true)
})

test('deepCompare: simple arrays different values', () => {
  expect(deepCompare([1, 2, 3, 4], [1, 2, 3, 5])).toBe(false)
})

test('deepCompare: nested arrays match', () => {
  expect(deepCompare([1, 2, ['A', 'B'], ['C', 'D']], [1, 2, ['A', 'B'], ['C', 'D']])).toBe(true)
})

test("deepCompare: nested arrays don't match", () => {
  expect(deepCompare([1, 2, ['A', 'X'], ['C', 'D']], [1, 2, ['A', 'B'], ['C', 'D']])).toBe(false)
})

test('deepCompare: one array, one object', () => {
  expect(
    deepCompare({ first: 'three', second: 'another value' }, [1, 2, ['A', 'B'], ['C', 'D']])
  ).toBe(false)
})

test('deepCompare: simple objects match', () => {
  expect(
    deepCompare(
      { first: 'three', second: 'another value' },
      { first: 'three', second: 'another value' }
    )
  ).toBe(true)
})

test("deepCompare: simple objects values don't match", () => {
  expect(
    deepCompare({ first: 'three', second: 'another value' }, { first: 'three', second: 'oops' })
  ).toBe(false)
})

test("deepCompare: simple objects keys don't match", () => {
  expect(
    deepCompare(
      { first: 'three', second: 'another value' },
      { first: 'three', notSecond: 'another value' }
    )
  ).toBe(false)
})

test('deepCompare: complex nested objects match', () => {
  expect(
    deepCompare(
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

test("deepCompare: complex nested objects don't match", () => {
  expect(
    deepCompare(
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
