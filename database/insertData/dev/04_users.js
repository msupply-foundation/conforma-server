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
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewSelfAssignable" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyOrgRego" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewJoinOrg" }
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
          email: "carl@sussol.net"
          passwordHash: "$2a$10$3Z1cXVI.GzE9F2QYePzbMOg5CGtf6VnNKRiaiRGkzlBXJ0aiMN4JG"
          username: "carl"
          firstName: "Carl"
          lastName: "Smith"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewSelfAssignable" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyOrgRego" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewJoinOrg" }
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
          email: "valerio@nra.org"
          passwordHash: "$2a$10$ne2WcPISMw/Do3JzlwThYeO2GcodrumjI3FwGu1ZUoKgRQyAgNS3e"
          username: "valerio"
          firstName: "Valerio"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewSelfAssignable" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyOrgRego" }
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
          email: "andrei@sussol.net"
          passwordHash: "$2a$10$3Ufr.//hLoxp6BEEbFIq4u.zh435BNxNNLFEmJN74Ka/U5SMp0A2e"
          username: "andrei"
          firstName: "Andrei"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewSelfAssignable" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyOrgRego" }
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
          email: "js@nowhere.com"
          passwordHash: "$2a$10$WQ5VMHB6bOVwjyE8Vhh64.TLQKcUOeJpfU6ZUSqYq3tlts3vCN2mG"
          username: "js"
          firstName: "John"
          lastName: "Smith"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyOrgRego" }
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
          username: "testReviewer1"
          firstName: "Reviewer1"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewSelfAssignable" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewReviewTestAssessmentLvl1Section1" }
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
          username: "testReviewer2"
          firstName: "Reviewer2"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewSelfAssignable" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewReviewTestAssessmentLvl1Section2" }
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
          email: "consolidator1@sussol.net"
          passwordHash: "$2a$10$pzhH6GcC7rw38AencBcbCuDaN6ANGZnVnE3ViCa5veOeTelbkkkv2"
          username: "testConsolidator1"
          firstName: "Consolidator1"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewSelfAssignable" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewReviewTestAssessmentLvl2" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewReviewTestApproval" }
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
          email: "consolidator2@sussol.net"
          passwordHash: "$2a$10$pzhH6GcC7rw38AencBcbCuDaN6ANGZnVnE3ViCa5veOeTelbkkkv2"
          username: "testConsolidator2"
          firstName: "Consolidator2"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewReviewTestAssessmentLvl2" }
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
          email: "assigner1@sussol.net"
          passwordHash: "$2a$10$Kk4m2yhfFC5GqX2mJsXTtO.GLq6zNbezYnI8ix09h/MfNNy6AW7Ne"
          username: "testAssigner1"
          firstName: "Assigner1"
          permissionJoinsUsingId: {
            create: [
              # Assign General
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "assignGeneral" }
                }
              }
              # Assign DrugRegoGen
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "canAssignDrugRego" }
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
          email: "assigner2@sussol.net"
          passwordHash: "$2a$10$DA4a1E2i3dfN5BrdmO6iX.EYt.ob0czyF1sQqNQxPMPrfEPsRCx2a"
          username: "testAssigner2"
          firstName: "Assigner2"
          permissionJoinsUsingId: {
            create: [
              # Assign General
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "assignGeneral" }
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
          username: "screener1"
          firstName: "Screener1"
          passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
          permissionJoinsUsingId: {
            create: [
              # Review General
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewGeneral" }
                }
              }
              # Review DrugRego Screening (Stage 1)
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "canScreenDrugRego" }
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
          username: "screener2"
          firstName: "Screener2"
          passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
          permissionJoinsUsingId: {
            create: [
              # Review General
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewGeneral" }
                }
              }
              # Review DrugRego Screening (Stage 1)
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "canScreenDrugRego" }
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
          username: "assessor1"
          firstName: "assessor1"
          passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
          permissionJoinsUsingId: {
            create: [
              # Review General
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewGeneral" }
                }
              }
              # Review DrugRego Assessment (Stage 2)
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "canAssessDrugRego" }
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
          username: "assessor2"
          firstName: "assessor2"
          passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
          permissionJoinsUsingId: {
            create: [
              # Review General
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewGeneral" }
                }
              }
              # Review DrugRego Assessment (Stage 2)
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "canAssessDrugRego" }
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
  //
  // Extra user with multiple permissions (apply org rego, review org rego and apply user rego) -- password is "123456"
  `mutation {
    createUser(
      input: {
        user: {
          username: "userWithMultiplePermissions"
          firstName: "Admin"
          passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyUserRegistration" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyOrgRego" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewOrgRego" }
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
