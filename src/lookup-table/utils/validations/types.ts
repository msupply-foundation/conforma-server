interface IValidator {
  isValid: boolean
  errors: string[]
}

interface ILookupTableNameValidator extends IValidator {
  validate(): Promise<void> | void
}

export { IValidator, ILookupTableNameValidator }
