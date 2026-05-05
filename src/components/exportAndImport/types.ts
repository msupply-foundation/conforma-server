import { ArchiveInfo } from '../files/archive'

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
  excludeTables: string[]
  shouldReInitialise: boolean
  skipZip?: boolean
  includeLocalisation?: boolean
  includePrefs?: boolean
  resetFiles: boolean
  archive?: ArchiveOption
}

export interface SnapshotInfo {
  timestamp: string
  version: string
  // Bytes; size of the full snapshot folder (excluding info.json itself).
  // Populated when the snapshot is created/uploaded and never recomputed.
  // Optional for backward compatibility with snapshots written before 2.0.0;
  // missing values are lazy-backfilled on read.
  snapshotSize?: number
  // Bytes; sum of totalFileSize across the archives this snapshot references.
  archiveSize?: number
}

export type SnapshotType = 'normal' | 'backup'

export type SnapshotOperation = (props: {
  snapshotName: string
  snapshotType?: SnapshotType
}) => Promise<{ success: boolean; message: string; error?: string; snapshot?: string }>

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
