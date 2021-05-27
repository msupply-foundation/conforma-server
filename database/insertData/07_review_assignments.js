/*
Assign Review Test applications to Reviewers
*/
exports.queries = [
  // Assign test reviews of Application 1 (serial: 12345) of Review Testing (template)
  // -- Review Lvl 1 - Stage 1 (all sections) = APPROVED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1000
          applicationId: 4000
          stageId: 4
          stageNumber: 1
          levelNumber: 1
          isLastLevel: true
          userToReviewerId: { connectByUsername: { username: "testReviewer1" } }
          status: ASSIGNED
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 1000, templateElementId: 4001 }
              { id: 1001, templateElementId: 4002 }
              { id: 1002, templateElementId: 4003 }
              { id: 1003, templateElementId: 4005 }
              { id: 1004, templateElementId: 4006 }
              { id: 1006, templateElementId: 4008 }
              { id: 1007, templateElementId: 4009 }
              { id: 1008, templateElementId: 4011 }
              { id: 1009, templateElementId: 4012 }
              { id: 1010, templateElementId: 4013 }
            ]
          }
          reviewsUsingId: {
            create: {
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
                    reviewQuestionAssignmentId: 1006
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4006
                    reviewQuestionAssignmentId: 1007
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4007
                    reviewQuestionAssignmentId: 1008
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4008
                    reviewQuestionAssignmentId: 1009
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4009
                    reviewQuestionAssignmentId: 1010
                    status: SUBMITTED
                    decision: APPROVE
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  {
                    status: DRAFT
                    isCurrent: false
                    timeCreated: "2021-01-31T00:00:00Z"
                  }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-02-01T00:00:00Z"
                  }
                ]
              }
              reviewDecisionsUsingId: { create: { decision: CONFORM } }
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
        reviewer {
          username
        }
      }
    }
  }`,
  // -- Reviewer 1 in Stage 2, Lvl 1 (section 1) = APPROVED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1001
          applicationId: 4000
          stageId: 5
          stageNumber: 2
          levelNumber: 1
          isLastLevel: false
          userToReviewerId: { connectByUsername: { username: "testReviewer1" } }
          status: ASSIGNED
          allowedSections: ["S1"]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 1011, templateElementId: 4001 }
              { id: 1012, templateElementId: 4002 }
              { id: 1013, templateElementId: 4003 }
              { id: 1014, templateElementId: 4005 }
              { id: 1015, templateElementId: 4006 }
            ]
          }
          reviewsUsingId: {
            create: {
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
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  {
                    status: DRAFT
                    isCurrent: false
                    timeCreated: "2021-02-01T00:00:00Z"
                  }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-02-02T10:00:00Z"
                  }
                ]
              }
              reviewDecisionsUsingId: { create: { decision: CONFORM } }
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
  // -- Reviewer 2 in Stage 2, Lvl 1 (section 2) = DECLINED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1002
          applicationId: 4000
          stageId: 5
          stageNumber: 2
          levelNumber: 1
          isLastLevel: false
          userToReviewerId: { connectByUsername: { username: "testReviewer2" } }
          status: ASSIGNED
          allowedSections: ["S2"]
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
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4005
                    reviewQuestionAssignmentId: 1017
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4006
                    reviewQuestionAssignmentId: 1018
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4007
                    reviewQuestionAssignmentId: 1019
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4008
                    reviewQuestionAssignmentId: 1020
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4009
                    reviewQuestionAssignmentId: 1021
                    status: SUBMITTED
                    decision: DECLINE
                    comment: "Not descriptive side effects"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  {
                    status: DRAFT
                    isCurrent: false
                    timeCreated: "2021-02-01T00:00:00Z"
                  }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-02-02T00:00:00Z"
                  }
                ]
              }
              reviewDecisionsUsingId: {
                create: {
                  decision: LIST_OF_QUESTIONS
                  comment: "Suggestion by Reviewer 2 to reply to applicant with LOQ"
                }
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
  // -- Consolidator 1 Lvl 2 - Stage 2 = ASSIGNED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1003
          applicationId: 4000
          stageId: 5
          stageNumber: 2
          levelNumber: 2
          isLastLevel: true
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator1" }
          }
          status: ASSIGNED
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 1022, templateElementId: 4001 }
              { id: 1023, templateElementId: 4002 }
              { id: 1024, templateElementId: 4003 }
              { id: 1025, templateElementId: 4005 }
              { id: 1026, templateElementId: 4006 }
              { id: 1027, templateElementId: 4008 }
              { id: 1028, templateElementId: 4009 }
              { id: 1029, templateElementId: 4011 }
              { id: 1030, templateElementId: 4012 }
              { id: 1031, templateElementId: 4013 }
            ]
          }
          reviewsUsingId: {
            create: {
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4000
                    reviewQuestionAssignmentId: 1022
                    status: DRAFT
                  }
                  {
                    applicationResponseId: 4001
                    reviewQuestionAssignmentId: 1023
                    status: DRAFT
                  }
                  {
                    applicationResponseId: 4002
                    reviewQuestionAssignmentId: 1024
                    status: DRAFT
                  }
                  {
                    applicationResponseId: 4003
                    reviewQuestionAssignmentId: 1025
                    status: DRAFT
                  }
                  {
                    applicationResponseId: 4004
                    reviewQuestionAssignmentId: 1026
                    status: DRAFT
                  }
                  {
                    applicationResponseId: 4005
                    reviewQuestionAssignmentId: 1027
                    status: DRAFT
                  }
                  {
                    applicationResponseId: 4006
                    reviewQuestionAssignmentId: 1028
                    status: DRAFT
                  }
                  {
                    applicationResponseId: 4007
                    reviewQuestionAssignmentId: 1029
                    status: DRAFT
                  }
                  {
                    applicationResponseId: 4008
                    reviewQuestionAssignmentId: 1030
                    status: DRAFT
                  }
                  {
                    applicationResponseId: 4009
                    reviewQuestionAssignmentId: 1031
                    status: DRAFT
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: true, timeCreated: "2021-05-19T00:00:00Z" }
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
      reviewAssignment {
        application {
          name
        }
      }
    }
  }`,
  // -- Consolidator 2 Lvl 2 - Stage 2 = NOT AVAILABLE (not assignable for this consolidator)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1004
          applicationId: 4000
          stageId: 5
          stageNumber: 2
          levelNumber: 2
          isLastLevel: true
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator2" }
          }
          status: SELF_ASSIGNED_BY_ANOTHER
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 1033, templateElementId: 4001 }
              { id: 1034, templateElementId: 4002 }
              { id: 1035, templateElementId: 4003 }
              { id: 1036, templateElementId: 4005 }
              { id: 1037, templateElementId: 4006 }
              { id: 1038, templateElementId: 4008 }
              { id: 1039, templateElementId: 4009 }
              { id: 1040, templateElementId: 4011 }
              { id: 1041, templateElementId: 4012 }
              { id: 1042, templateElementId: 4013 }
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
  // Assign test reviews of Application 2 (serial: 23456) of Review Testing (template)
  // -- Review Lvl 1 - Stage 1 (all sections) = submitted LIST_OF_QUESTION to Applicant
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1005
          applicationId: 4001
          stageId: 4
          stageNumber: 1
          levelNumber: 1
          isLastLevel: true
          userToReviewerId: { connectByUsername: { username: "testReviewer1" } }
          status: ASSIGNED
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 2000, templateElementId: 4001 }
              { id: 2001, templateElementId: 4002 }
              { id: 2002, templateElementId: 4003 }
              { id: 2003, templateElementId: 4005 }
              { id: 2004, templateElementId: 4006 }
              { id: 2006, templateElementId: 4008 }
              { id: 2007, templateElementId: 4009 }
              { id: 2008, templateElementId: 4011 }
              { id: 2009, templateElementId: 4012 }
              { id: 2010, templateElementId: 4013 }
            ]
          }
          reviewsUsingId: {
            create: {
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4000
                    reviewQuestionAssignmentId: 2000
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4001
                    reviewQuestionAssignmentId: 2001
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4002
                    reviewQuestionAssignmentId: 2002
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4003
                    reviewQuestionAssignmentId: 2003
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4004
                    reviewQuestionAssignmentId: 2004
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4005
                    reviewQuestionAssignmentId: 2006
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4006
                    reviewQuestionAssignmentId: 2007
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4007
                    reviewQuestionAssignmentId: 2008
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4008
                    reviewQuestionAssignmentId: 2009
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4009
                    reviewQuestionAssignmentId: 2010
                    status: SUBMITTED
                    decision: DECLINE
                    comment: "List lighter effects"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  {
                    status: DRAFT
                    isCurrent: false
                    timeCreated: "2021-05-19T00:00:00Z"
                  }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-05-19T10:00:00Z"
                  }
                ]
              }
              reviewDecisionsUsingId: { create: { decision: LIST_OF_QUESTIONS } }
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
        reviewer {
          username
        }
      }
    }
  }`,
  // Assign test reviews of Application 3 (serial: 34567) of Review Testing (template)
  // -- Review Lvl 1 - Stage 1 (all sections) = APPROVED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1006
          applicationId: 4002
          stageId: 4
          stageNumber: 1
          levelNumber: 1
          isLastLevel: true
          userToReviewerId: { connectByUsername: { username: "testReviewer1" } }
          status: ASSIGNED
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 3000, templateElementId: 4001 }
              { id: 3001, templateElementId: 4002 }
              { id: 3002, templateElementId: 4003 }
              { id: 3003, templateElementId: 4005 }
              { id: 3004, templateElementId: 4006 }
              { id: 3005, templateElementId: 4008 }
              { id: 3006, templateElementId: 4009 }
              { id: 3007, templateElementId: 4011 }
              { id: 3008, templateElementId: 4012 }
              { id: 3009, templateElementId: 4013 }
            ]
          }
          reviewsUsingId: {
            create: {
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4020
                    reviewQuestionAssignmentId: 3000
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4021
                    reviewQuestionAssignmentId: 3001
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4022
                    reviewQuestionAssignmentId: 3002
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4023
                    reviewQuestionAssignmentId: 3003
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4024
                    reviewQuestionAssignmentId: 3004
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4025
                    reviewQuestionAssignmentId: 3005
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4026
                    reviewQuestionAssignmentId: 3006
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4027
                    reviewQuestionAssignmentId: 3007
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4028
                    reviewQuestionAssignmentId: 3008
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4029
                    reviewQuestionAssignmentId: 3009
                    status: SUBMITTED
                    decision: APPROVE
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: false, timeCreated: "2021-02-02T00:00:00Z" }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-02-03T00:00:00Z"
                  }
                ]
              }
              reviewDecisionsUsingId: {
                create: { decision: CONFORM }
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
  // -- Reviewer 1 in Stage 2, Lvl 1 (section 1) = DECLINED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1007
          applicationId: 4002
          stageId: 5
          stageNumber: 2
          levelNumber: 1
          isLastLevel: false
          userToReviewerId: { connectByUsername: { username: "testReviewer1" } }
          status: ASSIGNED
          allowedSections: ["S1"]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 3010, templateElementId: 4001 }
              { id: 3011, templateElementId: 4002 }
              { id: 3012, templateElementId: 4003 }
              { id: 3013, templateElementId: 4005 }
              { id: 3014, templateElementId: 4006 }
            ]
          }
          reviewsUsingId: {
            create: {
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4020
                    reviewQuestionAssignmentId: 3010
                    status: SUBMITTED
                    decision: DECLINE
                    comment: "Name not conform with uploaded proof of identity"
                  }
                  {
                    applicationResponseId: 4021
                    reviewQuestionAssignmentId: 3011
                    status: SUBMITTED
                    decision: DECLINE
                    comment: "Surname not conform with uploaded proof of identity"
                  }
                  {
                    applicationResponseId: 4022
                    reviewQuestionAssignmentId: 3012
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4023
                    reviewQuestionAssignmentId: 3013
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4024
                    reviewQuestionAssignmentId: 3014
                    status: SUBMITTED
                    decision: APPROVE
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: false, timeCreated: "2021-02-03T00:00:00Z" }
                  {
                    status: SUBMITTED
                    isCurrent: false
                    timeCreated: "2021-02-04T00:00:00Z"
                  }
                  {
                    status: CHANGES_REQUESTED
                    isCurrent: true
                    timeCreated: "2021-02-04T10:00:00Z"
                  }
                ]
              }
              reviewDecisionsUsingId: {
                create: { 
                  decision: LIST_OF_QUESTIONS 
                  comment: "Suggestion by Reviewer 1 to reply to applicant with LOQ"
                }
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
  // -- Reviewer 2 in Stage 2, Lvl 1 (section 2) = DRAFT (while the other reviewer has CHANGES_REQUESTED status)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1008
          applicationId: 4002
          stageId: 5
          stageNumber: 2
          levelNumber: 1
          isLastLevel: false
          userToReviewerId: {
            connectByUsername: { username: "testReviewer2" }
          }
          status: ASSIGNED
          allowedSections: ["S2"]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 3015, templateElementId: 4008 }
              { id: 3016, templateElementId: 4009 }
              { id: 3017, templateElementId: 4011 }
              { id: 3018, templateElementId: 4012 }
              { id: 3019, templateElementId: 4013 }
            ]
          }
          reviewsUsingId: {
            create: {
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4025
                    reviewQuestionAssignmentId: 3015
                    status: DRAFT
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4026
                    reviewQuestionAssignmentId: 3016
                    status: DRAFT
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4027
                    reviewQuestionAssignmentId: 3017
                    status: DRAFT
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4028
                    reviewQuestionAssignmentId: 3018
                    status: DRAFT
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4029
                    reviewQuestionAssignmentId: 3019
                    status: DRAFT
                    decision: APPROVE
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: true, timeCreated: "2021-02-03T00:00:00Z" }
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
  // -- Consolidator 1 Lvl 2 - Stage 2 = NOT AVAILABLE (not assignable for this consolidator)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1009
          applicationId: 4002
          stageId: 5
          stageNumber: 2
          levelNumber: 2
          isLastLevel: true
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator1" }
          }
          status: SELF_ASSIGNED_BY_ANOTHER
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 3022, templateElementId: 4001 }
              { id: 3023, templateElementId: 4002 }
              { id: 3024, templateElementId: 4003 }
              { id: 3025, templateElementId: 4005 }
              { id: 3026, templateElementId: 4006 }
              { id: 3027, templateElementId: 4008 }
              { id: 3028, templateElementId: 4009 }
              { id: 3029, templateElementId: 4011 }
              { id: 3030, templateElementId: 4012 }
              { id: 3031, templateElementId: 4013 }
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
  // -- Consolidator 2 Lvl 2 - Stage 2 = CHANGES REQUESTED (DISAGREED with Reviewer 1)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1010
          applicationId: 4002
          stageId: 5
          stageNumber: 2
          levelNumber: 2
          isLastLevel: true
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator2" }
          }
          status: ASSIGNED
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 3033, templateElementId: 4001 }
              { id: 3034, templateElementId: 4002 }
              { id: 3035, templateElementId: 4003 }
              { id: 3036, templateElementId: 4005 }
              { id: 3037, templateElementId: 4006 }
            ]
          }
          reviewsUsingId: {
            create: {
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4020
                    reviewQuestionAssignmentId: 3033
                    status: SUBMITTED
                    decision: DISAGREE
                    comment: "Please check again"
                  }
                  {
                    applicationResponseId: 4021
                    reviewQuestionAssignmentId: 3034
                    status: SUBMITTED
                    decision: DISAGREE
                    comment: "Please check again"
                  }
                  {
                    applicationResponseId: 4022
                    reviewQuestionAssignmentId: 3035
                    status: SUBMITTED
                    decision: AGREE
                  }
                  {
                    applicationResponseId: 4023
                    reviewQuestionAssignmentId: 3036
                    status: SUBMITTED
                    decision: AGREE
                  }
                  {
                    applicationResponseId: 4024
                    reviewQuestionAssignmentId: 3037
                    status: SUBMITTED
                    decision: AGREE
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  {
                    status: DRAFT
                    isCurrent: false
                    timeCreated: "2021-02-04T00:00:00Z"
                  }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-02-04T10:00:00Z"
                  }
                ]
              }
              reviewDecisionsUsingId: {
                create: { 
                  decision: CHANGES_REQUESTED 
                  comment: "Reviewer 1 required to update"
                }
              }
            }
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
  // Assign test reviews of Application 4 (serial: ABC123) of Review Testing (template)
  // Reviewer 1 in Stage 1 (All sectios) = NOT STARTED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1020
          applicationId: 4003
          stageId: 4
          stageNumber: 1
          levelNumber: 1
          isLastLevel: true
          userToReviewerId: { 
            connectByUsername: { username: "testReviewer1" } 
          }
          status: ASSIGNED
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 4000, templateElementId: 4001 }
              { id: 4001, templateElementId: 4002 }
              { id: 4002, templateElementId: 4003 }
              { id: 4003, templateElementId: 4005 }
              { id: 4004, templateElementId: 4006 }
              { id: 4005, templateElementId: 4008 }
              { id: 4006, templateElementId: 4009 }
              { id: 4007, templateElementId: 4011 }
              { id: 4008, templateElementId: 4012 }
              { id: 4009, templateElementId: 4013 }
            ]
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
  // Assign test reviews of Application 5 (serial: 45678) of Review Testing (template)
  // -- Review Lvl 1 - Stage 1 (all sections) = APPROVED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1030
          applicationId: 4004
          stageId: 4
          stageNumber: 1
          levelNumber: 1
          isLastLevel: true
          userToReviewerId: { connectByUsername: { username: "testReviewer1" } }
          status: ASSIGNED
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 5000, templateElementId: 4001 }
              { id: 5001, templateElementId: 4002 }
              { id: 5002, templateElementId: 4003 }
              { id: 5003, templateElementId: 4005 }
              { id: 5004, templateElementId: 4006 }
              { id: 5005, templateElementId: 4008 }
              { id: 5006, templateElementId: 4009 }
              { id: 5007, templateElementId: 4011 }
              { id: 5008, templateElementId: 4012 }
            ]
          }
          reviewsUsingId: {
            create: {
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4150
                    reviewQuestionAssignmentId: 5000
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4151
                    reviewQuestionAssignmentId: 5001
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4152
                    reviewQuestionAssignmentId: 5002
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4153
                    reviewQuestionAssignmentId: 5003
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4154
                    reviewQuestionAssignmentId: 5004
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4155
                    reviewQuestionAssignmentId: 5005
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4156
                    reviewQuestionAssignmentId: 5006
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4157
                    reviewQuestionAssignmentId: 5007
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4158
                    reviewQuestionAssignmentId: 5008
                    status: SUBMITTED
                    decision: APPROVE
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: false, timeCreated: "2021-02-02T00:00:00Z" }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-02-03T00:00:00Z"
                  }
                ]
              }
              reviewDecisionsUsingId: {
                create: { decision: CONFORM }
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
  // -- Reviewer 1 in Stage 2, Lvl 1 (section 1) = DECLINED - Suggest LOQ
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1031
          applicationId: 4004
          stageId: 5
          stageNumber: 2
          levelNumber: 1
          isLastLevel: false
          userToReviewerId: { connectByUsername: { username: "testReviewer1" } }
          status: ASSIGNED
          allowedSections: ["S1"]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 5010, templateElementId: 4001 }
              { id: 5011, templateElementId: 4002 }
              { id: 5012, templateElementId: 4003 }
              { id: 5013, templateElementId: 4005 }
              { id: 5014, templateElementId: 4006 }
            ]
          }
          reviewsUsingId: {
            create: {
              reviewResponsesUsingId: {
                create: [
                  {
                    id: 5000
                    applicationResponseId: 4150
                    reviewQuestionAssignmentId: 5010
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    id: 5001
                    applicationResponseId: 4151
                    reviewQuestionAssignmentId: 5011
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    id: 5002
                    applicationResponseId: 4152
                    reviewQuestionAssignmentId: 5012
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    id: 5003
                    applicationResponseId: 4153
                    reviewQuestionAssignmentId: 5013
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    id: 5004
                    applicationResponseId: 4154
                    reviewQuestionAssignmentId: 5014
                    status: SUBMITTED
                    decision: DECLINE
                    comment: "Country name spelling wrong"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: false, timeCreated: "2021-02-03T00:00:00Z" }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-02-04T00:00:00Z"
                  }
                ]
              }
              reviewDecisionsUsingId: {
                create: { 
                  decision: LIST_OF_QUESTIONS 
                  comment: "Suggestion by Reviewer 1 to reply to applicant with LOQ"
                }
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
  // -- Reviewer 2 in Stage 2, Lvl 1 (section 2) = DRAFT (Partial stage 2 not submitted)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1032
          applicationId: 4004
          stageId: 5
          stageNumber: 2
          levelNumber: 1
          isLastLevel: false
          userToReviewerId: {
            connectByUsername: { username: "testReviewer2" }
          }
          status: ASSIGNED
          allowedSections: ["S2"]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 5015, templateElementId: 4008 }
              { id: 5016, templateElementId: 4009 }
              { id: 5017, templateElementId: 4011 }
              { id: 5018, templateElementId: 4012 }
            ]
          }
          reviewsUsingId: {
            create: {
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4155
                    reviewQuestionAssignmentId: 5015
                    status: DRAFT
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4156
                    reviewQuestionAssignmentId: 5016
                    status: DRAFT
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4157
                    reviewQuestionAssignmentId: 5017
                    status: DRAFT
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4158
                    reviewQuestionAssignmentId: 5018
                    status: DRAFT
                    decision: APPROVE
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: true, timeCreated: "2021-02-03T00:00:00Z" }
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
  // -- Consolidator 1 Lvl 2 - Stage 2 = NOT AVAILABLE (not assignable for this consolidator)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1033
          applicationId: 4004
          stageId: 5
          stageNumber: 2
          levelNumber: 2
          isLastLevel: true
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator1" }
          }
          status: SELF_ASSIGNED_BY_ANOTHER
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 5022, templateElementId: 4001 }
              { id: 5023, templateElementId: 4002 }
              { id: 5024, templateElementId: 4003 }
              { id: 5025, templateElementId: 4005 }
              { id: 5026, templateElementId: 4006 }
              { id: 5027, templateElementId: 4008 }
              { id: 5028, templateElementId: 4009 }
              { id: 5029, templateElementId: 4011 }
              { id: 5030, templateElementId: 4012 }
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
  // -- Consolidator 2 Lvl 2 - Stage 2 = DRAFT (AGREE with Reviewer 1)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1034
          applicationId: 4004
          stageId: 5
          stageNumber: 2
          levelNumber: 2
          isLastLevel: true
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator2" }
          }
          status: ASSIGNED
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 5033, templateElementId: 4001 }
              { id: 5034, templateElementId: 4002 }
              { id: 5035, templateElementId: 4003 }
              { id: 5036, templateElementId: 4005 }
              { id: 5037, templateElementId: 4006 }
            ]
          }
          reviewsUsingId: {
            create: {
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4150
                    reviewQuestionAssignmentId: 5033
                    reviewResponseLinkId: 5000
                    status: SUBMITTED
                    decision: AGREE
                  }
                  {
                    applicationResponseId: 4151
                    reviewQuestionAssignmentId: 5034
                    reviewResponseLinkId: 5001
                    status: SUBMITTED
                    decision: AGREE
                  }
                  {
                    applicationResponseId: 4152
                    reviewQuestionAssignmentId: 5035
                    reviewResponseLinkId: 5002
                    status: SUBMITTED
                    decision: AGREE
                  }
                  {
                    applicationResponseId: 4153
                    reviewQuestionAssignmentId: 5036
                    reviewResponseLinkId: 5003
                    status: SUBMITTED
                    decision: AGREE
                  }
                  {
                    applicationResponseId: 4154
                    reviewQuestionAssignmentId: 5037
                    reviewResponseLinkId: 5004
                    status: SUBMITTED
                    decision: AGREE
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  {
                    status: DRAFT
                    isCurrent: true
                    timeCreated: "2021-02-04T00:00:00Z"
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
      reviewAssignment {
        application {
          name
        }
      }
    }
  }`,
]
