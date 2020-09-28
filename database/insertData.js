const fetch = require('node-fetch')

const graphQLendpoint = 'http://localhost:5000/graphql'

const queries = [
  // Template A -- User Registration
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "UserRego1"
          name: "User Registration"
          status: AVAILABLE
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Section 1"
                templateElementsUsingId: {
                  create: [
                    {
                      code: "Q1"
                      nextElementCode: "Q2"
                      title: "First Name"
                      elementTypePluginCode: "short_text"
                      visibilityCondition: { value: true }
                      category: QUESTION
                      isRequired: true
                      isEditable: { value: true }
                      parameters: { label: "First Name" }
                    }
                    {
                      code: "Q2"
                      nextElementCode: "BR1"
                      title: "Surname"
                      elementTypePluginCode: "drop_down"
                      visibilityCondition: { value: true }
                      category: QUESTION
                      isRequired: true
                      isEditable: { value: true }
                      parameters: { label: "Last Name" }
                    }
                    {
                      code: "BR1"
                      nextElementCode: "Q3"
                      title: "Page 1"
                      elementTypePluginCode: "page_break"
                      visibilityCondition: { value: true }
                      category: INFORMATION
                      parameters: {}
                    }
                  ]
                }
              }
              { code: "S2", 
                title: "Section 2"
                templateElementsUsingId: {
                  create: [
                    {
                      code: "Q3"
                      title: "Company"
                      nextElementCode: "BR2"
                      elementTypePluginCode: "drop_down"
                      visibilityCondition: { value: true }
                      category: QUESTION
                      isRequired: true
                      isEditable: { value: true }
                      parameters: {
                        label: "Select your Company"
                        options: ["Company A", "Company B"]
                      }
                    }
                    {
                      code: "BR2"
                      title: "Page 2"
                      elementTypePluginCode: "page_break"
                      visibilityCondition: { value: true }
                      category: INFORMATION
                      parameters: {}
                    }
                  ]
                }
              }
            ]
          }
          templateStagesUsingId: { create: [{ number: 1, title: "Screening" }] }
        }
      }
    ) {
      template {
        code
        name
        templateSections {
          nodes {
            code
            title
            templateElementsBySectionId {
              nodes {
                code
                visibilityCondition
                parameters
                title
                category
              }
            }
          }
        }
      }
    }
  }
  `,
  // Template B - Company Registration
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "CompRego1"
          name: "Company Registration"
          status: AVAILABLE
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Section 1"
                templateElementsUsingId: {
                  create: [
                    {
                      code: "Q1"
                      nextElementCode: "Q2"
                      title: "Organisation Name"
                      elementTypePluginCode: "short_text"
                      visibilityCondition: { value: true }
                      category: QUESTION
                      isRequired: true
                      isEditable: { value: true }
                      parameters: { label: "Unique Name for Company" }
                    }
                    {
                      code: "Q2"
                      nextElementCode: "BR1"
                      title: "Organisation Activity"
                      elementTypePluginCode: "drop_down"
                      visibilityCondition: { value: true }
                      category: QUESTION
                      isRequired: true
                      isEditable: { value: true }
                      parameters: {
                        label: "Select type of activity"
                        options: ["Manufacturer", "Importer", "Producer"]
                      }
                    }
                    {
                      code: "BR1"
                      title: "Page 1"
                      elementTypePluginCode: "page_break"
                      visibilityCondition: { value: true }
                      category: INFORMATION
                      parameters: {}
                    }
                  ]
                }
              }
              { code: "S2", title: "Section 2" }
              { code: "S3", title: "Section 3" }
            ]
          }
          templateStagesUsingId: {
            create: [
              { number: 1, title: "Screening" }
              { number: 2, title: "Assessment" }
            ]
          }
          templateActionsUsingId: {
            create: {
              actionCode: "cLog"
              condition: "{value:true}"
              trigger: ON_APPLICATION_SUBMIT
              parameterQueries: {
                message: {
                  value: "The Action has been executed. Automated Actions FTW!!!"
                }
              }
            }
          }
        }
      }
    ) {
      template {
        code
        name
        templateSections {
          nodes {
            code
            title
            templateElementsBySectionId {
              nodes {
                code
                visibilityCondition
                parameters
                title
                category
              }
            }
          }
        }
      }
    }
  }`,
  //   Add some users
  `mutation {
    createUser(
      input: {
        user: { email: "nicole@sussol.net", password: "1234", username: "nicole" }
      }
    ) {
      user {
        email
        password
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: { email: "carl@sussol.net", password: "1234", username: "carl" }
      }
    ) {
      user {
        email
        password
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: { email: "andrei@sussol.net", password: "1234", username: "andrei" }
      }
    ) {
      user {
        email
        password
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: { email: "valerio@nra.org", password: "1234", username: "valerio" }
      }
    ) {
      user {
        email
        password
        username
      }
    }
  }`,
  //   User registration application 1
  `mutation {
    createApplication(
      input: {
        application: {
          name: "User Registration: Nicole Madruga"
          serial: 100
          isActive: true
          outcome: APPROVED
          userToUserId: { connectById: { id: 1 } }
          applicationSectionsUsingId: {
            create: [
              { 
                templateSectionId: 1 
                applicationResponsesUsingId: {
                  create: [
                    {
                      timeCreated: "NOW()"
                      value: "{text: 'Nicole'}"
                      templateElementToTemplateElementId: { connectById: { id: 1 } }
                    }
                    {
                      timeCreated: "NOW()"
                      value: "{text: 'Madruga'}"
                      templateElementToTemplateElementId: { connectById: { id: 2 } }
                    }
                  ]
                }
              }
              { templateSectionId: 2
                applicationResponsesUsingId: {
                  create: {
                    timeCreated: "NOW()"
                    value: "{option: '1'}"
                    templateElementToTemplateElementId: { connectById: { id: 4 } }
                  }
                }
              }
            ]
          }
          applicationStageHistoriesUsingId: {
            create: {
              templateStageToStageId: { connectById: { id: 1 } }
              timeCreated: "NOW()"
              isCurrent: true
              applicationStatusHistoriesUsingId: {
                create: {
                  status: COMPLETED
                  timeCreated: "NOW()"
                  isCurrent: true
                }
              }
            }
          }
          templateToTemplateId: { connectById: { id: 1 } }
        }
      }
    ) {
      application {
        name
        template {
          name
        }
        applicationSections {
          nodes {
            templateSection {
              title
            }
            applicationResponses {
              nodes {
                value
                templateElement {
                  title
                }
              }
            }
          }
        }
        applicationStageHistories {
          nodes {
            stage {
              title
            }
            isCurrent
            applicationStatusHistories {
              nodes {
                isCurrent
                status
              }
            }
          }
        }
      }
    }
  }`,
  // User Registration application 2
  `mutation {
    createApplication(
      input: {
        application: {
          name: "User Registration: Carl Smith"
          serial: 101
          isActive: true
          outcome: APPROVED
          userToUserId: { connectById: { id: 2 } }
          applicationSectionsUsingId: {
            create: [
              { 
                templateSectionId: 1 
                applicationResponsesUsingId: {
                  create: [
                    {
                      timeCreated: "NOW()"
                      value: "{text: 'Carl'}"
                      templateElementToTemplateElementId: { connectById: { id: 1 } }
                    }
                    {
                      timeCreated: "NOW()"
                      value: "{text: 'Smith'}"
                      templateElementToTemplateElementId: { connectById: { id: 2 } }
                    }
                  ]
                }
              }
              { templateSectionId: 2
                applicationResponsesUsingId: {
                  create: {
                    timeCreated: "NOW()"
                    value: "{option: '1'}"
                    templateElementToTemplateElementId: { connectById: { id: 4 } }
                  }
                }
              }
            ]
          }
          applicationStageHistoriesUsingId: {
            create: {
              templateStageToStageId: { connectById: { id: 1 } }
              timeCreated: "NOW()"
              isCurrent: true
              applicationStatusHistoriesUsingId: {
                create: {
                  status: COMPLETED
                  timeCreated: "NOW()"
                  isCurrent: true
                }
              }
            }
          }
          templateToTemplateId: { connectById: { id: 1 } }
        }
      }
    ) {
      application {
        name
        template {
          name
        }
        applicationSections {
          nodes {
            templateSection {
              title
            }
            applicationResponses {
              nodes {
                value
                templateElement {
                  title
                }
              }
            }
          }
        }
        applicationStageHistories {
          nodes {
            stage {
              title
            }
            isCurrent
            applicationStatusHistories {
              nodes {
                isCurrent
                status
              }
            }
          }
        }
        user {
          username
        }
      }
    }
  }`,
  // Company registration application
  `mutation {
    createApplication(
      input: {
        application: {
          name: "Company Registration: Company C"
          serial: 102
          isActive: true
          outcome: PENDING
          userToUserId: { connectById: { id: 2 } }
          applicationSectionsUsingId: {
            create: [
              { 
                templateSectionId: 3
                applicationResponsesUsingId: {
                  create: [
                    {
                      timeCreated: "NOW()"
                      value: "{text: 'Company C'}"
                      templateElementToTemplateElementId: { connectById: { id: 6 } }
                    }
                    {
                      timeCreated: "NOW()"
                      value: "{option: '2'}"
                      templateElementToTemplateElementId: { connectById: { id: 7 } }
                    }
                  ]
                }	
              }
              { 
                templateSectionId: 4
              }
              { 
                templateSectionId: 5
              }
            ]
          }
          applicationStageHistoriesUsingId: {
            create: [
              {
                templateStageToStageId: { connectById: { id: 2 } }
                timeCreated: "NOW()"
                isCurrent: false
                applicationStatusHistoriesUsingId: {
                  create: {
                    status: COMPLETED
                    timeCreated: "NOW()"
                    isCurrent: false
                  }
                }
              },
              {
                templateStageToStageId: { connectById: { id: 3 } }
                timeCreated: "NOW()"
                isCurrent: true
                applicationStatusHistoriesUsingId: {
                  create: {
                    status: SUBMITTED
                    timeCreated: "NOW()"
                    isCurrent: true
                  }
                }
              }
            ]
          }
          templateId: 2
        }
      }
    ) {
      application {
        name
        template {
          name
        }
        applicationSections {
          nodes {
            templateSection {
              title
            }
            applicationResponses {
              nodes {
                value
                templateElement {
                  title
                }
              }
            }
          }
        }
        applicationStageHistories {
          nodes {
            stage {
              title
            }
            isCurrent
            applicationStatusHistories {
              nodes {
                isCurrent
                status
              }
            }
          }
        }
        user {
          username
        }
      }
    }
  }`,
]

const loopQueries = async () => {
  for (let i = 0; i < queries.length; i++) {
    const res = await fetch(graphQLendpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: queries[i],
      }),
    })
    const data = await res.json()
    console.log('Added to database:', JSON.stringify(data))
  }
}

loopQueries()
