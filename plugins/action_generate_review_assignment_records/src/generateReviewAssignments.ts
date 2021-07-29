import { ActionPluginInput } from '../../types'
import { Reviewer, ReviewAssignmentObject, ReviewAssignment } from './types'
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
      const review = await DBConnect.getReviewStageAndLevel(reviewId)
      if (!review) {
        console.log('No review found for received reviewId, no review assignments to generate.')
        return {
          status: ActionQueueStatus.Success,
          error_log: '',
          output: {},
        }
      }

      const { stageNumber: previousStage, levelNumber: previousLevel } = review
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
    const nextLevelReviewers: Reviewer[] = await db.getPersonnelForApplicationStageLevel(
      templateId,
      stageNumber,
      nextReviewLevel,
      PermissionPolicyType.Review
    )
    console.log('Next level reviewers', nextLevelReviewers)
    // Build reviewers into object map so we can combine duplicate user_orgs
    // and merge their section code restrictions
    const reviewAssignments = await getReviewAssignmentsToGenerate({
      db,
      applicationId,
      nextReviewLevel,
      stageNumber,
      stageId,
      timeStageCreated: stageHistoryTimeCreated,
      isLastLevel,
      isLastStage,
      nextLevelReviewers,
    })

    console.log('ReviewAssignments', reviewAssignments)

    return generateNextReviewAssignments({
      db,
      templateId,
      nextReviewLevel,
      stageNumber,
      reviewAssignments,
    })
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'Problem creating review_assignment records: ' + error.message,
    }
  }
}

// Helper function -- concatenates two arrays, but handles case
// when either or both are null/undefined
const mergeAllowedSections = (prevArray?: string[] | null, newArray?: string[] | null) => {
  if (!prevArray) return newArray
  else if (!newArray) return prevArray
  else return Array.from(new Set([...prevArray, ...newArray]))
}
interface ReviewAssignmentsToGenerateProps {
  db: any
  nextLevelReviewers: Reviewer[]
  nextReviewLevel: number
  applicationId: number
  stageNumber: number
  stageId: number
  timeStageCreated: Date
  isLastLevel: boolean
  isLastStage: boolean
}

const getReviewAssignmentsToGenerate = async ({
  db,
  nextLevelReviewers,
  nextReviewLevel,
  applicationId,
  stageNumber,
  stageId,
  timeStageCreated,
  isLastLevel,
  isLastStage,
}: ReviewAssignmentsToGenerateProps) => {
  const reviewAssignments: ReviewAssignmentObject = {}
  for (const reviewer of nextLevelReviewers) {
    const { userId, orgId, allowedSections, canSelfAssign, canMakeFinalDecision } = reviewer

    const getAssignmentStatus = () => {
      if (canMakeFinalDecision) return ReviewAssignmentStatus.Assigned
      if (canSelfAssign || nextReviewLevel > 1)
        return ReviewAssignmentStatus.AvailableForSelfAssignment
      return ReviewAssignmentStatus.Available
    }

    const existingReviewAssignment = await db.checkExistingReviewAssignment({
      applicationId,
      stageNumber,
      levelNumber: nextReviewLevel,
      reviewerId: userId,
    })

    if (existingReviewAssignment) return // Don't create new reviewAssignment if already exists

    const userOrgKey = `${userId}_${orgId ? orgId : 0}`
    if (reviewAssignments[userOrgKey])
      reviewAssignments[userOrgKey].allowedSections =
        mergeAllowedSections(reviewAssignments[userOrgKey].allowedSections, allowedSections) || null
    else
      reviewAssignments[userOrgKey] = {
        reviewerId: userId,
        orgId,
        stageId,
        stageNumber,
        timeStageCreated,
        status: getAssignmentStatus(),
        applicationId,
        allowedSections: allowedSections || null,
        levelNumber: nextReviewLevel,
        isLastLevel,
        isLastStage,
        isFinalDecision: canMakeFinalDecision,
      }
  }
  return reviewAssignments
}

interface GenerateNextReviewAssignmentsProps {
  db: any
  templateId: number
  nextReviewLevel: number
  stageNumber: number
  reviewAssignments?: ReviewAssignmentObject
}

const generateNextReviewAssignments = async ({
  db,
  templateId,
  nextReviewLevel,
  stageNumber,
  reviewAssignments,
}: GenerateNextReviewAssignmentsProps) => {
  if (!reviewAssignments) {
    console.log('No Review assignments to create')
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {},
    }
  } else {
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

    // Remove timeStageCreated from log - to help with tests
    const reviewAssignmentsLog: ReviewAssignment[] = []

    Object.values(reviewAssignments).forEach((reviewAssignment) => {
      delete reviewAssignment.timeStageCreated
      reviewAssignmentsLog.push(reviewAssignment)
    })
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        reviewAssignments: reviewAssignmentsLog,
        reviewAssignmentIds,
        reviewAssignmentAssignerJoins,
        reviewAssignmentAssignerJoinIds,
        nextStageNumber: stageNumber,
        nextReviewLevel,
      },
    }
  }
}

export default generateReviewAssignments
