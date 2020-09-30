export interface ActionInTemplate {
  code: string
  path: string
  name: string
  trigger: string
  condition: { [key: string]: any }
  parameter_queries: { [key: string]: any }
}

export interface ActionLibrary {
  [key: string]: Function
}

export interface ActionQueue {
  id: number
  status?: ActionQueueStatus
  action_code: string
  parameters: { [key: string]: any }
  execution_time: string
}

// TODO: Ideally this would be coming from postgraphile types, to be consistent with the types
type ActionQueueStatus = 'Scheduled' | 'Queued' | 'Success' | 'Fail'

export interface ActionQueuePayload {
  trigger_event: number
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

export interface ActionPluginDeletePayload {
  code: string
}

export interface ActionPluginPayload {
  code: string
  name: string
  description: string
  path: string
  function_name: string
  required_parameters: { [key: string]: any }
}

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

// TODO: Ideally this would be coming from postgraphile types, to be consistent with the types
type TriggerStatus = 'Triggered' | 'Action Dispatched' | 'Error'

export interface ActionInTemplateGetPayload {
  template_id: number
  trigger: TriggerStatus
}

export interface TriggerPayload {
  id: number
  trigger: TriggerStatus
  table: string
  record_id: number
}

export interface TriggerQueueUpdatePayload {
  id: number
  status: TriggerStatus
}
