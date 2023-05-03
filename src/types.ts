import { BasicObject, EvaluatorNode } from '@openmsupply/expression-evaluator/lib/types'
import {
  ActionQueueStatus,
  ApplicationOutcome,
  ApplicationStatus,
  Trigger,
  TriggerQueueStatus,
} from './generated/graphql'

export interface ActionInTemplate {
  code: string
  path: string
  name: string
  trigger: string
  event_code: null | string
  sequence: number | null
  condition: EvaluatorNode
  parameter_queries: { [key: string]: any }
  parameters_evaluated: { [key: string]: any }
  serial_pattern?: string
}

export interface ActionSequential extends ActionInTemplate {
  sequence: number
}

export interface ActionInTemplateGetPayload {
  record_id: number
  trigger: Trigger
}

export interface ActionLibrary {
  [key: string]: Function
}

export interface ActionQueue {
  id: number
  status?: ActionQueueStatus
  action_code: string
  trigger_payload: TriggerPayload
  condition_expression?: EvaluatorNode
  parameter_queries: { [key: string]: any }
  parameters_evaluated: { [key: string]: any }
  time_completed: string
}

export interface ActionQueuePayload {
  trigger_event: number | null
  trigger_payload: TriggerPayload
  template_id: number
  action_code: string
  sequence: number | null
  condition_expression: EvaluatorNode
  condition_evaluated?: boolean
  parameter_queries: { [key: string]: any }
  parameters_evaluated: { [key: string]: any }
  status: ActionQueueStatus
}

export interface ActionQueueGetPayload {
  status: ActionQueueStatus
}

export interface ActionQueueExecutePayload {
  id: number
  error_log: string | null
  parameters_evaluated: { [key: string]: any } | null
  status: ActionQueueStatus
  output: BasicObject | null
}

export interface ActionResult {
  action: string // code
  status: ActionQueueStatus
  output: BasicObject | null
  errorLog: string | null
}

export interface ReviewData {
  reviewId?: number
  levelNumber?: number
  isLastLevel?: boolean
  status?: string
  reviewer?: {
    id: number
    username: string
    firstName: string
    lastName: string
    email: string
  }
  latestDecision?: {
    decision: string
    comment: string | null
  }
}

// Comes from database query "getApplicationData"
export interface BaseApplicationData {
  applicationId: number
  applicationSerial: string
  applicationName: string
  sessionId: string
  templateId: number
  templateName: string
  templateCode: string
  stageId: number
  stageNumber: number
  stage: string
  stageHistoryId: number
  stageHistoryTimeCreated: Date
  statusHistoryId: number
  status: ApplicationStatus
  statusHistoryTimeCreated: Date
  userId: number
  orgId: number | null
  outcome: ApplicationOutcome
}

export interface ActionApplicationData extends BaseApplicationData {
  action_payload: ActionPayload | undefined
  firstName: string | null
  lastName: string | null
  username: string
  dateOfBirth: Date | null
  email: string
  orgName: string | null
  sectionCodes: string[]
  isAdmin: boolean
  isManager: boolean
  responses: {
    [key: string]: any
  }
  reviewData: ReviewData
  environmentData: {
    appRootFolder: string
    filesFolder: string
    SMTPConfig?: {
      host: string
      port: number
      secure: boolean
      user: string
      defaultFromName: string
      defaultFromEmail: string
    }
  }
  other?: {
    // Use this for dev related stuff, shouldn't be used in actual configs
    suppressEmail?: boolean
  }
}

export interface ActionPayload {
  id: number
  code: string
  parameter_queries: { [key: string]: any }
  condition_expression: EvaluatorNode
  trigger_payload?: TriggerPayload
}

export interface ActionPlugin {
  code: string
  name: string
  description: string
  path: string
  required_parameters: string[]
  optional_parameters: string[]
  output_properties?: string[]
}

export interface ActionPluginPayload {
  code: string
  name: string
  description: string
  path: string
  required_parameters: { [key: string]: any }
}

export interface FileDownloadInfo {
  original_filename: string
  file_path?: string
  thumbnail_path?: string
}

export interface FilePayload {
  user_id: number
  unique_id: string
  original_filename: string
  template_id: number
  application_serial: string
  application_response_id: number
  description: string
  is_output_doc: boolean
  file_path: string
  thumbnail_path: string
  mimetype: string
  submitted?: boolean
  timestamp?: string
}

export interface FileGetPayload {
  id: number
}

export type QueryParams = string[] | { [key: string]: any }

export interface TriggerPayload {
  trigger_id: number | null
  trigger: Trigger
  table: string
  record_id: number
  application_id?: number
  event_code?: string
  data?: { [key: string]: any }
  applicationDataOverride?: Partial<ActionApplicationData>
}

export interface TriggerQueueUpdatePayload {
  id: number
  status: TriggerQueueStatus
}

export interface User {
  userId: number
  firstName: string
  lastName: string | null
  username: string
  email: string
  dateOfBirth: Date | null
  organisation?: Organisation
  passwordHash?: string
}

export interface Organisation {
  orgId: number
  userRole?: string | null
  orgName: string
  registration?: string
  address?: string
  logoUrl?: string
  isSystemOrg?: boolean
}

export interface UserOrg extends User, Organisation {
  id: number
}

export interface ServerPreferences {
  thumbnailMaxWidth?: number
  thumbnailMaxHeight?: number
  hoursSchedule?: number[]
  SMTPConfig?: {
    host: string
    port: number
    secure: boolean
    user: string
    defaultFromName: string
    defaultFromEmail: string
  }
  systemManagerPermissionName?: string
  previewDocsMinKeepTime?: string
  previewDocsCleanupSchedule?: number[]
  backupSchedule?: number[]
  backupFilePrefix?: string
  maxBackupDurationDays?: number
}

export const serverPrefKeys: (keyof ServerPreferences)[] = [
  // Must contain ALL keys of ServerPreferences -- please check
  'thumbnailMaxHeight',
  'thumbnailMaxWidth',
  'hoursSchedule',
  'SMTPConfig',
  'systemManagerPermissionName',
  'previewDocsMinKeepTime',
  'previewDocsCleanupSchedule',
  'backupSchedule',
  'backupFilePrefix',
  'maxBackupDurationDays',
]
