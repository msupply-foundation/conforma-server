/*
Basic permissionNames, and associate with policies 
*/
exports.queries = [
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
            connectByName: { name: "applyOrgRestricted" }
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
]
