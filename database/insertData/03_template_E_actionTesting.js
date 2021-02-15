/*
TEMPLATE E - Action testing
  - minimal template that can be configured to test Actions -- just add the action you want to test to a trigger and trigger it
*/
exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "ActionTesting"
          name: "Minimal template for testing triggers/actions"
          status: AVAILABLE
          startMessage: "## Continue..."
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                id: 5000
                code: "S1"
                title: "Demo"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      id: 5000
                      code: "QT1"
                      index: 1
                      title: "Answer anything"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Answer" }
                    }
                  ]
                }
              }
            ]
          }
          templateStagesUsingId: {
            create: [
              {
                id: 5000
                number: 1
                title: "Screening"
                description: "Just the one stage."
              }
            ]
          }
          templateActionsUsingId: {
            create: [
              {
                actionCode: "incrementStage"
                trigger: ON_APPLICATION_CREATE
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: ["applicationData.applicationId"]
                  }
                }
              }
              {
                actionCode: "changeStatus"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 1
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: ["applicationData.applicationId"]
                  }
                  newStatus: { value: "Submitted" }
                }
              }
              {
                actionCode: "trimResponses"
                trigger: ON_APPLICATION_SAVE
                sequence: 1
                parameterQueries: {
                  applicationId: {
                    operator: "objectProperties"
                    children: ["applicationData.applicationId"]
                  }
                }
              }
            ]
          }
        }
      }
    ) {
      template {
        code
        name
      }
    }
  }`,
]
