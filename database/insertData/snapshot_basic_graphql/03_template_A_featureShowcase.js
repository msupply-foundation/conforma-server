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
          namePlural: "Demo -- Feature Showcases"
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
                title: "Section 1 - Basics"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      code: "Q1"
                      index: 0
                      title: "First Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      helpText: "Markdown text can be added to questions with tips to users about important **details**"
                      parameters: { label: "First Name" }
                    }
                    {
                      code: "Q2"
                      index: 1
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
                      isRequired: false
                    }
                    {
                      code: "Text1"
                      index: 2
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
                      index: 3
                      title: "LongText Demo"
                      elementTypePluginCode: "longText"
                      category: QUESTION
                      isRequired: false
                      helpText: "Try entering more than 100 characters to see validation message!"
                      parameters: {
                        label: "Description"
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
                    {
                      code: "Q4"
                      index: 4
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
                      isRequired: false
                    }
                    {
                      code: "PB1"
                      index: 5
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "Text2"
                      index: 6
                      title: "Page2"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "### This page demonstrates selectors options"
                        text: "Shows other selectors as a result of your **selection** which can be **dynamically defined**"
                      }
                    }
                    {
                      code: "Q5"
                      index: 7
                      title: "Organisation Category"
                      elementTypePluginCode: "radioChoice"
                      category: QUESTION
                      helpText: "Next displayed specific dropdown showing based on selection to pick one specific from a static list"
                      parameters: {
                        label: "Organisation Type"
                        description: "_Select which type of organisation you belong to._"
                        options: ["Manufacturer", "Distributor", "Importer"]
                        validation: { value: true }
                      }
                      isRequired: false
                    }
                    {
                      code: "Q6"
                      index: 8
                      title: "Select Manufacturer"
                      elementTypePluginCode: "dropdownChoice"
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.Q5.text"]
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
                      code: "Q7"
                      index: 9
                      title: "Select Distributor"
                      elementTypePluginCode: "dropdownChoice"
                      # Remember to pass Responses object into visibilityCondition
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.Q5.text"]
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
                    }
                    {
                      code: "Q8"
                      index: 10
                      title: "Select Importer"
                      elementTypePluginCode: "dropdownChoice"
                      # Remember to pass Responses object into visibilityCondition
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.Q5.text"]
                          }
                          { value: "Importer" }
                        ]
                      }
                      category: QUESTION
                      parameters: {
                        label: "Select Importer"
                        placeholder: "Select"
                        options: [
                          "Importer A"
                          "Importer B"
                          "Importer C"
                        ]
                      }
                    }
                    {
                      code: "PB3"
                      index: 12
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "Q10"
                      index: 13
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
                      isRequired: false
                    }
                    {
                      code: "Q11"
                      index: 14
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
                      index: 15
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "CheckboxShowcase"
                      index: 16
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
                      index: 17
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
                      index: 18
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
                      index: 19
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
                      index: 20
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
                      index: 21
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
                      isRequired: false
                    }
                    {
                      code: "TXT_LIKE"
                      index: 22
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
                      index: 23
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
                      code: "PB5"
                      index: 24
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "D1"
                      index: 25
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
                      code: "D2"
                      index: 26
                      title: "Test Visibility"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Enter 'magicword' to see a text box" }
                      isRequired: false
                    }
                    {
                      code: "Text3"
                      index: 27
                      title: "Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.D2.text"]
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
                              children: ["responses.D1.text"]
                            }
                            {
                              operator: "objectProperties"
                              children: ["responses.D1.optionIndex"]
                            }
                          ]
                        }
                        style: "success"
                      }
                    }
                    {
                      code: "Text4"
                      index: 28
                      title: "Text Showcase"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "## Many ways to deliver information!"
                        text: "A text info box can be presented in a number of **styles**.\\n\\n\*Please select one below*"
                        style: {
                          operator: "objectProperties"
                          children: ["responses.D3.text"]
                        }
                      }
                    }
                    {
                      code: "D3"
                      index: 29
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
                  ]
                }
              }
              {
                code: "S2"
                title: "Section 2 - File Upload"
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
                      isRequired: false
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
                      isRequired: false
                    }
                    {
                      code: "PB6"
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
                              children: [
                                "responses.Q_upload1.text"
                                "No files uploaded"
                              ]
                            }
                          ]
                        }
                        fileCountLimit: 99
                      }
                    }
                    {
                      code: "PB7"
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
                      isRequired: false
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
                      isRequired: false
                    }
                  ]
                }
              }
              {
                code: "S3"
                title: "Section 3 - Lists & Search"
                index: 3
                templateElementsUsingId: {
                  create: [
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
                    {
                      code: "PB15"
                      index: 12
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "TXT_Date1"
                      index: 20
                      title: "Date Picker Info"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "### Date picker examples"
                        style: "info"
                      }
                    }
                    {
                      code: "Date1"
                      index: 30
                      title: "Date Picker 1"
                      elementTypePluginCode: "datePicker"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Select a date _range_"
                        allowRange: true                      
                      }
                    } 
                    {
                      code: "TextDate1"
                      index: 35
                      title: "Date Display 1"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      visibilityCondition: {
                        operator: "!=",
                        children: [
                          {
                            operator: "objectProperties",
                            children: [
                              "responses.Date1.text",
                              ""
                            ]
                          },
                          ""
                        ]
                      }
                      parameters: {
                        text: {
                          operator: "stringSubstitution"
                          children: [
                            "Selected date: %1"
                            {
                              operator: "objectProperties"
                              children: ["responses.Date1.text", ""]
                            }
                          ]
                        }
                        style: "none"
                      }
                    }    
                    {
                      code: "Date2"
                      index: 40
                      title: "Date Picker 2"
                      elementTypePluginCode: "datePicker"
                      category: QUESTION
                      isRequired: false
                      helpText: "Can be displayed with different locales, and with a limit on the date range -- this one allows 1 year either side of today"
                      parameters: {
                        label: "Français?"
                        maxAge: 1
                        minAge: -1
                        displayFormat: "huge" 
                        locale: "fr"                 
                      }
                    }
                    {
                      code: "TextDate2"
                      index: 45
                      title: "Date Display 1"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      visibilityCondition: {
                        operator: "!=",
                        children: [
                          {
                            operator: "objectProperties",
                            children: [
                              "responses.Date2.text",
                              ""
                            ]
                          },
                          ""
                        ]
                      }
                      parameters: {
                        text: {
                          operator: "stringSubstitution"
                          children: [
                            "Selected date: %1"
                            {
                              operator: "objectProperties"
                              children: ["responses.Date2.text", ""]
                            }
                          ]
                        }
                        style: "none"
                      }
                    }
                    {
                      code: "Date3"
                      index: 50
                      title: "Date Picker 3"
                      elementTypePluginCode: "datePicker"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Different input format"
                        description: "Output (Summary view) is different too  \\nThis also requires date to be at least 18 years ago (useful for Date of Birth restrictions)"
                        minAge: 18 
                        displayFormat: "full"
                        entryFormat: "DD-MM-YYYY"                
                      }
                    }
                    {
                      code: "TextDate3"
                      index: 55
                      title: "Date Display 3"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      visibilityCondition: {
                        operator: "!=",
                        children: [
                          {
                            operator: "objectProperties",
                            children: [
                              "responses.Date3.text",
                              ""
                            ]
                          },
                          ""
                        ]
                      }
                      parameters: {
                        text: {
                          operator: "stringSubstitution"
                          children: [
                            "Selected date: %1"
                            {
                              operator: "objectProperties"
                              children: ["responses.Date3.text", ""]
                            }
                          ]
                        }
                        style: "none"
                      }
                    }
                    {
                      code: "Date4"
                      index: 60
                      title: "Date Picker 4"
                      elementTypePluginCode: "datePicker"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "This one has a default date"
                        default: "1976-12-23"
                        displayFormat: "med"                  
                      }
                    }
                    {
                      code: "TextDate4"
                      index: 65
                      title: "Date Display 4"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      visibilityCondition: {
                        operator: "!=",
                        children: [
                          {
                            operator: "objectProperties",
                            children: [
                              "responses.Date4.text",
                              ""
                            ]
                          },
                          ""
                        ]
                      }
                      parameters: {
                        text: {
                          operator: "stringSubstitution"
                          children: [
                            "Selected date: %1"
                            {
                              operator: "objectProperties"
                              children: ["responses.Date4.text", ""]
                            }
                          ]
                        }
                        style: "none"
                      }
                    }
                    {
                      code: "Date5"
                      index: 70
                      title: "Date Picker 5"
                      elementTypePluginCode: "datePicker"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "This one has a default range"
                        default: ["1976-12-23", "1977-12-04"]
                        displayFormat: "med"
                      }
                    }
                    {
                      code: "TextDate5"
                      index: 75
                      title: "Date Display 5"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      visibilityCondition: {
                        operator: "!=",
                        children: [
                          {
                            operator: "objectProperties",
                            children: [
                              "responses.Date5.text",
                              ""
                            ]
                          },
                          ""
                        ]
                      }
                      parameters: {
                        text: {
                          operator: "stringSubstitution"
                          children: [
                            "Selected date: %1"
                            {
                              operator: "objectProperties"
                              children: ["responses.Date5.text", ""]
                            }
                          ]
                        }
                        style: "none"
                      }
                    }
                    {
                      code: "PB16"
                      index: 80
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "TXT_Number_1"
                      index: 85
                      title: "Number example 1"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "### Number Input examples"
                        style: "info"
                      }
                    }
                    {
                      code: "num1"
                      index: 90
                      title: "Number Input 1"
                      elementTypePluginCode: "number"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Enter an integer"
                        description: "Must be a **positive** number less than 10 million"
                        type: "integer"
                        minValue: 0
                        maxValue: 10000000
                        simple: false                
                      }
                    } 
                    {
                      code: "num2"
                      index: 91
                      title: "Number Input French"
                      elementTypePluginCode: "number"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: {
                          operator: "stringSubstitution"
                          children: [
                            "Enter a real number between %1 and %2",
                            {
                              operator: "objectProperties"
                              children: [ "responses.numMin.text", "–10,000,000"]
                            }
                            {
                              operator: "objectProperties"
                              children: [ "responses.numMax.text", "10,000,000"]
                            }
                          ]
                        }
                        description: "Switch locale in the subsequent dropdown"
                        locale: {
                          operator: "objectProperties"
                          children: [ "responses.localeSelect.text", "en-US" ]
                        }
                        minValue: {
                          operator: "objectProperties"
                          children: [ "responses.numMin.number", -10000000 ]
                        }
                        maxValue: {
                          operator: "objectProperties"
                          children: [ "responses.numMax.number", 10000000 ]
                        }
                        simple: false               
                      }
                    }
                    {
                      code: "localeSelect"
                      index: 92
                      title: "Locale selector"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Select locale for previous number input"
                        default: 0
                        options: [
                          "en-US"
                          "fr-FR"
                          "hi-IN"
                          "ja-JP"
                        ]
                      }
                    }
                    {
                      code: "numMax"
                      index: 94
                      title: "Number Set Maximum"
                      elementTypePluginCode: "number"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Set the upper bound for the above"
                        type: "integer"
                        default: 10000000
                        simple: false  
                      }
                    } 
                    {
                      code: "numMin"
                      index: 95
                      title: "Number Set Minimum"
                      elementTypePluginCode: "number"
                      category: QUESTION
                      isRequired: false
                      defaultValue: {
                        value: -10000000
                        text: "-10000000"
                      }
                      parameters: {
                        label: "Set the lower bound"
                        type: "integer"
                        simple: false
                      }
                    }
                    {
                      code: "numSimple1"
                      index: 96
                      title: "Simple stepper"
                      elementTypePluginCode: "number"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Use the stepper to select an integer"
                        type: "integer"
                        maxWidth: "200px"
                      }
                    }
                    {
                      code: "numSimple2"
                      index: 97
                      title: "Simple stepper 2"
                      elementTypePluginCode: "number"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Use the stepper to select a decimal"
                        minValue: 0
                        step: 0.1
                        maxWidth: "200px"
                      }
                    }
                    {
                      code: "PB17"
                      index: 100
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "TXT_Number_2"
                      index: 101
                      title: "More number examples"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "### More Number Input examples"
                        style: "info"
                      }
                    }
                    {
                      code: "numCurr1"
                      index: 102
                      title: "Currency"
                      elementTypePluginCode: "number"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Enter an amount"
                        description: "Use the selector below to specify the currency"
                        simple: false
                        maxWidth: "150px"
                        currency: {
                          operator: "objectProperties"
                          children: [ "responses.currSelect.text", "USD" ]
                        }  
                      }
                    }
                    {
                      code: "currSelect"
                      index: 103
                      title: "Currency selector"
                      isRequired: false
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Select currency"
                        default: 0
                        options: [
                          "USD"
                          "EUR"
                          "JPY"
                          "NZD"
                        ]
                      }
                    }
                    {
                      code: "num3"
                      index: 104
                      title: "Suffix with maxSignificantDigits"
                      elementTypePluginCode: "number"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "How far is your home from here?"
                        description: "Your response will be expressed in the units selected below, rounded to 3 significant digits"
                      maxSignificantDigits: 3
                      simple: false
                      suffix: {
                          operator: "objectProperties"
                          children: [ "responses.unitSelect.selection.unit", "" ]
                        }        
                      }
                    }
                    {
                      code: "unitSelect"
                      index: 105
                      title: "Units selector"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Select distance unit"
                        default: 0
                        options: [
                         {display: "kilometers", unit: " km"}
                         {display: "meters", unit: " m"}
                         {display: "miles", unit: " mi"}
                        ]
                        optionsDisplayProperty: "display"
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
                title: "Screening"
                description: "This application will go through the Screening stage before it can be accessed."
                colour: "#24B5DF" #teal blue
                templateStageReviewLevelsUsingId: {
                  create: [{ number: 1, name: "Review" }]
                }
              }
              {
                number: 2
                title: "Assessment"
                description: "This phase is where your documents will be revised before the application can get the final approval."
                colour: "#E17E48" #orange
                templateStageReviewLevelsUsingId: {
                  create: [
                    { number: 1, name: "Review" }
                    { number: 2, name: "Consolidation" }
                  ]
                }
              }
              {
                number: 3
                title: "Final Decision"
                description: "This is the final step and will change the outcome of this applications."
                colour: "#1E14DB" #dark blue
                templateStageReviewLevelsUsingId: {
                  create: [{ number: 1, name: "Approval" }]
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
                actionCode: "scheduleAction"
                trigger: ON_APPLICATION_CREATE
                sequence: 100
                parameterQueries:{
                  eventCode: "warn1"
                  duration: { minute: 2 }
                }
              }
              {
                actionCode: "scheduleAction"
                sequence: 102
                trigger: ON_APPLICATION_CREATE
                parameterQueries:{
                  eventCode: "exp1"
                  duration: { minute: 4 }
                }
              }
              {
                actionCode: "sendNotification"
                trigger: ON_SCHEDULE
                eventCode: "warn1"
                condition: {
                  operator: "="
                  children: [
                    {
                      operator: "objectProperties"
                      children: ["applicationData.status"]
                    }
                    "DRAFT"
                  ]
                }
                parameterQueries: {
                  fromName: "Application Manager"
                  fromEmail: "no-reply@sussol.net"
                  email: {
                    operator: "objectProperties"
                    children: ["applicationData.email", ""]
                  }
                  subject: {
                    operator: "stringSubstitution"
                    children: [
                      "Draft application %1 in progress",
                      {
                        operator: "objectProperties"
                        children: [ "applicationData.applicationSerial", ""]
                      }
                    ]
                  }
                  message: "Your application will expire if you don't complete it soon"
                }
              }
              {
                actionCode: "changeOutcome"
                trigger: ON_SCHEDULE
                eventCode: "exp1"
                sequence: 1
                condition: {
                  operator: "="
                  children: [
                    {
                      operator: "objectProperties"
                      children: ["applicationData.status"]
                    }
                    "DRAFT"
                  ]
                }
                parameterQueries:{
                  newOutcome: "EXPIRED"
                }
              }
              {
                actionCode: "sendNotification"
                trigger: ON_SCHEDULE
                eventCode: "exp1"
                condition: {
                  operator: "="
                  children: [
                    {
                      operator: "objectProperties"
                      children: ["applicationData.status"]
                    }
                    "DRAFT"
                  ]
                }
                parameterQueries: {
                  fromName: "Application Manager"
                  fromEmail: "no-reply@sussol.net"
                  email: {
                    operator: "objectProperties"
                    children: ["applicationData.email", ""]
                  }
                  subject: "Application expired"
                  message: "Your application has expired. If you wish to continue, you'll need to re-apply."
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
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewScreening" }
                }
                stageNumber: 1
                levelNumber: 1
                canSelfAssign: true
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewAssessmentSection1Level1" }
                }
                stageNumber: 2
                levelNumber: 1
                allowedSections: ["S1"]
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewAssessmentSection2Level1" }
                }
                stageNumber: 2
                levelNumber: 1
                allowedSections: ["S2"]
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewAssessmentLevel2" }
                }
                stageNumber: 2
                levelNumber: 2
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewFinalDecision" }
                }
                stageNumber: 3
                levelNumber: 1
                canMakeFinalDecision: true
              }
              # Assign general
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "assignGeneral" }
                }
                stageNumber: 2
                levelNumber: 1
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
