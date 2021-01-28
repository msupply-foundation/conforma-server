/*
Assign Review Test applications to Reviewers
*/
exports.queries = [
  // Assign test review application to Mr. Reviewer 1 (Section 1)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          applicationId: 4000
          stageId: 5
          userToReviewerId: {
            connectByUsername: {
              username: "testReviewer1"
            }
          }
          status: AVAILABLE_FOR_SELF_ASSIGNMENT
          availableSectionsIds: [1005]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { templateElementId: 4001 }
              { templateElementId: 4002 }
              { templateElementId: 4003 }
              { templateElementId: 4005 }
              { templateElementId: 4006 }
              { templateElementId: 4007 }
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
          applicationId: 4000
          stageId: 5
          userToReviewerId: {
            connectByUsername: {
              username: "testReviewer2"
            }
          }
          status: AVAILABLE_FOR_SELF_ASSIGNMENT
          availableSectionsIds: [1006]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { templateElementId: 4008 }
              { templateElementId: 4009 }
              { templateElementId: 4011 }
              { templateElementId: 4012 }
              { templateElementId: 4013 }
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
