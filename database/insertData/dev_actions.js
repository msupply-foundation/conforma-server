/*
GraphQL Fragment - DEVELOPMENT Actions
  - Use this to test arbitrary Actions -- but only use the trigger "DEV_TEST"
\*/
exports.devActions = `
      {
              actionCode: "incrementStage"
              sequence: 1
              trigger: DEV_TEST
          #    parameterQueries: {
          #      message: "This is a console log"
          #  }
        }
        {
          actionCode: "changeStatus"
          trigger: DEV_TEST
          sequence: 2
          parameterQueries: {
            newStatus: { value: "Draft" }
          }
        }
   # {
   # Add more Actions
   # }   
    `
