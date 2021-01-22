/*
Insert USERS (and some basic permission)
  -- All passwords are "123456"
  -- Hashes generated with https://www.browserling.com/tools/bcrypt 
*/
exports.queries = [
  `mutation {
    createUser(
      input: {
        user: {
          id: 1
          email: "nicole@sussol.net"
          passwordHash: "$2a$10$dSDSYzTuuwJvEDp/tRsKXOV7LQc9Ue0gR8bctN4V7TcMRIfcCKhme"
          username: "nmadruga"
          firstName: "Nicole"
        }
      }
    ) {
      user {
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: {
          id: 2
          email: "carl@sussol.net"
          passwordHash: "$2a$10$3Z1cXVI.GzE9F2QYePzbMOg5CGtf6VnNKRiaiRGkzlBXJ0aiMN4JG"
          username: "carl"
          firstName: "Carl", lastName: "Smith"
        }
      }
    ) {
      user {
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: { 
          id: 3
          email: "andrei@sussol.net"
          passwordHash: "$2a$10$3Ufr.//hLoxp6BEEbFIq4u.zh435BNxNNLFEmJN74Ka/U5SMp0A2e"
          username: "andrei",
          firstName: "Andrei" }
      }
    ) {
      user {
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: {
          id: 4
          email: "valerio@nra.org"
          passwordHash: "$2a$10$ne2WcPISMw/Do3JzlwThYeO2GcodrumjI3FwGu1ZUoKgRQyAgNS3e"
          username: "valerio",
          firstName: "Valerio" }
      }
    ) {
      user {
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: {
          id: 5
          email: "js@nowhere.com"
          passwordHash: "$2a$10$WQ5VMHB6bOVwjyE8Vhh64.TLQKcUOeJpfU6ZUSqYq3tlts3vCN2mG"
          username: "js",
          firstName: "John", lastName: "Smith"
       }
      }
    ) {
      user {
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: {
          id: 6
          email: "reviewer1@sussol.net"
          passwordHash: "$2a$10$r8XTfUWIzrSaDfn0rxbIlei0kFHitJMI4W3g59w/94/9VopxNB4w."
          username: "testReviewer1",
          firstName: "Mr", lastName: "Reviewer 1" }
      }
    ) {
      user {
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: {
          id: 7
          email: "reviewer2@sussol.net"
          passwordHash: "$2a$10$pzhH6GcC7rw38AencBcbCuDaN6ANGZnVnE3ViCa5veOeTelbkkkv2"
          username: "testReviewer2",
          firstName: "Mrs", lastName: "Reviewer 2" }
      }
    ) {
      user {
        username
      }
    }
  }`,
  `mutation {
    createUser(
      input: {
        user: {
          id: 8
          email: "assigner@sussol.net"
          passwordHash: "$2a$10$Kk4m2yhfFC5GqX2mJsXTtO.GLq6zNbezYnI8ix09h/MfNNy6AW7Ne"
          username: "testAssigner",
          firstName: "Ms", lastName: "Assigner" }
      }
    ) {
      user {
        username
      }
    }
  }`,
  //
  // Non Registered User with Permissions
  // Password is blank
  `mutation {
    createUser(
      input: {
        user: {
          id: 9
          email: ""
          passwordHash: "$2a$10$UIfa3GTUbOS92Ygy/UpqheTngGo3O54Q5UOnJ5CBlra9LYCcr4IGq"
          username: "nonRegistered"
          permissionJoinsUsingId: {
            create: [
              {
                id: 300
                permissionNameToPermissionNameId: {
                  create: {
                    id: 300
                    name: "applyUserRegistration"
                    templatePermissionsUsingId: { create: [{id: 300, templateId: 300 }] }
                    permissionPolicyToPermissionPolicyId: {
                      create: { id: 300, type: APPLY, name: "oneTimeApply", rules: {
                        application: {
                          view: {
                            template_id: "jwtPermission_bigint_templateId"
                          }
                        }
                      } }
                    }
                  }
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
  // Registered User Permissions
  `mutation {
    createPermissionPolicy(
      input: {
        permissionPolicy: {
          id: 200
          name: "basicApply"
          permissionNamesUsingId: {
            create: {
              id: 200
              name: "applyCompanyRego"
              templatePermissionsUsingId: { create: {id: 200, templateId: 200 } }
              permissionJoinsUsingId: {
                create: [
                  { id: 10, userId: 1 }
                  { id: 11, userId: 2 }
                  { id: 12, userId: 3 }
                  { id: 13, userId: 4 }
                ]
              }
            }
          }
          type: APPLY
          rules: {
            application: {
              view: {
                template_id: "jwtPermission_bigint_templateId"
                user_id: "jwtUserDetails_bigint_userId"
              }
            }
          }
        }
      }
    ) {
      permissionPolicy {
        name
        type
      }
    }
  }`,
  // Extra user with multiple permissions (apply company rego, review company rego and apply user rego) -- password is "123456"
  `mutation MyMutation {
    createUser(
      input: {
        user: {
          id: 10
          username: "userWithMultiplePermissions"
          passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
          permissionJoinsUsingId: {
            create: [
              { id: 400, permissionNameId: 1 }
              { id: 401, permissionNameId: 2 }
              {
                permissionNameToPermissionNameId: {
                  create: {
                    name: "reviewCompanyRego"
                    templatePermissionsUsingId: {
                      create: [{ templateId: 2, restrictions: { stage: 1 } }]
                    }
                    permissionPolicyToPermissionPolicyId: {
                      create: {
                        type: REVIEW
                        name: "basicReview"
                        rules: {
                          application: {
                            view: {
                              template_id: "jwtPermission_bigint_templateId"
                            }
                          }
                        }
                      }
                    }
                  }
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
