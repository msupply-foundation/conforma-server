/*
GraphQL Fragment - DEVELOPMENT Actions
  - Use this to test arbitrary Actions -- but only use the trigger "DEV_TEST"
\*/
exports.devActions = `
    # Send notification/email
    {
      actionCode: "sendNotification"
      trigger: DEV_TEST
      sequence: 1
      parameterQueries: {
        emailAddresses: ["carl@sussol.net"]
        from: "Application Manager"
        subject: "Testing..."
        message: "Sending an email from application manager"
        attachments: []
      }
    }
   # {
   # Add more Actions
   # }   
    `
