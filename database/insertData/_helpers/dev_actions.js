/*
GraphQL Fragment - DEVELOPMENT Actions
  - Use this to test arbitrary Actions -- but only use the trigger "DEV_TEST"
\*/
exports.devActions = `
    # Check scheduled actions working
    {
      actionCode: "cLog"
      code: "TEST1"
      trigger: ON_SCHEDULE
      sequence: 1
      parameterQueries: {
        message: "This is a scheduled action!!"
      }
    }
   # {
   # Add more Actions
   # }   
    `
