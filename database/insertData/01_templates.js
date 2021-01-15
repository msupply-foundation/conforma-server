exports.graphQLQueries = [
  // Template A -- Test - General Registration (Feature showcase)
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "TestRego"
          name: "Test -- General Registration"
          isLinear: false
          startMessage: {
            operator: "stringSubstitution"
            children: [
              "## This is the general registration for feature showcase\\nHi, %1. You will need to provide:\\n- Proof of identity (Passport, Drivers license)\\n- Proof of your medical certification\\n- Drug ingredient list\\n- Product images\\n- Packging images"
              {
                operator: "objectProperties"
                children: ["currentUser.firstName"]
              }
            ]
          }
          submissionMessage: {
            operator: "stringSubstitution"
            children: [
              "### Application Submitted!\\nThanks, %1."
              {
                operator: "objectProperties"
                children: ["currentUser.firstName"]
              }
            ]
          }
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
                                children: ["responses.Q1.text"]
                              }
                              { value: null }
                            ]
                          }
                          {
                            operator: "!="
                            children: [
                              {
                                operator: "objectProperties"
                                children: ["responses.Q1.text"]
                              }
                              { value: "" }
                            ]
                          }
                        ]
                      }
                      validationMessage: "You need a first name."
                      parameters: {
                        label: {
                          operator: "stringSubstitution"
                          children: [
                            "%1, what is your last name?"
                            {
                              operator: "objectProperties"
                              children: ["responses.Q1.text"]
                            }
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
                        title: {
                          operator: "stringSubstitution"
                          children: [
                            "Current User: %1 %2"
                            {
                              operator: "objectProperties"
                              children: ["currentUser.firstName"]
                            }
                            {
                              operator: "objectProperties"
                              children: ["currentUser.lastName"]
                            }
                          ]
                        }
                        text: {
                          operator: "stringSubstitution"
                          children: [
                            "The new user's name is: %1 %2"
                            {
                              operator: "objectProperties"
                              children: ["responses.Q1.text"]
                            }
                            {
                              operator: "objectProperties"
                              children: ["responses.Q2.text"]
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
                            children: ["responses.Q1.text"]
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
                            children: ["responses.thisResponse"]
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
                            children: ["responses.thisResponse"]
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
                            {
                              operator: "objectProperties"
                              children: ["responses.Q1.text"]
                            }
                            {
                              operator: "objectProperties"
                              children: ["responses.Q2.text"]
                            }
                            {
                              operator: "objectProperties"
                              children: ["responses.Q3.text"]
                            }
                            {
                              operator: "objectProperties"
                              children: ["responses.Q4.text"]
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
                            children: ["responses.Q6.text"]
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
                            children: ["responses.Q6.text"]
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
                            children: ["responses.Q6.text"]
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
                            children: ["responses.Q11.text"]
                          }
                          { value: "magicword" }
                        ]
                      }
                      parameters: {
                        title: "This has appeared because you typed 'magicword' above."
                        text: {
                          operator: "stringSubstitution"
                          children: [
                            "You chose %1 (index number %2) in the API lookup"
                            {
                              operator: "objectProperties"
                              children: ["responses.Q10.text"]
                            }
                            {
                              operator: "objectProperties"
                              children: ["responses.Q10.optionIndex"]
                            }
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
                            children: ["responses.Q12.text"]
                          }
                        ]
                      }
                      isRequired: false
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
          templateStagesUsingId: {
            create: [
              {
                number: 1
                title: "Automatic"
                description: "Please check your email to confirm your account."
              }
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
                    children: ["applicationData.applicationId"]
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
                  password_hash: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q5.text"]
                  }
                  email: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q4.text"]
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
                    children: ["applicationData.responses.Q3.text"]
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
                    children: ["applicationData.applicationId"]
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
                    children: ["applicationData.applicationId"]
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
                    operator: "stringSubstitution"
                    children: [
                      "Output concatenation: The user %1's registration has been %2"
                      {
                        operator: "objectProperties"
                        children: ["output.username"]
                      }
                      {
                        operator: "objectProperties"
                        children: ["output.newOutcome"]
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
          startMessage: "## You will need the following documents ready for upload\\n- Proof of Company name\\n- Proof of company address\\n- Bank account statement"
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
                            children: ["responses.thisResponse"]
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
                            children: ["responses.S1Q3.text"]
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
                      parameters: { title: "Company location" }
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.S1Q3.text"]
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
                            children: ["responses.thisResponse"]
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
                            children: ["responses.S1Q3.text"]
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
                            children: ["responses.thisResponse"]
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
                            children: ["responses.S1Q3.text"]
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
                            children: ["responses.thisResponse"]
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
                            children: ["responses.thisResponse"]
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
              { 
                number: 1
                title: "Screening"
                description: "This application will go through the Screening stage before it can be accessed."
              }
              { 
                number: 2
                title: "Assessment"
                description: "This phase is where your documents will be revised before the application can get the final approval."
              }
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
                    children: ["applicationData.record_id"]
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
                    children: ["applicationData.record_id"]
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
          submissionMessage: "Your registration has been completed. Please follow the link sent via email to confirm."
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
                            children: ["responses.thisResponse"]
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
                            children: ["responses.thisResponse"]
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
                            children: ["responses.thisResponse"]
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
          templateStagesUsingId: { 
            create: [
              { 
                number: 1
                title: "Automatic"
              }
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
                  password_hash: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q5.text"]
                  }
                  email: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q4.text"]
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
                            children: ["responses.thisResponse"]
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
                            children: ["responses.thisResponse"]
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
              { 
                number: 1
                title: "Screening"
                description: "This application will go through the Screening stage before it can be accessed."
              }
              { 
                number: 2
                title: "Assessment"
                description: "This phase is where your documents will be revised before the application can get the final approval."
              }
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
                    children: ["applicationData.applicationId"]
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
                    children: ["applicationData.applicationId"]
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
                    children: ["applicationData.record_id"]
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
]
