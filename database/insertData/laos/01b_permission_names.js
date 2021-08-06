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
]