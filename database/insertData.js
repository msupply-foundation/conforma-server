const fetch = require('node-fetch')

const config = require('../src/config.json')

const graphQLendpoint = config.graphQLendpoint

const queries = [
  // Template A -- Test - General Registration
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "TestRego"
          name: "Test -- General Registration"
          isLinear: false
          status: AVAILABLE
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Section 1"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
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
                      code: "Q1"
                      index: 1
                      title: "First Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "First Name" }
                    }
                    {
                      code: "Q2"
                      index: 2
                      title: "Last Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "AND"
                        children: [
                          {
                            operator: "!="
                            children: [
                              {
                                operator: "objectProperties"
                                children: [{ value: { property: "Q1.text" } }]
                              }
                              { value: null }
                            ]
                          }
                          {
                            operator: "!="
                            children: [
                              {
                                operator: "objectProperties"
                                children: [{ value: { property: "Q1.text" } }]
                              }
                              { value: "" }
                            ]
                          }
                        ]
                      }
                      validationMessage: "You need a first name."
                      parameters: {
                        label: {
                          operator: "CONCAT"
                          children: [
                            {
                              operator: "objectProperties"
                              children: [{ value: { property: "Q1.text" } }]
                            }
                            ", what is your last name?"
                          ]
                        }
                      }
                    }
                    {
                      code: "Text2"
                      index: 3
                      title: "User Info"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "New User Details"
                        text: {
                          operator: "CONCAT"
                          children: [
                            "The new user's name is: "
                            {
                              operator: "objectProperties"
                              children: [{ value: { property: "Q1.text" } }]
                            }
                            " "
                            {
                              operator: "objectProperties"
                              children: [{ value: { property: "Q2.text" } }]
                            }
                          ]
                        }
                      }
                    }
                    {
                      code: "Q3"
                      index: 4
                      title: "Username"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      visibilityCondition: {
                        operator: "!="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "Q1.text" } }]
                          }
                          { value: "" }
                        ]
                      }
                      validation: {
                        operator: "API"
                        children: [
                          { value: "http://localhost:8080/check-unique" }
                          { value: ["type", "value"] }
                          { value: "username" }
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "thisResponse" } }]
                          }
                          { value: "unique" }
                        ]
                      }
                      validationMessage: "Username must be unique"
                      parameters: { label: "Select a username" }
                    }
                    {
                      code: "Q4"
                      index: 5
                      title: "Email"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "thisResponse" } }]
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
                      code: "Q5"
                      index: 6
                      title: "Password"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "thisResponse" } }]
                          }
                          { value: "^[\\\\S]{8,}$" }
                        ]
                      }
                      validationMessage: "Password must be at least 8 characters"
                      # Validation:Currently just checks 8 chars, needs more complexity
                      parameters: {
                        label: "Password"
                        maskedInput: true
                        placeholder: "Password must be at least 8 chars long"
                      }
                    }
                    {
                      code: "Q5B"
                      index: 7
                      title: "Dynamic Options demo"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Which is your favourite response?"
                        placeholder: "Select"
                        options: {
                          operator: "CONCAT"
                          type: "array"
                          children: [
                            []
                            {
                              operator: "objectProperties"
                              children: [{ value: { property: "Q1.text" } }]
                            }
                            {
                              operator: "objectProperties"
                              children: [{ value: { property: "Q2.text" } }]
                            }
                            {
                              operator: "objectProperties"
                              children: [{ value: { property: "Q3.text" } }]
                            }
                            {
                              operator: "objectProperties"
                              children: [{ value: { property: "Q4.text" } }]
                            }
                          ]
                        }
                      }
                      isRequired: false
                    }
                    {
                      code: "PB1"
                      index: 8
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "Q6"
                      index: 9
                      title: "Organisation Category"
                      elementTypePluginCode: "dropdownChoice"
                      # Change this to "radioChoice" once we've made the plugin
                      category: QUESTION
                      parameters: {
                        label: "Organisation Type"
                        description: "Select which type of organisation you belong to."
                        options: ["Manufacturer", "Distributor", "Importer"]
                        validation: { value: true }
                        default: 0
                      }
                      isRequired: false
                    }
                    {
                      code: "Q7"
                      index: 10
                      title: "Select Manufacturer"
                      elementTypePluginCode: "dropdownChoice"
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "Q6.text" } }]
                          }
                          { value: "Manufacturer" }
                        ]
                      }
                      category: QUESTION
                      parameters: {
                        label: "Select Manufacturer"
                        placeholder: "Select"
                        options: [
                          "Manufacturer A"
                          "Manufacturer B"
                          "Manufacturer C"
                        ]
                      }
                    }
                    {
                      code: "Q8"
                      index: 11
                      title: "Select Distributor"
                      elementTypePluginCode: "dropdownChoice"
                      # Remember to pass Responses object into visibilityCondition
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "Q6.text" } }]
                          }
                          { value: "Distributor" }
                        ]
                      }
                      category: QUESTION
                      parameters: {
                        label: "Select Distributor"
                        placeholder: "Select"
                        options: [
                          "Distributor A"
                          "Distributor B"
                          "Distributor C"
                        ]
                      }
                      isRequired: false
                    }
                    {
                      code: "Q9"
                      index: 12
                      title: "Select Importer"
                      elementTypePluginCode: "dropdownChoice"
                      # Remember to pass Responses object into visibilityCondition
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "Q6.text" } }]
                          }
                          { value: "Importer" }
                        ]
                      }
                      category: QUESTION
                      parameters: {
                        label: "Select Importer"
                        placeholder: "Select"
                        options: ["Importer A", "Importer B", "Importer C"]
                      }
                      isRequired: false
                    }
                    {
                      code: "Q10"
                      index: 13
                      title: "API Selection demo"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "API Lookup: Choose a name from this list"
                        placeholder: "Select"
                        options: {
                          operator: "API"
                          children: [
                            {
                              value: "https://jsonplaceholder.typicode.com/users"
                            }
                            { value: [] }
                            { value: "name" }
                          ]
                        }
                      }
                      isRequired: false
                    }
                    {
                      code: "Q11"
                      index: 14
                      title: "Test Visibility"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Enter 'magicword' to see text box" }
                    }
                    {
                      code: "TextTest"
                      index: 15
                      title: "Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "Q11.text" } }]
                          }
                          { value: "magicword" }
                        ]
                      }
                      parameters: {
                        title: "This has appeared because you typed 'magicword' above."
                        text: {
                          operator: "CONCAT"
                          children: [
                            "You chose "
                            {
                              operator: "objectProperties"
                              children: [{ value: { property: "Q10.text" } }]
                            }
                            " (index number "
                            {
                              operator: "objectProperties"
                              children: [
                                { value: { property: "Q10.optionIndex" } }
                              ]
                            }
                            ") in the API lookup"
                          ]
                        }
                      }
                    }
                    {
                      code: "PB3"
                      index: 15
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "Q12"
                      index: 16
                      title: "Role"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "What is your role?"
                        options: ["Owner", "Supplier", "Other"]
                        placeholder: "Select one"
                      }
                      isRequired: false
                    }
                    {
                      code: "Q13"
                      index: 17
                      title: "Other description"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isEditable: {
                        operator: "="
                        children: [
                          "Other"
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "Q12.text" } }]
                          }
                        ]
                      }
                      parameters: {
                        label: "If Other, please describe"
                        placeholder: "Describe your role"
                      }
                    }
                  ]
                }
              }
            ]
          }
          templateStagesUsingId: { create: [{ number: 1, title: "Automatic" }] }
          templateActionsUsingId: {
            create: [
              {
                actionCode: "incrementStage"
                trigger: ON_APPLICATION_CREATE
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: [{ value: { property: "applicationId" } }]
                  }
                }
              }
              {
                actionCode: "cLog"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 1
                parameterQueries: {
                  message: {
                    value: "Sequential logger -- this message should appear before new user and application approval messages."
                  }
                }
              }
              {
                actionCode: "createUser"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 2
                parameterQueries: {
                  first_name: {
                    operator: "objectProperties"
                    children: [{ value: { property: "responses.Q1.text" } }]
                  }
                  last_name: {
                    operator: "objectProperties"
                    children: [{ value: { property: "responses.Q2.text" } }]
                  }
                  username: {
                    operator: "objectProperties"
                    children: [{ value: { property: "responses.Q3.text" } }]
                  }
                  password_hash: {
                    operator: "objectProperties"
                    children: [{ value: { property: "responses.Q5.text" } }]
                  }
                  email: {
                    operator: "objectProperties"
                    children: [{ value: { property: "responses.Q4.text" } }]
                  }
                }
              }
              {
                actionCode: "grantPermissions"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 3
                parameterQueries: {
                  username: {
                    operator: "objectProperties"
                    children: [{ value: { property: "responses.Q3.text" } }]
                  }
                  permissionNames: { value: ["applyCompanyRego"] }
                }
              }
              {
                actionCode: "changeStatus"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 4
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: [{ value: { property: "applicationId" } }]
                  }
                  newStatus: { value: "Completed" }
                }
              }
              {
                actionCode: "changeOutcome"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 5
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: [{ value: { property: "applicationId" } }]
                  }
                  newOutcome: { value: "Approved" }
                }
              }
              {
                actionCode: "cLog"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 6
                parameterQueries: {
                  message: {
                    operator: "CONCAT"
                    children: [
                      { value: "Output concatenation: The user " }
                      {
                        operator: "objectProperties"
                        children: [
                          { value: { objectIndex: 1, property: "username" } }
                        ]
                      }
                      { value: "'s registration has been " }
                      {
                        operator: "objectProperties"
                        children: [
                          { value: { objectIndex: 1, property: "newOutcome" } }
                        ]
                      }
                    ]
                  }
                }
              }
              {
                actionCode: "cLog"
                condition: { value: true }
                trigger: ON_APPLICATION_SUBMIT
                parameterQueries: {
                  message: {
                    value: "Testing parallel actions -- This message is Asynchronous. \\nEven though it is last in the Actions list, it'll probably appear first."
                  }
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
            templateElementsBySectionId {
              nodes {
                code
                visibilityCondition
                parameters
                title
                category
              }
            }
          }
        }
      }
    }
  }`,
  // Template B - Company Registration
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "CompRego1"
          name: "Company Registration"
          isLinear: false
          status: AVAILABLE
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Section 1"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S1T1"
                      index: 0
                      title: "Intro Section 1 - Page 1/2"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "Company details"
                        text: "The details entered should match with your registered company documents attached."
                      }
                    }
                    {
                      code: "S1Q1"
                      index: 1
                      title: "Organisation Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "thisResponse" } }]
                          }
                          { value: ".+" }
                        ]
                      }
                      # Validation TO-DO: must be unique in system
                      validationMessage: "Cannot be blank"
                      parameters: { label: "Unique Name for Company" }
                    }
                    {
                      code: "S1Q2"
                      index: 2
                      title: "Organisation Activity"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Select type of activity"
                        options: ["Manufacturer", "Importer", "Producer"]
                      }
                    }
                    {
                      code: "S1PB1"
                      index: 3
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "S1T2"
                      index: 4
                      title: "Intro Section 1 - Page 2/2"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { title: "Company nationality" }
                    }
                    {
                      code: "S1Q3"
                      index: 5
                      title: "Organisation national or international"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Select the nationality of this company:"
                        options: ["National", "International"]
                      }
                    }
                    {
                      code: "S1Q4"
                      index: 6
                      title: "Import permit upload"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "S1Q3.text" } }]
                          }
                          { value: "International" }
                        ]
                      }
                      parameters: { label: "Upload your valid import permit" }
                      isRequired: false
                    }
                  ]
                }
              }
              {
                code: "S2"
                title: "Section 2"
                index: 1
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S2T1"
                      index: 0
                      title: "Intro Section 2 - Page 1/2"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { label: "Company location" }
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "S1Q3.text" } }]
                          }
                          { value: "National" }
                        ]
                      }
                    }
                    {
                      code: "S2Q1"
                      index: 1
                      title: "Organisation Street"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "thisResponse" } }]
                          }
                          { value: ".+" }
                        ]
                      }
                      validationMessage: "Cannot be blank"
                      parameters: { label: "Enter the company street" }
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "S1Q3.text" } }]
                          }
                          { value: "National" }
                        ]
                      }
                    }
                    {
                      code: "S2Q2"
                      index: 2
                      title: "Organisation region"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "thisResponse" } }]
                          }
                          { value: ".+" }
                        ]
                      }
                      validationMessage: "Cannot be blank"
                      parameters: { label: "Enter the company region" }
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "S1Q3.text" } }]
                          }
                          { value: "National" }
                        ]
                      }
                    }
                    {
                      code: "S2PB1"
                      index: 3
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "S2T2"
                      index: 4
                      title: "Intro Section 2 - Page 2/2"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { title: "Company bank account" }
                    }
                    {
                      code: "S2Q3"
                      index: 5
                      title: "Billing account"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "thisResponse" } }]
                          }
                          { value: ".+" }
                        ]
                      }
                      validationMessage: "Cannot be blank"
                      parameters: { label: "Enter the company billing account" }
                    }
                    {
                      code: "S2Q4"
                      index: 4
                      title: "Name of account"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "thisResponse" } }]
                          }
                          { value: ".+" }
                        ]
                      }
                      validationMessage: "Cannot be blank"
                      parameters: { label: "Enter the company acount name" }
                    }
                  ]
                }
              }
              {
                code: "S3"
                title: "Section 3"
                index: 2
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S3T1"
                      index: 0
                      title: "Intro Section 1 - Page 1/1"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { title: "Company staff details" }
                    }
                    {
                      code: "S3Q1"
                      index: 0
                      title: "Organisation Size"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "What is the size of the organization"
                        options: ["Small", "Medium", "Large"]
                      }
                      isRequired: false
                    }
                  ]
                }
              }
            ]
          }
          templateStagesUsingId: {
            create: [
              { number: 1, title: "Screening" }
              { number: 2, title: "Assessment" }
            ]
          }
          templateActionsUsingId: {
            create: [
              {
                actionCode: "incrementStage"
                trigger: ON_APPLICATION_CREATE
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: [{ value: { property: "record_id" } }]
                  }
                }
              }
              {
                actionCode: "cLog"
                trigger: ON_APPLICATION_SUBMIT
                parameterQueries: {
                  message: { value: "Company Registration submission" }
                }
              }
              {
                actionCode: "changeStatus"
                trigger: ON_APPLICATION_SUBMIT
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: [{ value: { property: "record_id" } }]
                  }
                  newStatus: { value: "Submitted" }
                }
              }
              # TO-DO: Create actions to add Org, etc.
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
            templateElementsBySectionId {
              nodes {
                code
                visibilityCondition
                parameters
                title
                category
              }
            }
          }
        }
      }
    }
  }`,
  // Template C -- ACTUAL user registration form
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "UserRegistration"
          name: "User Registration"
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
                      parameters: {
                        title: "Create a user account"
                        text: "Please fill in your details to **register** for a user account."
                      }
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
                            children: [{ value: { property: "thisResponse" } }]
                          }
                          { value: ".+" }
                        ]
                      }
                      validationMessage: "First name must not be blank"
                      parameters: { label: "First Name" }
                    }
                    {
                      code: "Q2"
                      index: 2
                      title: "Last Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Last Name" }
                    }
                    {
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
                            children: [{ value: { property: "thisResponse" } }]
                          }
                          { value: "unique" }
                        ]
                      }
                      validationMessage: "Username must be unique"
                      parameters: { label: "Select a username" }
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
                            children: [{ value: { property: "thisResponse" } }]
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
                      code: "Q5"
                      index: 5
                      title: "Password"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "thisResponse" } }]
                          }
                          { value: "^[\\\\S]{8,}$" }
                        ]
                      }
                      validationMessage: "Password must be at least 8 characters"
                      # Validation:Currently just checks 8 chars, needs more complexity
                      parameters: {
                        label: "Password"
                        maskedInput: true
                        placeholder: "Password must be at least 8 chars long"
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
              {
                actionCode: "incrementStage"
                trigger: ON_APPLICATION_CREATE
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: [{ value: { property: "applicationId" } }]
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
                    children: [{ value: { property: "responses.Q1.text" } }]
                  }
                  last_name: {
                    operator: "objectProperties"
                    children: [{ value: { property: "responses.Q2.text" } }]
                  }
                  username: {
                    operator: "objectProperties"
                    children: [{ value: { property: "responses.Q3.text" } }]
                  }
                  password_hash: {
                    operator: "objectProperties"
                    children: [{ value: { property: "responses.Q5.text" } }]
                  }
                  email: {
                    operator: "objectProperties"
                    children: [{ value: { property: "responses.Q4.text" } }]
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
                    children: [{ value: { property: "applicationId" } }]
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
                    children: [{ value: { property: "applicationId" } }]
                  }
                  newOutcome: { value: "Approved" }
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
            templateElementsBySectionId {
              nodes {
                code
                visibilityCondition
                parameters
                title
                category
              }
            }
          }
        }
      }
    }
  }`,
  // Simple template for testing Review process
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "ReviewTest"
          name: "Test -- Review Process"
          status: AVAILABLE
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Personal Info"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      code: "Text1"
                      index: 0
                      title: "Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require your **personal information**"
                      }
                    }
                    {
                      code: "Q1"
                      index: 1
                      title: "First Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "First Name" }
                    }
                    {
                      code: "Q2"
                      index: 2
                      title: "Last Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Last Name" }
                    }
                    {
                      code: "Q3"
                      index: 3
                      title: "Email"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "thisResponse" } }]
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
                      code: "PB1"
                      index: 4
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "Q4"
                      index: 5
                      title: "Age"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "thisResponse" } }]
                          }
                          { value: "^[0-9]+$" }
                        ]
                      }
                      validationMessage: "Response must be a number"
                      parameters: { label: "Age" }
                    }
                    {
                      code: "Q5"
                      index: 6
                      title: "Nationality"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Nationality"
                        placeholder: "Enter a country"
                      }
                    }
                  ]
                }
              }
              {
                code: "S2"
                title: "Product Info"
                index: 1
                templateElementsUsingId: {
                  create: [
                    {
                      code: "Text2"
                      index: 0
                      title: "Product Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require your **PRODUCT information**"
                      }
                    }
                    {
                      code: "Q20"
                      index: 1
                      title: "Product Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Name of Product" }
                    }
                    {
                      code: "Q21"
                      index: 2
                      title: "Product Type"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "What type of product are you registering?"
                        placeholder: "Select"
                        options: ["Medicine", "Natural Product"]
                      }
                    }
                    {
                      code: "PB2"
                      index: 3
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "Q22"
                      index: 4
                      title: "Dose Size"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Size of single dose"
                        placeholder: "Metric units please"
                      }
                    }
                    {
                      code: "Q23"
                      index: 5
                      title: "Packet Size"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "thisResponse" } }]
                          }
                          { value: "^[0-9]+$" }
                        ]
                      }
                      validationMessage: "Must be a number"
                      parameters: {
                        label: "How many doses per packet?"
                        placeholder: "Whole number"
                      }
                    }
                    {
                      code: "Q24"
                      index: 6
                      title: "Side Effects"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      parameters: { label: "Please list any side effects" }
                    }
                  ]
                }
              }
            ]
          }
          templateStagesUsingId: {
            create: [
              { number: 1, title: "Screening" }
              { number: 2, title: "Assessment" }
            ]
          }
          templateActionsUsingId: {
            create: [
              {
                actionCode: "incrementStage"
                trigger: ON_APPLICATION_CREATE
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: [{ value: { property: "applicationId" } }]
                  }
                }
              }
              {
                actionCode: "changeStatus"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 1
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: [{ value: { property: "applicationId" } }]
                  }
                  newStatus: { value: "Submitted" }
                }
              }
              {
                actionCode: "cLog"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 2
                parameterQueries: { message: "Application Submitted" }
              }
              {
                actionCode: "changeStatus"
                trigger: ON_REVIEW_CREATE
                parameterQueries: {
                  reviewId: {
                    operator: "objectProperties"
                    children: [{ value: { property: "record_id" } }]
                  }
                  newStatus: { value: "Draft" }
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
            templateElementsBySectionId {
              nodes {
                code
                visibilityCondition
                parameters
                title
                category
              }
            }
          }
        }
      }
    }
  }`,
  //   Add some users
  `mutation {
        createUser(
          input: {
            user: { email: "nicole@sussol.net", passwordHash: "7110EDA4D09E062AA5E4A390B0A572AC0D2C0220", username: "nmadruga" }
          }
        ) {
          user {
            email
            passwordHash
            username
          }
        }
      }`,
  `mutation {
    createUser(
      input: {
        user: { email: "carl@sussol.net", passwordHash: "7110EDA4D09E062AA5E4A390B0A572AC0D2C0220", username: "carl",
        firstName: "Carl", lastName: "Smith"
        dateOfBirth: "1976-12-23" }
      }
    ) {
      user {
        email
        passwordHash
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: { email: "andrei@sussol.net", passwordHash: "7110EDA4D09E062AA5E4A390B0A572AC0D2C0220", username: "andrei" }
      }
    ) {
      user {
        email
        passwordHash
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: { email: "valerio@nra.org", passwordHash: "7110EDA4D09E062AA5E4A390B0A572AC0D2C0220", username: "valerio" }
      }
    ) {
      user {
        email
        passwordHash
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: { email: "js@nowhere.com", passwordHash: "123456", username: "js",
        firstName: "John", lastName: "Smith"
       }
      }
    ) {
      user {
        email
        passwordHash
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: { email: "reviewer@sussol.net", passwordHash: "1234", username: "testReviewer",
        firstName: "Mr", lastName: "Reviewer" }
      }
    ) {
      user {
        email
        passwordHash
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: { email: "assigner@sussol.net", passwordHash: "1234", username: "testAssigner",
        firstName: "Ms", lastName: "Assigner" }
      }
    ) {
      user {
        email
        passwordHash
        username
      }
    }
  }`,
  //   Add some organisations
  `mutation {
    createOrganisation(
      input: {
        organisation: {
          address: "123 Nowhere St\\nAuckland"
          licenceNumber: "XYZ1234"
          name: "Drugs-R-Us"
        }
      }
    ) {
      organisation {
        name
      }
    }
  }`,
  `mutation {
    createOrganisation(
      input: {
        organisation: {
          address: "Queen St\\nAuckland"
          licenceNumber: "ABC1982"
          name: "Medicinal Importers, Ltd."
        }
      }
    ) {
      organisation {
        name
      }
    }
  }`,
  `mutation {
    createOrganisation(
      input: {
        organisation: {
          address: "West Auckland"
          licenceNumber: "XXX8798"
          name: "Drug Dealers West"
        }
      }
    ) {
      organisation {
        name
      }
    }
  }`,
  `mutation {
    createOrganisation(
      input: {
        organisation: {
          address: "1 Downtown Drive\\nAuckland"
          licenceNumber: "QRS9999"
          name: "Lab Facilities Inc."
        }
      }
    ) {
      organisation {
        name
      }
    }
  }`,
  //   User registration application 1
  `mutation {
    createApplication(
      input: {
        application: {
          name: "User Registration: Craig Drown"
          serial: "100"
          isActive: true
          outcome: PENDING
          applicationSectionsUsingId: { create: { templateSectionId: 1 } }
          applicationResponsesUsingId: {
            create: [
              {
                value: { text: "Craig" }
                templateElementToTemplateElementId: { connectById: { id: 2 } }
              }
              {
                value: { text: "Drown" }
                templateElementToTemplateElementId: { connectById: { id: 3 } }
              }
              {
                value: { text: "c_drown" }
                templateElementToTemplateElementId: { connectById: { id: 4 } }
              }
              {
                value: { text: "craig@sussol.net" }
                templateElementToTemplateElementId: { connectById: { id: 5 } }
              }
              {
                value: { text: "7110EDA4D09E062AA5E4A390B0A572AC0D2C0220" }
                templateElementToTemplateElementId: { connectById: { id: 6 } }
              }
              {
                value: { optionIndex: 0, text: "Manufacturer" }
                templateElementToTemplateElementId: { connectById: { id: 8 } }
              }
              {
                value: { optionIndex: 1, text: "Manufacturer B" }
                templateElementToTemplateElementId: { connectById: { id: 9 } }
              }
            ]
          }
          applicationStageHistoriesUsingId: {
            create: {
              templateStageToStageId: { connectById: { id: 1 } }
              timeCreated: "NOW()"
              isCurrent: true
              applicationStatusHistoriesUsingId: {
                create: {
                  status: DRAFT
                  timeCreated: "NOW()"
                  isCurrent: true
                }
              }
            }
          }
          templateToTemplateId: { connectById: { id: 1 } }
        }
      }
    ) {
      application {
        name
        template {
          name
        }
        applicationResponses {
          nodes {
            value
            templateElement {
              title
            }
          }
        }
        applicationSections {
          nodes {
            templateSection {
              title
            }
          }
        }
        applicationStageHistories {
          nodes {
            stage {
              title
            }
            isCurrent
            applicationStatusHistories {
              nodes {
                isCurrent
                status
              }
            }
          }
        }
      }
    }
  }`,
  // User Registration application 2
  `mutation {
    createApplication(
      input: {
        application: {
          name: "User Registration: Carl Smith"
          serial: "101"
          isActive: true
          outcome: APPROVED
          userToUserId: { connectById: { id: 2 } }
          applicationSectionsUsingId: {
            create: { templateSectionId: 1 }
          }
          applicationResponsesUsingId: {
            create: [
              {
                  value: { text: "Carl" }
                  templateElementToTemplateElementId: { connectById: { id: 2 } }
                }
                {
                  value: { text: "Smith" }
                  templateElementToTemplateElementId: { connectById: { id: 3 } }
                }
                {
                  value: { text: "cjsmith" }
                  templateElementToTemplateElementId: { connectById: { id: 4 } }
                }
                {
                  value: { text: "carl@sussol.net" }
                  templateElementToTemplateElementId: { connectById: { id: 5 } }
                }
                {
                  value: { text: "7110EDA4D09E062AA5E4A390B0A572AC0D2C0220" }
                  templateElementToTemplateElementId: { connectById: { id: 6 } }
                }
                {
                  value: { optionIndex: 0, text: "Importer" }
                  templateElementToTemplateElementId: { connectById: { id: 8 } }
                }
                {
                  value: { optionIndex: 1, text: "Importer A" }
                  templateElementToTemplateElementId: { connectById: { id: 9 } }
                }
            ]
          }
          applicationStageHistoriesUsingId: {
            create: {
              templateStageToStageId: { connectById: { id: 1 } }
              timeCreated: "NOW()"
              isCurrent: true
              applicationStatusHistoriesUsingId: {
                create: {
                  status: COMPLETED
                  timeCreated: "NOW()"
                  isCurrent: true
                }
              }
            }
          }
          templateToTemplateId: { connectById: { id: 1 } }
        }
      }
    ) {
      application {
        name
        template {
          name
        }
        applicationResponses {
          nodes {
            value
            templateElement {
              title
            }
          }
        }
        applicationSections {
          nodes {
            templateSection {
              title
            }
          }
        }
        applicationStageHistories {
          nodes {
            stage {
              title
            }
            isCurrent
            applicationStatusHistories {
              nodes {
                isCurrent
                status
              }
            }
          }
        }
        user {
          username
        }
      }
    }
  }`,
  // Company registration application
  `mutation {
    createApplication(
      input: {
        application: {
          name: "Company Registration: Company C"
          serial: "102"
          isActive: true
          outcome: PENDING
          userToUserId: { connectById: { id: 2 } }
          applicationSectionsUsingId: {
            create: [
              { templateSectionId: 2 }
              { templateSectionId: 3 }
              { templateSectionId: 4 }
            ]
          }
          applicationResponsesUsingId: {
            create: [
              {
                value: {text: "Company C"}
                templateElementToTemplateElementId: { connectById: { id: 12 } }
              }
              {
                value: {option: 2}
                templateElementToTemplateElementId: { connectById: { id: 13 } }
              }
            ]
          }
          templateId: 2
        }
      }
    ) {
      application {
        name
        template {
          name
        }
        applicationResponses {
          nodes {
            value
            templateElement {
              title
            }
          }
        }
        applicationSections {
          nodes {
            templateSection {
              title
            }
          }
        }
        user {
          username
        }
      }
    }
  }`,
  // Application for Review Testing
  `mutation ReviewTestApplication {
    createApplication(
      input: {
        application: {
          serial: "12345"
          applicationSectionsUsingId: {
            create: [{ templateSectionId: 6 }, { templateSectionId: 7 }]
          }
          name: "Test Review -- Vitamin C"
          outcome: PENDING
          templateId: 4
          userId: 5
          applicationStageHistoriesUsingId: {
            create: {
              isCurrent: true
              templateStageToStageId: { connectById: { id: 5 } }
              applicationStatusHistoriesUsingId: {
                create: { isCurrent: true, status: SUBMITTED }
              }
            }
          }
          applicationResponsesUsingId: {
            create: [
              { isValid: null, value: null, templateElementId: 39 }
              { isValid: true, templateElementId: 40, value: { text: "John" } }
              { isValid: true, templateElementId: 41, value: { text: "Smith" } }
              {
                isValid: true
                templateElementId: 42
                value: { text: "js@nowhere.com" }
              }
              { isValid: null, value: null, templateElementId: 43 }
              { isValid: true, templateElementId: 44, value: { text: "39" } }
              {
                isValid: true
                templateElementId: 45
                value: { text: "New Zealand" }
              }
              { isValid: null, value: null, templateElementId: 46 }
              {
                isValid: true
                templateElementId: 47
                value: { text: "Vitamin C" }
              }
              {
                isValid: true
                templateElementId: 48
                value: { text: "Natural Product", optionIndex: 1 }
              }
              { isValid: null, value: null, templateElementId: 49 }
              { isValid: true, templateElementId: 50, value: { text: "50mg" } }
              { isValid: true, templateElementId: 51, value: { text: "100" } }
              {
                isValid: true
                templateElementId: 52
                value: { text: "Turning orange" }
              }
            ]
          }
        }
      }
    ) {
      application {
        name
      }
    }
  }`,
  // Assign above application to reviewer (all questions)
  `mutation {
    createReviewAssignment(
      input: {
        reviewAssignment: {
          applicationId: 4
          assignerId: 7
          reviewerId: 6
          stageId: 5
          reviewQuestionAssignmentsUsingId: {
            create: [
              { templateElementId: 43 }
              { templateElementId: 44 }
              { templateElementId: 45 }
              { templateElementId: 47 }
              { templateElementId: 48 }
              { templateElementId: 49 }
              { templateElementId: 50 }
              { templateElementId: 51 }
              { templateElementId: 53 }
              { templateElementId: 54 }
              { templateElementId: 55 }
            ]
          }
        }
      }
    ) {
      reviewAssignment {
        application {
          name
        }
      }
    }
  }`,
  // Non Registered User Permissions
  `mutation {
    createUser(
      input: {
        user: {
          email: ""
          passwordHash: ""
          username: "nonRegistered"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  create: {
                    name: "applyUserRegistration"
                    templatePermissionsUsingId: { create: [{ templateId: 1 }] }
                    permissionPolicyToPermissionPolicyId: {
                      create: { type: APPLY, name: "oneTimeApply" }
                    }
                  }
                }
              }
            ]
          }
        }
      }
    ) {
      user {
        id
        permissionJoins {
          nodes {
            id
            permissionName {
              name
              id
              permissionPolicy {
                type
                id
              }
              templatePermissions {
                nodes {
                  template {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`, // Registered User Permissions
  `
  mutation {
    createPermissionPolicy(
      input: {
        permissionPolicy: {
          name: "basicApply"
          permissionNamesUsingId: {
            create: {
              name: "applyCompanyRego"
              templatePermissionsUsingId: { create: { templateId: 2 } }
              permissionJoinsUsingId: {
                create: [
                  { userId: 1 }
                  { userId: 2 }
                  { userId: 3 }
                  { userId: 4 }
                ]
              }
            }
          }
          type: APPLY
        }
      }
    ) {
      clientMutationId
      permissionPolicy {
        name
        type
        permissionNames {
          nodes {
            name
            id
            permissionJoins {
              nodes {
                id
                user {
                  username
                  id
                }
              }
            }
          }
        }
        id
      }
    }
  }
`, // Extra user with multiple permissions (apply company rego, review company rego and apply user rego)
  `
mutation MyMutation {
  createUser(
    input: {
      user: {
        username: "userWithMultiplePermissions"
        passwordHash: "somehashofpassword"
        permissionJoinsUsingId: {
          create: [
            { permissionNameId: 1 }
            { permissionNameId: 2 }
            {
              permissionNameToPermissionNameId: {
                create: {
                  name: "reviewCompanyRego"
                  templatePermissionsUsingId: { create: [{ templateId: 2 }] }
                  permissionPolicyToPermissionPolicyId: {
                    create: { type: REVIEW, name: "basicReview" }
                  }
                }
              }
            }
          ]
        }
      }
    }
  ) {
    user {
      username
      id
      permissionJoins {
        nodes {
          id
          permissionName {
            id
            name
            permissionPolicy {
              name
              type
              id
            }
            templatePermissions {
              nodes {
                id
                template {
                  name
                  id
                }
              }
            }
          }
        }
      }
    }
  }
}
`,
]

const loopQueries = async () => {
  for (let i = 0; i < queries.length; i++) {
    const res = await fetch(graphQLendpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: queries[i],
      }),
    })
    const data = await res.json()
    console.log('Added to database:', JSON.stringify(data))
  }
}

loopQueries()
