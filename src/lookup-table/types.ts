type LookupTableStructurePropType = {
  tableName: string
  label?: string
  fieldMap: FieldMapType[]
}

type FieldMapType = {
  label: string
  fieldname: string
  dataType: string
  gqlName: string
}

export { LookupTableStructurePropType, FieldMapType }
