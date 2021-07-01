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
   # {
   # Add more Actions
   # }   
    `
