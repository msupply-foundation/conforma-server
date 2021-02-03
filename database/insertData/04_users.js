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
        user: { email: "andrei@sussol.net"
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
        user: { email: "valerio@nra.org"
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
        user: { email: "js@nowhere.com"
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
        user: { email: "reviewer1@sussol.net"
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
        user: { email: "reviewer2@sussol.net"
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
        user: { email: "consolidator@sussol.net"
          passwordHash: "$2a$10$pzhH6GcC7rw38AencBcbCuDaN6ANGZnVnE3ViCa5veOeTelbkkkv2"
          username: "testConsolidator",
          firstName: "Consolidator", lastName: "TestReview" }
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
        user: { email: "assigner@sussol.net"
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
  // Non Registered User with Permissions for UserRegistration only
  // Password is blank
  `mutation {
    createUser(
      input: {
        user: {
          email: ""
          passwordHash: "$2a$10$UIfa3GTUbOS92Ygy/UpqheTngGo3O54Q5UOnJ5CBlra9LYCcr4IGq"
          username: "nonRegistered"
          permissionJoinsUsingId: { create: { permissionNameId: 1000 } }
        }
      }
    ) {
      user {
        username
      }
    }
  }`,
  // Registered User Permissions
`mutation joinUsersToPermissionName {
    updatePermissionName(
      input: {
        patch: {
          permissionJoinsUsingId: {
            create: [{ userId: 1 }, { userId: 2 }, { userId: 3 }, { userId: 4 }]
          }
        }
        id: 2000
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation joinUsersToPermissionName {
    updatePermissionName(
      input: {
        patch: {
          permissionJoinsUsingId: {
            create: [{ userId: 1 }, { userId: 2 }]
          }
        }
        id: 3000
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation joinUsersToPermissionName {
    updatePermissionName(
      input: {
        patch: {
          permissionJoinsUsingId: {
            create: [{ userId: 6 }, { userId: 7 }]
          }
        }
        id: 4000
      }
    ) {
      permissionName {
        name
      }
    }
  }`
  // Extra user with multiple permissions (apply company rego, review company rego and apply user rego) -- password is "123456"
  `mutation MyMutation {
    createUser(
      input: {
        user: {
          username: "userWithMultiplePermissions"
          passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
          permissionJoinsUsingId: {
            create: [
              { permissionNameId: 1000 }
              { permissionNameId: 2000 }
              { permissionNameId: 4000 }
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
