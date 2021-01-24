/*
    Organisation registration applications
*/
exports.queries = [
  // Company registration application
  `mutation {
    createApplication(
      input: {
        application: {
          name: "Company Registration: Company C"
          serial: "102"
          isActive: true
          outcome: PENDING
          userId: 2
          orgId: 2
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
                value: { text: "Company C" }
                templateElementToTemplateElementId: { connectById: { id: 12 } }
              }
              {
                value: { option: 2 }
                templateElementToTemplateElementId: { connectById: { id: 13 } }
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
