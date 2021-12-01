import { ActionPluginInput } from '../../types'
import {
  Reviewer,
  ReviewAssignmentObject,
  ExistingReviewAssignment,
  AssignmentState,
  DeleteReviewAssignment,
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

  let noAssignmentsPending: [boolean, string] = [false, '']

  // Get application/reviewId from applicationData if not provided in parameters
  const applicationId = parameters?.applicationId ?? applicationData?.applicationId
  const reviewId = parameters?.reviewId ?? applicationData?.reviewData?.reviewId
  const isRegenaration = parameters?.isRegeneration ?? false
  // Check if "isReview = false" to overwrite having received reviewId - used when need to process an upgrade on same review levels
  const overwriteIsReview = parameters?.isReview

  // Set "isReview = true" when receiving reviewId (and isReview != false) OR triggered from table 'review'
  // Even if "isReview === true" is received, but no reviewId it will be considered "isReview = false"
  const isReview = !!overwriteIsReview
    ? overwriteIsReview && reviewId !== undefined
    : reviewId !== undefined || applicationData?.action_payload?.trigger_payload?.table === 'review'

  try {
    // Get template information and current stage for application
    const { templateId, stageNumber, stageId, stageHistoryTimeCreated } =
      applicationData ?? (await DBConnect.getApplicationData(applicationId))

    console.log('Generating review assignment records...')
    console.log(`Application ${applicationId} stage ${stageNumber}`)

    // Get last existing review level. If there are none, it's assumed to be an application submission - review level 1
    let nextReviewLevel = isRegenaration
      ? (await db.getLastReviewLevel(applicationId, stageNumber)) ?? 1
      : 1

    // Also get number of reviews in current stage and total number of stages
    const numReviewLevels: number = (await DBConnect.getNumReviewLevels(stageId)) || 0
    const lastStageNumber: number = await db.getLastStageNumber(applicationId)

    // let nextReviewLevel = 1

    // For first review assignment
    if (!isReview) {
      if (numReviewLevels === 0)
        noAssignmentsPending = [true, 'No reviewer with level associated to first stage']
    }
    // For level 1+ or next stages review assignment
    else {
      const { stageNumber: submittedReviewStage, levelNumber: submittedReviewLevel } =
        await DBConnect.getReviewStageAndLevel(reviewId)

      console.log(`Submitted stage ${submittedReviewStage} level ${submittedReviewLevel}`)
      // Review in new stage - first level
      if (submittedReviewStage !== stageNumber) {
        if (numReviewLevels === 0)
          noAssignmentsPending = [
            false,
            `No reviewer with level associated to stageNumber ${stageNumber}`,
          ]
      }
      // Review in same stage - for next level
      else {
        nextReviewLevel = submittedReviewLevel + 1
        if (nextReviewLevel > numReviewLevels)
          noAssignmentsPending = [false, 'Final review level reached for current stage']
      }
    }
    if (noAssignmentsPending[0]) {
      return {
        status: ActionQueueStatus.Success,
        error_log: noAssignmentsPending[1],
        output: {},
      }
    } else {
      console.log(
        `Generating assignment for stage ${stageNumber} with total levels: ${numReviewLevels}.`,
        `Current review level ${nextReviewLevel}.`,
        `Last stage number ${lastStageNumber}.`
      )

      // Check if other reviewAssignment is already assigned to create new ones LOCKED
      const previousReviewAssignments: ExistingReviewAssignment[] =
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

      const { createReviewAssignments, deleteReviewAssignments } = generateNextReviewAssignments(
        previousReviewAssignments,
        nextReviewLevel,
        nextLevelReviewers,
        applicationId,
        nextReviewLevel,
        isLastLevel,
        isLastStage,
        stageId,
        stageNumber,
        stageHistoryTimeCreated
      )

      // Delete review_assignment that no longer applies
      const deletedAssignmentIds = await db.removeReviewAssignments(deleteReviewAssignments)

      // Save review_assignment records to database
      const createdReviewAssignmentIds = await db.addReviewAssignments(
        Object.values(createReviewAssignments) as ReviewAssignment[]
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
      const createdReviewAssignerJoins = []
      for (const reviewAssignmentId of createdReviewAssignmentIds) {
        for (const assigner of availableAssigners) {
          createdReviewAssignerJoins.push({
            assignerId: assigner.userId,
            orgId: assigner.orgId,
            reviewAssignmentId,
          })
        }
      }

      const reviewAssignmentAssignerJoinIds = await db.addReviewAssignmentAssignerJoins(
        createdReviewAssignerJoins
      )

      return {
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          reviewAssignments: createReviewAssignments,
          reviewAssignmentIds: createdReviewAssignmentIds,
          reviewAssignmentAssignerJoins: createdReviewAssignerJoins,
          reviewAssignmentAssignerJoinIds,
          removedAssignmentIds: deletedAssignmentIds,
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

type RegerenateReviewAssignments = (
  previousReviewAssignments: ExistingReviewAssignment[],
  nextReviewLevel: number,
  nextLevelReviewers: Reviewer[],
  applicationId: number,
  levelNumber: number,
  isLastLevel: boolean,
  isLastStage: boolean,
  stageId: number,
  stageNumber: number,
  timeStageCreated: Date
) => {
  createReviewAssignments: ReviewAssignmentObject
  deleteReviewAssignments: DeleteReviewAssignment[]
}

const generateNextReviewAssignments: RegerenateReviewAssignments = (
  previousReviewAssignments,
  nextReviewLevel,
  nextLevelReviewers,
  applicationId,
  levelNumber,
  isLastLevel,
  isLastStage,
  stageId,
  stageNumber,
  timeStageCreated
) => {
  // Remove from the list of previous reviewAssignments when
  // no longer showing reviewer on nextLevelReviewers (when permission is revoked)
  const existingReviewAssignments = previousReviewAssignments.filter(({ userId }) =>
    nextLevelReviewers.find(({ userId: reviewerId }) => reviewerId === userId)
  )

  // Get list of reviewAssignments to delete (after user has permission revoked)
  const deleteReviewAssignments: DeleteReviewAssignment[] = previousReviewAssignments
    .filter((x) => !existingReviewAssignments.includes(x))
    .map(({ userId }) => ({ userId, applicationId, stageNumber, levelNumber }))

  const createReviewAssignments: ReviewAssignmentObject = {}
  // Build reviewers into object map so we can combine duplicate user_orgs
  // and merge their section code restrictions
  nextLevelReviewers.forEach((reviewer: Reviewer) => {
    // Check if existing review assignment
    const existingAssignment = existingReviewAssignments.find(
      (reviewAssignment) => reviewAssignment.userId === reviewer.userId
    )

    const existingReviewsAssigned = existingReviewAssignments.filter(
      ({ status }) => status === ReviewAssignmentStatus.Assigned
    )

    // Get assignmentState with: status, isLocked and isSelfAssigned (to create new or update)
    const assignment = getNewOrExistingAssignmentStatus(
      existingReviewsAssigned,
      reviewer.canMakeFinalDecision,
      reviewer.canSelfAssign || nextReviewLevel > 1,
      existingAssignment
    )

    constructReviewAssignmentObject(
      createReviewAssignments,
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

  return { createReviewAssignments, deleteReviewAssignments }
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
  existingReviewsAssigned: ExistingReviewAssignment[],
  canMakeFinalDecision: boolean,
  isSelfAssignable: boolean,
  existingAssignment?: ExistingReviewAssignment
): AssignmentState => {
  const isReviewAssigned = existingReviewsAssigned.length > 0
  const isAssigned = existingReviewsAssigned.some(
    ({ userId }) => userId === existingAssignment?.userId
  )
  // temporarily final decision shouldn't be locked if there are other reviewAssignemt assigned
  // Note: This logic will be updated during implementation of ISSUE #836 (front-end) to allow
  // locking other reviewAssignments for finalDecision once one has been submitted.
  if (canMakeFinalDecision)
    return { status: ReviewAssignmentStatus.Assigned, isSelfAssignable: true, isLocked: false }

  // Create new OR update ReviewAssignment:
  // 1. If existing
  //   - keep same status, isSelfAssignable
  //   - just update isLocked = true (if already assigned to another)
  // 2. If new reviewAssignment:
  //   - status = Available (always)
  //   - if review canSelfAssign set isSelfAssignable = true (Default: false)
  //   - if isReviewAssigned then isLocked = true (only when is self-assignable)
  return {
    status: existingAssignment?.status ?? ReviewAssignmentStatus.Available,
    isSelfAssignable: existingAssignment?.isSelfAssignable ?? isSelfAssignable,
    isLocked:
      existingAssignment && isAssigned
        ? existingAssignment.isLocked
        : isReviewAssigned && isSelfAssignable,
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
