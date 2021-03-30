/*
GraphQL Fragment - DEVELOPMENT Actions
  - Use this to test arbitrary Actions -- but only use the trigger "DEV_TEST"
\*/
exports.devActions = `
    {
        actionCode: "cleanupFiles"
        trigger: DEV_TEST
        parameterQueries: {}
    }
    {
      actionCode: "joinUserOrg"
      trigger: DEV_TEST
      parameterQueries: {
        organisation_id: 3
        user_id: 4
      }
    } 
    `
