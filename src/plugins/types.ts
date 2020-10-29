type ActionQueueStatus = 'Success' | 'Fail' | 'Processing' | 'Queued' | 'Scheduled' | null

export interface ActionPluginOutput {
  status: ActionQueueStatus
  error_log: string
  output?: { [key: string]: any }
}
