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
            connectByName: { name: "oneTimeApply" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyCompanyRego
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyCompanyRego"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "basicApply" }
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
            connectByName: { name: "basicApply" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // reviewCompanyRego
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "reviewCompanyRego"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "basicReview" }
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
          name: "reviewReviewTestScreeningSection1", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "basicReview" }
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
            connectByName: { name: "basicReview" }
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
          name: "reviewReviewTestAssessmentLvl1", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "basicReview" }
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
            connectByName: { name: "basicReview" }
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
            connectByName: { name: "basicReview" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // reviewJoinCompany
  `mutation reviewJoinCompanyPermission {
    createPermissionName(
      input: {
        permissionName: { 
          name: "reviewJoinCompany", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "basicReview" }
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
            connectByName: { name: "basicAssign" }
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
            connectByName: { name: "basicReview" }
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
            connectByName: { name: "basicApply" }
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
            connectByName: { name: "basicAssign" }
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
            connectByName: { name: "basicReview" }
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
            connectByName: { name: "basicReview" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation reviewSelfAssignable {
    createPermissionName(
      input: {
        permissionName: { 
          name: "reviewSelfAssignable",  permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "basicReview" }
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
