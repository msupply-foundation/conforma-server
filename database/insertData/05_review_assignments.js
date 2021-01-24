/*
Assign Review Test applications to Reviewers
*/
exports.queries = [
  // Assign test review application to Mr. Reviewer 1 (Section 1)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          applicationId: 400
          assignerId: 8
          reviewerId: 6
          stageId: 5
          reviewQuestionAssignmentsUsingId: {
            create: [
              { templateElementId: 401 }
              { templateElementId: 402 }
              { templateElementId: 403 }
              { templateElementId: 405 }
              { templateElementId: 406 }
              { templateElementId: 407 }
            ]
          }
        }
      }
    ) {
      reviewer {
        username
      }
      reviewAssignment {
        application {
          name
        }
      }
    }
  }`,
  // Assign test review application to Mrs. Reviewer 2 (Section 2)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          applicationId: 400
          assignerId: 8
          reviewerId: 7
          stageId: 5
          reviewQuestionAssignmentsUsingId: {
            create: [
              { templateElementId: 408 }
              { templateElementId: 409 }
              { templateElementId: 411 }
              { templateElementId: 412 }
              { templateElementId: 413 }
            ]
          }
        }
      }
    ) {
      reviewer {
        username
      }
      reviewAssignment {
        application {
          name
        }
      }
    }
  }`,
]
