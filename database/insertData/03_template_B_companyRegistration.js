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
          isLinear: false
          status: AVAILABLE
          startMessage: "## You will need the following documents ready for upload:\\n- Proof of Company name\\n- Proof of company address\\n- Organisation licence document"
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                id: 1001
                code: "S1"
                title: "Section 1 - Organisation Details"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      id: 2000
                      code: "S1T1"
                      index: 0
                      title: "Intro Section 1"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "Company details"
                        text: "The details entered should match with your registered company documents attached."
                      }
                    }
                    {
                      id: 2001
                      code: "S1Q1"
                      index: 1
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
                      parameters: { label: "What is your company name?" }
                    }
                    {
                      id: 2002
                      code: "S1Q2"
                      index: 2
                      title: "Organisation Activity"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Select type of activity"
                        options: ["Manufacturer", "Importer", "Producer"]
                      }
                    }
                    {
                      id: 2003
                      code: "S1Q3"
                      index: 5
                      title: "Organisation national or international"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Organisation Nationality"
                        description: "Select the nationality of this company:"
                        options: ["National", "International"]
                      }
                    }
                    {
                      id: 2004
                      code: "S1Q4"
                      index: 6
                      title: "Import permit upload"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.S1Q3.text"]
                          }
                          "International"
                        ]
                      }
                      parameters: { text: "Upload your valid import permit" }
                      isRequired: false
                    }
                  ]
                }
              }
              {
                id: 1002
                code: "S2"
                title: "Section 2"
                index: 1
                templateElementsUsingId: {
                  create: [
                    {
                      id: 2005
                      code: "S2T1"
                      index: 0
                      title: "Intro Section 2 - Page 1/2"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { title: "Company location" }
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.S1Q3.text"]
                          }
                          "National"
                        ]
                      }
                    }
                    {
                      id: 2006
                      code: "S2Q1"
                      index: 1
                      title: "Address"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Enter the organisation street address"
                      }
                    }
                    {
                      id: 2007
                      code: "S2Q2"
                      index: 2
                      title: "Organisation region"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Enter the company region" }
                    }
                    {
                      id: 2008
                      code: "S2T2"
                      index: 4
                      title: "Intro Section 2 - Page 2/2"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { title: "Licence Details" }
                    }
                    {
                      id: 2009
                      code: "S2Q3"
                      index: 5
                      title: "Licence"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "What is your licence no.?" }
                    }
                    {
                      id: 2010
                      code: "S2Q4"
                      index: 6
                      title: "Registration document"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      isEditable: false
                      parameters: { label: "TO-DO: upload licence" }
                    }
                  ]
                }
              }
              {
                id: 1003
                code: "S3"
                title: "Section 3"
                index: 2
                templateElementsUsingId: {
                  create: [
                    {
                      id: 2011
                      code: "S3T1"
                      index: 0
                      title: "Intro Section 1 - Page 1/1"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: { title: "Company staff details" }
                    }
                    {
                      id: 2012
                      code: "S3Q1"
                      index: 1
                      title: "Organisation Size"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "What is the size of the organization"
                        options: ["Small", "Medium", "Large"]
                      }
                      isRequired: false
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
                    children: ["applicationData.responses.S1Q1.text"]
                  }
                  licence_number: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.S2Q3.text"]
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
