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
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q1"
                  }
                }
                status: SUBMITTED 
                value: { text: "John" }
              }
              {
                id: 4001
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q2"
                  }
                }
                status: SUBMITTED 
                value: { text: "Smith" }
              }
              {
                id: 4002
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q3"
                  }
                }
                status: SUBMITTED 
                value: { text: "js@nowhere.com" }
              }
              {
                id: 4003
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q4"
                  }
                }
                status: SUBMITTED 
                value: { text: "39" }
              }
              {
                id: 4004
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q5"
                  }
                }
                status: SUBMITTED 
                value: { text: "New Zealand" }
              }
              {
                id: 4005
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q20"
                  }
                }
                status: SUBMITTED 
                value: { text: "Vitamin C" }
              }
              {
                id: 4006
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q21"
                  }
                }
                status: SUBMITTED 
                value: { text: "Natural Product", optionIndex: 1 }
              }
              {
                id: 4007
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q22"
                  }
                }
                status: SUBMITTED 
                value: { text: "50mg" }
              }
              {
                id: 4008
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q23"
                  }
                }
                status: SUBMITTED 
                value: { text: "100" }
              }
              {
                id: 4009
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q24"
                  }
                }
                status: SUBMITTED 
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
                    status: SUBMITTED
                    timeCreated: "2021-05-18T00:00:00Z"
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
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q1"
                  }
                }
                status: SUBMITTED 
                value: { text: "Valerio" }
              }
              {
                id: 4011
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q2"
                  }
                }
                status: SUBMITTED 
                value: { text: "Red" }
              }
              {
                id: 4012
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q3"
                  }
                }
                status: SUBMITTED 
                value: { text: "jj@nowhere.com" }
              }
              {
                id: 4013
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q4"
                  }
                }
                status: SUBMITTED 
                value: { text: "42" }
              }
              {
                id: 4014
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q5"
                  }
                }
                status: SUBMITTED 
                value: { text: "Tonga" }
              }
              {
                id: 4015
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q20"
                  }
                }
                status: SUBMITTED 
                value: { text: "Vitamin B" }
              }
              {
                id: 4016
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q21"
                  }
                }
                status: SUBMITTED 
                value: { text: "Natural Product", optionIndex: 1 }
              }
              {
                id: 4017
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q22"
                  }
                }
                status: SUBMITTED 
                value: { text: "100mg" }
              }
              {
                id: 4018
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q23"
                  }
                }
                status: SUBMITTED 
                value: { text: "200" }
              }
              {
                id: 4019
                isValid: true
                templateElementToTemplateElementId: {
                  connectByTemplateCodeAndCode: {
                    templateCode: "ReviewTest"
                    code: "Q24"
                  }
                }
                status: SUBMITTED 
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
                status: SUBMITTED 
                value: { text: "Andrei" }
              }
              {
                id: 4021
                isValid: true
                templateElementId: 4002
                status: SUBMITTED 
                value: { text: "Blue" }
              }
              {
                id: 4022
                isValid: true
                templateElementId: 4003
                status: SUBMITTED 
                value: { text: "jw@nowhere.com" }
              }
              {
                id: 4023
                isValid: true
                templateElementId: 4005
                status: SUBMITTED 
                value: { text: "22" }
              }
              {
                id: 4024
                isValid: true
                templateElementId: 4006
                status: SUBMITTED 
                value: { text: "China" }
              }
              {
                id: 4025
                isValid: true
                templateElementId: 4008
                status: SUBMITTED 
                value: { text: "Amoxicillin" }
              }
              {
                id: 4026
                isValid: true
                templateElementId: 4009
                status: SUBMITTED 
                value: { text: "Natural Product", optionIndex: 1 }
              }
              {
                id: 4027
                isValid: true
                templateElementId: 4011
                status: SUBMITTED 
                value: { text: "250mg" }
              }
              {
                id: 4028
                isValid: true
                templateElementId: 4012
                status: SUBMITTED 
                value: { text: "1000" }
              }
              {
                id: 4029
                isValid: true
                templateElementId: 4013
                status: SUBMITTED 
                value: { text: "nausea\\nvomiting\\ndiarrhea\\nstomach pain\\nswollen, black, or \\"hairy\\" tongue." }
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
                  create: { isCurrent: true, status: SUBMITTED }
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
              }
              {
                id: 4101
                isValid: true
                templateElementId: 4002
                status: SUBMITTED 
                value: { text: "Red" }
              }
              {
                id: 4102
                isValid: true
                templateElementId: 4003
                status: SUBMITTED 
                value: { text: "vw@nowhere.com" }
              }
              {
                id: 4103
                isValid: true
                templateElementId: 4005
                status: SUBMITTED 
                value: { text: "63" }
              }
              {
                id: 4104
                isValid: true
                templateElementId: 4006
                status: SUBMITTED 
                value: { text: "Italy" }
              }
              {
                id: 4105
                isValid: true
                templateElementId: 4008
                status: SUBMITTED 
                value: { text: "Paracetamol" }
              }
              {
                id: 4106
                isValid: true
                templateElementId: 4009
                status: SUBMITTED 
                value: { text: "Natural Product", optionIndex: 1 }
              }
              {
                id: 4107
                isValid: true
                templateElementId: 4011
                status: SUBMITTED 
                value: { text: "250mg" }
              }
              {
                id: 4108
                isValid: true
                templateElementId: 4012
                status: SUBMITTED 
                value: { text: "1000" }
              }
              {
                id: 4109
                isValid: true
                templateElementId: 4013
                status: SUBMITTED 
                value: { text: "Nothing too serious" }
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
                    { isCurrent: false, status: SUBMITTED }
                    { isCurrent: false, status: COMPLETED }
                  ]
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
                id: 4150
                isValid: true
                templateElementId: 4001
                status: SUBMITTED 
                value: { text: "Another" }
              }
              {
                id: 4151
                isValid: true
                templateElementId: 4002
                status: SUBMITTED 
                value: { text: "Test" }
              }
              {
                id: 4152
                isValid: true
                templateElementId: 4003
                status: SUBMITTED 
                value: { text: "this@test.com" }
              }
              {
                id: 4153
                isValid: true
                templateElementId: 4005
                status: SUBMITTED 
                value: { text: "18" }
              }
              {
                id: 4154
                isValid: true
                templateElementId: 4006
                status: SUBMITTED 
                value: { text: "Brazil" }
              }
              {
                id: 4155
                isValid: true
                templateElementId: 4008
                status: SUBMITTED 
                value: { text: "Amoxicilin" }
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
