/*
    Review testing applications
*/
exports.queries = [
  // Application for Review Testing
  `mutation ReviewTestApplication {
    createApplication(
      input: {
        application: {
          serial: "12345"
          applicationSectionsUsingId: {
            create: [{ templateSectionId: 6 }, { templateSectionId: 7 }]
          }
          name: "Test Review -- Vitamin C"
          outcome: PENDING
          isActive: true
          templateId: 4
          userId: 5
          applicationStageHistoriesUsingId: {
            create: {
              isCurrent: true
              templateStageToStageId: { connectById: { id: 5 } }
              applicationStatusHistoriesUsingId: {
                create: { isCurrent: true, status: SUBMITTED }
              }
            }
          }
          applicationResponsesUsingId: {
            create: [
              { isValid: true, templateElementId: 43, value: { text: "John" } }
              { isValid: true, templateElementId: 44, value: { text: "Smith" } }
              {
                isValid: true
                templateElementId: 45
                value: { text: "js@nowhere.com" }
              }
              { isValid: true, templateElementId: 47, value: { text: "39" } }
              {
                isValid: true
                templateElementId: 48
                value: { text: "New Zealand" }
              }
              {
                isValid: true
                templateElementId: 50
                value: { text: "Vitamin C" }
              }
              {
                isValid: true
                templateElementId: 51
                value: { text: "Natural Product", optionIndex: 1 }
              }
              { isValid: true, templateElementId: 53, value: { text: "50mg" } }
              { isValid: true, templateElementId: 54, value: { text: "100" } }
              {
                isValid: true
                templateElementId: 55
                value: { text: "Turning orange" }
              }
            ]
          }
        }
      }
    ) {
      application {
        name
      }
    }
  }`,
]
