/*
    Review testing applications
*/
exports.queries = [
  // Application 1 for Review Testing - on Stage 2 of 3
  `mutation ReviewTestApplication1 {
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
          templateId: 5
          userId: 5
          orgId: 3
          applicationStageHistoriesUsingId: {
            create: [
              {
                isCurrent: false
                templateStageToStageId: { connectById: { id: 5 } }
                applicationStatusHistoriesUsingId: {
                  create: { 
                    isCurrent: false
                    status: COMPLETED
                    timeCreated: "2021-01-31T00:00:00Z"
                  }
                }
              }
              {
                isCurrent: true
                templateStageToStageId: { connectById: { id: 6 } }
                applicationStatusHistoriesUsingId: {
                  create: { 
                    isCurrent: true
                    status: SUBMITTED
                    timeCreated: "2021-02-01T00:00:00Z"
                  }
                }
              }
            ]
          }
          applicationResponsesUsingId: {
            create: [
              {
                id: 4000
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q1"
                  }
                }
                status: SUBMITTED 
                value: { text: "John" }
                timeCreated: "2021-01-30T00:00:00Z"
                timeUpdated: "2021-01-30T00:00:01Z"
                timeSubmitted: "2021-01-31T00:00:00Z"
              }
              {
                id: 4001
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q2"
                  }
                }
                status: SUBMITTED 
                value: { text: "Smith" }
                timeCreated: "2021-01-30T00:00:00Z"
                timeUpdated: "2021-01-30T00:00:02Z"
                timeSubmitted: "2021-01-31T00:00:00Z"
              }
              {
                id: 4002
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q3"
                  }
                }
                status: SUBMITTED 
                value: { text: "js@nowhere.com" }
                timeCreated: "2021-01-30T00:00:00Z"
                timeUpdated: "2021-01-30T00:00:03Z"
                timeSubmitted: "2021-01-31T00:00:00Z"
              }
              {
                id: 4003
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q4"
                  }
                }
                status: SUBMITTED 
                value: { text: "39" }
                timeCreated: "2021-01-30T00:00:00Z"
                timeUpdated: "2021-01-30T00:00:04Z"
                timeSubmitted: "2021-01-31T00:00:00Z"
              }
              {
                id: 4004
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q5"
                  }
                }
                status: SUBMITTED 
                value: { text: "New Zealand" }
                timeCreated: "2021-01-30T00:00:00Z"
                timeUpdated: "2021-01-30T00:00:05Z"
                timeSubmitted: "2021-01-31T00:00:00Z"
              }
              {
                id: 4005
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q20"
                  }
                }
                status: SUBMITTED 
                value: { text: "Vitamin C" }
                timeCreated: "2021-01-30T00:00:00Z"
                timeUpdated: "2021-01-30T00:00:05Z"
                timeSubmitted: "2021-01-31T00:00:00Z"
              }
              {
                id: 4006
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q21"
                  }
                }
                status: SUBMITTED 
                value: { text: "Natural Product", optionIndex: 1 }
                timeCreated: "2021-01-30T00:00:00Z"
                timeUpdated: "2021-01-30T00:00:05Z"
                timeSubmitted: "2021-01-31T00:00:00Z"
              }
              {
                id: 4007
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q22"
                  }
                }
                status: SUBMITTED 
                value: { text: "50mg" }
                timeCreated: "2021-01-30T00:00:00Z"
                timeUpdated: "2021-01-30T00:00:05Z"
                timeSubmitted: "2021-01-31T00:00:00Z"
              }
              {
                id: 4008
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q23"
                  }
                }
                status: SUBMITTED 
                value: { text: "100" }
                timeCreated: "2021-01-30T00:00:00Z"
                timeUpdated: "2021-01-30T00:00:05Z"
                timeSubmitted: "2021-01-31T00:00:00Z"
              }
              {
                id: 4009
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q24"
                  }
                }
                status: SUBMITTED 
                value: { text: "Turning orange" }
                timeCreated: "2021-01-30T00:00:00Z"
                timeUpdated: "2021-01-30T00:00:05Z"
                timeSubmitted: "2021-01-31T00:00:00Z"
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
  `mutation ReviewTestApplication2 {
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
          templateId: 5
          userId: 4
          orgId: 3
          applicationStageHistoriesUsingId: {
            create: {
              isCurrent: true
              templateStageToStageId: { connectById: { id: 5 } }
              applicationStatusHistoriesUsingId: {
                create: [
                  {
                    isCurrent: false, 
                    status: DRAFT
                    timeCreated: "2021-05-18T00:00:00Z"
                  }
                  { 
                    isCurrent: false, 
                    status: SUBMITTED
                    timeCreated: "2021-05-18T10:00:00Z"
                  }
                  { 
                    isCurrent: true, 
                    status: CHANGES_REQUIRED
                    timeCreated: "2021-05-19T10:00:00Z" 
                  }
                ]
              }
            }
          }
          applicationResponsesUsingId: {
            create: [
              {
                id: 4010
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q1"
                  }
                }
                status: SUBMITTED 
                value: { text: "Valerio" }
                timeCreated: "2021-05-18T00:00:00Z"
                timeUpdated: "2021-05-18T00:00:01Z"
                timeSubmitted: "2021-05-18T10:00:00Z"
              }
              {
                id: 4011
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q2"
                  }
                }
                status: SUBMITTED 
                value: { text: "Red" }
                timeCreated: "2021-05-18T00:00:00Z"
                timeUpdated: "2021-05-18T00:00:02Z"
                timeSubmitted: "2021-05-18T10:00:00Z"
              }
              {
                id: 4012
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q3"
                  }
                }
                status: SUBMITTED 
                value: { text: "jj@nowhere.com" }
                timeCreated: "2021-05-18T00:00:00Z"
                timeUpdated: "2021-05-18T00:00:03Z"
                timeSubmitted: "2021-05-18T10:00:00Z"
              }
              {
                id: 4013
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q4"
                  }
                }
                status: SUBMITTED 
                value: { text: "42" }
                timeCreated: "2021-05-18T00:00:00Z"
                timeUpdated: "2021-05-18T00:00:04Z"
                timeSubmitted: "2021-05-18T10:00:00Z"
              }
              {
                id: 4014
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q5"
                  }
                }
                status: SUBMITTED 
                value: { text: "Tonga" }
                timeCreated: "2021-05-18T00:00:00Z"
                timeUpdated: "2021-05-18T00:00:05Z"
                timeSubmitted: "2021-05-18T10:00:00Z"
              }
              {
                id: 4015
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q20"
                  }
                }
                status: SUBMITTED 
                value: { text: "Vitamin B" }
                timeCreated: "2021-05-18T00:00:00Z"
                timeUpdated: "2021-05-18T00:00:06Z"
                timeSubmitted: "2021-05-18T10:00:00Z"
              }
              {
                id: 4016
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q21"
                  }
                }
                status: SUBMITTED 
                value: { text: "Natural Product", optionIndex: 1 }
                timeCreated: "2021-05-18T00:00:00Z"
                timeUpdated: "2021-05-18T00:00:07Z"
                timeSubmitted: "2021-05-18T10:00:00Z"
              }
              {
                id: 4017
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q22"
                  }
                }
                status: SUBMITTED 
                value: { text: "100mg" }
                timeCreated: "2021-05-18T00:00:00Z"
                timeUpdated: "2021-05-18T00:00:08Z"
                timeSubmitted: "2021-05-18T10:00:00Z"
              }
              {
                id: 4018
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q23"
                  }
                }
                status: SUBMITTED 
                value: { text: "200" }
                timeCreated: "2021-05-18T00:00:00Z"
                timeUpdated: "2021-05-18T00:00:09Z"
                timeSubmitted: "2021-05-18T10:00:00Z"
              }
              {
                id: 4019
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCodeAndTemplateVersion: {
                    templateVersion: 1
                    templateCode: "ReviewTest"
                    code: "Q24"
                  }
                }
                status: SUBMITTED 
                value: { text: "No side effects" }
                timeCreated: "2021-05-18T00:00:00Z"
                timeUpdated: "2021-05-18T00:00:10Z"
                timeSubmitted: "2021-05-18T10:00:00Z"
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
  `mutation ReviewTestApplication3 {
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
          templateId: 5
          userId: 3
          orgId: 3
          applicationStageHistoriesUsingId: {
            create: [
              {
                isCurrent: false
                templateStageToStageId: { connectById: { id: 5 } }
                applicationStatusHistoriesUsingId: {
                  create: [
                    {
                      isCurrent: false, 
                      status: DRAFT
                      timeCreated: "2021-05-18T00:00:00Z"
                    }
                    {
                      isCurrent: false, 
                      status: SUBMITTED
                      timeCreated: "2021-05-18T10:00:00Z"
                    }
                    { 
                      isCurrent: false
                      status: COMPLETED
                      timeCreated: "2021-05-19T10:00:00Z"
                    }
                  ]
                }
              }
              {
                isCurrent: true
                templateStageToStageId: { connectById: { id: 6 } }
                applicationStatusHistoriesUsingId: {
                  create: { 
                    isCurrent: true
                    status: SUBMITTED
                    timeCreated: "2021-05-19T10:00:00Z"
                  }
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
                status: SUBMITTED 
                value: { text: "Andrei" }
                timeCreated: "2021-05-18T10:00:00Z"
                timeUpdated: "2021-05-18T10:00:01Z"
                timeSubmitted: "2021-05-18T10:10:00Z"
              }
              {
                id: 4021
                isValid: true
                templateElementId: 4002
                status: SUBMITTED 
                value: { text: "Blue" }
                timeCreated: "2021-05-18T10:00:00Z"
                timeUpdated: "2021-05-18T10:00:02Z"
                timeSubmitted: "2021-05-18T10:10:00Z"
              }
              {
                id: 4022
                isValid: true
                templateElementId: 4003
                status: SUBMITTED 
                value: { text: "jw@nowhere.com" }
                timeCreated: "2021-05-18T10:00:00Z"
                timeUpdated: "2021-05-18T10:00:03Z"
                timeSubmitted: "2021-05-18T10:10:00Z"
              }
              {
                id: 4023
                isValid: true
                templateElementId: 4005
                status: SUBMITTED 
                value: { text: "22" }
                timeCreated: "2021-05-18T10:00:00Z"
                timeUpdated: "2021-05-18T10:00:04Z"
                timeSubmitted: "2021-05-18T10:10:00Z"
              }
              {
                id: 4024
                isValid: true
                templateElementId: 4006
                status: SUBMITTED 
                value: { text: "China" }
                timeCreated: "2021-05-18T10:00:00Z"
                timeUpdated: "2021-05-18T10:00:05Z"
                timeSubmitted: "2021-05-18T10:10:00Z"
              }
              {
                id: 4025
                isValid: true
                templateElementId: 4008
                status: SUBMITTED 
                value: { text: "Amoxicillin" }
                timeCreated: "2021-05-18T10:00:00Z"
                timeUpdated: "2021-05-18T10:00:06Z"
                timeSubmitted: "2021-05-18T10:10:00Z"
              }
              {
                id: 4026
                isValid: true
                templateElementId: 4009
                status: SUBMITTED 
                value: { text: "Natural Product", optionIndex: 1 }
                timeCreated: "2021-05-18T10:00:00Z"
                timeUpdated: "2021-05-18T10:00:07Z"
                timeSubmitted: "2021-05-18T10:10:00Z"
              }
              {
                id: 4027
                isValid: true
                templateElementId: 4011
                status: SUBMITTED 
                value: { text: "250mg" }
                timeCreated: "2021-05-18T10:00:00Z"
                timeUpdated: "2021-05-18T10:00:08Z"
                timeSubmitted: "2021-05-18T10:10:00Z"
              }
              {
                id: 4028
                isValid: true
                templateElementId: 4012
                status: SUBMITTED 
                value: { text: "1000" }
                timeCreated: "2021-05-18T10:00:00Z"
                timeUpdated: "2021-05-18T10:00:09Z"
                timeSubmitted: "2021-05-18T10:10:00Z"
              }
              {
                id: 4029
                isValid: true
                templateElementId: 4013
                status: SUBMITTED 
                value: { text: "nausea\\nvomiting\\ndiarrhea\\nstomach pain\\nswollen, black, or \\"hairy\\" tongue." }
                timeCreated: "2021-05-18T10:00:00Z"
                timeUpdated: "2021-05-18T10:00:10Z"
                timeSubmitted: "2021-05-18T10:10:00Z"
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
  // Application 4 for Review Testing -- Un-assigned, level 1
  `mutation ReviewTestApplication4 {
    createApplication(
      input: {
        application: {
          id: 4003
          serial: "ABC123"
          applicationSectionsUsingId: {
            create: [{ templateSectionId: 1005 }, { templateSectionId: 1006 }]
          }
          name: "Test Review -- Paracetamol"
          outcome: PENDING
          isActive: true
          templateId: 5
          userId: 4
          applicationStageHistoriesUsingId: {
            create: [
              {
                isCurrent: true
                templateStageToStageId: { connectById: { id: 5 } }
                applicationStatusHistoriesUsingId: {
                  create: [
                    { 
                      isCurrent: false
                      status: DRAFT
                      timeCreated: "2021-06-09T00:00:00Z"
                    }
                    { 
                      isCurrent: true
                      status: SUBMITTED
                      timeCreated: "2021-06-09T10:00:00Z"
                    }
                  ]
                }
              }
            ]
          }
          applicationResponsesUsingId: {
            create: [
              {
                id: 4100
                isValid: true
                templateElementId: 4001
                status: SUBMITTED 
                value: { text: "Valerio" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:01Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4101
                isValid: true
                templateElementId: 4002
                status: SUBMITTED 
                value: { text: "Red" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:02Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4102
                isValid: true
                templateElementId: 4003
                status: SUBMITTED 
                value: { text: "vw@nowhere.com" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:03Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4103
                isValid: true
                templateElementId: 4005
                status: SUBMITTED 
                value: { text: "63" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:04Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4104
                isValid: true
                templateElementId: 4006
                status: SUBMITTED 
                value: { text: "Italy" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:05Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4105
                isValid: true
                templateElementId: 4008
                status: SUBMITTED 
                value: { text: "Paracetamol" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:06Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4106
                isValid: true
                templateElementId: 4009
                status: SUBMITTED 
                value: { text: "Natural Product", optionIndex: 1 }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:07Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4107
                isValid: true
                templateElementId: 4011
                status: SUBMITTED 
                value: { text: "250mg" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:08Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4108
                isValid: true
                templateElementId: 4012
                status: SUBMITTED 
                value: { text: "1000" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:09Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4109
                isValid: true
                templateElementId: 4013
                status: SUBMITTED 
                value: { text: "Nothing too serious" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:10Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
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
  // Application 5 for Review Testing -- on Stage 2 with consolidation assigned
  `mutation ReviewTestApplication4 {
    createApplication(
      input: {
        application: {
          id: 4004
          serial: "45678"
          applicationSectionsUsingId: {
            create: [{ templateSectionId: 1005 }, { templateSectionId: 1006 }]
          }
          name: "Test Review -- Amoxicilin"
          outcome: PENDING
          isActive: true
          templateId: 5
          userId: 2
          applicationStageHistoriesUsingId: {
            create: [
              {
                isCurrent: false
                templateStageToStageId: { connectById: { id: 5 } }
                applicationStatusHistoriesUsingId: {
                  create: [
                    { 
                      isCurrent: false
                      status: DRAFT
                      timeCreated: "2021-06-09T00:00:00Z"
                    }
                    { 
                      isCurrent: false
                      status: SUBMITTED
                      timeCreated: "2021-06-09T10:00:00Z"
                    }
                    { 
                      isCurrent: false
                      status: COMPLETED
                      timeCreated: "2021-06-10T10:00:00Z"
                    }
                  ]
                }
              }
              {
                isCurrent: true
                templateStageToStageId: { connectById: { id: 6 } }
                applicationStatusHistoriesUsingId: {
                  create: { 
                    isCurrent: true
                    status: SUBMITTED
                    timeCreated: "2021-06-10T10:00:00Z"
                  }
                }
              }
            ]
          }
          applicationResponsesUsingId: {
            create: [
              {
                id: 4150
                isValid: true
                templateElementId: 4001
                status: SUBMITTED 
                value: { text: "Another" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:01Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4151
                isValid: true
                templateElementId: 4002
                status: SUBMITTED 
                value: { text: "Test" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:02Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4152
                isValid: true
                templateElementId: 4003
                status: SUBMITTED 
                value: { text: "this@test.com" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:03Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4153
                isValid: true
                templateElementId: 4005
                status: SUBMITTED 
                value: { text: "18" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:04Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4154
                isValid: true
                templateElementId: 4006
                status: SUBMITTED 
                value: { text: "Brazil" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:05Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4155
                isValid: true
                templateElementId: 4008
                status: SUBMITTED 
                value: { text: "Amoxicilin" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:06Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4156
                isValid: true
                templateElementId: 4009
                status: SUBMITTED 
                value: { 
                  text: "Medicine"
                  selection: "Medicine"
                  optionIndex: 0
                }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:07Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
              }
              {
                id: 4157
                isValid: true
                templateElementId: 4011
                status: SUBMITTED 
                value: { text: "100g" }
              }
              {
                id: 4158
                isValid: true
                templateElementId: 4012
                status: SUBMITTED 
                value: { text: "200" }
                timeCreated: "2021-06-09T00:00:00Z"
                timeUpdated: "2021-06-09T00:00:08Z"
                timeSubmitted: "2021-06-09T10:00:00Z"
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
