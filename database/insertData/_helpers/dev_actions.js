/*
GraphQL Fragment - DEVELOPMENT Actions
  - Use this to test arbitrary Actions -- but only use the trigger "DEV_TEST"
\*/
exports.devActions = `
    # Create a user
    {
      actionCode: "generateName"
      trigger: DEV_TEST
      sequence: 1
      parameterQueries: {
        formatExpression: "\${applicationData.templateName} — \${applicationData.applicationSerial}"
      }
    }
   # {
   # Add more Actions
   # }   
    `
