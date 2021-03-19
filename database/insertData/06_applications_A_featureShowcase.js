/*
    User registration applications
*/
exports.queries = [
  //   User registration (TestRego) application 1 -- not all questions
  `mutation {
    createApplication(
      input: {
        application: {
          id: 1000
          name: "User Registration: Craig Drown"
          serial: "100"
          isActive: true
          outcome: PENDING
          applicationSectionsUsingId: { create: { templateSectionId: 1000 } }
          applicationResponsesUsingId: {
            create: [
              {
                id: 1000
                value: { text: "Craig" }
                templateElementToTemplateElementId: { connectById: { id: 1001 } }
              }
              {
                id: 1001
                value: { text: "Drown" }
                templateElementToTemplateElementId: { connectById: { id: 1002 } }
              }
              {
                id: 1002
                value: { text: "c_drown" }
                templateElementToTemplateElementId: { connectById: { id: 1004 } }
              }
              {
                id: 1003
                value: { text: "craig@sussol.net" }
                templateElementToTemplateElementId: { connectById: { id: 1005 } }
              }
              {
                id: 1004
                value: { text: "123456" }
                templateElementToTemplateElementId: { connectById: { id: 1006 } }
              }
              {
                id: 1005
                value: { optionIndex: 0, text: "Manufacturer" }
                templateElementToTemplateElementId: { connectById: { id: 1007 } }
              }
              {
                id: 1006
                value: { optionIndex: 1, text: "Manufacturer B" }
                templateElementToTemplateElementId: { connectById: { id: 1009 } }
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
  // User Registration (TestRego) application 2
  `mutation {
    createApplication(
      input: {
        application: {
          id: 1001
          name: "User Registration: Carl Smith"
          serial: "101"
          isActive: true
          outcome: APPROVED
          applicationSectionsUsingId: { create: { templateSectionId: 1000 } }
          applicationResponsesUsingId: {
            create: [
              {
                id: 1007
                status: SUBMITTED 
                value: { text: "Carl" }
                templateElementToTemplateElementId: { connectById: { id: 1001 } }
              }
              {
                id: 1008
                status: SUBMITTED 
                value: { text: "Smith" }
                templateElementToTemplateElementId: { connectById: { id: 1002 } }
              }
              {
                id: 1009
                status: SUBMITTED 
                value: { text: "cjsmith" }
                templateElementToTemplateElementId: { connectById: { id: 1004 } }
              }
              {
                id: 1010
                status: SUBMITTED 
                value: { text: "carl@sussol.net" }
                templateElementToTemplateElementId: { connectById: { id: 1005 } }
              }
              {
                id: 1011
                status: SUBMITTED 
                value: { text: "123456" }
                templateElementToTemplateElementId: { connectById: { id: 1006 } }
              }
              {
                id: 1012
                status: SUBMITTED 
                value: { optionIndex: 0, text: "Importer" }
                templateElementToTemplateElementId: { connectById: { id: 1007 } }
              }
              {
                id: 1013
                status: SUBMITTED 
                value: { optionIndex: 1, text: "Importer A" }
                templateElementToTemplateElementId: { connectById: { id: 1009 } }
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
