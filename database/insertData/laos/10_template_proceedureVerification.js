/*
TEMPLATE - Simple form to verify correctness of drug registration proceedure
  - Few permissions linked to users for each stage/level:
  - Apply permission: applyProceedureVerification - username: 
  - Review permission: screenProceedure - Stage 1 level 1 - username: screenproceedure
  - Review permission: assessPayment - Stage 2 level 1 - username: assessPayment
  - Review permission: reviewProceedure - Stage 3 level 1 - usernames: reviewproceedure1 | reviewproceedure2
  - Review permission: consolidateProceedure - Stage 3 level 2 - username:  consolidateproceedure
  - 
*/

const { coreActions } = require('../_helpers/core_mutations')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "proceedureVerification"
          name: "Drug Rego Proceedure"
          isLinear: true
          status: AVAILABLE
          startMessage: "## Simple form to verify correctness of drug registration proceedure"
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Form"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      code: "formQuestion"
                      isEditable: {
                        operator: "!="
                        children: [{
                          operator: "objectProperties",
                          children: ["applicationData.currentStage.name"]
                        },
                        "Assessment Payment"
                        ]
                      }
                      index: 1
                      title: "Form Question"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: true
                      parameters: { label: "Form Question" }
                    }
                  ]
                }
              }
              {
                code: "S2"
                title: "Documents"
                index: 2
                templateElementsUsingId: {
                  create: [
                    {
                      code: "file"
                      isEditable: {
                        operator: "!="
                        children: [{
                          operator: "objectProperties",
                          children: ["applicationData.currentStage.name"]
                        },
                        "Assessment Payment"
                        ]
                      }
                      index: 2
                      title: "Documents"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: true
                      parameters: {
                        label: "Documents"
                        fileCountLimit: 10
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }
                  ]
                }
              }
              {
                code: "S3"
                title: "Payments"
                index: 3
                templateElementsUsingId: {
                  create: [
                    {
                      code: "payment1"
                      index: 3
                      title: "Screening Payment"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: {
                        operator: "="
                        children: [{
                          operator: "objectProperties",
                          children: ["applicationData.currentStage.name"]
                        },
                        "Screening"
                        ]
                      }
                      isEditable: {
                        operator: "="
                        children: [{
                          operator: "objectProperties",
                          children: ["applicationData.currentStage.name"]
                        },
                        "Screening"
                        ]
                      }
                      visibilityCondition: {
                        operator: "="
                        children: [{
                          operator: "objectProperties",
                          children: ["applicationData.currentStage.name"]
                        },
                        "Screening"
                        ]
                      }
                      parameters: {
                        label: "Screening Payment"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }
                    {
                      code: "payment2"
                      defaultValue: {}
                      visibilityCondition: {
                        operator: "="
                        children: [{
                          operator: "objectProperties",
                          children: ["applicationData.currentStage.name"]
                        },
                        "Assessment Payment"
                        ]
                      }
                      index: 3
                      title: "Assessment Payment"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: {
                        operator: "="
                        children: [{
                          operator: "objectProperties",
                          children: ["applicationData.currentStage.name"]
                        },
                        "Assessment Payment"
                        ]
                      }
                      isEditable: {
                        operator: "="
                        children: [{
                          operator: "objectProperties",
                          children: ["applicationData.currentStage.name"]
                        },
                        "Assessment Payment"
                        ]
                      }
                      parameters: {
                        label: "Assessment Payment"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }
                  ]
                }
              }
            ]
          }
          templateCategoryToTemplateCategoryId: { connectByCode: { code: "dev" } }
          templateStagesUsingId: {
            create: [
              {
                number: 1
                title: "Screening"
                description: "This application will go through the Screening stage before it can be accessed."
                colour: "#24B5DF" #teal blue
                templateStageReviewLevelsUsingId: {
                  create: [{ number: 1, name: "Review" }]
                }
              }
              {
                number: 2
                title: "Assessment Payment"
                description: "Payment prior to assesment"
                colour: "#E17E48" #orange
                # To-do: add more review levels for consolidation
                templateStageReviewLevelsUsingId: {
                  create: [
                    { number: 1, name: "Review" }
                  ]
                }
              }
              {
                number: 3
                title: "Assessment"
                description: "Full assessment, including multiple reviewers and consolidation"
                colour: "#E17E48" #orange
                # To-do: add more review levels for consolidation
                templateStageReviewLevelsUsingId: {
                  create: [
                    { number: 1, name: "Review" }
                    { number: 2, name: "Consolidation" }
                  ]
                }
              }
            ]
          }
          templateActionsUsingId: {
            create: [
              ${coreActions}
              {
                actionCode: "changeStatus"
                trigger: ON_REVIEW_SUBMIT
                sequence: 8
                parameterQueries: {
                  newStatus: { value: "DRAFT" }
                  applicationId:  {
                    operator: "objectProperties"
                    children: ["applicationData.applicationId"]
                  }
                  isReview: false
                }
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
                    {
                      operator: "="
                      children: [
                        {
                          operator: "objectProperties"
                          children: [
                            "applicationData.stage"
                          ]
                        }
                        "Assessment Payment"
                      ]
                    }
                  ]
                }
              }
              {
                actionCode: "cLog"
                trigger: ON_APPLICATION_SUBMIT
                parameterQueries: { message: "Application Submitted" }
              }
            ]
          }
          templatePermissionsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyProceedureVerification" }
                }
              }
              # Review Drug Registration Stage 1
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "screenProceedure" }
                }
                canSelfAssign: true
                levelNumber: 1
                stageNumber: 1
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "assessPayment" }
                }
                canSelfAssign: true
                levelNumber: 1
                stageNumber: 2
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewProceedure" }
                }
                levelNumber: 1
                stageNumber: 3
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "consolidateProceedure" }
                }
                canSelfAssign: true
                levelNumber: 2
                stageNumber: 3
              }
              # Assign Drug Registration Stage 2
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "assignGeneral" }
                }
                levelNumber: 1
                stageNumber: 3
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
  }`,
]