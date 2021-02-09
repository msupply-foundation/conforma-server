import { Reviewer, ReviewAssignmentObject, AssignmentStatus } from './types'

module.exports['generateReviewAssignments'] = async function (input: any, DBConnect: any) {
  console.log('Generating review assignment records...')
  try {
    const { applicationId, reviewId, templateId, stageId, stageNumber } = input
    // NB: reviewId comes from record_id on TriggerPayload when triggered
    // from review table

    const numReviewLevels: number = await DBConnect.getNumReviewLevels(templateId, stageNumber)

    const currentReviewLevel: number = reviewId
      ? await DBConnect.getCurrentReviewLevel(reviewId)
      : 0
    if (currentReviewLevel === numReviewLevels) return {}

    const nextReviewLevel = currentReviewLevel + 1

    const nextLevelReviewers = await DBConnect.getReviewersForApplicationStageLevel(
      templateId,
      stageNumber,
      nextReviewLevel
    )

    const reviewAssignments: ReviewAssignmentObject = {}

    // Build reviewers into object map so we can combine duplicate user_orgs
    // and merge their section code restrictions
    nextLevelReviewers.forEach((reviewer: Reviewer) => {
      const { user_id: userId, organisation_id: orgId, restrictions } = reviewer

      const templateSectionRestrictions = restrictions
        ? restrictions.templateSectionRestrictions
        : null

      const userOrgKey = `${userId}_${orgId ? orgId : 0}`
      if (reviewAssignments[userOrgKey])
        reviewAssignments[userOrgKey].templateSectionRestrictions = mergeSectionRestrictions(
          reviewAssignments[userOrgKey]?.templateSectionRestrictions,
          templateSectionRestrictions
        )
      else
        reviewAssignments[userOrgKey] = {
          reviewerId: userId,
          orgId,
          stageId,
          stageNumber,
          // TO-DO: allow STATUS to be configurable in template
          status: nextReviewLevel === 1 ? AssignmentStatus.AVAILABLE : AssignmentStatus.SELF_ASSIGN,
          applicationId,
          templateSectionRestrictions,
          level: nextReviewLevel,
          isLastLevel: nextReviewLevel === numReviewLevels,
        }
    })

    const reviewAssignmentIds = await DBConnect.addReviewAssignments(
      Object.values(reviewAssignments)
    )

    console.log('Review Assignment IDs:', reviewAssignmentIds)

    return {
      status: 'Success',
      error_log: '',
      output: {
        reviewAssignments,
        reviewAssignmentIds: reviewAssignmentIds,
        currentReviewLevel,
        nextReviewLevel,
      },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'Problem creating review_assignment records.',
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
  else return [...prevArray, ...newArray]
}
