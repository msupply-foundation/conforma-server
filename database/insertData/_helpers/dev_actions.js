/*
GraphQL Fragment - DEVELOPMENT Actions
  - Use this to test arbitrary Actions -- but only use the trigger "DEV_TEST"
\*/
exports.devActions = `
    # Create a user
    {
      actionCode: "modifyRecord"
      trigger: DEV_TEST
      sequence: 1
      parameterQueries: {
        tableName: "application"
        matchField: "id"
        matchValue: 4002
        name: "TESTING RENAMING"
        serial: "XXXXX"
        shouldCreateJoinTable: false
      }
    }
   # {
   # Add more Actions
   # }   
    `
