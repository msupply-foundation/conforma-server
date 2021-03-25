import { Reviewer, ReviewAssignmentObject, AssignmentStatus } from './types'
import databaseMethods from './databaseMethods'

module.exports['generateReviewAssignments'] = async function (input: any, DBConnect: any) {
  const db = databaseMethods(DBConnect)

  console.log('Generating review assignment records...')
  try {
    const { applicationId, reviewId, templateId, stageId, stageNumber } = input
    // NB: reviewId comes from record_id on TriggerPayload when triggered
    // from review table

    const numReviewLevels: number = await DBConnect.getNumReviewLevels(templateId, stageNumber)

    const currentReviewLevel: number = reviewId
      ? await DBConnect.getCurrentReviewLevel(reviewId)
      : 0
    if (currentReviewLevel === numReviewLevels) {
      console.log(
        'Final review level reached for current stage, no later review assignments to generate.'
      )
      return {
        status: 'Success',
        error_log: '',
        output: {},
      }
    }
    const nextReviewLevel = currentReviewLevel + 1

    const nextLevelReviewers = await db.getPersonnelForApplicationStageLevel(
      templateId,
      stageNumber,
      nextReviewLevel,
      'Review'
    )

    const reviewAssignments: ReviewAssignmentObject = {}

    // Build reviewers into object map so we can combine duplicate user_orgs
    // and merge their section code restrictions
    nextLevelReviewers.forEach((reviewer: Reviewer) => {
      const { userId, orgId, restrictions } = reviewer

      const templateSectionRestrictions = restrictions
        ? restrictions?.templateSectionRestrictions
        : null

      const canSelfAssign = restrictions?.canSelfAssign
      // Automatic option for slef assignment if review is above level 1
      const status =
        canSelfAssign || nextReviewLevel > 1
          ? AssignmentStatus.SELF_ASSIGN
          : AssignmentStatus.AVAILABLE

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
          stageId,
          stageNumber,
          // TO-DO: allow STATUS to be configurable in template
          status,
          applicationId,
          templateSectionRestrictions,
          level: nextReviewLevel,
          isLastLevel: nextReviewLevel === numReviewLevels,
        }
    })
    // console.log('ReviewAssignments', reviewAssignments)

    // Save review_assignment records to database
    const reviewAssignmentIds = await db.addReviewAssignments(Object.values(reviewAssignments))

    // Generate review_assignment_assigner_joins
    // For now we assume that assigners have no Section restrictions
    console.log('Generating review_assignment_assigner_join records...')
    const availableAssigners = await db.getPersonnelForApplicationStageLevel(
      templateId,
      stageNumber,
      nextReviewLevel,
      'Assign'
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
      status: 'Success',
      error_log: '',
      output: {
        reviewAssignments: Object.values(reviewAssignments),
        reviewAssignmentIds,
        reviewAssignmentAssignerJoins,
        reviewAssignmentAssignerJoinIds,
        currentReviewLevel,
        nextReviewLevel,
      },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'Problem creating review_assignment records: ' + error.message,
    }
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
