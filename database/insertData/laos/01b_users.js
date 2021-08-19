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
                    connectByName: { name: "applyGeneral" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyUserEdit" }
                  }
                }
                {
                  permissionNameToPermissionNameId: {
                    connectByName: { name: "applyProceedureVerification" }
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
                    connectByName: { name: "reviewGeneral" }
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
                    connectByName: { name: "reviewGeneral" }
                  }
                }
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
                    connectByName: { name: "reviewGeneral" }
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
                      connectByName: { name: "screenProceedure" }
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
              email: "assesspayment@sussol.net"
              username: "assesspayment"
              firstName: "Assess"
              lastName: "Payment"
              passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
              permissionJoinsUsingId: {
                create: [
                  {
                    permissionNameToPermissionNameId: {
                      connectByName: { name: "assessPayment" }
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
              email: "consolidateproceedure@sussol.net"
              username: "consolidateproceedure"
              firstName: "Consolidate"
              lastName: "Proceedure"
              passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
              permissionJoinsUsingId: {
                create: [
                  {
                    permissionNameToPermissionNameId: {
                      connectByName: { name: "consolidateProceedure" }
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
              email: "reviewproceedure1@sussol.net"
              username: "reviewproceedure1"
              firstName: "Review Proceedure"
              lastName: "1"
              passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
              permissionJoinsUsingId: {
                create: [
                  {
                    permissionNameToPermissionNameId: {
                      connectByName: { name: "reviewProceedure" }
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
              email: "reviewproceedure2@sussol.net"
              username: "reviewproceedure2"
              firstName: "Review Proceedure"
              lastName: "2"
              passwordHash: "$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW."
              permissionJoinsUsingId: {
                create: [
                  {
                    permissionNameToPermissionNameId: {
                      connectByName: { name: "reviewProceedure" }
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
