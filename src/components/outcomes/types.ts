import { Application, OutcomeDisplayColumnDefinition } from '../../generated/graphql'

// Response value of /outcomes endpoint
export type OutcomesResponse = {
  tableName: string
  title: string
  code: string
}[]

interface FormatOptions {
  markdown?: boolean
  dateFormat?: string
  // Add more as required
}

export interface DisplayDefinition {
  title: string
  isBasicField: boolean
  dataType?: string
  formatting: FormatOptions
}
interface HeaderRowColumn extends DisplayDefinition {
  columnName: string
}

interface TableRow {
  id: number
  rowValues: any[]
  rowValuesObject: { [key: string]: any }
}

// Response object of /outcomes/table endpoint
export interface OutcomesTableResponse {
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

// Response object of /outcomes/table/.../item endpoint
export interface OutcomesDetailResponse {
  id: number
  columns: string[]
  item: { [key: string]: any }
  displayDefinitions: { [key: string]: HeaderRowColumn }
  linkedApplications: Application[]
}
