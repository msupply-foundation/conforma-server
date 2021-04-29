type LookupTableStructureType = {
  id?: number
  name: string
  label?: string
  fieldMap: FieldMapType[]
}

// Removes 'optional' attributes from a type's properties
type Concrete<Type> = {
  [Property in keyof Type]-?: Type[Property]
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

export { LookupTableStructureType, FieldMapType, Concrete, GqlQueryResult }
