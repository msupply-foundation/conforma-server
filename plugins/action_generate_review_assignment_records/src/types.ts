import { ReviewAssignmentStatus } from '../../../src/generated/graphql'

export interface ApplicationData {
  applicationId: number
  templateId: number
  stageId: number
  stageNumber: number
}

export interface Reviewer {
  userId: number
  orgId: number | null
  restrictions: { [key: string]: object }
  allowedSections: string[] | null
  canSelfAssign: boolean
}

interface ReviewAssignment {
  reviewerId: number
  orgId: number | null
  stageId: number
  stageNumber: number
  status: ReviewAssignmentStatus
  applicationId: number
  allowedSections: string[] | null
  levelNumber: number
  isLastLevel: boolean
}

export interface ReviewAssignmentObject {
  [key: string]: ReviewAssignment
}
