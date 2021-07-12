/* 
TEMPLATE B - Organisation Registration
  - for creating a new Organisation in the system. Requires single review
  by reviewer with "reviewOrgRego" permission
*/
const { coreActions, joinFilters } = require('../_helpers/core_mutations')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "CompanyRego"
          name: "Company Registration"
          namePlural: "Companies Registrations"
          isLinear: false # CHANGE THIS 
          status: AVAILABLE
          startMessage: "## Registering a company in the system\\n\\nAs well as providing information about your company, you will be required to supply the following documents as part of this registration process:\\n\\n- **LMMD02** – CV of applicant with recent (max 1 year) photo\\n- **LMMD03** – Medical Certificate (max 3 months)\\n- **LMMD04** – Certificate of current residence with photo (max 3 months)\\n- **LMMD05** – Recent (max 1 year) photo\\n- **LMMD06** – Certificate of education level\\n- **LMMD07** – Criminal record \\"number 3\\"\\n- **LMMD08** – Letter from previous employers documenting at least 3 years professional experience (for private sector must be certified by provincial or capital level)\\n- **LMMD09** – Documentation showing resignation from previous employment (for private sector must be certified by provincial or capital level)\\n- **LMMD10** – Map of location of company\\n- **LMMD11** – Layout of facilities\\n- **LMMD13** – Proof of ownership of facilities or contract of rent\\n- **LMMD14** – Copy of business licence issued by Ministry of Commerce"
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Organisation Details"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S1Intro"
                      index: 10
                      title: "Intro Section 1"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      helpText: "The following questions are about your **organisation**"
                      parameters: {
                        title: "## Organisation details"
                        style: "info"
                      }
                    }
                    {
                      code: "S1NameLao"
                      index: 20
                      title: "Organisation Name (Lao)"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
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
                          "organisation"
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          "unique"
                        ]
                      }
                      validationMessage: "An organisation with that name already exists"
                      parameters: {
                        label: "Name of company/branch/wholesaler (in Lao)"
                        maxLength: 120
                      }
                    }
                    {
                      code: "S1NameEng"
                      index: 25
                      title: "Organisation Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
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
                          "organisation"
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          "unique"
                        ]
                      }
                      validationMessage: "An organisation with that name already exists"
                      parameters: {
                        label: "Name of company/branch/wholesaler (in English)"
                        maxLength: 120
                      }
                    }
                    {
                      code: "invHeader"
                      index: 35
                      title: "Investment Title"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "### Total Investment"
                        style: "none"
                      }
                    }
                    # TO-DO: Turn these responses into numbers so can add together
                    {
                      code: "invDomestic"
                      index: 40
                      title: "Domestic Investment"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Domestic", maxLength: 50 }
                    }
                    {
                      code: "invForeign"
                      index: 45
                      title: "Foreign Investment"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Foreign", maxLength: 50 }
                    }
                    {
                      code: "logo"
                      index: 50
                      title: "Logo upload"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Upload a logo for your company"
                        description: "File must be an image type (.jpg, .jpeg, .png, .gif, .svg) and less than 5MB"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "gif", "svg"]
                        fileSizeLimit: 5000
                      }
                    }
                    {
                      code: "PB1"
                      index: 55
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "addressIntro"
                      index: 60
                      title: "Address Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { title: "### Address", style: "none" }
                    }
                    {
                      code: "addressNear"
                      index: 65
                      title: "Address Near"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      parameters: { label: "Near/by", maxLength: 150 }
                    }
                    {
                      code: "addressStreet"
                      index: 70
                      title: "Address Street"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "House number & street"
                        maxLength: 150
                      }
                    }
                    {
                      code: "addressVillage"
                      index: 72
                      title: "Village"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Village"
                        description: "(if applicable)"
                        maxLength: 150
                      }
                    }
                    {
                      code: "addressDistrict"
                      index: 75
                      title: "Address District"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "District/Province"
                        description: "_TO-DO: Use look-up table_"
                      }
                    }
                    {
                      code: "phone"
                      index: 80
                      title: "Phone"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Phone number"
                        description: "Please include area code"
                      }
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          "^[0-9()\\\\-\+]*$"
                        ]
                      }
                      validationMessage: "Not a valid phone number"
                    }
                    {
                      code: "fax"
                      index: 85
                      title: "Fax"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Fax number"
                        description: "(if applicable)"
                      }
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          "^[0-9()\\\\-\+]*$"
                        ]
                      }
                      validationMessage: "Not a valid fax number"
                    }
                    {
                      code: "email"
                      index: 90
                      title: "Email"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Email"
                      }
                      defaultValue: {
                        operator: "buildObject"
                        properties: [
                          {
                            key: "text"
                            value: {
                              operator: "objectProperties"
                              children: ["currentUser.email"]
                            }
                          }
                        ]
                      }
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
                    }
                    {
                      code: "PBOwner"
                      index: 100
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "ownerIntro"
                      index: 105
                      title: "Owner Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      helpText: "This page requires information about the **owner** of the company, which will probably be the person filling in this application form"
                      parameters: { title: "### Company Owner", style: "none" }
                    }
                    {
                      code: "ownerName"
                      index: 110
                      title: "Company Owner"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      defaultValue: {
                        operator: "buildObject",
                        properties: [
                          {
                            key: "text",
                            value: {
                              operator: "stringSubstitution",
                              children: [
                                "%1 %2",
                                {
                                  operator: "objectProperties",
                                  children: [
                                    "currentUser.firstName",
                                    ""
                                  ]
                                },
                                {
                                  operator: "objectProperties",
                                  children: [
                                    "currentUser.lastName",
                                    ""
                                  ]
                                }
                              ]
                            }
                          }
                        ]
                      }
                      parameters: {
                        label: "Full name of company owner"
                        maxLength: 150 }
                    }
                    {
                      code: "ownerPhone"
                      index: 115
                      title: "Company Owner Phone"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Phone"
                        maxLength: 50
                      }
                      defaultValue: {
                        operator: "buildObject",
                        properties: [
                          {
                            key: "text",
                            value: {
                              operator: "graphQL",
                              children: [
                                "query getUser($id: Int!){user(id: $id) {phone}}",
                                "",
                                [
                                  "id"
                                ],
                                {
                                  operator: "objectProperties",
                                  children: [
                                    "currentUser.userId"
                                  ]
                                },
                                "user.phone"
                              ]
                            }
                          }
                        ]
                      }
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          "^[0-9()\\\\-\+]*$"
                        ]
                      }
                      validationMessage: "Not a valid phone number"
                    }
                    {
                      code: "ownerEmail"
                      index: 120
                      title: "Company Owner Email"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Email"
                        maxLength: 150
                      }
                      defaultValue: {
                        operator: "buildObject"
                        properties: [
                          {
                            key: "text"
                            value: {
                              operator: "objectProperties"
                              children: ["currentUser.email"]
                            }
                          }
                        ]
                      }
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
                    }
                    {
                      code: "ownerFax"
                      index: 130
                      title: "Company Owner Fax"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Fax number"
                        description: "(if applicable)"
                        maxLength: 150
                      }
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          "^[0-9()\\\\-\+]*$"
                        ]
                      }
                      validationMessage: "Not a valid fax number"
                    }
                  ]
                }
              }
              {
                code: "S2"
                title: "Professional Details"
                index: 1
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S2Intro"
                      index: 10
                      title: "Intro Section 2"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      helpText: "The following questions are regarding the professional qualifications and experience of the **individual** who will primarily act on the company's behalf"
                      parameters: {
                        title: "## Professional details"
                        text: {
                          operator: "stringSubstitution"
                          children: [
                            "for **%1 %2**"
                            {
                              operator: "objectProperties",
                              children: [
                                "currentUser.firstName",
                                ""
                              ]
                            },
                            {
                              operator: "objectProperties",
                              children: [
                                "currentUser.lastName",
                                ""
                              ]
                            }
                          ]
                        }
                        style: "info"
                      }
                    }
                    {
                      code: "profId"
                      index: 20
                      title: "Professional ID"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Professional ID number"
                      }
                    }
                    {
                      code: "expList"
                      index: 30
                      title: "Experience list"
                      elementTypePluginCode: "listBuilder"
                      category: QUESTION
                      parameters: {
                        label: "Professional experience"
                        description: "Please create a list outlining your professional experience"
                        createModalButtonText: "Add role"
                        modalText: "Please enter details for **one** previous role"
                        displayType: {
                          operator: "objectProperties"
                          children: ["responses.listDisplay.text"]
                        }
                        displayFormat: {
                          title: "\${PEname}"
                          subtitle: "\${PEtype}  \\n\${PEorgTel} \${PEorgEmail}"
                          description: "**Role**: \${PErole}  \\n\${PEfrom} – \${PEto}"
                        }
                        inputFields: [
                          {
                            code: "PEtype"
                            title: "Type of role"
                            elementTypePluginCode: "radioChoice"
                            category: QUESTION
                            parameters: {
                              label: "Type of role"
                              options: ["Government", "Private Sector"]
                              layout: "inline"
                            }
                          }
                          {
                            code: "PEname"
                            title: "Org name"
                            elementTypePluginCode: "shortText"
                            category: QUESTION
                            parameters: {
                              label: "Name of institution or company"
                              maxLength: 120
                            }
                          }
                          {
                            code: "PEorgTel"
                            title: "Org telephone"
                            elementTypePluginCode: "shortText"
                            category: QUESTION
                            isRequired: false
                            parameters: {
                              label: "Telephone"
                              maxLength: 120
                            }
                            validation: {
                              operator: "REGEX"
                              children: [
                                {
                                  operator: "objectProperties"
                                  children: ["responses.thisResponse"]
                                }
                                "^[0-9()\\\\-\+]*$"
                              ]
                            }
                            validationMessage: "Not a valid phone number"
                          }
                          {
                            code: "PEorgEmail"
                            title: "Org email"
                            elementTypePluginCode: "shortText"
                            category: QUESTION
                            isRequired: false
                            parameters: {
                              label: "Email"
                              maxLength: 120
                            }
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
                          }
                          {
                            code: "PErole"
                            title: "Role"
                            elementTypePluginCode: "shortText"
                            category: QUESTION
                            parameters: {
                              label: "Your role"
                              maxLength: 120
                            }
                          }
                          {
                            code: "PEfrom"
                            title: "From"
                            elementTypePluginCode: "shortText"
                            category: QUESTION
                            parameters: {
                              label: "From"
                              maxLength: 120
                              maxWidth: 200
                            }
                          }
                          {
                            code: "PEto"
                            title: "To"
                            elementTypePluginCode: "shortText"
                            category: QUESTION
                            isRequired: false
                            parameters: {
                              label: "To"
                              maxLength: 120
                              maxWidth: 200
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              }
              {
                code: "S3"
                title: "Documentation"
                index: 2
                templateElementsUsingId: {
                  create: [ 
                    {
                      code: "S3Intro"
                      index: 10
                      title: "Intro Section 3"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, you are required to upload documentation. The following items are required:\\n\\n  - **LMMD02** – CV of applicant with recent (max 1 year) photo\\n- **LMMD03** – Medical Certificate (max 3 months)\\n- **LMMD04** – Certificate of current residence with photo (max 3 months)\\n- **LMMD05** – Recent (max 1 year) photo\\n- **LMMD06** – Certificate of education level\\n- **LMMD07** – Criminal record \\"number 3\\"\\n- **LMMD08** – Letter from previous employers documenting at least 3 years professional experience (for private sector must be certified by provincial or capital level)\\n- **LMMD09** – Documentation showing resignation from previous employment (for private sector must be certified by provincial or capital level)\\n- **LMMD10** – Map of location of company\\n- **LMMD11** – Layout of facilities\\n- **LMMD13** – Proof of ownership of facilities or contract of rent\\n- **LMMD14** – Copy of business licence issued by Ministry of Commerce"
                        style: "info"
                      }
                    }               
                    {
                      code: "PB2"
                      index: 20
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "fileLMMD02"
                      index: 30
                      title: "CV upload"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: true 
                      helpText: "For all uploads, files must be in **pdf**, **doc** or an **image** format, and less than 10MB each"
                      parameters: {
                        label: "CV (LMMD02)"
                        description: "Must have recent (max 1 year) photo"
                        fileCountLimit: 2
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }
                    {
                      code: "fileLMMD03"
                      index: 31
                      title: "Medical certificate upload"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: true 
                      parameters: {
                        label: "Medical certificate  (LMMD03)"
                        description: "QUESTION: Is this for individual?"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }   
                    {
                      code: "fileLMMD04"
                      index: 32
                      title: "Current residence certificate"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: true 
                      parameters: {
                        label: "Certificate of current residence  (LMMD04)"
                        description: "Must include photo (max 3 months)"
                        fileCountLimit: 2
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }   
                    {
                      code: "fileLMMD05"
                      index: 33
                      title: "Recent Photo"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: true 
                      parameters: {
                        label: "Photo (LMMD05)"
                        description: "Max 1 year (used for printing licence)"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "pdf"]
                        fileSizeLimit: 10000
                      }
                    }
                    {
                      code: "PB3"
                      index: 40
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "fileLMMD06"
                      index: 41
                      title: "Education Certificate"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: true 
                      parameters: {
                        label: "Certificate of education level (LMMD06)"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }
                    {
                      code: "fileLMMD07"
                      index: 42
                      title: "Criminal Record"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: true 
                      parameters: {
                        label: "Criminal record (number 3) (LMMD07)"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }
                    {
                      code: "fileLMMD08"
                      index: 43
                      title: "Recent Photo"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: true 
                      parameters: {
                        label: "Letter from previous employers documenting at least 3 years professional experience (LMMD08)"
                        description: "(for private sector must be certified by provincial or capital level)"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }
                    {
                      code: "fileLMMD09"
                      index: 44
                      title: "Resignation document"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: true 
                      parameters: {
                        label: "Documentation showing resignation from previous employment (LMMD09)"
                        description: "(for private sector must be certified by provincial or capital level)"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }
                    {
                      code: "PB4"
                      index: 50
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "fileLMMD10"
                      index: 51
                      title: "Location map"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: false 
                      parameters: {
                        label: "Map of location of company (LMMD10)"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }
                    {
                      code: "fileLMMD11"
                      index: 52
                      title: "Layout of facilities"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: true 
                      parameters: {
                        label: "Layout of facilities (LMMD11)"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }
                    {
                      code: "fileLMMD013"
                      index: 53
                      title: "Proof of ownership"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: true 
                      parameters: {
                        label: "Proof of ownership of facilities or contract of rent"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }
                    {
                      code: "fileLMMD14"
                      index: 54
                      title: "Business licence"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: true 
                      parameters: {
                        label: "Copy of business licence issued by Ministry of Commerce (LMMD14)"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc"]
                        fileSizeLimit: 10000
                      }
                    }
                    {
                      code: "registrationCode"
                      index: 55
                      title: "Company Registration"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Please enter your company registration code"
                        description: "As specified in **LMMD14**"
                        maxLength: 50
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
                title: "Approval"
                description: "This application will be approved by a Reviewer"
                colour: "#1E14DB" #dark blue
                templateStageReviewLevelsUsingId: {
                  create: [{ number: 1, name: "Review" }]
                }
              }
            ]
          }
          templateCategoryToTemplateCategoryId: { connectByCode: { code: "org" } }
          ${joinFilters}
          templateActionsUsingId: {
            create: [
              ${coreActions}
              {
                actionCode: "cLog"
                trigger: ON_APPLICATION_SUBMIT
                parameterQueries: {
                  message: { value: "Organisation Registration submission" }
                }
              }
              {
                actionCode: "changeOutcome"
                trigger: ON_REVIEW_SUBMIT
                sequence: 100
                condition: {
                  operator: "AND"
                  children: [
                    {
                      operator: "="
                      children: [
                        {
                          operator: "objectProperties"
                          children: [
                            "applicationData.reviewData.latestDecision.decision"
                          ]
                        }
                        "CONFORM"
                      ]
                    }
                    {
                      operator: "objectProperties"
                      children: ["applicationData.reviewData.isLastLevel"]
                    }
                  ]
                }
                parameterQueries: {
                  newOutcome: { value: "APPROVED" }
                }
              }
              {
                actionCode: "modifyRecord"
                trigger: ON_REVIEW_SUBMIT
                sequence: 101
                condition: {
                  operator: "="
                  children: [
                    {
                      operator: "objectProperties"
                      children: [
                        "applicationData.outcome"
                      ]
                    }
                    "APPROVED"
                  ]
                }
                parameterQueries: {
                  tableName: "organisation"
                  name: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.S1NameLao.text"]
                  }
                  name_english: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.S1NameEng.text"]
                  }
                  registration: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.registrationCode.text", ""]
                  }
                  logo_url: {
                    operator: "+",
                    children: [
                      # This is a clunky hack to extract a value from an array
                      "",
                      {
                        operator: "objectProperties",
                        children: [
                          "applicationData.responses.logo.files.fileUrl"
                        ]
                      }
                    ]
                  }
                  address_near_by: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.addressNear.text", ""]
                  }
                  address_street: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.addressStreet.text", ""]
                  }
                  address_village: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.addressVillage.text", ""]
                  }
                  address_district: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.addressDistrict.text", ""]
                  }
                  phone: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.phone.text", ""]
                  }
                  fax: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.fax.text", ""]
                  }
                  email: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.email.text", ""]
                  }
                  domestic_investment: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.invDomestic.text", ""]
                  } 
                  foreign_investment: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.invForeign.text", ""]
                  } 
                  owner_name: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.ownerName.text", ""]
                  }
                  owner_phone: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.ownerPhone.text", ""]
                  }
                  owner_email: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.ownerEmail.text", ""]
                  }
                  owner_fax: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.ownerFax.text", ""]
                  }
                  professional_id: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.profId.text", ""]
                  }
                  professional_experience: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.expList", {}]
                  }
                }
              }
              {
                actionCode: "joinUserOrg"
                trigger: ON_REVIEW_SUBMIT
                sequence: 102
                # TO-DO -- update condition to just check Outcome
                # (from applicationData)
                condition: {
                  operator: "="
                  children: [
                    {
                      operator: "objectProperties"
                      children: [
                        "applicationData.outcome"
                      ]
                    }
                    "APPROVED"
                  ]
                }
                parameterQueries: {
                  user_id: {
                    operator: "objectProperties"
                    children: ["applicationData.userId"]
                  }
                  organisation_id: {
                    operator: "objectProperties"
                    children: ["outputCumulative.organisation.id"]
                  }
                  user_role: "Owner"
                }
              }
              {
                actionCode: "grantPermissions"
                trigger: ON_REVIEW_SUBMIT
                sequence: 103
                condition: {
                  operator: "="
                  children: [
                    {
                      operator: "objectProperties"
                      children: [
                        "applicationData.outcome"
                      ]
                    }
                    "APPROVED"
                  ]
                }
                parameterQueries: {
                  username: {
                    operator: "objectProperties"
                    children: ["applicationData.username"]
                  }
                  orgName: {
                    operator: "objectProperties"
                    children: ["outputCumulative.organisation.name"]
                  }
                  permissionNames: ["reviewJoinOrg", "applyOrgLicense"]
                }
              }
              {
                actionCode: "changeStatus"
                trigger: ON_REVIEW_SUBMIT
                sequence: 104
                condition: {
                  operator: "="
                  children: [
                    {
                      operator: "objectProperties"
                      children: [
                        "applicationData.outcome"
                      ]
                    }
                    "APPROVED"
                  ]
                }
                parameterQueries: { newStatus: { value: "COMPLETED" } }
              }
            ]
          }
          templatePermissionsUsingId: {
            create: [
              # Apply OrgRegistration
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyOrgRego" }
                }
              }
              # Review Org rego
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewOrgRego" }
                }
                stageNumber: 1
                levelNumber: 1
                canSelfAssign: true
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
