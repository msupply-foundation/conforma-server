import { objectKeysToCamelCase, objectKeysToSnakeCase } from './utilityFunctions'

test('Convert object to camelCase', () => {
  expect(objectKeysToCamelCase({ snake_key_1: 1, otherCaseKey: 2 })).toEqual({
    snakeKey1: 1,
    otherCaseKey: 2,
  })
})

test('Convert object to snake_case', () => {
  expect(objectKeysToSnakeCase({ camelCase1: 1, UPPER_CASE: 2, TitleCase: 3 })).toEqual({
    camel_case_1: 1,
    upper_case: 2,
    title_case: 3,
  })
})
