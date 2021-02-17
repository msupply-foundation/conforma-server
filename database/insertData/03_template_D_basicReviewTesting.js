/*
TEMPLATE D - Review (testing)
  - a simple template with multiple pages in multiple sections to be used
    for testing the application review process
*/
exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "ReviewTest"
          name: "Test -- Review Process"
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
                id: 5
                number: 1
                title: "Screening"
                description: "This application will go through the Screening stage before it can be accessed."
              }
              {
                id: 6
                number: 2
                title: "Assessment"
                description: "This phase is where your documents will be revised before the application can get the final approval."
              }
              {
                id: 7
                number: 3
                title: "Final Decision"
                description: "This is the final step and will change the outcome of this applications."
              }
            ]
          }
          templateActionsUsingId: {
            create: [
              {
                actionCode: "incrementStage"
                trigger: ON_APPLICATION_CREATE
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: ["applicationData.applicationId"]
                  }
                }
              }
              {
                actionCode: "changeStatus"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 1
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: ["applicationData.applicationId"]
                  }
                  newStatus: { value: "Submitted" }
                }
              }
              {
                actionCode: "cLog"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 2
                parameterQueries: { message: "Application Submitted" }
              }
              {
                actionCode: "generateReviewAssignments"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 3
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: ["applicationData.applicationId"]
                  }
                  templateId: {
                    operator: "objectProperties"
                    children: ["applicationData.templateId"]
                  }
                  stageId: {
                    operator: "objectProperties"
                    children: ["applicationData.stageId"]
                  }
                  stageNumber: {
                    operator: "objectProperties"
                    children: ["applicationData.stageNumber"]
                  }
                }
              }
              {
                actionCode: "changeStatus"
                trigger: ON_REVIEW_CREATE
                parameterQueries: {
                  reviewId: {
                    operator: "objectProperties"
                    children: ["applicationData.record_id"]
                  }
                  newStatus: { value: "Draft" }
                }
              }
              {
                actionCode: "generateReviewAssignments"
                trigger: ON_REVIEW_SUBMIT
                # sequence: 1
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: ["applicationData.applicationId"]
                  }
                  templateId: {
                    operator: "objectProperties"
                    children: ["applicationData.templateId"]
                  }
                  reviewId: {
                    operator: "objectProperties"
                    children: ["applicationData.record_id"]
                  }
                  stageId: {
                    operator: "objectProperties"
                    children: ["applicationData.stageId"]
                  }
                  stageNumber: {
                    operator: "objectProperties"
                    children: ["applicationData.stageNumber"]
                  }
                }
              }
              {
                actionCode: "trimResponses"
                trigger: ON_REVIEW_SUBMIT
                sequence: 1
                parameterQueries: {
                  reviewId: {
                    operator: "objectProperties"
                    children: ["applicationData.record_id"]
                  }
                }
              }
            ]
          }
          templatePermissionsUsingId: {
            create: [
              { id: 4000, permissionNameId: 2000 }
              {
                id: 4001
                permissionNameId: 5000
                stageNumber: 1
                level: 1
                restrictions: { templateSectionRestrictions: ["S1"] }
              }
              {
                id: 4002
                permissionNameId: 5001
                stageNumber: 1
                level: 1
                restrictions: { templateSectionRestrictions: ["S2"] }
              }
              { id: 4003, permissionNameId: 6000, stageNumber: 2, level: 1 }
              { id: 4004, permissionNameId: 6001, stageNumber: 2, level: 2 }
              { id: 4005, permissionNameId: 7000, stageNumber: 3, level: 1 }
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
