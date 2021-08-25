/*
Laos specific permissionNames, and associate with policies 
*/
exports.queries = [
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
  
  // applyDrugRegoMMD
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
  // applyRenewLicense
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
  // applyForOrganisationPermissions
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyForOrganisationPermissions"
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
  // applyJoinOrg
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyJoinOrg"
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
  // Apply to proceedure verification (ReviewTest)
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyProceedureVerification"
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
  // All review permissions bellow
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "joinUserToFDD"
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
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "grantUserFDDpermissions"
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
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "screenProceedure"
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
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "reviewProceedure"
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
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "consolidateProceedure"
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
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "assessPayment"
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
]