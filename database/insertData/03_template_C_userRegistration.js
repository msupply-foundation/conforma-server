/*
TEMPLATE C -- User Registration
  - the form filled in by an unregistered user to create an 
    account in the system
*/
// const { coreActions } = require('./core_actions')
exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "UserRegistration"
          name: "User Registration"
          submissionMessage: "Your registration has been completed. Please follow the link sent via email to confirm."
          status: AVAILABLE
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                id: 1004
                code: "S1"
                title: "User information"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      id: 3000
                      code: "Text1"
                      index: 0
                      title: "Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "Create a user account"
                        text: "Please fill in your details to **register** for a user account."
                      }
                    }
                    {
                      id: 3001
                      code: "Q1"
                      index: 1
                      title: "First Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          { value: ".+" }
                        ]
                      }
                      validationMessage: "First name must not be blank"
                      parameters: { label: "First Name" }
                    }
                    {
                      id: 3002
                      code: "Q2"
                      index: 2
                      title: "Last Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Last Name" }
                    }
                    {
                      id: 3003
                      code: "Q3"
                      index: 3
                      title: "Username"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "API"
                        children: [
                          { value: "http://localhost:8080/check-unique" }
                          { value: ["type", "value"] }
                          { value: "username" }
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          { value: "unique" }
                        ]
                      }
                      validationMessage: "Username must be unique"
                      parameters: { label: "Select a username" }
                    }
                    {
                      id: 3004
                      code: "Q4"
                      index: 4
                      title: "Email"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          {
                            value: "^[A-Za-z0-9.]+@[A-Za-z0-9]+\\\\.[A-Za-z0-9.]+$"
                          }
                        ]
                      }
                      validationMessage: "Not a valid email address"
                      parameters: { label: "Email" }
                    }
                    {
                      id: 3005
                      code: "Q5"
                      index: 5
                      title: "Password"
                      elementTypePluginCode: "password"
                      category: QUESTION
                      parameters: {
                        label: "Password"
                        maskedInput: true
                        placeholder: "Password must be at least 8 chars long"
                        validationInternal: {
                          operator: "REGEX"
                          children: [
                            {
                              operator: "objectProperties"
                              children: ["responses.thisResponse"]
                            }
                            { value: "^[\\\\S]{8,}$" }
                          ]
                        }
                        # Validation:Currently just checks 8 chars, needs more complexity
                        validationMessageInternal: "Password must be at least 8 characters"
                      }
                    }
                    # TO-DO: Add Date of birth question once we have DatePicker element type
                  ]
                }
              }
            ]
          }
          templateStagesUsingId: { create: [{ number: 1, title: "Automatic" }] }
          templateActionsUsingId: {
            create: [
              # No Core Actions for this one
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
              {
                actionCode: "createUser"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 1
                parameterQueries: {
                  first_name: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q1.text" ,null]
                  }
                  last_name: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q2.text"]
                  }
                  username: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q3.text"]
                  }
                  email: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q4.text"]
                  }
                  password_hash: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q5.hash"]
                  }
                }
              }
              {
                actionCode: "changeStatus"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 2
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: ["applicationData.applicationId"]
                  }
                  newStatus: { value: "Completed" }
                }
              }
              {
                actionCode: "changeOutcome"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 3
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: ["applicationData.applicationId"]
                  }
                  newOutcome: { value: "Approved" }
                }
              }
              {
                actionCode: "grantPermissions"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 103
                parameterQueries: {
                  username: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q3.text"]
                  }
                  permissionNames: ["canApplyToJoinCompany", "canApplyToCreateCompany"]
                }
              }
            ]
          }
          templatePermissionsUsingId: {
            create: [{ id: 3000, permissionNameId: 1000 }]
          }
        }
      }
    ) {
      template {
        code
        name
        templateSections {
          nodes {
            code
            title
          }
        }
      }
    }
  }`,
]
