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
  canMakeFinalDecision: boolean
}

export interface ReviewAssignment {
  reviewerId: number
  organisationId: number | null
  stageId: number
  stageNumber: number
  timeStageCreated?: Date
  status: ReviewAssignmentStatus
  applicationId: number
  allowedSections: string[] | null
  assignedSections: string[] | null
  levelNumber: number
  isLastLevel: boolean
  isLastStage: boolean
  isFinalDecision: boolean
  isSelfAssignable: boolean
}

export interface ReviewAssignmentObject {
  [key: string]: ReviewAssignment
}

export interface AssignmentState {
  status: ReviewAssignmentStatus
  isSelfAssignable: boolean
  assignedSections?: string[]
}

export type ExistingReviewAssignment = {
  userId: number
} & AssignmentState

export interface DeleteReviewAssignment {
  userId: number
  applicationId: number
  stageNumber: number
  levelNumber: number
}

export interface ResultObject {
  reviewAssignments: ReviewAssignment[]
  reviewAssignmentIds: number[]
  reviewAssignmentAssignerJoins: {
    assignerId: number
    orgId: number
    reviewAssignmentId: number
  }[]
  reviewAssignmentAssignerJoinIds: number[]
  removedAssignmentIds: number[]
  stageNumber: number
  reviewLevel: number
}
