/*
    Review testing applications
*/
exports.queries = [
  // Application for Review Testing
  `mutation ReviewTestApplication {
    createApplication(
      input: {
        application: {
          id: 4000
          serial: "12345"
          applicationSectionsUsingId: {
            create: [{ templateSectionId: 1005 }, { templateSectionId: 1006 }]
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
                id: 4000
                isValid: true
                templateElementId: 4001
                value: { text: "John" }
              }
              {
                id: 4001
                isValid: true
                templateElementId: 4002
                value: { text: "Smith" }
              }
              {
                id: 4002
                isValid: true
                templateElementId: 4003
                value: { text: "js@nowhere.com" }
              }
              {
                id: 4003
                isValid: true
                templateElementId: 4005
                value: { text: "39" }
              }
              {
                id: 4004
                isValid: true
                templateElementId: 4006
                value: { text: "New Zealand" }
              }
              {
                id: 4005
                isValid: true
                templateElementId: 4008
                value: { text: "Vitamin C" }
              }
              {
                id: 4006
                isValid: true
                templateElementId: 4009
                value: { text: "Natural Product", optionIndex: 1 }
              }
              {
                id: 4007
                isValid: true
                templateElementId: 4011
                value: { text: "50mg" }
              }
              {
                id: 4008
                isValid: true
                templateElementId: 4012
                value: { text: "100" }
              }
              {
                id: 4009
                isValid: true
                templateElementId: 4013
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
