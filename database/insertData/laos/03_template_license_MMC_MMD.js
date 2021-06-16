/*
TEMPLATE C - Company license type MMC, MMD, MDC, MDM, WSL or RIT
  - for MMC => Modern Medicines
  - for MMD => Medical Devices
*/

const { coreActions, joinFilters } = require('../_helpers/core_mutations')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
          template: {
            code: "CompanyLicense"
            name: "Company License for Modern medicines or Medical devices"
            isLinear: false # CHANGE THIS
            status: AVAILABLE
            startMessage: "## Apply for a company license for:\\n\\n Modern medicines or Medical devices.\\n\\n**You will be required to upload the following documents:**\\n- **LMMD01**: Letter of request \\n- **LMMD12**: Letter from mother-company authorizing establishment of branch\\n- **LMMD15**: Site inspection report by F&D unit\\n- **LMMD16**: Company/manufacturer profile (including site master file and GMP certification where applicable)"
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
                        code: "Q1ApplicantFirstName"
                        index: 10
                        title: "Applicant first name"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "First name" }
                        defaultValue: {
                          operator: "buildObject"
                          properties: [
                            {
                              key: "text"
                              value: {
                                operator: "objectProperties"
                                children: ["currentUser.firstName"]
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
                        category: INFORMATION
                        parameters: { label: "Last name" }
                        defaultValue: {
                          operator: "buildObject"
                          properties: [
                            {
                              key: "text"
                              value: {
                                operator: "objectProperties"
                                children: ["currentUser.lastName"]
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
                        category: INFORMATION
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
                        category: INFORMATION
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
                        category: INFORMATION
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
                        code: "S1PB1"
                        index: 60
                        title: "Page Break"
                        elementTypePluginCode: "pageBreak"
                        category: INFORMATION
                      }
                      {
                        code: "S1BirthAddress"
                        index: 70
                        title: "Section 1 - Place of birth"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { 
                          title: "### Place of birth", 
                          style: "none"
                        }
                      }
                      {
                        code: "Q6Village"
                        index: 80
                        title: "Village"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        isRequired: false
                        parameters: { label: "Village" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getUser($id: Int!){user(id: $id) {birthPlaceVillage}}",
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
                                  "user.birthPlaceVillage"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q7District"
                        index: 90
                        title: "District"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        isRequired: false
                        parameters: { label: "District/Province" }
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
                        code: "S1CurrentAddress"
                        index: 110
                        title: "Section 1 - Current address"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { 
                          title: "### Current address"
                          style: "none"
                        }
                      }
                      {
                        code: "Q8Village"
                        index: 120
                        title: "Village"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        isRequired: false
                        parameters: { label: "Village" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getUser($id: Int!){user(id: $id) {currentAddressVillage}}",
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
                                  "user.currentAddressVillage"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q9District"
                        index: 140
                        title: "District"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        isRequired: false
                        parameters: { label: "District/Province" }
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
                        code: "S1PB2"
                        index: 150
                        title: "Page Break"
                        elementTypePluginCode: "pageBreak"
                        category: INFORMATION
                      }
                      {
                        code: "S1Page3"
                        index: 160
                        title: "Section 1 - Education"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { 
                          title: "### Education"
                          style: "none"
                        }
                      }
                      {
                        code: "Q10EducationLevel"
                        index: 170
                        title: "Organisation Category"
                        elementTypePluginCode: "radioChoice"
                        category: INFORMATION
                        parameters: {
                          label: "Education Level"
                          layout: "inline"
                          options: ["Secondary", "University"]
                        }
                        defaultValue: {
                          operator: "graphQL",
                          children: [
                            "query getUser($id: Int!){user(id: $id) {educationLevel}}",
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
                            "user.educationLevel"
                          ]
                        }
                      }
                      {
                        code: "Q11Secondary"
                        index: 180
                        title: "Secondary"
                        elementTypePluginCode: "longText"
                        category: INFORMATION
                        parameters: { label: "Please enter details for secondary"}
                        visibilityCondition: {
                          operator: "="
                          children: [
                            {
                              operator: "objectProperties"
                              children: ["responses.Q10EducationLevel.text"]
                            }
                            "Secondary"
                          ]
                        }
                        defaultValue: {
                          operator: "buildObject"
                          properties: [
                            {
                              key: "text"
                              value: {
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
                          ]
                        }
                      }
                      {
                        code: "Q12EducationHistory"
                        index: 190
                        title: "Education List"
                        elementTypePluginCode: "listBuilder"
                        category: INFORMATION
                        parameters: {
                          label: "Education history"
                          displayType: "table"
                          displayOnly: true
                          inputFields: [
                            {
                              code: "LB1"
                              title: "Name of institution"
                            }
                            {
                              code: "LB2"
                              title: "University year"
                            }
                            {
                              code: "LB3"
                              title: "University title"
                            }
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
                        visibilityCondition: {
                          operator: "="
                          children: [
                            {
                              operator: "objectProperties"
                              children: ["responses.Q10EducationLevel.text"]
                            }
                            "University"
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
                        title: "Section 2 - Professional details"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        helpText: "The following questions are automatically filled with existing information from **Company registration**"
                        parameters: {
                          title: "### Professional details"
                          style: "none"
                        }
                      }
                      {
                        code: "Q1ProfessionalId"
                        index: 20
                        title: "Professional ID"
                        elementTypePluginCode: "shortText"
                        defaultValue: {
                          operator: "graphQL",
                          children: [
                            "query getOrganisation($id: Int!){organisation(id: $id) {professionalId}}",
                            "",
                            [
                              "id"
                            ],
                            {
                              operator: "objectProperties",
                              children: [
                                "currentUser.organisation.orgId"
                              ]
                            },
                            "organisation.professionalId"
                          ]
                        }
                        category: INFORMATION
                        parameters: {
                          label: "Professional ID"
                          
                        }
                      }
                      {
                        code: "Q2ProfessionalExperience"
                        index: 30
                        title: "Professional experience"
                        elementTypePluginCode: "listBuilder"
                        defaultValue: {
                          operator: "graphQL",
                          children: [
                            "query getOrganisation($id: Int!){organisation(id: $id) {professionalExperience}}",
                            "",
                            [
                              "id"
                            ],
                            {
                              operator: "objectProperties",
                              children: [
                                "currentUser.organisation.orgId"
                              ]
                            },
                            "organisation.professionalExperience"
                          ]
                        }
                        category: INFORMATION
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
                  title: "Company details"
                  index: 2
                  templateElementsUsingId: {
                    create: [
                      {
                        code: "Q1CompanyNameLao"
                        index: 20
                        title: "Name of company/branch/wholesaler (in Lao) "
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "Name of company/branch/wholesaler (in Lao) " }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {name}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.name"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q2CompanyNameEnglish"
                        index: 30
                        title: "Name of company/branch/wholesaler (in English)"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "Name of company/branch/wholesaler (in English)" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {nameEnglish}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.nameEnglish"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q3CompanyAddressStreet"
                        index: 40
                        title: "Address street"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "Address" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {addressStreet}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.addressStreet"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q4CompanyAddressVillage"
                        index: 50
                        title: "Adress village"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "Village" }
                        isRequired: false
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {addressVillage}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.addressVillage"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q5CompanyAddressDistrict"
                        index: 60
                        title: "District"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "District/Province" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {addressDistrict}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.addressDistrict"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "S3PB1"
                        index: 70
                        title: "Page Break"
                        elementTypePluginCode: "pageBreak"
                        category: INFORMATION
                      }
                      {
                        code: "S3CompanyContact"
                        index: 80
                        title: "Section 3 - Company contact"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { 
                          title: "### Company contact"
                          style: "none"
                        }
                      }
                      {
                        code: "Q6CompanyPhone"
                        index: 90
                        title: "Phone"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "Phone" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {phone}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.phone"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q7CompanyFax"
                        index: 100
                        title: "Fax"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "Fax" }
                        isRequired: false
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {fax}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.fax"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q8CompanyEmail"
                        index: 110
                        title: "Email"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "Email" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {email}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.email"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "S3PB2"
                        index: 120
                        title: "Page Break"
                        elementTypePluginCode: "pageBreak"
                        category: INFORMATION
                      }
                      {
                        code: "S3CompanyInvestment"
                        index: 130
                        title: "Section 3 - Company investment"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { 
                          title: "### Investment"
                          style: "none"
                        }
                      }
                      {
                        code: "Q9DomesticInvestment"
                        index: 140
                        title: "Domestic"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "Domestic" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {domesticInvestment}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.domesticInvestment"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q9ForeignInvestment"
                        index: 150
                        title: "Foreign"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "Foreign" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {foreignInvestment}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.foreignInvestment"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "S3Owner"
                        index: 160
                        title: "Section 3 - Owner details"
                        elementTypePluginCode: "textInfo"
                        category: INFORMATION
                        parameters: { 
                          title: "### Owner details"
                          style: "none"
                        }
                      }
                      {
                        code: "Q10CompanyOwnerName"
                        index: 170
                        title: "Owner name"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { 
                          label: "Company owner"
                          helpText: "Full name of company owner (as licensed at M. of Commerce)"
                        }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {ownerName}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.ownerName"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q11CompanyOwnerPhone"
                        index: 180
                        title: "Owner phone"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "Owner phone" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {ownerPhone}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.ownerPhone"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q12CompanyOwnerFax"
                        index: 190
                        title: "Owner fax"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "Owner fax" }
                        isRequired: false
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {ownerFax}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.ownerFax"
                                ]
                              }
                            }
                          ]
                        }
                      }
                      {
                        code: "Q13CompanyOwnerEmail"
                        index: 200
                        title: "Owner email"
                        elementTypePluginCode: "shortText"
                        category: INFORMATION
                        parameters: { label: "Owner email" }
                        defaultValue: {
                          operator: "buildObject",
                          properties: [
                            {
                              key: "text",
                              value: {
                                operator: "graphQL",
                                children: [
                                  "query getOrganisation($id: Int!){organisation(id: $id) {ownerEmail}}",
                                  "",
                                  [
                                    "id"
                                  ],
                                  {
                                    operator: "objectProperties",
                                    children: [
                                      "currentUser.organisation.orgId"
                                    ]
                                  },
                                  "organisation.ownerEmail"
                                ]
                              }
                            }
                          ]
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
                        code: "Q1ProductType"
                        index: 10
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
                        index: 20
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
                  title: "Documentation"
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
                  title: "Review"
                  description: "This application will be processed by one level Reviewer.\\nAfter this stage is approved a license is generated."
#                 title: "Screening"
#                 description: "This application will be screened one level Reviewer\\nAfter this stage the application will be acessed."
                  colour: "#24B5DF" #teal blue
                  templateStageReviewLevelsUsingId: {
                    create: [{ number: 1, name: "Screener" }]
                  }
                }
#               {
#                 number: 2
#                 title: "Assessment"
#                 description: "This application will be acessed by one level Reviewer\\nAfter this stage, when approved a license is generated."
#                 colour: "#E17E48" #orange
#                 templateStageReviewLevelsUsingId: {
#                   create: [{ number: 1, name: "Assessor" }]
#                 }
#               }
              ]
            }
            templateCategoryToTemplateCategoryId: {
              connectByCode: { code: "license" }
            }
            ${joinFilters}
            templateActionsUsingId: {
              create: [
                ${coreActions}
                {
                  actionCode: "cLog"
                  trigger: ON_APPLICATION_SUBMIT
                  parameterQueries: {
                    message: { value: "Company License submission" }
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
                # TODO: Generate the expiry and serial before this
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
                    tableName: "license"
                    type: {
                      operator: "objectProperties"
                      children: ["applicationData.responses.Q2LicenseType.text"]
                    }
                    expiry_date: "31/01/2022"
#                   company_id: {
#                     operator: "objectProperties"
#                     children: ["currentUser.organisation.orgId"]
#                   }
                    company_name: {
                      operator: "objectProperties"
                      children: ["applicationData.responses.Q1CompanyNameLao.text"]
                    }
                    serial: {
                      operator: "CONCAT"
                      children: [
                        {
                          operator: "objectProperties"
                          children: ["applicationData.responses.Q1CompanyNameLao.text"]
                        }
                        ":"
                        "1234"
                      ]
                    }
#                   application_id: {
#                     operator: "objectProperties"
#                     children: ["applicationData.id"]
#                   }
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
                    orgId: {
                      operator: "objectProperties"
                      children: ["applicationData.orgId"]
                    }
                    permissionNames: ["reviewJoinOrg"]
                  }
                }
                {
                  actionCode: "grantPermissions"
                  trigger: ON_REVIEW_SUBMIT
                  sequence: 104
                  # TO-DO -- update condition to just check Outcome
                  # (from applicationData)
                  condition: {
                    operator: "AND"
                    children: [
                      {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["applicationData.outcome"]
                          }
                          "APPROVED"
                        ]
                      }
                      {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["applicationData.responses.Q2LicenseType.text"]
                          }
                          "import/export medicines and medical devices"
                        ]
                      }
                    ]
                  }
                  parameterQueries: {
                    username: {
                      operator: "objectProperties"
                      children: ["applicationData.username"]
                    }
                    orgId: {
                      operator: "objectProperties"
                      children: ["applicationData.orgId"]
                    }
                    permissionNames: ["applyImportPermit"]
                  }
                }
                {
                  actionCode: "grantPermissions"
                  trigger: ON_REVIEW_SUBMIT
                  sequence: 105
                  # TO-DO -- update condition to just check Outcome
                  # (from applicationData)
                  condition: {
                    operator: "AND"
                    children: [
                      {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["applicationData.outcome"]
                          }
                          "APPROVED"
                        ]
                      }
                      {
                        operator: "!="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["applicationData.responses.Q2LicenseType.text"]
                          }
                          "import/export medicines and medical devices"
                        ]
                      }
                      {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["applicationData.responses.Q1ProductType.text"]
                          }
                          "modern medicines"
                        ]
                      }
                    ]
                  }
                  parameterQueries: {
                    username: {
                      operator: "objectProperties"
                      children: ["applicationData.username"]
                    }
                    orgId: {
                      operator: "objectProperties"
                      children: ["applicationData.orgId"]
                    }
                    permissionNames: ["applyDrugRegoMMC"]
                  }
                }
                {
                  actionCode: "grantPermissions"
                  trigger: ON_REVIEW_SUBMIT
                  sequence: 105
                  # TO-DO -- update condition to just check Outcome
                  # (from applicationData)
                  condition: {
                    operator: "AND"
                    children: [
                      {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["applicationData.outcome"]
                          }
                          "APPROVED"
                        ]
                      }
                      {
                        operator: "!="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["applicationData.responses.Q2LicenseType.text"]
                          }
                          "import/export medicines and medical devices"
                        ]
                      }
                      {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["applicationData.responses.Q1ProductType.text"]
                          }
                          "medical devices"
                        ]
                      }
                    ]
                  }
                  parameterQueries: {
                    username: {
                      operator: "objectProperties"
                      children: ["applicationData.username"]
                    }
                    orgId: {
                      operator: "objectProperties"
                      children: ["applicationData.orgId"]
                    }
                    permissionNames: ["applyDrugRegoMMD"]
                  }
                }
              ]
            }
            templatePermissionsUsingId: {
              create: [
                # Apply Company license (granted on Company registration)
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyOrgLicense" }
                  }
                }
                # Review General - Stage 1
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "reviewOrgLicence" }
                  }
                  stageNumber: 1
                  levelNumber: 1
                }
                # Assign General - Stage 1
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "assignGeneral" }
                  }
                  stageNumber: 1
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
    }
  `,
]
