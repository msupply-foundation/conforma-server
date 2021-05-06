// Test suite for the updateReviewVisibility Action

import DBConnect from '../../../src/components/databaseConnect'
import { ActionQueueStatus } from '../../../src/generated/graphql'
import { action as updateReviewVisibility } from './index'

// Setup database
beforeAll(async (done) => {
  // Set field recommended_applicant_visibility on review 5 (it had two decline review_response, ID: 32 and 33)
  await DBConnect.query({
    text: `
    UPDATE review_response SET recommended_applicant_visibility = 'ORIGINAL_RESPONSE_VISIBLE_TO_APPLICANT' where decision = 'DECLINE' and review_id = 5
  `,
    values: [],
  })
  done()
})

test('Test: updateReviewVisibility', () => {
  return updateReviewVisibility({ parameters: { reviewId: 5 }, DBConnect }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        reviewResponsesWithUpdatedVisibility: [33, 32],
      },
    })
  })
})
