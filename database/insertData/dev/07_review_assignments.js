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
              id: 5000
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4000
                    reviewQuestionAssignmentId: 1000
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-01-31T00:00:00Z"
                    timeUpdated: "2021-01-31T00:00:01Z"
                    timeSubmitted: "2021-02-01T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4001
                    reviewQuestionAssignmentId: 1001
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-01-31T00:00:00Z"
                    timeUpdated: "2021-01-31T00:00:02Z"
                    timeSubmitted: "2021-02-01T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4002
                    reviewQuestionAssignmentId: 1002
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-01-31T00:00:00Z"
                    timeUpdated: "2021-01-31T00:00:03Z"
                    timeSubmitted: "2021-02-01T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4003
                    reviewQuestionAssignmentId: 1003
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-01-31T00:00:00Z"
                    timeUpdated: "2021-01-31T00:00:04Z"
                    timeSubmitted: "2021-02-01T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4004
                    reviewQuestionAssignmentId: 1004
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-01-31T00:00:00Z"
                    timeUpdated: "2021-01-31T00:00:05Z"
                    timeSubmitted: "2021-02-01T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4005
                    reviewQuestionAssignmentId: 1006
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-01-31T00:00:00Z"
                    timeUpdated: "2021-01-31T00:00:06Z"
                    timeSubmitted: "2021-02-01T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4006
                    reviewQuestionAssignmentId: 1007
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-01-31T00:00:00Z"
                    timeUpdated: "2021-01-31T00:00:07Z"
                    timeSubmitted: "2021-02-01T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4007
                    reviewQuestionAssignmentId: 1008
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-01-31T00:00:00Z"
                    timeUpdated: "2021-01-31T00:00:08Z"
                    timeSubmitted: "2021-02-01T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4008
                    reviewQuestionAssignmentId: 1009
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-01-31T00:00:00Z"
                    timeUpdated: "2021-01-31T00:00:09Z"
                    timeSubmitted: "2021-02-01T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4009
                    reviewQuestionAssignmentId: 1010
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-01-31T00:00:00Z"
                    timeUpdated: "2021-01-31T00:00:10Z"
                    timeSubmitted: "2021-02-01T00:00:00Z"
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
          stageId: 6
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
              id: 5001
              reviewResponsesUsingId: {
                create: [
                  {
                    id: 3000
                    applicationResponseId: 4000
                    reviewQuestionAssignmentId: 1011
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-02-01T00:00:00Z"
                    timeUpdated: "2021-02-01T00:00:01Z"
                    timeSubmitted: "2021-02-01T00:10:00Z"
                  }
                  {
                    id: 3001
                    applicationResponseId: 4001
                    reviewQuestionAssignmentId: 1012
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-02-01T00:00:00Z"
                    timeUpdated: "2021-02-01T00:00:02Z"
                    timeSubmitted: "2021-02-01T00:10:00Z"
                  }
                  {
                    id: 3002
                    applicationResponseId: 4002
                    reviewQuestionAssignmentId: 1013
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-02-01T00:00:00Z"
                    timeUpdated: "2021-02-01T00:00:03Z"
                    timeSubmitted: "2021-02-01T00:10:00Z"
                  }
                  {
                    id: 3003
                    applicationResponseId: 4003
                    reviewQuestionAssignmentId: 1014
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-02-01T00:00:00Z"
                    timeUpdated: "2021-02-01T00:00:04Z"
                    timeSubmitted: "2021-02-01T00:10:00Z"
                  }
                  {
                    id: 3004
                    applicationResponseId: 4004
                    reviewQuestionAssignmentId: 1015
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-02-01T00:00:00Z"
                    timeUpdated: "2021-02-01T00:00:05Z"
                    timeSubmitted: "2021-02-01T00:10:00Z"
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
                    timeCreated: "2021-02-02T00:10:00Z"
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
          stageId: 6
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
              id: 5003
              reviewResponsesUsingId: {
                create: [
                  {
                    id: 3005
                    applicationResponseId: 4005
                    reviewQuestionAssignmentId: 1017
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-02-02T00:10:00Z"
                    timeUpdated: "2021-02-02T00:10:01Z"
                    timeSubmitted: "2021-02-02T01:10:00Z"
                  }
                  {
                    id: 3006
                    applicationResponseId: 4006
                    reviewQuestionAssignmentId: 1018
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-02-02T00:10:00Z"
                    timeUpdated: "2021-02-02T00:10:02Z"
                    timeSubmitted: "2021-02-02T01:10:00Z"
                  }
                  {
                    id: 3007
                    applicationResponseId: 4007
                    reviewQuestionAssignmentId: 1019
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-02-02T00:10:00Z"
                    timeUpdated: "2021-02-02T00:10:03Z"
                    timeSubmitted: "2021-02-02T01:10:00Z"
                  }
                  {
                    id: 3008
                    applicationResponseId: 4008
                    reviewQuestionAssignmentId: 1020
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-02-02T00:00:00Z"
                    timeUpdated: "2021-02-02T00:10:04Z"
                    timeSubmitted: "2021-02-02T01:10:00Z"
                  }
                  {
                    id: 3009
                    applicationResponseId: 4009
                    reviewQuestionAssignmentId: 1021
                    status: SUBMITTED
                    decision: DECLINE
                    stageNumber: 2
                    comment: "Not descriptive side effects"
                    timeCreated: "2021-02-02T00:10:00Z"
                    timeUpdated: "2021-02-02T00:10:05Z"
                    timeSubmitted: "2021-02-02T01:10:00Z"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  {
                    status: DRAFT
                    isCurrent: false
                    timeCreated: "2021-02-02T00:10:00Z"
                  }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-02-02T01:10:00Z"
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
          stageId: 6
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
              id: 5004
              reviewResponsesUsingId: {
                create: [
                  {
                    id: 5039
                    applicationResponseId: 4000
                    reviewQuestionAssignmentId: 1022
                    reviewResponseLinkId: 3000
                    status: DRAFT
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:10:00Z"
                    timeUpdated: "2021-05-19T00:10:00Z"
                  }
                  {
                    id: 5038
                    applicationResponseId: 4001
                    reviewQuestionAssignmentId: 1023
                    reviewResponseLinkId: 3001
                    status: DRAFT
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:10:00Z"
                    timeUpdated: "2021-05-19T00:10:01Z"
                  }
                  {
                    id: 5037
                    applicationResponseId: 4002
                    reviewQuestionAssignmentId: 1024
                    reviewResponseLinkId: 3002
                    status: DRAFT
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:10:00Z"
                    timeUpdated: "2021-05-19T00:10:02Z"
                  }
                  {
                    id: 5036
                    applicationResponseId: 4003
                    reviewQuestionAssignmentId: 1025
                    reviewResponseLinkId: 3003
                    status: DRAFT
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:10:00Z"
                    timeUpdated: "2021-05-19T00:10:03Z"
                  }
                  {
                    id: 5035
                    applicationResponseId: 4004
                    reviewQuestionAssignmentId: 1026
                    reviewResponseLinkId: 3004
                    status: DRAFT
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:10:00Z"
                    timeUpdated: "2021-05-19T00:10:04Z"
                  }
                  {
                    id: 5034
                    applicationResponseId: 4005
                    reviewQuestionAssignmentId: 1027
                    reviewResponseLinkId: 3005
                    status: DRAFT
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:10:00Z"
                    timeUpdated: "2021-05-19T00:10:05Z"
                  }
                  {
                    id: 5033
                    applicationResponseId: 4006
                    reviewQuestionAssignmentId: 1028
                    reviewResponseLinkId: 3006
                    status: DRAFT
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:10:00Z"
                    timeUpdated: "2021-05-19T00:10:06Z"
                  }
                  {
                    id: 5032
                    applicationResponseId: 4007
                    reviewQuestionAssignmentId: 1029
                    reviewResponseLinkId: 3007
                    status: DRAFT
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:10:00Z"
                    timeUpdated: "2021-05-19T00:10:07Z"
                  }
                  {
                    id: 5031
                    applicationResponseId: 4008
                    reviewQuestionAssignmentId: 1030
                    reviewResponseLinkId: 3008
                    status: DRAFT
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:10:00Z"
                    timeUpdated: "2021-05-19T00:10:08Z"
                  }
                  {
                    id: 5030
                    applicationResponseId: 4009
                    reviewQuestionAssignmentId: 1031
                    reviewResponseLinkId: 3009
                    status: DRAFT
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:10:00Z"
                    timeUpdated: "2021-05-19T00:10:09Z"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: true, timeCreated: "2021-05-19T00:10:00Z" }
                ]
              }
              reviewDecisionsUsingId: {
                create: [{ decision: NO_DECISION }]
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
          stageId: 6
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
          stageId: 5
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
              id: 6001
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4010
                    reviewQuestionAssignmentId: 2000
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:01Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4011
                    reviewQuestionAssignmentId: 2001
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:02Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4012
                    reviewQuestionAssignmentId: 2002
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:03Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4013
                    reviewQuestionAssignmentId: 2003
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:04Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4014
                    reviewQuestionAssignmentId: 2004
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:05Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4015
                    reviewQuestionAssignmentId: 2006
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:06Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4016
                    reviewQuestionAssignmentId: 2007
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:07Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4017
                    reviewQuestionAssignmentId: 2008
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:08Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4018
                    reviewQuestionAssignmentId: 2009
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:09Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4019
                    reviewQuestionAssignmentId: 2010
                    status: SUBMITTED
                    decision: DECLINE
                    stageNumber: 1
                    isVisibleToApplicant: true
                    comment: "List lighter effects"
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:10Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
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
          stageId: 5
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
              id: 6002
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4020
                    reviewQuestionAssignmentId: 3000
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:01Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4021
                    reviewQuestionAssignmentId: 3001
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:02Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4022
                    reviewQuestionAssignmentId: 3002
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:03Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4023
                    reviewQuestionAssignmentId: 3003
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:04Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4024
                    reviewQuestionAssignmentId: 3004
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:05Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4025
                    reviewQuestionAssignmentId: 3005
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:06Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4026
                    reviewQuestionAssignmentId: 3006
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:07Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4027
                    reviewQuestionAssignmentId: 3007
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:08Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4028
                    reviewQuestionAssignmentId: 3008
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:09Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4029
                    reviewQuestionAssignmentId: 3009
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T05:00:10Z"
                    timeSubmitted: "2021-05-19T10:00:00Z"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: false, timeCreated: "2021-05-19T00:00:00Z" }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-05-19T10:00:00Z"
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
          stageId: 6
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
              id: 6003
              reviewResponsesUsingId: {
                create: [
                  {
                    id: 4000
                    applicationResponseId: 4020
                    reviewQuestionAssignmentId: 3010
                    status: SUBMITTED
                    decision: DECLINE
                    comment: "Name not conform with uploaded proof of identity"
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T15:00:01Z"
                    timeSubmitted: "2021-05-19T15:00:00Z"
                  }
                  {
                    id: 4001
                    applicationResponseId: 4021
                    reviewQuestionAssignmentId: 3011
                    status: SUBMITTED
                    decision: DECLINE
                    comment: "Surname not conform with uploaded proof of identity"
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T15:00:02Z"
                    timeSubmitted: "2021-05-19T15:00:00Z"
                  }
                  {
                    id: 4002
                    applicationResponseId: 4022
                    reviewQuestionAssignmentId: 3012
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T15:00:03Z"
                    timeSubmitted: "2021-05-19T15:00:00Z"
                  }
                  {
                    id: 4003
                    applicationResponseId: 4023
                    reviewQuestionAssignmentId: 3013
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T15:00:04Z"
                    timeSubmitted: "2021-05-19T15:00:00Z"
                  }
                  {
                    id: 4004
                    applicationResponseId: 4024
                    reviewQuestionAssignmentId: 3014
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-05-19T00:00:00Z"
                    timeUpdated: "2021-05-19T15:00:05Z"
                    timeSubmitted: "2021-05-19T15:00:00Z"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: false, timeCreated: "2021-05-19T10:00:00Z" }
                  {
                    status: SUBMITTED
                    isCurrent: false
                    timeCreated: "2021-05-19T15:00:00Z"
                  }
                  {
                    status: CHANGES_REQUESTED
                    isCurrent: true
                    timeCreated: "2021-05-20T10:00:00Z"
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
  // -- Reviewer 2 in Stage 2, Lvl 1 (section 2) = ASSIGNED (Partial stage 2 not started)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1008
          applicationId: 4002
          stageId: 6
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
          stageId: 6
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
              id: 6005
              reviewResponsesUsingId: {
                create: [
                  {
                    id: 5029
                    applicationResponseId: 4020
                    reviewQuestionAssignmentId: 3033
                    reviewResponseLinkId: 4000
                    status: SUBMITTED
                    decision: DISAGREE
                    comment: "Please check again"
                    stageNumber: 2
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:01Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    id: 5028
                    applicationResponseId: 4021
                    reviewQuestionAssignmentId: 3034
                    reviewResponseLinkId: 4001
                    status: SUBMITTED
                    decision: DISAGREE
                    comment: "Please check again"
                    stageNumber: 2
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:02Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    id: 5027
                    applicationResponseId: 4022
                    reviewQuestionAssignmentId: 3035
                    reviewResponseLinkId: 4002
                    status: SUBMITTED
                    decision: AGREE
                    stageNumber: 2
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:03Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    id: 5026
                    applicationResponseId: 4023
                    reviewQuestionAssignmentId: 3036
                    reviewResponseLinkId: 4003
                    status: SUBMITTED
                    decision: AGREE
                    stageNumber: 2
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:04Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    id: 5025
                    applicationResponseId: 4024
                    reviewQuestionAssignmentId: 3037
                    reviewResponseLinkId: 4004
                    status: SUBMITTED
                    decision: AGREE
                    stageNumber: 2
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:05Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  {
                    status: DRAFT
                    isCurrent: false
                    timeCreated: "2021-06-10T00:00:00Z"
                  }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-06-10T10:00:00Z"
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
  // Assign test reviews of Application 4 (serial: 45678) of Review Testing (template)
  // -- Review Lvl 1 - Stage 1 (all sections) = APPROVED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1030
          applicationId: 4003
          stageId: 5
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
              id: 7001
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4150
                    reviewQuestionAssignmentId: 5000
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:01Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4151
                    reviewQuestionAssignmentId: 5001
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:02Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4152
                    reviewQuestionAssignmentId: 5002
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:02Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4153
                    reviewQuestionAssignmentId: 5003
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:03Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4154
                    reviewQuestionAssignmentId: 5004
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:04Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4155
                    reviewQuestionAssignmentId: 5005
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:05Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4156
                    reviewQuestionAssignmentId: 5006
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:06Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4157
                    reviewQuestionAssignmentId: 5007
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:07Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4158
                    reviewQuestionAssignmentId: 5008
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:08Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { 
                    status: DRAFT
                    isCurrent: false
                    timeCreated: "2021-06-10T00:00:00Z"
                  }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-06-10T10:00:00Z"
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
  // -- Reviewer 1 in Stage 2, Lvl 1 (section 1) = DECLINED - In progress
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1031
          applicationId: 4003
          stageId: 6
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
              id: 7002
              reviewResponsesUsingId: {
                create: [
                  {
                    id: 5000
                    applicationResponseId: 4150
                    reviewQuestionAssignmentId: 5010
                    status: DRAFT
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:01Z"
                  }
                  {
                    id: 5001
                    applicationResponseId: 4151
                    reviewQuestionAssignmentId: 5011
                    status: DRAFT
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:02Z"
                  }
                  {
                    id: 5002
                    applicationResponseId: 4152
                    reviewQuestionAssignmentId: 5012
                    status: DRAFT
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:03Z"
                  }
                  {
                    id: 5003
                    applicationResponseId: 4153
                    reviewQuestionAssignmentId: 5013
                    status: DRAFT
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:04Z"
                  }
                  {
                    id: 5004
                    applicationResponseId: 4154
                    reviewQuestionAssignmentId: 5014
                    status: DRAFT
                    decision: DECLINE
                    comment: "Country name spelling wrong"
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:05Z"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { 
                    status: DRAFT
                    isCurrent: true
                    timeCreated: "2021-07-10T00:00:00Z"
                  }
                ]
              }
              reviewDecisionsUsingId: {
                create: { decision: NO_DECISION }
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
  // -- Reviewer 2 in Stage 2, Lvl 1 (section 2) = ASSIGNED (Partial stage 2 not started)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1032
          applicationId: 4003
          stageId: 6
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
  // Assign test reviews of Application 5 (serial: ABC123) of Review Testing (template)
  // -- Review Lvl 1 - Stage 1 (all sections) = APPROVED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1040
          applicationId: 4004
          stageId: 5
          stageNumber: 1
          levelNumber: 1
          isLastLevel: true
          userToReviewerId: { connectByUsername: { username: "testReviewer1" } }
          status: ASSIGNED
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 6000, templateElementId: 4001 }
              { id: 6001, templateElementId: 4002 }
              { id: 6002, templateElementId: 4003 }
              { id: 6003, templateElementId: 4005 }
              { id: 6004, templateElementId: 4006 }
              { id: 6005, templateElementId: 4008 }
              { id: 6006, templateElementId: 4009 }
              { id: 6007, templateElementId: 4011 }
              { id: 6008, templateElementId: 4012 }
            ]
          }
          reviewsUsingId: {
            create: {
              id: 7007
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4150
                    reviewQuestionAssignmentId: 5000
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:01Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4151
                    reviewQuestionAssignmentId: 5001
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:02Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4152
                    reviewQuestionAssignmentId: 5002
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:02Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4153
                    reviewQuestionAssignmentId: 5003
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:03Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4154
                    reviewQuestionAssignmentId: 5004
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:04Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4155
                    reviewQuestionAssignmentId: 5005
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:05Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4156
                    reviewQuestionAssignmentId: 5006
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:06Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4157
                    reviewQuestionAssignmentId: 5007
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:07Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4158
                    reviewQuestionAssignmentId: 5008
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 1
                    timeCreated: "2021-06-10T00:00:00Z"
                    timeUpdated: "2021-06-10T10:00:08Z"
                    timeSubmitted: "2021-06-10T10:00:00Z"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: false, timeCreated: "2021-06-10T00:00:00Z" }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-06-10T10:00:00Z"
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
  // -- Reviewer 1 in Stage 2, Lvl 1 (section 1) = APPROVED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1041
          applicationId: 4004
          stageId: 6
          stageNumber: 2
          levelNumber: 1
          isLastLevel: false
          userToReviewerId: { connectByUsername: { username: "testReviewer1" } }
          status: ASSIGNED
          allowedSections: ["S1"]
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 6010, templateElementId: 4001 }
              { id: 6011, templateElementId: 4002 }
              { id: 6012, templateElementId: 4003 }
              { id: 6013, templateElementId: 4005 }
              { id: 6014, templateElementId: 4006 }
            ]
          }
          reviewsUsingId: {
            create: {
              id: 7009
              reviewResponsesUsingId: {
                create: [
                  {
                    id: 6000
                    applicationResponseId: 4150
                    reviewQuestionAssignmentId: 6010
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:01Z"
                    timeSubmitted: "2021-07-10T10:00:00Z"
                  }
                  {
                    id: 6001
                    applicationResponseId: 4151
                    reviewQuestionAssignmentId: 6011
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:02Z"
                    timeSubmitted: "2021-07-10T10:00:00Z"
                  }
                  {
                    id: 6002
                    applicationResponseId: 4152
                    reviewQuestionAssignmentId: 6012
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:03Z"
                    timeSubmitted: "2021-07-10T10:00:00Z"
                  }
                  {
                    id: 6003
                    applicationResponseId: 4153
                    reviewQuestionAssignmentId: 6013
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:04Z"
                    timeSubmitted: "2021-07-10T10:00:00Z"
                  }
                  {
                    id: 6004
                    applicationResponseId: 4154
                    reviewQuestionAssignmentId: 6014
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:05Z"
                    timeSubmitted: "2021-07-10T10:00:00Z"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { status: DRAFT, isCurrent: false, timeCreated: "2021-07-10T00:00:00Z" }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-07-10T10:00:00Z"
                  }
                ]
              }
              reviewDecisionsUsingId: {
                create: { 
                  decision: CONFORM 
                  comment: "Suggestion by Reviewer 1 to move to Final Decision"
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
  // -- Reviewer 2 in Stage 2, Lvl 1 (section 2) = APPROVED
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1042
          applicationId: 4004
          stageId: 6
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
              { id: 6015, templateElementId: 4008 }
              { id: 6016, templateElementId: 4009 }
              { id: 6017, templateElementId: 4011 }
              { id: 6018, templateElementId: 4012 }
            ]
          }
          reviewsUsingId: {
            create: {
              id: 7010
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4155
                    reviewQuestionAssignmentId: 6015
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:05Z"
                    timeSubmitted: "2021-07-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4156
                    reviewQuestionAssignmentId: 6016
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:06Z"
                    timeSubmitted: "2021-07-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4157
                    reviewQuestionAssignmentId: 6017
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:07Z"
                    timeSubmitted: "2021-07-10T10:00:00Z"
                  }
                  {
                    applicationResponseId: 4158
                    reviewQuestionAssignmentId: 6018
                    status: SUBMITTED
                    decision: APPROVE
                    stageNumber: 2
                    timeCreated: "2021-07-10T00:00:00Z"
                    timeUpdated: "2021-07-10T10:00:08Z"
                    timeSubmitted: "2021-07-10T10:00:00Z"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  { 
                    status: DRAFT
                    isCurrent: false
                    timeCreated: "2021-07-10T00:00:00Z" 
                  }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-07-10T10:00:00Z"
                  }
                ]
              }
              reviewDecisionsUsingId: {
                create: { 
                  decision: CONFORM 
                  comment: "Suggestion by Reviewer 2 to move to Final Decision"
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
  // -- Consolidator 1 Lvl 2 - Stage 2 = NOT AVAILABLE (not assignable for this consolidator)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1043
          applicationId: 4004
          stageId: 6
          stageNumber: 2
          levelNumber: 2
          isLastLevel: true
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator1" }
          }
          status: SELF_ASSIGNED_BY_ANOTHER
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 6022, templateElementId: 4001 }
              { id: 6023, templateElementId: 4002 }
              { id: 6024, templateElementId: 4003 }
              { id: 6025, templateElementId: 4005 }
              { id: 6026, templateElementId: 4006 }
              { id: 6027, templateElementId: 4008 }
              { id: 6028, templateElementId: 4009 }
              { id: 6029, templateElementId: 4011 }
              { id: 6030, templateElementId: 4012 }
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
  // -- Consolidator 2 Lvl 2 - Stage 2 = CONFORM
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1044
          applicationId: 4004
          stageId: 6
          stageNumber: 2
          levelNumber: 2
          isLastLevel: true
          userToReviewerId: {
            connectByUsername: { username: "testConsolidator2" }
          }
          status: ASSIGNED
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 6033, templateElementId: 4001 }
              { id: 6034, templateElementId: 4002 }
              { id: 6035, templateElementId: 4003 }
              { id: 6036, templateElementId: 4005 }
              { id: 6037, templateElementId: 4006 }
              { id: 6038, templateElementId: 4008 }
              { id: 6039, templateElementId: 4009 }
              { id: 6040, templateElementId: 4011 }
              { id: 6041, templateElementId: 4012 }
            ]
          }
          reviewsUsingId: {
            create: {
              id: 7011
              reviewResponsesUsingId: {
                create: [
                  {
                    applicationResponseId: 4150
                    reviewQuestionAssignmentId: 6033
                    reviewResponseLinkId: 6000
                    status: SUBMITTED
                    decision: AGREE
                    stageNumber: 2
                    timeCreated: "2021-07-20T00:00:00Z"
                    timeUpdated: "2021-07-20T10:00:01Z"
                    timeSubmitted: "2021-07-21T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4151
                    reviewQuestionAssignmentId: 6034
                    reviewResponseLinkId: 6001
                    status: SUBMITTED
                    decision: AGREE
                    stageNumber: 2
                    timeCreated: "2021-07-20T00:00:00Z"
                    timeUpdated: "2021-07-20T10:00:02Z"
                    timeSubmitted: "2021-07-21T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4152
                    reviewQuestionAssignmentId: 6035
                    reviewResponseLinkId: 6002
                    status: SUBMITTED
                    decision: AGREE
                    stageNumber: 2
                    timeCreated: "2021-07-20T00:00:00Z"
                    timeUpdated: "2021-07-20T10:00:03Z"
                    timeSubmitted: "2021-07-21T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4153
                    reviewQuestionAssignmentId: 6036
                    reviewResponseLinkId: 6003
                    status: SUBMITTED
                    decision: AGREE
                    stageNumber: 2
                    timeCreated: "2021-07-20T00:00:00Z"
                    timeUpdated: "2021-07-20T10:00:04Z"
                    timeSubmitted: "2021-07-21T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4154
                    reviewQuestionAssignmentId: 6037
                    reviewResponseLinkId: 6004
                    status: SUBMITTED
                    decision: AGREE
                    stageNumber: 2
                    timeCreated: "2021-07-20T00:00:00Z"
                    timeUpdated: "2021-07-20T10:00:05Z"
                    timeSubmitted: "2021-07-21T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4155
                    reviewQuestionAssignmentId: 6038
                    status: SUBMITTED
                    decision: AGREE
                    stageNumber: 2
                    timeCreated: "2021-07-20T00:00:00Z"
                    timeUpdated: "2021-07-20T10:00:05Z"
                    timeSubmitted: "2021-07-21T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4156
                    reviewQuestionAssignmentId: 6039
                    status: SUBMITTED
                    decision: AGREE
                    stageNumber: 2
                    timeCreated: "2021-07-20T00:00:00Z"
                    timeUpdated: "2021-07-20T10:00:06Z"
                    timeSubmitted: "2021-07-21T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4157
                    reviewQuestionAssignmentId: 6040
                    status: SUBMITTED
                    decision: AGREE
                    stageNumber: 2
                    timeCreated: "2021-07-20T00:00:00Z"
                    timeUpdated: "2021-07-20T10:00:07Z"
                    timeSubmitted: "2021-07-21T00:00:00Z"
                  }
                  {
                    applicationResponseId: 4158
                    reviewQuestionAssignmentId: 6041
                    status: SUBMITTED
                    decision: AGREE
                    stageNumber: 2
                    timeCreated: "2021-07-20T00:00:00Z"
                    timeUpdated: "2021-07-20T10:00:08Z"
                    timeSubmitted: "2021-07-21T00:00:00Z"
                  }
                ]
              }
              reviewStatusHistoriesUsingId: {
                create: [
                  {
                    status: DRAFT
                    isCurrent: false
                    timeCreated: "2021-07-20T00:00:00Z"
                  }
                  {
                    status: SUBMITTED
                    isCurrent: true
                    timeCreated: "2021-07-21T00:00:00Z"
                  }
                ]
              }
              reviewDecisionsUsingId: {
                create: { 
                  decision: CONFORM
                  comment: "In agreement with Reviewers level 1 - move to Final decision"
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
  // Assign test reviews of Application 6 (serial: ABC456) of Review Testing (template)
  // Reviewer 1 in Stage 1 (All sectios) = ASSIGNED (Not started)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          id: 1050
          applicationId: 4005
          stageId: 5
          stageNumber: 1
          levelNumber: 1
          isLastLevel: true
          userToReviewerId: { 
            connectByUsername: { username: "testReviewer1" } 
          }
          status: ASSIGNED
          reviewQuestionAssignmentsUsingId: {
            create: [
              { id: 7000, templateElementId: 4001 }
              { id: 7001, templateElementId: 4002 }
              { id: 7002, templateElementId: 4003 }
              { id: 7003, templateElementId: 4005 }
              { id: 7004, templateElementId: 4006 }
              { id: 7005, templateElementId: 4008 }
              { id: 7006, templateElementId: 4009 }
              { id: 7007, templateElementId: 4011 }
              { id: 7008, templateElementId: 4012 }
              { id: 7009, templateElementId: 4013 }
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
