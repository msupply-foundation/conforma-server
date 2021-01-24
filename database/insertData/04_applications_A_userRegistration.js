/*
    User registration applications
*/
exports.queries = [
  //   User registration application 1
  `mutation {
    createApplication(
      input: {
        application: {
          id: 100
          name: "User Registration: Craig Drown"
          serial: "100"
          isActive: true
          outcome: PENDING
          applicationSectionsUsingId: { create: { templateSectionId: 1 } }
          applicationResponsesUsingId: {
            create: [
              {
                id: 1000
                value: { text: "Craig" }
                templateElementToTemplateElementId: { connectById: { id: 101 } }
              }
              {
                id: 1001
                value: { text: "Drown" }
                templateElementToTemplateElementId: { connectById: { id: 102 } }
              }
              {
                id: 1002
                value: { text: "c_drown" }
                templateElementToTemplateElementId: { connectById: { id: 104 } }
              }
              {
                id: 1003
                value: { text: "craig@sussol.net" }
                templateElementToTemplateElementId: { connectById: { id: 105 } }
              }
              {
                id: 1004
                value: { text: "123456" }
                templateElementToTemplateElementId: { connectById: { id: 106 } }
              }
              {
                id: 1005
                value: { optionIndex: 0, text: "Manufacturer" }
                templateElementToTemplateElementId: { connectById: { id: 107 } }
              }
              {
                id: 1006
                value: { optionIndex: 1, text: "Manufacturer B" }
                templateElementToTemplateElementId: { connectById: { id: 109 } }
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
          id: 101
          name: "User Registration: Carl Smith"
          serial: "101"
          isActive: true
          outcome: APPROVED
          applicationSectionsUsingId: { create: { templateSectionId: 1 } }
          applicationResponsesUsingId: {
            create: [
              {
                id: 1007
                value: { text: "Carl" }
                templateElementToTemplateElementId: { connectById: { id: 101 } }
              }
              {
                id: 1008
                value: { text: "Smith" }
                templateElementToTemplateElementId: { connectById: { id: 102 } }
              }
              {
                id: 1009
                value: { text: "cjsmith" }
                templateElementToTemplateElementId: { connectById: { id: 104 } }
              }
              {
                id: 1010
                value: { text: "carl@sussol.net" }
                templateElementToTemplateElementId: { connectById: { id: 105 } }
              }
              {
                id: 1011
                value: { text: "123456" }
                templateElementToTemplateElementId: { connectById: { id: 106 } }
              }
              {
                id: 1012
                value: { optionIndex: 0, text: "Importer" }
                templateElementToTemplateElementId: { connectById: { id: 107 } }
              }
              {
                id: 1013
                value: { optionIndex: 1, text: "Importer A" }
                templateElementToTemplateElementId: { connectById: { id: 109 } }
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
