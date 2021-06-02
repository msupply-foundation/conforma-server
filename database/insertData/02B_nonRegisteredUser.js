/*
Non Registered User with Permissions for UserRegistration only
  - Password is blank
  - Add nonRegisterd first, so it always gets ID 1
*/
exports.queries = [
  `mutation {
    createUser(
      input: {
        user: {
          email: ""
          passwordHash: "$2a$10$UIfa3GTUbOS92Ygy/UpqheTngGo3O54Q5UOnJ5CBlra9LYCcr4IGq"
          username: "nonRegistered"
          permissionJoinsUsingId: {
            create: {
              # Apply UserRego
              permissionNameToPermissionNameId: {
                connectByName: { name: "applyUserRegistration" }
              }
            }
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
