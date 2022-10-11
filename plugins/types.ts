import { ActionQueueStatus } from '../src/generated/graphql'
import { ActionApplicationData } from '../src/types'

export interface ActionPluginInput {
  parameters: { [key: string]: any }
  applicationData?: ActionApplicationData
  outputCumulative?: { [key: string]: any }
  DBConnect?: any
}
export interface ActionPluginOutput {
  status: ActionQueueStatus
  error_log: string
  output?: { [key: string]: any } | Object[]
}

export type ActionPluginType = (props: ActionPluginInput) => Promise<ActionPluginOutput>
