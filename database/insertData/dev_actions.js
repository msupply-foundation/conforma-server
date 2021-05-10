/*
GraphQL Fragment - DEVELOPMENT Actions
  - Use this to test arbitrary Actions -- but only use the trigger "DEV_TEST"
\*/
exports.devActions = `
    # Create a user
    {
      actionCode: "modifyEntity"
      trigger: DEV_TEST
      sequence: 1
      parameterQueries: {
        user: {
          id: 18
          first_name: "Boba"
          last_name: "Fett"
          username: "mandalorian"
          email: "nowhere@outerrim.space"
          password_hash: "123456"
        }
      }
    }
   # {
   # Add more Actions
   # }   
    `
