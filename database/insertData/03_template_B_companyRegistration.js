/* 
TEMPLATE B - Organisation Registration
  - still a work in progress, but this will be the template for creating an
    application to register an organisation
*/
const { coreActions } = require('./core_actions')
const { devActions } = require('./dev_actions')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "OrgRego1"
          name: "Organisation Registration"
          isLinear: true
          status: AVAILABLE
          startMessage: "## You will need the following documents ready for upload:\\n- Proof of Company name\\n- Proof of company address\\n- Organisation licence document"
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                id: 1001
                code: "S1"
                title: "Section 1: Organisation Details"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      id: 2000
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
                      id: 2010
                      code: "name"
                      index: 20
                      title: "Organisation Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "API"
                        children: [
                          "http://localhost:8080/check-unique"
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
                      id: 2020
                      code: "rego"
                      index: 30
                      title: "Registration"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "API"
                        children: [
                          {
                            operator: "CONCAT",
                            children: [
                              {
                                operator: "objectProperties",
                                children: [
                                  "applicationData.config.serverREST"
                                ]
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
                      id: 2030
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
                      id: 2040
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
                      id: 2050
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
                      }
                    }
                    {
                      id: 2060
                      code: "PB1"
                      index: 70
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      id: 2070
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
                      id: 2080
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
                id: 1002
                code: "S2"
                title: "Section 2: Documentation"
                index: 1
                templateElementsUsingId: {
                  create: [
                    {
                      id: 2100
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
                      id: 2110
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
                      id: 2120
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
                      id: 2130
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
                # condition: TO-DO -- need to check if
                # Decision is Approved
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
                # condition: TO-DO -- need to check if
                # Decision is Approved
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
                    operator: "stringSubstitution"
                    children: [
                      "%1\\n%2"
                      {
                        operator: "objectProperties"
                        children: ["applicationData.responses.S2Q1.text"]
                      }
                      {
                        operator: "objectProperties"
                        children: ["applicationData.responses.S2Q2.text"]
                      }
                    ]
                  }
                }
              }
              {
                actionCode: "joinUserOrg"
                trigger: ON_REVIEW_SUBMIT
                sequence: 102
                # condition: TO-DO -- need to check if
                # Decision is Approved
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
                # condition: TO-DO -- need to check if
                # Decision is Approved
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
              { permissionNameId: 10100 }
              # Review Company rego
              { permissionNameId: 4000, stageNumber: 1 }
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
