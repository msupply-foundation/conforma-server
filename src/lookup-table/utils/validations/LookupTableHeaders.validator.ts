import {
  isArrayContainsStringValid,
  isFirstLetterAlphabetValid,
  isSpaceDashAlphanumericValid,
} from '.'
import { IValidator } from './types'

class LookupTableHeadersValidator implements IValidator {
  private _headers: string[] = []
  private _errorMessages: string[] = []

  constructor(headers: string[]) {
    this._headers = headers
    this.validate()
  }

  protected validate(): void {
    this._errorMessages = []
    if (!isArrayContainsStringValid(this._headers, 'id')) {
      this._errorMessages.push(`Column header 'ID' is required`)
    }

    this._headers.forEach((header) => {
      if (!isFirstLetterAlphabetValid(header)) {
        this._errorMessages.push(`Column header '${header}' has non-alphabet first letter.`)
      }
      if (!isSpaceDashAlphanumericValid(header)) {
        this._errorMessages.push(
          `Column header '${header}' can only have space, dash and alpha-numeric characters.`
        )
      }
    })
  }

  get isValid() {
    return this._errorMessages.length === 0
  }

  get errorMessages() {
    return this._errorMessages
  }
}

export default LookupTableHeadersValidator
