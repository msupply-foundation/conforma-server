/*
    User registration applications
*/
exports.queries = [
  //   User registration application 1
  `mutation {
    createApplication(
      input: {
        application: {
          name: "User Registration: Craig Drown"
          serial: "100"
          isActive: true
          outcome: PENDING
          applicationSectionsUsingId: { create: { templateSectionId: 1 } }
          applicationResponsesUsingId: {
            create: [
              {
                value: { text: "Craig" }
                templateElementToTemplateElementId: { connectById: { id: 2 } }
              }
              {
                value: { text: "Drown" }
                templateElementToTemplateElementId: { connectById: { id: 3 } }
              }
              {
                value: { text: "c_drown" }
                templateElementToTemplateElementId: { connectById: { id: 4 } }
              }
              {
                value: { text: "craig@sussol.net" }
                templateElementToTemplateElementId: { connectById: { id: 5 } }
              }
              {
                value: { text: "123456" }
                templateElementToTemplateElementId: { connectById: { id: 6 } }
              }
              {
                value: { optionIndex: 0, text: "Manufacturer" }
                templateElementToTemplateElementId: { connectById: { id: 8 } }
              }
              {
                value: { optionIndex: 1, text: "Manufacturer B" }
                templateElementToTemplateElementId: { connectById: { id: 9 } }
              }
            ]
          }
          applicationStageHistoriesUsingId: {
            create: {
              templateStageToStageId: { connectById: { id: 1 } }
              timeCreated: "NOW()"
              isCurrent: true
              applicationStatusHistoriesUsingId: {
                create: { status: DRAFT, timeCreated: "NOW()", isCurrent: true }
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
      }
    }
  }`,
  // User Registration application 2
  `mutation {
    createApplication(
      input: {
        application: {
          name: "User Registration: Carl Smith"
          serial: "101"
          isActive: true
          outcome: APPROVED
          userToUserId: { connectById: { id: 2 } }
          applicationSectionsUsingId: { create: { templateSectionId: 1 } }
          applicationResponsesUsingId: {
            create: [
              {
                value: { text: "Carl" }
                templateElementToTemplateElementId: { connectById: { id: 2 } }
              }
              {
                value: { text: "Smith" }
                templateElementToTemplateElementId: { connectById: { id: 3 } }
              }
              {
                value: { text: "cjsmith" }
                templateElementToTemplateElementId: { connectById: { id: 4 } }
              }
              {
                value: { text: "carl@sussol.net" }
                templateElementToTemplateElementId: { connectById: { id: 5 } }
              }
              {
                value: { text: "123456" }
                templateElementToTemplateElementId: { connectById: { id: 6 } }
              }
              {
                value: { optionIndex: 0, text: "Importer" }
                templateElementToTemplateElementId: { connectById: { id: 8 } }
              }
              {
                value: { optionIndex: 1, text: "Importer A" }
                templateElementToTemplateElementId: { connectById: { id: 9 } }
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
      }
    }
  }`,
]
