module.exports['generateReviewAssignments'] = async function (input: any, DBConnect: any) {
  try {
    const { applicationId, reviewId, templateId, stageId, stageNumber } = input

    // reviewId comes from record_id on Trigger

    const numReviewLevels: number = await DBConnect.getNumReviewLevels(templateId, stageNumber)

    const currentReviewLevel: number = reviewId
      ? await DBConnect.getCurrentReviewLevel(reviewId)
      : 0

    console.log('currentReviewLevel', currentReviewLevel)

    if (currentReviewLevel === numReviewLevels) return {}

    const nextReviewLevel = currentReviewLevel + 1

    console.log('nextReviewLevel', nextReviewLevel)

    const nextLevelReviewers = await DBConnect.getReviewersForApplicationStageLevel(
      templateId,
      stageNumber,
      nextReviewLevel
    )

    console.log('reviewers', nextLevelReviewers)

    const reviewAssignments: any = {}

    // Build reviewers into object map so we can combine duplicate user_orgs
    // and merge their section code restrictions
    nextLevelReviewers.forEach((reviewer: any) => {
      const userOrgKey = `${reviewer.user_id}_${
        reviewer.organisation_id ? reviewer.organisation_id : 0
      }`
      if (reviewAssignments[userOrgKey])
        reviewAssignments[userOrgKey].templateSectionRestrictions = mergeSectionRestrictions(
          reviewAssignments[userOrgKey].templateSectionRestrictions,
          reviewer.restrictions?.templateSectionRestrictions
        )
      else
        reviewAssignments[userOrgKey] = {
          reviewerId: reviewer.user_id,
          orgId: reviewer.organisation_id || null,
          stageId,
          stageNumber,
          status: nextReviewLevel === 1 ? 'Available' : 'Available for self-assignment', // TO-DO: allow this to be configurable
          applicationId,
          templateSectionRestrictions: reviewer.restrictions?.templateSectionRestrictions,
          level: nextReviewLevel,
          isLastLevel: nextReviewLevel === numReviewLevels,
        }
    })

    console.log('reviewAssignments', reviewAssignments)

    const reviewAssignmentIds = await DBConnect.addReviewAssignments(
      Object.values(reviewAssignments)
    )

    // TO-DO: Delete records that are no longer valid (e.g. Reviewer no
    // longer has permission, has been removed, etc.)

    console.log('databaseUpdateResult', reviewAssignmentIds)

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

// Helper method -- concatenates two arrays, but handles case when either
// or both are null/undefined
const mergeSectionRestrictions = (prevArray: string[] | null, newArray: string[] | null) => {
  if (!prevArray) return newArray
  else if (!newArray) return prevArray
  else return [...prevArray, ...newArray]
}
