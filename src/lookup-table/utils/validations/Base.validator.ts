import { IValidator } from '.'

class BaseValidator implements IValidator {
  protected errorMessages: string[] = []

  protected validate(): void {}

  get isValid() {
    return this.errorMessages.length === 0
  }

  get errors() {
    return this.errorMessages
  }
}

export default BaseValidator
