/*
GraphQL Fragment - DEVELOPMENT Actions
  - Use this to test arbitrary Actions -- but only use the trigger "DEV_TEST"
\*/
exports.devActions = `
    # Create a document then email it
    {
      actionCode: "generateDoc"
      trigger: DEV_TEST
      sequence: 1
      parameterQueries: {
        docTemplateId: "9eRMD5mgLGuMfntQ1I-_9"
      }
    }
    {
      actionCode: "sendNotification"
      trigger: DEV_TEST
      sequence: 2
      parameterQueries: {
        subject: "Report attached"
        message: {
          operator: "stringSubstitution"
          children: [
            "Here is your report: http://localhost:3000/file?id=%1"
            {
              operator: "objectProperties"
              children: ["outputCumulative.document.uniqueId"]
            }
          ]
       }
      }
    }
   # {
   # Add more Actions
   # }   
    `
