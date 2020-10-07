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
                      code: "Text1"
                      nextElementCode: "Q1"
                      title: "Intro"
                      elementTypePluginCode: "textInfo"
                      visibilityCondition: { value: true }
                      category: INFORMATION
                      parameters: {
                        title: "Create a user account"
                        text: "Please fill in your details to **register** for a user account."
                      }
                    }
                    {
                      code: "Q1"
                      nextElementCode: "Q2"
                      title: "First Name"
                      elementTypePluginCode: "shortText"
                      visibilityCondition: { value: true }
                      category: QUESTION
                      isRequired: true
                      isEditable: { value: true }
                      parameters: { label: "First Name" }
                    }
                    {
                      code: "Q2"
                      nextElementCode: "Q3"
                      title: "Last Name"
                      elementTypePluginCode: "shortText"
                      visibilityCondition: { value: true }
                      category: QUESTION
                      isRequired: true
                      isEditable: { value: true }
                      parameters: { label: "Last Name" }
                    }
                    {
                      code: "Q3"
                      nextElementCode: "Q4"
                      title: "Username"
                      elementTypePluginCode: "shortText"
                      visibilityCondition: { value: true }
                      category: QUESTION
                      isRequired: true
                      isEditable: { value: true }
                      parameters: { label: "Select a username" }
                      validation: { value: true }
                    }
                    {
                      code: "Q4"
                      nextElementCode: "Q5"
                      title: "Email"
                      elementTypePluginCode: "shortText"
                      visibilityCondition: { value: true }
                      category: QUESTION
                      isRequired: true
                      isEditable: { value: true }
                      parameters: { label: "Email" }
                      validation: { value: true }
                    }
                    {
                      code: "Q5"
                      nextElementCode: "PB1"
                      title: "Password"
                      elementTypePluginCode: "shortText"
                      visibilityCondition: { value: true }
                      category: QUESTION
                      isRequired: true
                      isEditable: { value: true }
                      parameters: { label: "Email", maskedInput: true }
                      validation: { value: true }
                    }
                    {
                      code: "PB1"
                      nextElementCode: "Q6"
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                      parameters: { previousValidityCheck: true }
                    }
                    {
                      code: "Q6"
                      nextElementCode: "Q7"
                      title: "Organisation Category"
                      elementTypePluginCode: "checkboxChoice"
                      visibilityCondition: { value: true }
                      category: QUESTION
                      isRequired: false
                      isEditable: { value: true }
                      parameters: {
                        label: "What category of organisation do you wish to join"
                        options: ["Manufacturer", "Distributor", "Importer"]
                      }
                      validation: { value: true }
                    }
                    {
                      code: "Q7"
                      nextElementCode: "Q8"
                      title: "Select Manufacturer"
                      elementTypePluginCode: "dropDown"
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "Q6" } }]
                          }
                          { value: "Manufacturer" }
                        ]
                      }
                      category: QUESTION
                      isRequired: true
                      isEditable: { value: true }
                      parameters: {
                        label: "Select Manufacturer"
                        options: [
                          "Manufacturer A"
                          "Manufacturer B"
                          "Manufacturer C"
                        ]
                      }
                      validation: { value: true }
                    }
                    {
                      code: "Q8"
                      nextElementCode: "Q9"
                      title: "Select Distributor"
                      elementTypePluginCode: "dropDown"
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "Q6" } }]
                          }
                          { value: "Distributor" }
                        ]
                      }
                      category: QUESTION
                      isRequired: true
                      isEditable: { value: true }
                      parameters: {
                        label: "Select Distributor"
                        options: [
                          "Distributor A"
                          "Distributor B"
                          "Distributor C"
                        ]
                      }
                      validation: { value: true }
                    }
                    {
                      code: "Q9"
                      title: "Select Importer"
                      elementTypePluginCode: "dropDown"
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [{ value: { property: "Q6" } }]
                          }
                          { value: "Importer" }
                        ]
                      }
                      category: QUESTION
                      isRequired: true
                      isEditable: { value: true }
                      parameters: {
                        label: "Select Importer"
                        options: ["Importer A", "Importer B", "Importer C"]
                      }
                      validation: { value: true }
                    }
                  ]
                }
              }
            ]
          }
          templateStagesUsingId: { create: [{ number: 1, title: "Automatic" }] }
          templateActionsUsingId: {
            create: [
              {
                actionCode: "cLog"
                condition: { value: true }
                parameterQueries: {
                  message: {
                    value: "Action has been executed on User Registration template"
                  }
                }
              }
              {
                actionCode: "createUser"
                condition: { value: true }
                parameterQueries: {
                  first_name: { value: "Test" }
                  last_name: { value: "Test" }
                  username: { value: "Test" }
                  password_hash: { value: "Test" }
                  email: { value: "Test" }
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
                      code: "GS1"
                      nextElementCode: "Q1"
                      title: "Group 1"
                      elementTypePluginCode: "group_start"
                      visibilityCondition: { value: true }
                      category: INFORMATION
                      parameters: "{}"
                    }
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
                      nextElementCode: "GE1"
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
                      code: "GE1"
                      title: "Group 1"
                      elementTypePluginCode: "group_end"
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
              condition: { value: true }
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
            user: { email: "nicole@sussol.net", passwordHash: "7110EDA4D09E062AA5E4A390B0A572AC0D2C0220", username: "nmadruga" }
          }
        ) {
          user {
            email
            passwordHash
            username
          }
        }
      }`,
  `mutation {
    createUser(
      input: {
        user: { email: "carl@sussol.net", passwordHash: "7110EDA4D09E062AA5E4A390B0A572AC0D2C0220", username: "carl",
        firstName: "Carl", lastName: "Smith"
        dateOfBirth: "1976-12-23" }
      }
    ) {
      user {
        email
        passwordHash
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: { email: "andrei@sussol.net", passwordHash: "7110EDA4D09E062AA5E4A390B0A572AC0D2C0220", username: "andrei" }
      }
    ) {
      user {
        email
        passwordHash
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: { email: "valerio@nra.org", passwordHash: "7110EDA4D09E062AA5E4A390B0A572AC0D2C0220", username: "valerio" }
      }
    ) {
      user {
        email
        passwordHash
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
          outcome: PENDING
          userToUserId: { connectById: { id: 1 } }
          applicationSectionsUsingId: {
            create: { templateSectionId: 1 }
          }
          applicationResponsesUsingId: {
            create: [
              {
                timeCreated: "NOW()"
                value: {text: "Nicole"}
                templateElementToTemplateElementId: { connectById: { id: 2 } }
              }
              {
                timeCreated: "NOW()"
                value: {text: "Madruga"}
                templateElementToTemplateElementId: { connectById: { id: 3 } }
              }
              {
                timeCreated: "NOW()"
                value: {text: "nmadruga"}
                templateElementToTemplateElementId: { connectById: { id: 4 } }
              }
              {
                timeCreated: "NOW()"
                value: {text: "nicole@sussol.net"}
                templateElementToTemplateElementId: { connectById: { id: 5 } }
              }
              {
                timeCreated: "NOW()"
                value: {text: "7110EDA4D09E062AA5E4A390B0A572AC0D2C0220"}
                templateElementToTemplateElementId: { connectById: { id: 6 } }
              }
              {
                timeCreated: "NOW()"
                value: {date: "2010-12-31"}
                templateElementToTemplateElementId: { connectById: { id: 7 } }
              }
              {
                timeCreated: "NOW()"
                value: {optionIndex:0, text:"Manufacturer" }
                templateElementToTemplateElementId: { connectById: { id: 9 } }
              }
              {
                timeCreated: "NOW()"
                value: {optionIndex:1, text:"Manufacturer B" }
                templateElementToTemplateElementId: { connectById: { id: 10 } }
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
        applicationResponses {
          nodes {
            value
            templateElement {
              title
            }
          }
        }
        applicationSections {
          nodes {
            templateSection {
              title
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
              create: [{ templateSectionId: 1 }, { templateSectionId: 2 }]
            }
            applicationResponsesUsingId: {
              create: [
                {
                  timeCreated: "NOW()"
                  value: "{text: 'Carl'}"
                  templateElementToTemplateElementId: { connectById: { id: 2 } }
                }
                {
                  timeCreated: "NOW()"
                  value: "{text: 'Smith'}"
                  templateElementToTemplateElementId: { connectById: { id: 3 } }
                }
                {
                  timeCreated: "NOW()"
                  value: "{option: '1'}"
                  templateElementToTemplateElementId: { connectById: { id: 6 } }
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
          applicationResponses {
            nodes {
              value
              templateElement {
                title
              }
            }
          }
          applicationSections {
            nodes {
              templateSection {
                title
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
                { templateSectionId: 3 }
                { templateSectionId: 4 }
                { templateSectionId: 5 }
              ]
            }
            applicationResponsesUsingId: {
              create: [
                {
                  timeCreated: "NOW()"
                  value: "{text: 'Company C'}"
                  templateElementToTemplateElementId: { connectById: { id: 8 } }
                }
                {
                  timeCreated: "NOW()"
                  value: "{option: '2'}"
                  templateElementToTemplateElementId: { connectById: { id: 9 } }
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
          applicationResponses {
            nodes {
              value
              templateElement {
                title
              }
            }
          }
          applicationSections {
            nodes {
              templateSection {
                title
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
