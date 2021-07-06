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
        email: ["test@sussol.net", "test@sussol.net"] # CHANGE EMAIL FOR TESTING
        subject: "Testing..."
        message: "Sending an email from application manager"
        attachments: []
      }
    }
    {
      actionCode: "sendNotification"
      trigger: DEV_TEST
      sequence: 2
      parameterQueries: {
        email: "test@sussol.net" # CHANGE EMAIL FOR TESTING
        fromName: "Not My Real Name"
        fromEmail: "not-my-real-name@nowhere.com"
        subject: "Testing HTML Mail..."
        message: "### This one has MARKDOWN\\n\\nSending another email from **application manager**\\n\\nAnd **attachments!!**"
        attachments: ["l5_S8ACicikGPYbePjzoi"]
      }
    }
   # {
   # Add more Actions
   # }   
    `
