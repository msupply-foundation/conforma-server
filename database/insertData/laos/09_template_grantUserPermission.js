/*
TEMPLATE - Grant permissions to select users in current company - Work in Progress
  - Permission to users (selected) are granted on approval 
  - Only Admin user has permission to approve this at the start
*/

exports.queries = [
    `mutation {
      createTemplate(
        input: {
          template: {
            code: "grantUserPermissions"
            name: "Grant User Permissions"
            isLinear: true
            status: AVAILABLE
            startMessage: "## Grant User Permissions"
            versionTimestamp: "NOW()"
            templateSectionsUsingId: {
              create: [
                {
                  code: "S1"
                  title: "Grant Permissions"
                  index: 0
                  templateElementsUsingId: {
                    create: [
                      {
                        code: "user"
                        index: 1
                        title: "user"
                        elementTypePluginCode: "search"
                        category: QUESTION
                        isRequired: true
                        parameters: {
                          label: "user"
                          placeholder: "Search for User"
                          icon: "user"
                          minCharacters: 3
                          multiSelect: true
                          source: {
                            operator: "graphQL",
                            children: [
                              "query findUser($search: String!) {  users(    filter: {      userOrganisations: { some: { organisation: { id: { equalTo: 1 } } } }      or: [        { email: { includesInsensitive: $search } }        { firstName: { includesInsensitive: $search } }        { lastName: { includesInsensitive: $search } }        { username: { includesInsensitive: $search } }      ]    }  ) {    nodes {      email      firstName      lastName      username id    }  }}",
                              "http://localhost:5000/graphql",
                              [
                                "search"
                              ],
                              {
                                operator: "objectProperties",
                                children: [
                                  "search.text"
                                ]
                              },
                              "users.nodes"
                            ]
                          }
                          displayFormat: {
                            title: "\${username}",
                            description: "First Name: \${firstName} \\nLast Name:\${lastName} \\nemail:\${email}"
                          }
                          resultFormat: {
                            title: "\${username}",
                            description: "First Name: \${firstName} \\nLast Name:\${lastName} \\nemail:\${email}"
                          }
                        }
                      }
                      {
                        code: "permissions"
                        index: 2
                        title: "permissions"
                        isRequired: true
                        elementTypePluginCode: "checkbox"
                        category: QUESTION
                        parameters: {
                          label: "permissions"
                          checkboxes: [
                            { label: "Review Organisation Registration", permissionName: "reviewOrgRego" }
                            { label: "Review Organisation Licence", permissionName: "reviewOrgLicence" }
                            { label: "Can assign", permissionName: "assignGeneral" }
                            { label: "Can grant FDD permissions", permissionName: "grantUserFDDpermissions" }
                            { label: "Can add user to FDD", permissionName: "joinUserToFDD" }
                            { label: "Can screen proceedure example", permissionName: "screenProceedure" }
                            { label: "Can review proceedure example", permissionName: "reviewProceedure" }
                            { label: "Can consolidate proceedure example", permissionName: "consolidateProceedure" }
                          ]
                        }
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
                {
                  actionCode: "changeStatus"
                  trigger: ON_APPLICATION_SUBMIT
                  sequence: 2
                  parameterQueries: { newStatus: { value: "COMPLETED" } }
                }
                {
                  actionCode: "changeOutcome"
                  trigger: ON_APPLICATION_SUBMIT
                  sequence: 3
                  parameterQueries: { newOutcome: { value: "APPROVED" } }
                }
                {
                  actionCode: "grantPermissions"
                  trigger: ON_APPLICATION_SUBMIT
                  sequence: 5
                  parameterQueries: {
                    username: {
                      operator: "+"
                      children: [
                        "",
                        {
                          operator: "objectProperties"
                          children: [
                            "applicationData.responses.user.selection.username"
                          ]
                        }
                      ]
                    }
                    orgId: {
                      operator: "objectProperties"
                      children: ["applicationData.orgId"]
                    }
                    permissionNames: {
                      operator: "objectProperties"
                      children: [
                        "applicationData.responses.permissions.selectedValues.permissionName"
                      ]
                    }
                  }
                }
              ]
             }
             templatePermissionsUsingId: {
                create: [
                    {
                      permissionNameToPermissionNameId: {
                      connectByName: { name: "grantUserFDDpermissions" }
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