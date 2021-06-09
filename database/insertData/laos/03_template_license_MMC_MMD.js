/*
TEMPLATE C - Company license type MMC, MMD, MDC, MDM, WSL or RIT
  - for MMC => Modern Medicines
  - for MDC => Medical Devices
*/

const { coreActions, joinFilters } = require('../_helpers/core_mutations')
const { devActions } = require('../_helpers/dev_actions')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
          template: {
            code: "CompanyLicense1"
            name: "Company License for Modern medicines or Medical devices"
            isLinear: false # CHANGE THIS
            status: AVAILABLE
            startMessage: "## Apply for a company license under one of the following options:\\n - MMC\\n - MMD\\n - MDC\\n - MDM\\n - WSL\\n - RIT\\n\\n**TODO**: Add description for each type of application\\n\\nYou will be required to upload the following documents as part of this  process:\\n- LMMD01: Letter of request \\n- LMMD12: Letter from mother-company authorizing establishment of branch\\n- LMMD15: Site inspection report by F&D unit\\n- LMMD16: Company/manufacturer profile (including site master file and GMP certification where applicable)"
            versionTimestamp: "NOW()"
            templateSectionsUsingId: {
              create: [
                {
                  code: "S1"
                  title: "Applicant details"
                  index: 0
                  templateElementsUsingId: {
                    create: [
                      {
                        code: "S1Intro"
                        index: 0
                        title: "Section 1 - Applicant details"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        helpText: "The following questions are automatically filled with existing information about **Applicant**"
                        parameters: { title: "## Applicant details", style: "basic" }
                      }
                      {
                        code: "Q1ApplicantFirstName"
                        index: 10
                        title: "Applicant first name"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isEditable: false
                        parameters: { label: "First name" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getUser($id: Int!){user(id: $id) {firstName}}",
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
                                  "user.firstName"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q2ApplicantLasttName"
                        index: 20
                        title: "Applicant last name"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isEditable: false
                        parameters: { label: "Last name" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getUser($id: Int!){user(id: $id) {lastName}}",
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
                                  "user.lastName"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q3ApplicantDOB"
                        index: 30
                        title: "Applicant DOB"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isEditable: false
                        parameters: { label: "Date of Birth" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getUser($id: Int!){user(id: $id) {dateOfBirth}}",
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
                                  "user.dateOfBirth"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q4NationalID"
                        index: 40
                        title: "National ID number"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isEditable: false
                        parameters: { label: "National ID number" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getUser($id: Int!){user(id: $id) {nationalId}}",
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
                                  "user.nationalId"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q5IssuedDate"
                        index: 50
                        title: "Date issued"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isEditable: false
                        parameters: { label: "Date issued" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getUser($id: Int!){user(id: $id) {nationalIdIssuedDate}}",
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
                                  "user.nationalIdIssuedDate"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "PB1"
                        index: 60
                        title: "Page Break"
                        elementTypePluginCode: "pageBreak"
                        category: INFORMATION
                      }
                      {
                        code: "S1Page2"
                        index: 70
                        title: "Section 1 - Place of birth"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { title: "## Place of birth", style: "basic" }
                      }
                      {
                        code: "Q6Vilage"
                        index: 80
                        title: "Vilage"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isEditable: false
                        isRequired: false
                        parameters: { label: "Vilage" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getUser($id: Int!){user(id: $id) {birthPlaceVilage}}",
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
                                  "user.birthPlaceVilage"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q7Province"
                        index: 90
                        title: "Province"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isEditable: false
                        isRequired: false
                        parameters: { label: "Province" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getUser($id: Int!){user(id: $id) {birthPlaceProvince}}",
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
                                  "user.birthPlaceProvince"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q8District"
                        index: 90
                        title: "District"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isEditable: false
                        isRequired: false
                        parameters: { label: "District" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getUser($id: Int!){user(id: $id) {birthPlaceDistrict}}",
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
                                  "user.birthPlaceDistrict"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "PB2"
                        index: 100
                        title: "Page Break"
                        elementTypePluginCode: "pageBreak"
                        category: INFORMATION
                      }
                      {
                        code: "S1Page3"
                        index: 110
                        title: "Section 1 - Current address"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { title: "## Current address", style: "basic" }
                      }
                      {
                        code: "Q9Vilage"
                        index: 120
                        title: "Vilage"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isEditable: false
                        isRequired: false
                        parameters: { label: "Vilage" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getUser($id: Int!){user(id: $id) {currentAddressVilage}}",
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
                                  "user.currentAddressVilage"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q10Province"
                        index: 130
                        title: "Province"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isEditable: false
                        isRequired: false
                        parameters: { label: "Province" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getUser($id: Int!){user(id: $id) {currentAddressProvince}}",
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
                                  "user.currentAddressProvince"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q11District"
                        index: 140
                        title: "District"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isEditable: false
                        isRequired: false
                        parameters: { label: "District" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getUser($id: Int!){user(id: $id) {currentAddressDistrict}}",
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
                                  "user.currentAddressDistrict"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "PB3"
                        index: 150
                        title: "Page Break"
                        elementTypePluginCode: "pageBreak"
                        category: INFORMATION
                      }
                      {
                        code: "S1Page4"
                        index: 160
                        title: "Section 1 - Education"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { title: "## Education", style: "basic" }
                      }
                      {
                        code: "Q12EducationLevel"
                        index: 170
                        title: "Organisation Category"
                        elementTypePluginCode: "radioChoice"
                        category: QUESTION
                        isEditable: false
                        parameters: {
                          label: "Education Level"
                          layout: "inline"
                          options: ["Secondary", "University"]
                        }
                        defaultValue: {
                          operator: "graphQL",
                          children: [
                            "query getUser($id: Int!){user(id: $id) {education}}",
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
                            "user.education"
                          ]
                        }
                      }
                      {
                        code: "Q13Secondary"
                        index: 180
                        title: "Secondary"
                        elementTypePluginCode: "longText"
                        category: QUESTION
                        isEditable: false
                        parameters: { label: "Please enter details for secondary"}
                        visibilityCondition: {
                          operator: "="
                          children: [
                            {
                              operator: "objectProperties"
                              children: ["responses.Q12EducationLevel.text"]
                            }
                            "Secondary"
                          ]
                        }
                        defaultValue: {
                          operator: "graphQL",
                          children: [
                            "query getUser($id: Int!){user(id: $id) {secondary}}",
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
                            "user.secondary"
                          ]
                        }
                      }
                      {
                        code: "Q14EducationHistory"
                        index: 190
                        title: "Education List"
                        elementTypePluginCode: "listBuilder"
                        category: QUESTION
                        isEditable: false
                        parameters: {
                          label: "Education history"
                          displayType: "list"
                          visibilityCondition: {
                            operator: "=="
                            children: [
                              {
                                operator: "objectProperties"
                                children: ["responses.Q12EducationLevel.selected"]
                              }
                              "University"
                            ]
                          }
                          defaultValue: {
                            operator: "graphQL",
                            children: [
                              "query getUser($id: Int!){user(id: $id) {universityHistory}}",
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
                              "user.universityHistory"
                            ]
                          }
                        }
                      }
                    ]
                  }
                }
                {
                  code: "S2"
                  title: "Professional details"
                  index: 1
                  templateElementsUsingId: {
                    create: [
                      {
                        code: "S2Intro"
                        index: 10
                        title: "Section 2 - Professional details"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        helpText: "The following questions are automatically filled with existing information about **Applicant**"
                        parameters: {
                          title: "## Professional details"
                          style: "basic"
                        }
                      }
                      {
                        code: "Q1ProfessionalExperience"
                        index: 20
                        title: "Professional experience list"
                        elementTypePluginCode: "listBuilder"
                        category: QUESTION
                        isEditable: false
                        parameters: {
                          label: "Professional experience"
                          defaultValue: {
                            operator: "graphQL",
                            children: [
                              "query getUser($id: Int!){user(id: $id) {professionalExperienceList}}",
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
                              "user.professionalExperienceList"
                            ]
                          }
#                         createModalButtonText: "Add professional experience"
#                         modalText: "## Professional experienve entry \\n\\nPlease enter details below:"
#                         displayType: "list"
#                         displayFormat: {
#                           title: "\${LB2}"
#                           subtitle: "**From**: \${LB3} **to**: \${LB4}"
#                           description: "\${LB5}"
#                         }
#                         inputFields: [
#                           {
#                             code: "LB1"
#                             title: "Type of institution"
#                             elementTypePluginCode: "radioChoice"
#                             category: QUESTION
#                             parameters: { 
#                               label: "Select type of institution"
#                               layout: "inline"
#                               options: ["Governament","Private sector"]
#                             }
#                             isRequired: true
#                           }
#                           {
#                             code: "LB2"
#                             title: "Name of institution"
#                             elementTypePluginCode: "shortText"
#                             category: QUESTION
#                             parameters: { label: "Name of institution" }
#                             isRequired: true
#                           }
#                           {
#                             code: "LB3"
#                             title: "Experience start date"
#                             elementTypePluginCode: "shortText"
#                             category: QUESTION
#                             parameters: {
#                               label: "From"
#                               maxWidth: 150
#                             }
#                             isRequired: true
#                             validation: {
#                               operator: "REGEX"
#                               children: [
#                                 {
#                                   operator: "objectProperties"
#                                   children: ["responses.thisResponse"]
#                                 }
#                                 "^(0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d$"
#                               ]
#                             }
#                             validationMessage: "Format expected MM/YYYY"
#                           }
#                           {
#                             code: "LB4"
#                             title: "Experience finish date"
#                             elementTypePluginCode: "shortText"
#                             category: QUESTION
#                             parameters: {
#                               label: "To"
#                               maxWidth: 150
#                             }
#                             isRequired: false
#                             validation: {
#                               operator: "REGEX"
#                               children: [
#                                 {
#                                   operator: "objectProperties"
#                                   children: ["responses.thisResponse"]
#                                 }
#                                 "^(0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d$"
#                               ]
#                             }
#                             validationMessage: "Format expected MM/YYYY. Can be left blank if current."
#                           }
#                           {
#                             code: "LB5"
#                             title: "Experience role"
#                             elementTypePluginCode: "shortText"
#                             category: QUESTION
#                             parameters: { label: "Role" }
#                             isRequired: true
#                           }
#                           {
#                             code: "LB6"
#                             title: "Telephone"
#                             elementTypePluginCode: "shortText"
#                             category: QUESTION
#                             parameters: {
#                               label: "Telephone"
#                               maxWidth: 200
#                             }
#                             isRequired: true
#                             validation: {
#                               operator: "REGEX",
#                               children: [
#                                 {
#                                   operator: "objectProperties",
#                                   children: [
#                                     "responses.thisResponse"
#                                   ]
#                                 },
#                                 "^[0-9.]+$"
#                               ]
#                             }
#                             validationMessage: "Must be a number"
#                           }
#                           {
#                             code: "LB7"
#                             title: "Email"
#                             elementTypePluginCode: "shortText"
#                             category: QUESTION
#                             parameters: { label: "Email" }
#                             isRequired: true
#                             validation: {
#                               operator: "REGEX"
#                               children: [
#                                 {
#                                   operator: "objectProperties"
#                                   children: ["responses.thisResponse"]
#                                 }
#                                 {
#                                   value: "^[A-Za-z0-9.]+@[A-Za-z0-9]+\\\\.[A-Za-z0-9.]+$"
#                                 }
#                               ]
#                             }
#                             validationMessage: "Not a valid email address"
#                           }
#                         ]
                       }
                     }
                   ]
                  }
                }
                {
                  code: "S3"
                  title: "Company details"
                  index: 2
                  templateElementsUsingId: {
                    create: [
                      {
                        code: "S3Intro"
                        index: 10
                        title: "Section 3 - "
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        helpText: "The following questions are automatically filled with existing information about **Company**"
                        parameters: { title: "## Company details", style: "basic" }
                      }
                    ]
                  }
                }
                {
                  code: "S4"
                  title: "License details"
                  index: 3
                  templateElementsUsingId: {
                    create: [
                      {
                        code: "S4Intro"
                        index: 10
                        title: "Section 4"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { title: "## License details", style: "basic" }
                      }
                      {
                        code: "Q1ProductType"
                        index: 20
                        title: "Product type"
                        elementTypePluginCode: "radioChoice"
                        category: QUESTION
                        parameters: {
                          label: "Type of product"
                          layout: "inline"
                          options: [
                            "modern medicines"
                            "medical devices"
                          ]
                        }
                      }
                      {
                        code: "Q2LicenseType"
                        index: 30
                        title: "License type"
                        elementTypePluginCode: "radioChoice"
                        category: QUESTION
                        helpText: "Select the license to apply for will grat the specific license to this company an expiry date genrated on Approval"
                        parameters: {
                          label: "Purpose of application"
                          options: [
                            "import/export medicines and medical devices"
                            "local manufacturer or branch of local manufacturer"
                            "wholesaler for medicines and medical devices"
                            "retail pharmacy"
                          ]
                        }
                      }
                    ]
                  }
                }
                {
                  code: "S5"
                  title: "Files updload"
                  index: 4
                  templateElementsUsingId: {
                    create: [
                      {
                        code: "LMMD01"
                        index: 10
                        title: "File upload LMMD01"
                        elementTypePluginCode: "fileUpload"
                        category: QUESTION
                        parameters: {
                          label: "Letter of request"
                          description: "The physical submission for this form is also required.\\nFile uploaded must be **image** files or **PDF** and under 5MB."
                          fileCountLimit: 1
                          fileExtensions: ["pdf", "png", "jpg"]
                          fileSizeLimit: 5000
                        }
                      }
                      {
                        code: "S5PB1"
                        index: 20
                        title: "Page Break"
                        elementTypePluginCode: "pageBreak"
                        category: INFORMATION
                      }
                      {
                        code: "LMMD12"
                        index: 30
                        title: "File upload LMMD01"
                        elementTypePluginCode: "fileUpload"
                        category: QUESTION
                        parameters: {
                          label: "Letter from mother-company authorizing establishment of branch"
                          description: "File uploaded must be **image** files or **PDF** and under 5MB."
                          fileCountLimit: 1
                          fileExtensions: ["pdf", "png", "jpg"]
                          fileSizeLimit: 5000
                        }
                      }
                      {
                        code: "S5PB2"
                        index: 40
                        title: "Page Break"
                        elementTypePluginCode: "pageBreak"
                        category: INFORMATION
                      }
                      {
                        code: "LMMD15"
                        index: 50
                        title: "File upload LMMD15"
                        elementTypePluginCode: "fileUpload"
                        category: QUESTION
                        parameters: {
                          label: "Site inspection report by F&D unit"
                          description: "File uploaded must be **image** files or **PDF** and under 5MB."
                          fileExtensions: ["pdf", "png", "jpg"]
                          fileSizeLimit: 5000
                        }
                      }
                      {
                        code: "S5PB3"
                        index: 60
                        title: "Page Break"
                        elementTypePluginCode: "pageBreak"
                        category: INFORMATION
                      }
                      {
                        code: "LMMD16"
                        index: 70
                        title: "File upload LMMD15"
                        elementTypePluginCode: "fileUpload"
                        category: QUESTION
                        parameters: {
                          label: "Company/manufacturer profile (including site master file and GMP certification where applicable)"
                          description: "describing origin of products, staff and qualifications, facilities and equipment, business experience, business development plan.\\nFile uploaded must be **image** files or **PDF** and under 5MB."
                          fileExtensions: ["pdf", "png", "jpg"]
                          fileSizeLimit: 5000
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
                  description: "This application will be screened one level Reviewer\\nAfter this stage the application will be acessed."
                  colour: "#24B5DF" #teal blue
                  templateStageReviewLevelsUsingId: {
                    create: [{ number: 1, name: "Screener" }]
                  }
                }
                {
                  number: 2
                  title: "Assessment"
                  description: "This application will be acessed by one level Reviewer\\nAfter this stage, when approved a license is generated."
                  colour: "#E17E48" #orange
                  templateStageReviewLevelsUsingId: {
                    create: [{ number: 1, name: "Assessor" }]
                  }
                }
              ]
            }
            templateCategoryToTemplateCategoryId: {
              connectByCode: { code: "license" }
            }
            ${joinFilters}
            templateActionsUsingId: {
              create: [
                ${coreActions}
                ${devActions}
                {
                  actionCode: "cLog"
                  trigger: ON_APPLICATION_SUBMIT
                  parameterQueries: {
                    message: { value: "Organisation Registration submission" }
                  }
                }
                # TODO - Check if this will set outcome on Stage 2 only!
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
                  parameterQueries: { newOutcome: { value: "APPROVED" } }
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
                        children: ["applicationData.outcome"]
                      }
                      "APPROVED"
                    ]
                  }
                  parameterQueries: {
                    tableName: "organisation"
                    name: {
                      operator: "objectProperties"
                      children: ["applicationData.responses.name.text"]
                    }
                    registration: {
                      operator: "objectProperties"
                      children: ["applicationData.responses.rego.text"]
                    }
                    address: {
                      operator: "objectProperties"
                      children: ["applicationData.responses.physAdd.text"]
                    }
                    logo_url: {
                      operator: "CONCAT"
                      children: [
                        # This is a clunky hack to extract a value from an array
                        ""
                        {
                          operator: "objectProperties"
                          children: ["applicationData.responses.logo.files.fileUrl"]
                        }
                      ]
                    }
                  }
                }
                {
                  actionCode: "grantPermissions"
                  trigger: ON_REVIEW_SUBMIT
                  sequence: 103
                  # TO-DO -- update condition to just check Outcome
                  # (from applicationData)
                  condition: {
                    operator: "="
                    children: [
                      {
                        operator: "objectProperties"
                        children: ["applicationData.outcome"]
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
                    permissionNames: ["reviewJoinOrg"]
                  }
                }
              ]
            }
            templatePermissionsUsingId: {
              create: [
                # TODO: Remove this - used to allow new user to apply
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyUserEdit" }
                  }
                }
                # Apply OrgRegistration
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyOrgRego" }
                  }
                }
                # Review General - Stage 1
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "reviewSelfAssignable" }
                  }
                  stageNumber: 1
                  levelNumber: 1
                }
                # Assign General - Stage 1
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyGeneral" }
                  }
                  stageNumber: 1
                  levelNumber: 1
                }
                # Review General - Stage 2
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "reviewSelfAssignable" }
                  }
                  stageNumber: 2
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
    }
  `
]