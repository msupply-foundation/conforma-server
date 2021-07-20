/*
TEMPLATE F - Medical Devices (Drug Registration)
  - Permissions is granted on approval of Company License (on specific options selected)
*/

const { coreActions, joinFilters } = require('../_helpers/core_mutations')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "medicalDeviceRego"
          name: "Drug Registration MMD"
          isLinear: true
          status: AVAILABLE
          startMessage: "## Apply for a drug registration for a medical devices"
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Medical device details"
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
                        title: "### Fields to be created soon!"
                      }
                    }
                    {
                        code: "Q1"
                        index: 20
                        title: "Blank"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isRequired: false
                        parameters: { label: "Place holder" }
                    }
                  ]
                }
              }
            ]
          }
          templateCategoryToTemplateCategoryId: {
            connectByCode: { code: "drugRego" }
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
                  message: { value: "Drug Registration (Medical device) submission" }
                }
              }
#             {
#               actionCode: "changeOutcome"
#               trigger: ON_REVIEW_SUBMIT
#               sequence: 100
#               condition: {
#                 operator: "AND"
#                 children: [
#                   {
#                     operator: "="
#                     children: [
#                       {
#                         operator: "objectProperties"
#                         children: [
#                           "applicationData.reviewData.latestDecision.decision"
#                         ]
#                       }
#                       "CONFORM"
#                     ]
#                   }
#                   {
#                     operator: "objectProperties"
#                     children: ["applicationData.reviewData.isLastLevel"]
#                   }
#                 ]
#               }
#               parameterQueries: { newOutcome: { value: "APPROVED" } }
#             }
             ]
           }
           templatePermissionsUsingId: {
              create: [
                # Apply Company license (granted on Company registration)
                {
                    permissionNameToPermissionNameId: {
                    connectByName: { name: "applyDrugRegoMMD" }
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

