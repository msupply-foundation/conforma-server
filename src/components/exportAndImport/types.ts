export type DatabaseColumn = {
  columnName: string
  isPrimary: boolean
  isUnique: boolean
  isNullable: boolean
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
    [tableName: string]: object
  }
  includeTables: string[]
  excludeTables: string[]
  shouldReInitialise: boolean
  usePgDump?: boolean
  skipZip?: boolean
  insertScriptsLocale: string
  includeInsertScripts: string[]
  excludeInsertScripts: string[]
  // tablesToUpdateOnInsertFail is deprecated, but values are still required (for existing snapshots), they key is change to skipTableOnInsertFail in useSnapshot
  tablesToUpdateOnInsertFail: string[]
  skipTableOnInsertFail: string[]
  includeLocalisation?: boolean
  includePrefs?: boolean
  resetFiles: boolean
  templates?: { resetVersion?: boolean; newCode?: string; checkVersionOnImport?: boolean }
  archive?: ArchiveOption
}

export type ArchiveInfo = { type: 'full' | 'none' | 'partial'; from?: string; to?: string } | null
export interface SnapshotInfo {
  timestamp: string
  version: string
  archive?: ArchiveInfo
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
  isArchiveSnapshot?: boolean
}) => Promise<{ success: boolean; message: string; error?: string }>

export type ArchiveSnapshotOperation = (props: {
  snapshotName?: string
  archiveOption?: ArchiveOption
}) => Promise<{ success: boolean; message: string; error?: string }>

export type ArchiveOption =
  | 'none'
  | 'full'
  | string
  | number
  | { from: string | number; to: string | number }
