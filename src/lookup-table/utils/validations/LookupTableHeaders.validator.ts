import {
  BaseValidator,
  isArrayContainsStringValid,
  isFirstLetterAlphabetValid,
  isSpaceDashAlphanumericValid,
} from '.'

class LookupTableHeadersValidator extends BaseValidator {
  private headers: string[] = []
  private isImport: boolean = false

  constructor({ headers, isImport = false }: { headers: string[]; isImport?: boolean }) {
    super()
    this.headers = headers
    this.isImport = isImport
    this.validate()
  }

  protected validate(): void {
    this.errorMessages = []
    const isIdPresent = isArrayContainsStringValid(this.headers, 'id')
    if (isIdPresent && this.isImport) {
      this.errorMessages.push(
        `Import csv should not contian internal 'ID' header (can only exist when updating csv)`
      )
    }

    if (!isIdPresent && !this.isImport) this.errorMessages.push(`Column header 'ID' is required`)

    this.headers.forEach((header) => {
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
