/* 
TEMPLATE B - Organisation Registration
  - for creating a new Organisation in the system. Requires single review
  by reviewer with "reviewOrgRego" permission
*/
const { coreActions, joinFilters } = require('../_helpers/core_mutations')
const { devActions } = require('../_helpers/dev_actions')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "CompanyRego"
          name: "Company Registration"
          isLinear: false # CHANGE THIS 
          status: AVAILABLE
          startMessage: "## Registering a company in the system\\n\\nYou will be required to upload the following documents as part of this registration process:\\n- Proof of organisation name\\n- Proof of organisation address\\n- Organisation licence document"
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
                          ["table", "field", "value"]
                          "organisation"
                          "name_lao"
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
                      code: "logo"
                      index: 30
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
                      index: 40
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "addressIntro"
                      index: 45
                      title: "Address Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { title: "### Address", style: "none" }
                    }
                    {
                      code: "addressNear"
                      index: 46
                      title: "Address Near"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      parameters: { label: "Near/by", maxLength: 150 }
                    }
                    {
                      code: "addressStreet"
                      index: 47
                      title: "Address Street"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "House number, street, village"
                        maxLength: 150
                      }
                    }
                    {
                      code: "addressDistrict"
                      index: 48
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
                      index: 50
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
                          "^[0-9()-]+$"
                        ]
                      }
                      validationMessage: "Not a valid phone number"
                    }
                    {
                      code: "fax"
                      index: 51
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
                          "^[0-9()-]+$"
                        ]
                      }
                      validationMessage: "Not a valid fax number"
                    }
                    {
                      code: "email"
                      index: 52
                      title: "Email"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Email"
                        default: {
                          operator: "objectProperties"
                          children: ["currentUser.email"]
                        }
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
                  ]
                }
              }
              {
                code: "S2"
                title: "Documentation"
                index: 1
                templateElementsUsingId: {
                  create: [
                    {
                      code: "orgHeader"
                      elementTypePluginCode: "textInfo"
                      index: 5
                      title: "Organisation Header"
                      category: INFORMATION
                      parameters: {
                        text: {
                          operator: "stringSubstitution"
                          children: [
                            "### %1\\n\\n### %2"
                            {
                              operator: "objectProperties"
                              children: ["responses.S1NameLao.text"]
                            }
                            {
                              operator: "objectProperties"
                              children: ["responses.S1NameEng.text"]
                            }
                          ]
                        }
                      }
                    }
                    {
                      code: "logoShow"
                      index: 6
                      title: "Show uploaded logo"
                      elementTypePluginCode: "imageDisplay"
                      category: INFORMATION
                      parameters: {
                        url: {
                          operator: "+"
                          children: [
                            {
                              operator: "objectProperties"
                              children: ["applicationData.config.serverREST"]
                            }
                            {
                              operator: "objectProperties"
                              children: ["responses.logo.files.fileUrl"]
                            }
                          ]
                        }
                        size: "tiny"
                        alignment: "center"
                        altText: "Organisation logo"
                      }
                    }
                    {
                      code: "docsInfo"
                      index: 10
                      title: "Documentation Header"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, you are required to upload documentation. The following items are required:\\n\\n  - **LMMD02** – CV of applicant with recent (max 1 year) photo\\n- **LMMD04** – Certificate of current residence with photo (max 3 months)\\n- **LMMD08** – Letter from previous employers documenting at least 3 years professional experience (for private sector must be certified by provincial or capital level)\\n- **LMMD09** – Documentation showing resignation from previous employment (for private sector must be certified by provincial or capital level)\\n- **LMMD10** – Map of location of company\\n- **LMMD14** – Copy of business licence issued by Ministry of Commerce\\n- **LMMD16** – Company/manufacturer profile (including site master file and GMP certification where applicable) describing origin of products, staff and qualifications, facilities and equipment, business experience, business development plan"
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
                      code: "regoDoc"
                      index: 30
                      title: "Registration upload"
                      elementTypePluginCode: "fileUpload"
                      helpText: "Certification from your country's registration body is required."
                      category: QUESTION
                      isRequired: true
                      parameters: {
                        label: "Please provide proof of your organisation registration"
                        description: "Allowed formats: .pdf, .doc, .jpg, .png"
                        fileCountLimit: 1
                        fileExtensions: [
                          "jpg"
                          "jpeg"
                          "png"
                          "pdf"
                          "doc"
                          "docx"
                        ]
                        fileSizeLimit: 5000
                      }
                    }
                    {
                      code: "otherDoc"
                      index: 40
                      title: "Other documentation upload"
                      elementTypePluginCode: "fileUpload"
                      helpText: "Examples might include import permits."
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Please provide any other documentation pertinent to your organisation's activities"
                        description: "Allowed formats: .pdf, .doc, .jpg, .png"
                        fileExtensions: [
                          "jpg"
                          "jpeg"
                          "png"
                          "pdf"
                          "doc"
                          "docx"
                        ]
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
                    operator: "CONCAT",
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
              # Apply General
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
                }
              }
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
              # Assign General
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
  }`,
]
