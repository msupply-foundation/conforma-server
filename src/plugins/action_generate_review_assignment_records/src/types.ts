export enum AssignmentStatus {
  AVAILABLE = 'Available',
  NOT_AVAILABLE = 'Not available',
  ASSIGNED = 'Assigned',
  SELF_ASSIGN = 'Available for self-assignment',
}

interface Restrictions {
  templateSectionRestrictions?: string[] | undefined
}

export interface Reviewer {
  user_id: number
  organisation_id: number | null
  restrictions: Restrictions
}

interface ReviewAssignment {
  reviewerId: number
  orgId: number | null
  stageId: number
  stageNumber: number
  status: AssignmentStatus
  applicationId: number
  templateSectionRestrictions: string[] | null | undefined
  level: number
  isLastLevel: boolean
}

export interface ReviewAssignmentObject {
  [key: string]: ReviewAssignment
}
