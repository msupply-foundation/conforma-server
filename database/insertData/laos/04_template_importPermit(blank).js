/*
TEMPLATE D - Import Permit
  - Permissions is granted on approval of Company License (on specific options selected)
*/

const { coreActions, joinFilters } = require('../_helpers/core_mutations')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "importPermit"
          name: "Import permit"
          isLinear: true
          status: AVAILABLE
          startMessage: "## Apply for import permit of Modern medicines or Medical devices"
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Applicant details"
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
            connectByCode: { code: "license" }
          }
          templateStagesUsingId: {
            create: [
              {
                number: 1
                title: "Automatic"
                colour: "#1E14DB" #dark blue
              }
            ]
          }
          ${joinFilters}
          templateActionsUsingId: {
            create: [
              ${coreActions}
              {
                actionCode: "cLog"
                trigger: ON_APPLICATION_SUBMIT
                parameterQueries: {
                  message: { value: "Import permit (Modern medicines or Medical devices) submission" }
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
                    connectByName: { name: "applyImportPermit" }
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
  }`,
]

