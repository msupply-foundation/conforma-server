/*
TEMPLATE D - Review (testing)
  - a simple template with multiple pages in multiple sections to be used
    for testing the application review process
*/
const { coreActions, joinFilters } = require('../_helpers/core_mutations')
const { devActions } = require('../_helpers/dev_actions')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "ReviewTest"
          name: "Test -- Review Process"
          namePlural: "Test -- Reviews Processes"
          status: AVAILABLE
          startMessage: "## You will need the following documents ready for upload:\\n- Proof of your identity\\n- Pictures of product\\n- Product licence document"
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                id: 1005
                code: "S1"
                title: "Personal Info"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      id: 4000
                      code: "Text1"
                      index: 0
                      title: "Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require your **personal information**"
                        style: "basic"
                      }
                    }
                    {
                      id: 4001
                      code: "Q1"
                      index: 1
                      title: "First Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "First Name" }
                    }
                    {
                      id: 4002
                      code: "Q2"
                      index: 2
                      title: "Last Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Last Name" }
                    }
                    {
                      id: 4003
                      code: "Q3"
                      index: 3
                      title: "Email"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
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
                      parameters: { label: "Email" }
                    }
                    {
                      id: 4004
                      code: "PB1"
                      index: 4
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      id: 4005
                      code: "Q4"
                      index: 5
                      title: "Age"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          { value: "^[0-9]+$" }
                        ]
                      }
                      validationMessage: "Response must be a number"
                      parameters: { label: "Age" }
                    }
                    {
                      id: 4006
                      code: "Q5"
                      index: 6
                      title: "Nationality"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Nationality"
                        placeholder: "Enter a country"
                      }
                    }
                  ]
                }
              }
              {
                id: 1006
                code: "S2"
                title: "Product Info"
                index: 1
                templateElementsUsingId: {
                  create: [
                    {
                      id: 4007
                      code: "Text2"
                      index: 0
                      title: "Product Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require your **PRODUCT information**"
                        style: "basic"
                      }
                    }
                    {
                      id: 4008
                      code: "Q20"
                      index: 1
                      title: "Product Name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Name of Product" }
                    }
                    {
                      id: 4009
                      code: "Q21"
                      index: 2
                      title: "Product Type"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "What type of product are you registering?"
                        placeholder: "Select"
                        options: ["Medicine", "Natural Product"]
                      }
                    }
                    {
                      id: 4010
                      code: "PB2"
                      index: 3
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      id: 4011
                      code: "Q22"
                      index: 4
                      title: "Dose Size"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Size of single dose"
                        placeholder: "Metric units please"
                      }
                    }
                    {
                      id: 4012
                      code: "Q23"
                      index: 5
                      title: "Packet Size"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          { value: "^[0-9]+$" }
                        ]
                      }
                      validationMessage: "Must be a number"
                      parameters: {
                        label: "How many doses per packet?"
                        placeholder: "Whole number"
                      }
                    }
                    {
                      id: 4013
                      code: "Q24"
                      index: 6
                      title: "Side Effects"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      isRequired: false
                      parameters: { label: "Please list any side effects" }
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
                actionCode: "cLog"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 2
                parameterQueries: { message: "Application Submitted" }
              }
              {
                actionCode: "generateTextString"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 100
                parameterQueries: {
                  pattern: "<?templateName>—<?productName>"
                  customFields: {
                    templateName: "applicationData.templateName",
                    productName: "applicationData.responses.Q20.text"
                  }
                  updateRecord: true
                  tableName: "application"
                  fieldName: "name"
                }
              }
            ]
          }
          templatePermissionsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewSelfAssignable" }
                }
                stageNumber: 1
                levelNumber: 1
                canSelfAssign: true
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewReviewTestAssessmentLvl1Section1" }
                }
                stageNumber: 2
                levelNumber: 1
                allowedSections: ["S1"]
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewReviewTestAssessmentLvl1Section2" }
                }
                stageNumber: 2
                levelNumber: 1
                allowedSections: ["S2"]
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewReviewTestAssessmentLvl2" }
                }
                stageNumber: 2
                levelNumber: 2
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewReviewTestApproval" }
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
