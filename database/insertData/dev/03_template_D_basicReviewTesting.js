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
                actionCode: "scheduleAction"
                trigger: ON_APPLICATION_CREATE
                sequence: 100
                parameterQueries:{
                  eventCode: "warn1"
                  duration: { minute: 5 }
                }
              }
              {
                actionCode: "scheduleAction"
                trigger: ON_APPLICATION_CREATE
                sequence: 101
                parameterQueries:{
                  eventCode: "exp1"
                  duration: { minute: 10 }
                }
              }
              {
                actionCode: "sendNotification"
                trigger: ON_SCHEDULE
                eventCode: "warn1"
                condition: {
                  operator: "OR"
                  children: [
                    {
                      operator: "="
                      children: [
                        {
                          operator: "objectProperties"
                          children: ["applicationData.status"]
                        }
                        "DRAFT"
                      ]
                    },
                    {
                      operator: "="
                      children: [
                        {
                          operator: "objectProperties"
                          children: ["applicationData.status"]
                        }
                        "CHANGES_REQUESTED"
                      ]
                    }
                  ]
                }
                parameterQueries: {
                  fromName: "Application Manager"
                  fromEmail: "no-reply@sussol.net"
                  email: {
                    operator: "objectProperties"
                    children: ["applicationData.email", ""]
                  }
                  subject: {
                    operator: "stringSubstitution"
                    children: [
                      "Draft application %1 in progress",
                      {
                        operator: "objectProperties"
                        children: [ "applicationData.applicationSerial", ""]
                      }
                    ]
                  }
                  message: "Your application will expire if you don't complete it soon"
                }
              }
              {
                actionCode: "changeOutcome"
                trigger: ON_SCHEDULE
                eventCode: "exp1"
                sequence: 1
                condition: {
                  operator: "OR"
                  children: [
                    {
                      operator: "="
                      children: [
                        {
                          operator: "objectProperties"
                          children: ["applicationData.status"]
                        }
                        "DRAFT"
                      ]
                    },
                    {
                      operator: "="
                      children: [
                        {
                          operator: "objectProperties"
                          children: ["applicationData.status"]
                        }
                        "CHANGES_REQUESTED"
                      ]
                    }
                  ]
                }
                parameterQueries:{
                  newOutcome: "EXPIRED"
                }
              }
              {
                actionCode: "changeStatus"
                trigger: ON_SCHEDULE
                eventCode: "exp1"
                sequence: 2
                condition: {
                  operator: "OR"
                  children: [
                    {
                      operator: "="
                      children: [
                        {
                          operator: "objectProperties"
                          children: ["applicationData.status"]
                        }
                        "DRAFT"
                      ]
                    },
                    {
                      operator: "="
                      children: [
                        {
                          operator: "objectProperties"
                          children: ["applicationData.status"]
                        }
                        "CHANGES_REQUESTED"
                      ]
                    }
                  ]
                }
                parameterQueries:{
                  newStatus: "COMPLETED"
                }
              }
              {
                actionCode: "sendNotification"
                trigger: ON_SCHEDULE
                eventCode: "exp1"
                condition: {
                  operator: "OR"
                  children: [
                    {
                      operator: "="
                      children: [
                        {
                          operator: "objectProperties"
                          children: ["applicationData.status"]
                        }
                        "DRAFT"
                      ]
                    },
                    {
                      operator: "="
                      children: [
                        {
                          operator: "objectProperties"
                          children: ["applicationData.status"]
                        }
                        "CHANGES_REQUESTED"
                      ]
                    }
                  ]
                }
                parameterQueries: {
                  fromName: "Application Manager"
                  fromEmail: "no-reply@sussol.net"
                  email: {
                    operator: "objectProperties"
                    children: ["applicationData.email", ""]
                  }
                  subject: {
                    operator: "stringSubstitution"
                    children: [
                      "Your application %1 has expired",
                      {
                        operator: "objectProperties"
                        children: [ "applicationData.applicationSerial", ""]
                      }
                    ]
                  }
                  message: "Your application has expired. If you wish to continue, you'll need to re-apply."
                }
              }
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
              #
              # Change outcome of application to REJECT if decision in stage Screening is NON_CONFORM
              # Note: There is a generic core action to change an application outcome 
              # after the last level reviewer on the last stage submits a decision!
              #
              {
                actionCode: "changeOutcome"
                trigger: ON_REVIEW_SUBMIT
                sequence: 10
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
                        "NON_CONFORM"
                      ]
                    }
                    {
                      operator: "="
                      children: [
                        {
                          operator: "objectProperties"
                          children: ["applicationData.stage"]
                        }
                        "Screening"
                      ]
                    }
                    {
                      operator: "objectProperties"
                      children: ["applicationData.reviewData.isLastLevel"]
                    }
                  ]
                }
                parameterQueries: { newOutcome: { value: "REJECTED" } }
              }
              {
                actionCode: "generateTextString"
                trigger: ON_REVIEW_SUBMIT
                sequence: 100
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
                  pattern: "PR-[A-Z]{3}-<+ddd>"
                  counterName: "product"
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
                      children: ["applicationData.outcome"]
                    }
                    "APPROVED"
                  ]
                }
                parameterQueries: {
                  tableName: "product"
                  name: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q20.text"]
                  }
                  type: {
                    operator: "objectProperties"
                    children: ["applicationData.responses.Q21.text"]
                  }
                  expiry_date: {
                    operator: "objectFunctions"
                    children: [
                      "functions.generateExpiry"
                      { minute: 5 }
                    ]
                  }
                  serial: {
                    operator: "objectProperties"
                    children: ["outputCumulative.generatedText"]
                  }
#                   application_id: {
#                     operator: "objectProperties"
#                     children: ["applicationData.applicationId"]
#                   }
                }
              }
              {
                actionCode: "scheduleAction"
                trigger: ON_REVIEW_SUBMIT
                sequence: 102
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
                parameterQueries:{
                  eventCode: "prod_exp1"
                  duration: { minute: 5 }
                }
              }
              {
                actionCode: "sendNotification"
                trigger: ON_SCHEDULE
                eventCode: "prod_exp1"
                condition: {
                  operator: "=",
                  children: [
                    {
                      operator: "graphQL",
                      children: [
                        "query CheckExpired($id: Int!) {products(filter: {id: {equalTo: $id}, expiryDate: {lessThan: \\"now()\\"}}) {totalCount}}",
                        "graphQLEndpoint",
                        [
                          "id"
                        ],
                        {
                          operator: "objectProperties",
                          children: [
                            "outputCumulative.product.id"
                          ]
                        },
                        "products.totalCount"
                      ]
                    },
                    1
                  ]
                }
                parameterQueries: {
                  fromName: "Application Manager"
                  fromEmail: "no-reply@sussol.net"
                  email: {
                    operator: "objectProperties"
                    children: ["applicationData.email", ""]
                  }
                  subject: {
                    operator: "stringSubstitution"
                    children: [
                      "Your product %1 has expired",
                      {
                        operator: "objectProperties"
                        children: [ "outputCumulative.product.name", ""]
                      }
                    ]
                  }
                  message: "Your product registration has expired. If you wish to continue, you'll need to re-apply.\\n(Note: this is just a test to check the notification worked. Nothing proper has actually changed)"
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
