type AssignmentStatus = 'Available' | 'Not available' | 'Assigned' | 'Available for self-assignment'

interface Restrictions {
  templateSectionRestrictions?: string[]
}

export interface Reviewer {
  user_id: number
  organisation_id: number | null
  restrictions: Restrictions | null
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
