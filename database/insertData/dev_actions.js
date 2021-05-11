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
        tableName: "user"
        matchField: "username"
        first_name: "Boba"
        last_name: "Fett"
        username: "js"
        email: "nowhere@outerrim.space"
      }
    }
   # {
   # Add more Actions
   # }   
    `
