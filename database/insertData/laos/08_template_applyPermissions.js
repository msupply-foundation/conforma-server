/*
TEMPLATE - Add permissions to user for current company - Work in Progress
  - Permission (selected) is granted on approval 
  - Assigner, orgReviewer1 and orgReviewer2 can apply to FDD permissions
*/

exports.queries = [
    `mutation {
      createTemplate(
        input: {
          template: {
            code: "applyPermissions"
            name: "Apply For Permissions"
            isLinear: true
            status: AVAILABLE
            startMessage: "## Apply For Permissions within organisation"
            versionTimestamp: "NOW()"
            templateSectionsUsingId: {
              create: [
                {
                  code: "S1"
                  title: "Apply Permissions"
                  index: 0
                  templateElementsUsingId: {
                    create: [
                      {
                        code: "S1PB1"
                        index: 10
                        title: "To Be Configured"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: {
                          title: "### To Be Configured"
                        }
                      }
                      {
                          code: "Q1"
                          index: 20
                          title: "To Be Configured"
                          elementTypePluginCode: "shortText"
                          category: QUESTION
                          isRequired: false
                          parameters: { label: "To Be Configured" }
                      }
                    ]
                  }
                }
              ]
            }
            templateCategoryToTemplateCategoryId: {
              connectByCode: { code: "org" }
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
            templateActionsUsingId: {
              create: [
                {
                  actionCode: "incrementStage"
                  sequence: 1
                  trigger: ON_APPLICATION_CREATE
                }
              ]
             }
             templatePermissionsUsingId: {
                create: [
                    {
                      permissionNameToPermissionNameId: {
                      connectByName: { name: "applyForOrganisationPermissions" }
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