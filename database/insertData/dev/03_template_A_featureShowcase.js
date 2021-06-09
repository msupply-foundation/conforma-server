/*
TEMPLATE A - General Registration (Feature showcase)
    - used to demonstrate and test features such as new plugins, actions,
      dynamic visibility, complex dynamic expressions, etc.
*/
const { coreActions, joinFilters } = require('../_helpers/core_mutations')
const { devActions } = require('../_helpers/dev_actions')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "Demo"
          name: "Demo -- Feature Showcase"
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
                      code: "Q1"
                      index: 1
                      title: "First Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      helpText: "Please fill in these **details** to the best of your ability, with as much **accuracy** as possible.\\n\\nThis application will be thoroughly **reviewed** before approval."
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
                              children: ["responses.Q1.text", ""]
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
                            "**Current User: %1 %2**"
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
                        style: "basic"
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
                          {
                            operator: "CONCAT"
                            children: [
                              {
                                operator: "objectProperties"
                                children: ["applicationData.config.serverREST"]
                              }
                              "/check-unique"
                            ]
                          }
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
                      elementTypePluginCode: "radioChoice"
                      category: QUESTION
                      helpText: "This page demonstrates some of the selectors available, and shows that both the **options** and what shows as a result of your **selection** can be **dynamically defined**"
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
                        search: true
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
                        title: "This has appeared because you typed \\"magicword\\" above."
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
                        style: "success"
                      }
                    }
                    {
                      code: "PB3"
                      index: 16
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
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
                      code: "QGraphQLTest"
                      index: 20
                      title: "GraphQL query"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Select an organisation (GraphQL query)"
                        options: {
                          operator: "graphQL",
                          children: [
                            "query getOrgs {organisations {nodes {name}}}",
                            "graphQLEndpoint",
                            [],
                            "organisations.nodes"
                          ]
                        }
                        placeholder: "Select one"
                      }
                      isRequired: false
                    }
                    {
                      code: "PB4"
                      index: 21
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "CheckboxShowcase"
                      index: 22
                      title: "Checkbox demonstration"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "## Checkbox demonstration"
                        text: "Different types and settings for Checkbox plugin"
                        style: "basic"
                      }
                    }
                    {
                      code: "CB1"
                      index: 23
                      title: "Single checkbox"
                      isRequired: false
                      elementTypePluginCode: "checkbox"
                      category: QUESTION
                      helpText: ""
                      parameters: {
                        label: "This is a single checkbox"
                        checkboxes: ["Tick me"]
                      }
                    }
                    {
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
                            {
                              value: "https://jsonplaceholder.typicode.com/users"
                            }
                            { value: [] }
                            { value: "name" }
                          ]
                        }
                      }
                    }
                    {
                      code: "Q2GraphQL"
                      index: 30
                      title: "Country code"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Country code"
                        search: true
                        options: {
                          operator: "graphQL",
                          children: [
                            "query countries { countries { code name } }"
                            "https://countries.trevorblades.com"
                            []
                            "countries"
                          ]
                        }
                        optionsDisplayProperty: "code"
                        placeholder: "Type one country code (2 digits)"
                      }
                    }
                    {
                      index: 31
                      code: "TextCountryName"
                      title: "Country Name"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: {
                          operator: "objectProperties"
                          children: [
                            "responses.Q2GraphQL.selection.name"
                            ""
                          ]
                        }
                      }
                    }
                  ]
                }
              }
              {
                code: "S2"
                title: "Section 2 - Documents"
                index: 2
                templateElementsUsingId: {
                  create: [
                    {
                      code: "DocText1"
                      index: 100
                      title: "Document Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      helpText: "This section provides a demonstration of the different ways the file upload element can be used"
                      parameters: {
                        title: "### This sections allows you to upload files"
                        text: "A demonstration of the File Upload plugin"
                        style: "info"
                      }
                    }
                    {
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
                      code: "PB10"
                      index: 102
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
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
                      code: "PB11"
                      index: 104
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
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
                      code: "PB12"
                      index: 110
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
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
              {
                code: "S3"
                title: "Section 3"
                index: 3
                templateElementsUsingId: {
                  create: [
                    {
                      code: "TextShowcase"
                      index: 0
                      title: "Text Showcase"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "## Many ways to deliver information!"
                        text: "A text info box can be presented in a number of **styles**.\\n\\n\*Please select one below*"
                        style: {
                          operator: "objectProperties"
                          children: ["responses.StyleChoice.text"]
                        }
                      }
                    }
                    {
                      code: "StyleChoice"
                      index: 1
                      title: "Selector for TextInfo showcase"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Select a style"
                        placeholder: "Select"
                        options: [
                          "none"
                          "basic"
                          "info"
                          "warning"
                          "success"
                          "positive"
                          "error"
                          "negative"
                        ]
                        default: "none"
                      }
                      isRequired: false
                    }
                    {
                      code: "PB13"
                      index: 2
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "IngredientsHeader"
                      index: 3
                      title: "Ingredients list demonstration"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      helpText: "Add items one by one to create an **Ingredients list**"
                      parameters: {
                        title: "## Ingredients list demonstration"
                        text: "List items can be displayed in **Card** or **Table** form"
                        style: "info"
                      }
                    }
                    {
                      code: "listDemo"
                      index: 4
                      title: "Ingredients List Demo"
                      elementTypePluginCode: "listBuilder"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Ingredients list"
                        createModalButtonText: "Add ingredient"
                        modalText: "## Ingredient item \\n\\nPlease enter details for **one** ingredient"
                        displayType: {
                          operator: "objectProperties"
                          children: ["responses.listDisplay.text"]
                        }
                        displayFormat: {
                          title: "\${LB1}"
                          subtitle: "\${LB2}"
                          description: "**Quantity**: \${LB4} \${LB5}  \\n**Substance present?**: \${LB3}  \\n**Type**: \${LB6}"
                        }
                        inputFields: [
                          {
                            code: "LB1"
                            title: "Substance Name"
                            elementTypePluginCode: "shortText"
                            category: QUESTION
                            parameters: { label: "Substance name" }
                            isRequired: true
                          }
                          {
                            code: "LB2"
                            title: "Complementary information"
                            elementTypePluginCode: "shortText"
                            category: QUESTION
                            parameters: { label: "Complementary information" }
                            isRequired: false
                          }
                          {
                            code: "LB3"
                            title: "Quantity"
                            elementTypePluginCode: "shortText"
                            category: QUESTION
                            validation: {
                              operator: "REGEX",
                              children: [
                                {
                                  operator: "objectProperties",
                                  children: [
                                    "responses.thisResponse"
                                  ]
                                },
                                "^[0-9.]+$"
                              ]
                            }
                            validationMessage: "Must be a number"
                            parameters: {
                              label: "Quantity"
                              description: "Enter a number and select units below"
                              maxWidth: 130
                            }
                          }
                          {
                            code: "LB4"
                            title: "Unit"
                            elementTypePluginCode: "radioChoice"
                            category: QUESTION
                            parameters: {
                              label: "Unit"
                              options: ["Milligram", "Microgram", "International Unit"]
                              hasOther: true
                            }
                          }
                          {
                            code: "LB5"
                            title: "Type"
                            elementTypePluginCode: "dropdownChoice"
                            category: QUESTION
                            parameters: {
                              label: "Type"
                              options: ["Active", "Inactive"]
                              default: 0
                            }
                          }
                          {
                            code: "LB6"
                            title: "Included"
                            elementTypePluginCode: "radioChoice"
                            category: QUESTION
                            parameters: {
                              label: "Substance present in end product"
                              options: [ "Yes", "No" ]
                              layout: "inline"
                            }
                          }
                        ]
                      }
                    }
                    {
                      code: "listDisplay"
                      index: 5
                      title: "List Display Selector"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Display style for Ingredients list"
                        placeholder: "Select"
                        options: ["cards", "table"]
                        default: "cards"
                      }
                    }
                    {
                      code: "PB14"
                      index: 6
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "searchUsers"
                      index: 7
                      title: "Search Demo (users)"
                      elementTypePluginCode: "search"
                      category: QUESTION
                      isRequired: false
                      helpText: "This page contain examples of the **Search** element. It can make API queries in response to user input and display the results, which can be selected."
                      parameters: {
                        label: "Search for users"
                        description: "Start typing to search database for usernames"
                        placeholder: "Search usernames"
                        icon: "user"
                        source: {
                          operator: "graphQL",
                          children: [
                            "query GetUsers($user: String!) { users(filter: { username: {includesInsensitive: $user } }) {nodes { username, firstName, lastName }}}",
                            "graphQLEndpoint",
                            [
                              "user"
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
                          title: "\${firstName} \${lastName}"
                          description: "\${username}"
                        }
                      }
                    }
                    {
                      code: "searchCountries"
                      index: 8
                      title: "Search Demo (countries)"
                      elementTypePluginCode: "search"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Search for countries"
                        description: "Type the two-character country code (must be CAPS sorry)"
                        placeholder: "Search countries"
                        icon: "world"
                        minCharacters: 2
                        multiSelect: true
                        source: {
                          operator: "graphQL",
                          children: [
                            "query countries($code: ID!) {country(code: $code) {name, capital, emoji, code}}",
                            "https://countries.trevorblades.com",
                            [
                              "code"
                            ],
                            {
                              operator: "objectProperties",
                              children: [
                                "search.text"
                              ]
                            },
                            "country"
                          ]
                        }
                        displayFormat: {
                          title: "\${emoji} \${name}"
                          description: "Capital: \${capital}"
                        }
                      }
                    }
                    {
                      code: "searchUC"
                      index: 9
                      title: "Search Universal Codes"
                      elementTypePluginCode: "search"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Lookup mSupply Universal Codes"
                        description: "Start typing a drug name"
                        placeholder: "Search medicines"
                        icon: "pills"
                        minCharacters: 3
                        multiSelect: true
                        source: {
                          operator: "graphQL",
                          children: [
                            "query GetEntitiesByName($search: String!) {entities (filter: { code: \\"\\" description: $search type: \\"[drug]\\" match: \\"contains\\"},offset: 0,first: 25) {data {        code,     description,        type,        uid  }, totalLength }}",
                            "https://codes.msupply.foundation:2048/graphql",
                            [
                              "search"
                            ],
                            {
                              operator: "objectProperties",
                              children: [
                                "search.text"
                              ]
                            },
                            "entities.data"
                          ]
                        }
                        displayFormat: {
                          title: "\${description}",
                          description: "Universal Code: \${code}"
                        }
                        resultFormat: {
                          title: "\${description}",
                          description: "\${code}"
                        }
                      }
                    }
                    {
                      code: "searchOrg"
                      index: 11
                      title: "Search Demo (organisations)"
                      elementTypePluginCode: "search"
                      category: QUESTION
                      isRequired: false
                      helpText: "This one has no \`displayFormat\` prop, so it falls back to a generic \\"default\\" display"
                      parameters: {
                        label: "Search for an organisation"
                        description: "Please enter the organisation's registration code (min 6 chars)"
                        placeholder: "Search organisations"
                        icon: "building"
                        minCharacters: 6
                        source: {
                          operator: "graphQL",
                          children: [
                            "query GetOrgs($registration: String!) { organisations(filter: {registration: {startsWithInsensitive: $registration}}) { nodes { name registration } } }",
                            "graphQLEndpoint",
                            [
                              "registration"
                            ],
                            {
                              operator: "objectProperties",
                              children: [
                                "search.text"
                              ]
                            },
                            "organisations.nodes"
                          ]
                        }
                        # no display format -- will use default 
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
                colour: "#1E14DB" #dark blue
                templateStageReviewLevelsUsingId: {
                  create: [{ number: 1, name: "Review" }]
                }
              }
            ]
          }
          templateCategoryToTemplateCategoryId: { connectByCode: { code: "dev" } }    
          ${joinFilters}
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
                actionCode: "modifyRecord"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 101
                parameterQueries: {
                  tableName: "user"
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
                  permissionNames: { value: ["applyOrgRego"] }
                }
              }
              # Because it is later in sequence, this Action should over-ride the Core one
              {
                actionCode: "changeStatus"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 103
                parameterQueries: {
                  newStatus: { value: "COMPLETED" }
                }
              }
              {
                actionCode: "changeOutcome"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 104
                parameterQueries: {
                  newOutcome: { value: "APPROVED" }
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
                        children: ["outputCumulative.username"]
                      }
                      {
                        operator: "objectProperties"
                        children: ["outputCumulative.newOutcome"]
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
