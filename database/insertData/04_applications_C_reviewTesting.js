/*
    Review testing applications
*/
exports.queries = [
  // Application for Review Testing
  `mutation ReviewTestApplication {
    createApplication(
      input: {
        application: {
          id: 400
          serial: "12345"
          applicationSectionsUsingId: {
            create: [{ templateSectionId: 6 }, { templateSectionId: 7 }]
          }
          name: "Test Review -- Vitamin C"
          outcome: PENDING
          isActive: true
          templateId: 4
          userId: 5
          orgId: 3
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
              {
                id: 400
                isValid: true
                templateElementId: 401
                value: { text: "John" }
              }
              {
                id: 401
                isValid: true
                templateElementId: 402
                value: { text: "Smith" }
              }
              {
                id: 402
                isValid: true
                templateElementId: 403
                value: { text: "js@nowhere.com" }
              }
              {
                id: 403
                isValid: true
                templateElementId: 405
                value: { text: "39" }
              }
              {
                id: 404
                isValid: true
                templateElementId: 406
                value: { text: "New Zealand" }
              }
              {
                id: 405
                isValid: true
                templateElementId: 408
                value: { text: "Vitamin C" }
              }
              {
                id: 406
                isValid: true
                templateElementId: 409
                value: { text: "Natural Product", optionIndex: 1 }
              }
              {
                id: 407
                isValid: true
                templateElementId: 411
                value: { text: "50mg" }
              }
              {
                id: 408
                isValid: true
                templateElementId: 412
                value: { text: "100" }
              }
              {
                id: 409
                isValid: true
                templateElementId: 413
                value: { text: "Turning orange" }
              }
            ]
          }
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
