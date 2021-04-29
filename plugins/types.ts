import { ActionApplicationData } from '../src/types'

type ActionQueueStatus = 'Success' | 'Fail' | 'Processing' | 'Queued' | 'Scheduled' | null

export interface ActionPluginInput {
  parameters: { [key: string]: any }
  applicationData?: ActionApplicationData
  outputCumulative?: { [key: string]: any }
  DBConnect?: any
}
export interface ActionPluginOutput {
  status: ActionQueueStatus
  error_log: string
  output?: { [key: string]: any }
}

export type Status =
  | 'Draft'
  | 'Withdrawn'
  | 'Submitted'
  | 'Changes Required'
  | 'Re-submitted'
  | 'Completed'
  | 'Expired'
