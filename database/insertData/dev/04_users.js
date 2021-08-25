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
          lastName: "M"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
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
          lastName: "R"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
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
          lastName: "E"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
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
          firstName: "Reviewer"
          lastName: "1"
          permissionJoinsUsingId: {
            create: [
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
          firstName: "Reviewer"
          lastName: "2"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewScreening" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewAssessmentSection2Level1" }
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
          firstName: "Consolidator"
          lastName: "1"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewScreening" }
                }
              }
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewAssessmentLevel2" }
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
          firstName: "Consolidator"
          lastName: "2"
          permissionJoinsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewAssessmentLevel2" }
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
          firstName: "Assigner"
          lastName: "1"
          permissionJoinsUsingId: {
            create: [
              # Assign General
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "assignGeneral" }
                }
              }
              # Apply UserEdit
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
          email: "assigner2@sussol.net"
          passwordHash: "$2a$10$DA4a1E2i3dfN5BrdmO6iX.EYt.ob0czyF1sQqNQxPMPrfEPsRCx2a"
          username: "testAssigner2"
          firstName: "Assigner"
          lastName: "2"
          permissionJoinsUsingId: {
            create: [
              # Assign General
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "assignGeneral" }
                }
              }
              # Apply UserEdit
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
          username: "screener1"
          firstName: "Screener"
          lastName: "1"
          passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
          permissionJoinsUsingId: {
            create: [
              # Review General Screening (Stage 1)
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewScreening" }
                }
              }
              # Apply UserEdit
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
          username: "screener2"
          firstName: "Screener"
          lastName: "2"
          passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
          permissionJoinsUsingId: {
            create: [
              # Review General Screening (Stage 1)
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewScreening" }
                }
              }
              # Apply UserEdit
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
          username: "assessor1"
          firstName: "assessor"
          lastName: "1"
          passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
          permissionJoinsUsingId: {
            create: [
              # Review General Assessment (Stage 2) - sectin 1
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewAssessmentSection1Level1" }
                }
              }
              # Review General Assessment (Stage 2) - section 2
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewAssessmentSection2Level1" }
                }
              }
              # Apply UserEdit
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
          username: "assessor2"
          firstName: "assessor"
          lastName: "2"
          passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
          permissionJoinsUsingId: {
            create: [
              # Review General Assessment (Stage 2) - sectin 1
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewAssessmentSection1Level1" }
                }
              }
              # Review General Assessment (Stage 2) - section 2
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewAssessmentSection2Level1" }
                }
              }
              # Apply UserEdit
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
  // Final decision users
  `mutation {
    createUser(
      input: {
        user: {
          username: "finalDecision1"
          firstName: "Final"
          lastName: "Decision Maker 1"
          passwordHash: "$2a$10$5SZSiEj2RqgZzKu4.aCeFOicNo8f9cgXfCqK0k5ioNgGwTJvC42jG"
          permissionJoinsUsingId: {
            create: [
              # Review General - Final decision
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewFinalDecision" }
                }
              }
              # Apply UserEdit
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
          username: "finalDecision2"
          firstName: "Final"
          lastName: "Decision Maker 2"
          passwordHash: "$2a$10$DHIKam/EQItFhIBA5I4wduldlnc4n/0w42RJ9.SBA5htb4cZ/iEvi"
          permissionJoinsUsingId: {
            create: [
              # Review General - Final decision
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "reviewFinalDecision" }
                }
              }
              # Apply UserEdit
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
  //
  // Extra user with multiple permissions (apply org rego, review org rego and apply user rego) -- password is "123456"
  `mutation {
    createUser(
      input: {
        user: {
          username: "userWithMultiplePermissions"
          firstName: "Admin"
          lastName: "Admin"
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
                  connectByName: { name: "reviewGeneral" }
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
