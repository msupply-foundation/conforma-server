import { IValidator } from './types'

class BaseValidator implements IValidator {
  protected errorMessages: string[] = []

  protected validate(): Promise<void> | void {}

  get isValid() {
    return this.errorMessages.length === 0
  }

  get errors() {
    return this.errorMessages
  }
}

export default BaseValidator
