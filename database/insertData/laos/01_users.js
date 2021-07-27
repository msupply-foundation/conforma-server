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
            email: "applicant@sussol.net"
            passwordHash: "$2a$10$dSDSYzTuuwJvEDp/tRsKXOV7LQc9Ue0gR8bctN4V7TcMRIfcCKhme"
            username: "applicant"
            firstName: "Basic"
            lastName: "Applicant"
            permissionJoinsUsingId: {
              create: [
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyOrgRego" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyUserEdit" }
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
  `mutation {
      createUser(
        input: {
          user: {
            email: "reviewer1@sussol.net"
            passwordHash: "$2a$10$r8XTfUWIzrSaDfn0rxbIlei0kFHitJMI4W3g59w/94/9VopxNB4w."
            username: "orgRegoReviewer1"
            firstName: "OrgRegoReviewer"
            lastName: "1"
            permissionJoinsUsingId: {
              create: [
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "reviewOrgRego" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyUserEdit" }
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
  `mutation {
      createUser(
        input: {
          user: {
            email: "reviewer2@sussol.net"
            passwordHash: "$2a$10$pzhH6GcC7rw38AencBcbCuDaN6ANGZnVnE3ViCa5veOeTelbkkkv2"
            username: "orgRegoReviewer2"
            firstName: "OrgRegoReviewer2"
            lastName: "2"
            permissionJoinsUsingId: {
              create: [
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "reviewOrgRego" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyUserEdit" }
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
  `mutation {
      createUser(
        input: {
          user: {
            email: "allreviewer1@sussol.net"
            passwordHash: "$2a$10$pzhH6GcC7rw38AencBcbCuDaN6ANGZnVnE3ViCa5veOeTelbkkkv2"
            username: "allReviewer"
            firstName: "All"
            lastName: "Reviewer"
            permissionJoinsUsingId: {
              create: [
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "reviewOrgRego" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "reviewOrgLicence" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyUserEdit" }
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
  `mutation {
      createUser(
        input: {
          user: {
            email: "reviewOrgLicence1@sussol.net"
            passwordHash: "$2a$10$pzhH6GcC7rw38AencBcbCuDaN6ANGZnVnE3ViCa5veOeTelbkkkv2"
            username: "reviewOrgLicence1"
            firstName: "Company Licence"
            lastName: "Reviewer1"
            permissionJoinsUsingId: {
              create: [
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "reviewOrgLicence" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyUserEdit" }
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
  `mutation {
      createUser(
        input: {
          user: {
            email: "reviewOrgLicence2"
            passwordHash: "$2a$10$Kk4m2yhfFC5GqX2mJsXTtO.GLq6zNbezYnI8ix09h/MfNNy6AW7Ne"
            username: "reviewOrgLicence2"
            firstName: "Company Licence"
            lastName: "Reviewer2"
            permissionJoinsUsingId: {
              create: [
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "reviewOrgLicence" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyUserEdit" }
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
  `mutation {
      createUser(
        input: {
          user: {
            email: "assigner@sussol.net"
            passwordHash: "$2a$10$DA4a1E2i3dfN5BrdmO6iX.EYt.ob0czyF1sQqNQxPMPrfEPsRCx2a"
            username: "assigner"
            firstName: "Company Licence"
            lastName: "Assigner"
            permissionJoinsUsingId: {
              create: [
                # Assign General
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "assignGeneral" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyUserEdit" }
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
  // Extra user with multiple permissions (apply org rego, review org rego and apply user rego) -- password is "123456"
  `mutation {
      createUser(
        input: {
          user: {
            email: "admin@sussol.net"
            username: "admin"
            firstName: "Admin"
            lastName: "Admin"
            passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
            permissionJoinsUsingId: {
              create: [
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyOrgRego" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyOrgLicense" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "reviewOrgRego" }
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
  `mutation {
      createUser(
        input: {
          user: {
            email: "screenproceedure@sussol.net"
            username: "screenproceedure"
            firstName: "Screen"
            lastName: "Proceedure"
            passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
            permissionJoinsUsingId: {
              create: [
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "reviewOrgLicence" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "assignGeneral" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyUserEdit" }
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
