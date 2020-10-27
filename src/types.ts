import { Trigger } from './generated/graphql'

export interface ActionInTemplate {
  code: string
  path: string
  name: string
  trigger: string
  sequence: number | null
  condition: { [key: string]: any }
  parameter_queries: { [key: string]: any }
}

export interface ActionSequential extends ActionInTemplate {
  sequence: number
}

export interface ActionInTemplateGetPayload {
  record_id: number
  trigger: TriggerStatus
}

export interface ActionLibrary {
  [key: string]: Function
}

export interface ActionQueue {
  id: number
  status?: ActionQueueStatus
  action_code: string
  parameters: { [key: string]: any }
  time_completed: string
}

// TODO: Ideally this would be coming from postgraphile types, to be consistent with the types
type ActionQueueStatus = 'Scheduled' | 'Processing' | 'Queued' | 'Success' | 'Fail'

export interface ActionQueuePayload {
  trigger_event: number
  template_id: number
  action_code: string
  parameters: { [key: string]: any }
  status: ActionQueueStatus
}

export interface ActionQueueGetPayload {
  status: ActionQueueStatus
}

export interface ActionQueueExecutePayload {
  id: number
  error_log: string
  status: ActionQueueStatus
}

export interface ActionPayload {
  id: number
  code: string
  parameters: { [key: string]: any }
}

export interface ActionPlugin {
  code: string
  name: string
  description: string
  path: string
  function_name: string
  required_parameters: any[]
}

export interface ActionPluginPayload {
  code: string
  name: string
  description: string
  path: string
  function_name: string
  required_parameters: { [key: string]: any }
}

// export interface User {
//   first_name?: string
//   last_name?: string
//   username: string
//   date_of_birth?: Date
//   password_hash: string
//   email: string
// }

export interface File {
  id: number
  path: string
  original_filename: string
}

export interface FilePayload {
  user_id: number
  original_filename: string
  path: string
  mimetype: string
  application_id: number
  application_response_id: number
}

export interface FileGetPayload {
  id: number
}

export type QueryParams = string[] | { [key: string]: any }

// TODO: Ideally this would be coming from postgraphile types, to be consistent with the types
type TriggerStatus = 'Triggered' | 'Actions Dispatched' | 'Error'

export interface TriggerPayload {
  id: number
  trigger: Trigger
  table: string
  record_id: number
}

export interface TriggerQueueUpdatePayload {
  id: number
  status: TriggerStatus
}

// export type ApplicationOutcome = 'Pending' | 'Approved' | 'Rejected'
