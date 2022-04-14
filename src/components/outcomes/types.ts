import { OutcomeDisplayColumnDefinition } from '../../generated/graphql'

// Response value of /outcomes endpoint
export type OutcomesResponse = {
  tableName: string
  title: string
  code: string
}[]

interface FormatOptions {
  elementTypePluginCode: string
  elementParameters: object
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
interface HeaderRow extends DisplayDefinition {
  columnName: string
}

interface TableRow {
  id: number
  rowValues: any[]
  item: { [key: string]: any }
}

// Response object of /outcomes/table endpoint
export interface OutcomesTableResponse {
  tableName: string
  title: string
  code: string
  headerRow: HeaderRow[]
  tableRows: TableRow[]
  totalCount: number
  message?: string
}

export type ColumnDisplayDefinitions = {
  [key: string]: OutcomeDisplayColumnDefinition
}

export interface ColumnDefinition {
  columnName: string
  isBasicField: boolean
  dataType: string | undefined
  columnDefinition: OutcomeDisplayColumnDefinition | undefined
}
export type ColumnDefinitionMasterList = ColumnDefinition[]

export interface ColumnDetailOutput {
  title: string
  code: string
  columnDefinitionMasterList: ColumnDefinitionMasterList
  gqlFilters: object
  fieldNames: string[]
  headerDefinition: ColumnDefinition | undefined
  showLinkedApplications: boolean
}

export interface LinkedApplication {
  id: number
  name: string
  serial: string
  templateName: string
  templateCode: string
  dateCompleted: Date
}

export interface DetailsHeader {
  value: any
  columnName: string
  isBasicField: boolean
  dataType: string | undefined
  formatting: FormatOptions
}

// Response object of /outcomes/table/.../item endpoint
export interface OutcomesDetailResponse {
  tableName: string
  tableTitle: string
  id: number
  header: DetailsHeader
  columns: string[]
  item: { [key: string]: any }
  displayDefinitions: { [key: string]: DisplayDefinition }
  linkedApplications?: LinkedApplication[] | GraphQLQueryError
}

export interface GraphQLQueryError {
  error: true
  message: string
  detail: string
}
