/* 
TEMPLATE F - Join Organisation
  - for applying to join an existing organisation.
  Still to-do:
   - more specific policies to limit reviewers to their own organisation
   - Org selector needs a plugin that doesn't show all companies to user
*/
const { coreActions } = require('./core_actions')
const { devActions } = require('./dev_actions')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "OrgJoin"
          name: "Join Organisation"
          isLinear: false
          status: AVAILABLE
          startMessage: "## You will need the following documents ready for upload:\\n- PhotoID"
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Personal Information"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S1T1"
                      index: 0
                      title: "Intro Section 1"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: {
                          operator: "stringSubstitution"
                          children: [
                            "Welcome, %1."
                            {
                              operator: "objectProperties"
                              children: ["applicationData.user.firstName"]
                            }
                          ]
                        }
                      }
                    }
                    {
                      code: "S1Q1"
                      index: 1
                      title: "Select Organisation"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Please select the organisation you wish to join"
                        search: true
                        options: {
                          operator: "graphQL"
                          children: [
                            "query getOrgs {organisations {nodes {name, id}}}"
                            []
                            "organisations.nodes"
                          ]
                        }
                        optionsDisplayProperty: "name"
                      }
                    }
                    {
                      code: "S1Q2"
                      index: 2
                      title: "Reason"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Reason for joining"
                        description: "Please provide a brief summary of your relationship to this organisation"
                      }
                    }
                    {
                      code: "PB01"
                      index: 3
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "T2"
                      index: 4
                      title: "Documentation Info"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { title: "Documentation" }
                    }
                    {
                      code: "IDUpload"
                      index: 5
                      title: "Upload ID"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      parameters: {
                        label: "Please provide photo ID"
                        description: "Please upload a copy of your photo ID. Must be in **image** or **PDF** format and under 5MB."
                        fileCountLimit: 1
                        fileExtensions: ["pdf", "png", "jpg", "jpeg"]
                        fileSizeLimit: 5000
                      }
                    }
                    {
                      code: "DocUpload"
                      index: 6
                      title: "Upload Doc"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Please upload additional documentation"
                        description: "If necessary, please provide additional documentation showing your relationship to this organisation.\\nYou can upload more than one file if necessary, with same restrictions as above."
                        fileCountLimit: 5
                        fileExtensions: ["pdf", "png", "jpg", "jpeg"]
                        fileSizeLimit: 5000
                      }
                    }
                  ]
                }
              }
            ]
          }
          templateStagesUsingId: {
            create: [
              {
                number: 1
                title: "Approval"
                description: "This application will be approved by a Reviewer"
                colour: "#1E14DB" #dark blue
                templateStageReviewLevelsUsingId: {
                  create: [{ number: 1, name: "Review" }]
                }
              }
            ]
          }
          templateActionsUsingId: {
            create: [
              ${coreActions}
              ${devActions}
              {
                actionCode: "cLog"
                trigger: ON_APPLICATION_SUBMIT
                parameterQueries: {
                  message: { value: "Organisation Registration submission" }
                }
              }
              {
                actionCode: "changeOutcome"
                trigger: ON_REVIEW_SUBMIT
                sequence: 100
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
                parameterQueries: {
                  newOutcome: "Approved"
                }
              }
              {
                actionCode: "joinUserOrg"
                trigger: ON_REVIEW_SUBMIT
                sequence: 120
                condition: {
                  operator: "="
                  children: [
                    {
                      operator: "objectProperties"
                      children: [
                        "applicationData.outcome"
                      ]
                    }
                    "Approved"
                  ]
                }
                parameterQueries: {
                  user_id: {
                    operator: "objectProperties"
                    children: ["applicationData.userId"]
                  }
                  organisation_id: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.S1Q1.selection.id"]
                  }
                }
              }
              {
                actionCode: "grantPermissions"
                trigger: ON_REVIEW_SUBMIT
                sequence: 130
                condition: {
                  operator: "="
                  children: [
                    {
                      operator: "objectProperties"
                      children: [
                        "applicationData.outcome"
                      ]
                    }
                    "Approved"
                  ]
                }
                parameterQueries: {
                  username: {
                    operator: "objectProperties"
                    children: ["applicationData.username"]
                  }
                  orgName: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.S1Q1.selection.name"]
                  }
                  permissionNames: ["canApplyDrugRego"]
                }
              }
              {
                actionCode: "changeStatus"
                trigger: ON_REVIEW_SUBMIT
                sequence: 110
                condition: {
                  operator: "="
                  children: [
                    {
                      operator: "objectProperties"
                      children: [
                        "applicationData.outcome"
                      ]
                    }
                    "Approved"
                  ]
                }
                parameterQueries: {
                  newStatus: "Completed"
                }
              }
            ]
          }
          templatePermissionsUsingId: {
            create: [
              # applyGeneral
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
                }
              }
              # assignGeneral
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "assignGeneral" }
                }
                stageNumber: 1
                levelNumber: 1
              }
              # reviewJoinOrg
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewJoinOrg" }
                }
                stageNumber: 1
                levelNumber: 1
                restrictions: { canSelfAssign: true }
              }
              # reviewGeneral
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewGeneral" }
                }
                stageNumber: 1
                levelNumber: 1
                restrictions: { canSelfAssign: true }
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
