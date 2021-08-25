/*
TEMPLATE - Add user to Food and Drug Department
  - Permission to user login as FDD is granted on approval 
  - Only Admin user has permission to approve this at the start
*/

exports.queries = [
    `mutation {
      createTemplate(
        input: {
          template: {
            code: "addUserToFDD"
            name: "Add User to FDD"
            isLinear: true
            status: AVAILABLE
            startMessage: "## Add user to Department of Drug and Food"
            versionTimestamp: "NOW()"
            templateSectionsUsingId: {
              create: [
                {
                  code: "S1"
                  title: "User Add"
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
                              "query findUser($search: String!) {  users(    filter: {      userOrganisations: { none: { organisation: { id: { equalTo: 1 } } } }      or: [        { email: { includesInsensitive: $search } }        { firstName: { includesInsensitive: $search } }        { lastName: { includesInsensitive: $search } }        { username: { includesInsensitive: $search } }      ]    }  ) {    nodes {      email      firstName      lastName      username id    }  }}",
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
                  actionCode: "joinUserOrg"
                  trigger: ON_APPLICATION_SUBMIT
                  sequence: 4
                  parameterQueries: {
                    user_id: {
                      operator: "+"
                      children: [
                        "",
                        {
                          operator: "objectProperties"
                          children: [
                            "applicationData.responses.user.selection.id"
                          ]
                        }
                      ]
                    }
                    organisation_id: {
                      operator: "objectProperties"
                      children: ["applicationData.orgId"]
                    }
                  }
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
                    # Apply to join
                    {
                      permissionNameToPermissionNameId: {
                      connectByName: { name: "joinUserToFDD" }
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