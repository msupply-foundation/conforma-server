/*
Insert USERS (and some basic permission)
  -- All passwords are "123456"
  -- Hashes generated with https://www.browserling.com/tools/bcrypt 
*/
exports.queries = [
  // Extra user with multiple permissions (apply org rego, review org rego and apply user rego) -- password is "123456"
  `mutation {
    createUser(
      input: {
        user: {
          username: "admin"
          firstName: "Admin"
          lastName: "Admin"
          passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "assignGeneral" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewOrgRego" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewScreening" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewAssessmentSection1Level1" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewAssessmentSection2Level1" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewAssessmentLevel2" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewFinalDecision" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "admin" }
                }
              }
            ]
          }
        }
      }
    ) {
      user {
        username
      }
    }
  }`,
]
