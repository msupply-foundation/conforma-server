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
            startMessage: "## Apply for a company license under one of the following options:\\n - MMC\\n - MMD\\n - MDC\\n - MDM\\n - WSL\\n - RIT\\n\\n**TODO**: Update the following list:\\nYou will be required to upload the following documents as part of this  process:\\n- Proof of organisation name\\n- Proof of organisation address\\n- Organisation licence document"
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
                        title: "Intro Section 1"
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
                        title: "Section 1 - page 2"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { title: "## Place of birth", style: "info" }
                      }
                      {
                        code: "Q6Vilage"
                        index: 80
                        title: "Vilage"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isEditable: false
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
                        title: "Section 1 - page 3"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { title: "## Current address", style: "info" }
                      }
                      {
                        code: "Q9Vilage"
                        index: 120
                        title: "Vilage"
                        elementTypePluginCode: "shortText"
                        category: QUESTION
                        isEditable: false
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
                        title: "Section 1 - page 4"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { title: "## Education", style: "info" }
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
                          options: ["Secondary", "University"]
                          layout: "inline"
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
                        code: "Q12EducationHistory"
                        index: 180
                        title: "Education List"
                        elementTypePluginCode: "listBuilder"
                        category: QUESTION
                        isEditable: false
                        parameters: {
                          label: "Education history"
                          createModalButtonText: "Add to education history"
                          modalText: "## Education history entry \\n\\nPlease enter details for university"
                          visibilityCondition: {
                            operator: "!="
                            children: [
                              {
                                operator: "objectProperties"
                                children: ["responses.Q12EducationLevel.selected"]
                              }
                              "University"
                            ]
                          }
                          displayType: "card"
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
                              title: "year"
                              elementTypePluginCode: "shortText"
                              category: QUESTION
                              parameters: {
                                label: "Year of conclusion"
                                maxWidth: 50
                              }
                              isRequired: false
                            }
                            {
                              code: "LB3"
                              title: "Title"
                              elementTypePluginCode: "shortText"
                              category: QUESTION
                              parameters: {
                                label: "Title"
                                description: "Enter the title received by applicant"
                                maxWidth: 130
                              }
                            }
                          ]
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
                        title: "Intro Section 1"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        helpText: "The following questions are automatically filled with existing information about **Applicant**"
                        parameters: {
                          title: "## Professional details"
                          style: "basic"
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
                        title: "Intro Section 1"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        helpText: "The following questions are automatically filled with existing information about **Company**"
                        parameters: {
                          title: "## Company details"
                          style: "basic"
                        }
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
                        title: "Intro Section 1"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { title: "## License details", style: "basic" }
                      }
                      {
                        code: "LicenseType"
                        index: 20
                        title: "License type"
                        elementTypePluginCode: "radioChoice"
                        category: QUESTION
                        helpText: "Selectin the license to apply for will grat the specific license to this company an expiry date genrated on Approval"
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
                        children: ["applicationData.outcome"]
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