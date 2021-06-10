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
          submissionMessage: "Your registration has been completed. Please follow the link sent via email to confirm."
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
                        description: "Usernames should have no spaces and lenght of 3-50 using letters, numbers or - . _"
                      }
                      validation: {
                        operator: "AND"
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
                                operator: "REGEX"
                                children: [
                                  {
                                    operator: "objectProperties"
                                    children: ["responses.thisResponse"]
                                  }
                                  "^[a-zA-Z0-9_.-]{3,50}$"
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
                            { value: "^[\\\\S]{8,}$" }
                          ]
                        }
                        # Validation:Currently just checks 8 chars, needs more complexity
                        validationMessageInternal: "Password must be at least 8 characters"
                      }
                    }
                    {
                      code: "PB1"
                      index: 70
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "S1PersonalInfo"
                      index: 80
                      title: "Section 1 - Personal information"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "### Personal information"
                        style: "none"
                      }
                    }
                    {
                      # TODO: Update to be using a DatePicker element type
                      code: "Q6DOB"
                      index: 90
                      title: "DOB"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { 
                        label: "Date of Birth"
                        description: "Format expected DD/MM/YYYY"
                        maxWidth: 150
                      }
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          "^([0]?[1-9]|[1|2][0-9]|[3][0|1])[./-]([0]?[1-9]|[1][0-2])[./-]([0-9]{4}|[0-9]{2})$"
                        ]
                      }
                      validationMessage: "Not a valid date"
                    }
                    {
                      code: "Q7NationalID"
                      index: 90
                      title: "National ID number"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "National ID number" }
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          "^[0-9()-]+$"
                        ]
                      }
                      validationMessage: "Must be a number"
                    }
                    {
                      # TODO: Update to be using a DatePicker element type
                      code: "Q8IssuedDate"
                      index: 100
                      title: "Date issued"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { 
                        label: "Date issued"
                        description: "Format expected DD/MM/YYYY"
                        maxWidth: 150
                      }
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          "^([0]?[1-9]|[1|2][0-9]|[3][0|1])[./-]([0]?[1-9]|[1][0-2])[./-]([0-9]{4}|[0-9]{2})$"
                        ]
                      }
                      validationMessage: "Not a valid date"
                    }
                    {
                      code: "PB2"
                      index: 110
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "S1BirthAddress"
                      index: 120
                      title: "Section 1 - Place of birth"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { 
                        title: "### Place of birth"
                        style: "none" 
                      }
                    }
                    {
                      code: "Q9Village"
                      index: 130
                      title: "Village"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      parameters: { label: "Village" }
                    }
                    {
                      code: "Q11District"
                      index: 150
                      title: "District"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      parameters: { label: "District/Province" }
                    }
                    {
                      code: "S1CurrentAddress"
                      index: 170
                      title: "Section 1 - Current address"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { 
                        title: "### Current address"
                        style: "none" 
                      }
                    }
                    {
                      code: "Q12Village"
                      index: 180
                      title: "Village"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      parameters: { label: "Village" }
                    }
                    {
                      code: "Q13District"
                      index: 200
                      title: "District"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      parameters: { label: "District/Province" }
                    }
                  ]
                }
              }
              {
                code: "S2"
                title: "Educational information"
                index: 1
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S2Page1"
                      index: 10
                      title: "Section 2"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { 
                        title: "### Education history"
                        style: "none" 
                      }
                    }
                    {
                      code: "Q1EducationLevel"
                      index: 20
                      title: "Organisation Category"
                      elementTypePluginCode: "radioChoice"
                      category: QUESTION
                      parameters: {
                        label: "Education Level"
                        options: ["Secondary", "University"]
                        layout: "inline"
                      }
                    }
                    {
                      code: "Q2Secondary"
                      index: 30
                      title: "Secondary"
                      elementTypePluginCode: "longText"
                      category: QUESTION
                      parameters: { label: "Please enter details for secondary"}
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.Q1EducationLevel.text"]
                          }
                          "Secondary"
                        ]
                      }
                    }
                    {
                      code: "Q3UniversityHistory"
                      index: 40
                      title: "Education List"
                      elementTypePluginCode: "listBuilder"
                      category: QUESTION
                      parameters: {
                        label: "Education history"
                        createModalButtonText: "Add to education history"
                        modalText: "## Education history entry \\n\\nPlease enter details for university"
                        displayType: "table"
                        inputFields: [
                          {
                            code: "LB1"
                            title: "Name of institution"
                            elementTypePluginCode: "shortText"
                            category: QUESTION
                            parameters: { label: "Name of institution" }
                            isRequired: true
                          }
                          {
                            code: "LB2"
                            title: "University year"
                            elementTypePluginCode: "shortText"
                            category: QUESTION
                            parameters: {
                              label: "Year of conclusion"
                              description: "Format expected YYYY"
                              maxWidth: 150
                            }
                            validation: {
                              operator: "REGEX"
                              children: [
                                {
                                  operator: "objectProperties"
                                  children: ["responses.thisResponse"]
                                }
                                "^(?:(?:18|19|20|21)[0-9]{2})$"
                              ]
                            }
                            validationMessage: "Year not between 1900-2100"
                          }
                          {
                            code: "LB3"
                            title: "University title"
                            elementTypePluginCode: "shortText"
                            category: QUESTION
                            parameters: {
                              label: "Title"
                              description: "Enter the title received by applicant"
                            }
                          }
                        ]
                      }
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.Q1EducationLevel.text"]
                          }
                          "University"
                        ]
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
                actionCode: "modifyRecord"
                trigger: ON_APPLICATION_SUBMIT
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
                  # TODO: Previously set as Date in db - changed to varchar
                  date_of_birth: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q6DOB.text"]
                  }
                  national_id: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q7NationalID.text"]
                  }
                  national_id_issued_date: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q8IssuedDate.text"]
                  }
                  birth_place_village: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q9Village.text", null]
                  }
                  birth_place_district: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q11District.text", null]
                  }
                  current_address_village: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q12Village.text", null]
                  }
                  current_address_district: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q13District.text", null]
                  }
                  education: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q1EducationLevel"]
                  }
                  secondary: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q2Secondary.text", null]
                  }
                  university_history: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q3UniversityHistory", null]
                  }
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
                sequence: 103
                parameterQueries: {
                  username: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q3Username.text"]
                  }
                  permissionNames: ["applyUserEdit"]
                }
              }
              {
                actionCode: "grantPermissions"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 4
                parameterQueries: {
                  username: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q3Username.text"]
                  }
                  permissionNames: [ "applyOrgRego" ]
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
