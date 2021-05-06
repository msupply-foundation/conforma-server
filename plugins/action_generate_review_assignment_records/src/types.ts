import { ReviewAssignmentStatus } from '../../../src/generated/graphql'

export interface ApplicationData {
  applicationId: number
  templateId: number
  stageId: number
  stageNumber: number
}

interface Restrictions {
  templateSectionRestrictions?: string[] | undefined
  canSelfAssign?: boolean
}

export interface Reviewer {
  userId: number
  orgId: number | null
  restrictions: Restrictions | null
}

interface ReviewAssignment {
  reviewerId: number
  orgId: number | null
  stageId: number
  stageNumber: number
  status: ReviewAssignmentStatus
  applicationId: number
  templateSectionRestrictions: string[] | null | undefined
  levelNumber: number
  isLastLevel: boolean
}

export interface ReviewAssignmentObject {
  [key: string]: ReviewAssignment
}
