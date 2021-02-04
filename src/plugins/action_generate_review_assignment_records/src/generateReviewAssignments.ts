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

    const reviewAssignments = nextLevelReviewers.map((reviewer: any) => ({
      reviewerId: reviewer.user_id,
      orgId: null, // TO-DO
      stageId,
      status: nextReviewLevel === 1 ? 'Available' : 'Available for self-assignment',
      applicationId,
      allowedSectionIds: getAllowedSectionIds(),
      level: nextReviewLevel,
      isLastLevel: nextReviewLevel === numReviewLevels,
    }))

    console.log('reviewAssignments', reviewAssignments)

    const reviewAssignmentIds = await DBConnect.addReviewAssignments(reviewAssignments)

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

const getAllowedSectionIds = () => {
  return [1, 2, 3]
}
