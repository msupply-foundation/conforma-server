/*
Insert ORGANISATIONS 
  - and associate users with them
*/
exports.queries = [
  `mutation {
        createOrganisation(
          input: {
            organisation: {
              address: "Lao"
              registration: "1"
              name: "Food and Drug Department"
              userOrganisationsUsingId: {
                create: [
                  {
                    userRole: "Owner"
                    userToUserId: { connectByUsername: { username: "admin" } }
                  }
                  {
                    userRole: "worker"
                    userToUserId: { connectByUsername: { username: "orgRegoReviewer1" } }
                  }
                  {
                    userRole: "worker"
                    userToUserId: { connectByUsername: { username: "orgRegoReviewer2" } }
                  }
                  {
                    userRole: "worker"
                    userToUserId: { connectByUsername: { username: "allReviewer" } }
                  }
                  {
                    userRole: "worker"
                    userToUserId: { connectByUsername: { username: "assigner" } }
                  }
                ]
              }
            }
          }
        ) {
          organisation {
            name
          }
        }
      }`,
  // Associate users with organisations
  `mutation {
    createPermissionJoin(
      input: {
        permissionJoin: {
          organisationToOrganisationId: {
            connectByName: { name: "Food and Drug Department" }
          }
          permissionNameToPermissionNameId: {
            connectByName: { name: "joinUserToFDD" }
          }
          userToUserId: { connectByUsername: { username: "admin" } }
        }
      }
    ) {
      clientMutationId
    }
  }
  `,
  `mutation {
    createPermissionJoin(
      input: {
        permissionJoin: {
          organisationToOrganisationId: {
            connectByName: { name: "Food and Drug Department" }
          }
          permissionNameToPermissionNameId: {
            connectByName: { name: "admin" }
          }
          userToUserId: { connectByUsername: { username: "admin" } }
        }
      }
    ) {
      clientMutationId
    }
  }
  `,
  `mutation {
    createPermissionJoin(
      input: {
        permissionJoin: {
          organisationToOrganisationId: {
            connectByName: { name: "Food and Drug Department" }
          }
          permissionNameToPermissionNameId: {
            connectByName: { name: "grantUserFDDpermissions" }
          }
          userToUserId: { connectByUsername: { username: "admin" } }
        }
      }
    ) {
      clientMutationId
    }
  }`,
  `mutation {
    createPermissionJoin(
      input: {
        permissionJoin: {
          organisationToOrganisationId: {
            connectByName: { name: "Food and Drug Department" }
          }
          permissionNameToPermissionNameId: {
            connectByName: { name: "reviewJoinOrg" }
          }
          userToUserId: { connectByUsername: { username: "admin" } }
        }
      }
    ) {
      clientMutationId
    }
  }`,
  `mutation {
    createPermissionJoin(
      input: {
        permissionJoin: {
          organisationToOrganisationId: {
            connectByName: { name: "Food and Drug Department" }
          }
          permissionNameToPermissionNameId: {
            connectByName: { name: "reviewOrgRego" }
          }
          userToUserId: { connectByUsername: { username: "orgRegoReviewer1" } }
        }
      }
    ) {
      clientMutationId
    }
  }
  `,
  `mutation {
    createPermissionJoin(
      input: {
        permissionJoin: {
          organisationToOrganisationId: {
            connectByName: { name: "Food and Drug Department" }
          }
          permissionNameToPermissionNameId: {
            connectByName: { name: "applyForOrganisationPermissions" }
          }
          userToUserId: { connectByUsername: { username: "orgRegoReviewer1" } }
        }
      }
    ) {
      clientMutationId
    }
  }
  `,
  `mutation {
    createPermissionJoin(
      input: {
        permissionJoin: {
          organisationToOrganisationId: {
            connectByName: { name: "Food and Drug Department" }
          }
          permissionNameToPermissionNameId: {
            connectByName: { name: "applyForOrganisationPermissions" }
          }
          userToUserId: { connectByUsername: { username: "orgRegoReviewer2" } }
        }
      }
    ) {
      clientMutationId
    }
  }
  `,
  `mutation {
    createPermissionJoin(
      input: {
        permissionJoin: {
          organisationToOrganisationId: {
            connectByName: { name: "Food and Drug Department" }
          }
          permissionNameToPermissionNameId: {
            connectByName: { name: "reviewOrgRego" }
          }
          userToUserId: { connectByUsername: { username: "allReviewer" } }
        }
      }
    ) {
      clientMutationId
    }
  }
  `,
  `mutation {
    createPermissionJoin(
      input: {
        permissionJoin: {
          organisationToOrganisationId: {
            connectByName: { name: "Food and Drug Department" }
          }
          permissionNameToPermissionNameId: {
            connectByName: { name: "applyForOrganisationPermissions" }
          }
          userToUserId: { connectByUsername: { username: "allReviewer" } }
        }
      }
    ) {
      clientMutationId
    }
  }
  `,
  `mutation {
    createPermissionJoin(
      input: {
        permissionJoin: {
          organisationToOrganisationId: {
            connectByName: { name: "Food and Drug Department" }
          }
          permissionNameToPermissionNameId: {
            connectByName: { name: "assignGeneral" }
          }
          userToUserId: { connectByUsername: { username: "assigner" } }
        }
      }
    ) {
      clientMutationId
    }
  }
  `,
  `mutation {
    createPermissionJoin(
      input: {
        permissionJoin: {
          organisationToOrganisationId: {
            connectByName: { name: "Food and Drug Department" }
          }
          permissionNameToPermissionNameId: {
            connectByName: { name: "applyForOrganisationPermissions" }
          }
          userToUserId: { connectByUsername: { username: "assigner" } }
        }
      }
    ) {
      clientMutationId
    }
  }
  `,
]
