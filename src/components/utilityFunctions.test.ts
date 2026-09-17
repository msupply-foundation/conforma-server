import {
  objectKeysToCamelCase,
  objectKeysToSnakeCase,
  filterObject,
  modifyValueInObject,
  getEnvVariableReplacement,
  isEnvVariableReference,
} from './utilityFunctions'

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
const testObject = {
  one: 1,
  twoString: 'two',
  zero: 0,
  falseValue: false,
  nullValue: null,
  undefinedValue: undefined,
  arrayValue: [1, 2, 'three'],
  objectValue: { one: 1, two: 'two', nullValue: null },
}
test('Filter object using default filter function', () => {
  expect(filterObject(testObject)).toEqual({
    one: 1,
    twoString: 'two',
    zero: 0,
    falseValue: false,
    arrayValue: [1, 2, 'three'],
    objectValue: { one: 1, two: 'two', nullValue: null },
  })
})

test('Filter object using custom filter for any falsy value', () => {
  expect(filterObject(testObject, (_, value) => !!value)).toEqual({
    one: 1,
    twoString: 'two',
    arrayValue: [1, 2, 'three'],
    objectValue: { one: 1, two: 'two', nullValue: null },
  })
})

test(`Check modify in object`, () => {
  return expect(
    modifyValueInObject(
      {
        something: { $from: 'yow' },
        somethingElse: { nested: [], alsoNested: { $from: 'hi' } },
      },
      (key, value) => key == '$from' && typeof value == 'string',
      (value) => `private.${value}`
    )
  ).toEqual({
    something: { $from: 'private.yow' },
    somethingElse: { nested: [], alsoNested: { $from: 'private.hi' } },
  })
})

describe('Environment variable references', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, MY_SECRET: 'hunter2', EMPTY_VAR: '' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  test('Substitute a referenced variable', () => {
    expect(getEnvVariableReplacement('env.MY_SECRET')).toBe('hunter2')
  })

  test('Leave a plain value alone', () => {
    expect(getEnvVariableReplacement('hunter2')).toBe('hunter2')
    // Only a whole string of the right shape is a reference
    expect(getEnvVariableReplacement('https://example.org/env.MY_SECRET')).toBe(
      'https://example.org/env.MY_SECRET'
    )
  })

  test('Throw when the referenced variable is not set', () => {
    expect(() => getEnvVariableReplacement('env.NOT_SET')).toThrow(
      'Environment variable not set: NOT_SET'
    )
  })

  // A variable set to nothing is a stated value, not an absent one
  test('Substitute an empty variable', () => {
    expect(getEnvVariableReplacement('env.EMPTY_VAR')).toBe('')
  })

  test('Recognise a reference without resolving it', () => {
    expect(isEnvVariableReference('env.NOT_SET')).toBe(true)
    expect(isEnvVariableReference('hunter2')).toBe(false)
    expect(isEnvVariableReference(undefined)).toBe(false)
  })
})
