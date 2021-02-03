/*
Assign Review Test applications to Reviewers
*/
exports.queries = [
  // Assign test reviews of Application 1 for Review Testing (template)
  // -- Review Lvl 1 - Stage 1 APPROVED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1000
          applicationId: 4000
          stageId: 5
          userToReviewerId: { 
            connectByUsername: { username: "testReviewer1" } 
          }
          status: ASSIGNED
          availableTemplateSectionIds: [1005, 1006]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 1000, templateElementId: 4001 }
              { id: 1001, templateElementId: 4002 }
              { id: 1002, templateElementId: 4003 }
              { id: 1003, templateElementId: 4005 }
              { id: 1004, templateElementId: 4006 }
              { id: 1005, templateElementId: 4007 }
              { id: 1006, templateElementId: 4008 }
              { id: 1007, templateElementId: 4009 }
              { id: 1008, templateElementId: 4011 }
              { id: 1009, templateElementId: 4012 }
              { id: 1010, templateElementId: 4013 }
            ]
          }
          reviewsUsingId: {
            create: {
              id: 1000
              isLastLevel: true
              level: 1
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4000
                    reviewQuestionAssignmentId: 1000
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4001
                    reviewQuestionAssignmentId: 1001
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4002
                    reviewQuestionAssignmentId: 1002
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4003
                    reviewQuestionAssignmentId: 1003
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4004
                    reviewQuestionAssignmentId: 1004
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4005
                    reviewQuestionAssignmentId: 1005
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4006
                    reviewQuestionAssignmentId: 1006
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4007
                    reviewQuestionAssignmentId: 1007
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4008
                    reviewQuestionAssignmentId: 1008
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4009
                    reviewQuestionAssignmentId: 1009
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4010
                    reviewQuestionAssignmentId: 1010
                    status: SUBMITTED
                    decision: APPROVE
                  }
                ]
              }
            }
          }
        }
      }
    ) {
      reviewAssignment {
        application {
          name
        }
        stage {
          id
        }
        reviewer{
          username
        }
      }
    }
  }`,
  // -- Reviewer 1 in Stage 2 (Section 1) - APPROVED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1001
          applicationId: 4000
          stageId: 6
          userToReviewerId: { 
            connectByUsername: { username: "testReviewer1" } 
          }
          status: ASSIGNED
          availableTemplateSectionIds: [1005]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 1011, templateElementId: 4001 }
              { id: 1012, templateElementId: 4002 }
              { id: 1013, templateElementId: 4003 }
              { id: 1014, templateElementId: 4005 }
              { id: 1015, templateElementId: 4006 }
              { id: 1016, templateElementId: 4007 }
            ]
          }
          reviewsUsingId: {
            create: {
              id: 1001
              isLastLevel: false
              level: 1
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4000
                    reviewQuestionAssignmentId: 1011
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4001
                    reviewQuestionAssignmentId: 1012
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4002
                    reviewQuestionAssignmentId: 1013
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4003
                    reviewQuestionAssignmentId: 1014
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4004
                    reviewQuestionAssignmentId: 1015
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4005
                    reviewQuestionAssignmentId: 1016
                    status: SUBMITTED
                    decision: APPROVE
                  }
                ]
              }
            }
          }
        }
      }
    ) {
      reviewer {
        username
      }
      stage {
        title
      }
      reviewAssignment {
        application {
          name
        }
      }
    }
  }`,
  // -- Reviewer 2 in Stage 2 (Section 2) - DECLINED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1002
          applicationId: 4000
          stageId: 6
          userToReviewerId: {
            connectByUsername: { username: "testReviewer2" }
          }
          status: ASSIGNED
          availableTemplateSectionIds: [1006]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 1017, templateElementId: 4008 }
              { id: 1018, templateElementId: 4009 }
              { id: 1019, templateElementId: 4011 }
              { id: 1020, templateElementId: 4012 }
              { id: 1021, templateElementId: 4013 }
            ]
          }
          reviewsUsingId: {
            create: {
              id: 1002
              isLastLevel: false
              level: 1
              reviewResponsesUsingId: { 
                create: [
                  { 
                    applicationResponseId: 4006
                    reviewQuestionAssignmentId: 1017
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  { 
                    applicationResponseId: 4007
                    reviewQuestionAssignmentId: 1018
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  { 
                    applicationResponseId: 4008
                    reviewQuestionAssignmentId: 1019
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  { 
                    applicationResponseId: 4009
                    reviewQuestionAssignmentId: 1020
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  { 
                    applicationResponseId: 4010
                    reviewQuestionAssignmentId: 1021
                    status: SUBMITTED
                    decision: DECLINE
                    comment: "Not descriptive side effects"
                  }
                ]
              }
            }
          }     
        }
      }
    ) {
      reviewer {
        username
      }
      stage {
        title
      }
      reviewAssignment {
        application {
          name
        }
      }
    }
  }`,
  // -- Consolidator 1 Lvl 2 - Stage 2 - NOT STARTED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1003
          applicationId: 4000
          stageId: 6
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator1" }
          }
          status: AVAILABLE_FOR_SELF_ASSIGNMENT
          availableTemplateSectionIds: [1005, 1006]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 1022, templateElementId: 4001 }
              { id: 1023, templateElementId: 4002 }
              { id: 1024, templateElementId: 4003 }
              { id: 1025, templateElementId: 4005 }
              { id: 1026, templateElementId: 4006 }
              { id: 1027, templateElementId: 4007 }
              { id: 1028, templateElementId: 4008 }
              { id: 1029, templateElementId: 4009 }
              { id: 1030, templateElementId: 4011 }
              { id: 1031, templateElementId: 4012 }
              { id: 1032, templateElementId: 4013 }
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
  // -- Consolidator 2 Lvl 2 - Stage 2 - NOT STARTED (There are 2 possible consolidators...)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1004
          applicationId: 4000
          stageId: 6
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator2" }
          }
          status: AVAILABLE_FOR_SELF_ASSIGNMENT
          availableTemplateSectionIds: [1005, 1006]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 1033, templateElementId: 4001 }
              { id: 1034, templateElementId: 4002 }
              { id: 1035, templateElementId: 4003 }
              { id: 1036, templateElementId: 4005 }
              { id: 1037, templateElementId: 4006 }
              { id: 1038, templateElementId: 4007 }
              { id: 1039, templateElementId: 4008 }
              { id: 1040, templateElementId: 4009 }
              { id: 1041, templateElementId: 4011 }
              { id: 1042, templateElementId: 4012 }
              { id: 1043, templateElementId: 4013 }
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
