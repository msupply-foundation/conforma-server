/*
Assign Review Test applications to Reviewers
*/
exports.queries = [
  // Assign test review application to Mr. Reviewer 1 (Section 1)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          applicationId: 4
          assignerId: 8
          reviewerId: 6
          stageId: 5
          reviewQuestionAssignmentsUsingId: {
            create: [
              { templateElementId: 43 }
              { templateElementId: 44 }
              { templateElementId: 45 }
              { templateElementId: 47 }
              { templateElementId: 48 }
              { templateElementId: 49 }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }`,
  // Assign test review application to Mrs. Reviewer 2 (Section 2)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          applicationId: 4
          assignerId: 8
          reviewerId: 7
          stageId: 5
          reviewQuestionAssignmentsUsingId: {
            create: [
              { templateElementId: 50 }
              { templateElementId: 51 }
              { templateElementId: 53 }
              { templateElementId: 54 }
              { templateElementId: 55 }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }`,
]
