import { BaseValidator } from '.'
import { ILookupTableNameValidator } from './types'

class LookupTableNameValidator extends BaseValidator implements ILookupTableNameValidator {
  private _model: any = ''
  private _tableName: string = ''

  constructor({ model, tableName }: any) {
    super()
    this._model = model
    this._tableName = tableName
  }

  async validate(): Promise<void> {
    this.errorMessages = []
    const result = await this._model.countStructureRowsByTableName(this._tableName)
    if (result > 0)
      this.errorMessages.push(`Lookup table with name '${this._tableName}' already exists.`)
    return
  }
}

export default LookupTableNameValidator
