/*
GraphQL Fragment - DEVELOPMENT Actions
  - Use this to test arbitrary Actions -- but only use the trigger "DEV_TEST"
\*/
exports.devActions = `
    # Create a document then email it
    {
      actionCode: "generateDoc"
      trigger: DEV_TEST
      sequence: 1
      parameterQueries: {
        docTemplateId: "9eRMD5mgLGuMfntQ1I-_9"
      }
    }
    {
      actionCode: "sendNotification"
      trigger: DEV_TEST
      sequence: 3
      parameterQueries: {
        fromName: "Application Manager"
        fromEmail: "no-reply@sussol.net"
        email: {
          operator: "objectProperties"
          children: ["applicationData.responses.Q4Email.text", ""]
        }
        subject: "User Registration - verify account"
        message: {
          operator: "stringSubstitution"
          children: [
            "Hi, %1,\\n\\nplease confirm your user account registration by clicking (or copy-pasting) the following link:\\n\\n%2%3"
            {
              operator: "objectProperties"
              children: ["applicationData.responses.Q1FirstName.text", ""]
            }
            "http://localhost:3000/verify?uid=" #TO-DO: add website URL to back-end config
            {
              operator: "objectProperties"
              children: ["outputCumulative.verification.unique_id"]
            }
          ]
        }
      }
    }
    {
      actionCode: "sendNotification"
      trigger: DEV_TEST
      sequence: 2
      parameterQueries: {
        subject: "Report attached"
        message: {
          operator: "stringSubstitution"
          children: [
            "Here is your report: http://localhost:3000/file?id=%1"
            {
              operator: "objectProperties"
              children: ["outputCumulative.document.uniqueId"]
            }
          ]
       }
      }
    }
   # {
   # Add more Actions
   # }   
    `
