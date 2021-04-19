/* 
TEMPLATE B - Organisation Registration
  - for creating a new Organisation in the system. Requires single review
  by reviewer with "reviewCompanyRego" permission
*/
const { coreActions } = require('./core_actions')
const { devActions } = require('./dev_actions')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "OrgRegistration"
          name: "Organisation Registration"
          isLinear: true
          status: AVAILABLE
          startMessage: "## You will need the following documents ready for upload:\\n- Proof of Company name\\n- Proof of company address\\n- Organisation licence document"
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
                        title: "Organisation details"
                        text: "The details entered should match with your registered company documents. You will attach these in Section 2."
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
                          "orgRegistration"
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
                            "Documentation for Organisation: %1"
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
                      category: QUESTION
                      isRequired: true
                      parameters: {
                        label: "Please provide proof of your organisation registration"
                        description: "A certificate from your country's registration body will be required.  \\nAllowed formats: .pdf, .doc, .jpg, .png"
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
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Please provide any other documentation pertinent to your organisation's activities"
                        description: "For example: import permits  \\nAllowed formats: .pdf, .doc, .jpg, .png"
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
                parameterQueries: {
                  message: { value: "Company Registration submission" }
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
                  applicationId: {
                    operator: "objectProperties"
                    children: ["applicationData.record_id"]
                  }
                  newOutcome: { value: "Approved" }
                }
              }
              {
                actionCode: "createOrg"
                trigger: ON_REVIEW_SUBMIT
                sequence: 101
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
                  user_id: {
                    operator: "objectProperties"
                    children: ["applicationData.userId"]
                  }
                  organisation_id: {
                    operator: "objectProperties"
                    children: ["output.orgId"]
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
                  username: {
                    operator: "objectProperties"
                    children: ["applicationData.username"]
                  }
                  orgName: {
                    operator: "objectProperties"
                    children: ["output.orgName"]
                  }
                  permissionNames: ["reviewJoinCompany"]
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
              # Review Company rego
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewCompanyRego" }
                }
                stageNumber: 1
                levelNumber: 1
                restrictions: { canSelfAssign: true }
              }
              # Assign General
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "assignGeneral" }
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
      }
    }
  }`,
]
