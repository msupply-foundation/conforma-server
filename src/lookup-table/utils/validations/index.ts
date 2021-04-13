import LookupTableHeadersValidator from './LookupTableHeaders.validator'

const isFirstLetterAlphabetValid = (value: string): boolean => /^[A-Za-z]{1}/.test(value)

const isSpaceDashAlphanumericValid = (value: string): boolean => /^[A-Za-z0-9_-\s]+$/.test(value)

const isArrayContainsStringValid = (checkArray: string[], requiredValue: string): boolean =>
  checkArray.findIndex((value: string) => requiredValue === value.toLowerCase()) !== -1

export {
  LookupTableHeadersValidator,
  isFirstLetterAlphabetValid,
  isSpaceDashAlphanumericValid,
  isArrayContainsStringValid,
}
