/*
TEMPLATE C -- User Details Edit
  - allows an existing user to update their details
*/

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "UserEdit"
          name: "Edit User Details"
          submissionMessage: "Thanks for updating your details"
          status: AVAILABLE
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "User information"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      code: "Text1"
                      index: 0
                      title: "Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { text: "Please update your user information" }
                    }
                    {
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
                      parameters: {
                        label: "First Name"
                        default: {
                          operator: "objectProperties"
                          children: ["currentUser.firstName"]
                        }
                      }
                    }
                    {
                      code: "Q2"
                      index: 2
                      title: "Last Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Last Name"
                        default: {
                          operator: "objectProperties"
                          children: ["currentUser.lastName"]
                        }
                      }
                    }
                    {
                      code: "Q3"
                      index: 3
                      title: "Username"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "OR"
                        children: [
                          {
                            operator: "API"
                            children: [
                              "http://localhost:8080/check-unique"
                              ["type", "value"]
                              "username"
                              {
                                operator: "objectProperties"
                                children: ["responses.thisResponse"]
                              }
                              "unique"
                            ]
                          }
                          {
                            operator: "="
                            children: [
                              {
                                operator: "objectProperties"
                                children: ["currentUser.username"]
                              }
                              {
                                operator: "objectProperties"
                                children: ["responses.thisResponse"]
                              }
                            ]
                          }
                        ]
                      }
                      validationMessage: "Username must be unique"
                      parameters: {
                        label: "Select a username"
                        default: {
                          operator: "objectProperties"
                          children: ["currentUser.username"]
                        }
                      }
                    }
                    {
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
                      parameters: {
                        label: "Email"
                        default: {
                          operator: "objectProperties"
                          children: ["currentUser.email"]
                        }
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
                sequence: 1
                trigger: ON_APPLICATION_CREATE
              }
              #
              # TO-DO: Create an UpdateUser / Update Entity Action
              #
              # {
              #   actionCode: "updateUser"
              #   trigger: ON_APPLICATION_SUBMIT
              #   sequence: 1
              #   parameterQueries: {
              #     first_name: {
              #       operator: "objectProperties"
              #       children: ["applicationData.responses.Q1.text"]
              #     }
              #     last_name: {
              #       operator: "objectProperties"
              #       children: ["applicationData.responses.Q2.text"]
              #     }
              #     username: {
              #       operator: "objectProperties"
              #       children: ["applicationData.responses.Q3.text"]
              #     }
              #     email: {
              #       operator: "objectProperties"
              #       children: ["applicationData.responses.Q4.text"]
              #     }
              #     password_hash: {
              #       operator: "objectProperties"
              #       children: ["applicationData.responses.Q5.hash"]
              #     }
              #   }
              # }
              {
                actionCode: "changeStatus"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 2
                parameterQueries: { newStatus: { value: "Completed" } }
              }
              {
                actionCode: "changeOutcome"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 3
                parameterQueries: { newOutcome: { value: "Approved" } }
              }
            ]
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
