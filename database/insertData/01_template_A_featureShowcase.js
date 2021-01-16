/*
TEMPLATE A - General Registration (Feature showcase)
    - used to demonstrate and test features such as new plugins, actions,
      dynamic visibility, complex dynamic expressions, etc.
*/
exports.queries = [
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
]
