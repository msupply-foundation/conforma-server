/*
TEMPLATE E - Core Actions
  - empty template that lists all of the core actions
*/
exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "CoreActions"
          name: "Core Action Template"
          status: AVAILABLE
          startMessage: "## Core Action Template"
          versionTimestamp: "NOW()"
          templateActionsUsingId: {
            create: [
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
                    children: ["applicationData.applicationId"]
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
                }
              }
              {
                actionCode: "generateReviewAssignments"
                trigger: ON_REVIEW_SUBMIT
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
                sequence: 4
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
            ]
          }
        }
      }
    ) {
      template {
        code
        name
      }
    }
  }
  `,
]
