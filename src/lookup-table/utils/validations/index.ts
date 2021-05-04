import BaseValidator from './Base.validator'
import LookupTableHeadersValidator from './LookupTableHeaders.validator'
import LookupTableNameValidator from './LookupTableName.validator'

const isFirstLetterAlphabetValid = (value: string): boolean => /^[A-Za-z]{1}/.test(value)

const isSpaceDashAlphanumericValid = (value: string): boolean => /^[A-Za-z0-9_-\s]+$/.test(value)

const isArrayContainsStringValid = (checkArray: string[], requiredValue: string): boolean =>
  checkArray.findIndex((value: string) => requiredValue === value.toLowerCase()) !== -1

export {
  BaseValidator,
  LookupTableNameValidator,
  LookupTableHeadersValidator,
  isFirstLetterAlphabetValid,
  isSpaceDashAlphanumericValid,
  isArrayContainsStringValid,
}
