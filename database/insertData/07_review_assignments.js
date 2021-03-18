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
          stageId: 5
          stageNumber: 1
          level: 1
          isLastLevel: true
          userToReviewerId: { 
            connectByUsername: { username: "testReviewer1" } 
          }
          status: ASSIGNED
          templateSectionRestrictions: ["S1", "S2"]
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
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: false, timeCreated: "2021-01-31T00:00:00Z" }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-02-01T00:00:00Z"
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
  // -- Reviewer 1 in Stage 2 (section 1) = APPROVED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1001
          applicationId: 4000
          stageId: 6
          stageNumber: 2
          level: 1
          isLastLevel: false
          userToReviewerId: { 
            connectByUsername: { username: "testReviewer1" } 
          }
          status: ASSIGNED
          templateSectionRestrictions: ["S1"]
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
                  { status: DRAFT, isCurrent: false, timeCreated: "2021-02-01T00:00:00Z" }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-02-02T10:00:00Z"
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
  // -- Reviewer 2 in Stage 2 (section 2) = DECLINED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1002
          applicationId: 4000
          stageId: 6
          stageNumber: 2
          level: 1
          isLastLevel: false
          userToReviewerId: {
            connectByUsername: { username: "testReviewer2" }
          }
          status: ASSIGNED
          templateSectionRestrictions: ["S2"]
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
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: false, timeCreated: "2021-02-01T00:00:00Z" }
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
  // -- Consolidator 1 Lvl 2 - Stage 2 = NOT STARTED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1003
          applicationId: 4000
          stageId: 6
          stageNumber: 2
          level: 2
          isLastLevel: true
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator1" }
          }
          status: AVAILABLE_FOR_SELF_ASSIGNMENT
          templateSectionRestrictions: ["S1", "S2"]
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
  // -- Consolidator 2 Lvl 2 - Stage 2 = NOT STARTED (There are 2 possible consolidators...)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1004
          applicationId: 4000
          stageId: 6
          stageNumber: 2
          level: 2
          isLastLevel: true
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator2" }
          }
          status: AVAILABLE_FOR_SELF_ASSIGNMENT
          templateSectionRestrictions: ["S1", "S2"]
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
  // -- Review Lvl 1 - Stage 1 (all sections) = NOT STARTED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1005
          applicationId: 4001
          stageId: 5
          stageNumber: 1
          level: 1
          isLastLevel: true
          userToReviewerId: { connectByUsername: { username: "testReviewer1" } }
          status: ASSIGNED
          templateSectionRestrictions: ["S1", "S2"]
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
          stageId: 5
          stageNumber: 1
          level: 1
          isLastLevel: true
          userToReviewerId: { connectByUsername: { username: "testReviewer1" } }
          status: ASSIGNED
          templateSectionRestrictions: ["S1", "S2"]
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
  // -- Reviewer 1 in Stage 2 (section 1) = DECLINED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1007
          applicationId: 4002
          stageId: 6
          stageNumber: 2
          level: 1
          isLastLevel: false
          userToReviewerId: { connectByUsername: { username: "testReviewer1" } }
          status: ASSIGNED
          templateSectionRestrictions: ["S1"]
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
  // -- Reviewer 2 in Stage 2 (section 2) = NOT AVAILABLE (locked for this reviewer to submit)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1008
          applicationId: 4002
          stageId: 6
          stageNumber: 2
          level: 1
          isLastLevel: false
          userToReviewerId: {
            connectByUsername: { username: "testReviewer2" }
          }
          status: ASSIGNED
          templateSectionRestrictions: ["S2"]
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
                  { status: DRAFT, isCurrent: false, timeCreated: "2021-02-03T00:00:00Z" }
                  {
                    status: LOCKED
                    isCurrent: true
                    timeCreated: "2021-02-04T10:00:00Z"
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
  // -- Consolidator 1 Lvl 2 - Stage 2 = NOT AVAILABLE (not assignable for this consolidator)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1009
          applicationId: 4002
          stageId: 6
          stageNumber: 2
          level: 2
          isLastLevel: true
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator1" }
          }
          status: SELF_ASSIGNED_BY_ANOTHER
          templateSectionRestrictions: ["S1", "S2"]
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
          stageId: 6
          stageNumber: 2
          level: 2
          isLastLevel: true
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator2" }
          }
          status: ASSIGNED
          templateSectionRestrictions: ["S1", "S2"]
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
                    decision: DECLINE
                    comment: "Please check again"
                  }
                  {
                    applicationResponseId: 4021
                    reviewQuestionAssignmentId: 3034
                    status: SUBMITTED
                    decision: DECLINE
                    comment: "Please check again"
                  }
                  {
                    applicationResponseId: 4022
                    reviewQuestionAssignmentId: 3035
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4023
                    reviewQuestionAssignmentId: 3036
                    status: SUBMITTED
                    decision: APPROVE
                  }
                  {
                    applicationResponseId: 4024
                    reviewQuestionAssignmentId: 3037
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
                  decision: NON_CONFORM 
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
  // Reviewer 2 in Stage 1 (section 1) = NOT STARTED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1020
          applicationId: 4003
          stageId: 5
          stageNumber: 1
          level: 1
          isLastLevel: true
          userToReviewerId: { 
            connectByUsername: { username: "testReviewer1" } 
          }
          status: ASSIGNED
          templateSectionRestrictions: ["S1", "S2"]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { templateElementId: 4001 }
              { templateElementId: 4002 }
              { templateElementId: 4003 }
              { templateElementId: 4005 }
              { templateElementId: 4006 }
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
  // Reviewer 2 in Stage 1 (section 2) = NOT STARTED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1021
          applicationId: 4003
          stageId: 5
          stageNumber: 1
          level: 1
          isLastLevel: true
          userToReviewerId: { 
            connectByUsername: { username: "testReviewer2" } 
          }
          status: ASSIGNED
          templateSectionRestrictions: ["S1", "S2"]
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
]
