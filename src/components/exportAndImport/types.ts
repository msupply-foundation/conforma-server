export type DatabaseColumn = {
  columnName: string
  isPrimary: boolean
  isUnique: boolean
  isGenerated: boolean
  isReference: boolean
  isEnum: boolean
  isEnumArray: boolean
  isJson: boolean
  isJsonArray: boolean
  reference: {
    tableName: string
    columnName: string
  }
}

export type DatabaseTable = {
  tableName: string
  isView: boolean
  referenceTables: string[]
  columns: DatabaseColumn[]
}

export type DatabaseTables = DatabaseTable[]

export type ExportAndImportOptions = {
  filters: {
    [tableName: string]: { [key: string]: any }
  }
  includeTables: string[]
  excludeTables: string[]
  shouldReInitialise: boolean
  insertScriptsLocale: string
  includeInsertScripts: string[]
  excludeInsertScripts: string[]
  // tablesToUpdateOnInsertFail is deprecated, but values are still required (for existing snapshots), they key is change to skipTableOnInsertFail in useSnapshot
  tablesToUpdateOnInsertFail: string[]
  skipTableOnInsertFail: string[]
  includeLocalisation?: boolean
  includePrefs?: boolean
  exportCustomLocalisationsAsJson?: true
  resetFiles: boolean
}

export type ObjectRecord = { [columnName: string]: any }
export type ObjectRecords = {
  [tableName: string]: ObjectRecord[]
}

export type InsertedRecords = {
  [tableName: string]: {
    old: ObjectRecord
    new: ObjectRecord
  }[]
}

export type SnapshotOperation = (props: {
  snapshotName?: string
  optionsName?: string
  options?: ExportAndImportOptions
  extraOptions?: Partial<ExportAndImportOptions>
}) => Promise<{ success: boolean; message: string; error?: string }>
