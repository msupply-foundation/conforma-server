import { OutcomeDisplayColumnDefinition } from '../../generated/graphql'

// Response value of /outcomes endpoint
export type OutcomeResult = {
  tableName: string
  title: string
  code: string
}[]

interface FormatOptions {
  markdown?: boolean
  dateFormat?: string
  // Add more as required
}

interface HeaderRowColumn {
  columnName: string
  title: string
  isBasicField: boolean
  dataType?: string
  formatting: FormatOptions
}

interface TableRow {
  id: number
  rowValues: any[]
  rowAsObject: { [key: string]: any }
}

// Response object of /outcomes/table endpoint
export interface OutcomesTableResult {
  headerRow: HeaderRowColumn[]
  tableRows: TableRow[]
  totalCount: number
  message?: string
}

export type ColumnDisplayDefinitions = {
  [key: string]: OutcomeDisplayColumnDefinition
}

export type ColumnDefinitionMasterList = {
  columnName: string
  isBasicField: boolean
  dataType: string | undefined
  columnDefinition: OutcomeDisplayColumnDefinition | undefined
}[]
