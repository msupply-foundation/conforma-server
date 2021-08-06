/*
GraphQL Fragment - CORE ACTIONS
  - common Actions for all templates
*/
exports.coreActions = `
    # ON_APPLICATION_CREATE
    # change status to DRAFT
    # generate serial
    # generate initial name
    {
        actionCode: "generateTextString"
        sequence: 1
        trigger: ON_APPLICATION_CREATE
        parameterQueries: {
          pattern: "S-[A-Z]{3}-<+dddd>"
          counterName: {
            operator: "objectProperties"
            children: [ "applicationData.templateCode" ]
          }
          # counterInit: 100
          updateRecord: true
          tableName: "application"
          fieldName: "serial"
        }
    }
    {
        actionCode: "generateTextString"
        sequence: 2
        trigger: ON_APPLICATION_CREATE
        parameterQueries: {
          pattern: "<?templateName> - <?serial>"
          customFields: {
            templateName: "applicationData.templateName"
            serial: "applicationData.applicationSerial"
          }
          updateRecord: true
          tableName: "application"
          fieldName: "name"
        }
    }
    {
        actionCode: "incrementStage"
        sequence: 3
        trigger: ON_APPLICATION_CREATE
    }
    # ON_APPLICATION_RESTART
    # change status to DRAFT
    {
      actionCode: "changeStatus"
      trigger: ON_APPLICATION_RESTART
      sequence: 1
      parameterQueries: {
        newStatus: "DRAFT"
      }
    }
    # ON_REVIEW_RESTART
    # change status to DRAFT
    {
      actionCode: "changeStatus"
      trigger: ON_REVIEW_RESTART
      sequence: 1
      parameterQueries: {
        newStatus: "DRAFT"
      }
    }
    # ON_REVIEW_CREATE
    # 1 - change status to DRAFT
    # 2 - lock review if assignment is locked
    {
        actionCode: "changeStatus"
        trigger: ON_REVIEW_CREATE
        sequence: 1
        parameterQueries: {
          newStatus: "DRAFT"
        }
    }
    {
      actionCode: "changeStatus"
      trigger: ON_REVIEW_CREATE
      sequence: 2
      condition: {
        operator: "objectProperties"
        children: [
          "applicationData.reviewData.reviewAssignment.isLocked"
        ]
      }
      parameterQueries: {
        newStatus: "LOCKED"
      }
  }
    # ON_APPLICATION_SUBMIT
    # 1 - change status to SUBMITTED
    # 2 - trim responses
    # 3 - generate review assignments
    # 4 - update review statuses
    {
        actionCode: "changeStatus"
        trigger: ON_APPLICATION_SUBMIT
        sequence: 1
        parameterQueries: {
          newStatus: "SUBMITTED"
        }
    }
    {
        actionCode: "trimResponses"
        trigger: ON_APPLICATION_SUBMIT
        sequence: 2
    }
    {
      actionCode: "generateReviewAssignments"
      trigger: ON_APPLICATION_SUBMIT
      sequence: 3
    }
    {
      actionCode: "updateReviewsStatuses"
      trigger: ON_APPLICATION_SUBMIT
      sequence: 4
      parameterQueries: {
        changedResponses: {
          operator: "objectProperties"
          children: ["outputCumulative.updatedResponses"]
        }
      }
    }
    {
      actionCode: "cleanupFiles"
      trigger: ON_APPLICATION_SUBMIT
      sequence: 5
    }
    # -------------------------------------------
    # ON_REVIEW_SUBMIT
    # 1 - change status to SUBMITTED
    # 2 - trim responses
    # 3 - update review statuses (for other reviews related to this review submission)
    # 4 - increment application stage (after last level reviewer conforms)
    # 5 - generate review assignments
    # 6 - adjust visibility of review responses (for applicant - LOQ)
    # 7 - change application status (for applicant - LOQ)
    # 8 & 9 - change application outcome after last stage and last level submission
    {
        actionCode: "changeStatus"
        trigger: ON_REVIEW_SUBMIT
        sequence: 50
        parameterQueries: {
          newStatus: "SUBMITTED"
        }
    }
    {
        actionCode: "trimResponses"
        trigger: ON_REVIEW_SUBMIT
        sequence: 51
        parameterQueries: {
          timestamp: {
            operator: "objectProperties"
            children: ["outputCumulative.reviewStatusHistoryTimestamp"]
            }
        }
    }
   {
        actionCode: "updateReviewsStatuses"
        trigger: ON_REVIEW_SUBMIT
        sequence: 52
        parameterQueries: {
          applicationId: {
            operator: "objectProperties"
            children: ["applicationData.applicationId"]
          }
          triggeredBy: "REVIEW"
          changedResponses: {
            operator: "objectProperties"
            children: ["outputCumulative.updatedResponses"]
          }
        }
    }
    # increment stage of application (ignored if last stage)
    # condition checks for latest review decison = CONFORM
    # AND review being isLastLevel
    {
      actionCode: "incrementStage"
      trigger: ON_REVIEW_SUBMIT
      sequence: 53
      condition: {
        operator: "AND"
        children: [
          {
            operator: "OR",
            children: [
              {
                operator: "=",
                children: [
                  {
                    operator: "objectProperties",
                    children: [
                      "applicationData.reviewData.latestDecision.decision"
                    ]
                  },
                  "CONFORM"
                ]
              },
              {
                operator: "=",
                children: [
                  {
                    operator: "objectProperties",
                    children: [
                      "applicationData.reviewData.latestDecision.decision"
                    ]
                  },
                  "NON_CONFORM"
                ]
              }
            ]
          }
          {
            operator: "objectProperties"
            children: ["applicationData.reviewData.isLastLevel"]
          }
        ]
      }
    }
    # generates next review assignments
    # condition checks current review stage and level in review SUBMITTED
    # only create next level (or next stage) review assignments 
    {
      actionCode: "generateReviewAssignments"
      trigger: ON_REVIEW_SUBMIT
      sequence: 54
    }
    # update review visibility for applicant
    # condition checks for latest review decison = LIST_OF_QUESTIONS
    # AND review being isLastLevel
    {
        actionCode: "updateReviewVisibility"
        sequence: 6
        trigger: ON_REVIEW_SUBMIT
        condition: {
        operator: "AND"
        children: [
          {
            operator: "="
            children: [
              {
                operator: "objectProperties"
                children: [
                  "applicationData.reviewData.latestDecision.decision"
                ]
              }
              "LIST_OF_QUESTIONS"
            ]
          }
          {
            operator: "objectProperties"
            children: ["applicationData.reviewData.isLastLevel"]
          }
        ]
      }
    }
    # change application status to changes requested
    # condition checks for latest review decison = LIST_OF_QUESTIONS
    # AND review being isLastLevel
    {
      actionCode: "changeStatus"
      sequence: 55
      trigger: ON_REVIEW_SUBMIT
      condition: {
        operator: "AND"
        children: [
          {
            operator: "="
            children: [
              {
                operator: "objectProperties"
                children: [
                  "applicationData.reviewData.latestDecision.decision"
                ]
              }
              "LIST_OF_QUESTIONS"
            ]
          }
          {
            operator: "objectProperties"
            children: ["applicationData.reviewData.isLastLevel"]
          }
        ]
      }
      parameterQueries: {
        newStatus: "CHANGES_REQUIRED"
        isReview: false #Required since we're updating an application status
      }
    }
    #
    # Change outcome of application to APPROVED/REJECT acording with
    # last level & last stage reviewr decision is CONFORM/NON_CONFORM
    #
    {
      actionCode: "changeOutcome"
      trigger: ON_REVIEW_SUBMIT
      sequence: 56
      condition: {
        operator: "AND"
        children: [
          {
            operator: "!="
            children: [
              {
                operator: "objectProperties"
                children: [ "applicationData.reviewData.latestDecision.decision" ]
              }
              "LIST_OF_QUESTIONS"
            ]
          }
          {
            operator: "objectProperties"
            children: ["applicationData.reviewData.isLastLevel"]
          }
          {
            operator: "objectProperties"
            children: 
              [
                "applicationData.reviewData.isLastStage"
                null  
              ]
          }
        ]
      }
      parameterQueries: { 
        newOutcome: {
          operator: "?",
          children: [
            {
              operator: "=",
              children: 
              [
                {
                  operator: "objectProperties",
                  children: 
                  [
                    "applicationData.reviewData.latestDecision.decision",
                    null
                  ]
                },
                "CONFORM"
              ]
            },
            "APPROVED",
            "REJECTED"
          ]
        }
      }
    }
    # -------------------------------------------
    # ON_REVIEW_SELF_ASSIGN
    # change review assignment status for other reviewers
    {
        actionCode: "updateReviewAssignmentsStatus"
        trigger: ON_REVIEW_SELF_ASSIGN
        # sequence: 1
        parameterQueries: {
        reviewAssignmentId: {
            operator: "objectProperties"
            children: ["applicationData.action_payload.trigger_payload.record_id"]
        }
        trigger: {
            operator: "objectProperties"
            children: ["applicationData.action_payload.trigger_payload.trigger"]
        }
        }
    }   
    `

/*
Joins filters to tempaltes
*/
exports.joinFilters = `
templateFilterJoinsUsingId: {
  create: [
    {
      filterToFilterId: {
        connectByCode: { code: "approveApplications" }
      }
    }
    {
      filterToFilterId: {
        connectByCode: { code: "submittedApplications" }
      }
    }
    {
      filterToFilterId: { connectByCode: { code: "draftApplications" } }
    }
    {
      filterToFilterId: {
        connectByCode: { code: "changeRequestApplications" }
      }
    }
    {
      filterToFilterId: {
        connectByCode: { code: "availableForSelfAssignmentReviews" }
      }
    }
    {
      filterToFilterId: {
        connectByCode: { code: "readyToStartReviews" }
      }
    }
    {
      filterToFilterId: {
        connectByCode: { code: "readyToRestartReviews" }
      }
    }
    { filterToFilterId: { connectByCode: { code: "draftReviews" } } }
    {
      filterToFilterId: {
        connectByCode: { code: "changeRequestReviews" }
      }
    }
    {
      filterToFilterId: {
        connectByCode: { code: "awaitingAssignments" }
      }
    }
    {
      filterToFilterId: {
        connectByCode: { code: "availableForReAssignments" }
      }
    }
  ]
}`
