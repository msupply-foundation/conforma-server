/*
GraphQL Fragment - DEVELOPMENT Actions
  - Use this to test arbitrary Actions -- but only use the trigger "DEV_TEST"
\*/
exports.devActions = `
    # Create verification
    {
      actionCode: "createVerification"
      trigger: DEV_TEST
      sequence: 1
      parameterQueries: {
        message: {
          operator: "stringSubstitution"
          children: [
            "## Verification complete!\\n\\nThanks, %1"
            {
              operator: "objectProperties"
              children: ["applicationData.firstName"]
            }
          ]
       }
      }
    }
   # {
   # Add more Actions
   # }   
    `
