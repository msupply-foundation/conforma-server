/*
Basic permissionNames, and associate with policies 
*/
exports.queries = [
  // admin user
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "admin"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "admin" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyUserRegistration
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyUserRegistration"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "applyNonRegistered" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyOrgRego
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyOrgRego"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "applyUserRestricted" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyOrgLicense
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyOrgLicense"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "applyUserRestricted" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyOrgLicense
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyRenewLicense"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "applyUserRestricted" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyImportPermit
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyImportPermit"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "applyUserRestricted" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyDrugRegoMMC
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyDrugRegoMMC"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "applyUserRestricted" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyDrugRegoMMD
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyDrugRegoMMD"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "applyUserRestricted" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyUserEdit
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyUserEdit"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "applyUserRestricted" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyReviewTest
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyReviewTest"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "applyUserRestricted" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // reviewOrgRego
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "reviewOrgRego"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // reviewReviewTest
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: { 
          name: "reviewReviewTestScreeningSection2", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: { 
          name: "reviewReviewTestAssessmentLvl1Section1", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: { 
          name: "reviewReviewTestAssessmentLvl1Section2", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: { 
          name: "reviewReviewTestAssessmentLvl2", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: { 
          name: "reviewReviewTestApproval", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewAdvanced" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // reviewJoinOrg
  `mutation reviewJoinOrgPermission {
    createPermissionName(
      input: {
        permissionName: { 
          name: "reviewJoinOrg", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewOrgRestricted" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // assignGeneral (associated with multiple templates)
  `mutation assignGeneralPermission {
    createPermissionName(
      input: {
        permissionName: { 
          name: "assignGeneral", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "assignBasic" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // reviewGeneral (associated with multiple templates)
  `mutation reviewGeneralPermission {
    createPermissionName(
      input: {
        permissionName: { 
          name: "reviewGeneral", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyGeneral (associated with multiple templates)
  `mutation applyGeneralPermission {
    createPermissionName(
      input: {
        permissionName: { 
          name: "applyGeneral",  permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "applyUserRestricted" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // Drug Registration permissions
  `mutation assignDrugRegoPermission {
    createPermissionName(
      input: {
        permissionName: { 
          name: "canAssignDrugRego",  permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "assignBasic" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation reviewScreenDrugRegoPermission {
    createPermissionName(
      input: {
        permissionName: { 
          name: "canScreenDrugRego",  permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation reviewAssessDrugRegoPermission {
    createPermissionName(
      input: {
        permissionName: { 
          name: "canAssessDrugRego",  permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // General Review no section restrictions and allowed self-assignment
  `mutation reviewSelfAssignable {
    createPermissionName(
      input: {
        permissionName: { 
          name: "reviewSelfAssignable",  permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation reviewOrgLicence {
      createPermissionName(
        input: {
          permissionName: { 
            name: "reviewOrgLicence",  permissionPolicyToPermissionPolicyId: {
              connectByName: { name: "reviewBasic" }
            }
          }
        }
      ) {
        permissionName {
          name
        }
      }
    }`,
]
