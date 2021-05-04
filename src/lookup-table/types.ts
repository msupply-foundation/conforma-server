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
  LookupTableBase,
  LookupTableStructure,
  LookupTableStructureFull,
  FieldMapType,
  GqlQueryResult,
}
