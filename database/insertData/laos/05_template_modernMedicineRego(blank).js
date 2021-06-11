/*
TEMPLATE E - Modern Medicine (Drug Registration)
  - Permissions is granted on approval of Company License (on specific options selected)
*/

const { coreActions, joinFilters } = require('../_helpers/core_mutations')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "modernMedicineRego"
          name: "Drug Registration MMC"
          isLinear: true
          status: AVAILABLE
          startMessage: "## Apply for a drug registration of a medicine"
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Modern medice details"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S1PB1"
                      index: 10
                      title: "Section 1 - Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "### Place holder - fields to be created soon!"
                      }
                    }
                  ]
                }
              }
            ]
          }
          templateCategoryToTemplateCategoryId: {
            connectByCode: { code: "drugRego" }
          }
          ${joinFilters}
          templateActionsUsingId: {
            create: [
              ${coreActions}
              {
                actionCode: "cLog"
                trigger: ON_APPLICATION_SUBMIT
                parameterQueries: {
                  message: { value: "Drug Registration (Modern Medicines) submission" }
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
                parameterQueries: { newOutcome: { value: "APPROVED" } }
              }
            ]
          }
          templatePermissionsUsingId: {
                create: [
                # Apply Company license (granted on Company registration)
                {
                    permissionNameToPermissionNameId: {
                    connectByName: { name: "applyDrugRegoMMC" }
                    }
                }
                # Review General - Stage 1
                {
                    permissionNameToPermissionNameId: {
                    connectByName: { name: "reviewGeneral" }
                    }
                    stageNumber: 1
                    levelNumber: 1
                }
                # Assign General - Stage 1
                {
                    permissionNameToPermissionNameId: {
                    connectByName: { name: "canAssignDrugRego" }
                    }
                    stageNumber: 1
                    levelNumber: 1
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

