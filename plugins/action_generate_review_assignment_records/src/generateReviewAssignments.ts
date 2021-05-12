import { ActionPluginInput } from '../../types'
import { Reviewer, ReviewAssignmentObject } from './types'
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
  const isReview =
    parameters?.isReview === false
      ? false
      : parameters?.isReview || applicationData?.action_payload?.trigger_payload?.table === 'review'

  console.log('Generating review assignment records...')
  try {
    // Get template information and current stage for application
    const { templateId, stageNumber, stageId } =
      applicationData ?? (await DBConnect.getApplicationData(applicationId))

    const numReviewLevels: number = (await DBConnect.getNumReviewLevels(stageId)) || 0

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
      const {
        stageNumber: previousStage,
        levelNumber: previousLevel,
      } = await DBConnect.getReviewStageAndLevel(reviewId)
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
        console.log('New stage - total levels: ', numReviewLevels, stageNumber, previousStage)
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
    return generateNextReviewAssignments({
      db,
      applicationId,
      templateId,
      nextReviewLevel,
      nextStageNumber: stageNumber,
      nextStageId: stageId,
      isLastLevel,
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
  nextStageNumber: number
  nextStageId: number
  isLastLevel: boolean
}

const generateNextReviewAssignments = async ({
  db,
  applicationId,
  templateId,
  nextReviewLevel,
  nextStageNumber,
  nextStageId,
  isLastLevel,
}: GenerateNextReviewAssignmentsProps) => {
  const nextLevelReviewers = await db.getPersonnelForApplicationStageLevel(
    templateId,
    nextStageNumber,
    nextReviewLevel,
    PermissionPolicyType.Review
  )
  console.log('Next level reviewers', nextLevelReviewers)
  const reviewAssignments: ReviewAssignmentObject = {}

  // Build reviewers into object map so we can combine duplicate user_orgs
  // and merge their section code restrictions
  nextLevelReviewers.forEach((reviewer: Reviewer) => {
    const { userId, orgId, restrictions } = reviewer

    const templateSectionRestrictions = restrictions
      ? restrictions?.templateSectionRestrictions
      : null

    const status =
      restrictions?.canSelfAssign || nextReviewLevel > 1
        ? ReviewAssignmentStatus.AvailableForSelfAssignment
        : ReviewAssignmentStatus.Available

    const userOrgKey = `${userId}_${orgId ? orgId : 0}`
    if (reviewAssignments[userOrgKey])
      reviewAssignments[userOrgKey].templateSectionRestrictions = mergeSectionRestrictions(
        reviewAssignments[userOrgKey].templateSectionRestrictions,
        templateSectionRestrictions
      )
    else
      reviewAssignments[userOrgKey] = {
        reviewerId: userId,
        orgId,
        stageId: nextStageId,
        stageNumber: nextStageNumber,
        // TO-DO: allow STATUS to be configurable in template
        status,
        applicationId,
        templateSectionRestrictions,
        levelNumber: nextReviewLevel,
        isLastLevel,
      }
  })
  // Save review_assignment records to database
  const reviewAssignmentIds = await db.addReviewAssignments(Object.values(reviewAssignments))

  // Generate review_assignment_assigner_joins
  // For now we assume that assigners have no Section restrictions
  console.log('Generating review_assignment_assigner_join records...')
  const availableAssigners = await db.getPersonnelForApplicationStageLevel(
    templateId,
    nextStageNumber,
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
      reviewAssignments: Object.values(reviewAssignments),
      reviewAssignmentIds,
      reviewAssignmentAssignerJoins,
      reviewAssignmentAssignerJoinIds,
      nextStageNumber,
      nextReviewLevel,
    },
  }
}

// Helper function -- concatenates two arrays, but handles case
// when either or both are null/undefined
const mergeSectionRestrictions = (
  prevArray: string[] | null | undefined,
  newArray: string[] | null | undefined
) => {
  if (!prevArray) return newArray
  else if (!newArray) return prevArray
  else return Array.from(new Set([...prevArray, ...newArray]))
}

export default generateReviewAssignments
