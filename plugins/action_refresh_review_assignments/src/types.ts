import { ResultObject } from '../../action_generate_review_assignment_records/src/types'
import { ActionQueueStatus } from '../../../src/generated/graphql'

export interface SingleApplicationResult {
  applicationId: number
  status: ActionQueueStatus
  error_log: string
  output: { levels: ResultObject[] }
}

export interface OutputObject {
  status: ActionQueueStatus
  error_log: string
  output: {
    updatedApplications: SingleApplicationResult[]
  }
}
