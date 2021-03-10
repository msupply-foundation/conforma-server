import databaseMethods from './databaseMethods'
const isEqual = require('deep-equal')

type ReviewStatus = 'Draft' | 'Submitted' | 'Changes Requested' | 'Pending' | 'Locked'
interface Response {
  id: number
  code: string
  template_element_id?: number
  application_response_id?: number
  review_response_link_id?: number
  value: { [key: string]: any }
  comment?: string
  decision?: string
  time_updated: any
}

interface ResponsesById {
  [key: number]: Response[]
}
interface Review {
  reviewId: number
  reviewAssignmentId: number
  applicationId: number
  reviewerId: number
  level: number
  reviewStatus: ReviewStatus
}

module.exports['updateReviews'] = async function (input: any, DBConnect: any) {
  const db = databaseMethods(DBConnect)

  console.log('Updating reviews status...')

  const { applicationId } = input

  const applicationResponses = groupResponses(
    await await DBConnect.getAllApplicationResponses(applicationId),
    'template_element_id'
  )

  const reviewsToUpdate = []

  try {
    // Get reviews/review assignments (with status) matching application_id
    const reviews = (await db.getAssociatedReviews(applicationId)).filter(
      (review: Review) => review.reviewStatus in ['Submitted', 'Locked', 'Draft']
    )
    for (const review of reviews) {
      const { reviewAssignmentId, level, reviewStatus } = review
      if (level > 1) reviewsToUpdate.push({ ...review, reviewStatus: 'Pending' })
      else if (await haveResponsesChanged(reviewAssignmentId, applicationResponses))
        reviewsToUpdate.push({ ...review, reviewStatus: 'Pending' })
    }
    // .map((review: Review) => {
    //   const { reviewAssignmentId, level, reviewStatus } = review
    //   if (level !== 1 || (await haveResponsesChanged(reviewAssignmentId, applicationId)))
    //     return { ...review, reviewStatus: 'Pending' }
    // })
    // .filter((review: Review) => review.reviewStatus === 'Pending')

    // Iterate over reviews
    // If Draft/Locked/(Submitted && !Level1) -> change to Pending, continue
    // If Submitted && L1 (assumed now):
    // Get application responses and collect which have changed
    // check latest application response timestamp later than review?
    // If changes, add to Update with status "Pending"

    // reviews to update to Action Queue (which will trigger status change)

    return {
      status: 'Success',
      error_log: '',
      output: {
        // deletedCodes,
        // updatedCodes,
      },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'There was a problem trimming duplicated responses.',
    }
  }

  async function haveResponsesChanged(reviewAssignmentId: number, applicationResponses: any) {
    const questionAssignments = await db.getReviewQuestionAssignments(reviewAssignmentId)
    // const groupedResponses = groupResponses(
    //   db.getAllApplicationResponses(applicationId),
    //   'template_element_id'
    // )
    return true
  }
}

type GroupField = 'template_element_id' | 'application_response_id' | 'review_response_link_id'

function groupResponses(responses: Response[], groupField: GroupField): ResponsesById {
  const responsesGrouped: ResponsesById = {}
  for (const response of responses) {
    const id = response[groupField]
    if (!id) continue
    if (groupField === 'application_response_id' || groupField === 'review_response_link_id')
      response.value = { comment: response.comment, decision: response.decision }
    if (!(id in responsesGrouped)) responsesGrouped[id] = [response]
    else responsesGrouped[id].push(response)
  }
  return responsesGrouped
}
