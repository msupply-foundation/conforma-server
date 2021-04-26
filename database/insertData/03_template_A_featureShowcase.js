/*
TEMPLATE A - General Registration (Feature showcase)
    - used to demonstrate and test features such as new plugins, actions,
      dynamic visibility, complex dynamic expressions, etc.
*/
const { coreActions } = require('./core_actions')
const { devActions } = require('./dev_actions')

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
                id: 1000
                code: "S1"
                title: "Section 1"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      id: 1000
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
                      id: 1001
                      code: "Q1"
                      index: 1
                      title: "First Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "First Name" }
                    }
                    {
                      id: 1002
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
                              children: ["responses.Q1.text", ""]
                            }
                          ]
                        }
                      }
                    }
                    {
                      id: 1003
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
                              children: ["applicationData.user.firstName"]
                            }
                            {
                              operator: "objectProperties"
                              children: ["applicationData.user.lastName", ""]
                            }
                          ]
                        }
                        text: {
                          operator: "stringSubstitution"
                          children: [
                            "The new user's name is: %1 %2"
                            {
                              operator: "objectProperties"
                              children: ["responses.Q1.text", ""]
                            }
                            {
                              operator: "objectProperties"
                              children: ["responses.Q2.text", ""]
                            }
                          ]
                        }
                      }
                    }
                    {
                      id: 1004
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
                          "http://localhost:8080/"check-unique"
                          ["type", "value"]
                          "username"
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          "unique"
                        ]
                      }
                      validationMessage: "Username must be unique"
                      parameters: { label: "Select a username" }
                    }
                    {
                      id: 1005
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
                      id: 1006
                      code: "Q5"
                      index: 6
                      title: "Password"
                      elementTypePluginCode: "password"
                      category: QUESTION
                      parameters: {
                        label: "Password"
                        placeholder: "Password must be at least 8 chars long"
                        confirmPlaceholder: "Enter password again"
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
                        validationMessageInternal: "Password must be at least 8 characters"
                      }
                    }
                    {
                      id: 1007
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
                      id: 1008
                      code: "PB1"
                      index: 8
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      id: 1009
                      code: "Q6"
                      index: 9
                      title: "Organisation Category"
                      elementTypePluginCode: "radioChoice"
                      category: QUESTION
                      parameters: {
                        label: "Organisation Type"
                        description: "_Select which type of organisation you belong to._"
                        options: ["Manufacturer", "Distributor", "Importer"]
                        validation: { value: true }
                        default: 1
                      }
                      isRequired: false
                    }
                    {
                      id: 1010
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
                      id: 1011
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
                      id: 1012
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
                      id: 1013
                      code: "Q10"
                      index: 13
                      title: "API Selection demo"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "API Lookup: Choose a name from this list"
                        placeholder: "Select"
                        search: true
                        options: {
                          operator: "API"
                          children: [
                            "https://jsonplaceholder.typicode.com/users"
                            []
                            "name"
                          ]
                        }
                      }
                      isRequired: false
                    }
                    {
                      id: 1014
                      code: "Q11"
                      index: 14
                      title: "Test Visibility"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Enter 'magicword' to see text box" }
                    }
                    {
                      id: 1015
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
                      id: 1016
                      code: "PB3"
                      index: 16
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      id: 1017
                      code: "Qradio"
                      index: 17
                      title: "Testing Radio buttons"
                      elementTypePluginCode: "radioChoice"
                      category: QUESTION
                      parameters: {
                        label: "This Radio button group has no default"
                        options: ["Option A", "Option B", "Option C"]
                        # Testing no default
                        hasOther: true
                        otherPlaceholder: "Enter other answer"
                      }
                      isRequired: true
                    }
                    {
                      id: 1018
                      code: "Q12"
                      index: 18
                      title: "Role"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "What is your role?"
                        options: ["Owner", "Supplier", "Other"]
                        placeholder: "Select one"
                        default: 1
                      }
                      isRequired: false
                    }
                    {
                      id: 1019
                      code: "Q13"
                      index: 19
                      title: "Other description"
                      elementTypePluginCode: "longText"
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
                        description: "Please use as much detail as necessary"
                      }
                    }
                    {
                      id: 1035
                      code: "Q1GraphQL"
                      index: 20
                      title: "GraphQL query"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Select a company (GraphQL query)"
                        options: {
                          operator: "graphQL",
                          children: [
                            "query getOrgs {organisations {nodes {name}}}",
                            [],
                            "organisations.nodes"
                          ]
                        }
                        placeholder: "Select one"
                      }
                      isRequired: false
                    }
                    {
                      id: 1020
                      code: "PB4"
                      index: 21
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      id: 1021
                      code: "CheckboxShowcase"
                      index: 22
                      title: "Checkbox demonstration"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "Checkbox demonstration"
                        text: "Different types and settings for Checkbox plugin"
                      }
                    }
                    {
                      id: 1022
                      code: "CB1"
                      index: 23
                      title: "Single checkbox"
                      isRequired: false
                      elementTypePluginCode: "checkbox"
                      category: QUESTION
                      parameters: {
                        label: "This is a single checkbox"
                        checkboxes: ["Tick me"]
                      }
                    }
                    {
                      id: 1023
                      code: "CB2"
                      index: 24
                      title: "Three checkboxes"
                      isRequired: false
                      elementTypePluginCode: "checkbox"
                      category: QUESTION
                      parameters: {
                        label: "Three checkboxes, one pre-selected"
                        checkboxes: [
                          { label: "Option 1", key: 0, selected: true }
                          "Option 2"
                          "Option 3"
                        ]
                      }
                    }
                    {
                      id: 1024
                      code: "CB3"
                      index: 25
                      title: "Toggle switch"
                      isRequired: false
                      elementTypePluginCode: "checkbox"
                      category: QUESTION
                      parameters: {
                        label: "Behold! a **toggle** switch:"
                        checkboxes: ["ON"]
                        type: "toggle"
                      }
                    }
                    {
                      id: 1025
                      code: "TXTON-OFF"
                      index: 26
                      title: "Checkbox ON"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: {
                          operator: "stringSubstitution"
                          children: [
                            "The switch is toggled %1"
                            {
                              operator: "?"
                              children: [
                                {
                                  operator: "="
                                  children: [
                                    {
                                      operator: "objectProperties"
                                      children: ["responses.CB3.text"]
                                    }
                                    "ON"
                                  ]
                                }
                                "ON"
                                "OFF"
                              ]
                            }
                          ]
                        }
                      }
                    }
                    {
                      id: 1026
                      code: "CB4"
                      index: 27
                      title: "Slider switch"
                      elementTypePluginCode: "checkbox"
                      category: QUESTION
                      parameters: {
                        label: "And a couple of **sliders**:"
                        checkboxes: [
                          {
                            label: "I like ice-cream"
                            text: "Ice-cream"
                            key: "Opt1"
                          }
                          { label: "I like cake", text: "Cake", key: "Opt2" }
                        ]
                        type: "slider"
                      }
                    }
                    {
                      id: 1027
                      code: "TXT_LIKE"
                      index: 28
                      title: "Display Likes"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: {
                          operator: "stringSubstitution"
                          children: [
                            "You like: %1%2"
                            {
                              operator: "?"
                              children: [
                                {
                                  operator: "objectProperties"
                                  children: ["responses.CB4.values.Opt1.selected"]
                                }
                                "\\n- Ice Cream"
                                ""
                              ]
                            }
                            {
                              operator: "?"
                              children: [
                                {
                                  operator: "objectProperties"
                                  children: ["responses.CB4.values.Opt2.selected"]
                                }
                                "\\n- Cake"
                                ""
                              ]
                            }
                          ]
                        }
                      }
                    }
                    {
                      id: 1028
                      code: "CB5"
                      index: 29
                      title: "Many checkboxes"
                      isRequired: false
                      elementTypePluginCode: "checkbox"
                      category: QUESTION
                      parameters: {
                        label: "Lotsa boxes"
                        description: "If you have a lot of checkboxes, you may wish to use \`layout: \\"inline\\"\`.  \\n_This selection is dynamically created from an online API._"
                        layout: "inline"
                        checkboxes: {
                          operator: "API"
                          children: [
                            "https://jsonplaceholder.typicode.com/users"
                            []
                            "name"
                          ]
                        }
                      }
                    }
                    {
                      index: 30
                      code: "Q2GraphQL"
                      title: "Country code"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Enter 2 letters code of a valid country"
                        description: "Check country name selected on the next field
                      }
                    }
                    {
                      index: 31
                      code: "TXT_COUNTRY"
                      title: "Country name"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: {
                          operator: "graphQL"
                          children: [
                            {
                              """query country ($code: ID!) {
                                country (code: $code) {
                                  name
                                }
                              }"""
                              'https://countries.trevorblades.com'
                              ['code']
                              {
                                operator: "objectProperties"
                                children: ["responses.Q2GraphQL.text"]
                              }
                            }
                          ]
                        }
                        visibilityCondition: {
                          operator: "!="
                          children: [
                            {
                              operator: "objectProperties"
                              children: ["responses.Q2GraphQL.text"]
                            }
                            { value: "" }
                          ]
                        }
                        validationInternal: {
                          operator: "REGEX"
                          children: [
                            {
                              operator: "objectProperties"
                              children: ["responses.thisResponse"]
                            }
                            { value: "^[\\\\S]{1,}$" }
                          ]
                        }
                        validationMessageInternal: "Country code not valid!"
                      }
                    }
                  ]
                }
              }
              {
                id: 1010
                code: "S2"
                title: "Section 2 - Documents"
                index: 2
                templateElementsUsingId: {
                  create: [
                    {
                      id: 1029
                      code: "DocText1"
                      index: 100
                      title: "Document Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "This sections allows you to upload files"
                        text: "A demonstration of the File Upload plugin"
                      }
                    }
                    {
                      id: 1030
                      code: "Q_upload1"
                      index: 101
                      title: "File upload demo 1"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      parameters: {
                        label: "Please upload your documentation"
                        description: "You can provide multiple files.  \\nFiles must be **image** files or **PDF** and under 5MB."
                        fileCountLimit: 6
                        fileExtensions: ["pdf", "png", "jpg"]
                        fileSizeLimit: 5000
                      }
                    }
                    {
                      id: 1031
                      code: "PB10"
                      index: 102
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      id: 1032
                      code: "Q_upload2"
                      index: 103
                      title: "File upload demo 2"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Please add some more files"
                        description: {
                          operator: "stringSubstitution"
                          children: [
                            "No restrictions on this one, but we're testing dynamic description:\\n\\n_The files uploaded in the last page were:_  \\n- _%1_"
                            {
                              operator: "objectProperties"
                              children: ["responses.Q_upload1.text"]
                            }
                          ]
                        }
                        fileCountLimit: 99
                      }
                    }
                    {
                      id: 1033
                      code: "PB11"
                      index: 104
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      id: 1034
                      code: "Q_upload3"
                      index: 105
                      title: "File image upload"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Please upload an image file to display"
                        description: "Only 1 file allowed, must be an image type (.jpg, .jpeg, .png, .gif, .svg) and less than 5MB"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "gif", "svg"]
                        fileSizeLimit: 5000
                      }
                    }
                    {
                      id: 1038
                      code: "Img01"
                      index: 106
                      title: "Show uploaded image"
                      elementTypePluginCode: "imageDisplay"
                      visibilityCondition: {
                        operator: "!="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.Q_upload3.text"]
                          }
                          ""
                        ]
                      }
                      category: INFORMATION
                      parameters: {
                        url: {
                          operator: "CONCAT",
                          children: [
                            {
                              operator: "objectProperties",
                              children: [
                                "applicationData.config.serverREST"
                              ]
                            }
                            {
                              operator: "objectProperties",
                              children: [
                                "responses.Q_upload3.files.fileUrl"
                              ]
                            }
                          ]
                        }
                        size: {
                          operator: "objectProperties"
                          children: ["responses.ImgOpt1.text"]
                        }
                        alignment: {
                          operator: "objectProperties"
                          children: ["responses.ImgOpt2.text"]
                        }
                        altText: "This is the image you uploaded"
                      }
                    }
                    {
                      id: 1039
                      code: "ImgOpt1"
                      index: 107
                      title: "Image size control"
                      elementTypePluginCode: "dropdownChoice"
                      visibilityCondition: {
                        operator: "!="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.Q_upload3.text"]
                          }
                          ""
                        ]
                      }
                      category: QUESTION
                      parameters: {
                        label: "Select image size"
                        default: 3
                        options: [
                          "mini"
                          "tiny"
                          "small"
                          "medium"
                          "large"
                          "big"
                          "huge"
                          "massive"
                        ]
                      }
                    }
                    {
                      id: 1040
                      code: "ImgOpt2"
                      index: 108
                      title: "Image alignment control"
                      elementTypePluginCode: "dropdownChoice"
                      visibilityCondition: {
                        operator: "!="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.Q_upload3.text"]
                          }
                          ""
                        ]
                      }
                      category: QUESTION
                      parameters: {
                        label: "Select image alignment"
                        default: 1
                        options: [
                          "left"
                          "center"
                          "right"
                        ]
                      }
                    }
                    {
                      id: 1036
                      code: "PB12"
                      index: 110
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      id: 1037
                      code: "LongText1"
                      index: 111
                      title: "LongText Demo"
                      elementTypePluginCode: "longText"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Any final comments?"
                        lines: 8
                        placeholder: "Enter here..."
                        maxLength: 101
                      }
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties",
                            children: [
                              "responses.thisResponse"
                            ]
                          }
                          "^[\\\\s\\\\S]{0,100}$"
                        ]
                      }
                      validationMessage: "Response must be less than 100 characters"
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
                templateStageReviewLevelsUsingId: {
                  create: [{ number: 1, name: "Review" }]
                }
              }
            ]
          }
          templateActionsUsingId: {
            create: [
              ${coreActions}
              ${devActions}
              {
                actionCode: "cLog"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 100
                parameterQueries: {
                  message: {
                    value: "Sequential logger -- this message should appear before new user and application approval messages."
                  }
                }
              }
              {
                actionCode: "createUser"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 101
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
                actionCode: "grantPermissions"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 102
                parameterQueries: {
                  username: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q3.text"]
                  }
                  permissionNames: { value: ["applyCompanyRego"] }
                }
              }
              # Because it is later in sequence, this Action should over-ride the Core one
              {
                actionCode: "changeStatus"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 103
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
                sequence: 104
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
                sequence: 105
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
          templatePermissionsUsingId: {
            create: [
              # Apply General
              {
                permissionNameToPermissionNameId: {
                connectByName: { name: "applyGeneral" } }
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
