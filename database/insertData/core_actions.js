/*
GraphQL Fragment - CORE ACTIONS
  - common Actions for all templates
*/
exports.coreActions = `
    # ON_APPLICATION_CREATE
    # change status to DRAFT
    {
        actionCode: "incrementStage"
        sequence: 1
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
    # change status to DRAFT
    {
        actionCode: "changeStatus"
        trigger: ON_REVIEW_CREATE
        sequence: 1
        parameterQueries: {
          newStatus: "DRAFT"
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
        changedApplicationResponses: {
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
    # 3 - increment application stage (after last level reviewer conforms)
    # 4 - generate review assignments
    # 5 - adjust visibility of review responses (for applicant - LOQ)
    # 6 - change application status (for applicant - LOQ)
    {
        actionCode: "changeStatus"
        trigger: ON_REVIEW_SUBMIT
        sequence: 1
        parameterQueries: {
          newStatus: "SUBMITTED"
        }
    }
    {
        actionCode: "trimResponses"
        trigger: ON_REVIEW_SUBMIT
        sequence: 2
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
        sequence: 3
        parameterQueries: {
          applicationId: {
            operator: "objectProperties"
            children: ["applicationData.applicationId"]
          }
          changedApplicationResponses: {
            operator: "objectProperties"
            children: ["output.updatedResponses"]
          }
        }
    }
    # increment stage of application (ignored if last stage)
    # condition checks for latest review decison = CONFORM
    # AND review being isLastLevel
    {
      actionCode: "incrementStage"
      trigger: ON_REVIEW_SUBMIT
      sequence: 4
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
              "CONFORM"
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
      sequence: 5
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
      sequence: 7
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
