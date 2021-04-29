import {
  BaseValidator,
  isArrayContainsStringValid,
  isFirstLetterAlphabetValid,
  isSpaceDashAlphanumericValid,
} from '.'

class LookupTableHeadersValidator extends BaseValidator {
  private _headers: string[] = []

  constructor(headers: string[]) {
    super()
    this._headers = headers
    this.validate()
  }

  protected validate(): void {
    this.errorMessages = []
    if (!isArrayContainsStringValid(this._headers, 'id')) {
      this.errorMessages.push(`Column header 'ID' is required`)
    }

    this._headers.forEach((header) => {
      if (!isFirstLetterAlphabetValid(header)) {
        this.errorMessages.push(`Column header '${header}' has non-alphabet first letter.`)
      }
      if (!isSpaceDashAlphanumericValid(header)) {
        this.errorMessages.push(
          `Column header '${header}' can only have space, dash and alpha-numeric characters.`
        )
      }
    })
  }
}

export default LookupTableHeadersValidator
