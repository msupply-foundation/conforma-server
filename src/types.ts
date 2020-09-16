export interface ActionLibrary {
  [key: string]: Function
}

export interface DatabaseRecord {
  [key: string]: any
  code: string
}

export interface DatabaseResult {
  rows: DatabaseRecord[]
}

export interface TriggerPayload {
  id: number
  trigger: string
  table: string
  record_id: number
}

export interface ActionPayload {
  id: number
  code: string
  parameters: { [key: string]: any }
}

export interface Action {
  code: string
  path: string
  name: string
  trigger: string
  condition: { [key: string]: any }
  parameter_queries: { [key: string]: any }
}
