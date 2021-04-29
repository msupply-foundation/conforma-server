import { RequestGenericInterface } from 'fastify'

interface ILookupTableCsvRequest extends RequestGenericInterface {
  Params: { lookupTableId: string }
}

type LookupTableBase = {
  name: string
  fieldMap: FieldMapType[]
}

interface LookupTableStructure extends LookupTableBase {
  label: string
}

interface LookupTableStructureFull extends LookupTableStructure {
  id: number
}

interface GqlQueryResult<T = any> {
  [tableName: string]: T
}

type FieldMapType = {
  label: string
  fieldname: string
  dataType: string
  gqlName: string
}

export {
  ILookupTableCsvRequest,
  LookupTableBase,
  LookupTableStructure,
  LookupTableStructureFull,
  FieldMapType,
  GqlQueryResult,
}
