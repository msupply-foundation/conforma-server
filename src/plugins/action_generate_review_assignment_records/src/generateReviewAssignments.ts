module.exports['generateReviewAssignments'] = async function (input: any, DBConnect: any) {
  try {
    const { appId, templateId, stageId, stageNumber, reviewId } = input

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
      reviewerId: reviewer.user__id,
      orgId: null, // TO-DO
      stageId,
      status: nextReviewLevel === 1 ? 'Available' : 'Available for self-assignment',
      allowedSectionIds: getAllowedSectionIds(),
      level: nextReviewLevel,
      isLastLevel: nextReviewLevel === numReviewLevels,
    }))

    console.log('reviewAssignments', reviewAssignments)

    const databaseUpdateResult = await DBConnect.addReviewAssignments(reviewAssignments)

    console.log('databaseUpdateResult', databaseUpdateResult)

    return numReviewLevels
    // console.log(`\nAdding new user: ${user.username}`)
    // const result = await DBConnect.createUser(user)
    // if (result.success)
    //   return {
    //     status: 'Success',
    //     error_log: '',
    //     output: {
    //       userId: result.userId,
    //       username: user.username,
    //       firstName: user?.first_name,
    //       lastName: user?.last_name,
    //       email: user.email,
    //     },
    //   }
    // else
    //   return {
    //     status: 'Fail',
    //     error_log: 'Problem creating review_assignment records.',
    //   }
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
