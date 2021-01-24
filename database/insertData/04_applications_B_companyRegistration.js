/*
    Organisation registration applications
*/
exports.queries = [
  // Company registration application
  `mutation {
    createApplication(
      input: {
        application: {
          id: 300
          name: "Company Registration: Company C"
          serial: "102"
          isActive: true
          outcome: PENDING
          userToUserId: { connectById: { id: 2 } }
          applicationSectionsUsingId: {
            create: [
              { templateSectionId: 2 }
              { templateSectionId: 3 }
              { templateSectionId: 4 }
            ]
          }
          applicationResponsesUsingId: {
            create: [
              {
                id: 300
                value: { text: "Company C" }
                templateElementToTemplateElementId: { connectById: { id: 201 } }
              }
              {
                id: 301
                value: { option: 2 }
                templateElementToTemplateElementId: { connectById: { id: 202 } }
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
