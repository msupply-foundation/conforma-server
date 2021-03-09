// Test suite for the updateReviewVisibility Action

import DBConnect from '../../../components/databaseConnect'

const Action = require('./updateReviewVisibility')

// Setup database
beforeAll(async (done) => {
  // Set field recommended_applicant_visibility on review 6 (it had two decline review_response, ID: 37 and 38)
  await DBConnect.query({
    text: `
    UPDATE review_response SET recommended_applicant_visibility = 'Original Response Visible to Applicant' where decision = 'Decline' and review_id = 6
  `,
    values: [],
  })
  done()
})

test('Test: updateReviewVisibility', () => {
  return Action.updateReviewVisibility({ reviewId: 6 }, DBConnect).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      error_log: '',
      output: {
        reviewResponsesWithUpdatedVisibility: [37, 38],
      },
    })
  })
})
