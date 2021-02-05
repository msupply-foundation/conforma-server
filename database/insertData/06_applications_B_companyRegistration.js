/*
    Organisation registration applications
*/
exports.queries = [
  // Company registration application
  `mutation {
    createApplication(
      input: {
        application: {
          id: 2000
          name: "Company Registration: Company C"
          serial: "102"
          isActive: true
          outcome: PENDING
          userId: 2
          orgId: 2
          applicationSectionsUsingId: {
            create: [
              { templateSectionId: 1001 }
              { templateSectionId: 1002 }
              { templateSectionId: 1003 }
            ]
          }
          applicationResponsesUsingId: {
            create: [
              {
                id: 2000
                value: { text: "Company C" }
                templateElementToTemplateElementId: { connectById: { id: 2001 } }
              }
              {
                id: 2001
                value: { option: 2 }
                templateElementToTemplateElementId: { connectById: { id: 2002 } }
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
      }
    }
  }`,
]
