type LookupTableStructureType = {
  id?: number
  name: string
  label?: string
  fieldMap: FieldMapType[]
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

export { LookupTableStructureType, FieldMapType, GqlQueryResult }
