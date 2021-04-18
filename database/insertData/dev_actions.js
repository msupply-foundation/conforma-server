/*
GraphQL Fragment - DEVELOPMENT Actions
  - Use this to test arbitrary Actions -- but only use the trigger "DEV_TEST"
\*/
exports.devActions = `
    {
        actionCode: "cLog"
        sequence: 1
        trigger: DEV_TEST
        condition: false
        parameterQueries: {
          message: "This is a console log"
      }
    }
    {
        actionCode: "cLog"
        sequence: 2
        trigger: DEV_TEST
        condition: true
        parameterQueries: {
          message: "This one should print"
      }
    }
    {
        actionCode: "cLog"
        trigger: DEV_TEST
        condition: true
        parameterQueries: {
          message: "Async action with True condition"
      }
    }
    {
        actionCode: "cLog"
        trigger: DEV_TEST
        condition: false
        parameterQueries: {
          message: "Async action with False condition"
      }
    }
   # {
   # Add more Actions
   # }   
    `
