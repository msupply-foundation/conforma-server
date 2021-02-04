/*
    Review testing applications
*/
exports.queries = [
  // Application 1 for Review Testing - on Stage 2 of 3
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
            create: [
              {
                isCurrent: false
                templateStageToStageId: { connectById: { id: 5 } }
                applicationStatusHistoriesUsingId: {
                  create: { isCurrent: false, status: COMPLETED }
                }
              }
              {
                isCurrent: true
                templateStageToStageId: { connectById: { id: 6 } }
                applicationStatusHistoriesUsingId: {
                  create: { isCurrent: true, status: SUBMITTED }
                }
              }
            ]
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
  // Application 2 for Review Testing - on Stage 1 of 3
  `mutation ReviewTestApplication {
    createApplication(
      input: {
        application: {
          id: 4001
          serial: "23456"
          applicationSectionsUsingId: {
            create: [{ templateSectionId: 1005 }, { templateSectionId: 1006 }]
          }
          name: "Test Review -- Vitamin B"
          outcome: PENDING
          isActive: true
          templateId: 4
          userId: 4
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
                id: 4010
                isValid: true
                templateElementId: 4001
                value: { text: "Valerio" }
              }
              {
                id: 4011
                isValid: true
                templateElementId: 4002
                value: { text: "Red" }
              }
              {
                id: 4012
                isValid: true
                templateElementId: 4003
                value: { text: "jj@nowhere.com" }
              }
              {
                id: 4013
                isValid: true
                templateElementId: 4005
                value: { text: "42" }
              }
              {
                id: 4014
                isValid: true
                templateElementId: 4006
                value: { text: "Tonga" }
              }
              {
                id: 4015
                isValid: true
                templateElementId: 4008
                value: { text: "Vitamin B" }
              }
              {
                id: 4016
                isValid: true
                templateElementId: 4009
                value: { text: "Natural Product", optionIndex: 1 }
              }
              {
                id: 4017
                isValid: true
                templateElementId: 4011
                value: { text: "100mg" }
              }
              {
                id: 4018
                isValid: true
                templateElementId: 4012
                value: { text: "200" }
              }
              {
                id: 4019
                isValid: true
                templateElementId: 4013
                value: { text: "No side effects" }
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
  // Application 3 for Review Testing
  `mutation ReviewTestApplication {
    createApplication(
      input: {
        application: {
          id: 4002
          serial: "34567"
          applicationSectionsUsingId: {
            create: [{ templateSectionId: 1005 }, { templateSectionId: 1006 }]
          }
          name: "Test Review -- Amoxicillin"
          outcome: PENDING
          isActive: true
          templateId: 4
          userId: 3
          orgId: 3
          applicationStageHistoriesUsingId: {
            create: [
              {
                isCurrent: false
                templateStageToStageId: { connectById: { id: 5 } }
                applicationStatusHistoriesUsingId: {
                  create: { isCurrent: false, status: COMPLETED }
                }
              }
              {
                isCurrent: true
                templateStageToStageId: { connectById: { id: 6 } }
                applicationStatusHistoriesUsingId: {
                  create: { isCurrent: true, status: SUBMITTED }
                }
              }
            ]
          }
          applicationResponsesUsingId: {
            create: [
              {
                id: 4020
                isValid: true
                templateElementId: 4001
                value: { text: "Andrei" }
              }
              {
                id: 4021
                isValid: true
                templateElementId: 4002
                value: { text: "Blue" }
              }
              {
                id: 4022
                isValid: true
                templateElementId: 4003
                value: { text: "jw@nowhere.com" }
              }
              {
                id: 4023
                isValid: true
                templateElementId: 4005
                value: { text: "22" }
              }
              {
                id: 4024
                isValid: true
                templateElementId: 4006
                value: { text: "China" }
              }
              {
                id: 4025
                isValid: true
                templateElementId: 4008
                value: { text: "Amoxicillin" }
              }
              {
                id: 4026
                isValid: true
                templateElementId: 4009
                value: { text: "Natural Product", optionIndex: 1 }
              }
              {
                id: 4027
                isValid: true
                templateElementId: 4011
                value: { text: "250mg" }
              }
              {
                id: 4028
                isValid: true
                templateElementId: 4012
                value: { text: "1000" }
              }
              {
                id: 4029
                isValid: true
                templateElementId: 4013
                value: { text: "nausea\nvomiting\ndiarrhea\nstomach pain\nswollen, black, or \"hairy\" tongue." }
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
