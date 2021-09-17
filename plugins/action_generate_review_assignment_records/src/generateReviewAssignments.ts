import { ActionPluginInput } from '../../types'
import {
  Reviewer,
  ReviewAssignmentObject,
  ExistingReviewAssignment,
  AssignmentState,
} from './types'
import databaseMethods from './databaseMethods'
import {
  ActionQueueStatus,
  PermissionPolicyType,
  ReviewAssignment,
  ReviewAssignmentStatus,
} from '../../../src/generated/graphql'

async function generateReviewAssignments({
  parameters,
  applicationData,
  DBConnect,
}: ActionPluginInput) {
  const db = databaseMethods(DBConnect)

  let assignmentPending: [boolean, string] = [false, '']

  // Get application/reviewId from applicationData if not provided in parameters
  const applicationId = parameters?.applicationId ?? applicationData?.applicationId
  const reviewId = parameters?.reviewId ?? applicationData?.reviewData?.reviewId
  // Check if "isReview = false" to overwrite having received reviewId - used when need to process an upgrade on same review levels
  const overwriteIsReview = parameters?.isReview

  // Set "isReview = true" when receiving reviewId (and isReview != false) OR triggered from table 'review'
  // Even if "isReview === true" is received, but no reviewId it will be considered "isReview = false"
  const isReview = !!overwriteIsReview
    ? overwriteIsReview && reviewId !== undefined
    : reviewId !== undefined || applicationData?.action_payload?.trigger_payload?.table === 'review'

  console.log('Generating review assignment records...')
  try {
    // Get template information and current stage for application
    const { templateId, stageNumber, stageId, stageHistoryTimeCreated } =
      applicationData ?? (await DBConnect.getApplicationData(applicationId))

    const numReviewLevels: number = (await DBConnect.getNumReviewLevels(stageId)) || 0
    const lastStageNumber: number = await db.getLastStageNumber(applicationId)

    let nextReviewLevel = 1

    // For first review assignment
    if (!isReview) {
      if (numReviewLevels === 0)
        assignmentPending = [true, 'No reviewer with level associated to first stage']
    }
    // For level 1+ or next stages review assignment
    else {
      const { stageNumber: submittedReviewStage, levelNumber: submittedReviewLevel } =
        await DBConnect.getReviewStageAndLevel(reviewId)

      console.log(`Submitted stage ${submittedReviewStage} level ${submittedReviewLevel}`)
      // Review in new stage - first level
      if (submittedReviewStage !== stageNumber) {
        if (numReviewLevels === 0)
          assignmentPending = [
            false,
            `No reviewer with level associated to stageNumber ${stageNumber}`,
          ]
      }
      // Review in same stage - for next level
      else {
        nextReviewLevel = submittedReviewLevel + 1
        if (nextReviewLevel > numReviewLevels)
          assignmentPending = [false, 'Final review level reached for current stage']
      }
    }
    if (!assignmentPending[0]) {
      return {
        status: ActionQueueStatus.Success,
        error_log: assignmentPending[1],
        output: {},
      }
    } else {
      console.log(
        `Generating assignment for stage ${stageNumber} with total levels: ${numReviewLevels}`,
        `Current review level ${nextReviewLevel}`,
        `Last stage number ${lastStageNumber}`
      )

      // Check if other reviewAssignment is already assigned to create new ones LOCKED
      const existingReviewAssignments: ExistingReviewAssignment[] =
        await db.getExistingReviewAssignments(applicationId, stageNumber, nextReviewLevel)

      const nextLevelReviewers = await db.getPersonnelForApplicationStageLevel(
        templateId,
        stageNumber,
        nextReviewLevel,
        PermissionPolicyType.Review
      )
      console.log('Existing reviewers for stage/level', nextLevelReviewers)

      const isLastLevel = nextReviewLevel === numReviewLevels
      const isLastStage = stageNumber === lastStageNumber

      const reviewAssignments: ReviewAssignmentObject = generateNextReviewAssignments({
        existingReviewAssignments,
        nextReviewLevel,
        nextLevelReviewers,
        applicationId,
        levelNumber: nextReviewLevel,
        isLastLevel,
        isLastStage,
        stageId,
        stageNumber,
        timeStageCreated: stageHistoryTimeCreated,
      })

      // Save review_assignment records to database
      const reviewAssignmentIds = await db.addReviewAssignments(
        Object.values(reviewAssignments) as ReviewAssignment[]
      )

      // Generate review_assignment_assigner_joins
      // For now we assume that assigners have no Section restrictions
      console.log('Generating review_assignment_assigner_join records...')
      const availableAssigners = await db.getPersonnelForApplicationStageLevel(
        templateId,
        stageNumber,
        nextReviewLevel,
        PermissionPolicyType.Assign
      )
      const reviewAssignmentAssignerJoins = []
      for (const reviewAssignmentId of reviewAssignmentIds) {
        for (const assigner of availableAssigners) {
          reviewAssignmentAssignerJoins.push({
            assignerId: assigner.userId,
            orgId: assigner.orgId,
            reviewAssignmentId,
          })
        }
      }
      const reviewAssignmentAssignerJoinIds = await db.addReviewAssignmentAssignerJoins(
        reviewAssignmentAssignerJoins
      )

      console.log('ReviewAssignmentAssignerJoinIds', reviewAssignmentAssignerJoinIds)

      return {
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          reviewAssignments,
          reviewAssignmentIds,
          reviewAssignmentAssignerJoins,
          reviewAssignmentAssignerJoinIds,
          nextStageNumber: stageNumber,
          nextReviewLevel,
        },
      }
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'Problem creating review_assignment records: ' + error.message,
    }
  }
}

interface GenerateNextReviewAssignmentsProps {
  existingReviewAssignments: ExistingReviewAssignment[]
  nextReviewLevel: number
  nextLevelReviewers: Reviewer[]
  applicationId: number
  levelNumber: number
  isLastLevel: boolean
  isLastStage: boolean
  stageId: number
  stageNumber: number
  timeStageCreated: Date
}

const generateNextReviewAssignments = ({
  existingReviewAssignments,
  nextReviewLevel,
  nextLevelReviewers,
  applicationId,
  levelNumber,
  isLastLevel,
  isLastStage,
  stageId,
  stageNumber,
  timeStageCreated,
}: GenerateNextReviewAssignmentsProps): ReviewAssignmentObject => {
  const reviewAssignments: ReviewAssignmentObject = {}
  // Build reviewers into object map so we can combine duplicate user_orgs
  // and merge their section code restrictions
  nextLevelReviewers.forEach((reviewer: Reviewer) => {
    // Check if existing review assignment
    const existingAssignment = existingReviewAssignments.find(
      (reviewAssignment) => reviewAssignment.userId === reviewer.userId
    )

    // Get assignmentState with: status, isLocked and isSelfAssigned (to create new or update)
    const assignment = getNewOrExistingAssignmentStatus(
      existingReviewAssignments.some(({ status }) => status == ReviewAssignmentStatus.Assigned),
      reviewer.canMakeFinalDecision,
      reviewer.canSelfAssign || nextReviewLevel > 1,
      existingAssignment
    )

    constructReviewAssignmentObject(
      reviewAssignments,
      reviewer,
      assignment,
      applicationId,
      levelNumber,
      isLastLevel,
      isLastStage,
      stageId,
      stageNumber,
      timeStageCreated
    )
  })

  return reviewAssignments
}

// --------- Helper functions ---------

// Build ReviewAssignment object to be generated
const constructReviewAssignmentObject = (
  reviewAssignments: ReviewAssignmentObject,
  reviewer: Reviewer,
  assignment: AssignmentState,
  applicationId: number,
  levelNumber: number,
  isLastLevel: boolean,
  isLastStage: boolean,
  stageId: number,
  stageNumber: number,
  timeStageCreated: Date
) => {
  const { status, isSelfAssignable, isLocked } = assignment
  const { userId, orgId, allowedSections, canMakeFinalDecision } = reviewer
  const userOrgKey = `${userId}_${orgId ? orgId : 0}`
  if (reviewAssignments[userOrgKey])
    reviewAssignments[userOrgKey].allowedSections =
      mergeAllowedSections(reviewAssignments[userOrgKey].allowedSections, allowedSections) || null
  else
    reviewAssignments[userOrgKey] = {
      reviewerId: userId,
      organisationId: orgId,
      status,
      allowedSections: allowedSections || null,
      isSelfAssignable: isSelfAssignable || false,
      isFinalDecision: canMakeFinalDecision,
      isLocked,
      applicationId,
      levelNumber,
      isLastLevel,
      isLastStage,
      stageId,
      stageNumber,
      timeStageCreated,
    }
}

// Checks if existing assignment, should keep status and update if isLocked
const getNewOrExistingAssignmentStatus = (
  // userId: number,
  reviewAlreadyAssigned: boolean,
  canMakeFinalDecision: boolean,
  isSelfAssignable: boolean,
  existingAssignment?: ExistingReviewAssignment
): AssignmentState => {
  // temporarily final decision shouldn't be locked if there are other reviewAssignemt assigned
  // Note: This logic will be updated during implementation of ISSUE #836 (front-end) to allow
  // locking other reviewAssignments for finalDecision once one has been submitted.
  if (canMakeFinalDecision)
    return { status: ReviewAssignmentStatus.Assigned, isSelfAssignable: true, isLocked: false }

  // If user already has reviewAssignment return same status and isLocked flag
  if (existingAssignment)
    return {
      status: existingAssignment.status,
      isSelfAssignable: existingAssignment.isSelfAssignable,
      isLocked: existingAssignment.isLocked,
    }

  // Non-existing review assignments
  // Should create new ReviewAssignment status = Available (always)
  // If review canSelfAssign then isSelfAssignable = true (Default: false)
  // If reviewAlreadyAssigned then isLocked = true (only for self-assignable)
  return {
    status: ReviewAssignmentStatus.Available,
    isSelfAssignable,
    isLocked: reviewAlreadyAssigned && isSelfAssignable,
  }
}

// Concatenates two arrays, but handles case
// when either or both are null/undefined
const mergeAllowedSections = (prevArray?: string[] | null, newArray?: string[] | null) => {
  if (!prevArray) return newArray
  else if (!newArray) return prevArray
  else return Array.from(new Set([...prevArray, ...newArray]))
}

export default generateReviewAssignments
