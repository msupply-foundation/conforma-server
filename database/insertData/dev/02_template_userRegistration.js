/*
TEMPLATE C -- User Registration
  - the form filled in by an unregistered user to create an 
    account in the system
*/
// const { coreActions, joinFilters } = require('./core_mutations')
const { devActions } = require('../_helpers/dev_actions')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "UserRegistration"
          name: "User Registration"
          submissionMessage: "Thanks. Please check your email to verify your registration."
          status: AVAILABLE
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Basic user information"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S1Page1"
                      index: 10
                      title: "Intro Section 1"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "## Welcome to IRIMS Application Manager"
                        style: "basic"
                      }
                    }
                    {
                      code: "Q1FirstName"
                      index: 20
                      title: "First Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      helpText: "### User Registration\\n\\nPlease provide accurate details to **register** for a user account on our system."
                      parameters: { label: "First Name" }
                    }
                    {
                      code: "Q2LastName"
                      index: 30
                      title: "Last Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Last Name" }
                    }
                    {
                      code: "Q3Username"
                      index: 40
                      title: "Username"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { 
                        label: "Select a username" 
                        description: "You can use 3 or more letters, numbers and - . _ or @"
                      }
                      validation: {
                        operator: "AND"
                        children: [
                          {
                            operator: "API"
                            children: [
                              {
                                operator: "+"
                                children: [
                                  {
                                    operator: "objectProperties"
                                    children: ["applicationData.config.serverREST"]
                                  }
                                  "/check-unique"
                                ]
                              }
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
                                operator: "REGEX"
                                children: [
                                  {
                                    operator: "objectProperties"
                                    children: ["responses.thisResponse"]
                                  }
                                  "^[a-zA-Z0-9_.-@]{3,50}$"
                                ]
                              }
                              true
                            ]
                          }
                        ]
                      }
                      validationMessage: "Username already in use or invalid"
                    }
                    {
                      code: "Q4Email"
                      index: 50
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
                      code: "Q5Password"
                      index: 60
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
                            { value: "^[\\\\S]{6,}$" }
                          ]
                        }
                        # Validation:Currently just checks 6 chars, needs more complexity
                        validationMessageInternal: "Password must be at least 6 characters"
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
                title: "Automatic"
                colour: "#1E14DB" #dark blue
              }
            ]
          }
          templateActionsUsingId: {
            create: [
              # No Core Actions for this one
                {
                  actionCode: "generateTextString"
                  sequence: 1
                  trigger: ON_APPLICATION_CREATE
                  parameterQueries: {
                    pattern: "UR-[A-Z]{3}-<+dddd>"
                    counterName: {
                      operator: "objectProperties"
                      children: [ "applicationData.templateCode" ]
                    }
                    counterInit: 100
                    customFields: {
                      # TBD
                    }
                    updateRecord: true
                    table: "application"
                    fieldName: "serial"
                  }
              }
              {
                  actionCode: "generateTextString"
                  sequence: 2
                  trigger: ON_APPLICATION_CREATE
                  parameterQueries: {
                    pattern: "<?templateName> - <?serial>"
                    customFields: {
                      templateName: "applicationData.templateName"
                      serial: "applicationData.applicationSerial"
                    }
                    updateRecord: true
                    table: "application"
                    fieldName: "name"
                  }
              }
              {
                actionCode: "incrementStage"
                sequence: 1
                trigger: ON_APPLICATION_CREATE
              }
              {
                actionCode: "changeStatus"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 1
                parameterQueries: { newStatus: "SUBMITTED" }
              }
              {
                actionCode: "createVerification"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 2
                parameterQueries: {
                  message: {
                    operator: "stringSubstitution"
                    children: [
                      "## Registration complete!\\n\\nThanks, %1.\\n\\nPlease log in to continue."
                      {
                        operator: "objectProperties"
                        children: ["applicationData.responses.Q1FirstName.text",""]
                      }
                    ]
                 }
                 expiry: 4 #hours
                }
              }
              {
                actionCode: "sendNotification"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 3
                parameterQueries: {
                  fromName: "Application Manager"
                  fromEmail: "no-reply@sussol.net"
                  email: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q4Email.text", ""]
                  }
                  subject: "User Registration - verify account"
                  message: {
                    operator: "stringSubstitution"
                    children: [
                      "Hi, %1,\\n\\nplease confirm your user account registration by clicking (or copy-pasting) the following link:\\n\\n%2%3"
                      {
                        operator: "objectProperties"
                        children: ["applicationData.responses.Q1FirstName.text", ""]
                      }
                      "http://localhost:3000/verify?uid=" #TO-DO: add website URL to back-end config
                      {
                        operator: "objectProperties"
                        children: ["outputCumulative.verification.unique_id"]
                      }
                    ]
                  }
                }
              }
              {
                actionCode: "modifyRecord"
                trigger: ON_VERIFICATION
                sequence: 1
                parameterQueries: {
                  tableName: "user"
                  first_name: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q1FirstName.text"]
                  }
                  last_name: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q2LastName.text"]
                  }
                  username: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q3Username.text"]
                  }
                  email: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q4Email.text"]
                  }
                  password_hash: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q5Password.hash"]
                  }
                }
              }
              {
                actionCode: "changeStatus"
                trigger: ON_VERIFICATION
                sequence: 2
                parameterQueries: { newStatus: { value: "COMPLETED" } }
              }
              {
                actionCode: "changeOutcome"
                trigger: ON_VERIFICATION
                sequence: 3
                parameterQueries: { newOutcome: { value: "APPROVED" } }
              }
              {
                actionCode: "grantPermissions"
                trigger: ON_VERIFICATION
                sequence: 4
                parameterQueries: {
                  username: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q3Username.text"]
                  }
                  permissionNames: ["applyUserEdit", "applyOrgRego"  ]
                }
              }
            ]
          }
          templatePermissionsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyUserRegistration" }
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
