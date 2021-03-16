/*
GraphQL Fragment - CORE ACTIONS
  - common Actions for all templates
*/
exports.coreActions = `
    # ON_APPLICATION_CREATE
    # change status to draft
    {
        actionCode: "incrementStage"
        trigger: ON_APPLICATION_CREATE
        parameterQueries: {
        applicationId: {
            operator: "objectProperties"
            children: ["applicationData.applicationId"]
        }
        }
    }
    # ON_REVIEW_CREATE
    # change status to draft
    {
        actionCode: "changeStatus"
        trigger: ON_REVIEW_CREATE
        parameterQueries: {
        reviewId: {
            operator: "objectProperties"
            children: ["applicationData.record_id"]
        }
        newStatus: { value: "Draft" }
        }
    }
    # ON_APPLICATION_SUBMIT
    # 1 - change status to submitted
    # 2 - trim responses
    # 3 - generate review assignments
    {
        actionCode: "changeStatus"
        trigger: ON_APPLICATION_SUBMIT
        sequence: 1
        parameterQueries: {
        applicationId: {
            operator: "objectProperties"
            children: ["applicationData.applicationId"]
        }
        newStatus: { value: "Submitted" }
        }
    }
    {
        actionCode: "trimResponses"
        trigger: ON_APPLICATION_SUBMIT
        sequence: 2
        parameterQueries: {
          applicationId: {
            operator: "objectProperties"
            children: ["applicationData.record_id"]
          }
          timestamp: {
            operator: "objectProperties"
            children: ["output.applicationStatusHistoryTimestamp", null]
          }
        }
    }
    {
        actionCode: "generateReviewAssignments"
        trigger: ON_APPLICATION_SUBMIT
        sequence: 3
        parameterQueries: {
        applicationId: {
            operator: "objectProperties"
            children: ["applicationData.applicationId"]
        }
        templateId: {
            operator: "objectProperties"
            children: ["applicationData.templateId"]
        }
        stageId: {
            operator: "objectProperties"
            children: ["applicationData.stageId"]
        }
        stageNumber: {
            operator: "objectProperties"
            children: ["applicationData.stageNumber"]
        }
        }
    }
    {
        actionCode: "updateReviews"
        trigger: ON_APPLICATION_SUBMIT
        sequence: 4
        parameterQueries: {
          applicationId: {
            operator: "objectProperties"
            children: ["applicationData.record_id"]
          }
          changedApplicationResponses: {
            operator: "objectProperties"
            children: ["output.updatedResponses"]
          }
        }
    }
    # ON_REVIEW_SUBMIT
    # 1 - change status to submitted
    # 2 - trim responses
    # 3 - generate review assignments
    # 4 - adjust visibility of review responses (for applicant)
    # 5 - change application status
    {
        actionCode: "changeStatus"
        trigger: ON_REVIEW_SUBMIT
        sequence: 1
        parameterQueries: {
        reviewId: {
            operator: "objectProperties"
            children: ["applicationData.record_id"]
            }
        newStatus: { value: "Submitted" }
        }
    }
    {
        actionCode: "trimResponses"
        trigger: ON_REVIEW_SUBMIT
        sequence: 2
        parameterQueries: {
          reviewId: {
            operator: "objectProperties"
            children: ["applicationData.record_id"]
          }
          timestamp: {
            operator: "objectProperties"
            children: ["output.reviewStatusHistoryTimestamp"]
            }
        }
    }
  #  {
  #      actionCode: "updateReviews"
  #      trigger: ON_REVIEW_SUBMIT
  #      sequence: 3
  #      parameterQueries: {
  #        applicationId: {
  #          operator: "objectProperties"
  #          children: ["applicationData.applicationId"]
  #        }
  #        changedApplicationResponses: {
  #          operator: "objectProperties"
  #          children: ["output.updatedResponses"]
  #        }
  #      }
  #  }
    {
        actionCode: "generateReviewAssignments"
        trigger: ON_REVIEW_SUBMIT
        sequence: 4
        parameterQueries: {
        applicationId: {
            operator: "objectProperties"
            children: ["applicationData.applicationId"]
        }
        templateId: {
            operator: "objectProperties"
            children: ["applicationData.templateId"]
        }
        reviewId: {
            operator: "objectProperties"
            children: ["applicationData.record_id"]
        }
        stageId: {
            operator: "objectProperties"
            children: ["applicationData.stageId"]
        }
        stageNumber: {
            operator: "objectProperties"
            children: ["applicationData.stageNumber"]
        }
        }
    }
    # update review visibility for applicant
    # condition checks for latest review decison = LIST_OF_QUESTIONS
    # AND review being isLastLevel
    {
        actionCode: "updateReviewVisibility"
        sequence: 5
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
        reviewId: {
            operator: "objectProperties"
            children: ["applicationData.record_id"]
        }
        }
    }
    # change application status to changes requested
    # condition checks for latest review decison = LIST_OF_QUESTIONS
    # AND review being isLastLevel
    {
      actionCode: "changeStatus"
      sequence: 5
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
        applicationId: {
          operator: "objectProperties"
          children: ["applicationData.applicationId"]
        }
        newStatus: { value: "Changes Required" }
      }
    }
    # ON_REVIEW_SELF_ASSIGN
    # change review assignment status for other reviewers
    {
        actionCode: "updateReviewAssignmentsStatus"
        trigger: ON_REVIEW_SELF_ASSIGN
        # sequence: 1
        parameterQueries: {
        reviewAssignmentId: {
            operator: "objectProperties"
            children: ["applicationData.record_id"]
        }
        trigger: {
            operator: "objectProperties"
            children: ["applicationData.trigger"]
        }
        }
    }   
    
    `
