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
          code: "OrgRegistration"
          name: "Organisation Registration"
          isLinear: true
          status: AVAILABLE
          startMessage: "## You will need the following documents ready for upload:\\n- Proof of organisation name\\n- Proof of organisation address\\n- Organisation licence document"
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Section 1: Organisation Details"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S1T1"
                      index: 10
                      title: "Intro Section 1"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "## Organisation details"
                        style: "info"
                      }
                    }
                    {
                      code: "name"
                      index: 20
                      title: "Organisation Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
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
                      parameters: { label: "What is the name of your organisation?" }
                    }
                    {
                      code: "rego"
                      index: 30
                      title: "Registration"
                      elementTypePluginCode: "shortText"
                      helpText: "The details entered here should match with the documents issued by the governing body in your jurisdiction. You will attach evidence of these documents in the following section."
                      category: QUESTION
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
                          ["table", "field", "value"]
                          "organisation"
                          "registration"
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          "unique"
                        ]
                      }
                      validationMessage: "An organisation with that registration code already exists"
                      parameters: {
                        label: "Please enter your organisation registration code"
                      }
                    }
                    {
                      code: "physAdd"
                      index: 40
                      title: "Address"
                      elementTypePluginCode: "longText"
                      category: QUESTION
                      parameters: {
                        label: "Organisation **physical** address"
                      }
                    }
                    {
                      code: "addressCheckbox"
                      index: 50
                      title: "Postal Address Checkbox"
                      elementTypePluginCode: "checkbox"
                      category: QUESTION
                      parameters: {
                        label: "Is the organisation **postal** address *different* to the physical address?"
                      checkboxes: [
                        {
                          label: "Yes"
                          key: "1"
                          selected: false
                        }
                      ]
                      }
                    }
                    {
                      code: "postAdd"
                      index: 60
                      title: "Address"
                      elementTypePluginCode: "longText"
                      category: QUESTION
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.addressCheckbox.text"]
                          }
                          "Yes"
                        ]
                      }
                      parameters: {
                        label: "Organisation **postal** address"
                        description: "*Note: in the current schema only one address value is actually saved to the database. This is just for demonstration purposes.*"
                      }
                    }
                    {
                      code: "PB1"
                      index: 70
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "logo"
                      index: 80
                      title: "Logo upload"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Upload a logo for your organisation"
                        description: "File must be an image type (.jpg, .jpeg, .png, .gif, .svg) and less than 5MB"
                        fileCountLimit: 1
                        fileExtensions: ["jpg", "jpeg", "png", "gif", "svg"]
                        fileSizeLimit: 5000
                      }
                    }
                    {
                      code: "activity"
                      index: 90
                      title: "Organisation Activity"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "What is your organisation's primary activity"
                        options: ["Manufacturer", "Importer", "Producer"]
                      }
                    }
                  ]
                }
              }
              {
                code: "S2"
                title: "Section 2: Documentation"
                index: 1
                templateElementsUsingId: {
                  create: [
                    {
                      code: "orgInfo"
                      index: 10
                      title: "Intro Section 2 - Page 1/2"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: {
                          operator: "stringSubstitution"
                          children: [
                            "**Documentation for Organisation: %1**"
                            {
                              operator: "objectProperties"
                              children: ["responses.name.text"]
                            }
                          ]
                        }
                        text: {
                          operator: "stringSubstitution"
                          children: [
                            "Registration no. **%1**"
                            {
                              operator: "objectProperties"
                              children: ["responses.rego.text"]
                            }
                          ]
                        }
                        style: "basic"
                      }
                    }
                    {
                      code: "logoShow"
                      index: 20
                      title: "Show uploaded logo"
                      elementTypePluginCode: "imageDisplay"
                      category: INFORMATION
                      parameters: {
                        url: {
                          operator: "CONCAT"
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
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc", "docx"]
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
                        fileExtensions: ["jpg", "jpeg", "png", "pdf", "doc", "docx"]
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
                  registration_documentation: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.regoDoc"]
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
