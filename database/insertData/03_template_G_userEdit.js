/*
TEMPLATE G -- User Details Edit
  - allows an existing user to update their details
*/

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "UserEdit"
          name: "Edit User Details"
          submissionMessage: "Thanks for updating your details. You will need to log out and log back into the system for the changes to take effect."
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
                        # Must be unique OR same as current
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
                    {
                      code: "passwordCheckbox"
                      index: 5
                      title: "Password Change Check"
                      isRequired: false
                      elementTypePluginCode: "checkbox"
                      category: QUESTION
                      parameters: {
                        label: "Do you wish to change your password?"
                        checkboxes: ["Yes"]
                        type: "toggle"
                      }
                    }
                    {
                      code: "currentPassword"
                      index: 6
                      title: "Current Password"
                      elementTypePluginCode: "password"
                      category: QUESTION
                      helpText: "To change your password, you must first enter your current password correctly."
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [
                              "responses.passwordCheckbox.values.0.selected"
                            ]
                          }
                          true
                        ]
                      }
                      parameters: {
                        label: "Current Password"
                        placeholder: "Current password"
                        requireConfirmation: false
                        validationInternal: {
                          operator: "POST"
                          children: [
                            {
                              operator: "+"
                              children: [
                                {
                                  operator: "objectProperties"
                                  children: ["applicationData.config.serverREST"]
                                }
                                "/login"
                              ]
                            }
                            ["username", "password"]
                            {
                              operator: "objectProperties"
                              children: ["currentUser.username"]
                            }
                            {
                              operator: "objectProperties"
                              children: ["responses.thisResponse"]
                            }
                            "success"
                          ]
                        }
                        validationMessageInternal: "Incorrect password"
                      }
                    }
                    {
                      code: "newPassword"
                      index: 7
                      title: "New Password"
                      elementTypePluginCode: "password"
                      category: QUESTION
                      visibilityCondition: {
                        operator: "objectProperties"
                        children: ["responses.currentPassword.isValid"]
                      }
                      parameters: {
                        label: "New Password"
                        description: "Please select a new password"
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
          templateCategoryToTemplateCategoryId: { connectByCode: { code: "user" } }
          templateStagesUsingId: { create: [{ number: 1, title: "Automatic" }] }
          templateActionsUsingId: {
            create: [
              # No Core Actions for this one
              {
                actionCode: "incrementStage"
                sequence: 1
                trigger: ON_APPLICATION_CREATE
              }
              {
                actionCode: "modifyRecord"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 1
                parameterQueries: {
                  tableName: "user"
                  id: {
                    operator: "objectProperties"
                    children: ["applicationData.userId"]
                  }
                  first_name: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q1.text"]
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
                    operator: "?"
                    children: [
                      {
                        operator: "objectProperties"
                        children: [
                          "applicationData.responses.passwordCheckbox.values.0.selected"
                        ]
                      }
                      {
                        operator: "objectProperties"
                        children: ["applicationData.responses.newPassword.hash"]
                      }
                      null
                    ]
                  }
                }
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
            ]
          }
          templatePermissionsUsingId: {
            create: [
              # Apply User Edit
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyUserEdit" }
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
