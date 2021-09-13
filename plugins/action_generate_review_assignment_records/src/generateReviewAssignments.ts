import { ActionPluginInput } from '../../types'
import { Reviewer, ReviewAssignmentObject, ExistingReviewAssignment } from './types'
import databaseMethods from './databaseMethods'
import {
  ActionQueueStatus,
  PermissionPolicyType,
  ReviewAssignmentStatus,
} from '../../../src/generated/graphql'

async function generateReviewAssignments({
  parameters,
  applicationData,
  DBConnect,
}: ActionPluginInput) {
  const db = databaseMethods(DBConnect)

  // Get application/reviewId from applicationData if not provided in parameters
  const applicationId = parameters?.applicationId ?? applicationData?.applicationId
  const reviewId = parameters?.reviewId ?? applicationData?.reviewData?.reviewId
  // Check if "isReview = false" to overwreite having received reviewId - used when need to process an upgrade on same review levels
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
      console.log('First review assignment on first stage - total levels:', numReviewLevels)
      if (numReviewLevels === 0) {
        console.log(
          'No reviewer with level associated to first stage, no review assignments to generate.'
        )
        return {
          status: ActionQueueStatus.Success,
          error_log: '',
          output: {},
        }
      }
    }
    // For level 1+ or next stages review assignment
    else {
      const { stageNumber: previousStage, levelNumber: previousLevel } =
        await DBConnect.getReviewStageAndLevel(reviewId)
      console.log('Review existing', previousStage, previousLevel)
      // Review in new stage - first level
      if (previousStage !== stageNumber) {
        if (numReviewLevels === 0) {
          console.log(
            `No reviewer with level associated to stageNumber ${stageNumber}, no review assignments to generate.`
          )
          return {
            status: ActionQueueStatus.Success,
            error_log: '',
            output: {},
          }
        }
        console.log(
          'New stage - total levels: ',
          numReviewLevels,
          stageNumber,
          '\n Last Stage: ',
          lastStageNumber
        )
      }
      // Review in same stage - for next level
      else {
        nextReviewLevel = previousLevel + 1
        if (nextReviewLevel > numReviewLevels) {
          console.log(
            'Final review level reached for current stage, no later review assignments to generate.'
          )
          return {
            status: ActionQueueStatus.Success,
            error_log: '',
            output: {},
          }
        }
        console.log('Same stage - total levels: ', numReviewLevels, stageNumber, nextReviewLevel)
      }
    }
    const isLastLevel = nextReviewLevel === numReviewLevels
    const isLastStage = stageNumber === lastStageNumber
    return generateNextReviewAssignments({
      db,
      applicationId,
      templateId,
      nextReviewLevel,
      stageNumber,
      stageId,
      timeStageCreated: stageHistoryTimeCreated,
      isLastLevel,
      isLastStage,
    })
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'Problem creating review_assignment records: ' + error.message,
    }
  }
}

interface GenerateNextReviewAssignmentsProps {
  db: any
  applicationId: number
  templateId: number
  nextReviewLevel: number
  stageNumber: number
  stageId: number
  timeStageCreated: Date
  isLastLevel: boolean
  isLastStage: boolean
}

const generateNextReviewAssignments = async ({
  db,
  applicationId,
  templateId,
  nextReviewLevel,
  stageNumber,
  stageId,
  timeStageCreated,
  isLastLevel,
  isLastStage,
}: GenerateNextReviewAssignmentsProps) => {
  const nextLevelReviewers = await db.getPersonnelForApplicationStageLevel(
    templateId,
    stageNumber,
    nextReviewLevel,
    PermissionPolicyType.Review
  )
  console.log('Next level reviewers', nextLevelReviewers)
  const reviewAssignments: ReviewAssignmentObject = {}

  // Check if other reviewAssignment is already assigned to create new ones LOCKED
  const existingReviewAssignments: ExistingReviewAssignment[] =
    await db.getExistingReviewAssignments(applicationId, stageNumber, nextReviewLevel)

  const reviewAlreadyAssigned = existingReviewAssignments.some(
    ({ status }) => status == ReviewAssignmentStatus.Assigned
  )

  const getNewOrExistingAssignmentStatus = (
    userId: number,
    canMakeFinalDecision: boolean,
    canSelfAssign: boolean
  ) => {
    // temporarily final decision shouldn't be locked if there are other reviewAssignemt assigned
    // Note: This logic will be updated during implementation of ISSUE #836 (front-end) to allow
    // locking other reviewAssignments for finalDecision once one has been submitted.
    if (canMakeFinalDecision) return { status: ReviewAssignmentStatus.Assigned, isLocked: false }

    // Check if existing review assignment
    const existingAssignment = existingReviewAssignments.find(
      (reviewAssignment) => reviewAssignment.userId === userId
    )
    // If user already has reviewAssignment return same status and isLocked flag
    if (existingAssignment)
      return { status: existingAssignment.status, isLocked: existingAssignment.isLocked }

    // Non-existing review assignments
    // Note: The code below doens't cover correctly the later creation of reviewAssignments - ISSUE #429
    // (later meaning new Reviewer added to the system that needs to get assignments created for each permission)
    // this code if only preventing new reviewAssignments created to have isLocked set to false when
    // already assigned to another Reviewer - so they start as not-assignable to prevent odd behavior
    // The logic isn't accurate though with what is supposed to be set for a new reviewAssignment:
    // - if level 1 AND isFullyAssignedLevel1 should be set to new status: NotAvailable (?)
    // - if level 1 AND application status is CHANGES_REQUIRED set status: Available and isLocked = true
    // - if level 1 AND NOT isFullyAssignedLevel1 AND appliication status is SUBMITTED, status = Available
    // - if ( canSelfAssign OR level > 1 ) AND reviewAlreadyAssigned set status: SelfAssignedByAnother
    // - if ( canSelfAssign OR level > 1 ) AND application status is CHANGES_REQUIRED set status: Available, isSelfAssignable = true and isLocked = true
    // - if ( canSelfAssign OR level > 1 ) AND appliication status is SUBMITTED, set status: Available and isSelfAssignable = true
    if (canSelfAssign || nextReviewLevel > 1)
      return {
        status: ReviewAssignmentStatus.Available,
        isSelfAssignable: true,
        isLocked: reviewAlreadyAssigned,
      }
    return {
      status: ReviewAssignmentStatus.Available,
      isLocked: reviewAlreadyAssigned,
    }
  }

  // Build reviewers into object map so we can combine duplicate user_orgs
  // and merge their section code restrictions
  nextLevelReviewers.forEach((reviewer: Reviewer) => {
    const { userId, orgId, allowedSections, canSelfAssign, canMakeFinalDecision } = reviewer
    const { status, isSelfAssignable, isLocked } = getNewOrExistingAssignmentStatus(
      userId,
      canMakeFinalDecision,
      canSelfAssign
    )

    const userOrgKey = `${userId}_${orgId ? orgId : 0}`
    if (reviewAssignments[userOrgKey])
      reviewAssignments[userOrgKey].allowedSections =
        mergeAllowedSections(reviewAssignments[userOrgKey].allowedSections, allowedSections) || null
    else
      reviewAssignments[userOrgKey] = {
        reviewerId: userId,
        organisationId: orgId,
        stageId,
        stageNumber,
        timeStageCreated,
        // TO-DO: allow STATUS to be configurable in template
        status,
        applicationId,
        allowedSections: allowedSections || null,
        levelNumber: nextReviewLevel,
        isLastLevel,
        isLastStage,
        isSelfAssignable: isSelfAssignable || false,
        isFinalDecision: canMakeFinalDecision,
        isLocked,
      }
  })
  // Save review_assignment records to database
  const reviewAssignmentIds = await db.addReviewAssignments(Object.values(reviewAssignments))

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

// Helper function -- concatenates two arrays, but handles case
// when either or both are null/undefined
const mergeAllowedSections = (prevArray?: string[] | null, newArray?: string[] | null) => {
  if (!prevArray) return newArray
  else if (!newArray) return prevArray
  else return Array.from(new Set([...prevArray, ...newArray]))
}

export default generateReviewAssignments
