import { ResultObject } from '../../action_generate_review_assignment_records/src/types'
import { ActionQueueStatus } from '../../../src/generated/graphql'

export interface SingleApplicationResult {
  applicationId: number
  status: ActionQueueStatus
  error_log: string
  output: { levels: ResultObject[] }
}

// Per-application change counts returned by the set-based user-scoped refresh
export interface UserRefreshResult {
  applicationId: number
  assignmentsCreated: number
  assignmentsUpdated: number
  assignmentsDeleted: number
  assignerJoinsCreated: number
  assignerJoinsDeleted: number
}

export interface OutputObject {
  status: ActionQueueStatus
  error_log: string
  output: {
    updatedApplications: (SingleApplicationResult | UserRefreshResult)[]
  }
}
